import {expect,test} from 'bun:test';
import {validate} from '../src/validate.js';
import fixtures from './fixtures/rpg-character.json';

// Recorded from helpers/player.view.character, using synthetic empty, equipped,
// overlevel Character states; no player data or balance formulas.
for (const {name,value} of fixtures) test(`public Character accepts server snapshot: ${name}`,()=>{
 expect(validate('CharacterState',value)).toEqual([]);
});
const sample=fixtures.find(row=>row.name==='equipped').value;
for (const [group,system] of Object.entries(sample.systems)) {
 if (group==='grants') continue;
 test(`${group} requires its published results and rejects non-numeric values`,()=>{
  const missingGroup=structuredClone(sample);delete missingGroup.systems[group];
  expect(validate('CharacterState',missingGroup).length).toBeGreaterThan(0);
  for (const [name,leaf] of Object.entries(system)) {
   const missing=structuredClone(sample);delete missing.systems[group][name];
   expect(validate('CharacterState',missing).length).toBeGreaterThan(0);
   function check(fields,path){
    for(const [key,value] of Object.entries(fields)) {
     if(typeof value==='object'){check(value,[...path,key]);continue;}
     for(const invalid of ['12',null,{},[],NaN,Infinity,undefined]) {
      const changed=structuredClone(sample);
      const parent=path.reduce((node,part)=>node[part],changed.systems[group][name]);
      if(invalid===undefined)delete parent[key];else parent[key]=invalid;
      expect(validate('CharacterState',changed).length).toBeGreaterThan(0);
     }
    }
   }
   check(leaf,[]);
  }
 });
}
test('equipment metadata and nested values reject malformed data',()=>{
 const original=sample.equipment.slots.head;
 const aspect=original.aspect,perk=original.perks[0];
 const invalid=[
  {level:'50'},{level:0},{weight:-1},{kind:'potion'},{rarity:'z'},
  {aspect:{...aspect,value:{raw:1,effective:'2',boost:1,boosted:true}}},
  {aspect:{...aspect,value:{raw:1,effective:2,boost:1}}},
  {aspect:{...aspect,value:{raw:1,effective:2,boost:1,boosted:'yes'}}},
  {perks:'invalid'}, {perks:[{}]}, {perks:[{...perk,type:'mystery'}]},
  {perks:[{...perk,target:42}]}, {perks:[{...perk,condition:{slot:3}}]},
  {perks:[{...perk,boosters:[{}]}]}, {perks:[{...perk,roll:'0.5'}]},
 ];
 for(const patch of invalid)expect(validate('EquippedItem',{...original,...patch}).length).toBeGreaterThan(0);
});
test('dynamic grants, multipliers, slots and boost links validate every entry',()=>{
 const resolved={raw:2,effective:1,boost:-1,boosted:true,power:.5};
 for(const key of ['grant:future:bonus','constructor','toString','__proto__']) {
  expect(validate('CharacterSystems',{...sample.systems,grants:{[key]:1.25}})).toEqual([]);
  expect(validate('EquipmentValue',{...resolved,multipliers:{[key]:.5}})).toEqual([]);
  expect(validate('CharacterEquipment',{slots:{},weight:[0,0,0],links:{[key]:['head:perk:1']}})).toEqual([]);
  for(const invalid of ['1',{},[],null,NaN,Infinity]) {
   expect(validate('CharacterSystems',{...sample.systems,grants:{[key]:invalid}}).length).toBeGreaterThan(0);
   expect(validate('EquipmentValue',{...resolved,multipliers:{[key]:invalid}}).length).toBeGreaterThan(0);
  }
  for(const invalid of ['head:perk:1',[1],{},null])expect(validate('CharacterEquipment',{slots:{},weight:[0,0,0],links:{[key]:invalid}}).length).toBeGreaterThan(0);
  expect(validate('CharacterEquipment',{slots:{[key]:3},weight:[0,0,0]}).length).toBeGreaterThan(0);
 }
});
test('incomplete historical gear is rejected while additive fields remain supported',()=>{
 for(const item of [{id:'legacy'},{aspect:{value:2},perks:[{kind:'grant',target:'mining',filter:{attr:'mining'},value:1}]},{set:null,origin:null,perks:[{type:'trait_terminal',value:1,roll:null}]}])expect(validate('EquippedItem',item).length).toBeGreaterThan(0);
 const value=structuredClone(sample);
 value.systems.future={newRule:'opaque until published'};
 value.systems.mining.loot.future='additive';
 value.equipment.slots.head.future=true;
 expect(validate('CharacterState',value)).toEqual([]);
});


test('public clothing requires complete metadata and resolved values in every item surface',()=>{
 const item=sample.equipment.slots.head;
 for(const schema of ['Item','EquippedItem']) {
  expect(validate(schema,item)).toEqual([]);
  for(const field of ['id','kind','slot','wear','rarity','level','location','location_ref','weight','aspect','perks']) {
   const partial=structuredClone(item);delete partial[field];
   expect(validate(schema,partial).some(error=>error.includes(field))).toBe(true);
  }
  for(const scalar of [0,12.5,'12.5',null]) {
   expect(validate(schema,{...item,aspect:{...item.aspect,value:scalar}}).length).toBeGreaterThan(0);
   expect(validate(schema,{...item,perks:[{...item.perks[0],value:scalar}]}).length).toBeGreaterThan(0);
  }
 }
 expect(validate('EquipmentAspect',{value:item.aspect.value}).length).toBeGreaterThan(0);
 const perk=item.perks[0];
 for(const field of ['type','effect','target','condition','value']) {
  const partial={...perk};delete partial[field];
  expect(validate('EquipmentPerk',partial).some(error=>error.includes(field))).toBe(true);
 }
 expect(validate('EquipmentPerk',{...perk,target:'mining'}).length).toBeGreaterThan(0);
 expect(validate('EquipmentValue',{raw:0,effective:0,boost:0,boosted:false})).toEqual([]);
 expect(validate('EquipmentValue',{raw:10,effective:2,boost:-8,boosted:true,power:.2})).toEqual([]);
});
