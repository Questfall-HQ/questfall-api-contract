import {expect,test} from 'bun:test'
import {schema,validate,operations,path} from '../src/index.js'
const values=['public','admins','team','founders']
test('canonical readership enum and both feedback request/response surfaces agree',()=>{
 expect(schema('FeedbackAudience').enum).toEqual(values)
 for(const value of values)expect(validate('FeedbackAudience',value)).toEqual([])
 expect(validate('FeedbackAudience','owner').length).toBeGreaterThan(0)
 expect(validate('FeedbackAudience','team_founders').length).toBeGreaterThan(0)
 for(const [kind,response] of [['ideas','Idea'],['bugs','BugReport']]){
  expect(schema(response).properties.audience).toEqual({$ref:'#/$defs/FeedbackAudience'})
  expect(schema(response).required).toContain('audience')
  expect(operations[`feedback.${kind}.create`].request.optional).toContain('audience')
  for(const prefix of ['','admin.'])expect(operations[`${prefix}feedback.${kind}.list`].request.optional).toContain('audience')
  const command=operations[`admin.feedback.${kind}.audience`]
  expect(command.access).toBe('admin');expect(command.request.required).toEqual(['audience','expected_updated']);expect(command.response.schema).toBe(response)
  expect(path(command.operation,{id:'item'})).toBe(`/admin/feedback/${kind}/item/audience`)
  expect(operations[`admin.feedback.${kind}.visibility`].request.required).toEqual(['hidden'])
 }
})
test('feedback lists describe permitted Open audience counts without narrowing Mine',()=>{
 for(const name of ['BugReportList','IdeaList'])expect(schema(name).properties.audience_counts).toEqual({$ref:'#/$defs/FeedbackAudienceCounts'})
 expect(validate('FeedbackAudienceCounts',{public:4,team:2,founders:0})).toEqual([])
 expect(validate('FeedbackAudienceCounts',{public:-1}).length).toBeGreaterThan(0)
 expect(validate('FeedbackAudienceCounts',{owner:1}).length).toBeGreaterThan(0)
 for(const name of ['BugReportCounts','IdeaCounts'])expect(schema(name).description).toContain('across every audience')
})
