import {expect,test} from 'bun:test'
import {validate} from '../src/index.js'

const profile={id:'member',name:'Mira North',avatar:{mode:'generated',version:1,seed:'mira'},avatar_icon:null,level:18}
const miner={...profile,mining_power:0,points:0,quests_7d:0,viewer:false,position:1}
const league={...profile,points:0,rank:1,viewer:false}
const samples={
 AuthorSpaceTeamCandidate:{...profile,email_hint:''},
 QuestRatingHistoryUser:profile,
 ModerationParticipant:profile,
 ModerationHistoryVoter:{...profile,decision:'approve',trust:1,own:false},
 MiningLeagueUser:league,
 MiningLeaguePlayer:{...league,viewer:true,score_share:0,target:{state:'lead',rank:1,gap:0,user:null}},
 MiningRewardsUser:{...profile,points:0,rank:1,projected_gold:0,share:0,rank_shares:0,viewer:false},
 LeagueBrowserMinerSummary:miner,
 LeagueBrowserMiner:{...miner,equipment:['head','chest','hands','legs','feet','outer'].map(slot=>({slot,item:null})),systems:{flow:0,focus:0,boost:1,loot:0}},
 PublicMiniProfile:{...profile,avatar_icon:'',moderation_status:'active',moderation_revision:0,status_message:''},
 MarketplaceUser:profile,
 QuestCommentUser:profile,
}

test('public identity surfaces accept optional canonical roles and older snapshots',()=>{
 for(const [name,value] of Object.entries(samples)) {
  expect(validate(name,value)).toEqual([])
  for(const role of [null,'owner','team']) expect(validate(name,{...value,role})).toEqual([])
  expect(validate(name,{...value,role:'admin'}).length).toBeGreaterThan(0)
 }
})

test('Gem standings expose level and role without requiring them on saved standings',()=>{
 const row={user:{id:profile.id,name:profile.name,avatar:profile.avatar,avatar_icon:null},rank:1,points:'1000000',gold:10,rarity:'f'}
 expect(validate('GemStanding',row)).toEqual([])
 expect(validate('GemStanding',{...row,user:{...row.user,level:18,role:'owner'}})).toEqual([])
 expect(validate('GemStanding',{...row,user:{...row.user,role:'admin'}}).length).toBeGreaterThan(0)
})

test('quest comment identities include the canonical admin flag',()=>{
 for(const admin of [true,false]) expect(validate('QuestCommentUser',{...profile,role:null,admin})).toEqual([])
 expect(validate('QuestCommentUser',{...profile,admin:'true'}).length).toBeGreaterThan(0)
 expect(validate('QuestCommentUser',{...profile,permissions:[]} ).length).toBeGreaterThan(0)
})
