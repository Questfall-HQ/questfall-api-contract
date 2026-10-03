import {expect, test} from 'bun:test'
import {validate} from '../src/index.js'

test('Daily supports confirmed Gold purchases with Gold-denominated targets', () => {
 const chain = {
  id:'buy-gold',title:'Buy Gold',description:'',action:'gold.purchased',enabled:true,
  filters:{},tiers:[{threshold:200,rewards:[{resource:'silver',amount:5}],key:'buy-gold:0',claimed:false}],
  unit:'Gold',icon:'gold',href:'/buy-gold',note:'',progress:200,current:0,completed:false,claimable:true
 }
 expect(validate('DailyChain',chain)).toEqual([])
 expect(validate('DailyChain',{...chain,action:'gold.unknown'})).not.toEqual([])
})
