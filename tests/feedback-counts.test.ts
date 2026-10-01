import {expect,test} from 'bun:test'
import {validate,operations} from '../src/index.js'

for(const [schema,list,keys,route] of [
 ['IdeaCounts','IdeaList',['open','planned','implemented','rejected','mine'],'ideas'],
 ['BugReportCounts','BugReportList',['open','confirmed','closed','rejected','mine'],'bugs']
] as const){
 test(`${list} optionally includes nonnegative totals for every public category`,()=>{
  const counts=Object.fromEntries(keys.map((key,index)=>[key,index]))
  const page={items:[],total:0,page:1,per_page:20,pages:1}
  expect(validate(schema,counts)).toEqual([])
  expect(validate(list,page)).toEqual([])
  expect(validate(list,{...page,counts})).toEqual([])
  for(const invalid of [-1,1.5,'3']) expect(validate(list,{...page,counts:{...counts,open:invalid}}).length).toBeGreaterThan(0)
  expect(validate(schema,{...counts,hidden:9}).length).toBeGreaterThan(0)
  const {mine,...incomplete}=counts
  expect(validate(schema,incomplete).length).toBeGreaterThan(0)
  for(const op of [`feedback.${route}.list`,`admin.feedback.${route}.list`]) expect(operations[op].response.schema).toBe(list)
 })
}
