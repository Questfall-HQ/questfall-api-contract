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
test('personal reward totals have explicit currency and distinct referral amounts',()=>{
 const value={currency:'gold',weekly_gold:7,seasonal_gold:3,referral_gold:50,total_gold:60,count:3};
 expect(validate('PersonalRewards',value)).toEqual([]);
 for(const field of ['currency','referral_gold','total_gold']){const next={...value};delete next[field];expect(validate('PersonalRewards',next).length).toBeGreaterThan(0)}
 expect(validate('PersonalRewards',{...value,currency:'qft'}).length).toBeGreaterThan(0);
 expect(validate('ReferralInvitation',{valid:false,code:'',inviter:null})).toEqual([]);
 expect(validate('ReferralCharts',{period:'2026-W40',distribution:[],timeline:[{time:1,score:0,total_score:0,share:0}]})).toEqual([]);
});
