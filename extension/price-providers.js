/* Public provider prices only. No EA session data, no cross-edition/platform fallback. */
((root)=>{
  'use strict';
  const TTL=90000;
  function coins(v){
    if(typeof v==='string'){if(!/^\d+(?:,\d{3})*$/.test(v.trim()))return null;v=Number(v.replaceAll(',',''));}
    return Number.isSafeInteger(v)&&v>0&&v<=15000000?v:null;
  }
  function cap(price,percent,maximum){
    const value=Math.min(price*percent/100,maximum),step=value<1000?50:value<10000?100:value<50000?250:value<100000?500:1000;
    return Math.floor(value/step)*step;
  }
  function createClient(fetcher=fetch,now=Date.now){
    const cache=new Map(),pending=new Map();let lastFetch=0,tail=Promise.resolve();
    async function json(url,body){
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
      try{const res=await fetcher(url,{method:body?'POST':'GET',headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),credentials:'omit',redirect:'error',cache:'no-store',signal:controller.signal});
        if(!res.ok)throw Error('Price provider HTTP '+res.status);return await res.json();
      }finally{clearTimeout(timer);}
    }
    async function load(provider,platform,ids){
      for(const id of ids)cache.delete([provider,platform,id].join(':'));
      let rows;
      if(provider==='futbin'){
        const data=await json('https://www.futbin.com/27/playerPrices?player='+ids.join(','));
        rows=ids.map(id=>{const prices=data?.[String(id)]?.prices;const specific=platform==='pc'?(prices?.PC??prices?.pc):(prices?.PS??prices?.ps);return {id,price:coins(specific?.LCPrice)};});
      }else{
        const path='/api/fut/player-prices/27/?ids='+ids.join(',')+(platform==='pc'?'&platform=pc':'');
        const signed=await json('https://www.fut.gg/api/fut/price-access/sign/',{url:path});
        if(signed?.data?.challengeRequired||signed?.challengeRequired)throw Error('FUT.GG requires verification; no price available.');
        const target=new URL(signed?.data?.url||'', 'https://www.fut.gg');
        if(!signed?.data?.url||target.protocol!=='https:'||target.hostname!=='www.fut.gg'||target.port||target.username||target.password||target.pathname!=='/api/fut/player-prices/27/')throw Error('Unrecognized FUT.GG price response.');
        // The signed URL must retain the requested exact IDs and platform.
        if(target.searchParams.get('ids')!==ids.join(',')||(platform==='pc'?target.searchParams.get('platform')!=='pc':![null,'console'].includes(target.searchParams.get('platform'))))throw Error('FUT.GG changed the requested edition or platform.');
        const data=await json(target.href);if(!Array.isArray(data?.data))throw Error('Unrecognized FUT.GG price format.');
        rows=data.data.filter(x=>ids.includes(Number(x.eaId))&&!x.isExtinct).map(x=>({id:Number(x.eaId),price:coins(x.price)}));
      }
      const at=now();for(const id of ids){cache.delete([provider,platform,id].join(':'));const row=rows.find(x=>x.id===id&&x.price);if(row)cache.set([provider,platform,id].join(':'),{provider,platform,itemId:id,price:row.price,retrievedAt:at,providerUpdatedAt:null});}
    }
    async function get({provider,platform,ids,force=false}){
      if(!['futgg','futbin'].includes(provider)||!['pc','console'].includes(platform)||!Array.isArray(ids)||!ids.length||ids.length>20||ids.some(id=>!Number.isSafeInteger(id)||id<=0||id>0xffffffff))throw Error('Select a provider, platform and 1–20 exact EA edition IDs.');
      ids=[...new Set(ids)];const missing=ids.filter(id=>{const q=cache.get([provider,platform,id].join(':'));return force||!q||now()<q.retrievedAt||now()-q.retrievedAt>=TTL;});
      if(missing.length){
        const key=[provider,platform,...missing].join(':');let task=pending.get(key);
        if(!task){task=tail.catch(()=>{}).then(async()=>{const wait=Math.max(0,1500-(now()-lastFetch));if(wait)await new Promise(r=>setTimeout(r,wait));lastFetch=now();await load(provider,platform,missing);});pending.set(key,task);tail=task;}
        try{await task;}finally{if(pending.get(key)===task)pending.delete(key);}
      }
      const quotes=ids.map(id=>cache.get([provider,platform,id].join(':'))).filter(q=>q&&now()>=q.retrievedAt&&now()-q.retrievedAt<TTL);
      return {provider,platform,quotes,missing:ids.filter(id=>!quotes.some(q=>q.itemId===id)),ttl:TTL,note:'Retrieval time is known; provider update time is not supplied.'};
    }
    return Object.freeze({get});
  }
  const api=Object.freeze({createClient,coins,cap,TTL});if(typeof module==='object'&&module.exports)module.exports=api;else root.CodexPrices=api;
})(globalThis);
