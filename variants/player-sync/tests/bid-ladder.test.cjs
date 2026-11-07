const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {prepare,nextPrice,MAX_PRICE}=require('../bid-ladder.js');

class Criteria{constructor(values={}){Object.assign(this,{minBid:0,maxBid:0,maxBuy:7000,minBuy:0,maskedDefId:12345,league:13,rarities:[1]},values);}}

test('off retains the native filters and prototype; SDK pagination cannot change the native model',()=>{
  const input=new Criteria({minBid:200,maxBid:6500});
  const out=prepare(input,{ladderMode:'off'});
  assert.deepEqual(out.criteria,input);assert.notEqual(out.criteria,input);
  assert.equal(Object.getPrototypeOf(out.criteria),Criteria.prototype);
  out.criteria.offset=20;assert.equal(input.offset,undefined);
  assert.equal(out.ladder.field,'off');assert.equal(out.ladder.step,null);
});
test('valid next bid steps across every EA tier boundary',()=>{
  for(const [price,next] of [[0,150],[150,200],[999,1000],[1000,1100],[9900,10000],[10000,10250],[49750,50000],[50000,50500],[99500,100000],[100000,101000],[14999000,15000000],[15000000,0]])assert.equal(nextPrice(price),next);
});
test('smart Max Bid starts above Buy Now, advances, and retains cheap auctions and all other filters',()=>{
  const original=new Criteria();
  for(let index=0;index<3;index++){
    const out=prepare(original,{ladderMode:'smartMaxBid',ladderStep:index});
    assert.equal(out.criteria.maxBid,7100+index*100);
    assert.deepEqual({...out.criteria,maxBid:0},{...original});
    assert.equal(out.ladder.buyNow,7000);assert.equal(out.ladder.cycleStep,index);
  }
  assert.equal(original.maxBid,0);
});
test('the current native Buy Now and explicit higher bid limits determine the starting floor',()=>{
  assert.equal(prepare(new Criteria({maxBuy:4500}),{ladderMode:'smartMaxBid'}).criteria.maxBid,4600);
  assert.equal(prepare(new Criteria({maxBuy:11000}),{ladderMode:'smartMaxBid'}).criteria.maxBid,11250);
  const out=prepare(new Criteria({maxBid:20000,minBid:200}),{ladderMode:'smartMaxBid'});
  assert.equal(out.criteria.maxBid,20250);assert.equal(out.criteria.minBid,200);
});
test('a complete smart ladder uses valid prices above the cap, then uncapped, then restarts',()=>{
  for(const cap of [150,999,1000,7000,9999,10000,50000,100000,14999999,15000000]){
    const original=new Criteria({maxBuy:cap});
    const count=prepare(original,{ladderMode:'smartMaxBid'}).ladder.cycleLength;
    let previous=0;
    for(let i=0;i<count;i++){
      const out=prepare(original,{ladderMode:'smartMaxBid',ladderStep:i});
      const price=out.criteria.maxBid;
      assert.ok(price===0||(price>cap&&price<=MAX_PRICE));
      if(price){assert.ok(price>previous);assert.equal(price% (price<1000?50:price<10000?100:price<50000?250:price<100000?500:1000),0);previous=price;}
      assert.equal(out.criteria.minBid,0);assert.equal(out.criteria.maxBuy,cap);
    }
    assert.equal(prepare(original,{ladderMode:'smartMaxBid',ladderStep:count-1}).criteria.maxBid,0);
    assert.equal(prepare(original,{ladderMode:'smartMaxBid',ladderStep:count}).criteria.maxBid,prepare(original,{ladderMode:'smartMaxBid'}).criteria.maxBid);
  }
});
test('Min Bid is independently selected and cycles within explicit user bid bounds',()=>{
  const input=new Criteria({minBid:200,maxBid:400});
  assert.deepEqual(Array.from({length:7},(_,i)=>prepare(input,{ladderMode:'minBid',ladderStep:i}).criteria.minBid),[200,250,300,350,400,200,250]);
  assert.equal(prepare(input,{ladderMode:'minBid'}).criteria.maxBid,400);
  assert.equal(prepare(new Criteria({minBid:1000}),{ladderMode:'minBid'}).criteria.minBid,1000);
  assert.deepEqual(Array.from({length:3},(_,i)=>prepare(new Criteria(),{ladderMode:'minBid',ladderStep:i}).criteria.minBid),[0,150,200]);
});
test('ordinary Max Bid remains separate from smart mode and uses its explicit 0–600 cycle',()=>{
  const input=new Criteria();
  assert.deepEqual(Array.from({length:13},(_,i)=>prepare(input,{ladderMode:'maxBid',ladderStep:i}).criteria.maxBid),[0,150,200,250,300,350,400,450,500,550,600,0,150]);
  const constrained=new Criteria({minBid:500});
  assert.deepEqual(Array.from({length:5},(_,i)=>prepare(constrained,{ladderMode:'maxBid',ladderStep:i}).criteria.maxBid),[0,500,550,600,0]);
  assert.equal(prepare(new Criteria({maxBuy:0}),{ladderMode:'maxBid',ladderStep:1}).criteria.maxBid,150);
  assert.equal(input.maxBid,0);
});
test('invalid or uncapped Buy Now never silently becomes a smart capped query',()=>{
  for(const values of [{maxBuy:0},{maxBuy:149},{maxBuy:-1},{maxBuy:MAX_PRICE+1},{minBid:200,maxBid:150}])assert.throws(()=>prepare(new Criteria(values),{ladderMode:'smartMaxBid'}));
  for(const ladderStep of [-1,.5,NaN,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>prepare(new Criteria(),{ladderMode:'smartMaxBid',ladderStep}));
  assert.throws(()=>prepare(new Criteria(),{ladderMode:'surprise'}));
});

function bridge({helper=true}={}){
  const calls=[],outbox=[];
  const criteria=new Criteria();
  class UTMarketSearchFiltersViewController{constructor(){this.viewmodel={searchCriteria:criteria};}getView(){return {};}}
  const controller=new UTMarketSearchFiltersViewController();
  const item={definitionId:100,databaseId:12345,rating:90,name:'Fixture Player',getAuctionData:()=>({tradeId:'1234567890',buyNowPrice:2000})};
  const observable=value=>({observe:(target,fn)=>fn(null,value),unobserve:()=>{}});
  const context={console,setTimeout,clearTimeout,location:{origin:'https://www.ea.com'},UTMarketSearchFiltersViewController,
    getAppMain:()=>({getRootViewController:()=>({getPresentedViewController:()=>({getCurrentViewController:()=>({getCurrentController:()=>controller})})})}),
    services:{TransferMarket:{isFeatureEnabledForUser:()=>true},Item:{clearTransferMarketCache:()=>calls.push('clear'),searchTransferMarket:(dto,page)=>{calls.push({dto:{...dto},page});dto.count=21;return observable({success:true,data:{items:[item]}});},bid:(raw,price)=>{assert.equal(raw,item);calls.push({bid:price});return observable({success:true});}}},
    document:{querySelector:()=>null},addEventListener:(kind,fn)=>{if(kind==='message')context.listener=fn;},postMessage:msg=>outbox.push(msg)};
  context.window=context;vm.createContext(context);
  if(helper)vm.runInContext(fs.readFileSync(require.resolve('../bid-ladder.js'),'utf8'),context);
  vm.runInContext(fs.readFileSync(require.resolve('../runtime-main.js'),'utf8'),context);
  let id=0;
  const request=async(command,args={})=>{context.message={channel:'GPTS_RUNTIME_V317_REQ',id:String(++id),command,...args};await vm.runInContext('listener({source:window,origin:location.origin,data:message})',context);return outbox.at(-1)?.result;};
  return {request,calls,criteria};
}
test('the real MAIN bridge dispatches optional ladders with cache eviction and unchanged native filters',async()=>{
  const {request,calls,criteria}=bridge();
  for(const [mode,index,expected] of [['smartMaxBid',0,7100],['smartMaxBid',1,7200],['minBid',1,150],['maxBid',1,150],['off',0,0]]){
    const reply=await request('scan-market-service',{ladderMode:mode,ladderStep:index});
    assert.equal(reply.ok,true);assert.equal(reply.mode,'enhancer');assert.equal(reply.cacheCleared,true);
    assert.equal(calls.at(-2),'clear');
    const sent=calls.at(-1).dto;assert.equal(sent.maxBuy,7000);assert.equal(sent.maskedDefId,12345);
    assert.equal(mode==='minBid'?sent.minBid:sent.maxBid,expected);
    assert.equal(criteria.maxBid,0);assert.equal(criteria.minBid,0);assert.equal(criteria.count,undefined);
  }
});
test('a smart search retains the purchase ceiling, original native item and duplicate-attempt guard',async()=>{
  const {request,calls}=bridge();
  const scan=await request('scan-market-service',{ladderMode:'smartMaxBid',ladderStep:0});
  const args={mode:'pharaoh',scanToken:scan.scanToken,tradeId:'1234567890',playerId:12345,price:2000,maxPrice:7000,budgetRemaining:7000};
  for(const change of [{maxPrice:1500},{budgetRemaining:1000},{playerId:54321}])assert.equal((await request('purchase-market-item',{...args,...change})).status,'not-sent');
  assert.equal(calls.filter(c=>c.bid).length,0);
  const reply=await request('purchase-market-item',args);assert.equal(reply.status,'acknowledged');assert.equal(calls.at(-1).bid,2000);
  const again=await request('purchase-market-item',args);assert.equal(again.status,'not-sent');assert.match(again.reason,/duplicate blocked/);
  assert.equal(calls.filter(c=>c.bid).length,1);
});
test('missing helper and missing Buy Now fail before cache clearing or service dispatch',async()=>{
  const missing=bridge({helper:false});assert.equal((await missing.request('scan-market-service',{ladderMode:'smartMaxBid'})).ok,false);assert.equal(missing.calls.length,0);
  const noCap=bridge();noCap.criteria.maxBuy=0;
  const reply=await noCap.request('scan-market-service',{ladderMode:'smartMaxBid'});assert.equal(reply.ok,false);assert.match(reply.reason,/Max Buy Now/);assert.equal(noCap.calls.length,0);
});
