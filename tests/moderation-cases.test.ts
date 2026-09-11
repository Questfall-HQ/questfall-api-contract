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
})
