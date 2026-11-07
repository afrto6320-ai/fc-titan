/* Independent EA-native strategy profiles. No vendor engine or network code. */
((root)=>{
  'use strict';
  const modes=Object.freeze({
    codex:Object.freeze({id:'codex',label:'CODEX',firstPage:false,order:'native',waitFrom:'start',buyDelay:Object.freeze([0,0]),purchase:'action'}),
    pharaoh:Object.freeze({id:'pharaoh',label:'Pharaoh',firstPage:true,order:'native',waitFrom:'end',buyDelay:Object.freeze([0,0]),purchase:'service'}),
    deep:Object.freeze({id:'deep',label:'Deep',firstPage:true,order:'reference',waitFrom:'end',buyDelay:Object.freeze([180,320]),purchase:'action'}),
    enhancer:Object.freeze({id:'enhancer',label:'Enhancer',firstPage:false,order:'price',waitFrom:'end',buyDelay:Object.freeze([0,0]),purchase:'service'})
  });
  function get(id='codex'){if(!Object.hasOwn(modes,id))throw Error('Unknown engine mode.');return modes[id];}
  function query(id,purpose='scan'){const m=get(id);if(!['scan','snipe'].includes(purpose))throw Error('Unknown market search purpose.');return {firstPageOnly:m.firstPage&&purpose==='snipe'};}
  function unique(items){const map=new Map();for(const item of items){if(!item?.tradeId)throw Error('EA listing has no Trade ID.');map.set(String(item.tradeId),item);}return [...map.values()];}
  function order(items,id,quote,now=Date.now()){
    const mode=get(id),rows=unique(items),price=x=>Number.isFinite(x.price)&&x.price>0?x.price:Infinity;
    if(mode.order==='native')return rows;
    const score=x=>{
      const q=quote&&quote.itemId===x.itemId&&Number.isFinite(quote.retrievedAt)&&now>=quote.retrievedAt&&now-quote.retrievedAt<90000?quote.price:x.marketAverage;
      return Number.isFinite(q)&&q>0&&price(x)<Infinity?(q*.95-x.price)/x.price:-Infinity;
    };
    return rows.sort((a,b)=>{if(mode.order==='reference'){const x=score(a),y=score(b);if(x!==y)return x>y?-1:1;}return price(a)-price(b)||0;});
  }
  function delay(id,random=Math.random()){const [lo,hi]=get(id).buyDelay;return Math.round(lo+(hi-lo)*Math.max(0,Math.min(1,random)));}
  const api=Object.freeze({get,query,order,unique,delay});const common=typeof module==='object'&&module.exports;if(common)module.exports=api;
  if(typeof window!=='undefined')window.CodexEngineModes=api;if(!common||typeof window!=='undefined')root.CodexEngineModes=api;
})(globalThis);
