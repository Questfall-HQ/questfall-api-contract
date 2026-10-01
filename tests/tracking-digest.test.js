import {expect,test} from 'bun:test'
import {validate,operations} from '../src/index.js'

test('Tracker activity days are additive and explicit acknowledgement preserves old clients',()=>{
 const row={id:'delivery',action:'Daily summary',status:'Daily summary',detail:'Summary',amount:0,currency:'',created:1,read:false}
 expect(validate('TrackingUpdate',row)).toEqual([])
 expect(validate('TrackingUpdate',{...row,day:Date.UTC(2026,8,30)})).toEqual([])
 for(const day of [-1,1.5,'2026-09-30']) expect(validate('TrackingUpdate',{...row,day}).length).toBeGreaterThan(0)
 expect(operations['tracking.mark'].request.required).toEqual([])
 expect(operations['tracking.mark'].request.optional).toEqual(['updates'])
})
