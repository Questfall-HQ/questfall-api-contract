import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONTRACT_FILE = path.join(ROOT, 'contract.json')
const SCHEMAS_FILE = path.join(ROOT, 'schemas.json')
const METHODS = { get: 'GET', post: 'POST' }
const ACCESS = new Set(['public', 'optional', 'authenticated', 'verified'])
const TRANSPORTS = new Set(['none', 'query', 'body', 'multipart'])

const routeKey = route => `${route.method.toUpperCase()} ${route.path}`

function unique(items, keyOf) {
  const seen = new Set()
  return items.filter(item => {
    const key = keyOf(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function stringList(value) {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function normalizePath(value) {
  return value.replace(/\{encodeURIComponent\(([^)]+)\)\}/g, '{$1}')
}

function frontendPaths(source) {
  const paths = new Map()
  const stack = []
  let active = false

  for (const line of source.split('\n')) {
    if (line.trim() === 'const paths =') {
      active = true
      continue
    }
    if (!active) continue
    if (line && !line.startsWith('\t')) break

    const match = /^(\t+)([A-Za-z_][\w]*):(?:\s*(['"])(\/[^'"]+)\3)?\s*$/.exec(line)
    if (!match) continue
    const depth = match[1].length
    const name = match[2]
    stack.length = depth - 1

    if (match[4]) {
      const reference = `paths.${stack.concat(name).join('.')}`
      paths.set(reference, match[4])
    } else {
      stack.push(name)
    }
  }

  return paths
}

export function loadContract(file = CONTRACT_FILE) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function loadSchemas(file = SCHEMAS_FILE) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function validateContract(contract, schemas) {
  const failures = []
  const operations = new Set()
  const routes = new Set()
  const definitions = schemas?.$defs

  if (!contract || typeof contract !== 'object') return ['contract must be an object']
  if (!/^\d+\.\d+\.\d+$/.test(contract.version || '')) failures.push('contract.version must be semver')
  if (!Array.isArray(contract.routes)) failures.push('contract.routes must be an array')
  if (!definitions || typeof definitions !== 'object' || Array.isArray(definitions)) {
    failures.push('schemas.$defs must be an object')
  }

  for (const route of contract.routes || []) {
    if (!route.operation || !route.method || !route.path) {
      failures.push('every route requires operation, method and path')
      continue
    }
    if (operations.has(route.operation)) failures.push(`duplicate operation ${route.operation}`)
    operations.add(route.operation)

    const key = routeKey(route)
    if (routes.has(key)) failures.push(`duplicate route ${key}`)
    routes.add(key)

    if (!['GET', 'POST'].includes(route.method)) failures.push(`unsupported method ${route.method} for ${route.operation}`)
    if (!ACCESS.has(route.access)) failures.push(`invalid access ${route.access} for ${route.operation}`)

    const request = route.request
    if (!request || !TRANSPORTS.has(request.transport)) {
      failures.push(`invalid request transport for ${route.operation}`)
    } else {
      for (const field of ['params', 'required', 'optional']) {
        if (!stringList(request[field] || [])) failures.push(`${route.operation} request.${field} must be a string array`)
      }
      const all = [...(request.params || []), ...(request.required || []), ...(request.optional || [])]
      if (new Set(all).size !== all.length) failures.push(`duplicate request field in ${route.operation}`)
      const pathParams = [...route.path.matchAll(/\{([^}]+)\}/g)].map(match => match[1]).sort()
      const declaredParams = [...(request.params || [])].sort()
      if (JSON.stringify(pathParams) !== JSON.stringify(declaredParams)) {
        failures.push(`path params for ${route.operation} must match request.params`)
      }
    }

    const responseSchema = route.response?.schema
    if (!responseSchema || !definitions?.[responseSchema]) {
      failures.push(`unknown response schema ${responseSchema || '<missing>'} for ${route.operation}`)
    }
  }

  const collections = contract.pocketbase?.collections
  if (!collections || typeof collections !== 'object' || Array.isArray(collections)) {
    failures.push('contract.pocketbase.collections must be an object')
  }

  return failures
}

export function extractFrontendSurface(source) {
  const errors = []
  const routes = []
  const paths = frontendPaths(source)
  const usedPaths = new Set()
  let routeMentions = 0

  for (const line of source.split('\n')) {
    const call = /\b(get|post)\s*\(\s*/.exec(line)
    if (!call) continue
    routeMentions += 1

    const method = METHODS[call[1]]
    const target = line.slice(call.index + call[0].length)
    const reference = /^(paths(?:\.[A-Za-z_][\w]*)+)/.exec(target)
    const literal = /^(['"])(\/[^'"]+)\1/.exec(target)

    if (reference) {
      const value = paths.get(reference[1])
      if (!value) {
        errors.push(`unknown frontend path reference: ${reference[1]}`)
        continue
      }
      usedPaths.add(reference[1])
      routes.push({ method, path: value })
      continue
    }

    if (literal) {
      routes.push({ method, path: normalizePath(literal[2]) })
      continue
    }

    const unresolved = target.split(/[,)\n]/)[0].trim() || '<empty>'
    errors.push(`unresolved frontend API call: ${call[1]}(${unresolved})`)
  }

  for (const reference of paths.keys()) {
    if (!usedPaths.has(reference)) errors.push(`unused frontend path declaration: ${reference}`)
  }

  const collectionMentions = [...source.matchAll(/\bpb\.collection\s*\(/g)].length
  const collections = [...source.matchAll(/\bpb\.collection\s*\(\s*(['"])([\w-]+)\1\s*\)/g)].map(match => match[2])
  if (collections.length !== collectionMentions) {
    errors.push(`collection parser drift: found ${collectionMentions} pb.collection calls but parsed ${collections.length}`)
  }

  return {
    routes: unique(routes, routeKey),
    collections: [...new Set(collections)],
    errors,
    counts: { routeMentions, pathDeclarations: paths.size, collectionMentions },
  }
}

export function extractBackendRoutes(source, file = '<source>') {
  const routes = []
  const mentions = [...source.matchAll(/\brouterAdd\s*['"]/g)].length
  const pattern = /\brouterAdd\s*(['"])([A-Za-z]+)\1\s*,\s*(['"])(\/[^'"]+)\3/g
  for (const match of source.matchAll(pattern)) {
    routes.push({ method: match[2].toUpperCase(), path: match[4], file })
  }
  return { routes, mentions }
}

function imbaFiles(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...imbaFiles(target))
    else if (entry.isFile() && entry.name.endsWith('.pb.imba')) files.push(target)
  }
  return files
}

function backendRoutes(backendSrc) {
  const routes = []
  let mentions = 0
  for (const file of imbaFiles(backendSrc)) {
    const extracted = extractBackendRoutes(fs.readFileSync(file, 'utf8'), path.relative(backendSrc, file))
    routes.push(...extracted.routes)
    mentions += extracted.mentions
  }
  return { routes, mentions }
}

export function compareApplication(frontend, contract) {
  const failures = [...frontend.errors]
  const declaredRoutes = new Set(contract.routes.map(routeKey))
  const usedRoutes = new Set(frontend.routes.map(routeKey))
  const collections = contract.pocketbase.collections

  for (const route of frontend.routes) {
    const key = routeKey(route)
    if (!declaredRoutes.has(key)) failures.push(`route ${key} is not declared in the contract`)
  }
  for (const route of contract.routes) {
    const key = routeKey(route)
    if (!usedRoutes.has(key)) failures.push(`contract route ${key} is not used by application src/api.imba`)
  }
  for (const name of frontend.collections) {
    if (!collections[name]) failures.push(`collection ${name} is not declared in the contract`)
  }

  return failures
}

export function compareBackend(contract, routes) {
  const failures = []
  const implemented = new Set(routes.map(routeKey))
  for (const route of contract.routes) {
    const key = routeKey(route)
    if (!implemented.has(key)) failures.push(`contract route ${key} is missing from backend sources`)
  }
  return failures
}

export function checkApplication(applicationDir, contract = loadContract(), schemas = loadSchemas()) {
  const apiFile = path.join(path.resolve(applicationDir), 'src', 'api.imba')
  if (!fs.existsSync(apiFile)) throw new Error(`application API module not found: ${apiFile}`)
  const frontend = extractFrontendSurface(fs.readFileSync(apiFile, 'utf8'))
  return { frontend, failures: [...validateContract(contract, schemas), ...compareApplication(frontend, contract)] }
}

export function checkBackend(backendDir, contract = loadContract(), schemas = loadSchemas()) {
  const backendSrc = path.join(path.resolve(backendDir), 'src')
  if (!fs.existsSync(backendSrc)) throw new Error(`backend src not found: ${backendSrc}`)
  const backend = backendRoutes(backendSrc)
  const failures = validateContract(contract, schemas)
  if (backend.routes.length !== backend.mentions) {
    failures.push(`backend route parser drift: found ${backend.mentions} routerAdd calls but parsed ${backend.routes.length}`)
  }
  failures.push(...compareBackend(contract, backend.routes))
  return { backend, failures }
}
