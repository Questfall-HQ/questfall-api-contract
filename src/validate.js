import schemas from '../schemas.json' with { type: 'json' }

function kind(value) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (Number.isInteger(value)) return 'integer'
  if (typeof value === 'number' && Number.isFinite(value)) return 'number'
  return typeof value
}

function matchesType(value, expected) {
  if (expected === 'number') return typeof value === 'number' && Number.isFinite(value)
  if (expected === 'integer') return Number.isInteger(value)
  if (expected === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value)
  if (expected === 'array') return Array.isArray(value)
  if (expected === 'null') return value === null
  return typeof value === expected
}

function resolve(reference) {
  const prefix = '#/$defs/'
  if (!reference.startsWith(prefix)) throw new Error(`Unsupported schema reference: ${reference}`)
  const name = reference.slice(prefix.length)
  const value = schemas.$defs?.[name]
  if (!value) throw new Error(`Unknown schema reference: ${reference}`)
  return value
}

function inspect(rule, value, at, failures) {
  if (rule.$ref) return inspect(resolve(rule.$ref), value, at, failures)

  if (rule.oneOf) {
    const candidates = rule.oneOf.map(candidate => {
      const nested = []
      inspect(candidate, value, at, nested)
      return nested
    })
    if (candidates.filter(candidate => candidate.length === 0).length !== 1) {
      failures.push(`${at} must match exactly one schema`)
    }
    return
  }

  if (rule.const !== undefined && value !== rule.const) {
    failures.push(`${at} must equal ${JSON.stringify(rule.const)}`)
    return
  }
  if (rule.enum && !rule.enum.some(option => Object.is(option, value))) {
    failures.push(`${at} must be one of ${rule.enum.map(JSON.stringify).join(', ')}`)
    return
  }

  if (rule.type) {
    const allowed = Array.isArray(rule.type) ? rule.type : [rule.type]
    if (!allowed.some(expected => matchesType(value, expected))) {
      failures.push(`${at} must be ${allowed.join(' or ')}, received ${kind(value)}`)
      return
    }
  }

  if (typeof value === 'string' && rule.minLength !== undefined && value.length < rule.minLength) {
    failures.push(`${at} must contain at least ${rule.minLength} characters`)
  }
  if (typeof value === 'number' && rule.minimum !== undefined && value < rule.minimum) {
    failures.push(`${at} must be at least ${rule.minimum}`)
  }
  if (typeof value === 'number' && rule.maximum !== undefined && value > rule.maximum) {
    failures.push(`${at} must be at most ${rule.maximum}`)
  }

  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const field of rule.required || []) {
      if (!(field in value)) failures.push(`${at}.${field} is required`)
    }
    for (const [field, child] of Object.entries(rule.properties || {})) {
      if (field in value) inspect(child, value[field], `${at}.${field}`, failures)
    }
    if (rule.additionalProperties === false) {
      for (const field of Object.keys(value)) {
        if (!(field in (rule.properties || {}))) failures.push(`${at}.${field} is not allowed`)
      }
    }
  }

  if (Array.isArray(value) && rule.items) {
    value.forEach((item, index) => inspect(rule.items, item, `${at}[${index}]`, failures))
  }
}

export function validate(name, value) {
  const rule = schemas.$defs?.[name]
  if (!rule) throw new Error(`Unknown API schema: ${name}`)
  const failures = []
  inspect(rule, value, '$', failures)
  return failures
}

export function assert(name, value) {
  const failures = validate(name, value)
  if (failures.length) throw new TypeError(`${name} contract failed:\n${failures.join('\n')}`)
  return value
}
