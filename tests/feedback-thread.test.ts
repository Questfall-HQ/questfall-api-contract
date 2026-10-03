import {expect,test} from 'bun:test'
import {operations,validate} from '../src/index.js'

test('unified thread is an additive comments view with public identities',()=>{
 for(const kind of ['ideas','bugs']) expect(operations[`feedback.${kind}.comments.list`].request.optional).toContain('include_updates')
 const author={id:'reviewer',name:'Reviewer',avatar:null,avatar_icon:null,level:8,role:'team',admin:true}
 const ordinary={id:'comment',text:'A reply',created:1,author}
 const decision={...ordinary,id:'review:idea:0',review_index:0,status:'planned',award_gold:50}
 expect(validate('FeedbackComment',ordinary)).toEqual([])
 expect(validate('FeedbackComment',decision)).toEqual([])
 expect(validate('FeedbackCommentList',{items:[ordinary,decision],total:2,page:1,per_page:20,pages:1})).toEqual([])
 for(const invalid of [{review_index:-1},{status:'open'},{award_gold:-1},{author:{...author,level:0}}]) expect(validate('FeedbackComment',{...decision,...invalid}).length).toBeGreaterThan(0)
})
