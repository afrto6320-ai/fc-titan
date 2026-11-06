const test=require('node:test'),assert=require('node:assert/strict');
const {createClient}=require('../extension-client.js');
const message={type:'CODEX_GET_PRICES',payload:{provider:'futbin',platform:'pc',ids:[50540979]}};
test('retains the initialized extension API object when the global runtime property disappears',async()=>{
  let calls=0;const runtime={id:'fixture',getManifest:()=>({version:'3.9.2'}),getURL:p=>'chrome-extension://fixture/'+p,sendMessage:async m=>{calls++;assert.equal(m,message);return {ok:true,result:{quotes:[]}};}};
  const api={runtime},client=createClient(api);api.runtime=undefined;
  assert.equal((await client.request(message)).ok,true);assert.equal(calls,1);assert.equal(client.status().version,'3.9.2');
});
test('missing and invalidated contexts fail before a provider request and identify the reload action',async()=>{
  await assert.rejects(createClient({}).request(message),e=>e.code==='RUNTIME_UNAVAILABLE'&&/reload/i.test(e.message));
  let calls=0;const c=createClient({runtime:{sendMessage:async()=>{calls++;},getManifest:()=>{throw Error('Extension context invalidated.');}}});
  await assert.rejects(c.request(message),e=>e.code==='RUNTIME_INVALIDATED');assert.equal(calls,0);
});
test('worker failures and provider HTTP denials remain distinct; no retries or alternate requests',async()=>{
  let calls=0;const runtime={sendMessage:async()=>{calls++;return {ok:false,status:403,code:'HTTP_ERROR'};}};
  const c=createClient({runtime});assert.equal((await c.request(message)).status,403);assert.equal(calls,1);
  runtime.sendMessage=async()=>{throw Error('Could not establish connection. Receiving end does not exist.');};
  await assert.rejects(c.request(message),e=>e.code==='WORKER_UNAVAILABLE');
  runtime.sendMessage=async()=>undefined;await assert.rejects(c.request(message),e=>e.code==='WORKER_NO_RESPONSE');
  runtime.sendMessage=async()=>{throw Error('Extension context invalidated.');};await assert.rejects(c.request(message),e=>e.code==='RUNTIME_INVALIDATED');
});
test('bounded message timeout and fixed command list never dispatch unrelated commands',async()=>{
  let calls=0;const c=createClient({runtime:{sendMessage:()=>{calls++;return new Promise(()=>{});}}});
  await assert.rejects(c.request({type:'RAW_FETCH'}),e=>e.code==='BAD_MESSAGE');assert.equal(calls,0);
  await assert.rejects(c.request(message,{timeoutMs:10}),e=>e.code==='MESSAGE_TIMEOUT');assert.equal(calls,1);
});
