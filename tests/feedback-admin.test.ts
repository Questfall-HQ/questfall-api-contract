import {expect,test} from 'bun:test'
import {operations} from '../src/index.js'

test('feedback decisions and hidden reports require admin access', () => {
	for (const kind of ['bugs', 'ideas']) {
		const list = operations[`admin.feedback.${kind}.list`]
		const status = operations[`admin.feedback.${kind}.status`]
		const visibility = operations[`admin.feedback.${kind}.visibility`]
		const removal = operations[`admin.feedback.${kind}.delete`]
		const reviewNote = operations[`admin.feedback.${kind}.reviewNote`]
		expect(list.access).toBe('admin')
		expect(list.request.optional).toContain('filter')
		expect(status.access).toBe('admin')
		expect(status.request.required).toContain('status')
		expect(visibility.access).toBe('admin')
		expect(visibility.request.required).toContain('hidden')
		expect(removal.access).toBe('admin')
		expect(removal.request.required).toContain('expected_updated')
		expect(removal.request.optional).toContain('duration')
		expect(removal.response.schema).toBe('FeedbackDeleteResult')
		expect(reviewNote.access).toBe('admin')
		expect(reviewNote.request.required).toEqual(['index', 'note', 'expected_note'])
		expect(operations[`feedback.${kind}.list`].access).toBe('optional')
	}
})
