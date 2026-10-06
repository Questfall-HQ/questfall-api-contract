import {expect,test} from 'bun:test'
import {validate} from '../src/index.js'

const samples={
 GoldOrderList:{items:[],page:1,more:false},
 GemProgram:{enabled:true,activated_at:1,period:'2026-W40',start:1,end:2,state:'open',server_time:1,rules:{version:1,share:.1,root:.8,bonus:.1,thresholds:[2,3,9,27,81,243]},buyers:0,fund:{count:0,counts:[],next:null},items:[],page:1,more:false,me:null,gap:'0',pending:[],history:[]},
}

test('Gold tables expose pagination metadata while older snapshots remain valid',()=>{
 for(const [name,sample] of Object.entries(samples)) {
  expect(validate(name,sample)).toEqual([])
  expect(validate(name,{...sample,pages:1,per_page:25})).toEqual([])
  expect(validate(name,{...sample,pages:0}).length).toBeGreaterThan(0)
  expect(validate(name,{...sample,per_page:0}).length).toBeGreaterThan(0)
 }
 expect(validate('GoldOrderList',{...samples.GoldOrderList,total:0})).toEqual([])
 expect(validate('GoldOrderList',{...samples.GoldOrderList,total:-1}).length).toBeGreaterThan(0)
})
