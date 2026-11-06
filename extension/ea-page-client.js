/* ISOLATED world client. Only a bounded JSON protocol crosses into MAIN. */
(() => {
  'use strict';
  if(window.GPTPageClient)return;
  const channel='gpts-ea-functions-v1', pending=new Map();
  const prefix=crypto.randomUUID();let counter=0;
  window.addEventListener('message',event=>{
    const m=event.data;
    if(event.source!==window||event.origin!==location.origin||m?.channel!==channel||m.direction!=='response')return;
    const p=pending.get(m.id);if(!p)return;
    pending.delete(m.id);clearTimeout(p.timer);
    if(m.ok)p.resolve(m.result);else p.reject(Object.assign(new Error(m.error?.message||'EA bridge error'),{code:m.error?.code}));
  });
  function request(command,args={}) {
    return new Promise((resolve,reject)=>{
      const id=prefix+'-'+(++counter), ms=command==='status'?1200:command==='search'||command==='buy'?12000:command==='options'?45000:6000;
      const timer=setTimeout(()=>{
        pending.delete(id);reject(Object.assign(new Error('EA page bridge did not respond. Reload the Web App after updating the extension.'),{code:'BRIDGE_TIMEOUT'}));
      },ms);
      pending.set(id,{resolve,reject,timer});
      window.postMessage({channel,direction:'request',id,command,args},location.origin);
    });
  }
  window.GPTPageClient=Object.freeze({request});
})();
