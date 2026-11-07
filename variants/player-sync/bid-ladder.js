/* Per-request bid criteria. No network, native model mutation or purchase pricing. */
((root)=>{
  'use strict';
  const MAX_PRICE=15000000;
  const MIN_STEPS=[0,150,200,250,300,350,400,450,500,550,600];
  const TIERS=[[1000,50],[10000,100],[50000,250],[100000,500],[MAX_PRICE+1,1000]];
  function integer(value,name){
    const number=Number(value??0);
    if(!Number.isSafeInteger(number)||number<0||number>MAX_PRICE)throw Error('Invalid EA '+name);
    return number;
  }
  function nextPrice(value){
    if(value>=MAX_PRICE)return 0; // EA's zero means no bid ceiling.
    const tick=TIERS.find(([edge])=>value<edge)[1];
    return Math.max(150,(Math.floor(value/tick)+1)*tick);
  }
  function maximumAt(start,index){
    let cursor=start,total=0;
    const ranges=[];
    for(const [edge,tick] of TIERS){
      if(cursor>=edge)continue;
      const length=Math.ceil((edge-cursor)/tick);
      ranges.push({start:cursor,tick,length});total+=length;cursor+=length*tick;
    }
    const step=index%(total+1);
    let remaining=step;
    for(const range of ranges){
      if(remaining<range.length)return {value:range.start+remaining*range.tick,step,cycleLength:total+1};
      remaining-=range.length;
    }
    return {value:0,step,cycleLength:total+1};
  }
  function prepare(original,{ladderMode='off',ladderStep=0}={}){
    if(!original||typeof original!=='object')throw Error('EA search criteria not available');
    if(!['off','minBid','maxBid','smartMaxBid'].includes(ladderMode))throw Error('Invalid bid ladder field');
    if(!Number.isSafeInteger(ladderStep)||ladderStep<0)throw Error('Invalid ladder step');
    const base={minBid:integer(original.minBid,'Min Bid'),maxBid:integer(original.maxBid,'Max Bid')};
    if(base.maxBid>0&&base.minBid>base.maxBid)throw Error('EA Min Bid exceeds Max Bid');
    const buyNow=integer(original.maxBuy,'Max Buy Now');
    // Clone every request: the service may add pagination fields to its input.
    const criteria=Object.assign(Object.create(Object.getPrototypeOf(original)),original);
    let value=null,step=null,cycleLength=null;
    if(ladderMode==='minBid'){
      const values=[base.minBid,...MIN_STEPS.filter(v=>v>base.minBid&&(!base.maxBid||v<=base.maxBid))];
      cycleLength=values.length;step=ladderStep%cycleLength;value=values[step];criteria.minBid=value;
    }else if(ladderMode==='maxBid'){
      // Explicit legacy ladder: unlike smart mode, it can narrow the market.
      const values=MIN_STEPS.filter(v=>v===0||v>=base.minBid);
      cycleLength=values.length;step=ladderStep%cycleLength;value=values[step];criteria.maxBid=value;
    }else if(ladderMode==='smartMaxBid'){
      if(buyNow<150)throw Error('Smart Max Bid requires a positive EA Max Buy Now (150 or more)');
      const floor=Math.max(buyNow,base.minBid,base.maxBid);
      const first=nextPrice(floor);
      const result=first?maximumAt(first,ladderStep):{value:0,step:0,cycleLength:1};
      ({value,step,cycleLength}=result);criteria.maxBid=value;
    }
    return {criteria,ladder:{field:ladderMode,step:ladderMode==='off'?null:ladderStep,cycleStep:step,cycleLength,value,base,buyNow,
      effective:{minBid:criteria.minBid??0,maxBid:criteria.maxBid??0},uncapped:Number(criteria.maxBid||0)===0}};
  }
  const api=Object.freeze({prepare,nextPrice,MAX_PRICE});
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.GPTBidLadder=api;
  else root.GPTBidLadder=api;
})(globalThis);
