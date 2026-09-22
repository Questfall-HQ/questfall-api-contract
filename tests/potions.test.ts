import {expect,test} from 'bun:test';
import {validate} from '../src/validate.js';
import contract from '../contract.json';
const potion={id:'potion',kind:'potion',slot:'',wear:'',rarity:'d',level:0,weight:241,location:'inventory',location_ref:'',potion:{type:'stamina',restore_percent:90}};
test('potions are a distinct item kind without equipment levels or slots',()=>{
 expect(validate('Item',potion)).toEqual([]);
 for(const patch of [{level:1},{slot:'head'},{location:'equipped'},{potion:{type:'stamina',restore_percent:0}}])expect(validate('Item',{...potion,...patch}).length).toBeGreaterThan(0);
 const missing={...potion};delete missing.potion;expect(validate('Item',missing).length).toBeGreaterThan(0);
});
test('potion commands require verified ownership and explicit merge ingredient',()=>{
 const consume=contract.routes.find(r=>r.operation==='items.consume');const merge=contract.routes.find(r=>r.operation==='items.merge');
 expect(consume.access).toBe('verified');expect(merge.access).toBe('verified');expect(merge.request.required).toEqual(['itemId','ingredientId']);
 expect(contract.routes.find(r=>r.operation==='marketplace.list').request.optional).toContain('kind');
});
