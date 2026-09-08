import {expect, test} from 'bun:test'
import contract from '../contract.json'
import {validate} from '../src/validate.js'

const image = {type:'image',attrs:{media_id:'privateimage001',caption:'Castle'}}
const doc = {version:1,content:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Reach the castle',marks:[{type:'bold'}]}]},image]}}

test('quest reports from initial moderation address the private assignment and retain the legacy quest route',()=>{
 const assigned=contract.routes.find(r=>r.operation==='moderation.quests.report')
 expect(assigned?.path).toBe('/moderation/quests/report')
 expect(assigned?.request.required).toEqual(['assignment_id','category','explanation','moderation_version'])
 expect(assigned?.response.schema).toBe('ModerationMutation')
 expect(contract.routes.find(r=>r.operation==='quests.report')?.request.required).toEqual(['id'])
})

test('supports Screenshot and explicit content negotiation on the affected surfaces',()=>{
 expect(validate('QuestType','screenshot')).toEqual([])
 expect(validate('ModerationCaseKind','screenshot')).toEqual([])
 for(const path of ['/quests/feed','/quests/feed/changes','/quests/feed/viewer','/quests/{id}','/quests/complete','/quests/rating-assignments/claim','/moderation/summary','/moderation/assignments/claim','/moderation/votes','/author-spaces/load','/spaces/load','/author-spaces/quests/save']){
  expect(contract.routes.find(r=>r.path===path)?.request.optional).toContain('content_version')
 }
})

test('versioned instructions contain media references and reject URLs, binary and unknown formats',()=>{
 expect(validate('QuestContentDocument',doc)).toEqual([])
 for(const node of [{...image,attrs:{...image.attrs,src:'https://example.com'}},{...image,attrs:{media_id:'data:image/png;base64,x',caption:''}},{type:'image'}, {type:'script'}, {type:'text',text:'Not a block'}, {type:'listItem',content:[{type:'paragraph'}]}, {type:'bulletList',content:[{type:'listItem',content:[image]}]}]){
  expect(validate('QuestContentDocument',{...doc,content:{type:'doc',content:[node]}}).length).toBeGreaterThan(0)
 }
 expect(validate('QuestContentDocument',{...doc,version:2}).length).toBeGreaterThan(0)
})

test('shared evidence bounds are five; screenshot count is an integer from one through five',()=>{
 for(const count of [1,5])expect(validate('QuestAuthorConfig',{screenshot_count:count,player_document:doc,moderator_document:doc})).toEqual([])
 for(const count of [0,6,1.5])expect(validate('QuestAuthorConfig',{screenshot_count:count}).length).toBeGreaterThan(0)
 expect(validate('QuestEvidence',{proof_media_ids:['a','b','c','d','e']})).toEqual([])
 for(const ids of [[],['a','a'],['a','b','c','d','e','f']])expect(validate('QuestEvidence',{proof_media_ids:ids}).length).toBeGreaterThan(0)
})
