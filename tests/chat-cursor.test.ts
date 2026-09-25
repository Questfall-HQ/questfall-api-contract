import {expect,test} from 'bun:test'
import {validate} from '../src/index.js'

test('chat exposes an exact read cursor and a boolean unread signal',()=>{
 const cursor={id:'message123',created:1750000000000}
 const status={has_unread:true,read_cursor:cursor,attention_unread:2,online:5,frequent:[]}
 expect(validate('ChatStatus',status)).toEqual([])
 expect(validate('ChatStatus',{...status,has_unread:false,read_cursor:null})).toEqual([])
 expect(validate('ChatReadStatus',{has_unread:false,read_cursor:cursor})).toEqual([])
 expect(validate('ChatStatus',{...status,unread:2}).length).toBeGreaterThan(0)
 expect(validate('ChatReadStatus',{has_unread:0,read_cursor:cursor}).length).toBeGreaterThan(0)
})
