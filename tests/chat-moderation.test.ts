import {test, expect} from 'bun:test'
import {contract, operations, path, validate} from '../src/index.js'

const author = {id:'user123',name:'Questfall user',avatar:{mode:'generated',seed:'user123'},avatar_icon:null,level:1,moderation_status:'active',role:'team',admin:false,team:true}

test('chat marks team members and exposes moderation only to admins', () => {
	const status = {has_unread:false,read_cursor:null,attention_unread:0,online:0,frequent:[],can_mention_everyone:true,can_moderate_chat:true,chat_ban:null}
	expect(validate('ChatStatus',status)).toEqual([])
	expect(validate('ChatStatus',{...status,chat_ban:{until:null}})).toEqual([])
	expect(validate('ChatStatus',{...status,chat_ban:{until:0}}).length).toBeGreaterThan(0)
	const message = {id:'message123',user:'user123',author,text:'Team update',mentions:[],images:[],reply:null,reactions:[],created:1790000000000,edited:1790000001000}
	expect(validate('ChatMessage',message)).toEqual([])
	expect(validate('ChatAuthor',{...author,role:'team',admin:true})).toEqual([])
	expect(validate('ChatAuthor',{...author,role:'owner'})).toEqual([])
	expect(validate('ChatAuthor',{...author,role:null,team:false})).toEqual([])
	expect(validate('ChatAuthor',{...author,role:'user'}).length).toBeGreaterThan(0)
	expect(validate('ChatAuthor',{...author,role:'moderator'}).length).toBeGreaterThan(0)
	expect(validate('ChatAuthor',{...author,admin:'yes'}).length).toBeGreaterThan(0)
	const deletion = contract.routes.find(route => route.operation === 'admin.chat.deleteMessage')
	expect(deletion?.path).toBe('/admin/chat/messages/delete')
	expect(deletion?.access).toBe('admin')
	expect(deletion?.request.optional).toEqual(['duration','reason'])
	expect(validate('ChatDeleteResult',{id:message.id})).toEqual([])
	for (const route of contract.routes.filter(route=>route.path.startsWith('/admin/chat/'))) expect(route.access).toBe('admin')
	expect(contract.routes.some(route=>route.path.startsWith('/admin/chat/reports'))).toBe(false)
})

test('retains the deployed verified chat reporting protocol until clients migrate', () => {
	const report = operations['chat.report']
	expect(path('chat.report')).toBe('/chat/reports')
	expect(report.method).toBe('POST')
	expect(report.access).toBe('verified')
	expect(report.request).toEqual({transport:'body',params:[],required:['message'],optional:['reason']})
	expect(report.response.schema).toBe('ChatReportReceipt')
	for (const status of ['open','dismissed','banned']) {
		expect(validate('ChatReportReceipt',{id:'saved-report',status})).toEqual([])
	}
	for (const value of [{id:'',status:'open'},{id:'saved-report',status:'resolved'},{id:'saved-report'},{id:'saved-report',status:'open',snapshot:[]}]) {
		expect(validate('ChatReportReceipt',value).length).toBeGreaterThan(0)
	}
})

test('chat editing keeps its revision request', () => {
	const route = contract.routes.find(route => route.operation === 'chat.update')
	expect(route?.path).toBe('/chat/messages/edit')
	expect(route?.request.required).toEqual(['id','text','mentions','edited'])
	const removal = contract.routes.find(route => route.operation === 'chat.remove')
	expect(removal?.path).toBe('/chat/messages/delete')
	expect(removal?.access).toBe('verified')
	expect(removal?.request.required).toEqual(['id'])
	expect(removal?.response.schema).toBe('ChatDeleteResult')
})
