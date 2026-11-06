/* GPT SNIPE native UI bridge, DOM-only. No EA authentication/session/API hooks. */
(() => {
'use strict';
if (window.GPTNativeMarket) return;
const abs = s => String(s||'').normalize('NFKC').toLowerCase()
 .replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640\u200e\u200f\u202a-\u202e]/g,'')
 .replace(/[أإآ]/g,'ا').replace(/\s+/g,' ').trim();
const sleep = n => new Promise(r=>setTimeout(r,n));
const own = el => !el?.closest?.('#gpts-v3-host,#gpts-v3-nav');
const visible = el => {
  if (!el?.isConnected || !own(el) || !el.getClientRects().length) return false;
  let p=el;
  for(let i=0;p&&i<10;i++,p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden')return false;}
  return true;
};
const label = el => (el?.getAttribute('aria-label')||el?.getAttribute('title')||el?.textContent||'').trim().replace(/\s+/g,' ');
const filtersSel='.ut-market-search-filters-view,.ut-market-search-view,.ut-pinned-list-container,.ut-search-filters-view,.ut-market-filters,[data-testid="market-search-filters"],[class*="market-search-filters"]';
function filterRoot(){return [...document.querySelectorAll(filtersSel)].find(visible)||null;}
function hasForm(){const r=filterRoot();return !!r && (r.querySelector('input,select,[role=combobox],.ut-search-filter-control')!==null);}
function marketSearchButton(){
 const root=filterRoot();if(!root)return null;
 const found=[...root.querySelectorAll('button,[role=button],.btn-standard,.btn')].filter(visible);
 return found.find(e=>/^(search|بحث|rechercher|suchen|buscar)$/i.test(label(e)))||
        found.find(e=>/\bsearch\b/i.test(label(e)) && /btn-standard|primary|call-to-action/.test(String(e.className)))||null;
}
const enabled = el => !el.closest('[disabled],[aria-disabled="true"],[inert]');
function clickTarget(el){if(!el||!visible(el)||!enabled(el))return false;el.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true,view:window}));el.click();return true;}
function navCandidates(re){
 const nodes=[...document.querySelectorAll('button,a,[role=button],[role=tab],[role=menuitem],.ut-tab-bar-item,.ut-navigation-item,.ut-nav-item')]
  .filter(visible).filter(enabled).filter(e=>re.test(abs(label(e))));
 return nodes.sort((a,b)=>label(a).length-label(b).length);
}
function firstNavigation(re, onLeft=false){
 const list=navCandidates(re);
 const exact=list.find(e=>onLeft && e.getBoundingClientRect().left < Math.max(330,innerWidth*.25))||list[0];
 if(exact)return exact;
 // Some EA market tiles have a text label inside a clickable non-semantic container.
 const labels=[...document.querySelectorAll('span,div,h1,h2,h3,h4,p')]
   .filter(visible).filter(enabled).filter(e=>re.test(abs(label(e))));
 // Match a heading, not the tile's aggregate text (which may include counters).
 // A heading alone is not clickable: require a semantic control or a tile ancestor.
 const targets=labels.map(e=>e.closest('button,a,[role=button],[role=tab],[role=menuitem],.ut-tile,.ut-tile-card,.ut-content-tile,.tile,[class*="tile"]'))
   .filter(e=>e&&visible(e)&&enabled(e));
 return targets.find(e=>!onLeft||e.getBoundingClientRect().left<Math.max(330,innerWidth*.25))||null;
}
function clickOne(re, onLeft, trace, name){
 const button=firstNavigation(re,onLeft);
 if(button){clickTarget(button);trace.push(`${name}: clicked ${label(button).slice(0,65)}`);return true;}
 trace.push(`${name}: navigation not detected`);return false;
}
const transfersRE=/^(transfers?|الانتقالات|انتقالات)$/i;
const marketRE=/^(transfer market|market|سوق الانتقالات|سوق انتقالات|سوق اللاعبين)$/i;
const searchMenuRE=/^(search the transfer market|search market|search players|بحث السوق|البحث في سوق الانتقالات)$/i;
let lastConnection=null;
function navigationSnapshot(){
 // Export structure and recognized navigation labels only, never inputs or full HTML.
 const entries=[['transfers',transfersRE],['market',marketRE],['searchMenu',searchMenuRE]].map(([name,re])=>{
   const el=firstNavigation(re,false);
   return [name,el?{tag:el.tagName,classes:String(el.className).slice(0,160)}:null];
 });
 const viewClasses=[...document.querySelectorAll('[class*="ut-"][class*="view"]')]
   .filter(visible).slice(0,30).map(e=>({tag:e.tagName,classes:String(e.className).slice(0,160)}));
 return {hasForm:hasForm(),searchFound:Boolean(marketSearchButton()),navigation:Object.fromEntries(entries),viewClasses};
}
async function waitFor(check, timeoutMs){
 const end=performance.now()+timeoutMs;
 do{const result=check();if(result)return result;await sleep(100);}while(performance.now()<end);
 return check();
}
async function connectMarket(progress, options={}){
 const trace=[];
 const emit=m=>{trace.push(m);try{progress?.(m)}catch{}};
 const timeout=Number.isFinite(options.timeoutMs)?Math.max(200,Math.min(15000,options.timeoutMs)):7000;
 const connected=()=>hasForm()&&marketSearchButton();
 const finish=(ok,stage)=>{
   lastConnection={ok,stage,at:new Date().toISOString(),trace:[...trace],snapshot:navigationSnapshot()};
   return lastConnection;
 };
 if(connected()){emit('EA search form: already connected');return finish(true,'search');}
 // Resume a mounted market view; do not unnecessarily navigate back to Transfers.
 const next=()=>connected()?'connected':firstNavigation(marketRE,false)||firstNavigation(searchMenuRE,false);
 let target=next();
 if(!target){
   const tab=firstNavigation(transfersRE,true);
   if(!tab||!clickTarget(tab)){emit('Transfers tab: missing or disabled');return finish(false,'transfers');}
   emit('Transfers: clicked native navigation; waiting for market or search form');
   target=await waitFor(next,timeout);
 }
 if(target==='connected'){emit('EA search form: connected');return finish(true,'search');}
 if(!target){emit('Transfer Market entry: missing after waiting for native view');return finish(false,'market');}
 if(!clickTarget(target)){emit('Transfer Market entry: no longer available');return finish(false,'market');}
 emit('Transfer Market: clicked native menu');
 const searchReady=()=>connected()?'connected':firstNavigation(searchMenuRE,false);
 target=await waitFor(searchReady,timeout);
 if(target==='connected'){emit('EA search form: connected');return finish(true,'search');}
 if(target&&clickTarget(target)){
   emit('Search screen: opened native control');
   if(await waitFor(connected,timeout)){emit('EA search form: connected');return finish(true,'search');}
 }
 emit(hasForm()?'Native form found, Search submit not mapped':'Native market search form not mounted');
 return finish(false,'form');
}
const categoryLabels={
 quality:['quality','rarity','نوع','جودة','ندرة','الحدث','event'],
 position:['position','مركز','المركز'],
 nation:['nation','region','country','الجنسية','الدولة','بلد','البلد'],
 league:['league','دوري','الدوري'],club:['club','نادي','النادي'],
 event:['rarity','event','promo','special','الحدث','نوع البطاقة']
};
function labelMatch(s,terms){const l=abs(s);return terms.some(k=>l===abs(k)||l.startsWith(abs(k)+' ')||l.startsWith(abs(k)+':'));}
function pickerTrigger(kind){
 const root=filterRoot();if(!root)return null;
 const terms=categoryLabels[kind]||[kind];
 const controls=[...root.querySelectorAll('select,[role=combobox],button,.ut-search-filter-control,[class*="search-filter"],[class*="filter-control"],label')].filter(visible);
 const matches=controls.filter(e=>{
   const strs=[e.getAttribute('aria-label'),e.getAttribute('title'),e.getAttribute('data-label'),e.querySelector?.('.label,.title,.ut-search-filter-control--label')?.textContent,e.textContent];
   return strs.some(s=>s&&labelMatch(String(s).trim().slice(0,90),terms));
 });
 const ordered=matches.sort((a,b)=>a.getBoundingClientRect().width-b.getBoundingClientRect().width);
 return ordered.find(e=>e.tagName==='SELECT'||e.tagName==='BUTTON'||e.getAttribute('role')==='combobox')||ordered[0]||null;
}
function photo(el){
 const node=el?.querySelector?.('img');if(node?.currentSrc||node?.src)return node.currentSrc||node.src;
 const els=[el,...[...el.querySelectorAll('span,i,div')].slice(0,12)];
 for(const item of els){const background=getComputedStyle(item).backgroundImage||'';const m=background.match(/url\(["']?([^"')]+)["']?\)/);if(m)return m[1];}
 return '';
}
function optionElements(){
 const selectors='[role="option"],option,.ut-list-view li,.ut-filter-dropdown-item,.ut-list-container .ut-list-row,[class*="dropdown-option"],[class*="select-item"],[class*="filter-option"],.ut-search-filter-list-item,.ut-selectable-list-item,.ut-list-view .ut-list-item,.ut-picker-option,[data-testid*="option"]';
 const opts=[...document.querySelectorAll(selectors)].filter(visible).filter(el=>!el.closest('#gpts-v3-host'));
 return opts.filter(el=>label(el).length<110);
}
let liveOptions=[];
async function openPicker(kind){
 liveOptions=[];
 const trigger=pickerTrigger(kind);
 if(!trigger)return {ok:false,reason:'Native EA '+kind+' picker not detected',options:[]};
 if(trigger.tagName==='SELECT'){
   liveOptions=[...trigger.options].map((el,i)=>({el,label:el.textContent.trim(),image:'',index:i,kind:'select',owner:trigger}));
 }else{
   clickTarget(trigger);await sleep(330);
   liveOptions=optionElements().map((el,i)=>({el,label:label(el),image:photo(el),index:i,kind:'click'}));
 }
 // Dedupe labels, avoid fake choices, never include sensitive inputs.
 const unique=new Map();for(const row of liveOptions){if(row.label&&!unique.has(row.label))unique.set(row.label,row);}
 liveOptions=[...unique.values()].slice(0,400);
 return {ok:liveOptions.length>0,reason:liveOptions.length?'Native EA options captured':'No native options exposed (custom or virtualized selector)',options:liveOptions.map((r,i)=>({index:i,label:r.label,image:r.image}))};
}
function chooseOption(index){const row=liveOptions[index];if(!row||!row.el.isConnected)return {ok:false,reason:'Option changed, reopen EA list'};
 if(row.kind==='select'){row.owner.value=row.el.value;row.owner.dispatchEvent(new Event('input',{bubbles:true}));row.owner.dispatchEvent(new Event('change',{bubbles:true}));}
 else clickTarget(row.el);
 return {ok:true,label:row.label};
}
function nativeStatus(){return {hasForm:hasForm(),searchFound:Boolean(marketSearchButton()),rootClass:filterRoot()?.className||'',triggers:Object.fromEntries(Object.keys(categoryLabels).map(x=>[x,Boolean(pickerTrigger(x))]))};}
window.GPTNativeMarket=Object.freeze({connectMarket,marketSearchButton,filterRoot,hasForm,pickerTrigger,openPicker,chooseOption,nativeStatus,connectionReport:()=>lastConnection});
})();
