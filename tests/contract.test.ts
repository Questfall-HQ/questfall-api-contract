import { describe, expect, test } from 'bun:test'
import { contract, operations, path, schema, schemas, validate } from '../src/index.js'
import {
  compareApplication,
  compareBackend,
  extractBackendRoutes,
  extractFrontendSurface,
  validateContract,
} from '../src/check.mjs'

describe('contract manifest', () => {
  test('is internally valid and indexable', () => {
    expect(validateContract(contract, schemas)).toEqual([])
    expect(Object.keys(operations)).toHaveLength(contract.routes.length)
		expect(contract.routes.length).toBe(71)
  })

  test('builds parameterized paths safely', () => {
    expect(path('media.complete', { id: 'asset/a' })).toBe('/media/uploads/asset%2Fa/complete')
    expect(() => path('media.complete')).toThrow('Missing path parameter')
    expect(() => path('missing')).toThrow('Unknown API operation')
  })

  test('exports stable public schemas', () => {
    expect(schema('Player').required).toContain('character')
    expect(schema('Item').properties.rarity.enum).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    expect(schema('AuthorSpaceAccent').enum).toEqual(['violet', 'blue', 'cyan', 'emerald', 'amber', 'orange', 'rose', 'fuchsia'])
    expect(schema('AuthorSpaceBalanceEntryType').enum).toEqual(['transfer', 'donation', 'quest_publication'])
		expect(schema('AuthorSpaceHue')).toEqual({ type: 'integer', minimum: 0, maximum: 359 })
		expect(schema('AuthorSpaceCoverOpacity')).toEqual({ type: 'integer', minimum: 0, maximum: 100 })
		expect(schema('ShardSet').properties.layout.enum).toEqual(['4x3', '4x4', '5x4'])
		expect(schema('ShardState').required).toEqual(['active', 'period', 'set', 'progress', 'pieces'])
		expect(schema('ShardReward').required).toEqual(['count', 'drops', 'lootboxes'])
  })

  test('declares the Author Space accent and hue on create and update', () => {
    expect(operations['authorSpaces.create'].request.optional).toContain('accent')
    expect(operations['authorSpaces.update'].request.optional).toContain('accent')
		expect(operations['authorSpaces.create'].request.optional).toContain('hue')
		expect(operations['authorSpaces.update'].request.optional).toContain('hue')
		expect(operations['authorSpaces.create'].request.optional).toContain('coverOpacity')
		expect(operations['authorSpaces.update'].request.optional).toContain('coverOpacity')
  })

  test('validates public response values without runtime dependencies', () => {
    expect(validate('MediaAccess', { url: 'https://media.example/a', expires_at: 1 })).toEqual([])
    expect(validate('MediaAccess', { url: 'https://media.example/a' })).toEqual(['$.expires_at is required'])
		expect(validate('ShardReward', { count: 2, drops: [{ id: 'p12', index: 11, duplicate: true }], lootboxes: 1 })).toEqual([])
		expect(validate('ShardState', {
		active: false,
		period: '2026-W33',
		set: null,
		progress: { unique: 0, required: 0, total: 0, completed: 0 },
		pieces: {},
	})).toEqual([])
  })
})

describe('source adapters', () => {
  test('extracts nested Imba paths, methods and dynamic path parameters', () => {
    const source = `
const paths =
\tinventory:
\t\tload: '/inventory/load'

const get = do(path, query = {})
\tpath

export const api =
\tinventory:
\t\tload: do(query = {})
\t\t\tget(paths.inventory.load, query)
\tmedia:
\t\tcomplete: do(id)
\t\t\tpost("/media/uploads/{encodeURIComponent(id)}/complete")
\tsession:
\t\trefresh: do
\t\t\tawait pb.collection('users').authRefresh!
`
    const surface = extractFrontendSurface(source)
    expect(surface.errors).toEqual([])
    expect(surface.routes).toEqual([
      { method: 'GET', path: '/inventory/load' },
      { method: 'POST', path: '/media/uploads/{id}/complete' },
    ])
    expect(surface.collections).toEqual(['users'])
  })

  test('fails closed when frontend calls cannot be resolved', () => {
    const surface = extractFrontendSurface(`
export const api =
\tbroken: do(path)
\t\tget(path)
`)
    expect(surface.errors).toContain('unresolved frontend API call: get(path)')
  })

  test('extracts backend routes', () => {
    const extracted = extractBackendRoutes(`
routerAdd "GET", "/inventory/load", do(e)
routerAdd 'POST', '/media/uploads/{id}/complete', do(e)
`, 'api.pb.imba')
    expect(extracted.mentions).toBe(2)
    expect(extracted.routes).toEqual([
      { method: 'GET', path: '/inventory/load', file: 'api.pb.imba' },
      { method: 'POST', path: '/media/uploads/{id}/complete', file: 'api.pb.imba' },
    ])
  })
})

describe('consumer comparisons', () => {
  const fixture = {
    version: '0.0.0',
    routes: [{ operation: 'inventory.load', method: 'GET', path: '/inventory/load', access: 'verified', request: { transport: 'query', required: [], optional: [] }, response: { schema: 'PlayerEnvelope' } }],
    pocketbase: { collections: { users: { auth: true } } },
  }

  test('reports frontend drift in both directions', () => {
    const frontend = {
      routes: [{ method: 'POST', path: '/inventory/load' }],
      collections: ['users'],
      errors: [],
    }
    expect(compareApplication(frontend, fixture)).toEqual([
      'route POST /inventory/load is not declared in the contract',
      'contract route GET /inventory/load is not used by application src/api.imba',
    ])
  })

  test('reports contract routes absent from backend', () => {
    expect(compareBackend(fixture, [{ method: 'GET', path: '/other' }])).toEqual([
      'contract route GET /inventory/load is missing from backend sources',
    ])
  })
})
