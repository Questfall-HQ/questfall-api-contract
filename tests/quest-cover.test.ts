import {expect, test} from 'bun:test'
import {schema, validate} from '../src/index.js'

test('quest responses allow older servers to omit the full cover', () => {
  const quest = {id:'quest',title:'Cover',cover:'thumb.webp',tag_ids:[],rating:null,rated:0,updated:0}
  expect(validate('AuthorSpaceRatedQuest',quest)).toEqual([])
  expect(validate('AuthorSpaceRatedQuest',{...quest,cover_original:'original.webp'})).toEqual([])
  expect(validate('AuthorSpaceRatedQuest',{...quest,cover_original:42})).not.toEqual([])
  for (const name of ['QuestCard','AuthorSpaceRatedQuest','AuthorQuestRow','AuthorQuestDraft','AuthorQuestMutation']) {
    expect(schema(name).required).not.toContain('cover_original')
  }
})

test('full cover is optional on media assets and has bounded image dimensions', () => {
  const asset = {id:'asset',kind:'quest_cover_v2',visibility:'public',state:'ready',variants:{thumb:{},display:{}},url:'display.webp',thumb:'thumb.webp'}
  expect(validate('MediaAsset',asset)).toEqual([])
  const original = {name:'original',bytes:128000,width:3000,height:2000,mime:'image/webp',url:'original.webp'}
  expect(validate('MediaAsset',{...asset,variants:{...asset.variants,original}})).toEqual([])
  for(const invalid of [{width:3001},{height:0},{bytes:4194305},{mime:'image/png'}]) {
    expect(validate('MediaAsset',{...asset,variants:{original:{...original,...invalid}}})).not.toEqual([])
  }
})
