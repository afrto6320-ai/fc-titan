const test=require('node:test');const assert=require('node:assert/strict');
const {createClient,coins,cap}=require('../price-providers.js');
const response=data=>({ok:true,json:async()=>data});
test('prices retain exact edition/platform, cache only 90 seconds, force removes withdrawn quotes',async()=>{
  let now=100000,calls=[],available=true;
  const client=createClient(async(url,options)=>{calls.push({url,options});return response({'50540979':{prices:{PC:{LCPrice:available?'1,200':'0'},PS:{LCPrice:'2,000'}}}});},()=>now);
  const args={provider:'futbin',platform:'pc',ids:[50540979]};
  let r=await client.get(args);assert.equal(r.quotes[0].price,1200);assert.equal(r.quotes[0].itemId,50540979);assert.equal(r.quotes[0].platform,'pc');
  assert.equal(r.quotes[0].providerUpdatedAt,null);assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.cache,'no-store');assert.equal(calls[0].options.redirect,'error');
  assert.equal((await client.get(args)).quotes[0].retrievedAt,100000);assert.equal(calls.length,1);
  now+=91000;await client.get(args);assert.equal(calls.length,2);
  now+=2000;available=false;r=await client.get({...args,force:true});assert.equal(r.quotes.length,0);assert.deepEqual(r.missing,[50540979]);
});
test('no PC/console, base/special-edition, extinct, zero or malformed price substitution',async()=>{
  const client=createClient(async()=>response({'209331':{prices:{PS:{LCPrice:'900'}}},'50540979':{prices:{PS:{LCPrice:'1,000'}}}}),()=>100000);
  const pc=await client.get({provider:'futbin',platform:'pc',ids:[50540979]});assert.equal(pc.quotes.length,0);
  for(const v of ['1K','<b>1200</b>','1,2','NaN',-1,0,10.5,Infinity])assert.equal(coins(v),null);
  assert.equal(coins('15,000'),15000);assert.equal(cap(1350,90,2000),1200);assert.equal(cap(3000,100,1000),1000);
});
test('FUT.GG accepts only its requested signed route and exact ID/platform; challenges stop',async()=>{
  let calls=[];
  const client=createClient(async(url,options)=>{
    calls.push({url,options});if(options.method==='POST')return response({data:{url:'/api/fut/player-prices/27/?ids=50540979&platform=pc&signature=public-test'}});
    return response({data:[{eaId:209331,price:800},{eaId:50540979,price:900}]});
  },()=>100000);
  const r=await client.get({provider:'futgg',platform:'pc',ids:[50540979]});assert.equal(r.quotes[0].price,900);assert.equal(calls.length,2);
  assert.deepEqual(JSON.parse(calls[0].options.body),{url:'/api/fut/player-prices/27/?ids=50540979&platform=pc'});
  for(const data of [{challengeRequired:true},{url:'https://evil.test/api/fut/player-prices/27/?ids=50540979&platform=pc'},{url:'/api/fut/player-prices/27/?ids=209331&platform=pc'},{url:'/api/fut/player-prices/27/?ids=50540979'}]){
    let count=0;const c=createClient(async()=>{count++;return response({data});},()=>100000);
    await assert.rejects(c.get({provider:'futgg',platform:'pc',ids:[50540979]}));assert.equal(count,1);
  }
});
test('provider failures never return a cached quote as a successful refresh',async()=>{
  const client=createClient(async()=>({ok:false,status:403}),()=>100000);
  await assert.rejects(client.get({provider:'futbin',platform:'console',ids:[50540979]}),/403/);
  await assert.rejects(client.get({provider:'random',platform:'console',ids:[50540979]}));
});

test('a failed force refresh invalidates the previous quote for subsequent requests',async()=>{
  let calls=0,failed=false,now=100000;
  const client=createClient(async()=>{calls++;if(failed)throw Error('offline');return response({'50540979':{prices:{PC:{LCPrice:'900'}}}});},()=>now);
  const args={provider:'futbin',platform:'pc',ids:[50540979]};await client.get(args);now+=2000;failed=true;
  await assert.rejects(client.get({...args,force:true}),/offline/);now+=2000;
  await assert.rejects(client.get(args),/offline/);assert.equal(calls,3);
});
test('Futbin retries HTTP 400 with native base ID + exact resource ID and never takes the base edition price',async()=>{
  const urls=[];const client=createClient(async(url)=>{urls.push(url);if(urls.length===1)return {ok:false,status:400};return response({'209331':{prices:{pc:{LCPrice:'500'}}},'50540979':{prices:{pc:{lcPrice:'1,500'}}}});},()=>100000);
  const r=await client.get({provider:'futbin',platform:'pc',ids:[50540979],baseIds:{50540979:209331}});
  assert.equal(r.quotes[0].price,1500);assert.match(urls[1],/player=209331&rids=50540979$/);
  const noBase=createClient(async()=>({ok:false,status:400}),()=>100000);
  await assert.rejects(noBase.get({provider:'futbin',platform:'pc',ids:[50540979]}),e=>e.status===400);
});
test('Futbin does not retry a denial or rate limit, and reports HTML challenges instead of prices',async()=>{
  for(const status of [403,429]){let count=0;const c=createClient(async()=>{count++;return {ok:false,status};},()=>100000);await assert.rejects(c.get({provider:'futbin',platform:'pc',ids:[50540979],baseIds:{50540979:209331}}),e=>e.status===status);assert.equal(count,1);}
  const html=createClient(async()=>({ok:true,headers:{get:()=> 'text/html'},json:()=>{throw Error('must not parse HTML');}}),()=>100000);
  await assert.rejects(html.get({provider:'futbin',platform:'console',ids:[50540979]}),e=>e.code==='NOT_JSON');
});
