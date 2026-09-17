import {expect,test} from 'bun:test'
import {operations,validate} from '../src/index.js'

test('account claims are verified-only and expose no owner or claimant login data',()=>{
 for(const operation of ['accounts.list','accounts.create','accounts.submit']) expect(operations[operation].access).toBe('verified')
 const claim={id:'claim',domain:'youtube.com',account:'@person',status:'pending',method:'public',wallet_supported:false,code:'QF-CODE',message:'',proof_url:'https://youtube.com/@person',explanation:'Code in bio',case_id:'case',created:1,updated:2,expires:3}
 expect(validate('AccountClaim',claim)).toEqual([])
 expect(validate('AccountClaimList',{items:[claim]})).toEqual([])
 expect(validate('AccountClaim',{...claim,owner:'private-user-id'}).length).toBeGreaterThan(0)
 expect(validate('AccountClaim',{...claim,status:'verified'}).length).toBeGreaterThan(0)
})
