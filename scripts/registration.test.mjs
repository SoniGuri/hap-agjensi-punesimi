import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRegistration} from '../lib/registration-validation.mjs';
import {hashPassword,verifyPassword} from '../lib/password-auth.mjs';
const input={name:'  Test Admin  ',email:' USER@EXAMPLE.TEST ',password:'fixture-password',confirmPassword:'fixture-password',secretCode:'fixture-code'};
test('registration normalizes identity and rejects invalid fields',()=>{const v=validateRegistration(input);assert.equal(v.name,'Test Admin');assert.equal(v.email,'user@example.test');for(const invalid of [{name:''},{email:'invalid'},{password:'short',confirmPassword:'short'},{confirmPassword:'different'},{secretCode:''}])assert.throws(()=>validateRegistration({...input,...invalid}));assert.throws(()=>validateRegistration(null))});
test('registered passwords receive distinct salts and verify correctly',async()=>{const a=await hashPassword('fixture-password'),b=await hashPassword('fixture-password');assert.notEqual(a,b);assert.equal(await verifyPassword('fixture-password',a),true);assert.equal(await verifyPassword('incorrect',a),false)});
