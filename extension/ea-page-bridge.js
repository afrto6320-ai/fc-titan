/* Runs in Chrome's MAIN world. Fixed operations only; no eval, tokens or raw objects. */
(() => {
  'use strict';
  if (window.__GPT_EA_PAGE_BRIDGE_V1__) return;
  window.__GPT_EA_PAGE_BRIDGE_V1__ = true;
  const CHANNEL = 'gpts-ea-functions-v1';
  const text = v => typeof v === 'string' ? v.slice(0, 160) : '';
  const number = v => Number.isFinite(v) ? v : null;
  const name = p => text(p?.commonName || [p?.firstName, p?.lastName].filter(Boolean).join(' ') || p?.name);
  const is = (o, ctor) => typeof ctor === 'function' && o instanceof ctor;
  const fail = (code, message) => { throw Object.assign(new Error(message), {code}); };
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  let picker = null, activeSearch = null, sequence = 0, activeCommand=null, cancelEpoch=0, preparedSearch=null;
  const playerPools=new Map(),editionCache=new Map(),attemptedTrades=new Set();
  let batch=null,session=null,activePurchase=null;
  function context() {
    const app = typeof getAppMain === 'function' ? getAppMain() : null;
    const root = app?.getRootViewController?.();
    const tabs = root?.getPresentedViewController?.();
    const game = is(tabs, window.UTGameTabBarController);
    const nav = game ? tabs.getCurrentViewController?.() : null;
    const controller = nav?.getCurrentController?.();
    return {root, tabs, nav, controller, game};
  }
  function isFilter(c) { return is(c, window.UTMarketSearchFiltersViewController); }
  function resultController(c) {
    if (is(c, window.UTMarketSearchResultsViewController)) return c;
    if (is(c, window.UTMarketSearchResultsSplitViewController)) return c._listController;
    return null;
  }
  function status() {
    const c = context();
    const marketAllowed = c.game && typeof window.services?.TransferMarket?.isFeatureEnabledForUser === 'function'
      ? window.services.TransferMarket.isFeatureEnabledForUser() === true : false;
    return {bridgeVersion:'3.9.1',mode:'page-functions', appReady:c.game, marketAllowed,
      controller:text(c.controller?.constructor?.name), hasForm:isFilter(c.controller),
      hasResults:Boolean(resultController(c.controller)), busy:Boolean(activeCommand||activeSearch||activePurchase),
      capabilities:{navigation:typeof c.root?.setGameViewTab === 'function',
        filters:typeof window.UTMarketSearchFiltersViewController === 'function',
        search:typeof window.UTMarketSearchFiltersViewController?.prototype?.eSearchSelected === 'function',directSearch:typeof window.services?.Item?.searchTransferMarket==='function',
        purchase:typeof window.UTItemActionController?.prototype?.bid==='function'}};
  }
  function gate() {
    const s = status();
    if (!s.appReady) fail('APP_NOT_READY', 'Open the signed-in EA Web App first.');
    if (!s.marketAllowed) fail('MARKET_UNAVAILABLE', 'EA reports that Transfer Market is unavailable for this session.');
    const cfg = window.services?.Configuration, key = window.UTServerSettingsRepository?.KEY?.PLATFORM_SPLIT_FOR_TRANSFER_MARKET;
    if (key !== undefined && cfg?.checkFeatureEnabled?.(key))
      fail('MARKET_UNAVAILABLE', 'EA reports that Transfer Market is disabled for this platform split.');
    if ([...document.querySelectorAll('iframe[src*="captcha"],.captcha')].some(el=>
      el.getClientRects().length && getComputedStyle(el).visibility!=='hidden'))
      fail('PROTECTION', 'EA verification is open.');
    return context();
  }
  function filters() {
    const c = gate().controller;
    if (!isFilter(c) || !c.viewmodel?.searchCriteria) fail('FORM_NOT_READY', 'Native search controller is not current.');
    return c;
  }
  async function connect() {
    const epoch=cancelEpoch,guard=()=>{if(epoch!==cancelEpoch)fail('CANCELLED','Native navigation stopped.');};
    let ctx = gate();
    if (!isFilter(ctx.controller)) {
      const tag = window.UTGameTabBarController?.TabTag?.TRANSFERS;
      if (tag === undefined || typeof ctx.root.setGameViewTab !== 'function') fail('UNSUPPORTED', 'EA navigation interface changed.');
      // Use EA's own tab and controller stack, as in its AUCTION deep link.
      if (ctx.nav?.tabBarItem?.getTag?.() !== tag) ctx.root.setGameViewTab(tag);
      for (let i=0; i<30; i++) {
        guard();ctx = gate();
        if (is(ctx.nav, window.UTNavigationController) && !ctx.nav.isTransitioning) break;
        await sleep(100);
      }
      guard();if (!is(ctx.nav, window.UTNavigationController) || ctx.nav.isTransitioning)
        fail('NAV_NOT_READY', 'Native Transfers navigation did not become ready.');
      if (!isFilter(ctx.controller)) {
        const existing = ctx.nav.childViewControllers?.find(isFilter);
        if (existing && typeof ctx.nav.popToViewController === 'function') ctx.nav.popToViewController(existing, false);
        else {
          const Controller = window.UTMarketSearchFiltersViewController;
          const criteria = window.services?.User?.getUser?.()?.marketSearchCriteria;
          if (typeof Controller !== 'function' || !criteria) fail('UNSUPPORTED', 'Native search criteria/controller unavailable.');
          const c = new Controller();
          c.initWithSearchCriteria(criteria);
          ctx.nav.pushViewController(c, false);
        }
      }
    }
    picker = null;
    return {ok:true, stage:'search', mode:'page-functions', trace:['EA navigation controller: Transfers', 'EA filter controller: ready'], snapshot:readFilters()};
  }
  const keys = {quality:'LEVEL', event:'RARITY', position:'POSITION', nation:'NATION', league:'LEAGUE', club:'CLUB'};
  function control(kind) {
    if (!Object.hasOwn(keys, kind)) fail('BAD_ARGUMENT', 'Unknown filter.');
    const c = filters(), id = window.enums?.UISearchFilters?.[keys[kind]];
    const ctrl = id === undefined ? null : c.getView()?.getFilters?.()?.searchFilters?.get(id);
    if (!ctrl || typeof ctrl.getOptions !== 'function') fail('FILTER_UNAVAILABLE', 'EA has not exposed this filter in the current search category.');
    return ctrl;
  }
  function readFilters() {
    const c = filters(), q = c.viewmodel.searchCriteria, view = c.getView();
    const player = view?.getPlayerNameSearch?.()?.getSelected?.();
    const selections = {};
    for (const kind of Object.keys(keys)) {
      try {const ctrl=control(kind);selections[kind]={id:number(ctrl.id),label:window.CodexEAOptions?.resolvedName(ctrl.label)||`EA ${kind} #${ctrl.id}`,enabled:ctrl.isInteractionEnabled?.() !== false&&(kind!=='club'||number(q.league)>0)};}
      catch { selections[kind]=null; }
    }
    const criteriaKey=JSON.stringify([number(q.maskedDefId),Object.keys(keys).map(k=>selections[k]?.id??null),q.rarities||[]]);
    return {...status(), criteriaKey, prices:{minBid:number(q.minBid),maxBid:number(q.maxBid),minBin:number(q.minBuy),maxBin:number(q.maxBuy)},
      player:player?{id:number(player.id),name:name(player),rating:number(player.rating)}:null,
      maskedDefId:number(q.maskedDefId),rarities:Array.isArray(q.rarities)?q.rarities.filter(Number.isFinite):[],selections};
  }
  async function options(kind,refresh=false) {
    if(kind==='club'&&!(number(filters().viewmodel.searchCriteria.league)>0))fail('LEAGUE_REQUIRED','Choose an EA league before opening Club.');
    const ctrl = control(kind), entries = ctrl.getOptions();
    if (!Array.isArray(entries) || entries.length>10000) fail('UNSUPPORTED', 'Invalid native option collection.');
    const playerId=readFilters().player?.id||null;
    let editions=null;
    if(kind==='event'&&playerId){
      editions=await playerEditions(playerId,refresh);
      if(readFilters().player?.id!==playerId)fail('STALE_PLAYER','Player changed while editions were loading.');
      if(!editions.complete)fail('EDITIONS_INCOMPLETE','EA did not return the complete player-edition list; refresh it before choosing an event.');
    }
    const token = String(++sequence);
    const model=window.CodexEAOptions;
    if(!model)fail('UNSUPPORTED','Reload the Web App to load the option adapter.');
    const view=filters().getView()?.getFilters?.(),enumId=window.enums.UISearchFilters[keys[kind]];
    const repo=window.factories?.DataProvider?.teamConfigRepo;
    const lookup=new Map(),leagues=new Map();
    // Read only native reference-data records, never account objects.
    try{
      for(const row of repo?.getLeagues?.()||[])leagues.set(Number(row.id),row.name);
      const data=kind==='club'?repo?.getTeams?.():kind==='league'?repo?.getLeagues?.():kind==='nation'?repo?.getNations?.():[];
      for(const row of data||[])lookup.set(Number(row.id),row);
    }catch{}
    const presented=model.present(entries,{kind,base:location.href,
      getMetadata:entry=>{const row=lookup.get(Number(entry.id));return row?{name:row.name,leagueId:row.league,leagueLabel:leagues.get(row.league)}:null;},
      getIcon:entry=>ctrl.iconTable?.get?.(entry.value),
      getFallbackImage:entry=>{try{return view?.generateFilterImage?.(enumId,entry.id,entry.value)||'';}catch{return '';}},
      getExtraImages:entry=>{
        const fn={club:'getBadgeImageUri',league:'getLeagueImageUri',nation:'getFlagImageUri'}[kind];
        try{return fn&&entry.id>=0&&typeof window.AssetLocationUtils?.[fn]==='function'?[window.AssetLocationUtils[fn](entry.id,window.UIThemeVariation?.DARK)]:[];}catch{return [];}
      },
      getAlternateName:entry=>{try{return kind==='club'?window.UTLocalizationUtil?.teamIdToAbbr3?.(entry.id,window.services.Localization)||'':'';}catch{return '';}}
    });
    if(editions){
      const ids=new Set(editions.items.map(x=>x.rarityId));
      presented.options=presented.options.filter(x=>x.id===-1||ids.has(x.id));
      presented.meta={...presented.meta,uniqueCount:presented.options.length,playerId,scope:'selected-player',editionCount:editions.items.length,verifiedAt:editions.at};
    }
    picker = {ctrl,entries,kind,token,playerId,leagueId:kind==='club'?number(filters().viewmodel.searchCriteria.league):null,owner:filters(),signatures:entries.map(model.identity),indices:new Set(presented.options.map(x=>x.index)),labels:new Map(presented.options.map(x=>[x.index,x.label]))};
    return {ok:true,mode:'page-functions',token,...presented};
  }
  function choose(args) {
    const p=picker;
    if (!p || args.token!==p.token || p.owner!==filters() || control(p.kind)!==p.ctrl || readFilters().player?.id!==p.playerId && !(readFilters().player==null&&p.playerId==null))
      fail('STALE_OPTIONS','Reopen the native filter list.');
    if(p.kind==='club'&&(!(p.leagueId>0)||number(filters().viewmodel.searchCriteria.league)!==p.leagueId))fail('STALE_OPTIONS','The league changed; reopen Club for the current league.');
    if (!Number.isInteger(args.index) || !p.indices.has(args.index)) fail('BAD_ARGUMENT','Invalid option index.');
    const current=p.ctrl.getOptions(), chosen=p.entries[args.index];
    if (current.length!==p.entries.length || current.some((v,i)=>window.CodexEAOptions.identity(v)!==p.signatures[i]))
      fail('STALE_OPTIONS','EA changed the filter options.');
    if (p.ctrl.isInteractionEnabled?.()===false) fail('FILTER_LOCKED','EA locked this filter for the current player/category.');
    p.ctrl.setIndex(args.index); // EA dispatches CHANGE and updates dependent filters itself.
    picker=null;
    return {ok:true,label:p.labels.get(args.index),snapshot:readFilters()};
  }
  function lookup(query) {
    if (typeof query!=='string'||query.trim().length<2||query.length>50) fail('BAD_ARGUMENT','Enter 2–50 characters.');
    const ctrl=filters().getView()?.getPlayerNameSearch?.();
    if (typeof ctrl?.searchEngine?.getEntriesForString!=='function') fail('PLAYER_UNAVAILABLE','Native player search engine not ready.');
    const rows=ctrl.searchEngine.getEntriesForString(query.trim(),30);
    if (!Array.isArray(rows)) fail('UNSUPPORTED','Native player search interface changed.');
    return [...new Map(rows.slice(0,30).filter(p=>Number.isSafeInteger(Number(p.id))&&Number(p.id)>0).map(p=>[Number(p.id),p])).values()];
  }
  function players(query) {
    const rows=lookup(query),token='players-'+(++sequence);
    playerPools.set(token,{rows,query});while(playerPools.size>6)playerPools.delete(playerPools.keys().next().value);
    return {ok:true,items:rows.map(p=>{
      let imageUrl='';try{imageUrl=window.CodexEAOptions.assetUrl(window.AssetLocationUtils?.getPortraitImageUri?.(p.id),location.href);}catch{}
      return {key:'ea-player-'+p.id,source:'ea-native',nativeToken:token,searchQuery:query,playerId:Number(p.id),itemId:null,
        name:name(p),rating:number(p.rating),position:position(p),rarity:'EA base player',imageUrl,imageSource:imageUrl?'ea-portrait':'unavailable'};
    })};
  }
  function selectPlayer(args) {
    let id=args.id,matches=[],resolution='native-player-id';
    const itemId=Number(args.itemId),mask=window.ItemIdMask?.DATABASE;
    if(args.source!=='ea-native'&&Number.isSafeInteger(itemId)&&itemId>0&&Number.isInteger(mask)&&mask>0){id=itemId&mask;resolution='ea-database-mask';}
    if (!Number.isSafeInteger(id)||id<=0) fail('BAD_ARGUMENT','Invalid EA player ID. Select a native EA suggestion.');
    if(args.nativeToken){
      const pool=playerPools.get(args.nativeToken);
      if(!pool)fail('PLAYER_STALE','Search EA again and select its current suggestion.');
      matches=pool.rows.filter(p=>Number(p.id)===id);
    }else{
      const queries=[args.searchQuery,args.query,...String(args.query||'').split(/\s+/)].filter(q=>typeof q==='string'&&q.length>=2&&q.length<=50);
      for(const q of [...new Set(queries)].slice(0,5)){
        matches=lookup(q).filter(p=>Number(p.id)===id);if(matches.length===1)break;
      }
    }
    if (matches.length!==1) fail('PLAYER_MISMATCH','EA did not return one matching player ID.');
    const c=filters(), previous=readFilters().player?.id,ctrl=c.getView().getPlayerNameSearch();
    ctrl.selectPlayerEntry(matches[0],name(matches[0]));
    if(previous!==id){
      for(const kind of ['quality','event']){
        const field=control(kind),any=field.getOptions().findIndex(x=>Number(x.id)===-1);
        if(any>=0)field.setIndex(any);
      }
    }
    const snap=readFilters();
    if (Number(snap.player?.id)!==id || Number(snap.maskedDefId)!==id) fail('PLAYER_MISMATCH','EA did not confirm the player criteria.');
    return {ok:true,resolvedPlayerId:id,resolution,snapshot:snap};
  }
  function clearPlayer() {
    const c=filters(),ctrl=c.getView()?.getPlayerNameSearch?.();
    if(typeof ctrl?.clearInput!=='function'||typeof c.ePlayerNameChanged!=='function')fail('UNSUPPORTED','EA player clear interface changed.');
    ctrl.clearInput();c.ePlayerNameChanged();
    return {ok:true,snapshot:readFilters()};
  }
  const prices = {
    minBid:['eMinBidPriceChanged','setMinBidPrice','minBid'], maxBid:['eMaxBidPriceChanged','setMaxBidPrice','maxBid'],
    minBin:['eMinBuyPriceChanged','setMinBuyNowPrice','minBuy'], maxBin:['eMaxBuyPriceChanged','setMaxBuyNowPrice','maxBuy']
  };
  function applyPrices(args) {
    const c=filters(), v=c.getView();
    if (!args || typeof args!=='object' || Object.keys(args).some(k=>!Object.hasOwn(prices,k))) fail('BAD_ARGUMENT','Unknown price field.');
    for(const [key,value] of Object.entries(args)) {
      if (!Number.isSafeInteger(value)||value<0||value>15000000) fail('BAD_ARGUMENT','Invalid coin price.');
      const [handler,setter]=prices[key];
      if (typeof c[handler]!=='function'||typeof v[setter]!=='function') fail('UNSUPPORTED','EA price interface changed.');
    }
    for(const [key,value] of Object.entries(args)) {
      const [handler,setter,field]=prices[key];c[handler](null,null,{value});v[setter](value);
      if (c.viewmodel.searchCriteria[field]!==value) fail('PRICE_MISMATCH','EA did not accept '+key);
    }
    const snapshot=readFilters();for(const [key,value] of Object.entries(args))if(snapshot.prices[key]!==value)fail('PRICE_MISMATCH','EA changed '+key+' while applying another price field; use the native SDK route.');
    return {ok:true,snapshot};
  }
  function position(item){
    const data=item?.getStaticData?.();
    for(const raw of [item?.preferredPosition,item?.position,data?.preferredPosition,data?.position]){
      const numeric=typeof raw==='number'||typeof raw==='string'&&/^\d+$/.test(raw);
      const label=numeric?window.PlayerPosition?.[Number(raw)]:typeof raw==='string'?raw.toUpperCase():null;
      if(typeof label==='string'&&/^(GK|SW|RWB|RB|CB|LB|LWB|CDM|CM|CAM|RM|LM|RW|LW|CF|ST)$/.test(label))return label;
    }
    return '';
  }
  function changedView(){
    const notice=[...document.querySelectorAll('[role="alert"],.ut-notification-queue,.ut-notification-view')].find(el=>el.getClientRects().length)?.textContent?.trim();
    return 'EA closed or changed its results view before a confirmed response.'+(notice?' EA notice: '+text(notice):' Reconnect and scan again; no old listings were used.');
  }
  function itemSummary(item) {
    const s=item.getStaticData?.(), auction=item.getAuctionData?.();
    return {name:name(s),position:position(item),rating:number(item.rating),instanceId:text(String(item.id||'')),itemId:number(item.definitionId),playerId:number(item.databaseId),
      image:text(window.AssetLocationUtils?.getPortraitImageUri?.(item.databaseId)||''),rarityId:number(item.rareflag),price:number(auction?.buyNowPrice),marketAverage:number(item.getMarketAverage?.()),tradeId:text(String(auction?.tradeId||''))};
  }
  const resultHistory=new Map();
  function compareResults(criteriaKey,prices,items){
    const key=JSON.stringify([criteriaKey,prices.minBid,prices.minBin,prices.maxBin]),previous=resultHistory.get(key);
    const value=JSON.stringify(items.map(x=>[x.tradeId,x.price]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))));
    const oldIDs=new Set(previous?.ids||[]);resultHistory.set(key,{value,ids:items.map(x=>x.tradeId)});
    if(resultHistory.size>32)resultHistory.delete(resultHistory.keys().next().value);
    return {identicalToPrevious:Boolean(previous&&previous.value===value),newTrades:previous?items.filter(x=>!oldIDs.has(x.tradeId)).length:null};
  }
  function validatePrices(args){
    if(!args||typeof args!=='object'||Object.keys(args).some(k=>!Object.hasOwn(prices,k)))fail('BAD_ARGUMENT','Unknown SDK price field.');
    for(const key of Object.keys(prices))if(!Number.isSafeInteger(args[key])||args[key]<0||args[key]>15000000)fail('BAD_ARGUMENT','Invalid SDK price.');
    if(args.maxBin<150||args.minBin>args.maxBin||args.maxBid&&args.minBid>args.maxBid)fail('BAD_ARGUMENT','Inconsistent SDK price constraints.');
  }
  function prepareSearch(args){
    const c=filters(),ctx=gate(),snapshot=readFilters();validatePrices(args.prices);
    if(args.criteriaKey!==snapshot.criteriaKey)fail('FILTER_MISMATCH','Native category/player filters changed.');
    if(typeof window.services?.Item?.searchTransferMarket!=='function'||typeof window.services?.Item?.clearTransferMarketCache!=='function'||typeof window.UTSearchCriteriaDTO!=='function')fail('SDK_UNAVAILABLE','EA native market SDK is unavailable. Choose the EA screen route with fixed bids.');
    preparedSearch={id:++sequence,controller:c,nav:ctx.nav,criteriaKey:snapshot.criteriaKey,prices:{...args.prices},at:Date.now()};
    return {ok:true,planId:preparedSearch.id,prices:{...preparedSearch.prices},snapshot,source:'ea-sdk-direct'};
  }
  function sdkCriteria(c,plan,pageSize){
    const dto=new window.UTSearchCriteriaDTO();if(typeof dto.update!=='function')fail('SDK_UNAVAILABLE','EA criteria clone method changed.');
    dto.update(c.viewmodel.searchCriteria);
    if((Number(dto.maskedDefId)||0)!==(Number(c.viewmodel.searchCriteria.maskedDefId)||0))fail('PLAYER_MISMATCH','SDK criteria clone changed the player ID.');
    if(Array.isArray(dto.rarities))dto.rarities=[...dto.rarities];if(Array.isArray(dto.defId))dto.defId=[...dto.defId];
    Object.assign(dto,{minBid:plan.prices.minBid,maxBid:plan.prices.maxBid,minBuy:plan.prices.minBin,maxBuy:plan.prices.maxBin,count:pageSize+1,offset:0});
    for(const [key,[,,field]] of Object.entries(prices))if(dto[field]!==plan.prices[key])fail('PRICE_MISMATCH','SDK criteria did not retain '+key);
    return dto;
  }
  async function searchSDK(args){
    const c=filters(),ctx=gate(),snapshot=readFilters(),plan=preparedSearch,limit=args.limit??20;
    if(!Number.isSafeInteger(limit)||limit<1||limit>100)fail('BAD_ARGUMENT','Choose 1–100 market results.');
    if(!plan||args.planId!==plan.id||plan.controller!==c||plan.nav!==ctx.nav||plan.criteriaKey!==snapshot.criteriaKey||args.criteriaKey!==snapshot.criteriaKey||Date.now()-plan.at>30000)fail('STALE_PLAN','Prepare the current SDK filters before searching.');
    if(args.maxBin!==plan.prices.maxBin||args.playerId&&snapshot.player?.id!==args.playerId)fail('FILTER_MISMATCH','SDK price/player differs from the prepared query.');
    const config=typeof getAppMain==='function'?getAppMain().getConfigRepository?.():null,repo=window.EAConfigurationRepository;
    const settings=repo&&config?.getConfigObject?.(repo.KEY_ITEMS_PER_PAGE),pageSize=settings?.[repo?.ITEMS_PER_PAGE?.TRANSFER_MARKET]??20;
    if(!Number.isSafeInteger(pageSize)||pageSize<1||pageSize>100)fail('SDK_UNAVAILABLE','EA page size changed.');
    const dto=sdkCriteria(c,plan,pageSize),id=++sequence,startedAt=Date.now(),items=new Map(),itemTimes=new Map();
    let stopped=false,observable=null,owner=null,rejectPending=null,pages=0,endOfList=false,statusCode=null;
    const guard=()=>{if(stopped)fail('CANCELLED','SDK search stopped.');gate();if(context().nav!==ctx.nav||context().controller!==c||readFilters().criteriaKey!==snapshot.criteriaKey)fail('VIEW_CHANGED',changedView());};
    const waitResponse=out=>new Promise((resolve,reject)=>{
      if(typeof out?.observe!=='function'||typeof out?.unobserve!=='function')return reject(Object.assign(Error('Native SDK observable changed.'),{code:'SDK_UNAVAILABLE'}));
      observable=out;owner={};let done=false;
      const finish=(error,data)=>{if(done)return;done=true;clearTimeout(timer);clearInterval(poll);out.unobserve(owner);observable=null;owner=null;rejectPending=null;error?reject(error):resolve(data);};
      const timer=setTimeout(()=>finish(Object.assign(Error('EA SDK response timed out.'),{code:'SEARCH_TIMEOUT'})),10000);
      const poll=setInterval(()=>{try{guard();}catch(e){finish(e);}},100);
      rejectPending=e=>finish(e);out.observe(owner,(_event,data)=>{try{guard();finish(null,data);}catch(e){finish(e);}});
    });
    batch=null;activeSearch={cancel:()=>{stopped=true;rejectPending?.(Object.assign(Error('SDK search stopped.'),{code:'CANCELLED'}));}};
    try{
      for(let page=1;page<=Math.ceil(limit/pageSize);page++){
        guard();dto.offset=(page-1)*pageSize;window.services.Item.clearTransferMarketCache();
        const reply=await waitResponse(window.services.Item.searchTransferMarket(dto,page));guard();
        if(reply?.success!==true||!Array.isArray(reply.data?.items))fail('SEARCH_REJECTED','EA SDK rejected the market search (status '+String(reply?.status??'unknown')+', code '+String(reply?.error?.code??'unknown')+').');
        statusCode=number(reply.status);for(const [key,[,,field]] of Object.entries(prices))if(dto[field]!==plan.prices[key])fail('PRICE_MISMATCH','EA SDK altered '+key+' during search.');
        pages++;const before=items.size;
        for(const item of reply.data.items.slice(0,pageSize)){const tradeId=String(item.getAuctionData?.()?.tradeId||'');if(!tradeId)fail('SDK_UNAVAILABLE','SDK listing has no Trade ID.');items.set(tradeId,item);itemTimes.set(tradeId,Date.now());}
        endOfList=reply.data.items.length<=pageSize||items.size===before;
        if(endOfList||items.size>=limit)break;
      }
      guard();const actual=[...items.values()].slice(0,limit),summaries=actual.map(item=>({...itemSummary(item),observedAt:itemTimes.get(String(item.getAuctionData().tradeId))})),receivedAt=Date.now();
      const audit=compareResults(snapshot.criteriaKey,plan.prices,summaries);
      batch={id,route:'sdk',controller:c,nav:ctx.nav,at:receivedAt,itemTimes,criteriaKey:snapshot.criteriaKey,items:new Map(actual.map(item=>[String(item.getAuctionData().tradeId),item]))};
      return {ok:true,searchId:id,transport:'ea-sdk-direct',items:summaries,count:summaries.length,requested:limit,pages,pageSize,endOfList,startedAt,receivedAt,durationMs:Math.max(0,receivedAt-startedAt),localCacheCleared:true,freshEvent:true,...audit,nativePrices:{...plan.prices},sdkStatus:statusCode,moreAvailable:!endOfList||items.size>limit};
    }finally{if(observable&&owner)observable.unobserve(owner);activeSearch=null;}
  }
  function search(args){return args.route==='sdk'?searchSDK(args):searchScreen(args);}
  async function searchScreen(args) {
    const c=filters(), ctx=gate(), snapshot=readFilters(),limit=args.limit??20;
    if(!Number.isSafeInteger(limit)||limit<1||limit>100)fail('BAD_ARGUMENT','Choose 1–100 market results.');
    if (!Number.isSafeInteger(args.maxBin)||args.maxBin<=0||snapshot.prices.maxBin!==args.maxBin)
      fail('PRICE_MISMATCH','Native Max Buy Now must equal the configured price.');
    if (args.criteriaKey!==snapshot.criteriaKey) fail('FILTER_MISMATCH','Native filters changed since Start.');
    if (args.playerId && (snapshot.player?.id!==args.playerId||snapshot.maskedDefId!==args.playerId))fail('PLAYER_MISMATCH','Native player selection changed.');
    if(typeof c.eSearchSelected!=='function'||typeof window.services?.Item?.clearTransferMarketCache!=='function')fail('UNSUPPORTED','Native fresh-search interface changed.');
    batch=null;
    window.services.Item.clearTransferMarketCache(); // Explicit local eviction, including between rapid manual requests.
    // Native eSearchSelected clears EA's local transfer-market cache before requesting page 1.
    c.eSearchSelected();
    const top=gate().controller,results=resultController(top);
    if(typeof results?.onDataChange?.observe!=='function'||typeof results?.onDataChange?.unobserve!=='function'||top===c)fail('RESULTS_UNAVAILABLE','EA did not open a compatible results controller.');
    const pageSize=results.paginationViewModel?.getNumItemsPerPage?.();
    if(!Number.isSafeInteger(pageSize)||pageSize<1||pageSize>100)fail('UNSUPPORTED','EA pagination size is unavailable.');
    return new Promise((resolve,reject)=>{
      const observer={},generation=++sequence,found=new Map(),itemTimes=new Map(),startedAt=Date.now();
      let timer,poll,nextTimer,done=false,page=1,pages=0,ended=false,rawRows=0;
      const finish=(error)=>{
        if(done)return;done=true;clearTimeout(timer);clearTimeout(nextTimer);clearInterval(poll);results.onDataChange.unobserve(observer);activeSearch=null;
        if(error){batch=null;reject(error);return;}
        try{
          const items=[...found.values()].slice(0,limit),summaries=items.map(item=>({...itemSummary(item),observedAt:itemTimes.get(String(item.getAuctionData().tradeId))})),receivedAt=Date.now();
          const audit=compareResults(snapshot.criteriaKey,snapshot.prices,summaries);
          batch={id:generation,top:context().controller,nav:ctx.nav,results,at:receivedAt,itemTimes,criteriaKey:snapshot.criteriaKey,items:new Map(items.map(item=>[String(item.getAuctionData().tradeId),item]))};
          resolve({ok:true,searchId:generation,items:summaries,count:items.length,requested:limit,pages,pageSize,endOfList:ended,
            startedAt,receivedAt,localCacheCleared:true,freshEvent:true,...audit,filtersUnchanged:true,duplicateTradesRemoved:Math.max(0,rawRows-found.size),nativePrices:snapshot.prices,transport:'ea-screen',moreAvailable:!ended||found.size>limit});
        }catch(e){batch=null;reject(Object.assign(new Error('EA result item format changed.'),{code:'UNSUPPORTED'}));}
      };
      const armTimeout=()=>{clearTimeout(timer);timer=setTimeout(()=>finish(Object.assign(new Error('No confirmed fresh EA result event.'),{code:'SEARCH_TIMEOUT'})),10000);};
      activeSearch={cancel:()=>finish(Object.assign(new Error('Search stopped.'),{code:'CANCELLED'}))};
      results.onDataChange.observe(observer,function(_observable,data){
        try{
          gate();if(context().nav!==ctx.nav||resultController(context().controller)!==results)fail('VIEW_CHANGED',changedView());
          if(!Array.isArray(data?.items))fail('UNSUPPORTED','EA result event changed.');
          pages++;const before=found.size;
          // EA overfetches one sentinel row: it belongs to the next page, not this one.
          rawRows+=data.items.slice(0,pageSize).length;
          for(const item of data.items.slice(0,pageSize)){
            const id=String(item.getAuctionData?.()?.tradeId||'');if(!id)fail('UNSUPPORTED','EA listing lacks a Trade ID.');found.set(id,item);itemTimes.set(id,Date.now());
          }
          ended=data.items.length<=pageSize||found.size===before;
          if(ended||found.size>=limit){finish();return;}
          if(typeof results._requestItems!=='function')fail('UNSUPPORTED','EA native pagination is unavailable.');
          // Defer until EA finishes updating its own page model after onDataChange.
          clearTimeout(timer);nextTimer=setTimeout(()=>{try{gate();if(context().nav!==ctx.nav||resultController(context().controller)!==results)fail('VIEW_CHANGED',changedView());page++;window.services.Item.clearTransferMarketCache();armTimeout();results._requestItems(page);}catch(e){finish(e);}},0);
        }catch(e){finish(e);}
      });
      armTimeout();poll=setInterval(()=>{try{gate();if(context().nav!==ctx.nav||resultController(context().controller)!==results)fail('VIEW_CHANGED',changedView());}catch(e){finish(e);}},200);
    });
  }
  function observeNative(observable,timeout=10000){
    if(typeof observable?.observe!=='function'||typeof observable?.unobserve!=='function')fail('UNSUPPORTED','EA observable interface changed.');
    return new Promise((resolve,reject)=>{
      const owner={};let done=false;
      const finish=(error,data)=>{if(done)return;done=true;clearTimeout(timer);observable.unobserve(owner);error?reject(error):resolve(data);};
      const timer=setTimeout(()=>finish(Object.assign(new Error('EA operation did not confirm its result.'),{code:'NATIVE_TIMEOUT'})),timeout);
      try{observable.observe(owner,(_event,data)=>finish(null,data));}catch(e){finish(e);}
    });
  }
  async function playerEditions(id,refresh){
    const cached=editionCache.get(id);
    if(!refresh&&cached&&Date.now()-cached.at<120000)return cached;
    if(typeof window.services?.Item?.searchConceptItems!=='function'||typeof window.UTSearchCriteriaDTO!=='function')fail('EDITIONS_UNAVAILABLE','EA concept catalogue is unavailable; the general event list is not a verified player edition list.');
    const all=new Map();let complete=false,offset=0;const deadline=Date.now()+30000;
    for(let page=0;page<5&&Date.now()<deadline;page++){
      gate();const q=new window.UTSearchCriteriaDTO();q.type=window.SearchType.PLAYER;q.defId=[id];q.count=20;q.offset=offset;
      const reply=await observeNative(window.services.Item.searchConceptItems(q),Math.min(8000,deadline-Date.now()));
      if(!reply?.success||!Array.isArray(reply.response?.items))fail('EDITIONS_UNAVAILABLE','EA could not confirm the player catalogue.');
      for(const item of reply.response.items){const dto=itemSummary(item);if(dto.playerId===id&&Number.isInteger(dto.rarityId)&&dto.rarityId>=0)all.set(dto.itemId,dto);}
      offset+=reply.response.items.length;
      if(reply.response.endOfList===true||reply.response.endOfList!==false&&reply.response.items.length<20){complete=true;break;}
    }
    const result={items:[...all.values()],complete,at:Date.now()};if(complete)editionCache.set(id,result);return result;
  }
  function validQuote(q,id){return q&&['futgg','futbin'].includes(q.provider)&&['pc','console'].includes(q.platform)&&q.itemId===Number(id)&&Number.isSafeInteger(q.price)&&q.price>0&&Number.isFinite(q.retrievedAt)&&Date.now()-q.retrievedAt>=0&&Date.now()-q.retrievedAt<90000;}
  function updateQuote(args){
    const current=session,q=args.quote;
    if(!current||current.cancelled||current.id!==args.sessionId||!current.referenceQuote)fail('SESSION_INVALID','No active provider-priced session.');
    if(!validQuote(q,current.definitionId)||q.provider!==current.referenceQuote.provider||q.platform!==current.referenceQuote.platform)fail('QUOTE_STALE','The refreshed quote differs from the configured source, platform or edition.');
    if(!Number.isSafeInteger(args.maxPrice)||args.maxPrice<150||args.maxPrice>current.hardMaxPrice)fail('LIMIT','Provider price cannot exceed the configured Max Buy Now.');
    current.referenceQuote=q;current.referencePrice=q.price;current.maxPrice=args.maxPrice;return {ok:true};
  }
  function beginSession(args){
    const snap=readFilters();
    if(session?.uncertain)fail('PURCHASE_UNCERTAIN','Review the previous purchase in EA and reload the Web App before starting again.');
    if(args.criteriaKey!==snap.criteriaKey)fail('FILTER_MISMATCH','EA filters changed before session start.');
    for(const [key,upper] of [['maxPrice',15000000],['maxSpend',30000000],['maxBuys',30]])if(!Number.isSafeInteger(args[key])||args[key]<=0||args[key]>upper)fail('BAD_ARGUMENT','Invalid native session limit.');
    if(args.route==='sdk'&&(!preparedSearch||args.planId!==preparedSearch.id||preparedSearch.criteriaKey!==snap.criteriaKey||preparedSearch.prices.maxBin!==args.maxPrice))fail('STALE_PLAN','SDK session requires a matching prepared price plan.');
    if(args.maxSpend<args.maxPrice)fail('BAD_ARGUMENT','Session budget is below maximum price.');
    if(args.itemId&&(!Number.isSafeInteger(Number(args.itemId))||Number(args.itemId)<0||Number(args.itemId)>0xffffffff))fail('BAD_ARGUMENT','Invalid card definition ID.');
    if(args.referenceQuote&&(!validQuote(args.referenceQuote,args.itemId)||args.referenceQuote.price!==args.referencePrice))fail('QUOTE_STALE','A fresh quote for the exact edition and platform is required.');
    const targets=Array.isArray(args.targets)?args.targets:[];
    if(targets.length>12||targets.some(t=>typeof t.key!=='string'||t.key.length>100||!Number.isSafeInteger(t.playerId)||t.playerId<=0||t.playerId>0xffffff||t.itemId&&(!Number.isSafeInteger(t.itemId)||t.itemId<=0||t.itemId>0xffffffff)||!Array.isArray(t.rarities)||t.rarities.length>20||t.rarities.some(x=>!Number.isSafeInteger(x)||x<0)))fail('BAD_ARGUMENT','Invalid session target list.');
    if(new Set(targets.map(t=>t.key)).size!==targets.length)fail('BAD_ARGUMENT','Duplicate session target keys.');
    session={route:args.route==='sdk'?'sdk':'screen',id:'session-'+(++sequence),criteriaKey:snap.criteriaKey,playerId:snap.player?.id||null,
      definitionId:args.itemId?Number(args.itemId):null,rarities:[...snap.rarities],minRating:Number(args.minRating)||0,maxRating:Number(args.maxRating)||0,
      hardMaxPrice:Number.isSafeInteger(args.hardMaxPrice)&&args.hardMaxPrice>=args.maxPrice&&args.hardMaxPrice<=15000000?args.hardMaxPrice:args.maxPrice,maxPrice:args.maxPrice,maxSpend:args.maxSpend,maxBuys:args.maxBuys,autoBuy:args.autoBuy===true,
      allowedTargets:new Map(targets.map(t=>[t.key,{...t,rarities:[...t.rarities]}])),priceProvider:args.referenceQuote?.provider||null,pricePlatform:args.referenceQuote?.platform||null,postPurchase:['club','transfer'].includes(args.postPurchase)?args.postPurchase:'leave',referenceQuote:args.referenceQuote||null,referencePrice:Number(args.referencePrice)>0?Number(args.referencePrice):null,threshold:10,spent:0,buys:0,cancelled:false,uncertain:false};
    return {ok:true,sessionId:session.id};
  }
  function rotateTarget(args){
    const current=session,spec=current?.allowedTargets.get(args.targetKey),snap=readFilters();
    if(!current||current.id!==args.sessionId||current.cancelled||current.uncertain||!spec)fail('SESSION_INVALID','Target is not authorized for this session.');
    if(args.criteriaKey!==snap.criteriaKey||snap.player?.id!==spec.playerId||snap.maskedDefId!==spec.playerId||JSON.stringify([...snap.rarities].sort())!==JSON.stringify([...spec.rarities].sort()))fail('FILTER_MISMATCH','EA has not confirmed the next target and its rarity.');
    if(!Number.isSafeInteger(args.maxPrice)||args.maxPrice<150||args.maxPrice>current.hardMaxPrice||(current.route==='sdk'?preparedSearch?.criteriaKey!==snap.criteriaKey||preparedSearch?.prices.maxBin!==args.maxPrice:snap.prices.maxBin!==args.maxPrice))fail('LIMIT','Target price exceeds the session ceiling or differs from EA.');
    if(current.priceProvider&&(!validQuote(args.quote,spec.itemId)||args.quote.provider!==current.priceProvider||args.quote.platform!==current.pricePlatform))fail('QUOTE_STALE','This target needs a fresh quote from the configured provider/platform.');
    current.criteriaKey=snap.criteriaKey;current.playerId=spec.playerId;current.definitionId=spec.itemId||null;current.rarities=[...snap.rarities];current.maxPrice=args.maxPrice;
    current.referenceQuote=current.priceProvider?args.quote:null;current.referencePrice=current.referenceQuote?.price||null;batch=null;
    return {ok:true,sessionId:current.id,buys:current.buys,spent:current.spent};
  }
  async function buy(args){
    const ctx=gate(),current=session;
    if(!current||current.id!==args.sessionId||current.cancelled||current.uncertain||!current.autoBuy)fail('SESSION_INVALID','Native Auto Buy session is not active.');
    if(!batch||batch.id!==args.searchId||(batch.nav!==ctx.nav||(batch.route==='sdk'?batch.controller!==ctx.controller||readFilters().criteriaKey!==current.criteriaKey:batch.results!==resultController(ctx.controller)))||batch.criteriaKey!==current.criteriaKey||Date.now()-batch.at>30000)fail('STALE_LISTING','Refresh the market; this native result batch is no longer current.');
    if(batch.itemTimes.has(String(args.tradeId))&&Date.now()-batch.itemTimes.get(String(args.tradeId))>30000)fail('STALE_LISTING','This listing page is older than 30 seconds; scan again.');
    const item=batch.items.get(String(args.tradeId));if(!item)fail('LISTING_MISMATCH','Trade ID is not in the native response.');
    const card=itemSummary(item),auction=item.getAuctionData();
    if(card.instanceId!==String(args.instanceId)||card.price!==args.expectedPrice)fail('PRICE_MISMATCH','EA listing identity or price changed.');
    if(current.playerId&&card.playerId!==current.playerId||current.definitionId&&card.itemId!==current.definitionId||current.rarities.length&&!current.rarities.includes(card.rarityId))fail('LISTING_MISMATCH','The native listing does not match the session target.');
    if((current.minRating||current.maxRating)&&!Number.isInteger(card.rating)||current.minRating&&card.rating<current.minRating||current.maxRating&&card.rating>current.maxRating)fail('LISTING_MISMATCH','Listing rating differs from session constraints.');
    if(!Number.isSafeInteger(card.price)||card.price<=0||card.price>current.maxPrice||current.spent+card.price>current.maxSpend||current.buys>=current.maxBuys)fail('LIMIT','Native purchase limit reached.');
    if(attemptedTrades.has(card.tradeId))return {ok:true,status:'already-attempted'};
    const user=window.services.User.getUser(),coins=user?.getCurrency?.(window.GameCurrency?.COINS)?.amount;
    if(!Number.isFinite(coins)||typeof auction.canBuy!=='function'||typeof auction.getSecondsRemaining!=='function')fail('UNSUPPORTED','Native wallet or auction purchase checks are unavailable.');
    if(!auction.canBuy(coins)||auction.getSecondsRemaining()<=0)return {ok:true,status:'missed',reason:'EA reports this auction cannot be bought.'};
    const pile=window.ItemPile?.PURCHASED;
    if(pile!==undefined&&Number.isFinite(window.MAX_NEW_ITEMS)&&typeof window.repositories?.Item?.numItemsInCache==='function'&&window.repositories.Item.numItemsInCache(pile)>=window.MAX_NEW_ITEMS)fail('UNASSIGNED_FULL','EA unassigned item capacity is full.');
    if(current.referenceQuote&&(Date.now()-current.referenceQuote.retrievedAt>90000||current.referenceQuote.itemId!==card.itemId))fail('QUOTE_STALE','The selected provider quote expired or belongs to another edition. Refresh prices and restart.');
    const reference=current.referencePrice||(card.marketAverage>0?card.marketAverage:null),risk=window.CodexTradeCore.lossRisk(card.price,reference,10);
    const riskSource=current.referencePrice?(current.referenceQuote?.provider||'manual-resale-price'):reference?'ea-market-average':'unknown';
    const riskKey=JSON.stringify([current.id,card.tradeId,card.price,reference,10]);
    if(risk.requiresApproval&&args.approvedRiskKey!==riskKey)return {ok:true,status:'approval-required',riskKey,risk,riskSource};
    if(typeof window.UTItemActionController?.prototype?.bid!=='function')fail('UNSUPPORTED','Native EA bid action is unavailable.');
    attemptedTrades.add(card.tradeId);activePurchase={sessionId:current.id};
    try{
      const action=new window.UTItemActionController(),reply=await observeNative(action.bid(item,card.price),10000);
      if(typeof reply?.success!=='boolean')fail('PURCHASE_UNCERTAIN','EA returned an unrecognized purchase response. Review the Web App before retrying.');
      if(reply?.success!==true){
        const code=reply?.error?.code;
        if([window.UtasErrorCode?.NO_TRADE_EXISTS,window.UtasErrorCode?.STATE_INVALID].filter(x=>x!==undefined).includes(code))return {ok:true,status:'missed',reason:'Auction expired or was bought by another buyer.'};
        if(window.CodexTradeCore.uncertainFailure(reply))fail('PURCHASE_UNCERTAIN','EA transport did not confirm whether the purchase completed. Review the Web App before retrying.');
        fail('PURCHASE_REJECTED','EA rejected the purchase (status '+String(reply?.status??'unknown')+', code '+String(code??'unknown')+').');
      }
      if(item.getAuctionData().isWon?.()!==true){current.uncertain=true;fail('PURCHASE_UNCERTAIN','EA replied, but the listing is not confirmed won. Review it in the Web App.');}
      current.spent+=card.price;current.buys++;
      let destination={status:'left',destination:'leave'};
      if(current.postPurchase!=='leave'){
        if(current.cancelled)destination={status:'skipped',destination:current.postPurchase,reason:'Session stopped after purchase.'};
        else try{
          const pile=window.ItemPile?.[current.postPurchase==='club'?'CLUB':'TRANSFER'];
          if(pile===undefined||typeof action.move!=='function')throw Error('Native item destination is unavailable.');
          const moved=await observeNative(action.move(item,pile),8000);
          const ids=moved?.data?.itemIds;
          if(moved?.success!==true||!Array.isArray(ids)||!ids.some(id=>String(id)===card.instanceId))throw Error('EA did not confirm moving this item; check Unassigned / duplicate items.');
          destination={status:'moved',destination:current.postPurchase};
        }catch(e){destination={status:'failed',destination:current.postPurchase,reason:text(e.message)};}
      }
      return {ok:true,status:'bought',destination,sessionId:current.id,receiptId:current.id+':'+card.tradeId,tradeId:card.tradeId,price:card.price,spent:current.spent,buys:current.buys,risk,riskSource};
    }catch(e){if(e.code!=='PURCHASE_REJECTED')current.uncertain=true;throw e;}
    finally{activePurchase=null;}
  }
  const handlers={status,connect,readFilters,options:a=>options(a.kind,a.refresh===true),choose,players:a=>players(a.query),selectPlayer,clearPlayer,
    editions:async a=>{const snap=readFilters(),id=snap.player?.id;if(!id)fail('PLAYER_REQUIRED','Select an EA player first.');const result=await playerEditions(id,a.refresh===true);return {...result,playerId:id};},applyPrices,prepareSearch,search,beginSession,updateQuote,rotateTarget,buy,cancel:()=>{cancelEpoch++;if(session)session.cancelled=true;activeSearch?.cancel();picker=null;return {ok:true};}};
  window.addEventListener('message',async event=>{
    const m=event.data;
    if(event.source!==window || event.origin!==location.origin || !m || m.channel!==CHANNEL || m.direction!=='request')return;
    if(typeof m.id!=='string'||m.id.length>100||typeof m.command!=='string')return;
    let reply,ownsCommand=false;
    try {
      if(!Object.hasOwn(handlers,m.command))fail('UNKNOWN_COMMAND','Unsupported bridge operation.');
      if(!['status','cancel'].includes(m.command)){if(activeCommand||activeSearch||activePurchase)fail('BUSY','Another native operation is still pending; it cannot change the view during search.');activeCommand={id:m.id,command:m.command};ownsCommand=true;}
      reply={ok:true,result:await handlers[m.command](m.args||{})};
    }catch(e){reply={ok:false,error:{code:text(e.code)||'EA_ERROR',message:text(e.message)||'Native operation failed.'}};}finally{if(ownsCommand&&activeCommand?.id===m.id)activeCommand=null;}
    window.postMessage({channel:CHANNEL,direction:'response',id:m.id,...reply},location.origin);
  });
})();
