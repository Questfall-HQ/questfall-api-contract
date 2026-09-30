import {expect,test} from 'bun:test'
import {operations,schemas,validate} from '../src/index.js'

test('reroll requires an owned item, Dice, selected perk and concurrency controls',()=>{
 const route=operations['items.reroll']
 expect(route.method).toBe('POST')
 expect(route.path).toBe('/items/reroll')
 expect(route.access).toBe('verified')
 expect(route.request.required).toEqual(expect.arrayContaining(['itemId','diceId','perk_index','expected_updated','idempotency_key']))
})

test('Dice are distinct E–A atoms without clothing properties',()=>{
 const item={id:'die',kind:'dice',slot:'',wear:'',rarity:'e',level:0,location:'inventory',location_ref:'',weight:373,aspect:{value:{raw:0,effective:0,boost:0,boosted:false}},perks:[]}
 expect(validate('Item',item)).toEqual([])
 for(const extra of [{rarity:'f'},{level:1},{location:'equipped'},{slot:'head'},{perks:[{}]}])
  expect(validate('Item',{...item,...extra}).length).toBeGreaterThan(0)
})

test('reroll quote and receipt expose the charged Essence cost',()=>{
 const quote=schemas.$defs.CraftQuote.properties.quote.properties.reroll
 const receipt=schemas.$defs.PlayerResult.properties.reroll
 expect(quote.required).toContain('cost')
 expect(quote.properties.cost).toEqual({type:'integer',minimum:0})
 expect(receipt.required).toContain('cost')
 expect(receipt.properties.cost).toEqual({type:'integer',minimum:0})
})
