import {expect,test} from 'bun:test'
import {validate,operations,schemas} from '../src/index.js'
const empty = () => ({total:0,ratings:0,timezone:'UTC',series:Array.from({length:30},(_,i)=>({day:i*86400000,count:0})),survey:null})
test('author results declare access and a bounded daily response',()=>{
  expect(operations['authorSpaces.quests.results'].access).toBe('verified')
  expect(operations['authorSpaces.quests.results'].request.required).toEqual(['slug','id'])
  expect(validate('AuthorQuestResults',empty())).toEqual([])
  expect(validate('AuthorQuestResults',{...empty(),survey:{total:1,items:[{index:0,count:1,percent:100},{index:1,count:0,percent:0}]}})).toEqual([])
  for(const extra of [{series:[]},{total:-1},{timezone:'local'},{ratings:null},{survey:{total:1,items:[{index:0,count:1,percent:101}]}}]) expect(validate('AuthorQuestResults',{...empty(),...extra}).length).toBeGreaterThan(0)
})


test('quiz attempt distribution extends results without requiring it from older servers',()=>{
 const quiz={total:4,items:[{index:0,count:1,percent:25},{index:1,count:3,percent:75}]};
 expect(validate('AuthorQuestResults',{...empty(),quiz})).toEqual([]);
 expect(validate('AuthorQuestResults',{...empty(),quiz:null})).toEqual([]);
 for(const quiz of [{total:-1,items:[]},{total:1,items:[{index:0,count:1,percent:101}]},{total:1,items:[{index:0,count:1}]},{total:1,items:[{index:0,count:-1,percent:0}]}]) expect(validate('AuthorQuestResults',{...empty(),quiz}).length).toBeGreaterThan(0);
});

test('Question results expose grouped answers and bounded rejected pages',()=>{
 const row={answer:'QFT',count:2,percent:50};
 const question={total:4,accepted:[row],rejected:{items:[{answer:'qf',count:2,percent:50}],page:{page:1,per_page:5,total:1,pages:1}}};
 expect(operations['authorSpaces.quests.results'].request.optional).toContain('answers_page');
 expect(validate('AuthorQuestResults',{...empty(),question})).toEqual([]);
 expect(validate('AuthorQuestResults',{...empty(),question:null})).toEqual([]);
 for(const bad of [
  {...question,accepted:[{...row,count:0}]},
  {...question,accepted:[{...row,percent:101}]},
  {...question,accepted:[{...row,user:'private'}]},
  {...question,rejected:{...question.rejected,items:Array(6).fill(row)}},
  {...question,rejected:{...question.rejected,page:{...question.rejected.page,page:0}}},
 ]) expect(validate('AuthorQuestResults',{...empty(),question:bad}).length).toBeGreaterThan(0);
});

test('published results include immutable materials and remain compatible with old responses',()=>{
 expect(operations['authorSpaces.quests.results'].request.optional).toContain('publication_id');
 const publication={id:'pub',sequence:1,status:'ended',end_reason:'expired',bounty:1,starts:1,ends:2,closed:2,completion_count:0,rating:0,content:{title:'Published title',description:'Published description',instructions:'',type:'survey',config:{prompt:'Choose',options:['First','Second']},cover:'',cover_original:'',content_media:[]}};
 expect(validate('AuthorQuestResults',{...empty(),publication})).toEqual([]);
 expect(validate('AuthorQuestResults',{...empty(),publication:null})).toEqual([]);
 expect(validate('AuthorQuestResults',{...empty(),publication:{...publication,content:{title:'Missing materials'}}}).length).toBeGreaterThan(0);
 expect(validate('AuthorQuestResults',{...empty(),publication:{...publication,secret:'private'}}).length).toBeGreaterThan(0);
});

test('history documents result links on closing events for both response versions',()=>{
 for(const name of ['AuthorQuestHistory','AuthorQuestHistoryV2'])expect(schemas.$defs[name].properties.items.items.properties.publication_id.description).toContain('Closing events');
});
