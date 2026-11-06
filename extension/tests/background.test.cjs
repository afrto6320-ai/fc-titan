const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
let listener;
const tests=[];
const context={
 URL,URLSearchParams,AbortController,setTimeout,clearTimeout,Date,Promise,console,
 chrome:{runtime:{onMessage:{addListener(fn){listener=fn;}}}},
 fetch:async(url)=>{
   tests.push(String(url));
   return {ok:true,json:async()=>({data:[{commonName:'Mohamed Salah',eaId:123,basePlayerEaId:321,overall:90,position:'RW',rarityName:'Gold Rare',imagePath:'2026/sample.png'}],next:false})};
 }
};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'..','background.js'),'utf8'),context);
function ask(message){return new Promise(resolve=>listener(message,null,resolve));}
(async()=>{
 const result=await ask({type:'GPTS_SEARCH_FUTGG',payload:{query:'Salah'}});
 assert.equal(result.ok,true);
 assert.equal(result.result.items.length,1);
 assert.equal(result.result.items[0].name,'Mohamed Salah');
 assert.equal(result.result.items[0].itemId,123);
 assert.equal(result.result.items[0].playerId,321);
 assert.match(tests[0],/name=Salah/);
 console.log('PASS: background search request and normalization (mock network)');
})().catch(e=>{console.error(e);process.exit(1)});
