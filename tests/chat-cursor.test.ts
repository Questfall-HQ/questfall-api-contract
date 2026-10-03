import {expect,test} from 'bun:test'
import {validate} from '../src/index.js'

test('chat exposes an exact read cursor and a boolean unread signal',()=>{
 const cursor={id:'message123',created:1750000000000}
 const status={has_unread:true,read_cursor:cursor,attention_unread:2,online:5,frequent:[],can_mention_everyone:false,chat_ban:null}
 expect(validate('ChatStatus',status)).toEqual([])
 expect(validate('ChatStatus',{...status,has_unread:false,read_cursor:null})).toEqual([])
 expect(validate('ChatStatus',{...status,can_mention_everyone:true})).toEqual([])
 expect(validate('ChatReadStatus',{has_unread:false,read_cursor:cursor})).toEqual([])
 expect(validate('ChatStatus',{...status,unread:2}).length).toBeGreaterThan(0)
 expect(validate('ChatReadStatus',{has_unread:0,read_cursor:cursor}).length).toBeGreaterThan(0)
})

test('chat returns up to twenty-one recent reaction emoji',()=>{
 const frequent=Array.from({length:21},(_,index)=>String(index))
 const status={has_unread:false,read_cursor:null,attention_unread:0,online:0,frequent,can_mention_everyone:false,chat_ban:null}
 const reaction={message:'message123',reactions:[],frequent,added:true,events:[]}
 expect(validate('ChatStatus',status)).toEqual([])
 expect(validate('ChatReactionResult',reaction)).toEqual([])
 expect(validate('ChatStatus',{...status,frequent:[...frequent,'extra']}).length).toBeGreaterThan(0)
})


test('chat attention exposes a nullable message target and a bounded unread counter',()=>{
 expect(validate('ChatAttentionTarget',{message:'message123',attention_unread:2})).toEqual([])
 expect(validate('ChatAttentionTarget',{message:null,attention_unread:0})).toEqual([])
 expect(validate('ChatAttentionTarget',{message:'',attention_unread:1}).length).toBeGreaterThan(0)
 expect(validate('ChatAttentionTarget',{message:'message123',attention_unread:101}).length).toBeGreaterThan(0)
})

test('chat pages optionally identify a missing newer tail for around windows',()=>{
 const page={items:[],next:null}
 expect(validate('ChatMessagePage',page)).toEqual([])
 expect(validate('ChatMessagePage',{...page,has_newer:true})).toEqual([])
 expect(validate('ChatMessagePage',{...page,has_newer:false})).toEqual([])
 expect(validate('ChatMessagePage',{...page,has_newer:1}).length).toBeGreaterThan(0)
})
