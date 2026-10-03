import {expect,test} from 'bun:test'
import {validate} from '../src/index.js'

const card={id:'tracking',kind:'moderation',title:'Case',action:'Voted',status:'Awaiting consensus',tone:'neutral',terminal:false,href:'/moderation/history/case',cover:'',amount:0,currency:'',updated:1,unread:0,rarity:'',level:0}

test('Tracker moderation identities are additive and support cached icons and generated avatars',()=>{
 expect(validate('TrackingObject',card)).toEqual([])
 for(const type of ['domain','profile','space','quest']) {
  const target={type,title:'Subject',image:'',avatar:null,avatar_icon:null}
  expect(validate('TrackingObject',{...card,target})).toEqual([])
  expect(validate('TrackingObject',{...card,target:{...target,avatar:{mode:'generated',version:1,seed:'subject'}}})).toEqual([])
  expect(validate('TrackingObject',{...card,target:{...target,avatar:{mode:'image',seed:'subject'},avatar_icon:{url:'/avatar.avif',thumb:'/avatar-small.avif'}}})).toEqual([])
 }
 expect(validate('TrackingObject',{...card,target:{type:'domain',title:'Site',image:'/favicon.avif',avatar:null,avatar_icon:null}})).toEqual([])
 expect(validate('TrackingObject',{...card,target:{type:'unsupported',title:'Subject',image:'',avatar:null,avatar_icon:null}}).length).toBeGreaterThan(0)
 expect(validate('TrackingObject',{...card,target:{type:'profile',title:'Profile'}}).length).toBeGreaterThan(0)
})

test('Referral Tracker reuses the public profile target shape for one person',()=>{
 const target={type:'profile',title:'Aurora Finch',image:'',avatar:{mode:'generated',version:1,seed:'referral-person'},avatar_icon:null}
 expect(validate('TrackingObject',{...card,kind:'referral_reward',title:'Aurora Finch — Referral',action:'Referral milestones',status:'Level 8 reached',amount:1,currency:'lootbox_d',target})).toEqual([])
 expect(validate('TrackingObject',{...card,kind:'referral_reward',title:'Quest Guide — Inviter',action:'Your referral milestones',status:'You reached level 8',amount:1,currency:'lootbox_d',target:{...target,title:'Quest Guide'}})).toEqual([])
})
