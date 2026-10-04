import {expect,test} from 'bun:test'
import {operations,validate} from '../src/index.js'

test('chat search exposes verified query pages with an opaque position cursor',()=>{
 expect(operations['chat.search'].access).toBe('verified')
 expect(operations['chat.search'].request.required).toEqual(['q'])
 expect(validate('ChatSearchPage',{items:[],next:null})).toEqual([])
 expect(validate('ChatSearchPage',{items:[],next:'1750000000000:messagecursor01'})).toEqual([])
 for(const next of ['', 'messagecursor01', '0:messagecursor01', 1]) {
  expect(validate('ChatSearchPage',{items:[],next}).length).toBeGreaterThan(0)
 }
 expect(validate('ChatSearchPage',{items:[],next:null,has_newer:true}).length).toBeGreaterThan(0)
})
