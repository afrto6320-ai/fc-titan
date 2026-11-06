import './price-providers.js';
import './background.js';
const prices=globalThis.CodexPrices.createClient();
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(message?.type!=='CODEX_GET_PRICES')return;
  prices.get(message.payload||{}).then(result=>reply({ok:true,result})).catch(e=>reply({ok:false,error:String(e?.message||'Price unavailable'),status:Number(e?.status)||0,code:e?.code||'PRICE_UNAVAILABLE'}));
  return true;
});
