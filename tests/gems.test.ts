import {expect,test} from 'bun:test'
import {operations,validate} from '../src/index.js'

test('Gem rules accept all-buyer halves and preserve historical weighted snapshots',()=>{
 const halves={version:1,distribution:'halves',share:1,root:0,bonus:.1,thresholds:[1,2,4,8,16,32]}
 const historical={version:1,share:.1,root:.8,bonus:.1,thresholds:[2,3,9,27,81,243]}
 expect(validate('GemRules',halves)).toEqual([])
 expect(validate('GemRules',historical)).toEqual([])
 expect(validate('GemRules',{...halves,distribution:'random'}).length).toBeGreaterThan(0)
 expect(validate('GemRules',{...halves,thresholds:[0,2,4,8,16,32]}).length).toBeGreaterThan(0)
})

test('Gem rules expose per-rarity exact shares and nullable derived thresholds',()=>{
 const shares=Array.from({length:6},(_,i)=>i===5?{numerator:1,denominator:1}:{numerator:2,denominator:3})
 const rules={version:2,distribution:'shares',share:1,root:0,bonus:.1,shares,thresholds:[1,3,9,27,81,243]}
 expect(validate('GemRules',rules)).toEqual([])
 expect(validate('GemRules',{...rules,thresholds:[1,null,null,null,null,null]})).toEqual([])
 expect(validate('GemRules',{...rules,shares:shares.slice(1)}).length).toBeGreaterThan(0)
 expect(validate('GemRules',{...rules,shares:[{numerator:-1,denominator:3},...shares.slice(1)]}).length).toBeGreaterThan(0)
 expect(validate('GemRules',{...rules,thresholds:[0,null,null,null,null,null]}).length).toBeGreaterThan(0)
})

test('Gem rules support an optional exact no-reward share while older snapshots remain valid',()=>{
 const rules={version:3,distribution:'shares',share:1,root:0,bonus:.1,shares:Array.from({length:6},(_,i)=>i===5?{numerator:1,denominator:1}:{numerator:2,denominator:3}),excluded:{numerator:1,denominator:5},thresholds:[2,4,12,34,102,304]}
 expect(validate('GemRules',rules)).toEqual([])
 expect(validate('GemRules',{...rules,excluded:{numerator:1,denominator:1},thresholds:[null,null,null,null,null,null]})).toEqual([])
 for(const excluded of [null,{numerator:-1,denominator:100},{numerator:1,denominator:0},{numerator:1.5,denominator:100},{numerator:1,denominator:5,extra:true}])expect(validate('GemRules',{...rules,excluded}).length).toBeGreaterThan(0)
 const {excluded,...saved}=rules
 expect(validate('GemRules',saved)).toEqual([])
})

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

test('Gem merge quotes carry five inputs, an exact fee and the next Item while potion merging stays separate',()=>{
 const route=operations['items.gemmerge']
 expect(route.path).toBe('/items/gems/merge')
 expect(route.request.required).toEqual(['itemId','ingredient_ids','expected_updated','expected_cost','idempotency_key'])
 expect(operations['items.merge'].request.required).toEqual(['itemId','ingredientId'])
 const item={id:'gem',kind:'gem',slot:'',wear:'',rarity:'e',level:0,location:'inventory',location_ref:'',weight:373,aspect:{value:{raw:0,effective:0,boost:0,boosted:false}},perks:[]}
 const merge={enabled:true,reason:'',cost:10,base_cost:10,inputs:5,ingredient_ids:['one','two','three','four'],available:5,next_rarity:'e',after:item}
 expect(validate('CraftQuote',{quote:{item,revision:'revision',merge}})).toEqual([])
 for(const wrong of [{inputs:1},{inputs:101},{ingredient_ids:['one','one','three','four']},{ingredient_ids:Array.from({length:100},(_,i)=>String(i))},{cost:1.5},{cost:-1}])expect(validate('GemMerge',{...merge,...wrong}).length).toBeGreaterThan(0)
 expect(validate('GemMerge',{...merge,enabled:false,reason:'Mythical is the highest rarity',ingredient_ids:[],next_rarity:'',after:null})).toEqual([])
})

test('Max Out quotes the complete Perfect item and no longer asks for a perk index',()=>{
 expect(operations['items.maximize'].request.required).not.toContain('perk_index')
 const item={id:'clothing',kind:'clothing',slot:'head',wear:'helmet',rarity:'f',level:1,location:'inventory',location_ref:'',weight:100,perfect:true,aspect:{id:'head:aspect:trading',step:1,value:{raw:1,effective:1,boost:0,boosted:false}},perks:[]}
 const quote={enabled:true,reason:'',gem_id:'mythical',cost:500,after:item}
 expect(validate('GemMaximization',quote)).toEqual([])
 expect(validate('Item',{...item,perfect:'true'}).length).toBeGreaterThan(0)
 for(const cost of [0,10,499,501])expect(validate('GemMaximization',{...quote,cost}).length).toBeGreaterThan(0)
 expect(validate('GemMaximization',{enabled:true,reason:'',gem_id:'mythical',perks:[]}).length).toBeGreaterThan(0)
 expect(validate('GemMaximization',{enabled:false,reason:'Review historical item',gem_id:'',cost:500,after:null})).toEqual([])
 const {perfect,...legacy}=item
 expect(validate('Item',legacy)).toEqual([])
})
