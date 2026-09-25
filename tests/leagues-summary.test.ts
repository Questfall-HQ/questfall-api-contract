import {expect,test} from 'bun:test'
import {operations,validate} from '../src/index.js'
const row={id:'miner',name:'Miner',avatar:null,avatar_icon:null,level:1,mining_power:1,points:0,quests_7d:0,viewer:false,position:1}
const build={id:'miner',mining_power:1,equipment:['head','chest','hands','legs','feet','outer'].map(slot=>({slot,item:null})),systems:{flow:0,focus:1,boost:1,loot:1}}
const league={id:0,name:'Hall',hall:true,eligible:false,open:true,frontier:false,start_level:1,end_level:4,next_level:5,members:1}
const envelope={server_now:1,viewer:{id:'',league:0},league,leagues:[],series:[],view:'list',sort:'points',direction:'desc',page:{number:1,per_page:8,total:1,pages:1,has_prev:false,has_next:false}}
test('compact rows explicitly omit builds while the default full response stays valid',()=>{
 expect(operations['mining.leagues'].request.optional).toContain('details')
 const full={...row,equipment:build.equipment,systems:build.systems}
 expect(validate('LeagueBrowserResponse',{...envelope,items:[full],selected:full})).toEqual([])
 const compact={...envelope,details:'summary',items:[row],selected:null}
 expect(validate('LeagueBrowserResponse',compact)).toEqual([])
 expect(validate('LeagueBrowserResponse',{...compact,items:[full]}).length).toBeGreaterThan(0)
 expect(validate('LeagueBrowserResponse',{...compact,selected:full}).length).toBeGreaterThan(0)
 expect(validate('LeagueBrowserResponse',{...envelope,items:[row],selected:null}).length).toBeGreaterThan(0)
})
test('on-demand public builds contain only published mining and equipment fields',()=>{
 expect(operations['mining.leagues.miner'].path).toBe('/mining/leagues/miners/{id}')
 expect(operations['mining.leagues.miner'].request.params).toEqual(['id'])
 expect(validate('LeagueMinerBuild',build)).toEqual([])
 expect(validate('LeagueMinerBuild',{...build,inventory:{}}).length).toBeGreaterThan(0)
 expect(validate('LeagueMinerBuild',{...build,equipment:[]}).length).toBeGreaterThan(0)
})
