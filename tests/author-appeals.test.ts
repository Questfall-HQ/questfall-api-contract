import {test,expect} from 'bun:test'
import {operations,validate} from '../src/index.js'
const decision={id:'decision',mode:'appeal',level:1,status:'resolved',outcome:'reject',created:1,resolved:2,deadline:3,appellant:true,stake:1000,actor:'self',voting:{reverse:75,uphold:25,final:true}}
test('author case is scoped and legacy appeal submissions remain supported',()=>{
 expect(operations['authorSpaces.quests.case'].request.required).toEqual(['id','root_case_id'])
 expect(operations['authorSpaces.quests.case'].access).toBe('verified')
 expect(operations['moderation.cases.appeal'].request.required).toEqual(['case_id'])
 expect(operations['moderation.cases.appeal'].request.optional).toEqual(expect.arrayContaining(['response_version','idempotency_key']))
})
test('case decisions accept aggregate votes and reject private ballot data',()=>{
 expect(validate('AuthorCaseDecision',decision)).toEqual([])
 expect(validate('AuthorCaseDecision',{...decision,voting:null})).toEqual([])
 for(const extra of [{votes:[]},{committee:{}},{appellant_id:'someone'}])expect(validate('AuthorCaseDecision',{...decision,...extra}).length).toBeGreaterThan(0)
 expect(validate('AuthorCaseDecision',{...decision,voting:{...decision.voting,reverse:101}}).length).toBeGreaterThan(0)
})
test('historical money is explicitly wallet-scoped and corrections may be negative',()=>{
 const change={id:'entry',wallet:'personal',kind:'bonus',label:'Previous appeal bonus reversed',amount:-1000,appeal_id:'earlier'}
 expect(validate('AuthorCaseChange',change)).toEqual([])
 expect(validate('AuthorCaseChange',{...change,wallet:'combined'}).length).toBeGreaterThan(0)
 expect(validate('AuthorCaseChange',{...change,user_id:'other'}).length).toBeGreaterThan(0)
})
