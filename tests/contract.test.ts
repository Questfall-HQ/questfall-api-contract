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
		expect(contract.routes.length).toBe(103)
  })

  test('builds parameterized paths safely', () => {
    expect(path('media.complete', { id: 'asset/a' })).toBe('/media/uploads/asset%2Fa/complete')
    expect(() => path('media.complete')).toThrow('Missing path parameter')
    expect(() => path('missing')).toThrow('Unknown API operation')
  })

  test('exports stable public schemas', () => {
    expect(schema('Player').required).toContain('character')
		expect(schema('Player').properties.character.properties.mining.$ref).toBe('#/$defs/PlayerMining')
		expect(schema('PlayerMining').required).toEqual(['week', 'season', 'server_now', 'power', 'boost', 'base_multiplier', 'multiplier', 'flow'])
		expect(schema('PlayerFlow').required).toEqual(['active', 'started_at', 'ends_at', 'bonus', 'focus_minutes'])
    expect(schema('Item').properties.rarity.enum).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    expect(schema('AuthorSpaceAccent').enum).toEqual(['violet', 'blue', 'cyan', 'emerald', 'amber', 'orange', 'rose', 'fuchsia'])
		expect(schema('AuthorSpaceTagColor').enum).toEqual(['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'slate', 'gray'])
    expect(schema('AuthorSpaceBalanceEntryType').enum).toEqual(['transfer', 'donation', 'quest_publication'])
		expect(schema('AuthorSpaceHue')).toEqual({ type: 'integer', minimum: 0, maximum: 359 })
		expect(schema('AuthorSpaceCoverOpacity')).toEqual({ type: 'integer', minimum: 0, maximum: 100 })
		expect(schema('AuthorSpaceTag').properties.color.$ref).toBe('#/$defs/AuthorSpaceTagColor')
		expect(schema('AuthorSpaceRatedQuest').required).toEqual(['id', 'title', 'cover', 'tag_ids', 'rating', 'rated', 'updated'])
		expect(operations['authorSpaces.load'].response.schema).toBe('AuthorSpaceWorkspace')
		expect(schema('AuthorSpaceWorkspace').properties.space.required).toContain('official')
		expect(schema('AuthorSpaceWorkspace').properties.space.properties.official).toEqual({ type: 'boolean' })
		expect(operations['authorSpaces.rewards'].response.schema).toBe('AuthorSpaceRewards')
		expect(operations['authorSpaces.rewards'].request.required).toEqual(['slug'])
		expect(operations['authorSpaces.rewards.withdraw'].request.required).toEqual(['slug', 'currency', 'idempotency_key'])
		expect(schema('AuthorRewardCurrency').enum).toEqual(['gold', 'qft'])
		expect(schema('AuthorRewardPayout').properties.state.enum).toEqual(['pending', 'withdrawn'])
		expect(schema('AuthorRewardPeriod').properties.pool.$ref).toBe('#/$defs/AuthorRewardAmount')
		expect(schema('AuthorRewardPeriod').properties.karma_cutoff).toEqual({ type: 'integer', minimum: 0, maximum: 5 })
		expect(schema('AuthorRewardPeriod').required).not.toContain('karma_cutoff')
		expect(schema('AuthorRewardKarmaBand').properties.weight.maximum).toBe(10)
		expect(operations['authorSpaces.team.search'].response.schema).toBe('AuthorSpaceTeamSearch')
		expect(operations['authorSpaces.team.add'].response.schema).toBe('AuthorSpaceTeamAddition')
		expect(operations['authorSpaces.quests.duplicate'].request.required).toEqual(['id'])
		expect(operations['authorSpaces.quests.quote'].request.optional).toContain('id')
		expect(operations['authorSpaces.quests.extend'].request.required).toEqual(['id', 'duration', 'pricing_version', 'pricing_revision', 'max_cost', 'idempotency_key'])
		expect(operations['authorSpaces.quests.unpublishQuote'].response.schema).toBe('QuestUnpublishQuote')
		expect(operations['authorSpaces.quests.unpublish'].response.schema).toBe('QuestUnpublishResult')
		expect(schema('QuestPricingQuote').properties.pricing_version.enum).toEqual(['bounty-v1', 'bounty-v2'])
		expect(schema('QuestPricingQuote').properties.mode.enum).toEqual(['activate', 'reactivate', 'extend'])
		expect(schema('QuestPricingQuote').properties.subtotal.minimum).toBe(0)
		expect(schema('QuestPricingQuote').properties.discount_rate.maximum).toBe(1)
		expect(schema('QuestPricingQuote').properties.total.minimum).toBe(0)
		expect(schema('QuestPublishResult').required).toContain('feed_revision')
		expect(schema('QuestUnpublishResult').required).toContain('feed_revision')
		expect(schema('AuthorSpaceTeamCandidate').required).toContain('level')
		expect(schema('AuthorSpaceTeamCandidate').properties.level).toEqual({ type: 'integer', minimum: 1 })
		expect(operations['marketplace.list'].response.schema).toBe('MarketplacePage')
		expect(schema('MarketplaceUser').required).toContain('level')
		expect(schema('MarketplaceUser').properties.level).toEqual({ type: 'integer', minimum: 1 })
		expect(schema('ShardSet').properties.layout.enum).toEqual(['2x2', '3x2', '3x3', '4x3', '4x4', '5x4'])
		expect(schema('ShardSet').properties.count.enum).toEqual([4, 6, 9, 12, 16, 20])
		expect(schema('ShardProgress').properties.required.enum).toEqual([0, 4, 6, 9, 12, 16, 20])
		expect(schema('ShardState').required).toEqual(['active', 'period', 'set', 'progress', 'pieces'])
		expect(schema('ShardReward').required).toEqual(['count', 'drops', 'lootboxes'])
		expect(schema('MiningLeagueOverview').required).toContain('leagues')
		expect(schema('MiningLeagueSummary').required).toEqual(['id', 'name', 'hall', 'eligible', 'open', 'frontier', 'start_level', 'end_level', 'next_level', 'members', 'participants', 'total_points'])
		expect(operations['mining.leagues.catalog'].response.schema).toBe('MiningLeagueCatalog')
		expect(schema('MiningLeagueSummary').properties.end_level.type).toEqual(['integer', 'null'])
		expect(schema('LeagueBrowserMiner').required).toContain('points')
		expect(schema('LeagueBrowserMiner').properties.points).toEqual({ type: 'integer', minimum: 0 })
		expect(schema('LeagueBrowserMiner').properties.equipment.maxItems).toBe(6)
		expect(schema('LeagueBrowserEquipment').properties.item.oneOf[0].$ref).toBe('#/$defs/Item')
		expect(schema('LeagueBrowser').required).toContain('series')
		expect(schema('LeagueBrowser').properties.series.items.$ref).toBe('#/$defs/LeagueBrowserSeriesPoint')
		expect(schema('LeagueBrowser').properties.page.properties.per_page.maximum).toBe(50)
		expect(schema('LeagueBrowser').properties.sort.enum).toEqual(['power', 'points', 'quests'])
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
		expect(schema('QuestCard').required).toContain('bounty')
		expect(schema('QuestCard').required).toContain('base_points')
		expect(schema('QuestAuthor').required).toContain('karma')
		expect(schema('QuestChecklist').maxItems).toBe(5)
		expect(schema('QuestCardAssignment').properties.requires_rating.type).toBe('boolean')
		expect(operations['quests.feedChanges'].request.required).toEqual(['feed_revision', 'assignment_revision', 'known_ids'])
		expect(operations['quests.feedChanges'].response.schema).toBe('QuestFeedChanges')
		expect(schema('QuestFeed').required).toContain('feed_revision')
		expect(schema('QuestFeedChanges').properties.upsert.items.$ref).toBe('#/$defs/QuestCard')
		expect(schema('QuestRatingAssignments').required).toContain('cards')
		expect(operations['quests.welcome.sync'].response.schema).toBe('WelcomeQuestSync')
		expect(operations['quests.complete'].request.required).toEqual(['id', 'idempotency_key'])
		expect(operations['quests.complete'].request.optional).toContain('rating')
		expect(operations['quests.complete'].request.optional).toContain('proof_url')
		expect(operations['quests.complete'].request.optional).toContain('proof_media_ids')
		expect(operations['quests.complete'].request.optional).toContain('platform_account')
		expect(schema('QuestType').enum).toContain('transaction')
		expect(schema('QuestCompletion').required).toContain('status')
		expect(operations['moderation.assignments.claim'].response.schema).toBe('ModerationAssignmentResult')
		expect(operations['moderation.witness.switch'].request.required).toEqual(['assignment_id'])
		expect(operations['moderation.completions.report'].request.required).toEqual(['assignment_id'])
		expect(operations['moderation.profiles.report'].request.required).toEqual(['id', 'category', 'explanation'])
		expect(operations['moderation.spaces.report'].request.required).toEqual(['id', 'category', 'explanation'])
		expect(operations['moderation.cases.appeal'].response.schema).toBe('ModerationAppealMutation')
		expect(operations['moderation.domains.resolve'].response.schema).toBe('EffectiveDomainTrust')
		expect(operations['moderation.domains.favicon'].response.schema).toBe('DomainFavicon')
		expect(schema('ModerationDomain').properties.favicon.$ref).toBe('#/$defs/DomainFavicon')
		expect(schema('ModerationDomain').required).toEqual(expect.arrayContaining(['added_by', 'consensus', 'history']))
		expect(schema('ModerationDomain').properties.added_by.$ref).toBe('#/$defs/ModerationDomainAddedBy')
		expect(schema('ModerationDomain').properties.consensus.$ref).toBe('#/$defs/ModerationDomainConsensus')
		expect(schema('ModerationDomain').properties.history.items.$ref).toBe('#/$defs/ModerationDomainDecision')
		expect(schema('ModerationDomainAddedBy').properties.kind.enum).toEqual(['system', 'team', 'community'])
		expect(schema('ModerationDomainConsensus').properties.source.enum).toEqual(['system', 'team', 'community'])
		expect(schema('ModerationDomainConsensus').properties.progress.maximum).toBe(100)
		expect(schema('ModerationDomainVoteSplit').required).toEqual(['approve', 'reject'])
		expect(schema('ModerationDomainDecision').properties.result.enum).toEqual(['pending', 'safe', 'suspicious', 'blocked'])
		expect(schema('ModerationCaseKind').enum).toContain('profile_report')
		expect(schema('ModerationCaseKind').enum).toContain('space_report')
		expect(schema('DomainTrustState').enum).toEqual(['unknown', 'pending', 'safe', 'suspicious', 'blocked'])
		expect(schema('QuestCard').properties.moderation_state.$ref).toBe('#/$defs/QuestModerationState')
		expect(schema('PublicMiniProfile').required).toContain('moderation_status')
		expect(schema('ModeratorState').required).toContain('witness_available')
		expect(schema('ModeratorState').required).toContain('pricing')
		expect(schema('ModeratorState').properties.bypass_cost.maximum).toBeUndefined()
		expect(schema('ModerationPricingWindow').properties.rate_bps.minimum).toBe(10000)
		expect(schema('ModerationPriceQuote').required).toEqual(['window_revision', 'rate_bps', 'reward', 'penalty', 'bypass_cost', 'witness_cost'])
		expect(schema('ModeratorState').properties.real_count).toBeUndefined()
		expect(schema('ModeratorState').properties.honeypot_count).toBeUndefined()
		expect(schema('ModeratorState').properties.yes_count).toBeUndefined()
		expect(schema('ModeratorState').properties.no_count).toBeUndefined()
		expect(operations['profile.save'].request.optional).toContain('feed_authored')
		expect(schema('ProfilePreferences').required).toEqual(['feed_authored'])
		expect(schema('ProfileUser').properties.preferences.$ref).toBe('#/$defs/ProfilePreferences')
		expect(schema('ProfileUser').properties.platform_accounts.$ref).toBe('#/$defs/PlatformAccounts')
		expect(schema('ModerationAssignment').properties.account.maxLength).toBe(128)
		expect(schema('ModerationAssignment').required).toContain('reportable')
		expect(schema('ModerationAssignment').required).toContain('pricing')
		expect(schema('ModerationAssignment').required).toContain('expires')
		expect(schema('ModerationAssignment').properties.snapshot).toBeUndefined()
		expect(schema('ModerationAssignment').properties.case_id).toBeUndefined()
		expect(schema('ModerationAssignment').properties.root_case_id).toBeUndefined()
		expect(schema('ModerationAssignment').properties.submission_id).toBeUndefined()
		expect(schema('ModerationProgress').required).toContain('consensus_percent')
		expect(schema('ModerationProgress').properties.consensus_percent).toMatchObject({type: 'integer', minimum: 0, maximum: 100})
		expect(schema('ModerationProgress').properties.groups_resolved).toBeUndefined()
		expect(schema('ModerationProgress').properties.groups_total).toBeUndefined()
		expect(schema('QuestRatingDistributionBin').required).toContain('users')
		expect(schema('QuestRatingDistributionBin').properties.users.items.$ref).toBe('#/$defs/QuestRatingHistoryUser')
		expect(schema('QuestRatingHistoryAuthor').required).toContain('official')
		expect(schema('QuestRatingHistoryAuthor').properties.official).toEqual({ type: 'boolean' })
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
		expect(validate('ShardState', {
		active: true,
		period: '2026-W36',
		set: {
			id: 'set', period: '2026-W36', start: 1, end: 2,
			layout: '3x2', columns: 3, rows: 2, count: 6,
			image: {url: 'https://media.example/set', thumb: 'https://media.example/thumb', width: 1200, height: 800},
		},
		progress: {unique: 1, required: 6, total: 1, completed: 0},
		pieces: {p01: 1},
		})).toEqual([])
		expect(validate('AuthorSpaceRewards', {
			server_now: 1,
			access: {owner: true},
			balances: [],
			payouts: [],
			withdrawals: [],
			week: null,
			season: null,
		})).toEqual([])
		expect(validate('AuthorSpaceRewards', {
			server_now: 1,
			access: {owner: false},
			balances: [],
			payouts: [],
			withdrawals: [],
			week: null,
			season: null,
			demo_fallback: 12400,
		})).toEqual(['$.demo_fallback is not allowed'])
		expect(validate('PlayerMining', {
			week: 120,
			season: 900,
			server_now: 1_777_000_000_000,
			power: 20,
			boost: 1.5,
			base_multiplier: 1.8,
			multiplier: 1.98,
			flow: {
				active: true,
				started_at: 1_777_000_000_000,
				ends_at: 1_777_000_300_000,
				bonus: 10,
				focus_minutes: 5,
			},
		})).toEqual([])
		expect(validate('QuestCardAssignment', {id: 'assignment', slot: 1, effective_bounty: 100, expires: 1, requires_rating: false})).toEqual([])
		expect(validate('QuestCompletion', {
			id: 'submission',
			quest_id: 'quest',
			accepted: false,
			exhausted: false,
			status: 'rejected',
			attempt: 1,
			attempt_multiplier: 1,
			points: 0,
			assignment_id: 'assignment',
			rating_vote: 7,
			idempotent: false,
			claimable: false,
		})).toEqual([])
		expect(validate('ModerationDomain', {
			host: 'example.com',
			status: 'pending',
			added_by: {kind: 'community', name: 'Mira North'},
			consensus: {
				source: 'community', kind: 'domain_proposal', mode: 'initial', status: 'open', outcome: 'unknown',
				category: 'trusted_platform', progress: 50, split: {approve:67, reject:33}, created: 1, resolved: 0,
			},
			history: [{
				source: 'community', kind: 'domain_proposal', mode: 'initial', status: 'open', outcome: 'unknown',
				category: 'trusted_platform', progress: 50, split: {approve:67, reject:33}, result: 'pending', created: 1, resolved: 0,
			}],
			created: 1,
			updated: 1,
		})).toEqual([])
		expect(validate('ModerationDomainConsensus', {
			source: 'community', kind: 'domain_proposal', mode: 'initial', status: 'open', outcome: 'unknown',
			category: 'trusted_platform', progress: 50, split: {approve:67, reject:33}, created: 1, resolved: 0, participants: 2,
		})).toEqual(['$.participants is not allowed'])
		expect(validate('ModerationDomain', {
			host: 'seed.example',
			status: 'safe',
			added_by: {kind: 'system', name: 'Questfall system'},
			consensus: {
				source: 'system', kind: 'seed', mode: 'seed', status: 'resolved', outcome: 'approve',
				category: '', progress: 100, split: null, created: 1, resolved: 1,
			},
			history: [{
				source: 'system', kind: 'seed', mode: 'seed', status: 'resolved', outcome: 'approve',
				category: '', progress: 100, split: null, result: 'safe', created: 1, resolved: 1,
			}],
			created: 1,
			updated: 1,
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
