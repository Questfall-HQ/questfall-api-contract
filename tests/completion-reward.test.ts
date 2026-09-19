import {expect, test} from 'bun:test'
import {validate} from '../src/index.js'

for (const version of [1, 2]) test(`completion v${version} accepts an absent, null or populated shard reward`, () => {
  const result = {
    id: 'submission', quest_id: 'quest', status: 'accepted', accepted: true,
    exhausted: false, attempt: 1, attempt_multiplier: 1, points: 10,
    assignment_id: '', rating_vote: null, idempotent: true, claimable: false,
    ...(version === 2 ? {response_version: 2, effects: {owner: 'user', server_now: 1, upsert: [], remove: [], invalidate: []}} : {}),
  }
  for (const reward of [{points: 10}, {points: 10, shards: null}, {points: 10, shards: {count: 0, drops: [], lootboxes: 0}}]) {
    expect(validate('QuestCompletionResult', {...result, reward})).toEqual([])
  }
  for (const shards of [0, '', {}, {count: -1, drops: [], lootboxes: 0}]) {
    expect(validate('QuestCompletionResult', {...result, reward: {shards}})).not.toEqual([])
  }
})
