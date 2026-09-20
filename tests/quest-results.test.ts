import {expect,test} from 'bun:test'
import {validate,operations} from '../src/index.js'
const empty = () => ({total:0,ratings:0,timezone:'UTC',series:Array.from({length:30},(_,i)=>({day:i*86400000,count:0})),survey:null})
test('author results declare access and a bounded daily response',()=>{
  expect(operations['authorSpaces.quests.results'].access).toBe('verified')
  expect(operations['authorSpaces.quests.results'].request.required).toEqual(['slug','id'])
  expect(validate('AuthorQuestResults',empty())).toEqual([])
  expect(validate('AuthorQuestResults',{...empty(),survey:{total:1,items:[{index:0,count:1,percent:100},{index:1,count:0,percent:0}]}})).toEqual([])
  for(const extra of [{series:[]},{total:-1},{timezone:'local'},{ratings:null},{survey:{total:1,items:[{index:0,count:1,percent:101}]}}]) expect(validate('AuthorQuestResults',{...empty(),...extra}).length).toBeGreaterThan(0)
})
