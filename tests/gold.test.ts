import {test,expect} from 'bun:test'
import {operations,validate} from '../src/index.js'
const order={id:'order',user:'buyer',receiver:'wallet',recipient:'0x1111111111111111111111111111111111111111',token:'0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',package_id:'25',amount_raw:'24999999',amount:'24.999999',state:'awaiting_payment',transaction:'',issue:'',payment:'',ledger:'',chain_id:137,gold:5000,created:1,updated:1,paid_at:0,fulfilled_at:0,payable:true}
test('Gold orders retain exact amounts and immutable payment fields',()=>{
 expect(validate('GoldOrder',order)).toEqual([])
 for(const key of ['recipient','receiver','token','amount_raw','gold','chain_id']){const missing={...order};delete missing[key];expect(validate('GoldOrder',missing)).not.toEqual([])}
 expect(validate('GoldOrder',{...order,amount_raw:24999999})).not.toEqual([])
 expect(validate('GoldOrder',{...order,amount_raw:'24.999999'})).not.toEqual([])
 expect(validate('GoldOrder',{...order,chain_id:1})).not.toEqual([])
})
test('Gold routes require authenticated ownership and creation accepts no receiver or amount overrides',()=>{
 const routes=Object.values(operations).filter(x=>x.path.startsWith('/gold/')&&x.operation!=='gold.freezing.view')
 expect(routes).toHaveLength(13)
 expect(routes.every(x=>x.access==='authenticated')).toBe(true)
 expect(operations['gold.orders.create'].request.required).toEqual(['package_id','idempotency_key'])
})
test('Gold Freezing exposes immediate views and idempotent whole-Gold actions',()=>{
 const routes=Object.values(operations).filter(x=>x.path.startsWith('/gold/freezing'))
 expect(routes).toHaveLength(6)
 expect(operations['gold.freezing.view'].access).toBe('optional')
 expect(routes.filter(x=>x.method==='POST').every(x=>x.access==='authenticated')).toBe(true)
 for(const name of ['freeze','add']) expect(operations[`gold.freezing.${name}`].request.required).toEqual(['amount','idempotency_key'])
 for(const name of ['renew','cancel','withdraw']) expect(operations[`gold.freezing.${name}`].request.required).toEqual(['idempotency_key'])
})
