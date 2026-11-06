/* Pure trade-risk and monotonic display calculations; no network. */
((root)=>{
  'use strict';
  function lossRisk(buy,reference,threshold=10,tax=.05){
    if(!Number.isFinite(buy)||buy<=0)throw Error('Invalid purchase price');
    if(!Number.isFinite(reference)||reference<=0)return {known:false,requiresApproval:false};
    const net=reference*(1-tax),lossPct=(buy-net)/buy*100;
    return {known:true,buy,reference,net,loss:buy-net,lossPct,threshold,requiresApproval:lossPct>threshold+1e-9};
  }
  function clock(ms){const sec=Math.max(0,Math.floor(ms/1000)),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return [h,m,s].map(x=>String(x).padStart(2,'0')).join(':');}
  function pace(now,{running,startedMono,endedMono,cycleStart,intervalMs,phase}){
    const elapsed=startedMono==null?0:Math.max(0,(running?now:endedMono??now)-startedMono);
    const cycle=cycleStart==null?0:Math.max(0,now-cycleStart),remaining=running?Math.max(0,intervalMs-cycle):0;
    return {elapsed,clock:clock(elapsed),remaining,progress:running&&intervalMs>0?Math.min(1,cycle/intervalMs):0,phase};
  }
  function uncertainFailure(reply){const s=Number(reply?.status);return !Number.isFinite(s)||s<400||s>=500||s===408;}
  const api=Object.freeze({lossRisk,clock,pace,uncertainFailure});if(typeof module==='object'&&module.exports)module.exports=api;else root.CodexTradeCore=api;
})(globalThis);
