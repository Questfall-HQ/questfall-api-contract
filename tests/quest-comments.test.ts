import {expect,test} from 'bun:test'
import {validate,operations} from '../src/index.js'
test('comments are verified, private, publication-scoped one-way notes',()=>{
 expect(operations['quests.comment'].access).toBe('verified')
 expect(operations['quests.comment'].request.required).toEqual(['id','publication_id','text','idempotency_key'])
 expect(operations['authorSpaces.quests.comments'].access).toBe('verified')
 expect(operations['authorSpaces.quests.readcomments'].request.required).toEqual(['id','comment_ids'])
 const summary={total:1,unread:1,latest:123}
 const item={id:'note',quest_id:'quest',publication_id:'publication',text:'Broken link',created:123,user:{id:'user',name:'Mila',avatar:{mode:'generated',seed:'mila'},avatar_icon:null,level:1,moderation_status:'active'},unread:true}
 expect(validate('QuestCommentList',{items:[item],comments:summary,next:null})).toEqual([])
 expect(validate('QuestCommentList',{items:[{...item,user:{...item.user,email:'private@example.com'}}],comments:summary,next:null}).length).toBeGreaterThan(0)
 expect(validate('QuestCommentSummary',{...summary,unread:-1}).length).toBeGreaterThan(0)
 expect(validate('QuestCommentReceipt',{id:'note',quest_id:'quest',publication_id:'publication',text:'x'.repeat(2001),created:123}).length).toBeGreaterThan(0)
})
