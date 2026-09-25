import {describe, expect, test} from 'bun:test'
import {operations, schema, validate} from '../src/index.js'

const viewer = {
	marked: false, hidden: false, completed: false, pending: false, exhausted: false,
	following: false, assignment: null, claimable: false, claimed: false,
	locked: false, current: false, lock_reason: '', legacy_reconciled: false,
	progress: {current: 0, target: 1},
}

describe('canonical Feed attempt and publication state', () => {
	test('includes optional Welcome cards in the first personal Feed snapshot', () => {
		const feed = schema('QuestFeed')
		expect(feed.required).not.toContain('welcome')
		expect(feed.properties.welcome.items.$ref).toBe('#/$defs/QuestCard')
		const response = {tab:'feed',server_now:1,feed_revision:1,assignment_revision:1,items:[],welcome:[],next_cursor:'',next_assignment_check:0}
		expect(validate('QuestFeed',response)).toEqual([])
		expect(validate('QuestFeed',{...response,welcome:'none'})).not.toEqual([])
	})
	test('bounds refreshed heads separately from updated cards already loaded below them', () => {
		for (const [name, payload] of [['QuestFeedChanges', 'upsert'], ['QuestFeedViewer', 'upsert'], ['QuestRatingAssignments', 'cards']]) {
			expect(schema(name).properties[payload].maxItems).toBe(100)
			expect(schema(name).properties.order.maxItems).toBe(50)
			expect(schema(name).properties.remove.maxItems).toBe(50)
		}
		expect(schema('QuestFeedViewer').properties.patches.maxItems).toBe(50)
	})
	test('validates 100 updated cards and rejects the 101st without expanding head limits', () => {
		const card = {
			id: 'quest', type: 'quiz', title: 'Quest', description: '', instructions: '',
			checklist: [], config: {}, cover: '', bounty: 100, base_points: 100, points: 100,
			reward: {kind: 'quest_bounty', amount: 100}, rating: 0, completion_count: 0,
			published: 1, ends: 2, active: true, placement: 'feed', viewer,
			author: {id: 'author', slug: 'author', name: 'Author', accent: 'violet', hue: 0, avatar: '', official: false, karma: 0},
		}
		const common = {server_now: 1, feed_revision: 1, assignment_revision: 1, order: [], remove: [], next_cursor: '', next_assignment_check: 0}
		const cases = [
			['QuestFeedChanges', 'upsert', {...common, unchanged: false}],
			['QuestFeedViewer', 'upsert', {...common, patches: []}],
			['QuestRatingAssignments', 'cards', {...common, assignments: []}],
		] as const
		for (const [name, field, envelope] of cases) {
			const cards = Array.from({length: 100}, (_, i) => ({...card, id: `quest_${i}`}))
			expect(validate(name, {...envelope, [field]: cards})).toEqual([])
			expect(validate(name, {...envelope, [field]: [...cards, {...card, id: 'quest_100'}]})).toEqual([`$.${field} must contain at most 100 items`])
			expect(validate(name, {...envelope, [field]: cards, order: Array.from({length: 51}, (_, i) => `quest_${i}`)})).toEqual(['$.order must contain at most 50 items'])
		}
	})
	test('makes viewed publication validation opt-in for existing completion clients', () => {
		const request = operations['quests.complete'].request
		expect(request.optional).toContain('publication_id')
		expect(request.required).toEqual(['id', 'idempotency_key'])
	})
	test('accepts old viewer responses during the additive rollout', () => {
		expect(validate('QuestViewerState', viewer)).toEqual([])
		expect(schema('QuestViewerState').required).not.toContain('attempt')
		expect(schema('QuestCard').required).not.toContain('publication_id')
		expect(schema('QuestFeedViewerPatch').required).not.toContain('publication_id')
	})

	test('accepts the server projection for every next attempt and a terminal state', () => {
		const multipliers = [1, .8, .6, .4, .2]
		for (let used = 0; used < 5; used++) {
			const attempt = {used, remaining: 5 - used, next: used + 1, multiplier: multipliers[used]}
			expect(validate('QuestViewerState', {...viewer, attempt})).toEqual([])
		}
		for (const used of [0, 1, 5]) {
			expect(validate('QuestAttemptState', {used, remaining: 0, next: 0, multiplier: 0})).toEqual([])
		}
		expect(validate('QuestAttemptState', {used: 0, remaining: 1, next: 1, multiplier: 1})).toEqual([])
		expect(validate('QuestAttemptState', {used: 1, remaining: 4, next: 2, multiplier: 1})).toEqual([])
	})

	test('rejects missing, fractional, out-of-range and noncanonical attempt fields', () => {
		const attempt = {used: 1, remaining: 4, next: 2, multiplier: .8}
		for (const invalid of [
			{...attempt, used: -1}, {...attempt, used: 6}, {...attempt, remaining: 6},
			{...attempt, next: null}, {...attempt, next: 1.5}, {...attempt, next: 6},
			{...attempt, multiplier: .7}, {...attempt, private_submission: 'hidden'},
		]) expect(validate('QuestAttemptState', invalid).length).toBeGreaterThan(0)
		const {multiplier, ...incomplete} = attempt
		expect(validate('QuestAttemptState', incomplete)).toEqual(['$.multiplier is required'])
	})

	test('allows an identified publication and canonical attempt in a compact patch', () => {
		const patch = {
			id: 'quest', publication_id: 'publication', points: 80,
			reward: {kind: 'quest_bounty', amount: 100},
			viewer: {...viewer, attempt: {used: 1, remaining: 4, next: 2, multiplier: .8}},
		}
		expect(validate('QuestFeedViewerPatch', patch)).toEqual([])
		expect(validate('QuestFeedViewerPatch', {...patch, publication_id: null})).not.toEqual([])
	})
})

describe('Feed resolution delivery', () => {
	test('adds explicit delivery and batched acknowledgement to existing routes', () => {
		expect(operations['quests.feed'].request.optional).toContain('notice_mode')
		expect(operations['quests.feedChanges'].request.optional).toContain('notice_mode')
		expect(operations['quests.feedChanges'].request.optional).toContain('notice_ack_ids')
		expect(operations['quests.feedChanges'].request.required).toEqual(['feed_revision', 'assignment_revision', 'known_ids'])
	})

	test('accepts legacy notices and exact-resolution receipts in unchanged deltas', () => {
		const notice = {status: 'accepted', title: 'Reviewed quest', placement: 'feed', points: 80}
		const response = {
			server_now: 10, feed_revision: 1, assignment_revision: 2,
			unchanged: true, order: [], upsert: [], remove: [], next_cursor: '', next_assignment_check: 0,
		}
		expect(validate('QuestFeedChanges', {...response, quest_updates: [notice]})).toEqual([])
		expect(validate('QuestFeedChanges', {...response, quest_updates: [{...notice, id: 'opaque-resolution-receipt', resolved: 9}]})).toEqual([])
		expect(validate('QuestResolutionNotice', {...notice, status: 'progress'})).not.toEqual([])
		expect(validate('QuestResolutionNotice', {...notice, id: '', resolved: -1})).not.toEqual([])
		expect(schema('QuestResolutionNotice').required).not.toContain('id')
		expect(schema('QuestUpdate').properties.status.enum).toEqual(['progress', 'claimable', 'claimed'])
	})

	test('accepts public resolution covers and preserves older responses without them', () => {
		for (const status of ['accepted', 'rejected', 'cancelled']) {
			const notice = {status, title: 'Reviewed quest', placement: 'feed', points: 0}
			for (const cover of ['', 'https://media.questfall.xyz/published-cover.webp']) {
				expect(validate('QuestResolutionNotice', {...notice, cover})).toEqual([])
			}
			expect(validate('QuestResolutionNotice', notice)).toEqual([])
			expect(validate('QuestResolutionNotice', {...notice, cover: {url: 'invalid'}})).not.toEqual([])
		}
	})

	test('Welcome updates accept an optional cover without changing completion or reward fields', () => {
		const update = {quest_id:'welcome', title:'Welcome quest', status:'claimable', progress:{current:1,target:1}, reward:{kind:'gold',amount:3}}
		expect(validate('QuestUpdate', update)).toEqual([])
		expect(validate('QuestUpdate', {...update, cover:'https://media.questfall.xyz/welcome.webp'})).toEqual([])
		expect(validate('QuestUpdate', {...update, cover:''})).toEqual([])
		expect(validate('QuestUpdate', {...update, cover:42})).not.toEqual([])
	})
})
