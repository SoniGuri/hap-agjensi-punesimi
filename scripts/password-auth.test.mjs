import test from 'node:test';
import assert from 'node:assert/strict';
import { pbkdf2Sync } from 'node:crypto';
import { verifyPassword, sessionCookie, digest, readSessionCookie } from '../lib/password-auth.mjs';
const salt='00112233445566778899aabbccddeeff';
const encoded=['pbkdf2-sha256',100000,salt,pbkdf2Sync('fixture-password',Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex')].join(':');
test('password verification accepts correct password and rejects wrong or malformed values',async()=>{assert.equal(await verifyPassword('fixture-password',encoded),true);assert.equal(await verifyPassword('incorrect',encoded),false);assert.equal(await verifyPassword('fixture-password',''),false);assert.equal(await verifyPassword('x'.repeat(257),encoded),false)});
test('session tokens are hashed and cookies are HttpOnly, Secure, SameSite and expiring',async()=>{const value=sessionCookie('token');for(const flag of ['HttpOnly','Secure','SameSite=Strict','Max-Age=43200','Path=/'])assert.ok(value.includes(flag));assert.ok(sessionCookie('',true,true).includes('Max-Age=0'));assert.notEqual(await digest('token'),'token');assert.equal((await digest('token')).length,64);assert.equal(readSessionCookie(new Request('https://test.local',{headers:{cookie:'other=1; hap_admin_session=abc'}})),'abc')});
