/* GPT SNIPE side of EA page-runtime bridge. Non-sensitive UI model operations only. */
(() => {
 'use strict';
 if(window.GPTRuntimeBridge)return;
 const pending=new Map();let next=0;
 window.addEventListener('message',event=>{
   if(event.source!==window||event.origin!==location.origin||event.data?.channel!=='GPTS_RUNTIME_V317_RES')return;
   const id=event.data.id;if(typeof id!=='string'||!pending.has(id))return;
   const p=pending.get(id);pending.delete(id);clearTimeout(p.timer);p.resolve(event.data.result);
 });
 function request(command,extra={}){
   return new Promise(resolve=>{
     const id='gpts35-'+Date.now().toString(36)+'-'+(++next).toString(36)+'-'+Math.random().toString(36).slice(2,8);
     const timer=setTimeout(()=>{pending.delete(id);resolve({ok:false,stage:'timeout',message:'EA runtime did not answer'});},['probe-market','scan-market-service','purchase-market-item'].includes(command)?15000:4500);
     pending.set(id,{resolve,timer});window.postMessage({channel:'GPTS_RUNTIME_V317_REQ',id,command,...extra},location.origin==='null'?'*':location.origin);
   });
 }
 window.GPTRuntimeBridge=Object.freeze({probe:()=>request('probe'),openMarket:()=>request('open-market'),inspectFilters:()=>request('inspect-filters'),
   listOptions:kind=>request('list-options',{kind}),chooseOption:(kind,index)=>request('choose-option',{kind,index}),applyPrices:prices=>request('apply-prices',{prices}),
   searchPlayers:query=>request('search-players',{query}),choosePlayer:(token,index,playerId)=>request('choose-player',{token,index,playerId}), clearPlayer:()=>request('clear-player'), probeMarket:()=>request('probe-market'), scanMarket:args=>request('scan-market-service',args||{}),scanCapabilities:()=>request('scan-capabilities'), purchase:(args)=>request('purchase-market-item',args), inspectPurchase:()=>request('purchase-capabilities')});
})();
