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
  function bidLadder({enabled,mode='smartMaxBid',index=0,maxBuyNow,minBid=0,maxBid=0,ceiling=200000}){
    if(!enabled||mode==='off')return {minBid,maxBid,step:null,broad:maxBid===0};
    if(!['minBid','maxBid','smartMaxBid'].includes(mode))throw Error('Invalid bid ladder mode');
    for(const value of [maxBuyNow,minBid,maxBid])if(!Number.isSafeInteger(value)||value<0||value>15000000)throw Error('Invalid bid ladder value');
    if(maxBid>0&&minBid>maxBid)throw Error('Min Bid exceeds Max Bid');
    if(!Number.isSafeInteger(index)||index<0)throw Error('Invalid bid ladder index');
    const regular=[0,150,200,250,300,350,400,450,500,550,600];
    if(mode==='minBid'){
      const values=[minBid,...regular.filter(v=>v>minBid&&(!maxBid||v<=maxBid))],step=index%values.length;
      return {mode,minBid:values[step],maxBid,step,broad:maxBid===0,cycleLength:values.length};
    }
    if(mode==='maxBid'){
      const values=regular.filter(v=>v===0||v>=minBid),step=index%values.length;
      return {mode,minBid,maxBid:values[step],step,broad:values[step]===0,cycleLength:values.length};
    }
    if(maxBuyNow<150)throw Error('Smart Max Bid requires Max Buy Now of at least 150');
    if(!Number.isSafeInteger(ceiling)||ceiling<150||ceiling>15000000)throw Error('Invalid smart Max Bid ladder ceiling');
    const tick=n=>n<1000?50:n<10000?100:n<50000?250:n<100000?500:1000;
    const floor=Math.max(maxBuyNow,minBid,maxBid);
    if(floor===15000000)return {mode,minBid,maxBid:0,step:0,broad:true,cycleLength:1,ceiling};
    let price=(Math.floor(floor/tick(floor))+1)*tick(floor);
    if(ceiling<price)throw Error('Smart Max Bid ceiling must cover the first step above Buy Now and your bid limits');
    const segments=[];let count=0;
    for(const [edge,increment] of [[1000,50],[10000,100],[50000,250],[100000,500],[15000001,1000]]){
      if(price>=edge)continue;
      const length=Math.min(Math.ceil((edge-price)/increment),Math.floor((ceiling-price)/increment)+1);
      if(length<=0)break;
      segments.push({start:price,increment,length});count+=length;price+=length*increment;
      if(price>ceiling)break;
    }
    const step=index%(count+1);if(step===count)return {mode,minBid,maxBid:0,step,broad:true,cycleLength:count+1,ceiling};
    let remaining=step;for(const segment of segments){if(remaining<segment.length)return {mode,minBid,maxBid:segment.start+remaining*segment.increment,step,broad:false,cycleLength:count+1,ceiling};remaining-=segment.length;}
    throw Error('Invalid bid ladder state');
  }
  function uncertainFailure(reply){const s=Number(reply?.status);return !Number.isFinite(s)||s<400||s>=500||s===408;}
  const api=Object.freeze({lossRisk,clock,pace,bidLadder,uncertainFailure});const common=typeof module==='object'&&module.exports;if(common)module.exports=api;if(typeof window!=='undefined')window.CodexTradeCore=api;if(!common||typeof window!=='undefined')root.CodexTradeCore=api;
})(globalThis);
