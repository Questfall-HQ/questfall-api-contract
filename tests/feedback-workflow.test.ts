import {expect,test} from 'bun:test'
import {validate,operations} from '../src/index.js'

test('shared feedback review is an additive verified API with bounded states and private actors',()=>{
 expect(operations['authorSpaces.quests.comments'].request.optional).toContain('status')
 expect(operations['authorSpaces.quests.commentstatus'].access).toBe('verified')
 expect(operations['authorSpaces.quests.commentstatus'].request.required).toEqual(['id','comment_id','status'])
 const person={id:'member',name:'Alex',avatar:null,avatar_icon:null}
 const comment={id:'note',quest_id:'quest',publication_id:'publication',text:'Broken link',created:1,user:person,unread:true,status:'done',done_at:2,done_by:person}
 const comments={total:1,unread:1,latest:1,open:0,done:1}
 expect(validate('QuestCommentReview',{comment,comments})).toEqual([])
 expect(validate('QuestComment',{...comment,status:'open',done_at:0,done_by:null})).toEqual([])
 expect(validate('QuestComment',{...comment,status:'ignored'}).length).toBeGreaterThan(0)
 expect(validate('QuestComment',{...comment,done_by:{...person,email:'private@example.com'}}).length).toBeGreaterThan(0)
 expect(validate('QuestCommentSummary',{...comments,open:-1}).length).toBeGreaterThan(0)
 expect(validate('QuestCommentSummary',{total:0,unread:0,latest:0})).toEqual([])
 const space={id:'space',slug:'space',name:'Space',accent:'purple',hue:270,coverOpacity:50,avatar:'',cover:'',official:false,revision:0,access:{owner:true,added:false,permissions:{drafts_manage:true,quests_publish:true,space_edit:true,team_manage:true}}}
 for(const feedback_open of [0,1,120]) expect(validate('AuthorSpaceNav',{...space,feedback_open})).toEqual([])
 for(const feedback_open of [-1,1.5,'3']) expect(validate('AuthorSpaceNav',{...space,feedback_open}).length).toBeGreaterThan(0)
})
