import {test,expect} from 'bun:test';
import {operations,validate} from '../src/index.js';

test('only invitation lookup is public; personal referrals and claims require verification',()=>{
 const routes=Object.values(operations).filter(x=>x.path.startsWith('/referrals/')||x.path.startsWith('/rewards/'));
 expect(routes).toHaveLength(7);
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
