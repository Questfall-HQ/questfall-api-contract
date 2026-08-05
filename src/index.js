import contract from '../contract.json' with { type: 'json' }
import schemas from '../schemas.json' with { type: 'json' }

export { contract, schemas }

export const operations = Object.freeze(Object.fromEntries(
  contract.routes.map(route => [route.operation, Object.freeze(route)]),
))

export const collections = Object.freeze(contract.pocketbase.collections)

export function path(operation, params = {}) {
  const route = operations[operation]
  if (!route) throw new Error(`Unknown API operation: ${operation}`)

  return route.path.replace(/\{([^}]+)\}/g, (_, name) => {
    if (!(name in params)) throw new Error(`Missing path parameter "${name}" for ${operation}`)
    return encodeURIComponent(String(params[name]))
  })
}

export function schema(name) {
  const value = schemas.$defs?.[name]
  if (!value) throw new Error(`Unknown API schema: ${name}`)
  return value
}

export { assert, validate } from './validate.js'
