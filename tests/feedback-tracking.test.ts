import {expect,test} from 'bun:test'
import {operations,schema,validate} from '../src/index.js'

test('feedback tracking is an explicit verified subscription with additive read state',()=>{
 for(const kind of ['ideas','bugs']) {
  const operation=operations[`feedback.${kind}.tracking`]
  expect(operation.access).toBe('verified')
  expect(operation.request.required).toEqual(['tracked'])
  expect(operation.response.schema).toBe('FeedbackTracking')
 }
 for(const name of ['Idea','BugReport']) {
  expect(schema(name).properties.tracked).toEqual({type:'boolean'})
  expect(schema(name).required).not.toContain('tracked')
 }
 for(const tracked of [true,false]) expect(validate('FeedbackTracking',{id:'post',tracked})).toEqual([])
 for(const value of [{id:'post'},{id:'',tracked:true},{id:'post',tracked:'true'}]) expect(validate('FeedbackTracking',value).length).toBeGreaterThan(0)
})
