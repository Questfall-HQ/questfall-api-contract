import {expect,test} from 'bun:test';
import {operations,validate} from '../src/index.js';
test('legacy author mutations do not require entity revisions',()=>{
 const quest={id:'q',title:'Quest',space_id:'s',status:'draft'};
 expect(validate('AuthorQuestMutation',quest)).toEqual([]);
 expect(validate('AuthorQuestMutation',{...quest,revision:1})).toEqual([]);
 expect(validate('AuthorQuestMutation',{...quest,revision:-1}).length).toBeGreaterThan(0);
});
test('state parts are verified and bootstrap uses the current response format',()=>{
 expect(operations['auth.me'].request.optional).toContain('response_version');
 expect(operations['player.state'].access).toBe('verified');
 expect(operations['player.state'].request.required).toEqual(['parts']);
});
test('effects are concrete snapshots, not arbitrary objects',()=>{
 const row={kind:'balances',id:'u',revision:1,value:{gold:1,silver:-1,essence:0,lootboxes:{a:0,f:1}}};
 const value={response_version:2,effects:{owner:'u',server_now:1,upsert:[row],remove:[],invalidate:[]}};
 expect(validate('PlayerState',value)).toEqual([]);
 expect(validate('PlayerState',{...value,effects:{...value.effects,upsert:[{...row,kind:'users'}]}}).length).toBeGreaterThan(0);
 expect(validate('PlayerState',{...value,effects:{...value.effects,upsert:[{...row,value:{gold:1}}]}}).length).toBeGreaterThan(0);
});

test('RPG command envelopes accept only current effects, never the removed Player format',()=>{
 const value={response_version:2,effects:{owner:'u',server_now:1,upsert:[],remove:[],invalidate:[]}};
 expect(validate('PlayerResult',value)).toEqual([]);
 expect(validate('PlayerResult',{...value,response_version:1}).length).toBeGreaterThan(0);
 expect(validate('PlayerResult',{player:{id:'u',character:{},account:{}}}).length).toBeGreaterThan(0);
 const missing={...value};delete missing.effects;
 expect(validate('PlayerResult',missing).length).toBeGreaterThan(0);
});
