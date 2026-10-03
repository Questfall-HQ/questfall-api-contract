import {expect,test} from 'bun:test';
import {schema,operations,validate} from '../src/index.js';

test('one automatic Welcome subscription has no settings source and binds its Claim',()=>{
 expect(schema('TrackingObject').properties.category.enum).toContain('welcome');
 expect(schema('TrackingSubscription').properties.category.enum).toContain('welcome');
 expect(schema('TrackingSettings').properties.sources.properties.welcome).toBeUndefined();
 expect(operations['tracking.claim'].request.optional).toContain('quest_id');
 expect(validate('TrackingClaim',{kind:'quest',id:'welcome-quest',enabled:true,reason:''})).toEqual([]);
});
