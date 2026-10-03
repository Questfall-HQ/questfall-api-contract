import {expect,test} from 'bun:test'
import {schema,validate} from '../src/index.js'

test('Tracker supports aggregated author-team spaces and completions without foreign quest observation',()=>{
 for(const name of ['TrackingObject','TrackingSubscription']) {
  expect(schema(name).properties.category.enum).not.toContain('quest')
  expect(schema(name).properties.category.enum).not.toContain('authoring')
  expect(schema(name).properties.category.enum).toContain('completion')
 }
 expect(validate('TrackingSubscription',{type:'space',id:'team-space',category:'space'})).toEqual([])
 expect(validate('TrackingSubscription',{type:'completion',id:'submission',category:'completion'})).toEqual([])
 expect(validate('TrackingSubscription',{type:'quest',id:'foreign-quest',category:'quest'}).length).toBeGreaterThan(0)
 expect(validate('TrackingObservation',{type:'quest',id:'team-quest',tracked:true})).toEqual([])
})
