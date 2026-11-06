/* ISOLATED extension APIs only; retain the runtime object, never page-session data. */
((root)=>{
  'use strict';
  function createClient(api){
    const runtime=api?.runtime,storage=api?.storage?.local;
    const failure=(code,message)=>Object.assign(new Error(message),{code});
    function status(){
      let version=null,valid=null;
      if(typeof runtime?.getManifest==='function'){
        try{version=runtime.getManifest()?.version||null;valid=Boolean(runtime.id);}catch{valid=false;}
      }
      return {available:typeof runtime?.sendMessage==='function',contextValid:valid,version,
        storageAvailable:typeof storage?.get==='function'&&typeof storage?.set==='function'};
    }
    function ensure(){
      if(!status().available)throw failure('RUNTIME_UNAVAILABLE','The extension runtime is unavailable. Enable CODEX SNIPE and fully reload the EA page.');
      if(status().contextValid===false)throw failure('RUNTIME_INVALIDATED','The extension was reloaded, updated or disabled. Fully reload the EA page to reconnect.');
    }
    async function request(message,{timeoutMs=30000}={}){
      if(!['CODEX_GET_PRICES','GPTS_SEARCH_FUTGG'].includes(message?.type))throw failure('BAD_MESSAGE','Unsupported extension request.');
      ensure();let timer;
      try{
        const reply=await Promise.race([
          Promise.resolve().then(()=>runtime.sendMessage(message)),
          new Promise((_,reject)=>{timer=setTimeout(()=>reject(failure('MESSAGE_TIMEOUT','The extension worker did not answer in time. Reload the extension and EA page.')),timeoutMs);})
        ]);
        if(!reply||typeof reply.ok!=='boolean')throw failure('WORKER_NO_RESPONSE','No supported response from the extension worker. Reload CODEX SNIPE and the EA page.');
        return reply;
      }catch(error){
        if(error.code)throw error;
        const invalid=/context invalidated|extension.*(?:unloaded|disabled)/i.test(String(error.message));
        throw failure(invalid?'RUNTIME_INVALIDATED':'WORKER_UNAVAILABLE',invalid?'The extension context expired. Fully reload the EA page.':'The extension worker connection failed. Reload CODEX SNIPE and the EA page.');
      }finally{clearTimeout(timer);}
    }
    return Object.freeze({status,request,
      getURL:path=>{ensure();if(typeof runtime.getURL!=='function')throw failure('RUNTIME_UNAVAILABLE','Extension resources are unavailable. Reload CODEX SNIPE and EA.');return runtime.getURL(path);},
      storageGet:async key=>{if(typeof storage?.get!=='function')throw failure('STORAGE_UNAVAILABLE','Extension storage is unavailable.');return storage.get(key);},
      storageSet:async value=>{if(typeof storage?.set!=='function')throw failure('STORAGE_UNAVAILABLE','Extension storage is unavailable.');return storage.set(value);}
    });
  }
  const common=typeof module==='object'&&module.exports;if(common)module.exports={createClient};
  if(typeof window!=='undefined')window.CodexExtensionClient=createClient(root.chrome);
})(globalThis);
