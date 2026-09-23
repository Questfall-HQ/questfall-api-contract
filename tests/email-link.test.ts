import {expect,test} from 'bun:test';
import {operations,validate} from '../src/index.js';

test('email linking codes require a session and preserve the old magic-link contract',()=>{
	expect(operations['auth.link.emailRequestOtp'].access).toBe('authenticated');
	expect(operations['auth.link.emailVerifyOtp'].request.required).toEqual(['email','otp']);
	expect(operations['auth.link.emailVerifyOtp'].access).toBe('authenticated');
	expect(operations['auth.link.emailVerify'].request.required).toEqual(['token']);
	expect(validate('EmailLink',{email:'user@example.test',linked:false,sent:true})).toEqual([]);
	expect(validate('EmailLink',{email:'user@example.test',linked:false,devCode:'123456'})).toEqual([]);
	expect(validate('EmailLink',{email:'user@example.test',linked:false,devCode:'wrong'}).length).toBeGreaterThan(0);
});
