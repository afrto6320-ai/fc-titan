// Synthetic EA runtime for contract tests. No network, real accounts, or authentication.
window.__testSearches=0;window.__testDelay=50;window.__testItems=[];window.__testMarketAllowed=true;
window.__testObservers=new Set();
window.enums={UISearchFilters:{TYPE:10,LEVEL:11,RARITY:12,POSITION:13,NATION:14,LEAGUE:15,CLUB:16}};
window.SearchType={ANY:'any',PLAYER:'player'};
window.SearchCategory={ANY:'any'};
window.ItemIdMask={DATABASE:0xffffff};
window.AssetLocationUtils={getPortraitImageUri:id=>'/test-portraits/'+id+'.svg'};
window.GameCurrency={COINS:'coins'};window.ItemPile={PURCHASED:5,CLUB:1,TRANSFER:2};window.MAX_NEW_ITEMS=50;
window.repositories={Item:{numItemsInCache:()=>0}};
window.HttpStatusCode={RATE_LIMIT:429};window.UtasErrorCode={NO_TRADE_EXISTS:460,STATE_INVALID:461};
window.UINotificationType={NEGATIVE:'negative',NEUTRAL:'neutral'};
window.__bidCalls=0;window.__bidScenario='won';window.__bidDelay=30;
window.UTItemActionController=class UTItemActionController {};
window.UTSearchCriteriaDTO=class UTSearchCriteriaDTO {constructor(){this.offset=0;this.count=20;}};
window.UTServerSettingsRepository={KEY:{PLATFORM_SPLIT_FOR_TRANSFER_MARKET:'split'}};
window.JSUtils={isValid:x=>x!==null&&x!==undefined,isObject:x=>x!==null&&typeof x==='object'};
window.isPhone=()=>false;
window.services={
  TransferMarket:{isFeatureEnabledForUser:()=>window.__testMarketAllowed},
  Configuration:{checkFeatureEnabled:()=>false},
  Item:{clearTransferMarketCache:()=>{window.__testCacheClears=(window.__testCacheClears||0)+1;}},
  User:{getUser:()=>({marketSearchCriteria:window.__criteria,authToken:'PRIVATE-SENTINEL',getCurrency:()=>({amount:50000})})},
  Localization:{localize:key=>key},Notification:{queue:()=>{}}
};
window.__criteria={type:'player',minBid:0,maxBid:0,minBuy:0,maxBuy:0,maskedDefId:0,rarities:[],level:-1,
  nation:-1,league:-1,club:-1,position:'any',update(other){Object.assign(this,other);}};
class Observable {
  constructor(){this.rows=new Map();}
  observe(who,fn){this.rows.set(who,fn);window.__testObservers.add(who);}
  unobserve(who){this.rows.delete(who);window.__testObservers.delete(who);}
  notify(data){for(const [who,fn] of this.rows)fn.call(who,this,data);}
}
window.services.Item.searchConceptItems=criteria=>{
  const out=new Observable();setTimeout(()=>{
    const id=criteria.defId[0];
    out.notify({success:true,response:{items:[{definitionId:id,databaseId:id,rareflag:1,rating:87},
      {definitionId:id+3*16777216,databaseId:id,rareflag:12,rating:91}],endOfList:true}});
  },10);return out;
};
window.services.Item.bid=(item,price)=>{
  window.__bidCalls++;window.__lastBidItem=item;window.__lastBidPrice=price;
  const out=new Observable();setTimeout(()=>{
    if(window.__bidScenario==='expired'){out.notify({success:false,status:400,error:{code:UtasErrorCode.NO_TRADE_EXISTS}});return;}
    item.getAuctionData().won=window.__bidScenario==='won';
    out.notify({success:true,status:200,response:{items:[item]}});
  },window.__bidDelay);return out;
};
window.resetTrade=(tradeId='trade-1')=>{
  const auction={tradeId,buyNowPrice:900,won:false,canBuy:coins=>!auction.won&&coins>=auction.buyNowPrice,getSecondsRemaining:()=>auction.won?0:60,isWon:()=>auction.won};
  const item={preferredPosition:7,isPlayer:()=>true,isManager:()=>false,id:123456,definitionId:50540979,databaseId:209331,rating:91,rareflag:12,getMarketAverage:()=>window.__testAverage||null,getStaticData:()=>({commonName:'Mohamed Salah'}),getAuctionData:()=>auction};
  window.__testItems=[item];return item;
};
const player={id:209331,commonName:'Mohamed Salah',rating:91,preferredPosition:7},secondPlayer={id:200104,commonName:'Son Heungmin',rating:89,preferredPosition:'LW'};
window.PlayerPosition={7:'RW'};
class Filter {
  constructor(owner,kind){this.owner=owner;this.kind=kind;this.index=0;this.iconTable=new Map();}
  getOptions(){
    if(this.kind==='nation')return [{id:-1,value:-1,label:'Any nation'},{id:111,value:111,label:'Egypt'},{id:45,value:45,label:'Spain'}];
    if(this.kind==='league')return [{id:-1,value:-1,label:'Any league'},{id:13,value:13,label:'Premier League'},{id:53,value:53,label:'LaLiga'}];
    if(this.kind==='club')return this.owner.viewmodel.searchCriteria.league===53
      ?[{id:-1,value:-1,label:'Any club'},{id:243,value:243,label:'Real Madrid'}]
      :[{id:-1,value:-1,label:'Any club'},{id:9,value:9,label:'Liverpool'}];
    if(this.kind==='quality')return [{id:-1,value:-1,label:'Any quality'},{id:3,value:3,label:'Gold'}];
    if(this.kind==='event')return [{id:-1,value:-1,label:'Any event'},{id:1,value:1,label:'Rare'},{id:12,value:12,label:'Icon'},{id:46,value:46,label:'Unrelated event'}];
    return [{id:-1,value:'any',label:'Any position'},{id:7,value:'RW',label:'RW'},{id:0,value:'GK',label:'GK'}];
  }
  get id(){return this.getOptions()[this.index]?.id??-1;}
  get label(){return this.getOptions()[this.index]?.label||'';}
  isInteractionEnabled(){return !this.owner.viewmodel.playerData||!['nation','club','league'].includes(this.kind);}
  setIndex(i){
    if(!this.isInteractionEnabled())return;
    this.index=i;const item=this.getOptions()[i];
    const enumKey={quality:'LEVEL',event:'RARITY',position:'POSITION',nation:'NATION',league:'LEAGUE',club:'CLUB'}[this.kind];
    this.owner.eFilterChanged(null,null,{setId:enums.UISearchFilters[enumKey],id:item.id,value:item.value});
  }
}
window.UTMarketSearchFiltersViewController=class UTMarketSearchFiltersViewController {
  initWithSearchCriteria(criteria){
    this.viewmodel={isMarketSearch:true,searchCriteria:{...criteria,rarities:[...criteria.rarities]},
      setPlayerData(p){this.playerData=p;this.searchCriteria.maskedDefId=p.id;},
      clearPlayerData(){this.playerData=null;this.searchCriteria.maskedDefId=0;},
      updateFromFilterChange(setId,id,value){
        const q=this.searchCriteria,k=enums.UISearchFilters;
        if(setId===k.LEVEL){q.level=value;q.rarities=[];}
        if(setId===k.RARITY)q.rarities=id<0?[]:[id];
        if(setId===k.NATION)q.nation=id;
        if(setId===k.LEAGUE){q.league=id;q.club=-1;}
        if(setId===k.CLUB)q.club=id;
        if(setId===k.POSITION)q.position=value;
      }
    };
    const selected={value:null};
    const playerSearch={searchEngine:{getEntriesForString:q=>['salah','moha'].includes(q.toLowerCase())?(window.__duplicatePlayers?[player,player]:[player]):['son','heung'].includes(q.toLowerCase())?[secondPlayer]:[]},
      getSelected:()=>selected.value,clearInput:()=>{selected.value=null;},
      selectPlayerEntry:(p)=>{selected.value=p;this.ePlayerNameChanged();}};
    const map=new Map();
    for(const [kind,id] of Object.entries({quality:11,event:12,position:13,nation:14,league:15,club:16}))map.set(id,new Filter(this,kind));
    this.view={getFilters:()=>({searchFilters:map}),getPlayerNameSearch:()=>playerSearch,
      setFilters:()=>{},setFilterValue:(id,value)=>{const f=map.get(id);f.index=f.getOptions().findIndex(x=>x.id===value);},
      setMinBidPrice:v=>window.__nativeMinBid=v,setMaxBidPrice:v=>window.__nativeMaxBid=v,
      setMinBuyNowPrice:v=>window.__nativeMinBin=v,setMaxBuyNowPrice:v=>window.__nativeMaxBin=v};
  }
  getView(){return this.view;}
  getNavigationController(){return window.__nav;}
};
window.UTMarketSearchResultsViewController=class UTMarketSearchResultsViewController {
  constructor(){this.onDataChange=new Observable();this.paginationViewModel={getNumItemsPerPage:()=>20};}
  initWithSearchCriteria(criteria){this.searchCriteria=criteria;}
  load(){window.__testSearches++;window.__sentMaxBids??=[];window.__sentMaxBids.push(this.searchCriteria.maxBid);window.__sentMinBids??=[];window.__sentMinBids.push(this.searchCriteria.minBid);window.__searchedPlayers=(window.__searchedPlayers||[]);window.__searchedPlayers.push(this.searchCriteria.maskedDefId);
    if(window.__autoTargetOffers){const id=this.searchCriteria.maskedDefId,rare=this.searchCriteria.rarities[0]??1;const item=resetTrade('rotation-'+id+'-'+window.__testSearches);item.databaseId=id;item.definitionId=id+(rare===12?3*16777216:0);item.rareflag=rare;item.preferredPosition=id===209331?7:'LW';item.getStaticData=()=>({commonName:id===209331?'Mohamed Salah':'Son Heungmin'});}
    this._requestItems(1);}
  _requestItems(page){window.__testPageRequests=(window.__testPageRequests||[]);window.__testPageRequests.push(page);const items=window.__testPages?.[page-1]??window.__testItems;window.__requestsActive=(window.__requestsActive||0)+1;window.__requestsMax=Math.max(window.__requestsMax||0,window.__requestsActive);setTimeout(()=>{window.__requestsActive--;this.onDataChange.notify({items});},window.__testDelay);}
};
window.UTMarketSearchResultsSplitViewController=class UTMarketSearchResultsSplitViewController {
  constructor(){this._listController=new UTMarketSearchResultsViewController();}
  initWithSearchCriteria(criteria){this._listController.initWithSearchCriteria(criteria);}
  load(){this._listController.load();}
};
window.UTNavigationController=class UTNavigationController {
  constructor(){this.childViewControllers=[];this.tag=0;this.tabBarItem={getTag:()=>this.tag};}
  getCurrentController(){return this.currentController;}
  pushViewController(c){this.childViewControllers.push(c);this.currentController=c;
    document.querySelector('main').innerHTML=c instanceof UTMarketSearchFiltersViewController
      ?'<div class="ut-market-search-filters-view"><input placeholder="Any"></div>':'<div class="SearchResults"></div>';
    c.load?.();}
  popToViewController(c){this.childViewControllers=this.childViewControllers.slice(0,this.childViewControllers.indexOf(c)+1);this.currentController=c;}
};
window.UTGameTabBarController=class UTGameTabBarController {
  static TabTag={TRANSFERS:4};getCurrentViewController(){return window.__nav;}
};
window.__nav=new UTNavigationController();
window.__tabs=new UTGameTabBarController();
window.__root={getPresentedViewController:()=>window.__testLogin?null:__tabs,
  setGameViewTab:tag=>{window.__testNavCalls=(window.__testNavCalls||0)+1;__nav.tag=tag;}};
window.getAppMain=()=>({getRootViewController:()=>__root,getNetworkErrorController:()=>({checkCriticalStatus:()=>false,handleStatus:()=>{}})});

window.__moveCalls=0;window.services.Item.move=(item,pile)=>{window.__moveCalls++;window.__lastMovePile=pile;const out=new Observable();setTimeout(()=>out.notify(window.__moveFailed?{success:false,status:400}:{success:true,data:{itemIds:[Number(item.id)]}}),20);return out;};
