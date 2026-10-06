import {test,expect} from 'bun:test';
import {operations,validate} from '../src/index.js';

test('only invitation lookup is public; personal referrals and claims require verification',()=>{
 const routes=Object.values(operations).filter(x=>x.path.startsWith('/referrals/')||x.path.startsWith('/rewards/'));
 expect(routes).toHaveLength(8);
 expect(operations['referrals.person'].access).toBe('verified');
 expect(routes.find(x=>x.path.includes('/invitations/'))?.access).toBe('public');
 expect(routes.filter(x=>!x.path.includes('/invitations/')).every(x=>x.access==='verified')).toBe(true);
 expect(operations['rewards.claim'].request.required).toContain('idempotency_key');
 expect(operations['auth.email.request'].request.optional).toContain('referral_code');
 expect(operations['auth.siwe.challenge'].request.optional).toContain('referral_code');
});
test('milestones expose four automatic rewards, persisted states and an exclusive expiry',()=>{
 const stages=[['registration',0,'f','Common'],['level_5',5,'e','Uncommon'],['level_8',8,'d','Rare'],['level_15',15,'c','Epic']].map(([id,level,rarity,name])=>({id,level,rarity,box:`lootbox_${rarity}`,name:`${name} Box`}));
 expect(validate('ReferralMilestoneRules',{version:1,months:6,stages})).toEqual([]);
 const progress={version:1,joined:1000,expires:2000,level:8,stages:stages.map((s,i)=>({...s,state:i<3?'awarded':'pending',awarded:i<3?1000:0}))};
 expect(validate('ReferralMilestoneProgress',progress)).toEqual([]);
 expect(validate('ReferralMilestoneProgress',{...progress,stages:progress.stages.slice(1)}).length).toBeGreaterThan(0);
 expect(validate('ReferralMilestoneStage',{...progress.stages[0],state:'claimable'}).length).toBeGreaterThan(0);
 expect(validate('ReferralMilestoneStage',{...progress.stages[3],state:'expired'})).toEqual([]);
 expect(validate('ReferralMilestoneStage',{...progress.stages[0],state:'unavailable',awarded:0})).toEqual([]);
});
test('personal reward totals have explicit currency and distinct referral and freezing amounts',()=>{
 const value={currency:'gold',weekly_gold:7,seasonal_gold:3,referral_gold:50,freezing_gold:5,total_gold:65,count:4};
 expect(validate('PersonalRewards',value)).toEqual([]);
 for(const field of ['currency','referral_gold','freezing_gold','total_gold']){const next={...value};delete next[field];expect(validate('PersonalRewards',next).length).toBeGreaterThan(0)}
 expect(validate('PersonalRewards',{...value,freezing_gold:-1}).length).toBeGreaterThan(0);
 expect(validate('PersonalRewards',{...value,currency:'qft'}).length).toBeGreaterThan(0);
 expect(validate('ReferralInvitation',{valid:false,code:'',inviter:null})).toEqual([]);
 expect(validate('ReferralCharts',{period:'2026-W40',distribution:[],timeline:[{time:1,score:0,total_score:0,share:0}]})).toEqual([]);
});
test('versioned referral rewards support arbitrary stages, six Box types and asymmetric resource bundles',()=>{
 const stages=[{id:'registration',level:0,referred:[{resource:'gold',amount:100}],inviter:[]},{id:'level_2',level:2,referred:[],inviter:[{resource:'lootbox_a',amount:1},{resource:'silver',amount:50}]}];
 expect(validate('ReferralRewardRules',{revision:2,months:6,stages})).toEqual([]);
 expect(validate('ReferralRewardRules',{revision:2,months:6,stages:[]})).not.toEqual([]);
 for(const resource of ['gold','silver','lootbox_a','lootbox_b','lootbox_c','lootbox_d','lootbox_e','lootbox_f'])expect(validate('ReferralReward',{resource,amount:1})).toEqual([]);
 expect(validate('ReferralReward',{resource:'qft',amount:1})).not.toEqual([]);
 expect(validate('ReferralReward',{resource:'gold',amount:0})).not.toEqual([]);
 const progress={revision:2,joined:1000,expires:2000,level:1,totals:{referred:[{resource:'gold',amount:100}],inviter:[]},stages:stages.map((s,i)=>({...s,state:i?'pending':'awarded',awarded:i?0:1000}))};
 expect(validate('ReferralRewardProgress',progress)).toEqual([]);
 expect(validate('ReferralRewardProgress',{...progress,revision:0,stages:[],totals:{referred:[],inviter:[]}})).toEqual([]);
 expect(validate('ReferralRewardReceipt',{...progress.stages[1],state:'expired'})).toEqual([]);
 expect(validate('ReferralRewardReceipt',{...progress.stages[1],state:'claimable'})).not.toEqual([]);
});

test('referral event stages expose fixed conditions and cumulative progress without fictitious levels',()=>{
 const event={key:'lootbox.opened',filters:{box:'lootbox_f'},target:5};
 const stage={id:'event_open_5',event,label:'Open Common Lootbox · 5×',referred:[],inviter:[{resource:'gold',amount:10}]};
 expect(validate('ReferralRewardStage',stage)).toEqual([]);
 expect(validate('ReferralRewardReceipt',{...stage,progress:3,state:'pending',awarded:0})).toEqual([]);
 expect(validate('ReferralRewardReceipt',{...stage,progress:5,state:'awarded',awarded:1000})).toEqual([]);
 expect(validate('ReferralRewardStage',{...stage,event:{...event,target:1.5}})).not.toEqual([]);
 expect(validate('ReferralRewardStage',{...stage,event:{...event,key:'unknown'}})).not.toEqual([]);
 const welcome={...stage,event:{key:'welcome.completed',filters:{},target:1,quests:['first','second']}};
 expect(validate('ReferralRewardStage',welcome)).toEqual([]);
 expect(validate('ReferralRewardStage',{...welcome,event:{...welcome.event,quests:[]}})).not.toEqual([]);
 const incomplete={...stage};delete incomplete.event;
 expect(validate('ReferralRewardStage',incomplete)).not.toEqual([]);
});
