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
		expect(contract.routes.length).toBe(75)
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
		expect(schema('AuthorSpaceTagColor').enum).toEqual(['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'slate', 'gray'])
    expect(schema('AuthorSpaceBalanceEntryType').enum).toEqual(['transfer', 'donation', 'quest_publication', 'reward_settlement'])
		expect(schema('AuthorSpaceHue')).toEqual({ type: 'integer', minimum: 0, maximum: 359 })
		expect(schema('AuthorSpaceCoverOpacity')).toEqual({ type: 'integer', minimum: 0, maximum: 100 })
		expect(schema('AuthorSpaceTag').properties.color.$ref).toBe('#/$defs/AuthorSpaceTagColor')
		expect(schema('AuthorSpaceRatedQuest').required).toEqual(['id', 'title', 'cover', 'tag_ids', 'rating', 'rated', 'updated'])
		expect(operations['authorSpaces.load'].response.schema).toBe('AuthorSpaceWorkspace')
		expect(operations['authorSpaces.rewards'].response.schema).toBe('AuthorSpaceRewards')
		expect(operations['authorSpaces.rewards'].request.required).toEqual(['slug'])
		expect(operations['authorSpaces.team.search'].response.schema).toBe('AuthorSpaceTeamSearch')
		expect(operations['authorSpaces.team.add'].response.schema).toBe('AuthorSpaceTeamAddition')
		expect(schema('ShardSet').properties.layout.enum).toEqual(['4x3', '4x4', '5x4'])
		expect(schema('ShardState').required).toEqual(['active', 'period', 'set', 'progress', 'pieces'])
		expect(schema('ShardReward').required).toEqual(['count', 'drops', 'lootboxes'])
		expect(schema('MiningLeagueOverview').required).toContain('leagues')
		expect(schema('MiningLeagueSummary').required).toEqual(['id', 'name', 'hall', 'eligible', 'start_level', 'end_level', 'next_level', 'members', 'participants', 'total_points'])
		expect(schema('LeagueBrowserMiner').properties.equipment.maxItems).toBe(6)
		expect(schema('LeagueBrowserEquipment').properties.item.oneOf[0].$ref).toBe('#/$defs/Item')
		expect(schema('LeagueBrowser').properties.page.properties.per_page.maximum).toBe(50)
		expect(operations['mining.leagues'].request.optional).toContain('sort')
		expect(operations['mining.rewards.claim'].request.required).toEqual(['idempotency_key'])
		expect(schema('MiningPayoutScope').enum).toEqual(['week', 'season'])
		expect(schema('MiningPayoutState').enum).toEqual(['pending', 'claimed'])
		expect(schema('MiningRewardsPeriod').properties.competition.oneOf).toHaveLength(2)
		expect(schema('MiningRewardsSeriesPoint').required).toContain('competition_points')
		expect(schema('MiningRewardsQuest').required).toContain('cover')
		expect(schema('QuestViewerState').required).toContain('locked')
		expect(schema('QuestCard').required).toContain('checklist')
		expect(schema('QuestCard').properties.checklist.$ref).toBe('#/$defs/QuestChecklist')
		expect(schema('QuestChecklist').maxItems).toBe(5)
		expect(operations['quests.welcome.sync'].response.schema).toBe('WelcomeQuestSync')
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
		expect(validate('AuthorSpaceRewards', {
			server_now: 1,
			gold_to_silver: 10,
			treasury_silver: 0,
			payouts: [],
			week: null,
			season: null,
		})).toEqual([])
		expect(validate('AuthorSpaceRewards', {
			server_now: 1,
			gold_to_silver: 10,
			treasury_silver: 0,
			payouts: [],
			week: null,
			season: null,
			demo_fallback: 12400,
		})).toEqual(['$.demo_fallback is not allowed'])
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
