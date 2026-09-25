import {expect, test} from 'bun:test'
import {validate} from '../src/index.js'

test('navigation accepts optional per-member unread feedback counts and keeps old responses valid', () => {
 const space={id:'space',slug:'space',name:'Space',accent:'purple',hue:270,coverOpacity:50,avatar:'',cover:'',official:false,revision:0,access:{owner:true,added:false,permissions:{drafts_manage:true,quests_publish:true,space_edit:true,team_manage:true}}}
 expect(validate('AuthorSpaceNav',space)).toEqual([])
 for(const feedback_unread of [0,1,120]) expect(validate('AuthorSpaceNav',{...space,feedback_unread})).toEqual([])
 for(const feedback_unread of [-1,1.5,'3']) expect(validate('AuthorSpaceNav',{...space,feedback_unread}).length).toBeGreaterThan(0)
})
