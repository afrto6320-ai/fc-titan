// Synthetic EA runtime for contract tests. No network, real accounts, or authentication.
window.__testSearches=0;window.__testDelay=50;window.__testItems=[];window.__testMarketAllowed=true;
window.__testObservers=new Set();
window.enums={UISearchFilters:{TYPE:10,LEVEL:11,RARITY:12,POSITION:13,NATION:14,LEAGUE:15,CLUB:16}};
window.SearchType={ANY:'any',PLAYER:'player'};
window.SearchCategory={ANY:'any'};
window.ItemIdMask={DATABASE:0xffffff};
window.AssetLocationUtils={getPortraitImageUri:id=>'/test-portraits/'+id+'.svg'};
window.UTServerSettingsRepository={KEY:{PLATFORM_SPLIT_FOR_TRANSFER_MARKET:'split'}};
window.JSUtils={isValid:x=>x!==null&&x!==undefined};
window.isPhone=()=>false;
window.services={
  TransferMarket:{isFeatureEnabledForUser:()=>window.__testMarketAllowed},
  Configuration:{checkFeatureEnabled:()=>false},
  Item:{clearTransferMarketCache:()=>{window.__testCacheClears=(window.__testCacheClears||0)+1;}},
  User:{getUser:()=>({marketSearchCriteria:window.__criteria,authToken:'PRIVATE-SENTINEL'})}
};
window.__criteria={type:'player',minBid:0,maxBid:0,minBuy:0,maxBuy:0,maskedDefId:0,rarities:[],level:-1,
  nation:-1,league:-1,club:-1,position:'any',update(other){Object.assign(this,other);}};
class Observable {
  constructor(){this.rows=new Map();}
  observe(who,fn){this.rows.set(who,fn);window.__testObservers.add(who);}
  unobserve(who){this.rows.delete(who);window.__testObservers.delete(who);}
  notify(data){for(const [who,fn] of this.rows)fn.call(who,this,data);}
}
const player={id:209331,commonName:'Mohamed Salah',rating:91};
class Filter {
  constructor(owner,kind){this.owner=owner;this.kind=kind;this.index=0;this.iconTable=new Map();}
  getOptions(){
    if(this.kind==='nation')return [{id:-1,value:-1,label:'Any nation'},{id:111,value:111,label:'Egypt'}];
    if(this.kind==='league')return [{id:-1,value:-1,label:'Any league'},{id:13,value:13,label:'Premier League'},{id:53,value:53,label:'LaLiga'}];
    if(this.kind==='club')return this.owner.viewmodel.searchCriteria.league===53
      ?[{id:-1,value:-1,label:'Any club'},{id:243,value:243,label:'Real Madrid'}]
      :[{id:-1,value:-1,label:'Any club'},{id:9,value:9,label:'Liverpool'}];
    if(this.kind==='quality')return [{id:-1,value:-1,label:'Any quality'},{id:3,value:3,label:'Gold'}];
    if(this.kind==='event')return [{id:-1,value:-1,label:'Any event'},{id:12,value:12,label:'Icon'}];
    return [{id:-1,value:'any',label:'Any position'},{id:7,value:'RW',label:'RW'}];
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
    const playerSearch={searchEngine:{getEntriesForString:q=>['salah','moha'].includes(q.toLowerCase())?[player]:[]},
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
  constructor(){this.onDataChange=new Observable();}
  initWithSearchCriteria(criteria){this.searchCriteria=criteria;}
  load(){window.__testSearches++;setTimeout(()=>this.onDataChange.notify({items:window.__testItems}),window.__testDelay);}
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
window.getAppMain=()=>({getRootViewController:()=>__root});
