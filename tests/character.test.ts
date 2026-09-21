import {expect,test} from 'bun:test';
import {validate} from '../src/validate.js';
const names=['inventory','mining','crafting','trading','stamina','luck'];
const traits=Object.fromEntries(names.map((key,i)=>[key,[i+1,i+1.5,2.5,3.5,4.5,5.5,6.5]]));
const points={total:48,used:21,free:27,per_level:6};
const stamina={current:1000,max:1000,recovery:1.25,updated:1789992000000,percent:100,quest_cost:32};
test('Character traits describe all six exact compact rows with integral invested points',()=>{
 expect(validate('CharacterTraits',traits)).toEqual([]);
 for(const row of [[],{},[1,2,3],[1,2,3,4,5,6,7,8],[-1,2,3,4,5,6,7],[1.5,2,3,4,5,6,7],[1,2,3,4,5,6,'7'],[1,2,3,4,5,6,null],[1,2,3,4,5,6,Infinity]]) {
  expect(validate('CharacterTraits',{...traits,mining:row}).some(error=>error.includes('mining'))).toBe(true);
 }
 const missing={...traits};delete missing.stamina;
 expect(validate('CharacterTraits',missing).length).toBeGreaterThan(0);
});
test('allocation and Stamina require complete named values, while overflow and fractional recovery are valid',()=>{
 expect(validate('CharacterPoints',points)).toEqual([]);
 expect(validate('Stamina',stamina)).toEqual([]);
 expect(validate('Stamina',{...stamina,current:25000})).toEqual([]);
 for(const [schema,source] of [['CharacterPoints',points],['Stamina',stamina]] as const) {
  for(const key of Object.keys(source)) {
   const partial={...source};delete partial[key];
   expect(validate(schema,partial).length).toBeGreaterThan(0);
  }
 }
 for(const patch of [{free:-1},{used:1.5},{per_level:0}])expect(validate('CharacterPoints',{...points,...patch}).length).toBeGreaterThan(0);
 for(const patch of [{current:-1},{max:0},{recovery:-1},{quest_cost:1.5},{updated:'today'},{percent:101}])expect(validate('Stamina',{...stamina,...patch}).length).toBeGreaterThan(0);
});

test('equipment slots and its three weights reject the malformed shapes found by the audit',()=>{
 expect(validate('CharacterEquipment',{slots:{head:{id:'legacy'}},weight:[250,200,50],links:{}})).toEqual([]);
 for(const patch of [{slots:42},{slots:{head:42}},{weight:'bad'},{weight:[0,0]},{weight:[0,0,'bad']},{weight:[0,-1,0]}])expect(validate('CharacterEquipment',{slots:{},weight:[0,0,0],...patch}).length).toBeGreaterThan(0);
});
