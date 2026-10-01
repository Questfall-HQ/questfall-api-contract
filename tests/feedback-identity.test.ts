import {expect, test} from 'bun:test'
import {validate} from '../src/index.js'

test('feedback identities expose positive integer levels and accept older identities', () => {
	const person = {id:'author', name:'Author', avatar:null, avatar_icon:null}
	const comment = {id:'comment', text:'An idea', created:1, author:person}
	const review = {status:'rejected', note:'Team decision', award_gold:0, created:2, reviewer:person}
	const cases = [
		['PublicUser', (user: object) => user],
		['FeedbackComment', (user: object) => ({...comment, author:user})],
		['IdeaReviewUpdate', (user: object) => ({...review, reviewer:user})],
		['BugReviewUpdate', (user: object) => ({...review, reviewer:user})],
	] as const
	for (const [schema, payload] of cases) {
		expect(validate(schema, payload(person))).toEqual([])
		for (const level of [1, 8, 120]) expect(validate(schema, payload({...person, level}))).toEqual([])
		for (const level of [0, -1, 1.5, '8']) expect(validate(schema, payload({...person, level})).length).toBeGreaterThan(0)
	}
})
