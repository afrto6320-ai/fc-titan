const test=require('node:test');const assert=require('node:assert/strict');
const {lossRisk,clock,pace,uncertainFailure}=require('../trade-core.js');
test('loss warning only above 10 percent of purchase cost, after five percent tax',()=>{
  assert.equal(lossRisk(900,null).known,false);assert.equal(lossRisk(900,null).requiresApproval,false);
  assert.equal(lossRisk(950,900).lossPct,10);assert.equal(lossRisk(950,900).requiresApproval,false);
  assert.equal(lossRisk(951,900).requiresApproval,true);
  assert.equal(lossRisk(900,1000).requiresApproval,false);
  assert.throws(()=>lossRisk(0,1000));
});
test('monotonic session clock and actual cycle countdown freeze at stop',()=>{
  assert.equal(clock(3661000),'01:01:01');
  const running=pace(3000,{running:true,startedMono:1000,cycleStart:2000,intervalMs:3000,phase:'waiting'});
  assert.equal(running.clock,'00:00:02');assert.equal(running.remaining,2000);assert.equal(running.progress,1/3);
  assert.equal(pace(9000,{running:false,startedMono:1000,endedMono:3000,cycleStart:2000,intervalMs:3000}).clock,'00:00:02');
});
test('network/server failures are uncertain rather than permission to retry a bid',()=>{
  for(const status of [0,200,408,500,504])assert.equal(uncertainFailure({status}),true);
  for(const status of [400,401,403,429])assert.equal(uncertainFailure({status}),false);
  assert.equal(uncertainFailure({}),true);
});
test('Max Bid ladder preserves Min Bid, starts above the Buy Now ceiling and returns to an uncapped query',()=>{
  const {bidLadder}=require('../trade-core.js');
  assert.deepEqual(Array.from({length:6},(_,index)=>bidLadder({enabled:true,index,maxBuyNow:1000,ceiling:1400}).maxBid),[1000,1100,1200,1300,1400,0]);
  for(let index=0;index<30;index++){
    const row=bidLadder({enabled:true,index,maxBuyNow:1350,minBid:200,maxBid:1500});
    assert.equal(row.minBid,200);assert.ok(row.maxBid===0||row.maxBid>=1500);assert.ok(row.maxBid<=15000000);
  }
  assert.equal(bidLadder({enabled:true,index:0,maxBuyNow:15000000,ceiling:15000000}).maxBid,15000000);
  assert.deepEqual(bidLadder({enabled:false,maxBuyNow:1000,minBid:150,maxBid:800}),{minBid:150,maxBid:800,step:null,broad:false});
});
test('browser helpers export to window even when a CommonJS-shaped global is present',()=>{
  const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
  for(const [file,key] of [['trade-core.js','CodexTradeCore'],['ea-options.js','CodexEAOptions'],['price-providers.js','CodexPrices']]){
    const scope={window:{},module:{exports:{}}};vm.createContext(scope);vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),scope);
    assert.equal(scope.window[key],scope.module.exports);assert.equal(scope[key],scope.window[key]);
  }
});

test('wide ladders do not wrap early, respect 100k/200k ceilings and keep cheap candidates inside the bid cap',()=>{
 const {bidLadder}=require('../trade-core.js');
 for(const ceiling of [100000,200000,15000000]){
  const initial=bidLadder({enabled:true,index:0,maxBuyNow:1000,ceiling});const length=initial.cycleLength;
  const prices=Array.from({length:length-1},(_,index)=>bidLadder({enabled:true,index,maxBuyNow:1000,ceiling}).maxBid);
  assert.equal(new Set(prices).size,prices.length);assert.equal(prices[0],1000);assert.equal(prices.at(-1),ceiling);assert.ok(prices.every(x=>x>=1000&&x<=ceiling));
  assert.equal(bidLadder({enabled:true,index:length-1,maxBuyNow:1000,ceiling}).maxBid,0);
  assert.equal(bidLadder({enabled:true,index:length,maxBuyNow:1000,ceiling}).maxBid,1000);
 }
 assert.equal(bidLadder({enabled:true,index:5,maxBuyNow:1000}).maxBid,1500);
 assert.throws(()=>bidLadder({enabled:true,index:0,maxBuyNow:300000,ceiling:200000}));
});
