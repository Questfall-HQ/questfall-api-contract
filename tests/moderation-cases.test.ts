import {expect,test} from 'bun:test'
import {operations,validate,path,schema} from '../src/index.js'
import samples from './fixtures/moderation-cases.json'

test('personal cases are verified reads and preserve vote history and private media compatibility',()=>{
 expect(operations['moderation.cases'].access).toBe('verified')
 expect(operations['moderation.case'].access).toBe('verified')
 expect(operations['moderation.cases'].request.optional).toEqual(['search','kind','scope','limit','cursor'])
 expect(path('moderation.case',{case_id:'case/id'})).toBe('/moderation/cases/case%2Fid')
 expect(operations['moderation.history'].request.optional).toContain('scope')
 expect(operations['media.access'].request.optional).toContain('case_id')
})
test('strict personal case schemas cover every visual fixture and reject private extra fields',()=>{
 for(const sample of samples)expect(validate('ModerationCaseDetail',sample)).toEqual([])
 const detail=samples[0]
 expect(validate('ModerationCaseDetail',{...detail,committee:{users:['private']}}).length).toBeGreaterThan(0)
 expect(validate('ModerationCaseDetail',{...detail,target:{...detail.target,participant_id:'private'}}).length).toBeGreaterThan(0)
 expect(validate('ModerationCaseDetail',{...detail,scope:'pending'}).length).toBeGreaterThan(0)
 expect(schema('ModerationCaseDetail').additionalProperties).toBe(false)
 expect(validate('ModerationCaseDetail',{...detail,finance_total:-1000,target:{...detail.target,image:'/api/files/quests/id/cover.webp'}})).toEqual([])
 expect(validate('ModerationCaseDetail',{...detail,finance_total:'500'}).length).toBeGreaterThan(0)
})

test('History carries the saved personal voter independently of the frozen decision',()=>{
 const voter={id:'viewer',name:'Viewer',avatar:{mode:'generated',version:1,seed:'viewer'},avatar_icon:null,decision:'approve',level:32,trust:5.657,own:true}
 const item={case_id:'control',closed:1,target:{type:'quest',title:'Saved proof',image:'',avatar:null,avatar_icon:null},consensus:{outcome:'reject',total_votes:2,total_trust:7.69,groups:[],late:[]},voter}
 const history={items:[item],chains:[],next_cursor:''}
 expect(validate('ModerationHistory',history)).toEqual([])
 expect(validate('ModerationHistory',{...history,items:[{...item,voter:{...voter,trust:0}}]}).length).toBeGreaterThan(0)
 expect(validate('ModerationHistory',{...history,items:[{...item,voter:{...voter,source_case_id:'private'}}]}).length).toBeGreaterThan(0)
})
