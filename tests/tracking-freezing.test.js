import {expect,test} from 'bun:test'
import {schema,validate,operations} from '../src/index.js'

test('Tracker Claim can bind the displayed personal receipt without breaking older requests',()=>{
 const operation=operations['tracking.claim']
 expect(operation.request.required).toEqual(['key'])
 expect(operation.request.optional).toContain('payout_id')
 expect(schema('TrackingObject').properties.category.enum).toContain('gold_freezing')
 expect(validate('TrackingClaim',{kind:'reward',id:'weekly-receipt',source:'gold_freezing_payouts',enabled:true,reason:''})).toEqual([])
 expect(validate('TrackingSubject',{type:'gold_freezing',id:'position',period:''})).toEqual([])
})
