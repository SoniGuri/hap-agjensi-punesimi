import test from 'node:test';
import assert from 'node:assert/strict';
import { validateJob, isSameOrigin } from '../lib/job-validation.mjs';
const valid={title:'Zhvillues Front-end',company:'Hap',city:'Tiranë',sector:'Teknologji',mode:'Hibrid',type:'Kohë e plotë',description:'Përgjegjësitë dhe kërkesat për këtë pozicion pune janë të përshkruara këtu.',salary:'',status:'draft'};
test('normalizes valid input and ignores unexpected fields',()=>{const result=validateJob({...valid,title:'  Zhvillues Front-end  ',authorId:'attacker',id:'attacker'});assert.equal(result.title,valid.title);assert.equal(result.authorId,undefined);assert.equal(result.id,undefined)});
test('rejects invalid status, empty descriptions and oversized fields',()=>{for(const invalid of [{status:'admin'},{description:''},{title:'a'.repeat(101)},{sector:'unknown'},{salary:12}])assert.throws(()=>validateJob({...valid,...invalid}));assert.throws(()=>validateJob(null))});
test('writes require the exact request origin',()=>{assert.equal(isSameOrigin(new Request('https://hap.test/api',{headers:{origin:'https://hap.test'}})),true);for(const origin of ['https://evil.test','https://hap.test.evil.test','null'])assert.equal(isSameOrigin(new Request('https://hap.test/api',{headers:{origin}})),false);assert.equal(isSameOrigin(new Request('https://hap.test/api')),false)});
