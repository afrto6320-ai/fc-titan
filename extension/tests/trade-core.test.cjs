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
