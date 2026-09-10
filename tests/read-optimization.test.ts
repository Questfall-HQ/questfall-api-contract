import {expect,test} from 'bun:test'
import {operations,validate} from '../src/index.js'

const viewer={points:0,rank:null,projected_gold:0,share:0,rank_shares:0}
const period={scope:'week',period:'2026-W37',start:0,end:1,active:true,pool_gold:0,viewer,competition:{kind:'league',id:0,name:'Hall',eligible:false,points:0,participants:0,pool_gold:0,active_leagues:[]}}
const summary={server_now:1,claimable:{total_gold:0,weekly_gold:0,seasonal_gold:0,count:0},week:period,season:{...period,scope:'season',competition:{kind:'global',name:'Quest Completion',participants:0,qualified:0,cutoff_points:0,qualified_points:0,total_rank_shares:0}}}

test('quest-scoped submissions are additive and remain verified-only',()=>{
 const route=operations['authorSpaces.submissions']
 expect(route.access).toBe('verified')
 expect(route.request.required).toEqual(['slug'])
 expect(route.request.optional).toContain('quest_id')
 expect(route.request.optional).toContain('search')
})

test('summary has its own optional-auth public route and excludes heavy collections',()=>{
 const route=operations['mining.rewards.summary']
 expect(route.path).toBe('/mining/rewards/summary')
 expect(route.access).toBe('public')
 expect(route.response.schema).toBe('MiningRewardsSummary')
 expect(operations['mining.rewards'].response.schema).toBe('MiningRewards')
 expect(validate('MiningRewardsSummary',summary)).toEqual([])
 for(const field of ['history','leaderboard','series','quests']) expect(validate('MiningRewardsSummary',{...summary,[field]:[]}).length).toBeGreaterThan(0)
 for(const field of ['leaderboard','series','quests']) expect(validate('MiningRewardsSummary',{...summary,week:{...period,[field]:[]}}).length).toBeGreaterThan(0)
})
