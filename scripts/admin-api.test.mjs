import test from 'node:test';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:5173';
const data={title:'Test autentifikimi lokal',company:'Vetëm preview',city:'Tiranë',sector:'Marketing',mode:'Hibrid',type:'Kohë e plotë',description:'Njoftim i krijuar vetëm për verifikimin e hyrjes dhe publikimit në mjedisin lokal.',salary:'',status:'draft'};
const jsonHeaders={origin:base,'content-type':'application/json'};
const login=(password='local-test-password',email='admin@gmail.com',origin=base)=>fetch(base+'/api/admin/login',{method:'POST',headers:{...jsonHeaders,origin},body:JSON.stringify({email,password})});
test('password login protects job operations, persists sessions and invalidates logout',async()=>{
  for(const [path,method] of [['/api/admin/session','GET'],['/api/admin/jobs','GET'],['/api/admin/jobs','POST'],['/api/admin/jobs/00000000-0000-4000-8000-000000000000','PUT']]){const r=await fetch(base+path,{method,headers:jsonHeaders,...(method!=='GET'?{body:JSON.stringify(data)}:{})});assert.equal(r.status,401)}
  assert.equal((await login('local-test-password','admin@gmail.com','https://untrusted.test')).status,403);
  assert.equal((await login('incorrect-password')).status,401);
  assert.equal((await login('local-test-password','other@example.test')).status,401);
  const signed=await login();assert.equal(signed.status,200);const setCookie=signed.headers.getSetCookie()[0];assert.ok(setCookie.includes('HttpOnly'));assert.ok(setCookie.includes('SameSite=Strict'));const cookie=setCookie.split(';')[0];const headers={...jsonHeaders,cookie};
  const session=await fetch(base+'/api/admin/session',{headers});assert.equal(session.status,200);assert.equal((await session.json()).user.login,'admin@gmail.com');
  const csrf=await fetch(base+'/api/admin/jobs',{method:'POST',headers:{...headers,origin:'https://untrusted.test'},body:JSON.stringify(data)});assert.equal(csrf.status,403);
  const create=await fetch(base+'/api/admin/jobs',{method:'POST',headers,body:JSON.stringify(data)});assert.equal(create.status,201);const {id}=await create.json();
  const publicJobs=async()=>(await(await fetch(base+'/api/jobs')).json()).jobs;
  assert.equal((await publicJobs()).some(j=>j.id===id),false);
  for(const status of ['published','closed']){const update=await fetch(base+'/api/admin/jobs/'+id,{method:'PUT',headers,body:JSON.stringify({...data,status})});assert.equal(update.status,200);assert.equal((await publicJobs()).some(j=>j.id===id),status==='published')}
  const logout=await fetch(base+'/api/admin/logout',{method:'POST',headers,body:'{}'});assert.equal(logout.status,200);assert.ok(logout.headers.get('set-cookie').includes('Max-Age=0'));assert.equal((await fetch(base+'/api/admin/session',{headers})).status,401);
  const forged=await fetch(base+'/api/admin/session',{headers:{cookie:'hap_admin_session='+'a'.repeat(64)}});assert.equal(forged.status,401);
});
test('repeated wrong passwords are limited',async()=>{for(let i=0;i<5;i++)assert.equal((await login('wrong-password')).status,401);const blocked=await login('wrong-password');assert.equal(blocked.status,429);assert.ok(Number(blocked.headers.get('retry-after'))>0)});
