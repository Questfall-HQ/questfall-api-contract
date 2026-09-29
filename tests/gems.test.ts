import {expect,test} from 'bun:test'
import {operations,validate} from '../src/index.js'

test('Gem participation and Claim require registration only; crafting uses existing authorization',()=>{
 expect(operations['gold.gems'].access).toBe('authenticated')
 expect(operations['gold.gems.claim'].access).toBe('authenticated')
 expect(operations['gold.gems.claim'].request.required).toEqual(['reward_id','idempotency_key'])
 for(const name of ['items.evolve','items.maximize']){
  expect(operations[name].access).toBe('verified')
  expect(operations[name].request.required).toContain('expected_updated')
  expect(operations[name].request.required).toContain('gemId')
 }
})
test('Gem Points are exact integer micro-units; public standings exclude private payment data',()=>{
 const row={user:{id:'buyer',name:'Buyer',avatar:{mode:'generated',version:1,seed:'buyer'},avatar_icon:null},rank:1,points:'9007199254740991',gold:1000,rarity:'f'}
 expect(validate('GemStanding',row)).toEqual([])
 for(const points of [1000000,'1.5','1e6','-1'])expect(validate('GemStanding',{...row,points}).length).toBeGreaterThan(0)
 expect(validate('GemStanding',{...row,user:{...row.user,recipient:'private wallet'}}).length).toBeGreaterThan(0)
})
test('Gem atoms have no level, equipped state, perks or clothing slot',()=>{
 const item={id:'gem',kind:'gem',slot:'',wear:'',rarity:'a',level:0,location:'inventory',location_ref:'',weight:3009,aspect:{value:{raw:0,effective:0,boost:0,boosted:false}},perks:[]}
 expect(validate('Item',item)).toEqual([])
 for(const extra of [{level:1},{location:'equipped'},{slot:'head'}])expect(validate('Item',{...item,...extra}).length).toBeGreaterThan(0)
})
