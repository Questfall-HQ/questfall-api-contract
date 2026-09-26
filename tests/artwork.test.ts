import {expect,test} from 'bun:test';
import characters from './fixtures/rpg-character.json';
import {operations,validate} from '../src/index.js';
const variants=Object.fromEntries([96,320,960].flatMap(size=>['avif','webp'].map(format=>[`s${size}_${format}`,{name:`s${size}_${format}`,url:`https://media.questfall.xyz/artwork/revision/s${size}.${format}`,width:size,height:Math.round(size/2),bytes:1234,mime:`image/${format}`}])));
const appearance={scale:150,left:-10,top:3,brightness:0,hue:14};
const catalog={version:5,artworks:{legacykey:{id:'permanent-id',revision:2,appearance,variants}}};
test('artwork resolves bounded key queries without exposing drafts or private sources',()=>{
 expect(operations['artwork.get']).toMatchObject({path:'/rpg/artwork',method:'GET',access:'public',request:{optional:['keys','version'],required:[]}});
 expect(validate('ArtworkCatalog',catalog)).toEqual([]);
 expect(validate('ArtworkCatalog',{version:5,artworks:{}})).toEqual([]);
 for(const bad of [{...catalog,version:-1},{...catalog,draft:{}},{version:5,artworks:{x:{...catalog.artworks.legacykey,variants:{...variants,source:{url:'https://private/source'}}}}}])expect(validate('ArtworkCatalog',bad).length).toBeGreaterThan(0);
 const partial={...variants};delete partial.s96_avif;
 expect(validate('Artwork',{...catalog.artworks.legacykey,variants:partial}).length).toBeGreaterThan(0);
});

test('item set and wear accept dynamic English keys while slots and rarities stay fixed',()=>{
 const item={...characters.find(row=>row.name==='equipped')!.value.equipment.slots.head,set:'northern-wanderer',wear:'crowned-hood'};
 expect(validate('Item',item)).toEqual([]);
 expect(validate('Item',{...item,slot:'crown'}).length).toBeGreaterThan(0);
 expect(validate('Item',{...item,rarity:'s'}).length).toBeGreaterThan(0);
});
