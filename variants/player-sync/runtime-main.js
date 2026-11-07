/* CODEX SNIPE 3.17.1 -- EA in-page bridge. No credentials, cookies or raw HTTP.
   Live purchases are opt-in, matched to an 8s native scan snapshot, one trade
   attempt only. No second-path retry after an unknown response. */
(() => {
  'use strict';
  if (window.__GPTS_RUNTIME_MAIN_V317__) return;
  window.__GPTS_RUNTIME_MAIN_V317__ = true;
  const channelIn='GPTS_RUNTIME_V317_REQ';
  const channelOut='GPTS_RUNTIME_V317_RES';
  const labels={quality:'LEVEL',event:'RARITY',position:'POSITION',nation:'NATION',league:'LEAGUE',club:'CLUB'};
  const comparisonHistory=new Map();
  const priceMap={minBid:['minBid','setMinBidPrice'],maxBid:['maxBid','setMaxBidPrice'],minBin:['minBuy','setMinBuyNowPrice'],maxBin:['maxBuy','setMaxBuyNowPrice']};
  const nameOf=x=>x?.constructor?.name ? String(x.constructor.name).slice(0,70) : null;
  const safeError=e=>String(e?.message||e||'Unknown').slice(0,180);
  const own=x=>Object.prototype.hasOwnProperty.call(x||{},'id') && Object.prototype.hasOwnProperty.call(x||{},'value');
  let lastOptions={};
  const playerPools=new Map();let playerPoolIndex=0;
  function instance(){
    if(typeof getAppMain!=='function') return null;
    const app=getAppMain(),root=app?.getRootViewController?.();
    // EA's tab controller exposes getCurrentViewController(), but UTNavigationController
    // exposes getCurrentController(). Mixing them caused controllerActive=false in 3.5.
    const tab=root?.getPresentedViewController?.();
    const nav=tab?.getCurrentViewController?.();
    const active=nav?.getCurrentController?.() ?? nav?.currentController ?? null;
    return {app,root,tab,nav,active,view:active?.getView?.(),vm:active?.viewmodel};
  }
  const isFilters=st=>Boolean(st && typeof UTMarketSearchFiltersViewController==='function' && st.active instanceof UTMarketSearchFiltersViewController && st.vm?.searchCriteria && st.view);
  function probe(){
    const exposed={
      appMain:typeof getAppMain==='function',
      tabTags:typeof UTGameTabBarController==='function'&&!!UTGameTabBarController.TabTag?.TRANSFERS,
      marketSearchController:typeof UTMarketSearchFiltersViewController==='function',
      navigationController:typeof UTNavigationController==='function',
      dataProvider:typeof factories==='object'&&!!factories?.DataProvider,
      itemSearchService:typeof services==='object'&&typeof services?.Item?.searchTransferMarket==='function'
    };
    const data={bridgeVersion:'3.17.1',exposed,marketEnabled:null,rootView:null,presentedView:null,navigationView:null,currentView:null,marketViewVisible:false,status:'not initialized'};
    if(!exposed.appMain){data.status='getAppMain not exposed';return data;}
    try{
      const st=instance(); data.rootView=nameOf(st?.root);data.presentedView=nameOf(st?.tab);data.navigationView=nameOf(st?.nav);data.currentView=nameOf(st?.active);
      data.marketViewVisible=isFilters(st);
      if(typeof services==='object'&&typeof services?.TransferMarket?.isFeatureEnabledForUser==='function')data.marketEnabled=Boolean(services.TransferMarket.isFeatureEnabledForUser());
      data.status=st?.root?'app root located':'app root not ready';
    }catch(e){data.status='EA app not ready: '+safeError(e);}
    return data;
  }
  function openMarket(){
    const pre=probe();
    if(!pre.exposed.appMain||!pre.exposed.tabTags||!pre.exposed.marketSearchController||!pre.exposed.navigationController)
      return {ok:false,stage:'capabilities',message:'EA controller functions not available',runtime:pre};
    if(pre.marketEnabled===false)return {ok:false,stage:'feature',message:'EA reports Transfer Market disabled',runtime:pre};
    try{
      let st=instance();if(!st?.root||typeof st.root.setGameViewTab!=='function')return{ok:false,stage:'root',message:'EA tab controller not ready',runtime:pre};
      st.root.setGameViewTab(UTGameTabBarController.TabTag.TRANSFERS);
      st=instance();
      if(!(st?.nav instanceof UTNavigationController)||typeof st.nav.pushViewController!=='function')return{ok:false,stage:'navigation',message:'EA navigation controller missing',runtime:probe()};
      if(isFilters(st))return{ok:true,stage:'already-open',message:'EA market filters already active',runtime:probe()};
      const ctrl=new UTMarketSearchFiltersViewController();
      if(typeof ctrl.init!=='function')return{ok:false,stage:'init',message:'Filter controller init missing',runtime:probe()};
      ctrl.init();st.nav.pushViewController(ctrl,true);
      const now=probe();
      return now.marketViewVisible
        ? {ok:true,stage:'controller-active',message:'EA search filter controller is active and inspected',runtime:now}
        : {ok:false,stage:'controller-not-active',message:'EA navigation push returned but active controller was not verified',runtime:now};
    }catch(e){return{ok:false,stage:'exception',message:safeError(e),runtime:probe()};}
  }
  function inspectFilters(){
    try{
      const st=instance(),ready=isFilters(st);
      const priceFields={};for(const [id,[field,setter]] of Object.entries(priceMap)){
        priceFields[id]={model:ready&&Object.prototype.hasOwnProperty.call(st.vm.searchCriteria,field)||Boolean(ready&&field in st.vm.searchCriteria),ui:ready&&typeof st.view[setter]==='function'};
        priceFields[id].supported=Boolean(priceFields[id].model&&priceFields[id].ui);
      }
      const api=Boolean(ready&&typeof st.active.eFilterChanged==='function'&&typeof st.view?.getFilters?.()?.setFilters==='function');
      const enumKeys={};for(const [kind,key] of Object.entries(labels))enumKeys[kind]=Boolean(ready&&typeof enums==='object'&&enums?.UISearchFilters?.[key]!==undefined&&api);
      const provider=Boolean(typeof factories==='object'&&factories?.DataProvider);
      return {ok:true,filters:{controllerActive:ready,controller:nameOf(st?.active),priceFields,nativePickerApi:api,enumKeys,dataProvider:provider,selectedPlayer:Boolean(ready&&(st.vm.playerData||st.vm.searchCriteria?.maskedDefId)),selectedPlayerId:ready?Number(st.vm.searchCriteria?.maskedDefId||st.vm.playerData?.id||0):0,
        // These flags are intentionally capability indicators; they are NOT live auction data.
        note:ready?'EA model recognized. User must test actual filter changes.':'Open native Transfer Market Search first.'}};
    }catch(e){return{ok:false,message:safeError(e)};}
  }
  function rawOptions(kind, st){
    const dp=typeof factories==='object'?factories?.DataProvider:null;
    if(!dp)return [];
    const criteria=st.vm?.searchCriteria;
    switch(kind){
      case 'nation':return dp.getNationDP?.()||[];
      case 'league':return dp.getLeagueDP?.(true)||[];
      case 'club':return dp.getTeamDP?.(Number(criteria?.league??-1))||[];
      case 'position':return dp.getPlayerPositionDP?.(false)||[];
      case 'quality':return dp.getRareItemLevelDP?.()||[];
      case 'event':{
        // EA renders special card types as RARITY. This list is feature- and search-dependent.
        const f=st.view?.getFilters?.();return f?.getRarityDataEntries?.(criteria,st.vm)||[];
      }
    }
    return [];
  }
  // Teamconfig names can be localization keys rather than UI-ready names.
  // Resolve using EA's own localization service, preserving the true EA IDs.
  function internalKey(label){
    return /^(?:global\.|search\.|fut\.|loc\.|\w+(?:\.\w+){3,})/i.test(String(label||''));
  }
  function nativeName(raw,kind,id,dp){
    const input=String(raw||'').trim();
    const loc=(value)=>{
      if(!value)return '';
      const str=String(value).trim();
      if(!str)return '';
      for(const service of [dp?.locDelegate,typeof services==='object'?services?.Localization:null]){
        try{
          const text=service?.localize?.(str);
          if(typeof text==='string'&&text.trim()&&!internalKey(text)&&text.trim()!==str)return text.trim();
        }catch{}
      }
      return internalKey(str)?'':str;
    };
    // League labels often include an abbreviation suffix after a localization key.
    const withSuffix=input.match(/^(global\.[^ ]+)\s+(\([^)]*\))$/i);
    if(withSuffix){const v=loc(withSuffix[1]);if(v)return (v+' '+withSuffix[2]).slice(0,120);}
    let name=loc(input);
    if(!name&&kind==='club'){
      const obj=dp?.teamConfigRepo?.getTeam?.(Number(id));
      for(const candidate of [obj?.displayName,obj?.shortName,obj?.sortName,obj?.name]){
        name=loc(candidate);if(name)break;
      }
      if(!name&&typeof UTLocalizationUtil==='function'){
        try{name=loc(UTLocalizationUtil.teamIdToAbbr15(Number(id),dp?.locDelegate));}catch{}
      }
    }
    if(!name&&kind==='nation'){
      const obj=dp?.teamConfigRepo?.getNation?.(Number(id));
      name=loc(obj?.name);
    }
    if(!name&&kind==='league'){
      const obj=dp?.teamConfigRepo?.getLeague?.(Number(id));
      name=loc(obj?.name);
    }
    // Never show opaque internal translation keys as the name of a football team.
    return (name||('EA '+(kind==='club'?'Club':kind==='league'?'League':kind==='nation'?'Nation':'Option')+' #'+id)).slice(0,120);
  }
  function listOptions(kind){
    if(!labels[kind])return{ok:false,reason:'Unsupported category',options:[]};
    const st=instance();if(!isFilters(st))return{ok:false,reason:'Native EA market controller not active',options:[]};
    try{
      const entries=rawOptions(kind,st);
      const dp=typeof factories==='object'?factories?.DataProvider:null;
      const iconGen=st.view?.getFilters?.();
      const enumId=typeof enums==='object'?enums?.UISearchFilters?.[labels[kind]]:null;
      const seenIdentity=new Set(), seenLinked=new Set(), names=new Map(), rows=[];
      let duplicatesHidden=0,missingNames=0;
      // Previous code truncated clubs at 700, hiding many real EA teams.
      for(const e of Array.from(entries||[]).slice(0,5000)){
        if(!e||!own(e))continue;
        const id=String(e.id),value=String(e.value),unique=id+':'+value;
        if(seenIdentity.has(unique)){duplicatesHidden++;continue;}
        seenIdentity.add(unique);
        if(kind==='club'){
          let linkedId=id;
          try{const related=dp?.teamConfigRepo?.getLinkedTeam?.(Number(e.id));if(Number.isInteger(related))linkedId=String(related);}catch{}
          if(seenLinked.has(linkedId)){duplicatesHidden++;continue;}
          seenLinked.add(linkedId);
        }
        const label=nativeName(e.label,kind,e.id,dp);
        if(/^EA (Club|League|Nation|Option) #/.test(label))missingNames++;
        let image='';try{
          const src=iconGen?.generateFilterImage?.(enumId,e.id,e.value);
          if(typeof src==='string'&&src.length<500){const url=new URL(src,location.href);if(url.protocol==='https:')image=url.href;}
        }catch{}
        const row={id:e.id,value:e.value,label,image};
        const nameref=label.trim().toLocaleLowerCase('en-US');
        const prior=names.get(nameref);
        // Different EA IDs with the same name are not silently merged: they
        // stay selectable, but carry an ID label to distinguish actual teams.
        if(prior){row.ambiguous=true;prior.ambiguous=true;}
        else names.set(nameref,row);
        rows.push(row);
      }
      const sorted=rows.map((e,index)=>({index,label:e.ambiguous?e.label+' · EA #'+e.id:e.label,image:e.image,id:String(e.id)}));
      lastOptions[kind]={rows,owner:st.active};
      return {ok:rows.length>0,source:'EA DataProvider',reason:rows.length?'':'EA returned no current options for '+kind,
        options:sorted,stats:{returned:rows.length,duplicatesHidden,untranslated:missingNames,providerCount:entries?.length||0}};
    }catch(e){return{ok:false,source:'EA DataProvider',reason:safeError(e),options:[]};}
  }
  function chooseOption(kind,index){
    if(!labels[kind]||!Number.isInteger(index)||index<0)return{ok:false,reason:'Invalid selection'};
    const st=instance();if(!isFilters(st))return{ok:false,reason:'Native filter controller not active'};
    const cache=lastOptions[kind];const entry=cache?.rows?.[index];if(!entry||cache.owner!==st.active)return{ok:false,reason:'EA controller/options changed. Re-open the list.'};
    try{
      const enumId=enums?.UISearchFilters?.[labels[kind]];
      if(enumId===undefined||typeof st.active.eFilterChanged!=='function')return{ok:false,reason:'EA model event not available'};
      // This is the same event handler wired by EA for the visible filter control.
      st.active.eFilterChanged(null,null,{setId:enumId,id:entry.id,value:entry.value});
      return{ok:true,label:entry.label,id:entry.id,value:String(entry.value)};
    }catch(e){return{ok:false,reason:safeError(e)};}
  }
  // Native EA player autocomplete: use the live search engine, not rendered DOM rows.
  // Only exact entries returned by the original EA engine can be selected.
  function nativePlayerName(entry){
    return String(entry?.commonName||[entry?.firstName,entry?.lastName].filter(Boolean).join(' ')||'Unknown').trim().slice(0,100);
  }
  function searchNativePlayers(query){
    const st=instance();if(!isFilters(st))return{ok:false,reason:'Native EA market search screen is not active'};
    const q=String(query||'').trim();if(q.length<1||q.length>60)return{ok:true,items:[],message:'Enter 1–60 characters'};
    const input=st.view?.getPlayerNameSearch?.();
    if(typeof input?.searchEngine?.getEntriesForString!=='function')return{ok:false,reason:'EA player searchEngine not exposed in this view'};
    const rows=input.searchEngine.getEntriesForString(q,30);
    if(!Array.isArray(rows))return{ok:false,reason:'EA search engine did not return a list'};
    const token='players-'+(++playerPoolIndex);playerPools.set(token,{rows,owner:st.active,query:q});
    if(playerPools.size>6)playerPools.delete(playerPools.keys().next().value);
    const items=rows.slice(0,30).map((entry,index)=>{
      const id=Number(entry?.id);
      if(!Number.isSafeInteger(id)||id<=0)return null;
      let url='';try{url=String(window.AssetLocationUtils?.getPortraitImageUri?.(id)||'').slice(0,500);}catch{}
      return{key:'ea-native-'+id,source:'EA',name:nativePlayerName(entry),playerId:id,itemId:null,rating:Number(entry?.rating)||null,rarity:'EA base player',imageUrl:url,token,index};
    }).filter(Boolean);
    return{ok:true,items,source:'EA native player search engine'};
  }
  function chooseNativePlayer(token,index,id){
    const st=instance(),pool=playerPools.get(String(token||''));
    if(!isFilters(st)||!pool||pool.owner!==st.active)return{ok:false,reason:'EA player suggestions changed; search again'};
    if(!Number.isInteger(index)||index<0||index>=pool.rows.length)return{ok:false,reason:'Invalid EA choice index'};
    const entry=pool.rows[index];if(Number(entry?.id)!==Number(id))return{ok:false,reason:'EA player identity changed'};
    const control=st.view?.getPlayerNameSearch?.();
    if(typeof control?.selectPlayerEntry!=='function')return{ok:false,reason:'EA native player selection unavailable'};
    try{
      control.selectPlayerEntry(entry,nativePlayerName(entry));
      const expected=Number(entry.id),actual=Number(st.vm.searchCriteria?.maskedDefId);
      const selected=control.getSelected?.();
      const selectedId=Number(selected?.id||st.vm.playerData?.id);
      if(actual!==expected && selectedId!==expected)return{ok:false,reason:'EA did not confirm Player ID in search criteria'};
      return{ok:true,playerId:expected,name:nativePlayerName(entry),confirmed:true};
    }catch(e){return{ok:false,reason:safeError(e)};}
  }
  // Clear EA's *market player filter* as well as the extension's selected tile.
  // Never interpret clearing the HTML text alone as clearing maskedDefId.
  function clearNativePlayer(){
    const st=instance();
    if(!isFilters(st))return {ok:false,reason:'EA filter controller not active; native player reset pending'};
    const criteria=st.vm.searchCriteria;
    const oldId=Number(criteria?.maskedDefId||st.vm?.playerData?.id||0);
    const control=st.view?.getPlayerNameSearch?.();
    let controlAction='model-only';
    // Use a supported clear method if this Web App build exposes one. Avoid
    // selectPlayerEntry(null) — that expects a real player entry on some builds.
    try{
      for(const [name,args] of [['clearSelection',[]],['clearSelected',[]],['clear',[]],['setSelected',[null]]]){
        if(typeof control?.[name]==='function'){
          control[name](...args);controlAction=name;break;
        }
      }
    }catch(e){controlAction='control-clear-unavailable: '+safeError(e);}
    // EA's underlying market criteria are authoritative for a service scan.
    // Setting only the player input's text to blank leaves maskedDefId stale.
    try{
      if('maskedDefId' in criteria)criteria.maskedDefId=0;
      if('playerData' in st.vm)st.vm.playerData=null;
    }catch(e){return {ok:false,reason:'EA player criteria not writable: '+safeError(e)};}
    const actual=Number(criteria?.maskedDefId||st.vm?.playerData?.id||0);
    if(actual===0)lastLiveScan=null; // A prior player's Trade ID cannot be reused after clear.
    return {ok:actual===0,playerId:actual,previousPlayerId:oldId,controlAction,
      reason:actual===0?'Native EA player criteria cleared':'EA model retained player ID '+actual};
  }
  function applyPrices(raw){
    const st=instance();if(!isFilters(st))return{ok:false,reason:'EA market filter controller not active'};
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return{ok:false,reason:'Invalid prices'};
    const prices={};
    for(const [id,[field,setter]] of Object.entries(priceMap)){
      if(!Object.prototype.hasOwnProperty.call(raw,id)||raw[id]===''||raw[id]===null)continue;
      const v=Number(raw[id]);if(!Number.isSafeInteger(v)||v<0||v>15000000)return{ok:false,reason:'Invalid price for '+id};
      if(typeof st.view[setter]!=='function'||!st.vm.searchCriteria||!(field in st.vm.searchCriteria))return{ok:false,reason:'EA UI/model missing '+id};
      prices[id]=v;
    }
    if(!Object.keys(prices).length)return{ok:true,applied:[],verified:true};
    const prior=Object.fromEntries(Object.entries(priceMap).map(([key,[field]])=>[key,Number(st.vm.searchCriteria[field]||0)]));
    const effective={...prior,...prices};
    if((effective.minBid>0&&effective.maxBid>0&&effective.minBid>effective.maxBid)||(effective.minBin>0&&effective.maxBin>0&&effective.minBin>effective.maxBin))return{ok:false,reason:'Minimum cannot exceed maximum'};
    try{
      for(const [id,v] of Object.entries(prices)){
        const [field,setter]=priceMap[id]; st.vm.searchCriteria[field]=v;st.view[setter](v);
      }
      const modelVerified=Object.entries(prices).every(([id,v])=>Number(st.vm.searchCriteria[priceMap[id][0]])===v);
      const rows={minBid:'_minBidPriceRow',maxBid:'_maxBidPriceRow',minBin:'_minBuyNowPriceRow',maxBin:'_maxBuyNowPriceRow'};
      const observable=Object.entries(prices).filter(([id])=>st.view[rows[id]] && typeof st.view[rows[id]].value!=='undefined');
      const uiVerified=observable.every(([id,v])=>Number(st.view[rows[id]].value)===v);
      const verified=modelVerified&&uiVerified;
      return{ok:verified,applied:Object.keys(prices),verified,uiRowsChecked:observable.map(([id])=>id),reason:verified?'EA search model updated; visible price row verification '+(observable.length?'passed':'unavailable'):'EA internal model or a price-row value did not match'};
    }catch(e){return{ok:false,reason:safeError(e)};}
  }
  let activeProbe=null, previousMarketFingerprint=null;
  function resultController(controller){
    if(typeof UTMarketSearchResultsViewController==='function'&&controller instanceof UTMarketSearchResultsViewController)return controller;
    if(typeof UTMarketSearchResultsSplitViewController==='function'&&controller instanceof UTMarketSearchResultsSplitViewController)return controller._listController||null;
    return null;
  }
  function marketCardSummary(item){
    const data=item?.getStaticData?.()||item?._staticData||{},auction=item?.getAuctionData?.()||{};
    const getName=()=>{
      for(const val of [item?.name,item?.firstName&&item?.lastName?`${item.firstName} ${item.lastName}`:'',data?.name,data?.commonName,data?.firstName&&data?.lastName?`${data.firstName} ${data.lastName}`:''])if(typeof val==='string'&&val.trim())return val.trim().slice(0,95);
      return 'EA Item';
    };
    let image='';try{image=String(AssetLocationUtils?.getPortraitImageUri?.(item.databaseId)||'');}catch{}
    const integer=v=>{const n=Number(v);return Number.isSafeInteger(n)&&n>=0?n:null;};
    return {name:getName(),rating:integer(item?.rating),itemId:integer(item?.definitionId),playerId:integer(item?.databaseId),tradeId:String(auction?.tradeId||'').slice(0,40),price:integer(auction?.buyNowPrice),image,position:String(item?.preferredPosition||data?.position||''),rarity:String(data?.rarity||item?.rarity||'')};
  }
  // One user-triggered native app-controller search; this DOES NOT issue raw HTTP calls.
  // An observable callback proves a new app event, not guaranteed bypass of EA server caching.
  async function probeMarket(){
    if(activeProbe)return {ok:false,reason:'EA native market probe already running'};
    const current=instance();
    if(!isFilters(current))return {ok:false,reason:'EA search filter controller is not current'};
    if(typeof current.active.eSearchSelected!=='function')return{ok:false,reason:'EA native eSearchSelected is unavailable'};
    if(probe().marketEnabled===false)return{ok:false,reason:'EA transfer market disabled'};
    const startedAt=Date.now();
    try{
      // EA itself owns its market search criteria and its internal cache behavior.
      current.active.eSearchSelected();
    }catch(e){return{ok:false,reason:'EA native search failed: '+safeError(e)};}
    let results=null;
    for(let i=0;i<12;i++){
      results=resultController(instance()?.active);
      if(results)break;
      await new Promise(resolve=>setTimeout(resolve,60));
    }
    if(!results||typeof results.onDataChange?.observe!=='function'||typeof results.onDataChange?.unobserve!=='function')
      return{ok:false,reason:'EA results controller / observable unavailable after native search'};
    return new Promise(resolve=>{
      const observer={};let done=false;
      const finish=(response)=>{
        if(done)return;done=true;clearTimeout(timer);activeProbe=null;
        try{results.onDataChange.unobserve(observer);}catch{}
        resolve(response);
      };
      const timer=setTimeout(()=>finish({ok:false,reason:'Timed out waiting for EA onDataChange; no previous results were reused'}),9800);
      activeProbe={startedAt};
      try{
        results.onDataChange.observe(observer,function(_observable,payload){
          if(!Array.isArray(payload?.items)){finish({ok:false,reason:'EA onDataChange had an unsupported result format'});return;}
          if(resultController(instance()?.active)!==results){finish({ok:false,reason:'EA results view changed during search'});return;}
          const pageSize=Number(results.paginationViewModel?.getNumItemsPerPage?.());
          const trimmed=Number.isSafeInteger(pageSize)&&pageSize>0?payload.items.slice(0,Math.min(pageSize,50)):payload.items.slice(0,30);
          const rows=trimmed.map(marketCardSummary);
          const fingerprints=rows.map(item=>`${item.tradeId}|${item.price}`).sort();
          const fingerprint=JSON.stringify(fingerprints);
          const identical=previousMarketFingerprint===fingerprint&&previousMarketFingerprint!==null;
          previousMarketFingerprint=fingerprint;
          const receivedAt=Date.now();
          finish({ok:true,items:rows,startedAt,receivedAt,durationMs:receivedAt-startedAt,identicalToPrevious:identical,source:'EA onDataChange after eSearchSelected',freshAppEvent:true,serverFreshnessGuaranteed:false});
        });
      }catch(e){finish({ok:false,reason:'Cannot observe EA results: '+safeError(e)});}
    });
  }
  let lastServiceFingerprint=null, activeServiceScan=false;
  let lastLiveScan=null, purchaseBusy=false;
  const attemptedTrades=new Set();
  const PURCHASE_CACHE_MS=8000;
  // Keep original item objects INSIDE the page. Only opaque scan tokens and
  // redacted listing summaries cross the content-script bridge.
  const makeScanToken=()=>{
    try{return crypto.randomUUID();}catch{return String(Date.now())+'-'+Math.random().toString(36).slice(2);}
  };
  function storeLiveScan(rawItems, rows, criteria){
    const token=makeScanToken();
    const offers=new Map();
    for(let i=0;i<rawItems.length;i++){
      const row=rows[i],raw=rawItems[i];
      if(!row||!row.tradeId||!row.playerId||!row.price)continue;
      if(offers.has(row.tradeId))continue;
      offers.set(row.tradeId,{raw,summary:row});
    }
    lastLiveScan={token,offers,at:Date.now(),criteria,
      playerId:Number(criteria?.maskedDefId||0)};
    return token;
  }
  function normalizePurchaseResult(res){
    const code=Number(res?.error?.code||res?.error?.status||res?.code||res?.status||0)||null;
    if(res?.success===true||res?.data?.success===true){
      return {ok:true,status:'acknowledged',code,reason:'EA service returned explicit success; inventory ownership not independently verified'};
    }
    if(res?.success===false||res?.data?.success===false||res?.error){
      return {ok:false,status:'rejected',code,reason:'EA purchase response rejected the operation'};
    }
    return {ok:false,status:'unknown',code,reason:'EA purchase returned no explicit success status; verify inventory manually'};
  }
  // One attempt only: a timeout, ambiguous Promise, or unknown response never
  // triggers a fallback. This prevents duplicate financial transactions.
  async function awaitEAOperation(call){
    let initiated=false;
    return await new Promise(resolve=>{
      let complete=false,observable=null;const observer={};
      const finish=r=>{
        if(complete)return;complete=true;clearTimeout(timer);
        try{observable?.unobserve?.(observer);}catch{}
        resolve(r);
      };
      const timer=setTimeout(()=>finish({ok:false,status:'unknown',reason:'Purchase response timed out; no retry sent'}),8500);
      try{
        const result=call();initiated=true;
        if(result&&typeof result.observe==='function'){
          observable=result;
          result.observe(observer,(_source,response)=>finish(normalizePurchaseResult(response)));
        }else if(result&&typeof result.then==='function'){
          result.then(value=>finish(normalizePurchaseResult(value)),error=>finish({ok:false,status:'unknown',reason:'Purchase Promise rejected: '+safeError(error)}));
        }else finish(normalizePurchaseResult(result));
      }catch(e){finish({ok:false,status:initiated?'unknown':'not-sent',reason:'Purchase call threw: '+safeError(e)});}
    });
  }
  function inspectPurchaseCapabilities(){
    const itemSvc=typeof services==='object'?services?.Item:null;
    const repo=(typeof repositories!=='undefined'&&repositories)?repositories:null;
    const p=typeof itemSvc?.bid==='function';
    const first=typeof itemSvc?.buyNow==='function'?'services.Item.buyNow':typeof repo?.Item?.buyNow==='function'?'repositories.Item.buyNow':typeof itemSvc?.transfersDao?.bid==='function'?'services.Item.transfersDao.bid':null;
    return {ok:true,pharaoh:{available:p,method:p?'services.Item.bid':null},deep:{available:!!first,method:first},
      note:'Capabilities only; existence of a method does not prove successful EA purchases.'};
  }
  async function purchaseMarketItem(msg){
    if(purchaseBusy)return{ok:false,status:'not-sent',reason:'Another purchase is already in progress'};
    const mode=msg?.mode;
    if(!['pharaoh','deep'].includes(mode))return{ok:false,status:'not-sent',reason:'Invalid purchase mode'};
    const snap=lastLiveScan;
    if(!snap||String(msg?.scanToken||'')!==snap.token||Date.now()-snap.at>PURCHASE_CACHE_MS)
      return{ok:false,status:'not-sent',reason:'Listing snapshot missing or expired; no purchase sent'};
    const tradeId=String(msg?.tradeId||'');
    if(!/^\d{5,25}$/.test(tradeId))return{ok:false,status:'not-sent',reason:'Missing valid EA Trade ID'};
    const offer=snap.offers.get(tradeId);
    if(!offer)return{ok:false,status:'not-sent',reason:'Trade ID is not in most recent native EA response'};
    const listing=offer.summary;
    const price=Number(msg?.price),expectedId=Number(msg?.playerId),maxPrice=Number(msg?.maxPrice),remaining=Number(msg?.budgetRemaining);
    if(![price,expectedId,maxPrice,remaining].every(Number.isSafeInteger)||price<150||expectedId<=0||maxPrice<150||remaining<price)
      return{ok:false,status:'not-sent',reason:'Invalid price/player/budget values'};
    if(Number(listing.price)!==price||Number(listing.playerId)!==expectedId||price>maxPrice)
      return{ok:false,status:'not-sent',reason:'EA listing/player/price does not match the verified target'};
    const st=instance(),currentId=Number(st?.vm?.searchCriteria?.maskedDefId||st?.vm?.playerData?.id||0);
    if(!isFilters(st)||currentId!==expectedId||!st?.vm?.searchCriteria)
      return{ok:false,status:'not-sent',reason:'Native EA selected player or controller changed; no purchase sent'};
    const criteriaMax=Number(st.vm.searchCriteria.maxBuy||0);
    if(criteriaMax<=0||price>criteriaMax||price>maxPrice)
      return{ok:false,status:'not-sent',reason:'EA native Max Buy criteria does not cover this price'};
    if(typeof services==='object'&&typeof services?.TransferMarket?.isFeatureEnabledForUser==='function'&&!services.TransferMarket.isFeatureEnabledForUser())
      return{ok:false,status:'not-sent',reason:'EA Transfer Market is disabled'};
    const key=tradeId;
    if(attemptedTrades.has(key))return{ok:false,status:'not-sent',reason:'Purchase already attempted for this Trade ID; duplicate blocked'};
    // Decide a single supported route BEFORE issuing any network request.
    let method=null,runner=null;
    if(mode==='pharaoh'&&typeof services?.Item?.bid==='function'){
      method='services.Item.bid';runner=()=>services.Item.bid(offer.raw,price);
    }else if(mode==='deep'){
      if(typeof services?.Item?.buyNow==='function'){
        method='services.Item.buyNow';runner=()=>services.Item.buyNow(offer.raw);
      }else if(typeof repositories!=='undefined'&&typeof repositories?.Item?.buyNow==='function'){
        method='repositories.Item.buyNow';runner=()=>repositories.Item.buyNow(offer.raw);
      }else if(typeof services?.Item?.transfersDao?.bid==='function'){
        method='services.Item.transfersDao.bid';runner=()=>services.Item.transfersDao.bid(offer.raw,price);
      }
    }
    if(!runner)return{ok:false,status:'not-sent',reason:'Selected EA purchase API is unavailable in this Web App version'};
    if(typeof document!=='undefined'&&document.querySelector('iframe[src*="captcha" i],iframe[src*="arkose" i],.g-recaptcha,.h-captcha,.cf-turnstile,#FunCaptcha'))
      return{ok:false,status:'not-sent',reason:'Security challenge present; operation not sent'};
    purchaseBusy=true;attemptedTrades.add(key);
    if(attemptedTrades.size>500){const old=attemptedTrades.values().next().value;attemptedTrades.delete(old);}
    try{
      const started=Date.now();const outcome=await awaitEAOperation(runner);
      return {...outcome,mode,method,tradeId,price,playerId:expectedId,durationMs:Date.now()-started};
    }finally{purchaseBusy=false;}
  }

  // Mode comparison is observational. These variants use the same EA market, not separate servers.
  // Pharaoh = standard Item service; Enhancer = clear *local* market cache then Item service;
  // Deep = itemDao service if exposed (never falls back to credential-based raw HTTP).
  function scanCapabilities(){
    const item=typeof services==='object'?services?.Item:null;
    return {ok:true,modes:{
      pharaoh:{available:typeof item?.searchTransferMarket==='function',method:'services.Item.searchTransferMarket'},
      enhancer:{available:typeof item?.searchTransferMarket==='function'&&typeof item?.clearTransferMarketCache==='function',method:'clearTransferMarketCache + services.Item.searchTransferMarket'},
      deep:{available:typeof item?.itemDao?.searchTransferMarket==='function',method:'services.Item.itemDao.searchTransferMarket'}
    },note:'Search variants are not different EA servers; repeated listing IDs do not prove caching.'};
  }
  // MAIN owns the actual request values; the native filter model is never mutated.
  function scanCriteria(original,msg){
    if(typeof window.GPTBidLadder?.prepare!=='function')return{ok:false,reason:'Bid ladder helper missing. Reload the full extension and EA page.'};
    try{return{ok:true,...window.GPTBidLadder.prepare(original,msg)};}
    catch(e){return{ok:false,reason:safeError(e)};}
  }
  async function scanMarketService(msg={}){
    if(activeServiceScan)return {ok:false,reason:'EA native service scan already running'};
    const mode=String(msg?.mode||'enhancer');
    if(!['pharaoh','enhancer','deep'].includes(mode))return{ok:false,reason:'Unknown search test mode'};
    const st=instance();
    if(!isFilters(st))return{ok:false,reason:'EA original market search controller is not active',mode};
    if(probe().marketEnabled===false)return{ok:false,reason:'EA market feature is disabled',mode};
    const original=st.vm?.searchCriteria;
    if(!original)return{ok:false,reason:'EA search criteria not available',mode};
    const prepared=scanCriteria(original,msg);
    if(!prepared.ok)return{ok:false,reason:prepared.reason,mode};
    const caps=scanCapabilities().modes[mode];
    if(!caps.available)return{ok:false,reason:mode+' search route not exposed in EA. No fallback substituted.',mode,method:caps.method};
    const {criteria,ladder}=prepared;
    const item=services.Item;
    activeServiceScan=true;
    const startedAt=Date.now();
    let cacheCleared=false;
    if(mode==='enhancer'){
      try{item.clearTransferMarketCache();cacheCleared=true;}
      catch(e){activeServiceScan=false;return{ok:false,reason:'EA local cache clearing failed: '+safeError(e),mode};}
    }
    return await new Promise(resolve=>{
      let settled=false,subscription=null;
      const observer={};
      const finish=result=>{
        if(settled)return;settled=true;activeServiceScan=false;clearTimeout(timer);
        try{subscription?.unobserve?.(observer);}catch{}
        resolve({...result,mode,method:caps.method,cacheCleared,ladder});
      };
      const timer=setTimeout(()=>finish({ok:false,reason:'EA service search response timed out (9s)',timeout:true}),9000);
      try{
        subscription=mode==='deep'?item.itemDao.searchTransferMarket(criteria,1):item.searchTransferMarket(criteria,1);
        if(!subscription||typeof subscription.observe!=='function'){
          finish({ok:false,reason:'EA search returned no observable'});return;
        }
        subscription.observe(observer,function(_observable,res){
          try{
            if(res?.success===false||res?.error){
              const code=Number(res?.error?.code||res?.error?.status||0)||null;
              finish({ok:false,reason:'EA native service returned unsuccessful response',code,status:code,durationMs:Date.now()-startedAt});return;
            }
            if(!Array.isArray(res?.data?.items)){
              finish({ok:false,reason:'EA response did not include an item array',durationMs:Date.now()-startedAt});return;
            }
            const rawItems=res.data.items.slice(0,60),rows=rawItems.map(marketCardSummary);
            const scanToken=storeLiveScan(rawItems,rows,criteria);
            const ids=new Set(rows.map(x=>String(x.tradeId||'')).filter(Boolean));
            const previous=comparisonHistory.get(mode);
            const repeated=[...ids].filter(id=>previous?.ids.has(id)).length;
            const added=previous?[...ids].filter(id=>!previous.ids.has(id)).length:ids.size;
            const lost=previous?[...previous.ids].filter(id=>!ids.has(id)).length:0;
            const identical=Boolean(previous&&ids.size===previous.ids.size&&repeated===ids.size);
            comparisonHistory.set(mode,{ids,at:Date.now()});
            const receivedAt=Date.now();
            finish({ok:true,items:rows,scanToken,startedAt,receivedAt,durationMs:receivedAt-startedAt,
              identicalToPrevious:identical,addedTradeIds:added,repeatedTradeIds:repeated,disappearedTradeIds:lost,
              firstModeSample:!previous,source:caps.method,freshAppEvent:true,serverFreshnessGuaranteed:false});
          }catch(e){finish({ok:false,reason:'Could not parse EA service response: '+safeError(e)});}
        });
      }catch(e){finish({ok:false,reason:'EA market service threw: '+safeError(e)});}
    });
  }
  window.addEventListener('message',async event=>{
    if(event.source!==window||event.origin!==location.origin)return;
    const msg=event.data;
    if(!msg||msg.channel!==channelIn||typeof msg.id!=='string'||msg.id.length>90)return;
    const commands=['probe','open-market','inspect-filters','list-options','choose-option','apply-prices','search-players','choose-player','clear-player','probe-market','scan-market-service','scan-capabilities','purchase-market-item','purchase-capabilities'];
    if(!commands.includes(msg.command))return;
    let result;
    try{
      switch(msg.command){
        case 'probe':result={ok:true,runtime:probe()};break;
        case 'open-market':result=openMarket();break;
        case 'inspect-filters':result=inspectFilters();break;
        case 'list-options':result=listOptions(msg.kind);break;
        case 'choose-option':result=chooseOption(msg.kind,msg.index);break;
        case 'apply-prices':result=applyPrices(msg.prices);break;
        case 'search-players':result=searchNativePlayers(msg.query);break;
        case 'choose-player':result=chooseNativePlayer(msg.token,msg.index,msg.playerId);break;
        case 'clear-player':result=clearNativePlayer();break;
        case 'probe-market':result=await probeMarket();break;
        case 'scan-market-service':result=await scanMarketService(msg);break;
        case 'scan-capabilities':result=scanCapabilities();break;
        case 'purchase-market-item':result=await purchaseMarketItem(msg);break;
        case 'purchase-capabilities':result=inspectPurchaseCapabilities();break;
      }
    }catch(e){result={ok:false,message:safeError(e)};}
    window.postMessage({channel:channelOut,id:msg.id,result},location.origin==='null'?'*':location.origin);
  });
})();
