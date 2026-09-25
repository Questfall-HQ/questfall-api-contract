import {test, expect} from 'bun:test'
import {contract, validate} from '../src/index.js'

const author = {id:'user123',name:'Questfall user',avatar:{mode:'generated',seed:'user123'},avatar_icon:null,level:1,moderation_status:'restricted'}

test('chat ban is a writing restriction with a nullable permanent expiry', () => {
	const base = {has_unread:false,read_cursor:null,attention_unread:0,online:0,frequent:[],can_mention_everyone:false}
	expect(validate('ChatStatus',{...base,chat_ban:null})).toEqual([])
	expect(validate('ChatStatus',{...base,chat_ban:{until:null}})).toEqual([])
	expect(validate('ChatStatus',{...base,chat_ban:{until:1790000000000}})).toEqual([])
	expect(validate('ChatStatus',{...base,chat_ban:{until:0}}).length).toBeGreaterThan(0)
})

test('report evidence stays bounded and private to admin routes', () => {
	const item = {id:'report123',message:'message123',reporter:author,subject:author,reason:'Abuse',status:'open',created:1790000000000,resolved_at:0}
	const message = {id:'message123',user:'user123',author,text:'Message',images:[],created:1790000000000}
	expect(validate('ChatReportDetail',{...item,snapshot:Array.from({length:21},()=>message),resolution:'',resolved_by:'',ban:null})).toEqual([])
	expect(validate('ChatReportDetail',{...item,snapshot:Array.from({length:22},()=>message),resolution:'',resolved_by:'',ban:null}).length).toBeGreaterThan(0)
	for (const route of contract.routes.filter(route=>route.path.startsWith('/admin/chat/'))) expect(route.access).toBe('admin')
})

test('chat edit response marks revisions and admin detail may show previous text', () => {
	const message = {id:'message123',user:'user123',author,text:'Revised',mentions:[],images:[],reply:null,reactions:[],created:1790000000000,edited:1790000001000}
	expect(validate('ChatMessage',message)).toEqual([])
	const route = contract.routes.find(route => route.operation === 'chat.update')
	expect(route?.path).toBe('/chat/messages/edit')
	expect(route?.request.required).toEqual(['id','text','mentions','edited'])
	const report = {id:'report123',message:'message123',reporter:author,subject:author,reason:'Abuse',status:'open',created:1790000000000,resolved_at:0,snapshot:[],edits:[{text:'Original',created:1790000001000}],edits_more:false,resolution:'',resolved_by:'',ban:null}
	expect(validate('ChatReportDetail',report)).toEqual([])
})
