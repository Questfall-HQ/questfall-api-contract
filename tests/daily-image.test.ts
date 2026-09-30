import {expect, test} from 'bun:test'
import {schema, validate} from '../src/index.js'

test('Daily task pictures are optional public URLs independent of the action', () => {
  const chain = {
    id:'quests',title:'Complete quests',description:'',action:'quest.completed',enabled:true,
    filters:{},tiers:[{threshold:1,rewards:[{resource:'silver',amount:1}],key:'quests:0',claimed:false}],
    unit:'quests',icon:'scroll',href:'/feed',note:'',progress:0,current:0,completed:false,claimable:false
  }
  expect(schema('DailyChain').required).not.toContain('image')
  expect(validate('DailyChain',chain)).toEqual([])
  expect(validate('DailyChain',{...chain,image:''})).toEqual([])
  expect(validate('DailyChain',{...chain,image:'https://media.questfall.xyz/dev/cards/daily/task/display.avif'})).toEqual([])
  expect(validate('DailyChain',{...chain,image:42})).not.toEqual([])
})
