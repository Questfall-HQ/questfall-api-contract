import {expect,test} from 'bun:test'
import {validate,operations} from '../src/index.js'

test('attribute reset quotes describe the exact payment and optional legacy-safe precondition',()=>{
  expect(operations['character.resetQuote'].access).toBe('verified')
  expect(operations['character.reset'].request.optional).toContain('quote_token')
  const quote={gold:50,balance:100,league:2,free_reason:'',points:20,token:'a'.repeat(64),enabled:true,reason:''}
  expect(validate('AttributeResetQuote',quote)).toEqual([])
  for(const free_reason of ['beginner','new_league']) expect(validate('AttributeResetQuote',{...quote,gold:0,free_reason})).toEqual([])
  for(const extra of [{gold:-1},{balance:-1},{league:1.5},{token:''},{free_reason:'daily'},{points:-2}]) expect(validate('AttributeResetQuote',{...quote,...extra}).length).toBeGreaterThan(0)
})
