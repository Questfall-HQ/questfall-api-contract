import {expect, test} from 'bun:test'
import contract from '../contract.json'
import {validate} from '../src/validate.js'

const image = {type:'image',attrs:{media_id:'privateimage001',caption:'Castle'}}
const doc = {version:1,content:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Reach the castle',marks:[{type:'bold'}]}]},image]}}

test('v9 publishes all nine independent evidence and identity combinations without preview state',()=>{
 for(const verification of ['screenshot','url','confirmation'])for(const kind of ['account','wallet','questfall']){
  const identity={kind,instructions:kind==='questfall'?'Hold a sign with your name.':''}
  for(const shape of ['QuestAuthorConfig','QuestPublicConfig'])expect(validate(shape,{verification,identity,platform_domain:kind==='questfall'?'':'example.com'})).toEqual([])
 }
 for(const identity of [{kind:'unknown',instructions:''},{kind:'wallet',instructions:'x'.repeat(501)},{kind:'account',instructions:'',conflict:true}])expect(validate('QuestIdentity',identity).length).toBeGreaterThan(0)
})

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
 expect(validate('QuestEvidence',{proof_media_ids:[],platform_account:'player'})).toEqual([])
 for(const ids of [['a','a'],['a','b','c','d','e','f']])expect(validate('QuestEvidence',{proof_media_ids:ids}).length).toBeGreaterThan(0)
})


test('unified Action supports two verification methods and both platform link modes',()=>{
 expect(validate('ModerationCaseKind','platform')).toEqual([])
 for(const verification of ['screenshot','platform'])for(const link_mode of ['shared','individual']){
  expect(validate('QuestAuthorConfig',{verification,link_mode})).toEqual([])
  expect(validate('QuestPublicConfig',{verification,link_mode,target_links:[],allowed_domains:[]})).toEqual([])
 }
 expect(validate('QuestAuthorConfig',{verification:'automatic'}).length).toBeGreaterThan(0)
 expect(validate('QuestAuthorConfig',{link_mode:'unknown'}).length).toBeGreaterThan(0)
})


test('platform identity config is additive and domain resolution includes identity scope',()=>{
 for(const platform_domain of ['youtube.com','']) {
  expect(validate('QuestAuthorConfig',{verification:'screenshot',platform_domain})).toEqual([])
  expect(validate('QuestPublicConfig',{verification:'screenshot',platform_domain,platform_favicon:{state:'missing',url:'',checked:0}})).toEqual([])
 }
 expect(validate('QuestAuthorConfig',{platform_domain:42}).length).toBeGreaterThan(0)
 expect(validate('QuestAuthorConfig',{platform_domain:'x'.repeat(254)}).length).toBeGreaterThan(0)
 expect(validate('EffectiveDomainTrust',{host:'youtu.be',platform:'youtube.com',favicon:{state:'missing',url:'',checked:0},state:'safe',matched_rule:'youtu.be',revision:1,warning:false,blocked:false})).toEqual([])
})

test('v4 supports community checks and optionally restricted result URLs alongside legacy platform modes',()=>{
 for(const verification of ['url','community'])for(const platform_domain of ['','discord.com']){
  expect(validate('QuestAuthorConfig',{verification,platform_domain})).toEqual([])
  expect(validate('QuestPublicConfig',{verification,platform_domain,target_links:[]})).toEqual([])
 }
 expect(validate('QuestAuthorConfig',{verification:'url-and-screenshots'}).length).toBeGreaterThan(0)
 for(const verification of ['url','community','confirmation']){
  const assignment={id:'review',kind:'platform',verification,reportable:true,instructions:'Check completion',proof_url:verification==='url'?'https://unexpected.example/result':'',proof_media:[],account:verification==='community'?'member':'',platform:verification==='community'?'discord.com':'',progress:{stage:'judging',status:'open',consensus_percent:0},pricing:{window_revision:1,starts:0,ends:600000,rate_bps:10000,reward:20,penalty:-40,bypass_cost:10,witness_cost:0},created:0,expires:600000}
  expect(validate('ModerationAssignment',assignment)).toEqual([])
  expect(validate('ModerationAssignment',{...assignment,kind:'quest_initial',phase:'completion'})).toEqual([])
 }
})


test('v5 adds confirmation without changing earlier Action evidence modes',()=>{
 for(const schema of ['QuestAuthorConfig','QuestPublicConfig']){
  expect(validate(schema,{verification:'confirmation',platform_domain:''})).toEqual([])
  expect(validate(schema,{verification:'screenshot',platform_domain:'',screenshot_count:1})).toEqual([])
  expect(validate(schema,{verification:'platform',link_mode:'shared',platform_domain:'discord.com'})).toEqual([])
 }
 expect(validate('QuestEvidence',{proof_media_ids:[]})).toEqual([])
})


test('v6 confirmation carries a canonical service and the existing username evidence field',()=>{
 for(const schema of ['QuestAuthorConfig','QuestPublicConfig']){
  expect(validate(schema,{verification:'confirmation',platform_domain:'discord.com'})).toEqual([])
 }
 expect(validate('QuestEvidence',{platform_account:'@petr',proof_media_ids:[]})).toEqual([])
})
