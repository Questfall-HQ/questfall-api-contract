import {expect,test} from 'bun:test'
import {validate} from '../src/index.js'

test('individual Tracker controls accept personal objects and period identities',()=>{
 for(const [type,id] of [
  ['completion','submission'],['gold_purchase','order'],['gold_freezing','position'],
  ['referral','invited-player'],['mining_week','2026-W40'],['mining_season','2026-Q4'],
  ['gem_week','2026-W40'],['referral_reward','2026-W40']
 ]) {
  expect(validate('TrackingObservation',{type,id,tracked:true})).toEqual([])
  expect(validate('TrackingObservation',{type,id,tracked:false})).toEqual([])
 }
 expect(validate('TrackingObservation',{type:'player',id:'stranger',tracked:true}).length).toBeGreaterThan(0)
})
