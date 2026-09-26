import {test, expect} from 'bun:test'
import {contract, validate} from '../src/index.js'

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
	expect(contract.routes.some(route=>route.path.includes('/chat/reports'))).toBe(false)
})

test('chat editing keeps its revision request', () => {
	const route = contract.routes.find(route => route.operation === 'chat.update')
	expect(route?.path).toBe('/chat/messages/edit')
	expect(route?.request.required).toEqual(['id','text','mentions','edited'])
})
