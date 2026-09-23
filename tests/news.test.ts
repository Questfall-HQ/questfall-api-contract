import {test,expect} from 'bun:test';
import {validate,operations,path} from '../src/index.js';
const image={id:'abcdefghijkl123',url:'https://media.example/display.webp',thumb:'https://media.example/thumb.webp'};
const document={version:1,content:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Hello',marks:[{type:'bold'}]}]},{type:'image',attrs:{media_id:image.id,caption:'Caption'}}]}};
const article={id:'news123',title:'Title',subtitle:'Subtitle',date:'2026-09-23',cover:image,revision:1,published_at:1790124000000,updated:1790124000000,document,images:[image]};
test('news public article/list and private read state are distinct contracts',()=>{
 expect(validate('NewsArticle',article)).toEqual([]);
 expect(validate('NewsList',{items:[article],page:1,more:false,version:'hash'})).toEqual([]);
 expect(validate('NewsState',{unread_ids:['news123'],unread:1,version:'hash'})).toEqual([]);
 expect(operations['news.list'].access).toBe('public');
 expect(operations['news.state'].access).toBe('authenticated');
 expect(path('news.read',{id:'news123'})).toBe('/news/news123/read');
});
test('versioned news documents reject raw HTML, unknown nodes, marks and unsafe links',()=>{
 for(const content of ['<script>alert(1)</script>',{type:'doc',content:[{type:'iframe'}]},{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'x',marks:[{type:'html'}]}]}]},{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'x',marks:[{type:'link',attrs:{href:'javascript:alert(1)'}}]}]}]}]) expect(validate('NewsDocument',{version:1,content}).length).toBeGreaterThan(0);
 expect(validate('NewsDocument',{...document,version:2}).length).toBeGreaterThan(0);
 for(const patch of [{date:'2026-09-23T00:00:00Z'},{cover:null},{revision:0},{published_at:'today'}]) expect(validate('NewsArticle',{...article,...patch}).length).toBeGreaterThan(0);
});
