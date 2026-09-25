import {describe, expect, test} from 'bun:test'
import {schema, validate} from '../src/index.js'

const card = {
	id: 'quest', type: 'quiz', title: 'Quest', description: '', instructions: '',
	checklist: [], config: {}, cover: '', bounty: 100, base_points: 100, points: 100,
	reward: {kind: 'quest_bounty', amount: 100}, rating: 0, completion_count: 1,
	published: 1, ends: 2, active: true, placement: 'feed',
	author: {id: 'space', slug: 'space', name: 'Space', accent: 'violet', hue: 0, avatar: '', official: false, karma: 0},
	viewer: {marked: false, hidden: false, completed: false, pending: false, exhausted: false,
		following: false, assignment: null, claimable: false, claimed: false,
		locked: false, current: false, lock_reason: '', legacy_reconciled: false, progress: {current: 0, target: 1}},
}

describe('public quest submission activity', () => {
	test('accepts total sends independently of completions and supports older servers', () => {
		expect(schema('QuestCard').required).not.toContain('submission_count')
		expect(validate('QuestCard', card)).toEqual([])
		for (const submission_count of [0, 1, 5, 100_000]) {
			expect(validate('QuestCard', {...card, submission_count})).toEqual([])
		}
	})
	test('rejects invalid counts', () => {
		for (const submission_count of [-1, 1.5, '5', null]) {
			expect(validate('QuestCard', {...card, submission_count}).length).toBeGreaterThan(0)
		}
	})
})
