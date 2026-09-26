import {expect,test} from 'bun:test'
import {operations} from '../src/index.js'

test('feedback decisions and hidden reports require admin access', () => {
	for (const kind of ['bugs', 'ideas']) {
		const list = operations[`admin.feedback.${kind}.list`]
		const status = operations[`admin.feedback.${kind}.status`]
		const visibility = operations[`admin.feedback.${kind}.visibility`]
		expect(list.access).toBe('admin')
		expect(list.request.optional).toContain('filter')
		expect(status.access).toBe('admin')
		expect(status.request.required).toContain('status')
		expect(visibility.access).toBe('admin')
		expect(visibility.request.required).toContain('hidden')
		expect(operations[`feedback.${kind}.list`].access).toBe('optional')
	}
})
