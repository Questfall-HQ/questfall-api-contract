import {expect,test} from 'bun:test';
import {validate,operations} from '../src/index.js';
const parameters = {quest_cost:48,base_reserve:2000,reserve_root:200,reserve_power:8,reserve_exponent:.8,recovery_minutes:240,overflow_decay_rate:.5,efficiency_floor:.1,efficiency_curve:14,reduction_limit:90,relief_power:25,absorption_limit:250,absorption_curve:14,mastery:{efficiency:1,absorption:5,reserve:2,recovery:2,relief:1},potions:{chance:10,tiers:Object.fromEntries(['f','e','d','c','b','a'].map(rarity=>[rarity,{restore_percent:15,weight:100,drop_weight:10,merge_fee:20}]))}};
const starter = {current:2208,max:2208,recovery:9.2,quest_cost:48,updated:0,percent:100,decay_per_hour:1104,potion_reference:40000};
test('balance is public and data-driven, without fixed potion strengths in the contract',()=>{
 expect(operations['stamina.config']).toMatchObject({method:'GET',path:'/rpg/stamina/config',access:'public'});
 expect(validate('StaminaConfig',{parameters,starter})).toEqual([]);
 expect(validate('PotionEffect',{type:'stamina',restore_percent:15})).toEqual([]);
 for(const patch of [{recovery_minutes:0},{efficiency_floor:0},{reduction_limit:100},{quest_cost:0},{overflow_decay_rate:-1}])expect(validate('StaminaConfig',{parameters:{...parameters,...patch},starter}).length).toBeGreaterThan(0);
 expect(validate('StaminaConfig',{starter}).length).toBeGreaterThan(0);
 for(const restore_percent of [0,-1,'15'])expect(validate('PotionEffect',{type:'stamina',restore_percent}).length).toBeGreaterThan(0);
});
