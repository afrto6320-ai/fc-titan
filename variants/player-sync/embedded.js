/* CODEX SNIPE v3.17.1 embedded interface; diagnostics and native EA search service. No session credentials or raw HTTP requests. */
(() => {
  'use strict';
  if (window.__GPT_SNIPE_V3__) return;
  window.__GPT_SNIPE_V3__ = true;
  const Core = window.GPTSnipeCore;
  const Native = window.GPTNativeMarket;
  const Runtime = window.GPTRuntimeBridge;
  const STORAGE = 'gpts_embedded_v3';
  const READY = 'جاهز';
  const state = {
    open:false, running:false, activePurchaseMode:'', token:0, searches:0, matches:0, bought:0, misses:0, spent:0,
    started:0, status:READY, logs:[], players:[], cache:[], selected:null,
    presets:{}, lastProvider:'لم يتم البحث', lastNative:'لم يتم فحص صفحة السوق', pendingQuery:0, nativeQuerySeq:0, nativePlayerResults:[], nativeSearchMode:'ea', variantCache:{}, eventFilterMode:'any', eventSuggestions:[], eventLoading:false, speedValue:0, speedTarget:0, addPlayerMode:false, replaceTargetKey:null, cyclePhase:'idle', cycleStartedAt:0, speedMinMs:2000, speedMaxMs:5000, nextIntervalMs:0, nextTargetAt:0, lastCycleMs:0, selectedTargets:[], language:'ar', lastAudit:null, auditLog:[], lowestObserved:null, eventTargets:[], nativeChoices:{}, nativeConnectInProgress:false, pickerOptions:[], pickerKind:"", nativePlayerConfirmed:false, runtimeReport:null, nativeModelReport:null, marketProbeBusy:false, nativeProbeSnapshot:null, soundEnabled:true, outcomeNotices:0, searchEvents:[], lastScanResponse:null, lastEAError:null, sessionNumber:0, lossWarned:new Set(), nativeClearPending:false,selectionEpoch:0, pickerDockOpen:false, probeNumber:0, ladderStep:0, searchStats:{pharaoh:{},deep:{},enhancer:{}}
  };

  const TRANSLATIONS = {"ar":{"back":"↩ الرجوع إلى EA","title":"مركز تحكم CODEX SNIPE","subtitle":"فلترة وبحث من داخل Web App مع مراقبة الاتصال والنتائج — بدون ادعاء وجود بيانات سوق غير متاحة.","hint":"الكتالوج الخارجي ليس سوق EA. افتح شاشة Transfer Market Search الأصلية لتأكيد ربط السوق.","language":"اللغة / Language","players":"البحث عن اللاعبين والبطاقات","player_search":"ابحث بالاسم أو Player ID","player_placeholder":"مثال: Salah, Messi, Mbappé","player_note":"الصور والبطاقات من كتالوج خارجي، ليست عروض انتقالات مباشرة.","pick":"قائمة اللاعبين المختارين","pick_note":"اختيار لاعب يحدد الاسم والـID. عند اختيار عدة لاعبين يلزم دعم الربط الأصلي لكل هدف.","clear":"مسح الاختيارات","filters":"فلاتر Transfer Market","bridge_note":"القوائم غير المكتشفة تُعرض كمفقودة، ولا نحاول تخمين أسماء خيارات EA.","item":"Player / Item ID","quality":"Quality / Rarity / Event","minrating":"أقل تقييم","maxrating":"أعلى تقييم","position":"المركز","nation":"البلد / الجنسية","league":"الدوري","club":"النادي","minbid":"Min Bid","maxbid":"Max Bid","minbin":"Min Buy Now","maxbin":"Max Buy Now (Coins)","event":"اسم الحدث / الإصدار (كتالوج)","catalog_hint":"اقتراحات البلد والنادي والدوري مبنية على البطاقات التي تم تحميلها فقط، وليست القائمة الكاملة من EA.","inspect":"فحص الفلاتر","sync":"تطبيق المدعوم","native":"افتح سوق EA","map":"خريطة DOM","native_pending":"افتح شاشة البحث الأصلية في EA أولًا.","engine":"إعدادات السنايب","speedpreset":"نطاق سرعة البحث","speedmin":"أقل زمن (ثانية)","speedmax":"أعلى زمن (ثانية)","speedhelp":"في كل دورة يتم اختيار زمن جديد داخل المدى. المؤشر يعرض الوقت المختار فعلاً؛ الاستجابة قد تستغرق أكثر.","maxsearches":"أقصى عدد بحث","maxbuys":"أقصى عدد مشتريات","budget":"ميزانية الجلسة","autobuy":"Auto Buy Now — غير متاح في الإصدار الحالي","autobuy_note":"المراقبة والتنبيهات فقط. شراء EA الفعلي لم يُثبت بعد، ولن نُصدر أمر شراء دون تأكيد هوية العرض والسعر.","start":"▶ بدء البحث","stop":"■ إيقاف","preset_save":"حفظ إعدادات","presets":"الإعدادات المحفوظة","warning":"محرك السوق لم يتم التحقق منه على حساب EA حقيقي. لا توجد محاولات لتجاوز CAPTCHA أو قيود EA.","stats":"عدادات الجلسة","runtime":"مدة تشغيل البحث","speed":"زمن البحث المختار","speeddetail":"عينة المدى للجولة القادمة — ليست Ping أو سرعة خادم EA","actual":"مدة آخر دورة فعلية","next":"الفاصل القادم","searches":"عمليات بحث","matches":"مطابقات","bought":"شراء مؤكد","misses":"فشل/انتهاء","spent":"Coins مصروفة","status":"الحالة","mode":"الوضع","lowest":"أقل سعر ظاهر في النتائج","lowestNote":"أقل Buy Now من العناصر المقروءة بالصفحة فقط، ليس أقل سعر السوق كله.","checkLowest":"فحص السعر الظاهر","logs":"سجل النشاط","csv":"تصدير CSV","copylog":"نسخ اللوج","txtlog":"تصدير TXT","lognote":"سجلات الجهاز فقط. لا تحفظ الإضافة كلمات مرور أو كوكيز.","compat":"فحص توافق EA — أخضر / أحمر","compatdesc":"الفحص يميّز بين عنصر موجود، عنصر مفقود، وشاشة غير مفتوحة. الأحمر لا يظهر إلا عند توقع عنصر ولم يُعثر عليه.","rescan":"إعادة الفحص","copydiag":"نسخ التقرير","txtdiag":"تصدير التقرير TXT","jsondiag":"تصدير JSON","diagnosticlogs":"لوج الفحص التقني","copysys":"نسخ التشخيص","txtsys":"تصدير TXT","datalink":"مصدر البيانات وحالة السوق","datahelp":"المعلومات من FUT.GG؛ عناصر سوق EA الحية تُقرأ فقط إذا كانت صفحة النتائج ظاهرة.","none":"غير متوفر","marketneeded":"يلزم فتح شاشة البحث الأصلية","selclear":"إزالة","all_quality":"كل الأنواع","empty":"لا توجد بيانات بعد","searchhint":"اكتب حرفين على الأقل.","notlinked":"غير مربوط","no_presets":"اختر إعدادًا محفوظًا","notobserved":"لم تُقرأ عروض","cardcount":"بطاقة","connect":"ربط سوق EA الأصلي","connect_status":"حالة الاتصال بالسوق","connect_desc":"يفتح Transfers ثم Transfer Market ثم شاشة البحث باستخدام قوائم EA الأصلية. لو فشل ستظهر المرحلة المتوقفة.","connect_start":"اتصل بسوق EA","native_picker_title":"اختيار من قوائم EA الأصلية","native_picker_desc":"القائمة تُقرأ مباشرة من عناصر EA بعد الاتصال. الصور والأيقونات كما تظهر من المصدر، ولا نضيف خيارات وهمية.","native_picker_empty":"اتصل بالسوق أولًا، ثم اختر فئة من القوائم.","native_offers":"نتائج سوق EA الظاهرة","native_offers_desc":"النتائج الحقيقية التي يمكن قراءتها من واجهة السوق، وليست كتالوج FUT.GG.","refresh_offers":"قراءة نتائج EA"},"en":{"back":"↩ Back to EA","title":"CODEX SNIPE Control Center","subtitle":"Embedded player lookup, market filters, and verified connection diagnostics.","hint":"External catalogues are not the EA market. Open the native Transfer Market Search screen to verify the bridge.","language":"Language / اللغة","players":"Player & Card Search","player_search":"Search by name or Player ID","player_placeholder":"e.g. Salah, Messi, Mbappé","player_note":"Card images come from an external catalogue, not live EA listings.","pick":"Selected Players","pick_note":"Selecting a card fills its name and ID. Multiple targets require a verified native binding.","clear":"Clear selected","filters":"Transfer Market Filters","bridge_note":"Unavailable EA controls are reported, never guessed.","item":"Player / Item ID","quality":"Quality / Rarity / Event","minrating":"Min Rating","maxrating":"Max Rating","position":"Position","nation":"Nation","league":"League","club":"Club","minbid":"Min Bid","maxbid":"Max Bid","minbin":"Min Buy Now","maxbin":"Max Buy Now (Coins)","event":"Promotion / Card Event (catalogue)","catalog_hint":"Nation, league and club suggestions come only from loaded catalogue cards, not the full EA lists.","inspect":"Inspect Native Filters","sync":"Apply Supported","native":"Open EA Market","map":"DOM Map","native_pending":"Open the native EA search screen first.","engine":"Engine Settings","speedpreset":"Search Interval Range","speedmin":"Minimum (seconds)","speedmax":"Maximum (seconds)","speedhelp":"A new interval is sampled each cycle. The gauge shows the selected interval, not server speed.","maxsearches":"Max Searches","maxbuys":"Max Purchases","budget":"Session Budget","autobuy":"Auto Buy Now — currently unavailable","autobuy_note":"Read-only search with alerts. Real purchase is not enabled until EA item and price confirmation is verified.","start":"▶ START SEARCH","stop":"■ STOP","preset_save":"Save Preset","presets":"Saved Presets","warning":"Native market automation is unverified on EA. No CAPTCHA or protection bypass.","stats":"Session Overview","runtime":"ACTIVE RUNTIME","speed":"SELECTED INTERVAL","speeddetail":"Sampled next interval — not EA server latency","actual":"Last completed cycle","next":"Next target interval","searches":"SEARCHES","matches":"MATCHES","bought":"BOUGHT","misses":"MISSES","spent":"COINS SPENT","status":"STATUS","mode":"SESSION MODE","lowest":"Lowest observed listing","lowestNote":"Lowest readable Buy Now on this page only, not the entire market.","checkLowest":"Scan visible prices","logs":"Activity Logs","csv":"Export CSV","copylog":"Copy Log","txtlog":"Export TXT","lognote":"Local-only log; no passwords or cookies collected.","compat":"EA Compatibility — green / red","compatdesc":"Checks distinguish supported, missing, and not-on-screen. Red means missing only when the target view is present.","rescan":"Run Diagnostics","copydiag":"Copy Report","txtdiag":"Export Report TXT","jsondiag":"Export JSON","diagnosticlogs":"Technical Diagnostics Log","copysys":"Copy Diagnostics","txtsys":"Export TXT","datalink":"Catalogue & Market Status","datahelp":"FUT.GG provides catalogue cards; market listings are read only from visible native EA result views.","none":"Unavailable","marketneeded":"Open native market search first","selclear":"Remove","all_quality":"All types","empty":"No data yet","searchhint":"Enter at least two characters.","notlinked":"Unlinked","no_presets":"Choose a saved preset","notobserved":"No listings read","cardcount":"cards","connect":"Connect EA Market","connect_status":"Native market connection","connect_desc":"Uses the original Transfers, Transfer Market and Search navigation. Reports where connection fails.","connect_start":"Connect to EA Market","native_picker_title":"Browse original EA choices","native_picker_desc":"Options are read only from rendered EA controls; images and icons are reused when available.","native_picker_empty":"Connect to the market first, then pick a category.","native_offers":"Native EA market listings","native_offers_desc":"Observed original EA listings, not FUT.GG catalogue cards.","refresh_offers":"Read EA results"}};
  const tr = key => (TRANSLATIONS[state.language]||TRANSLATIONS.ar)[key]||key;
  const fmt = v => Number(v || 0).toLocaleString('en-US');
  const nap = ms => new Promise(resolve => setTimeout(resolve,ms));
  const safe = x => String(x ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const visible = el => Boolean(el && el.isConnected && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none');
  const normalize = x => String(x||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  let nav = null, portal = null, shadow = null, timer = null, observer = null, mountTimer = null, searchTimer = null;
  let formChangeListenerBound=false, lastSearchButtonCheck=0, lastSearchButtonStatus=false;
  let nativeClearPromise=Promise.resolve(true);
  const $ = id => shadow?.getElementById(id) || null;

  function addLog(message,level='info') {
    const entry={at:new Date().toISOString(),message:String(message).slice(0,500),level};
    state.logs.unshift(entry); if(state.logs.length>160) state.logs.length=160;
    if(shadow){renderLogs();if($('technicalLogs'))$('technicalLogs').textContent=technicalAsText();} save();
  }
  function addSearchEvent(kind,message,details=''){
    const e={at:new Date().toISOString(),kind:String(kind),message:String(message).slice(0,400),details:String(details||'').slice(0,250)};
    state.searchEvents.unshift(e);if(state.searchEvents.length>240)state.searchEvents.length=240;
    renderSearchEvents();
  }
  function renderSearchEvents(){
    const host=$('searchFeed');if(!host)return;host.replaceChildren();
    for(const e of state.searchEvents.slice(0,80)){
      const row=document.createElement('div');row.className='search-event '+e.kind;
      const dot=document.createElement('span');dot.className='search-event-dot';
      const content=document.createElement('div');content.className='search-event-text';
      const name=document.createElement('strong');name.textContent=e.message;
      content.appendChild(name);
      if(e.details){const small=document.createElement('small');small.textContent=e.details;content.appendChild(small);}
      const time=document.createElement('time');time.textContent=new Date(e.at).toLocaleTimeString('en-GB',{hour12:false});
      row.append(dot,content,time);host.append(row);
    }
    if(!state.searchEvents.length){const empty=document.createElement('div');empty.className='search-feed-empty';empty.textContent=state.language==='ar'?'سجل البحث هيعرض: بدء البحث، الرد، النتائج، التطابق، الشراء أو الخطأ.':'Search activity will show scans, results, matches, purchases and errors.';host.append(empty);}
  }
  function exportSearchFeed(){const content=['CODEX SNIPE SEARCH STATUS LOG',...state.searchEvents.slice().reverse().map(e=>`[${e.at}] [${e.kind.toUpperCase()}] ${e.message}${e.details?' | '+e.details:''}`)].join('\n');saveTextFile('GPT_SNIPE_Search_Status.txt',content);}
  const MODE_NAMES={pharaoh:'Pharaoh',deep:'Deep',enhancer:'Enhancer'};
  function searchConfig(){return {mode:input('searchMode')||'enhancer',ladderMode:input('bidLadderMode')||'off'};}
  function modeStatsEntry(mode){
    const entry=state.searchStats[mode]||{};
    return {calls:Number(entry.calls)||0,results:Number(entry.results)||0,newIds:Number(entry.newIds)||0,repeated:Number(entry.repeated)||0,totalMs:Number(entry.totalMs)||0,errors:Number(entry.errors)||0};
  }
  function collectModeStats(response,mode){
    const entry=modeStatsEntry(mode);entry.calls++;
    if(!response?.ok)entry.errors++;
    else{entry.results+=(response.items?.length||0);entry.newIds+=Number(response.addedTradeIds||0);entry.repeated+=Number(response.repeatedTradeIds||0);entry.totalMs+=Number(response.durationMs||0);}
    state.searchStats[mode]=entry;
    renderModeStats();save();
  }
  function renderModeStats(){
    const el=$('searchModeComparison');if(!el)return;
    el.replaceChildren();
    const table=document.createElement('table');table.className='mode-table';
    const head=document.createElement('tr');for(const h of ['Mode','Calls','Avg ms','New IDs','Repeated','Errors']){const th=document.createElement('th');th.textContent=h;head.append(th);}table.append(head);
    for(const name of ['pharaoh','deep','enhancer']){
      const v=modeStatsEntry(name),row=document.createElement('tr');
      for(const datum of [MODE_NAMES[name],v.calls,v.calls>v.errors?Math.round(v.totalMs/(v.calls-v.errors)):'—',v.newIds,v.repeated,v.errors]){
        const td=document.createElement('td');td.textContent=String(datum);row.append(td);
      }table.append(row);
    }
    el.append(table);
  }
  function exportModeComparison(){
    const lines=['CODEX SNIPE v3.17.1 MARKET MODE COMPARISON','Comparison is observational, not a measurement of faster purchases.','Same listing IDs do not prove caching. No direct raw HTTP.',
      'Mode\tCalls\tAverage response ms\tNew trade IDs\tRepeated trade IDs\tErrors'];
    for(const mode of ['pharaoh','deep','enhancer']){
      const v=modeStatsEntry(mode);lines.push([MODE_NAMES[mode],v.calls,v.calls>v.errors?Math.round(v.totalMs/(v.calls-v.errors)):'—',v.newIds,v.repeated,v.errors].join('\t'));
    }saveTextFile('GPT_SNIPE_Search_Mode_Comparison.txt',lines.join('\n'));
  }
  async function inspectSearchModes(){
    const target=$('searchModesStatus');if(!target)return;
    const r=await Runtime?.scanCapabilities?.();
    if(!r?.ok){target.textContent='EA search bridge unavailable';return;}
    target.textContent=['pharaoh','deep','enhancer'].map(k=>(r.modes[k]?.available?'✓ ':'× ')+MODE_NAMES[k]+' — '+r.modes[k]?.method).join(' | ');
    addLog(target.textContent,'info');
  }
  function buildScanArgs(isProbe=false){
    const cfg=searchConfig();
    const key=JSON.stringify([cfg.mode,cfg.ladderMode,input('player'),input('itemId'),input('minBid'),input('maxBid'),input('maxBin')]);
    if(state.ladderKey!==key){state.ladderKey=key;state.probeNumber=0;state.ladderStep=0;}
    const step=isProbe?state.probeNumber++:state.ladderStep++;
    return {mode:cfg.mode,ladderMode:cfg.ladderMode,ladderStep:step};
  }
  function logAppliedCriteria(response){
    const v=response?.ladder;if(!v)return;
    const max=v.uncapped?(state.language==='ar'?'بدون حد (0)':'Uncapped (0)'):v.effective.maxBid;
    addSearchEvent('filter',state.language==='ar'?'المعايير المحضرة لخدمة EA':'Prepared native EA criteria',
      `${MODE_NAMES[response.mode]||response.mode} · Min Bid ${v.base.minBid} → ${v.effective.minBid} · Max Bid ${v.base.maxBid} → ${max} · Max Buy Now ${v.buyNow} · ${v.field==='off'?'Ladder OFF':'Ladder '+v.field+' #'+(v.step+1)+' · cycle '+(v.cycleStep+1)+'/'+v.cycleLength}`);
  }
  function logScanInputs(args,label){
    const note=`${MODE_NAMES[args.mode]} · Base Min Bid ${numeric('minBid')} · Base Max Bid ${numeric('maxBid')} · Max Buy Now ${numeric('maxBin')} · ladder=${args.ladderMode} #${args.ladderStep+1} · effective values follow the native bridge reply`;
    addSearchEvent('filter',label,note);return note;
  }
  function updateLadderHelp(){
    const el=$('bidLadderHelp');if(!el)return;
    const mode=input('bidLadderMode'),ar=state.language==='ar';
    el.textContent=mode==='smartMaxBid'?(ar?'Max Bid الذكي يبدأ بأول خطوة فوق سقف Max Buy Now الفعلي، ويحافظ على Min Bid وسقف الشراء. يلزم تحديد Max Buy Now.':'Smart Max Bid starts one valid step above the actual Buy Now cap, preserving Min Bid and the purchase cap. A Buy Now cap is required.'):
      mode==='maxBid'?(ar?'Max Bid العادي يمر من 0 (بدون حد) إلى 600 ثم يعيد الدورة، مع احترام Min Bid. قد يستبعد عروضًا حتى لو كانت داخل سقف Buy Now.':'Regular Max Bid cycles from 0 (uncapped) through 600, respecting Min Bid. It can exclude auctions within your Buy Now cap.'):
      mode==='minBid'?(ar?'Min Bid يتحرك من الحد الذي حددته حتى 600 ثم يعيد الدورة، ويحترم Max Bid. رفعه قد يستبعد عروضًا رخيصة.':'Min Bid cycles from your minimum through 600, respecting Max Bid. Raising it can exclude cheap auctions.'):
      (ar?'السلم متوقف: تُستخدم حدود Min Bid وMax Bid كما حددتها. مسح الكاش المحلي في هانسر يعمل بشكل مستقل.':'Ladder off: use your fixed bid limits. Enhancer local cache clearing is independent.');
  }
  function save(){
    const payload={sessionNumber:state.sessionNumber,searchStats:state.searchStats,presets:state.presets,logs:state.logs.slice(0,70),searchEvents:state.searchEvents.slice(0,65),cache:state.cache.slice(0,80),selected:state.selected,selectedTargets:state.selectedTargets.slice(0,12),eventTargets:state.eventTargets.slice(0,15),eventFilterMode:state.eventFilterMode,variantCache:state.variantCache,language:state.language,settings:readSettingsSafe()};
    try{chrome.storage.local.set({[STORAGE]:payload});}catch{}
  }
  function readSettingsSafe(){
    if(!shadow) return {};
    return Object.fromEntries(['player','itemId','ratingMin','ratingMax','quality','position','club','league','nation','minBid','maxBid','minBin','maxBin','interval','maxSearches','maxBuys','budget','autoBuy','speedPreset','speedMin','speedMax','event','soundEnabled','resaleReference','lossAlertPct','purchaseMode','searchMode','bidLadderMode'].map(k=>[k,$(k)?.type==='checkbox'?$(k).checked:$(k)?.value||'']));
  }
  function input(id){return $(id)?.value.trim()||'';}
  function numeric(id){return Number(input(id)||0);}
  function renderPurchaseModeInfo(){
    const el=$('purchaseModeInfo');if(!el)return;
    const en=state.language==='en',active=$('autoBuy')?.checked===true,mode=input('purchaseMode');
    el.textContent=active?(mode==='deep'?(en?'Experimental Deep: buyNow if exposed, otherwise DAO bid, never both.':'وضع Deep تجريبي: buyNow عند توفرها وإلا DAO، وليس كلاهما.'):(en?'Experimental Pharaoh: one services.Item.bid attempt.':'وضع Pharaoh تجريبي: محاولة واحدة عبر services.Item.bid.')):(en?'Monitor-only until auto-buy is explicitly enabled.':'المراقبة فقط إلى أن تُفعّل الشراء صراحة.');
    el.classList.toggle('armed',active);
  }
  function fillSettings(obj={}){for(const [k,value] of Object.entries(obj)){const e=$(k);if(!e)continue;if(e.type==='checkbox')e.checked=Boolean(value);else e.value=value??'';}updateNativeLabels();renderPurchaseModeInfo();}
  function updateNativeLabels(){for(const id of ['quality','position','nation','league','club','event']){const el=$('nativeLabel'+id.charAt(0).toUpperCase()+id.slice(1));if(el)el.textContent=input(id)||'— EA';}}
  function uiHTML(){return `
  <main id="shell" dir="${state.language==='ar'?'rtl':'ltr'}" lang="${state.language}" aria-label="CODEX SNIPE dashboard">
    <header class="top"><div class="brand"><div class="mark" aria-hidden="true">◎</div><div><h1>CODEX <span>SNIPE</span></h1><small>ULTIMATE TEAM · EMBEDDED CONSOLE · v3.17.1</small></div></div>
      <div class="head-actions"><label class="lang-label">${tr('language')} <select id="language"><option value="ar" ${state.language==='ar'?'selected':''}>العربية</option><option value="en" ${state.language==='en'?'selected':''}>English</option></select></label><span id="connection" class="pill warn">● EA WEB APP</span><span id="runBadge" class="pill">● STANDBY</span><button type="button" id="close" class="ghost">${tr('back')}</button></div></header>
    <div class="intro"><div><div class="eyebrow">ADVANCED TRANSFER WORKSPACE / V3.17.1</div><h2>${tr('title')}</h2><p>${tr('subtitle')}</p></div><details class="intro-help"><summary>ⓘ ${state.language==='ar'?'ملاحظات الاتصال — عرض/إخفاء':'Connection notes — show/hide'}</summary><div class="hint">${tr('hint')}</div></details></div>
    <div class="layout">
      <div class="column control">
        <details class="panel collapsible" open><summary class="panel-head"><h3><em>⌕</em> ${tr('players')}</h3><span class="tiny-tag">PLAYER FINDER</span></summary>
          <div class="panel-body">
          <div class="search-source-row"><label class="field"><span>${state.language==='ar'?'مصدر بحث اللاعب':'Player search source'}</span><select id="playerSearchSource"><option value="ea" ${state.nativeSearchMode==='ea'?'selected':''}>EA · Native player lookup</option><option value="catalog" ${state.nativeSearchMode==='catalog'?'selected':''}>FUT.GG · Card catalogue</option></select></label><small>${state.language==='ar'?'بحث EA الأصلي للفلتر، والكتالوج للنسخ والصور.':'EA native search sets the market player; catalogue shows card variants and art.'}</small></div>
          <label class="field full"><span>${tr('player_search')}</span><input id="player" autocomplete="off" type="search" placeholder="${tr('player_placeholder')}" aria-label="Player search"></label>
          <div class="player-search-workspace">
          <details id="playerResultBox" class="player-result-accordion" open><summary>${state.language==='ar'?'نتائج البحث والبطاقات':'Player search results'} <span id="cardCount">0 ${tr('cardcount')}</span></summary>
            <div id="playerResults" class="results" aria-live="polite"><div class="muted">${tr('searchhint')}</div></div>
          </details><div id="selectedCardPreview" class="selected-card-preview selected-cards-grid" hidden></div></div>
          <div class="mini-bar"><span id="provider">EA / FUT.GG</span><span id="playerSearchHelp">${tr('player_note')}</span></div>
          <div class="selection-head"><strong>${tr('pick')}</strong><div class="player-collection-actions"><button id="addAnotherPlayer" class="primary small" type="button">${state.language==='ar'?'＋ إضافة لاعب آخر':'＋ Add another player'}</button><button id="clearTargets" class="ghost small" type="button">${tr('clear')}</button></div></div>
          <div id="selectionHint" class="muted">${state.language==='ar'?'اختيار لاعب جديد يستبدل السابق، إلا لو ضغطت إضافة لاعب آخر.':'A new selection replaces the previous one unless you choose Add another player.'}</div>
          <div id="selectedTargets" hidden></div><div class="action-row"><button id="syncPlayerEA" class="secondary" type="button">↗ EA player autocomplete</button><span id="playerSyncState" class="native-mini-state">EA: not verified</span></div><div class="integrated-filters">        <details class="panel collapsible" open><summary class="panel-head"><h3><em>⚙</em> ${tr('filters')}</h3><span class="tiny-tag">EA FILTER BRIDGE</span></summary>
          <div class="panel-body"><p class="desc">${tr('bridge_note')}</p>
           <div class="form-grid">
            <label class="field"><span>${tr('item')}</span><input id="itemId" placeholder="Optional" inputmode="numeric"></label>
            <div class="field"><span>${tr('quality')}</span><input id="quality" type="hidden"><button class="native-select" type="button" data-native-picker="quality"><span class="native-select-label" id="nativeLabelQuality">— EA</span><span>▾</span></button></div>
            <label class="field"><span>${tr('minrating')}</span><input id="ratingMin" inputmode="numeric" type="number" min="1" max="99" placeholder="—"></label>
            <label class="field"><span>${tr('maxrating')}</span><input id="ratingMax" inputmode="numeric" type="number" min="1" max="99" placeholder="—"></label>
            ${[['position','position'],['nation','nation'],['league','league'],['club','club'],['event','event']].map(([id,key])=>`<div class="field ${id==='event'?'full':''}"><span>${tr(key)}</span><input id="${id}" type="hidden"><button class="native-select" type="button" data-native-picker="${id}" ${id==='club'?'disabled title="Choose a league first"':''}><span class="native-select-label" id="nativeLabel${id.charAt(0).toUpperCase()+id.slice(1)}">— EA</span><span>▾</span></button></div>`).join('')}
            <div id="nativePickerDock" class="native-picker-dock" hidden><div id="pickerStatus" class="picker-inline-status">${tr('native_picker_empty')}</div><div id="nativePickerResults" class="native-picker-results"></div></div>
            <details class="event-picker-accordion" id="eventFold"><summary><span>✦ ${state.language==='ar'?'أحداث البطاقة المختارة':'Card event / rarity options'}</span><small>${state.language==='ar'?'فتح / إغلاق':'Expand / collapse'}</small></summary><div class="event-targets"><div class="selection-head"><strong>${state.language==='ar'?'أحداث البطاقات المتاحة للاعبين المختارين':'Events for selected players'}</strong><button class="secondary small" type="button" id="loadPlayerEvents">${state.language==='ar'?'اعرض أحداث اللاعبين':'Find player events'}</button></div><label class="field"><span>${state.language==='ar'?'طريقة دمج أحداث عدة لاعبين':'When multiple players are selected'}</span><select id="eventFilterMode"><option value="any" ${state.eventFilterMode==='any'?'selected':''}>${state.language==='ar'?'أي لاعب من المختارين (اتحاد)':'Any selected player (union)'}</option><option value="all" ${state.eventFilterMode==='all'?'selected':''}>${state.language==='ar'?'المشترك بينهم فقط (تقاطع)':'Common to all (intersection)'}</option></select></label><div id="eventMatchStatus" class="muted">${state.language==='ar'?'اختر لاعبًا ثم اضغط عرض أحداث اللاعبين.':'Choose a player, then load matching events.'}</div><div id="playerEventChoices" class="player-event-choices"></div><div class="selection-head"><strong>${state.language==='ar'?'الأحداث المحفوظة (EA يختار حدثًا واحدًا فقط)':'Saved events (EA supports one active event)'}</strong><button class="ghost small" type="button" id="clearEvents">${state.language==='ar'?'مسح':'Clear'}</button></div><div id="eventTargets" class="target-list"></div></div></details>
            <label class="field"><span>${tr('minbid')}</span><input id="minBid" inputmode="numeric" type="number" min="0" placeholder="0"></label>
            <label class="field"><span>${tr('maxbid')}</span><input id="maxBid" inputmode="numeric" type="number" min="0" placeholder="—"></label>
            <label class="field"><span>${tr('minbin')}</span><input id="minBin" inputmode="numeric" type="number" min="0" placeholder="0"></label>
            <label class="field"><span>${tr('maxbin')}</span><input id="maxBin" inputmode="numeric" type="number" min="150" value="1000"></label>
           </div><p class="desc" style="margin-top:10px">${tr('native_picker_desc')}</p>
           <div class="action-row"><button type="button" class="secondary" id="inspect">${tr('inspect')}</button><button type="button" class="secondary" id="sync">${tr('sync')}</button><button type="button" class="ghost" id="native">${tr('native')}</button><button type="button" class="ghost" id="exportMap">${tr('map')}</button></div>
           <div id="nativeInfo" class="native-status">${tr('native_pending')}</div>
          </div></details>
</div>
          </div></details>
        <details class="panel collapsible" open><summary class="panel-head"><h3><em>⌁</em> ${tr('engine')}</h3><span class="tiny-tag">ENGINE CONTROLS</span></summary>
          <div class="panel-body"><div class="form-grid">
             <label class="field full"><span>${tr('speedpreset')}</span><select id="speedPreset"><option value="1-3">1–3 sec</option><option value="2-5" selected>2–5 sec</option><option value="5-8">5–8 sec</option><option value="0.6-5">0.6–5 sec</option><option value="custom">Custom / يدوي</option></select></label>
             <label class="field"><span>${tr('speedmin')}</span><input id="speedMin" type="number" min="0.6" max="60" step="0.1" value="2" disabled></label>
             <label class="field"><span>${tr('speedmax')}</span><input id="speedMax" type="number" min="0.6" max="60" step="0.1" value="5" disabled></label>
             <label class="field"><span>${tr('maxsearches')}</span><input id="maxSearches" type="number" min="1" max="300" value="30"></label>
             <label class="field"><span>${tr('maxbuys')}</span><input id="maxBuys" type="number" min="1" max="30" value="1"></label>
             <label class="field full"><span>${tr('budget')} (Coins)</span><input id="budget" type="number" min="150" value="10000"></label>
           <label class="field"><span>${state.language==='ar'?'سعر إعادة بيع مرجعي (اختياري)':'Reference resale price (optional)'}</span><input id="resaleReference" type="number" min="0" step="50" placeholder="—"></label>
             <label class="field"><span>${state.language==='ar'?'تنبيه خسارة عند %':'Loss warning threshold %'}</span><input id="lossAlertPct" type="number" min="1" max="100" step="1" value="10"></label>
           </div><p class="desc" style="margin-top:12px">${state.language==='ar'?'تحذير خسارة مرة واحدة لكل لاعب وفلاتر في الجلسة، لا يوقف البحث. يتطلب سعر إعادة بيع مرجعي. حساب الربح يخصم 5% رسومًا افتراضية.':'Warn once per player/filter/session; searches continue. Requires reference resale price. Assumes 5% sale fee.'}</p><p class="desc" style="margin-top:8px">${tr('speedhelp')}</p>
           <div class="search-test-config">
             <div class="form-grid"><label class="field full"><span>${state.language==='ar'?'وضع البحث وفحص السوق · Search Mode':'Market Search Mode'}</span>
               <select id="searchMode"><option value="pharaoh">Pharaoh · EA Item Service</option><option value="deep">Deep · EA itemDao (only if available)</option><option value="enhancer" selected>Enhancer · Clear local cache + EA Item Service</option></select></label>
               <label class="field full"><span>${state.language==='ar'?'السلم التدريجي للمزايدة · اختياري':'Optional bid ladder'}</span>
                 <select id="bidLadderMode"><option value="off">${state.language==='ar'?'OFF · بدون تعديل Min/Max Bid':'OFF · Keep fixed bid limits'}</option><option value="minBid">${state.language==='ar'?'Min Bid · من الحد المختار حتى 600':'Min Bid · Your minimum through 600'}</option><option value="maxBid">${state.language==='ar'?'Max Bid عادي · 0 → 150 … 600':'Max Bid · 0 → 150 … 600'}</option><option value="smartMaxBid">${state.language==='ar'?'Smart Max Bid · أعلى من Max Buy Now':'Smart Max Bid · Above Max Buy Now'}</option></select></label><p id="bidLadderHelp" class="desc full" role="status"></p></div>
             <p class="desc">${state.language==='ar'?'اختياري للفحص والسنايب؛ لا يغيّر سعر Buy Now أو ميزانية الشراء. قد تتكرر نفس العروض حتى بعد بحث جديد.':'Optional for scans and sniping; Buy Now and purchase budget stay unchanged. A new search can still return the same auctions.'}</p>
             <div class="action-row"><button type="button" id="inspectSearchModes" class="secondary small">${state.language==='ar'?'فحص توفر أوضاع البحث':'Check search routes'}</button><button type="button" id="exportCompareModes" class="ghost small">↓ ${state.language==='ar'?'تقرير مقارنة TXT':'Comparison TXT'}</button></div>
             <div id="searchModesStatus" class="native-status">${state.language==='ar'?'لم يتم فحص دوال أوضاع البحث':'Search routes not inspected yet'}</div>
             <div id="searchModeComparison" class="mode-compare" aria-live="polite"></div>
           </div>
           <div class="purchase-mode-panel"><label class="field full"><span>${state.language==='ar'?'محرك الشراء · Purchase Engine':'Purchase Engine'}</span><select id="purchaseMode"><option value="pharaoh">Pharaoh Mode · services.Item.bid</option><option value="deep">Deep Mode · buyNow / DAO fallback</option></select></label>
           <label class="checkbox"><input type="checkbox" id="autoBuy"><span><b>${state.language==='ar'?'تفعيل الشراء التلقائي التجريبي':'Enable experimental auto-purchase'}</b><br><small>${state.language==='ar'?'افتراضيًا وضع مراقبة. يجب اختيار لاعب EA واحد وتأكيد السعر والميزانية، ثم الموافقة عند Start.':'Off by default. Requires one EA-verified player, price/budget checks, and explicit Start confirmation.'}</small></span></label>
           <div class="purchase-mode-caption" id="purchaseModeInfo"></div>
           <div class="action-row"><button class="secondary small" type="button" id="checkPurchaseCapabilities">${state.language==='ar'?'فحص توفر مسارَي الشراء':'Check purchase APIs'}</button></div>
           <div class="purchase-mode-caption" id="purchaseCapabilitiesStatus">${state.language==='ar'?'لم يتم فحص الدوال بعد. لا يثبت وجود الدالة نجاح الشراء.':'Not checked yet. API existence does not prove a completed purchase.'}</div>
           <p class="desc">${state.language==='ar'?'كل مود يرسل محاولة واحدة للعرض. لا يوجد طلب Raw HTTP أو اعتراض جلسة، ولا إعادة محاولة عبر المود الآخر إذا كانت النتيجة مجهولة. نجاح رد الخدمة لا يعني التحقق من ملكية البطاقة.':'Each mode sends one attempt per trade. No raw HTTP or session interception; ambiguous results never retry via another route. Service acknowledgement is not independent ownership verification.'}</p></div>
           <div class="sound-controls"><label class="checkbox"><input type="checkbox" id="soundEnabled" checked><span>${state.language==='ar'?'🔔 صوت الإشعارات (التنبيهات المرئية تعمل دائمًا)':'🔔 Notification sounds (visual alerts always on)'}</span></label><div class="action-row"><button type="button" id="previewWinSound" class="ghost small">${state.language==='ar'?'تجربة النجاح':'Test success'}</button><button type="button" id="previewMissSound" class="ghost small">${state.language==='ar'?'تجربة الفوات':'Test miss'}</button></div></div>
           <div class="action-row"><button type="button" id="savePreset" class="secondary">${tr('preset_save')}</button></div>
           <label class="field" style="margin-top:13px"><span>${tr('presets')}</span><select id="presets"><option value="">${tr('no_presets')}</option></select></label>
           <div class="inline-warning">${tr('warning')}</div>
          </div></details>
      </div>
      <div class="column right">
        <details class="panel collapsible session-combined" open><summary class="panel-head"><h3><em>◉</em> ${tr('stats')} · ${state.language==='ar'?'عداد البحث':'Search Cycle'}</h3><small id="sessionLabel">SESSION INACTIVE</small></summary>
          <div class="session-main">
            <div class="session-gauge-large"><svg viewBox="0 0 180 180" aria-label="Search cycle progress"><circle class="cycle-track" cx="90" cy="90" r="71"/><circle id="cycleRing" class="cycle-ring" cx="90" cy="90" r="71"/></svg><div class="gauge-center-info"><small>${state.language==='ar'?'الدورة الحالية':'Current cycle'}</small><b id="speedValue">—</b><strong id="cycleFraction">0%</strong><small id="cyclePhase">STANDBY</small></div></div>
            <div class="session-meta">
              <div><small>${state.language==='ar'?'رقم الجلسة':'Session number'}</small><strong id="sessionNumber">#0</strong></div>
              <div><small>${state.language==='ar'?'دورة البحث':'Search cycle'}</small><strong id="cycleNumber">0</strong></div>
              <div><small>${tr('runtime')}</small><strong id="time">00:00</strong></div>
              <div><small>${tr('next')}</small><b id="nextDelay">—</b></div>
              <div><small>${tr('actual')}</small><b id="actualCycle">—</b></div>
              <div><small>${state.language==='ar'?'المدى المختار':'Selected range'}</small><b><span id="gaugeMin">2.0</span> – <span id="gaugeMax">5.0</span> s</b></div>
            </div>
          </div>
          <div class="stats"><div class="metric"><span class="emoji">⌕</span><small>${tr('searches')}</small><strong id="searchCount" class="accent">0</strong></div><div class="metric"><span class="emoji">◇</span><small>${tr('matches')}</small><strong id="matchCount">0</strong></div><div class="metric"><span class="emoji">✓</span><small>${tr('bought')}</small><strong id="buyCount">0</strong></div><div class="metric"><span class="emoji">✕</span><small>${tr('misses')}</small><strong id="misses">0</strong></div></div>
          <div class="second-stats"><div class="substat"><span>${tr('spent')}</span><b id="spent">0</b></div><div class="substat"><span>${tr('status')}</span><b id="status">READY</b></div><div class="substat"><span>${tr('mode')}</span><b id="sessionMode">STANDBY</b></div></div>
          <div class="status-line"><strong id="sessionStatus">● STANDBY</strong><small id="syncCount">EA FILTERS: NOT LINKED</small></div>
          <div class="search-feed-head"><span>📡 ${state.language==='ar'?'سجل حالة البحث — مباشر':'Live Search Status Log'}</span><div><small id="feedSource">EA search modes · no response yet</small><button id="exportSearchFeed" type="button" class="ghost small">↓ TXT</button></div></div>
          <div id="searchFeed" class="search-feed" aria-live="polite"></div>
        </details>
        <details class="panel collapsible combined-market" open><summary class="panel-head"><h3><em>▥</em> ${tr('native_offers')} · ${tr('lowest')}</h3><span class="tiny-tag">VISIBLE EA MARKET ONLY</span></summary><div class="panel-body">
          <div class="market-overview">
            <div class="market-low" aria-live="polite"><span class="market-low-name">${tr('lowest')}<small>${tr('lowestNote')}</small></span><b id="lowestPriceValue">—</b></div>
            <div class="market-tools"><span id="lowestPriceMeta" class="market-meta">${tr('notobserved')}</span><button class="secondary" id="captureOffers" type="button">↻ ${tr('refresh_offers')}</button><button class="secondary market-probe-btn" id="marketProbe" type="button">${state.language==='ar'?'🔎 فحص بالمود المختار — بحث واحد':'🔎 Scan using selected mode — one search'}</button></div><div class="market-probe-status" id="marketProbeStatus">${state.language==='ar'?'فحص بالدالة المحددة في Search Mode ويقارن أرقام العروض؛ التكرار لا يثبت كاش الخادم.':'Scan uses the selected EA service mode and compares listing IDs. Repeats do not prove server caching.'}</div>
          </div>
          <div id="nativeOffers" class="native-offers" aria-live="polite"><div class="muted">${tr('notobserved')}</div></div>
        </div></details>
        <details class="panel collapsible" open><summary class="panel-head"><h3><em>☷</em> ${tr('logs')}</h3><span class="tiny-tag">LIVE LOG</span></summary><div class="log-actions"><button class="ghost small" id="export" type="button">${tr('csv')}</button><button class="ghost small" id="copyLog" type="button">${tr('copylog')}</button><button class="ghost small" id="exportLogText" type="button">${tr('txtlog')}</button></div><div id="logs" class="logs" aria-live="polite"></div><div class="notice">${tr('lognote')}</div></details>
        <details class="panel collapsible market-connection" open><summary class="panel-head"><h3><em>⬡</em> ${tr('connect')}</h3><span class="tiny-tag">NATIVE EA</span></summary>
          <div class="panel-body"><p class="desc">${tr('connect_desc')}</p><div class="action-row"><button type="button" class="primary" id="connectEA">⚡ ${tr('connect_start')}</button><button type="button" class="secondary" id="refreshNative">${tr('inspect')}</button></div>
          <div id="nativeConnectStatus" class="native-status">${tr('native_pending')}</div><div id="nativeConnectSteps" class="connect-steps"></div></div></details>
        <details class="panel collapsible" id="runtimePanel"><summary class="panel-head"><h3><em>⌘</em> ${state.language==='en'?'EA Runtime Function Inspector':'فحص دوال تطبيق EA الأصلية'}</h3><span id="runtimeFlag" class="tiny-tag">NOT TESTED</span></summary>
          <div class="panel-body"><p class="desc">${state.language==='en'?'Read-only probe for EA application controllers. The market navigation option triggers the native in-app view only; it does not place orders.':'فحص للوظائف المتاحة داخل تطبيق EA مباشرة. فتح السوق يستدعي شاشة الفلاتر داخل التطبيق، ولا ينفذ شراء.'}</p>
            <div class="action-row"><button id="probeRuntime" class="primary" type="button">${state.language==='en'?'Inspect app functions':'فحص دوال EA'}</button><button id="openRuntimeMarket" class="secondary" type="button">${state.language==='en'?'Open native filters via app':'فتح فلتر السوق بدوال EA'}</button><button id="copyRuntime" class="ghost" type="button">${state.language==='en'?'Copy TXT':'نسخ التقرير'}</button></div>
            <p class="desc">EA Model: ${state.language==='en'?'Native prices and option providers are checked separately from DOM selectors':'فحص أسعار EA ومصادر القوائم الداخلية بشكل منفصل عن محددات DOM'}</p><div id="runtimeRows" class="compat-list"><div class="muted">${state.language==='en'?'Not inspected yet':'لم يتم الفحص بعد'}</div></div>
            <div class="native-status" id="runtimeMessage">${state.language==='en'?'No runtime data captured':'لم تُقرأ حالة التطبيق'}</div>
          </div></details>
        <details class="panel collapsible" id="compatPanel"><summary class="panel-head"><h3><em>◈</em> ${tr('compat')}</h3><span id="auditSummary" class="tiny-tag">NOT TESTED</span></summary><div class="panel-body"><p class="desc">${tr('compatdesc')}</p><div class="action-row"><button id="runDiag" type="button" class="primary">${tr('rescan')}</button><button id="copyDiag" type="button" class="secondary">${tr('copydiag')}</button><button id="exportDiagText" type="button" class="ghost">${tr('txtdiag')}</button><button id="exportDiagJson" type="button" class="ghost">${tr('jsondiag')}</button></div><div id="compatResults" class="compat-list"><div class="muted">${tr('empty')}</div></div></div></details>
        <details class="panel collapsible" id="technicalPanel"><summary class="panel-head"><h3><em>▤</em> ${tr('diagnosticlogs')}</h3><span class="tiny-tag">TECHNICAL</span></summary><div class="panel-body"><div class="action-row"><button id="copyTechnical" class="secondary" type="button">${tr('copysys')}</button><button id="exportTechnical" class="ghost" type="button">${tr('txtsys')}</button></div><pre id="technicalLogs" class="technical-logs">${tr('empty')}</pre></div></details>
        <details class="panel collapsible"><summary class="panel-head"><h3><em>ⓘ</em> ${tr('datalink')}</h3><span class="tiny-tag">STATUS</span></summary><div class="panel-body"><p class="desc">${tr('datahelp')}</p><div id="dataHealth" class="native-status">${tr('empty')}</div></div></details>
      </div>
    </div>
    <div class="action-dock" role="group" aria-label="Search session controls">
      <div class="dock-main"><button type="button" id="start" class="primary">${tr('start')}</button><button type="button" id="stop" class="danger" disabled>${tr('stop')}</button></div>
      <div class="dock-info"><span id="dockStatus">● STANDBY</span><small id="dockTimer">—</small><small>${state.language==='ar'?'زر ثابت طوال التصفح':'Always-visible search controls'}</small></div>
    </div><footer class="footer"><span>CODEX SNIPE v3.17.1 · Unofficial · Independent</span><span>SEARCH • INSPECT • MONITOR</span></footer>
  </main>`;}
  function createPortal(){
    if(portal?.isConnected)return;
    portal=document.createElement('div');portal.id='gpts-v3-host';portal.setAttribute('aria-label','CODEX SNIPE app');
    portal.style.cssText='position:fixed;inset:0 0 0 90px;z-index:2147483000;display:none;min-width:0;';
    shadow=portal.attachShadow({mode:'open'});
    const link=document.createElement('link');link.rel='stylesheet';link.href=chrome.runtime.getURL('embedded.css');shadow.appendChild(link);
    const app=document.createElement('div');app.innerHTML=uiHTML();while(app.firstChild)shadow.appendChild(app.firstChild);
    document.documentElement.appendChild(portal);
    const feedback=document.createElement('div');feedback.id='gpts-toast-stack';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');shadow.append(feedback);
    bindUI();refresh();renderLogs();
  }
  const navStyle = document.createElement('style');
  navStyle.textContent=`#gpts-v3-nav{border:0;min-height:48px;width:100%;padding:9px 10px;background:linear-gradient(125deg,#25392b,#172627);color:#d1f5ab;font-family:inherit;display:flex;gap:9px;align-items:center;justify-content:center;cursor:pointer;box-sizing:border-box;border-inline-start:3px solid #bdec7a;font-size:12px;font-weight:900;letter-spacing:.5px}#gpts-v3-nav:hover,#gpts-v3-nav.gpts-active{background:linear-gradient(120deg,#365a38,#1c352d);color:#fff}#gpts-v3-nav .gpts-icon{font-size:19px;line-height:1}#gpts-v3-nav.gpts-compact{flex-direction:column;gap:4px;padding:8px 3px;font-size:9px;min-height:63px}#gpts-v3-nav:focus-visible{outline:2px solid #c5f479;outline-offset:-2px}#gpts-v3-nav.gpts-compact .gpts-icon{font-size:21px}`;

  function findNavItem(){
    const target=/^(evolutions?|sbc|squad building challenges|transfers?|transfer market|التطورات|الانتقالات|تحديات بناء التشكيلة|انتقالات|ايفولوشن)$/i;
    const candidates=[...document.querySelectorAll('button,a,li,[role="tab"],[role="menuitem"],span,div')];
    for(const el of candidates){
      if(el.closest('#gpts-v3-host')||el.id==='gpts-v3-nav')continue;
      const name=(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').trim().replace(/\s+/g,' ');
      if(!target.test(name)||!visible(el))continue;
      const r=el.getBoundingClientRect();
      if(r.left>370||r.width>310||r.height<8||r.height>150)continue;
      let item=el.closest('.ut-tab-bar-item,.ut-navigation-item,.ut-nav-item,[role="tab"],[role="menuitem"],li,button,a');
      if(!item){item=el.parentElement||el;}
      const p=item.parentElement;if(!p||p===document.body)continue;
      return {item,parent:p,rect:r};
    }
    return null;
  }
  function calcLeft(){
    if(!nav?.isConnected)return 90;
    let el=nav.parentElement,best=null;
    for(let i=0;el&&i<7;i++,el=el.parentElement){
      const r=el.getBoundingClientRect();
      if(r.left>=-8&&r.left<65&&r.width>=50&&r.width<=325&&r.height>=Math.min(360,window.innerHeight*.55))best=r;
    }
    return Math.max(64,Math.min(330,Math.round(best?.right||nav.getBoundingClientRect().right||90)));
  }
  function positionPortal(){if(!portal)return;portal.style.left=(window.innerWidth<650?'0px':calcLeft()+'px');}
  function makeNav(){
    if(nav?.isConnected){positionPortal();return;}
    const found=findNavItem();if(!found)return;
    const btn=document.createElement('button');btn.type='button';btn.id='gpts-v3-nav';btn.setAttribute('aria-label','CODEX SNIPE');btn.innerHTML='<span class="gpts-icon" aria-hidden="true">◎</span><span>CODEX SNIPE</span>';
    btn.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();openPanel();});
    const rect=found.item.getBoundingClientRect();if(rect.width<115)btn.classList.add('gpts-compact');
    found.parent.insertBefore(btn,found.item);nav=btn;
    if(state.open)btn.classList.add('gpts-active');positionPortal();
    addLog('تم إدراج CODEX SNIPE في القائمة اليسرى','success');
  }
  function openPanel(){createPortal();state.open=true;portal.style.display='block';nav?.classList.add('gpts-active');positionPortal();refresh();}
  function closePanel(){if(!portal)return;state.open=false;portal.style.display='none';nav?.classList.remove('gpts-active');}
  function scheduleNav(){if(mountTimer)return;mountTimer=setTimeout(()=>{mountTimer=null;try{makeNav();}catch(e){console.warn('[CODEX SNIPE] sidebar not ready:',e?.message)}},250);}
  function observeNav(){
    observer=new MutationObserver(()=>{if(!nav?.isConnected)scheduleNav();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    window.addEventListener('resize',positionPortal);
    document.addEventListener('click',event=>{
      if(!state.open||state.nativeConnectInProgress||!nav||event.composedPath().includes(nav))return;
      const t=event.target;
      if(t instanceof Element && (t.closest('.ut-tab-bar-item,.ut-navigation-item,.ut-nav-item,[role="tab"],[role="menuitem"]')||t.closest('a,li,button'))){
        const r=t.getBoundingClientRect();if(r.left<calcLeft()+8)closePanel();
      }
    },true);
    scheduleNav();
  }

  function renderLogs(){
    const e=$('logs');if(!e)return;
    e.replaceChildren();
    for(const entry of state.logs.slice(0,45)){
      const d=document.createElement('div');d.className='log-row '+(entry.level||'info');
      const time=document.createElement('time');time.textContent=new Date(entry.at).toLocaleTimeString('en-GB',{hour12:false});
      const dot=document.createElement('span');dot.className='dot';
      const p=document.createElement('p');p.textContent=entry.message;
      d.append(dot,p,time);e.appendChild(d);
    }
    if(!state.logs.length){const e2=document.createElement('div');e2.className='muted';e2.style.padding='16px 0';e2.textContent='لا توجد عمليات مسجلة بعد.';e.appendChild(e2);}
  }
  // Original notification tones synthesized locally; no external audio or permissions.
  let audioCtx=null;
  function unlockAudio(){
    if(!$('soundEnabled')?.checked)return;
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      audioCtx??=new Audio();if(audioCtx.state==='suspended')void audioCtx.resume().catch(()=>{});
    }catch(e){addLog('تعذر تشغيل الصوت: '+String(e?.message||e),'warning');}
  }
  function playOutcomeTone(kind){
    if(!$('soundEnabled')?.checked||!audioCtx||audioCtx.state!=='running')return;
    try{
      const notes=kind==='won'?[523.25,659.25,783.99,1046.5]:[440,349.23,261.63];
      const start=audioCtx.currentTime+.015;
      for(let i=0;i<notes.length;i++){
        const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
        const t=start+i*.11;osc.type=kind==='won'?'sine':'triangle';osc.frequency.setValueAtTime(notes[i],t);
        gain.gain.setValueAtTime(.0001,t);gain.gain.linearRampToValueAtTime(.055,t+.012);
        gain.gain.exponentialRampToValueAtTime(.0001,t+.19);
        osc.connect(gain);gain.connect(audioCtx.destination);osc.start(t);osc.stop(t+.21);
      }
    }catch{}
  }
  function showOutcomeNotice(kind,card={},test=false){
    const host=$('gpts-toast-stack');if(!host)return;
    const toast=document.createElement('article');toast.className='gpts-outcome-toast '+kind;
    toast.setAttribute('role','status');
    const picture=document.createElement('span');picture.className='gpts-toast-picture';picture.textContent=kind==='won'?'✓':'!';
    const imgUrl=verifiedArtwork(card)[0]||verifiedArtwork(state.selected||{})[0];
    if(imgUrl){const img=document.createElement('img');img.src=imgUrl;img.alt='';img.onerror=()=>{img.remove();};picture.append(img);}
    const body=document.createElement('div');body.className='gpts-toast-text';
    const title=document.createElement('b');title.textContent=kind==='won'?(
      state.language==='ar'?'✓ شراء مؤكد!':'✓ Purchase confirmed!'):(
      state.language==='ar'?'✕ العرض فاتك':'✕ Listing missed');
    if(test)title.textContent+=(state.language==='ar'?' · تجربة':' · Demo');
    const detail=document.createElement('small');detail.textContent=[card?.name||state.selected?.name||(state.language==='ar'?'لاعب':'Player'),card?.price?fmt(card.price)+' Coins':''].filter(Boolean).join(' · ');
    body.append(title,detail);toast.append(picture,body);
    const close=document.createElement('button');close.type='button';close.className='gpts-toast-close';close.textContent='×';close.setAttribute('aria-label','Dismiss notification');close.onclick=()=>toast.remove();toast.append(close);
    host.prepend(toast);while(host.childElementCount>3)host.lastElementChild.remove();
    playOutcomeTone(kind);setTimeout(()=>{toast.classList.add('leaving');setTimeout(()=>toast.remove(),350);},4400);
  }
  const SPEED_RANGES={'1-3':[1,3],'2-5':[2,5],'5-8':[5,8],'0.6-5':[0.6,5]};
  function updateSpeedControls(){
    const preset=input('speedPreset')||'2-5',fixed=SPEED_RANGES[preset];
    const min=$('speedMin'),max=$('speedMax');
    if(fixed){min.disabled=true;max.disabled=true;min.value=fixed[0];max.value=fixed[1];}
    else{min.disabled=false;max.disabled=false;}
    const lo=Number(min.value),hi=Number(max.value);
    state.speedMinMs=Math.round(lo*1000);state.speedMaxMs=Math.round(hi*1000);
    if($('gaugeMin'))$('gaugeMin').textContent=lo.toFixed(1);
    if($('gaugeMax'))$('gaugeMax').textContent=hi.toFixed(1);
    paintSpeedGauge(state.running?Math.max(0,state.nextTargetAt-Date.now()):0);
  }
  function rangeConfig(){
    const lo=numeric('speedMin'),hi=numeric('speedMax');
    if(!Number.isFinite(lo)||!Number.isFinite(hi)||lo<0.6||hi>60||hi<lo)throw Error('اختار مدى سرعة صحيحًا بين 0.6 و60 ثانية، وأقصى زمن لا يقل عن الأقل.');
    return {minMs:Math.round(lo*1000),maxMs:Math.round(hi*1000)};
  }
  function paintSpeedGauge(ms){
    const ring=$('cycleRing');
    const duration=state.nextIntervalMs||0;
    const now=Date.now();
    const elapsed=state.running&&state.cycleStartedAt?Math.max(0,now-state.cycleStartedAt):0;
    const progress=state.running&&duration?Math.min(1,elapsed/duration):0;
    const circumference=2*Math.PI*71;
    if(ring){ring.style.strokeDasharray=String(circumference);ring.style.strokeDashoffset=String(circumference*(1-progress));}
    if($('cycleFraction'))$('cycleFraction').textContent=Math.round(progress*100)+'%';
    const phase=state.running?(state.cyclePhase==='searching'?'SEARCHING':'NEXT SEARCH'):'STANDBY';
    if($('cyclePhase'))$('cyclePhase').textContent=phase;
    if($('speedValue'))$('speedValue').textContent=state.running&&duration?(Math.max(0,duration-elapsed)/1000).toFixed(2)+'s':'—';
    if($('nextDelay'))$('nextDelay').textContent=state.running&&duration?(duration/1000).toFixed(2)+'s':'—';
    if($('actualCycle'))$('actualCycle').textContent=state.lastCycleMs>0?(state.lastCycleMs/1000).toFixed(2)+'s':'—';
  }
  function refresh(){
    updateLadderHelp();if(!shadow)return;
    const sec=state.started?Math.floor((Date.now()-state.started)/1000):0;
    const show={searchCount:fmt(state.searches),matchCount:fmt(state.matches),buyCount:fmt(state.bought),spent:fmt(state.spent),misses:fmt(state.misses),time:`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`,status:state.running?'LIVE':state.status==='خطأ'?'ERROR':'READY'};
    for(const [k,v] of Object.entries(show))if($(k))$(k).textContent=v;
    if($('sessionNumber'))$('sessionNumber').textContent='#'+state.sessionNumber;
    if($('cycleNumber'))$('cycleNumber').textContent=fmt(state.searches);
    if($('sessionMode'))$('sessionMode').textContent=state.running?(state.activePurchaseMode?('EA BUY · '+state.activePurchaseMode.toUpperCase()):'EA SERVICE · ALERT ONLY'):'STANDBY';
    if($('autoBuy'))$('autoBuy').disabled=state.running;
    if($('purchaseMode'))$('purchaseMode').disabled=state.running;for(const key of ['searchMode','bidLadderMode'])if($(key))$(key).disabled=state.running;
    paintSpeedGauge(state.running?Math.max(0,state.nextTargetAt-Date.now()):0);
    $('start').disabled=state.running;$('stop').disabled=!state.running;
    $('runBadge').innerHTML=state.running?'<i></i> LIVE SCANNING':'<i></i> STANDBY';$('runBadge').className='pill'+(state.running?' green':'');
    if($('dockStatus'))$('dockStatus').textContent=state.running?'● LIVE · EA SEARCH':'● '+state.status;
    if($('dockTimer'))$('dockTimer').textContent=state.running?`${state.searches} search(es) · ${state.cyclePhase}`:'EA Transfer Market · controlled session';
    $('sessionLabel').textContent=state.running?'ACTIVE SESSION':'SESSION INACTIVE';$('sessionStatus').textContent=state.running?'● SCANNING':`● ${state.status}`;
    // Scanning the entire EA DOM every UI refresh is needlessly expensive.
    if(Date.now()-lastSearchButtonCheck>2500){lastSearchButtonStatus=!!findNativeSearchButton();lastSearchButtonCheck=Date.now();}
    $('connection').textContent=lastSearchButtonStatus?'● EA MARKET DETECTED':'● EA WEB APP · VIEW UNCONFIRMED';
    $('connection').className='pill'+(lastSearchButtonStatus?' green':' warn');
    $('provider').textContent='المصدر: '+state.lastProvider;
  }

  function safeImg(x){try{const u=new URL(String(x||''),location.href);if(u.protocol!=='https:')return '';const host=u.hostname.toLowerCase();const ok=host==='fut.gg'||host.endsWith('.fut.gg')||host==='ea.com'||host.endsWith('.ea.com')||host==='easports.com'||host.endsWith('.easports.com')||host==='easportsfut.com'||host.endsWith('.easportsfut.com')||host==='eaassets-a.akamaihd.net';return ok?u.href:'';}catch{return '';}}
  function isEAAsset(url){
    try{const u=new URL(url,location.href);return u.protocol==='https:'&&(
      u.hostname==='ea.com'||u.hostname.endsWith('.ea.com')||u.hostname==='easports.com'||
      u.hostname.endsWith('.easports.com')||u.hostname==='easportsfut.com'||
      u.hostname.endsWith('.easportsfut.com')||u.hostname==='eaassets-a.akamaihd.net');}catch{return false;}
  }
  function verifiedArtwork(p){
    const urls=[...(Array.isArray(p?.imageUrls)?p.imageUrls:[]),p?.imageUrl].map(safeImg).filter(Boolean);
    // A native search gives a base PLAYER ID, not a special FUT.GG card edition.
    // Do not display a TOTW/Icon/Hero artwork as evidence of the chosen EA rarity.
    return [...new Set(p?.source==='EA'?urls.filter(isEAAsset):urls)];
  }
  function resetLocalPlayerFields(){
    state.nativePlayerConfirmed=false;
    if($('player'))$('player').value='';
    if($('itemId'))$('itemId').value='';
    if($('playerSyncState'))$('playerSyncState').textContent='EA: no player selected';
    if($('playerResultBox'))$('playerResultBox').open=false;
    state.pendingQuery++;
    clearTimeout(searchTimer);
    state.nativePlayerResults=[];
    state.nativeProbeSnapshot=null;
    state.lowestObserved=null;
    if($('nativeOffers'))$('nativeOffers').replaceChildren();
    if($('lowestPriceValue'))$('lowestPriceValue').textContent='—';
    if($('lowestPriceMeta'))$('lowestPriceMeta').textContent='Player filter changed; scan again';
    renderPlayers([]);
  }
  async function clearEAPlayer(reason='إزالة لاعب'){
    // Await this operation before any subsequent EA player selection.
    state.nativeClearPending=true;
    const field=findField(bridge[0][1]);
    if(field)setNativeValue(field,'');
    const previous=nativeClearPromise;
    const action=(async()=>{
      await previous;
      if(!Runtime?.clearPlayer){addLog('دالة مسح فلتر EA غير موجودة؛ البحث العام غير مؤكد.','error');return false;}
      const result=await Runtime.clearPlayer();
      const model=await Runtime?.inspectFilters?.();
      const id=Number(model?.filters?.selectedPlayerId||0);
      const ok=Boolean(result?.ok && model?.filters?.controllerActive && id===0);
      state.nativeClearPending=!ok;
      if(ok){
        addLog(reason+': EA Player ID '+(result.previousPlayerId||0)+' → 0 · البحث التالي غير مقيد بلاعب.','success');
        addSearchEvent('filter','تم مسح اللاعب من EA','maskedDefId=0 · no player target');
      }else addLog('تعذر التحقق من مسح لاعب EA: '+String(result?.reason||'EA Player ID '+id)+'. لن نبدأ فحصًا عامًا بحالة قديمة.','error');
      return ok;
    })();
    nativeClearPromise=action;
    return action;
  }
  async function verifyPlayerForScan(){
    const model=await Runtime?.inspectFilters?.();
    if(!model?.filters?.controllerActive)throw Error('شاشة فلاتر EA غير نشطة. افتح السوق أولًا.');
    const actual=Number(model.filters.selectedPlayerId||0);
    if(state.selectedTargets.length===0){
      if(actual||state.nativeClearPending){
        if(!await clearEAPlayer('تجهيز البحث بدون لاعب'))throw Error('فلتر لاعب قديم ما زال محفوظًا داخل EA. البحث العام متوقف.');
      }
      const finalModel=await Runtime.inspectFilters();
      if(Number(finalModel?.filters?.selectedPlayerId||0)!==0)throw Error('EA Player ID لم يُمسح؛ تم منع نتائج اللاعب القديم.');
      return 0;
    }
    if(state.selectedTargets.length!==1)return actual; // Multi-target list is display-only.
    const expected=Number(state.selectedTargets[0]?.playerId||0);
    if(!state.nativePlayerConfirmed||!expected||actual!==expected)
      throw Error('اللاعب في EA غير مطابق للكارت المختار. اختار النتيجة الأصلية من بحث EA.');
    return expected;
  }
  function renderTargets(){
    const host=$('selectedCardPreview');if(!host)return;
    host.replaceChildren();host.hidden=!state.selectedTargets.length;
    const count=state.selectedTargets.length;
    host.dataset.count=String(count);
    for(const p of state.selectedTargets){
      const card=document.createElement('article');card.className='selected-player-tile';
      if(state.selected?.key===p.key)card.classList.add('active');
      const media=document.createElement('div');media.className='selected-player-art';media.textContent=(p.name||'?')[0];
      if(p.source==='EA')media.classList.add('base-portrait');
      const sources=verifiedArtwork(p);
      if(sources.length){const img=document.createElement('img');img.alt=p.name||'EA player';img.loading='eager';let n=0;
        img.onerror=()=>{n++;if(n<sources.length)img.src=sources[n];else{img.remove();media.textContent=(p.name||'?')[0];}};
        img.src=sources[0];media.append(img);}
      const name=document.createElement('strong');name.textContent=p.name||'Unknown';
      const meta=document.createElement('small');meta.textContent=[p.rating||'—',p.position||p.rarity||'EA',p.itemId?'Item '+p.itemId:'Player '+(p.playerId||'—')].join(' · ');
      let baseLabel=null;
      if(p.source==='EA'){
        baseLabel=document.createElement('span');baseLabel.className='ea-base-pill';
        baseLabel.textContent=state.language==='ar'?'صورة اللاعب الأساسية · الحدث يُختار منفصلًا':'EA base portrait · event chosen separately';
      }
      const buttons=document.createElement('div');buttons.className='selected-player-actions';
      const replace=document.createElement('button');replace.type='button';replace.className='ghost small';replace.textContent=state.language==='ar'?'تغيير':'Change';
      replace.addEventListener('click',()=>{state.replaceTargetKey=p.key;state.addPlayerMode=false;showPlayerSearch();});
      const remove=document.createElement('button');remove.type='button';remove.className='target-remove';remove.textContent='×';remove.setAttribute('aria-label','Remove '+p.name);
      remove.addEventListener('click',async()=>{
        if(state.running)stop('تغير اللاعب المستهدف؛ تم إيقاف الجلسة');
        state.selectionEpoch++;
        const wasActive=state.selected?.key===p.key;
        state.selectedTargets=state.selectedTargets.filter(x=>x.key!==p.key);
        if(wasActive)state.selected=state.selectedTargets.at(-1)||null;
        if(wasActive||!state.selectedTargets.length){
          resetLocalPlayerFields();await clearEAPlayer('حذف '+p.name);
          // A remaining saved target must be selected again in EA before START.
          if(state.selected&&$('player'))$('player').value=state.selected.name||'';
        }
        renderTargets();refreshPlayerEvents(false);save();
        if(wasActive&&state.selectedTargets.length===1&&state.selected)void confirmNativePlayer();
      });
      buttons.append(replace,remove);card.append(media,name,meta);if(baseLabel)card.append(baseLabel);card.append(buttons);host.append(card);
    }
    const countLabel=$('selectionHint');
    if(countLabel)countLabel.textContent=state.addPlayerMode?(state.language==='ar'?'وضع إضافة لاعب جديد — اختار بطاقة من البحث.':'Adding another player — choose a result.'):
      (count?(state.language==='ar'?`${count} لاعب مختار. لإضافة لاعب بدون استبدال اضغط «إضافة لاعب آخر».`:`${count} selected. Use Add another player to keep them.`):
      (state.language==='ar'?'اختار بطاقة أو اتركه فارغًا لفحص السوق بدون لاعب.':'Choose a player first.'));
  }
  function renderSelectedCard(){renderTargets();}
  function showPlayerSearch(){
    const field=$('player');if(!field)return;
    field.value='';state.pendingQuery++;
    $('playerResultBox').open=true;renderPlayers([]);
    field.focus();
  }
  function commitPlayer(p,verified=false){
    state.selectionEpoch++;
    state.nativeClearPending=false;
    const key=String(p.key||p.itemId||p.playerId||p.name);
    const target={...p,key};
    if(state.addPlayerMode){
      if(!state.selectedTargets.some(x=>x.key===key))state.selectedTargets.push(target);
      else state.selectedTargets=state.selectedTargets.map(x=>x.key===key?target:x);
    }else if(state.replaceTargetKey){
      const idx=state.selectedTargets.findIndex(x=>x.key===state.replaceTargetKey);
      if(idx>=0)state.selectedTargets.splice(idx,1,target);else state.selectedTargets=[target];
      state.selectedTargets=[...new Map(state.selectedTargets.map(x=>[x.key,x])).values()];
    }else state.selectedTargets=[target];
    state.selectedTargets=state.selectedTargets.slice(0,12);
    state.selected=target;
    state.nativePlayerConfirmed=Boolean(verified);
    state.addPlayerMode=false;state.replaceTargetKey=null;
    $('player').value=target.name||'';$('itemId').value=target.itemId?String(target.itemId):'';
    $('playerResultBox').open=false;renderTargets();refresh();save();
  }
  function updateClubLock(){
    const btn=shadow?.querySelector('[data-native-picker="club"]');if(!btn)return;
    const league=state.nativeChoices.league||'';
    const allowed=Boolean(league&&!/^\*?any$|^—|^all$/i.test(league.trim()));
    btn.disabled=!allowed;
    btn.title=allowed?'':state.language==='ar'?'اختر دوريًا محددًا أولًا':'Choose a specific league first';
    if(!allowed){state.nativeChoices.club='';if($('club'))$('club').value='';updateNativeLabels();}
  }
  const eventNameKey = str => normalize(String(str||'').replace(/^\*+/,'').replace(/[–—]/g,'-').replace(/\s*\([^)]*\)$/,'').replace(/^base /i,'')).replace(/[^a-z0-9\u0600-\u06ff]/g,'');
  const eventAliases = {'totw':'teamoftheweek','potm':'playerofthemonth','icon':'baseicon','hero':'basehero'};
  function canonEvent(value){const key=eventNameKey(value);return eventAliases[key]||key;}
  function playerMatch(card,target){
    if(!card||!target)return false;
    const a=Number(card.playerId),b=Number(target.playerId);
    // Base-player identity is stronger than names. Special items have different item IDs.
    if(a>0&&b>0)return a===b;
    return normalize(card.name)===normalize(target.name);
  }
  function eventNamesFor(target){
    const key=String(target.key||target.itemId||target.playerId||target.name);
    const variants=[target,...(state.variantCache[key]||[]),...state.cache.filter(c=>playerMatch(c,target))];
    return new Set(variants.map(x=>canonEvent(x.rarity)).filter(x=>x&&!['rare','common','gold','silver','bronze','special','basic','nonrare'].includes(x)));
  }
  async function refreshPlayerEvents(fetchMissing=true){
    const host=$('playerEventChoices'),info=$('eventMatchStatus');if(!host||!info)return;
    host.replaceChildren();
    const targets=state.selectedTargets;
    if(!targets.length){info.textContent=state.language==='ar'?'اختار لاعبًا أولًا':'Choose a player first';return;}
    if(state.eventLoading){info.textContent=state.language==='ar'?'جاري تجميع نسخ البطاقات…':'Loading card variants…';return;}
    state.eventLoading=true;
    const currentKeys=targets.map(x=>String(x.key||x.itemId||x.playerId||x.name)).join('|');
    try{
      if(fetchMissing){
        for(const p of targets.slice(0,8)){
          const key=String(p.key||p.itemId||p.playerId||p.name);
          if(state.variantCache[key])continue;
          const r=await chrome.runtime.sendMessage({type:'GPTS_SEARCH_FUTGG',payload:{query:p.name,page:1}});
          if(r?.ok)state.variantCache[key]=(r.result?.items||[]).filter(x=>playerMatch(x,p)).slice(0,60);
          else state.variantCache[key]=[];
        }
      }
      const ea=await Runtime?.listOptions?.('event');
      if(!ea?.ok){info.textContent='EA events unavailable — '+(ea?.reason||'native event picker missing');return;}
      const maps=targets.map(eventNamesFor);
      const wanted=(state.eventFilterMode==='all'?Array.from(maps[0]).filter(k=>maps.every(s=>s.has(k))):[...new Set(maps.flatMap(s=>Array.from(s)))]);
      // Filter native EA event choices by documented card rarities. Do not infer
      // availability from the *entire* EA DataProvider event list alone.
      const matches=ea.options.filter(x=>wanted.includes(canonEvent(x.label)));
      state.eventSuggestions=matches;
      info.textContent=state.language==='ar'?
        `${matches.length} حدث مطابق من خيارات EA · اعتمادًا على البطاقات التي أعادها الكتالوج، وقد تكون القائمة غير مكتملة`:
        `${matches.length} matching EA event choices · partial catalogue, not live listing availability`;
      if(!matches.length){const muted=document.createElement('div');muted.className='muted';muted.textContent=state.language==='ar'?'مفيش تطابق مؤكد. ممكن البيانات ناقصة أو اسم الحدث مختلف؛ مش هنعرض أحداثًا خاطئة.':'No verified event overlap. Catalogue or labels may be incomplete.';host.append(muted);}
      for(const option of matches){const b=document.createElement('button');b.type='button';b.className='secondary small';b.textContent=option.label;b.addEventListener('click',async()=>{
        const fresh=await Runtime.listOptions('event');if(!fresh?.ok){addLog('تعذر تحديث خيارات EA للأحداث','warning');return;}
        const freshOption=fresh.options.find(o=>String(o.id)===String(option.id)&&canonEvent(o.label)===canonEvent(option.label));
        if(!freshOption){addLog('تغيّرت خيارات EA؛ افتح القائمة من جديد','warning');return;}
        const chosen=await Runtime.chooseOption('event',freshOption.index);
        if(!chosen?.ok){addLog('فشل تطبيق حدث EA: '+(chosen?.reason||''),'error');return;}
        $('event').value=chosen.label;state.nativeChoices.event=chosen.label;
        if(!state.eventTargets.includes(chosen.label))state.eventTargets.push(chosen.label);
        renderEvents();updateNativeLabels();addLog('تم اختيار حدث EA: '+chosen.label,'success');save();
      });host.append(b);}
      save();
    }catch(e){info.textContent='Event lookup failed: '+String(e?.message||e);}
    finally{state.eventLoading=false;}
  }
  function renderEvents(){
    const host=$('eventTargets');if(!host)return;host.replaceChildren();
    for(const eventName of state.eventTargets){
      const chip=document.createElement('span');chip.className='target-chip';
      const title=document.createElement('span');title.textContent=eventName;
      const b=document.createElement('button');b.className='target-remove';b.type='button';b.textContent='×';
      b.addEventListener('click',()=>{state.eventTargets=state.eventTargets.filter(x=>x!==eventName);renderEvents();save();});
      chip.append(title,b);host.appendChild(chip);
    }
  }
  function addEvent(){
    const v=input('event');if(!v)return;
    const list=v.split(/[,،]/).map(x=>x.trim()).filter(Boolean).slice(0,15);
    for(const x of list)if(!state.eventTargets.includes(x))state.eventTargets.push(x.slice(0,48));
    state.eventTargets=state.eventTargets.slice(0,15);$('event').value='';renderEvents();save();
    addLog('الأحداث محفوظة في القائمة للتحليل فقط؛ لا يتم تطبيقها على EA بدون ربط أصلي موثوق.','info');
  }
  function updateDatalists(){ /* Original EA option picker now owns these categories. */ }
  function selectPlayer(p){
    commitPlayer(p,false);
    renderPlayers(state.players);
    addLog(`تم اختيار ${p.name} · جاري التحقق تلقائيًا عبر اقتراحات EA الأصلية.`, 'info');
    // No extra EA Autocomplete button press. Confirm exact EA Player ID only.
    void confirmNativePlayer();
  }
  async function confirmNativePlayer(){
    const selected=state.selected;
    const epoch=state.selectionEpoch;
    if(!selected){addLog('اختر لاعبًا أولًا.','warning');return;}
    if(!Runtime?.searchPlayers||!Runtime?.choosePlayer){addLog('Native EA player engine غير متاح — حدّث Web App.','error');return;}
    const term=String(selected.name||'').trim();if(term.length<2)return;
    await nativeClearPromise;
    if(epoch!==state.selectionEpoch||state.selected?.key!==selected.key)return;
    const result=await Runtime.searchPlayers(term);
    if(!result?.ok){addLog('فشل بحث اللاعب الأصلي: '+(result?.reason||result?.message||''),'error');return;}
    const identity=Number(selected.playerId)||(Number(selected.itemId)>0?(Number(selected.itemId)&0xffffff):0);
    // Only an unambiguous native player-id match may confirm a FUT.GG card selection.
    const matches=(result.items||[]).filter(p=>Number(p.playerId)===identity);
    if(matches.length!==1){addLog('لا توجد نتيجة EA واحدة تطابق Player ID '+identity+'؛ افتح EA Native Search واختر اللاعب بنفسك.','warning');return;}
    if(epoch!==state.selectionEpoch||state.selected?.key!==selected.key)return;
    const pick=matches[0],response=await Runtime.choosePlayer(pick.token,pick.index,pick.playerId);
    if(epoch!==state.selectionEpoch||state.selected?.key!==selected.key){
      // Selection changed during the await: remove any stale EA choice.
      if(!state.selectedTargets.length)void clearEAPlayer('إلغاء اختيار قديم');
      return;
    }
    state.nativePlayerConfirmed=Boolean(response?.ok);
    if(response?.ok){
      $('playerSyncState').textContent='✓ EA base player verified: '+response.playerId;
      addLog('تم تأكيد اللاعب في نموذج EA، Player ID: '+response.playerId+' · اختيار نسخة البطاقة الخاصة غير مؤكد.','success');
    }else{
      $('playerSyncState').textContent='EA: not verified';
      addLog('لم يتم تأكيد اللاعب: '+(response?.reason||response?.message||'Unknown'),'warning');
    }
    renderSelectedCard();save();
  }
  function renderPlayers(list=[],notice=''){
    state.players=list;
    const host=$('playerResults');if(!host)return;host.replaceChildren();$('cardCount').textContent=`${list.length} ${tr('cardcount')}`;
    if(notice){const d=document.createElement('div');d.className='muted';d.textContent=notice;host.appendChild(d);}
    for(const [index,p] of list.slice(0,24).entries()){
      const b=document.createElement('button');b.type='button';b.className='result';
      if(state.selectedTargets.some(x=>x.key===String(p.key||p.itemId||p.playerId||p.name)))b.classList.add('chosen');
      const avatar=document.createElement('span');avatar.className='avatar';avatar.textContent=String(p.name||'?').charAt(0).toUpperCase();
      const sources=verifiedArtwork(p);
      if(sources.length){
        avatar.textContent='';avatar.classList.add('image-loading');
        const img=document.createElement('img');img.alt=p.name||'Player card';
        img.loading='eager';img.decoding='async';img.fetchPriority=index<8?'high':'auto';
        let pos=0;
        img.onload=()=>{avatar.classList.remove('image-loading');avatar.classList.add('image-ready')};
        img.onerror=()=>{
          pos++;
          if(pos<sources.length){img.src=sources[pos];return;}
          img.remove();avatar.classList.remove('image-loading');avatar.classList.add('image-missing');
          avatar.textContent=String(p.name||'?')[0].toUpperCase();
        };
        img.src=sources[0];avatar.appendChild(img);
      }
      const info=document.createElement('span');info.className='rdata';const name=document.createElement('b');name.textContent=p.name||'Unknown';const desc=document.createElement('small');desc.textContent=`${p.position||'—'} · ${p.rarity||'—'} · ${p.club||'—'} · Item ID ${p.itemId||'—'} · Player ID ${p.playerId||'—'}`;
      info.append(name,desc);const rating=document.createElement('span');rating.className='rating';rating.textContent=p.rating||'—';
      b.append(avatar,info,rating);b.addEventListener('click',async()=>{
        if(p.source==='EA'&&p.token){
          const requestEpoch=++state.selectionEpoch;
          await nativeClearPromise;
          if(requestEpoch!==state.selectionEpoch)return;
          const response=await Runtime?.choosePlayer?.(p.token,p.index,p.playerId);
          if(requestEpoch!==state.selectionEpoch)return;
          if(!response?.ok){addLog('فشل اختيار لاعب EA الأصلي: '+(response?.reason||response?.message||'Unknown'),'error');return;}
          commitPlayer({...p,imageUrl:p.imageUrl||'',itemId:null},true);
          addLog('EA native Player ID confirmed: '+response.playerId+' · '+p.name,'success');
          // Keep native EA portrait. FUT.GG card editions may be TOTW/Icon/Hero and
          // must never silently replace the verified EA base-player image.
          renderTargets();
        }else selectPlayer(p);
      });host.appendChild(b);
    }
  }
  async function searchEANative(term,token){
    if(term.trim().length<1){renderPlayers([],state.language==='ar'?'اكتب حرفًا لبحث EA الأصلي.':'Enter a letter for EA native search.');return;}
    if(!Runtime?.searchPlayers){renderPlayers([], 'EA native search bridge is missing; reload the Web App.');return;}
    const response=await Runtime.searchPlayers(term);
    if(token!==state.pendingQuery||state.nativeSearchMode!=='ea')return;
    if(!response?.ok){
      renderPlayers([], (state.language==='ar'?'بحث EA لم يبدأ: ':'EA search unavailable: ')+(response?.reason||response?.message||'Unknown error'));
      addLog('Native EA player lookup: '+(response?.reason||response?.message||'unknown'),'warning');
      return;
    }
    const items=(response.items||[]).filter(x=>x.playerId>0);
    state.nativePlayerResults=items;
    renderPlayers(items,items.length?'':(state.language==='ar'?'لا توجد نتائج في محرك لاعبي EA.':'EA native search returned no player entries.'));
    state.lastProvider='EA native player engine · '+items.length+' results';refresh();
  }
  async function searchPlayers(){
    const term=input('player');const token=++state.pendingQuery;
    if(state.nativeSearchMode==='ea')return searchEANative(term,token);
    if(term.length<1){renderPlayers([], 'اكتب اسم لاعب لعرض البطاقات المحفوظة.');return;}
    const local=state.cache.filter(p=>normalize(p.name).includes(normalize(term))||String(p.itemId||'')===term||String(p.playerId||'')===term).slice(0,12);
    if(term.length===1){renderPlayers(local,'نتائج محلية للحرف الأول؛ البحث الخارجي يبدأ عند حرفين.');return;}
    renderPlayers(local, local.length?'نتائج محفوظة من بحث سابق — جاري تحديث الكتالوج…':'جاري البحث في كتالوج FUT.GG…');
    state.lastProvider='FUT.GG · جاري الاتصال';refresh();
    try{
      const response=await chrome.runtime.sendMessage({type:'GPTS_SEARCH_FUTGG',payload:{query:term,page:1}});
      if(token!==state.pendingQuery)return;
      if(!response?.ok)throw Error(response?.error||'تعذر الاتصال بمصدر اللاعبين');
      const list=(response.result.items||[]).filter(p=>p&&p.name);
      state.lastProvider=`FUT.GG · ${list.length} نتيجة`;
      if(list.length){state.cache=[...list,...state.cache.filter(p=>!list.some(n=>n.key===p.key))].slice(0,180);renderPlayers(list);updateDatalists();}
      else renderPlayers(local, 'لا توجد نتائج من المصدر الآن.');
      $('dataHealth').textContent='كتالوج خارجي · '+list.length+' نتيجة · آخر اتصال '+new Date().toLocaleTimeString('ar-EG');
      addLog(`بحث عن ${term} · ${list.length} بطاقة في كتالوج FUT.GG`,'info');
    }catch(e){if(token!==state.pendingQuery)return;state.lastProvider='تعذر الاتصال';renderPlayers(local,`فشل مصدر اللاعبين: ${e.message}. جرّب لاحقًا أو بيانات سبق حفظها.`);$('dataHealth').textContent='فشل اتصال FUT.GG: '+e.message;addLog(`فشل البحث: ${e.message}`,'error');}
    refresh();save();
  }
  function markConnectProgress(text){
    const el=$('nativeConnectSteps');if(!el)return;
    const row=document.createElement('div');row.textContent=String(text).slice(0,180);
    row.className='connect-step';el.prepend(row);while(el.childElementCount>9)el.lastElementChild.remove();
  }
  function runtimeAsText(){return 'CODEX SNIPE — EA runtime diagnostics\n'+JSON.stringify(state.runtimeReport||{status:'Not checked'},null,2);}
  function renderRuntime(report){
    const root=$('runtimeRows');if(!root)return;
    const data=report?.runtime||null;root.replaceChildren();
    $('runtimeFlag').textContent=data ? (data.exposed?.appMain?'APP DETECTED':'NOT EXPOSED') : 'UNAVAILABLE';
    if(data){
      const keys=[['appMain','EA getAppMain'],['tabTags','Transfers tab enumeration'],['marketSearchController','Market filters controller'],['navigationController','Navigation controller'],['itemSearchService','Market search service (detected only)']];
      for(const [id,label] of keys){const row=document.createElement('div');row.className='compat-item '+(data.exposed?.[id]?'ok':'bad');row.textContent=(data.exposed?.[id]?'✅ ':'❌ ')+label;root.appendChild(row);}
      const extra=document.createElement('div');extra.className='native-status';extra.textContent=`Runtime: ${data.status||'—'} | Current: ${data.currentView||'—'} | EA market enabled: ${data.marketEnabled===null?'unverified':String(data.marketEnabled)}`;root.appendChild(extra);
    }
    const model=state.nativeModelReport?.filters;
    if(model){
      const title=document.createElement('div');title.className='native-status '+(model.controllerActive?'good':'bad');title.textContent=model.controllerActive?'EA filter controller: active':'EA filter controller: not active';root.appendChild(title);
      for(const [id,x] of Object.entries(model.priceFields||{})){
        const row=document.createElement('div');row.className='compat-item '+(x.supported?'ok':'bad');
        row.textContent=(x.supported?'✅ ':'❌ ')+id+' native price field (EA UI + model)';root.appendChild(row);
      }
      for(const [id,ok] of Object.entries(model.enumKeys||{})){
        const row=document.createElement('div');row.className='compat-item '+(ok?'ok':'bad');
        row.textContent=(ok?'✅ ':'❌ ')+id+' native filter event';root.appendChild(row);
      }
      const prov=document.createElement('div');prov.className='compat-item '+(model.dataProvider?'ok':'bad');prov.textContent=(model.dataProvider?'✅ ':'❌ ')+'EA original filter DataProvider';root.appendChild(prov);
    }
    $('runtimeMessage').textContent=report?.message||data?.status||'Runtime bridge unavailable';
    $('runtimeMessage').className='native-status '+(report?.ok?'good':'bad');
  }
  async function inspectRuntime(){
    if(!Runtime){renderRuntime({ok:false,message:'Runtime bridge script missing'});return null;}
    const report=await Runtime.probe();state.runtimeReport=report;
    state.nativeModelReport=await Runtime.inspectFilters();renderRuntime(report);
    addLog('Runtime probe: '+(report?.runtime?.status||report?.message||'unavailable')+'; EA model: '+(state.nativeModelReport?.filters?.controllerActive?'active':'not active'),report?.runtime?.exposed?.appMain?'success':'warning');
    return report;
  }
  async function openViaRuntime(){
    if(!Runtime)return {ok:false,stage:'not-loaded',message:'Runtime bridge not installed'};
    const report=await Runtime.openMarket();state.runtimeReport=report;state.nativeModelReport=await Runtime.inspectFilters();renderRuntime(report);
    addLog('EA app navigation: '+(report?.message||report?.stage),report?.ok?'success':'warning');
    return report;
  }
  async function connectEA(){
    if(state.nativeConnectInProgress)return false;
    state.nativeConnectInProgress=true;const btn=$('connectEA');if(btn)btn.disabled=true;
    const panel=$('nativeConnectStatus');if(panel){panel.textContent='Connecting to original EA market…';panel.className='native-status';}
    try{
      markConnectProgress('Trying application controllers first');
      const direct=await openViaRuntime();
      if(direct.ok){
        // Opening a controller is NOT equivalent to confirming the EA Search button or filters.
        let verified=false;
        for(let attempt=0;attempt<12;attempt++){
          if(Native?.hasForm?.() && Native?.marketSearchButton?.()){verified=true;break;}
          await nap(250);
        }
        markConnectProgress(verified?'Controller + Search form verified':'Controller opened, Search DOM mapping still unverified');
        if(panel){panel.textContent=verified?'✓ EA market form verified':'⚠ EA filter screen opened via app functions, but Search form/button not verified';panel.className='native-status '+(verified?'good':'bad');}
        state.nativeModelReport=await Runtime?.inspectFilters?.();renderRuntime(state.runtimeReport);
        inspectNative();return verified;
      }
      markConnectProgress('App path: '+(direct.message||direct.stage||'not available'));
      if(direct.stage==='feature'){
        if(panel){panel.textContent='EA reports Transfer Market disabled for this account';panel.className='native-status bad';}
        return false;
      }
      if(!Native){if(panel)panel.textContent='DOM fallback not installed';return false;}
      markConnectProgress('Trying visible EA navigation fallback');
      const report=await Native.connectMarket(markConnectProgress);
      if(panel){panel.textContent=report.ok?'✓ EA Transfer Market Search connected':'✕ EA connection stopped at '+report.stage+' — '+report.trace.at(-1);panel.className='native-status '+(report.ok?'good':'bad');}
      addLog(report.ok?'اتصلنا بواجهة بحث EA الأصلية':'تعذر الوصول لسوق EA عند المرحلة: '+report.stage,report.ok?'success':'warning');
      inspectNative();return report.ok;
    }catch(e){addLog('تعذر الاتصال بواجهة EA: '+e.message,'error');if(panel)panel.textContent=e.message;return false;}
    finally{state.nativeConnectInProgress=false;if(btn)btn.disabled=false;refresh();}
  }
  function imageFromNative(src){try{const url=new URL(src,location.href);if(url.protocol==='https:')return url.href;}catch{}return '';}
  async function showNativePicker(kind){
    if(kind==='club'&&shadow?.querySelector('[data-native-picker="club"]')?.disabled){addLog('اختار دوريًا محددًا قبل النادي','warning');return;}
    const target=$('nativePickerResults'),status=$('pickerStatus'),dock=$('nativePickerDock');if(!target||!status||!dock)return;
    const clicked=shadow.querySelector(`[data-native-picker="${kind}"]`);
    if(!clicked)return;
    if(!dock.hidden&&dock.dataset.kind===kind){dock.hidden=true;state.pickerDockOpen=false;clicked.setAttribute('aria-expanded','false');return;}
    shadow.querySelectorAll('[data-native-picker]').forEach(b=>b.setAttribute('aria-expanded','false'));
    clicked.setAttribute('aria-expanded','true');
    clicked.closest('.field').appendChild(dock);dock.dataset.kind=kind;dock.hidden=false;state.pickerDockOpen=true;
    target.replaceChildren();status.textContent='EA '+kind+' · Loading original options…';
    if(!Native?.hasForm()){
      const model=Runtime?.inspectFilters?await Runtime.inspectFilters():null;
      if(!model?.filters?.controllerActive){
        const connected=await connectEA();if(!connected){status.textContent='لا يمكن عرض فلاتر '+kind+' قبل الاتصال بشاشة السوق الأصلية.';return;}
      }
    }
    // Prefer EA's original in-memory DataProvider. DOM-only pickers remain a fallback.
    let found=Runtime?.listOptions?await Runtime.listOptions(kind):{ok:false,reason:'EA runtime unavailable'};
    const fromModel=Boolean(found?.ok);
    if(!fromModel)found=await Native.openPicker(kind);
    state.pickerKind=kind;state.pickerOptions=found.options||[];
    status.textContent=`EA ${kind}: ${found.ok?found.options.length+' original option(s) · '+(fromModel?'EA DataProvider':'visible DOM')+(found.stats?.duplicatesHidden?' · '+found.stats.duplicatesHidden+' repeated IDs hidden':'')+(found.stats?.untranslated?' · '+found.stats.untranslated+' labels unavailable':''):found.reason}`;
    if(!found.ok){addLog('لم تظهر خيارات '+kind+' الأصلية من EA: '+(found.reason||'Unknown'),'warning');return;}
    const bar=document.createElement('input');bar.type='search';bar.className='native-option-filter';bar.placeholder='Filter EA choices / تصفية الخيارات';target.appendChild(bar);
    const grid=document.createElement('div');grid.className='native-option-grid';target.appendChild(grid);
    let batch=120;
    const more=document.createElement('button');more.type='button';more.className='secondary native-show-more';more.textContent='عرض المزيد / Show more';target.appendChild(more);
    const render=()=>{
      grid.replaceChildren();const term=normalize(bar.value);
      const filtered=state.pickerOptions.filter(opt=>!term||normalize(opt.label).includes(term));
      for(const opt of filtered.slice(0,batch)){
        const button=document.createElement('button');button.type='button';button.className='native-option';button.title=opt.label;
        const imgUrl=imageFromNative(opt.image);
        if(imgUrl){
          const img=document.createElement('img');img.alt='';img.loading='eager';img.decoding='async';img.src=imgUrl;
          img.onerror=()=>{img.remove();const shield=document.createElement('span');shield.className='native-icon-fallback';shield.textContent=kind==='club'?'⚽':kind==='nation'?'⚑':kind==='league'?'🏆':'◆';button.prepend(shield);};
          button.append(img);
        }else{
          const shield=document.createElement('span');shield.className='native-icon-fallback';shield.textContent=kind==='club'?'⚽':kind==='nation'?'⚑':kind==='league'?'🏆':'◆';button.append(shield);
        }
        const text=document.createElement('span');text.textContent=opt.label;button.append(text);
        button.addEventListener('click',async()=>{
          button.disabled=true;
          const result=fromModel?await Runtime.chooseOption(kind,opt.index):Native.chooseOption(opt.index);
          if(!result?.ok){status.textContent='EA option failed: '+(result?.reason||'Reload picker');button.disabled=false;return;}
          const inputEl=$(kind);if(inputEl)inputEl.value=result.label;
          state.nativeChoices[kind]=result.label;
          if(kind==='league'){delete state.nativeChoices.club;if($('club'))$('club').value='';updateClubLock();}
          updateNativeLabels();addLog('اختيار أصلي من EA: '+kind+' — '+result.label,'success');
          status.textContent='✓ EA '+kind+': '+result.label+' ('+(fromModel?'app model':'visible control')+')';grid.replaceChildren();bar.remove();more.remove();dock.hidden=true;state.pickerDockOpen=false;clicked.setAttribute('aria-expanded','false');save();
        });grid.append(button);
      }
      more.hidden=filtered.length<=batch;
      more.textContent=`عرض المزيد / Show more (${Math.min(batch,filtered.length)} / ${filtered.length})`;
    };bar.addEventListener('input',()=>{batch=120;render();});more.addEventListener('click',()=>{batch+=120;render();});render();
    addLog('تمت قراءة '+found.options.length+' خيارات '+kind+' من '+(fromModel?'EA DataProvider':'DOM')+'.','info');
  }
  function nativeOfferImage(row){
    const img=row.querySelector('img');if(img?.currentSrc||img?.src)return imageFromNative(img.currentSrc||img.src);
    for(const el of [row,...row.querySelectorAll('.ut-item-image,.player-image,.image')].slice(0,8)){
      const bg=getComputedStyle(el).backgroundImage||'';const m=bg.match(/url\(["']?([^"')]+)["']?\)/);if(m)return imageFromNative(m[1]);
    }return '';
  }
  function displayNativeOffers({log=false}={}){
    const target=$('nativeOffers');if(!target)return;
    target.replaceChildren();
    // One DOM snapshot feeds both the visible listing cards and the minimum price.
    // Never reuse an old "lowest" value after the result view has disappeared.
    const rows=resultRows().slice(0,30);
    const listings=rows.map(row=>({row,card:rowCard(row),imageUrl:nativeOfferImage(row)}));
    const priced=listings.filter(x=>Number.isSafeInteger(x.card.price)&&x.card.price>0);
    const cheapest=priced.length?priced.reduce((a,b)=>a.card.price<=b.card.price?a:b):null;
    state.lowestObserved=cheapest?{price:cheapest.card.price,name:cheapest.card.name,at:new Date().toISOString(),sampleCount:priced.length}:null;
    if($('lowestPriceValue'))$('lowestPriceValue').textContent=cheapest?fmt(cheapest.card.price)+' Coins':'—';
    if($('lowestPriceMeta'))$('lowestPriceMeta').textContent=rows.length?(state.language==='ar'?`${rows.length} عرض ظاهر · ${priced.length} سعر مقروء · ${new Date().toLocaleTimeString()}`:`${rows.length} visible · ${priced.length} priced · ${new Date().toLocaleTimeString()}`):tr('notobserved');
    if(!rows.length){
      const empty=document.createElement('div');empty.className='muted';
      empty.textContent=state.language==='ar'?'لا توجد عروض سوق EA ظاهرة للقراءة. افتح صفحة نتائج البحث الأصلية أولًا.':'No visible EA market listings. Open native search results first.';
      target.append(empty);
      if(log)addLog('لم تظهر نتائج قابلة للقراءة من صفحة سوق EA الحالية.','warning');
      return;
    }
    for(const {card,imageUrl} of listings){
      const view=document.createElement('div');view.className='native-offer';
      if(cheapest&&card.price&&card.price===cheapest.card.price)view.classList.add('cheapest');
      const media=document.createElement('span');media.className='native-offer-media';
      if(imageUrl){const im=document.createElement('img');im.src=imageUrl;im.alt='';im.loading='eager';im.onerror=()=>{im.remove();media.textContent='♙';};media.append(im);}else media.textContent='♙';
      const info=document.createElement('div');info.className='native-offer-info';
      const name=document.createElement('b');name.textContent=card.name||'EA Item';
      const meta=document.createElement('small');meta.textContent=[card.rating&&`OVR ${card.rating}`,card.rarity,card.itemId&&`ID ${card.itemId}`].filter(Boolean).join(' · ')||(state.language==='ar'?'البيانات غير ظاهرة':'Details unavailable');
      const price=document.createElement('strong');price.textContent=card.price?fmt(card.price)+' Coins':'—';
      info.append(name,meta,price);
      if(cheapest&&card.price===cheapest.card.price){const tag=document.createElement('span');tag.className='cheapest-label';tag.textContent=state.language==='ar'?'أقل سعر ظاهر':'Lowest visible';view.append(tag);}
      view.append(media,info);target.append(view);
    }
    if(log)addLog(cheapest?`تمت قراءة ${rows.length} عرض · أقل سعر ظاهر: ${fmt(cheapest.card.price)} Coins`:`تمت قراءة ${rows.length} عرضًا، لكن أسعار Buy Now غير ظاهرة.`,cheapest?'success':'warning');
  }
  // One explicit, manual EA Search click: never buys, never submits credentials,
  // and never represents cached/unchanged UI as a verified new market response.
  function renderNativeProbeRows(snapshot){
    const target=$('nativeOffers');if(!target)return;target.replaceChildren();
    const rows=Array.isArray(snapshot?.items)?snapshot.items:[];
    const valid=rows.filter(x=>Number.isSafeInteger(x.price)&&x.price>0);
    const lowest=valid.length?Math.min(...valid.map(x=>x.price)):null;
    state.lowestObserved=lowest===null?null:{price:lowest,at:new Date(snapshot.receivedAt||Date.now()).toISOString(),sampleCount:valid.length};
    $('lowestPriceValue').textContent=lowest===null?'—':fmt(lowest)+' Coins';
    $('lowestPriceMeta').textContent=`${rows.length} EA entries · ${valid.length} valid prices · ${snapshot.identicalToPrevious?'same trade IDs as last scan':'new trade IDs or first scan'} · ${Math.max(0,snapshot.receivedAt-snapshot.startedAt)}ms`;
    if(!rows.length){const empty=document.createElement('p');empty.className='muted';empty.textContent=state.language==='ar'?'رد EA أكّد عدم وجود عروض في هذه الدورة.':'Native EA response had no listings.';target.appendChild(empty);return;}
    for(const card of rows){
      const view=document.createElement('div');view.className='native-offer';if(lowest!==null&&card.price===lowest)view.classList.add('cheapest');
      const image=document.createElement('span');image.className='native-offer-media';
      const src=imageFromNative(card.image||'');if(src){const im=document.createElement('img');im.src=src;im.alt='';im.loading='eager';im.onerror=()=>{im.remove();image.textContent='♙';};image.append(im);}else image.textContent='♙';
      const info=document.createElement('div');info.className='native-offer-info';const name=document.createElement('b');name.textContent=card.name||'EA listing';
      const meta=document.createElement('small');meta.textContent=[card.rating?`OVR ${card.rating}`:'',card.position||'',card.itemId?`ID ${card.itemId}`:'',card.tradeId?`Trade ${card.tradeId}`:''].filter(Boolean).join(' · ');
      const price=document.createElement('strong');price.textContent=card.price?fmt(card.price)+' Coins':'—';info.append(name,meta,price);view.append(image,info);target.append(view);
    }
  }
  // Manual one-shot uses EA's page controller event, not button clicks or a direct private HTTP request.
  async function probeMarketOnce(){
    if(state.running||state.marketProbeBusy){addLog('افحص السوق بعد إيقاف الجلسة الحالية.','warning');return;}
    state.lossWarned.clear();state.marketProbeBusy=true;const buttonUI=$('marketProbe');if(buttonUI)buttonUI.disabled=true;
    const output=$('marketProbeStatus');const say=(m,l='info')=>{if(output)output.textContent=m;addLog(m,l);};
    try{
      if(blocked())throw Error('EA verification is visible — market check aborted.');
      if(!Runtime?.scanMarket)throw Error('Native EA service bridge missing. Reload the Web App.');
      if(state.selectedTargets.length&&state.selected&&input('player')&&!state.nativePlayerConfirmed)throw Error('EA player selection unverified. Select an EA suggestion or clear the target.');
      let native=await Runtime.inspectFilters();
      if(!native?.filters?.controllerActive){const opened=await Runtime.openMarket();if(!opened?.ok)throw Error('Cannot open native EA filters: '+(opened?.message||opened?.stage));native=await Runtime.inspectFilters();}
      if(!native?.filters?.controllerActive)throw Error('EA filters controller is not active.');
      await verifyPlayerForScan();
      const applied=await applyNative();if(!applied?.ok)throw Error('EA filter values not verified: '+(applied?.unmapped||[]).join(', '));
      $('nativeOffers').replaceChildren();$('lowestPriceValue').textContent='—';$('lowestPriceMeta').textContent='Awaiting native EA service response…';
      say(state.language==='ar'?'فحص واحد بمود '+MODE_NAMES[searchConfig().mode]+' — ننتظر رد خدمة EA…':'One EA service scan via '+MODE_NAMES[searchConfig().mode]+' — awaiting response…');
      const args=buildScanArgs(true);logScanInputs(args,'فحص يدوي بالدوال');const answer=await Runtime.scanMarket(args);collectModeStats(answer,args.mode);logAppliedCriteria(answer);
      if(!answer?.ok)throw Error(answer?.message||answer?.reason||'EA did not confirm results');
      state.nativeProbeSnapshot=answer;renderNativeProbeRows(answer);
      // Price warnings are advisory only; they never suppress or repeat a manual EA search.
      if(state.selectedTargets.length===1&&state.nativePlayerConfirmed){
        const expected=Number(state.selectedTargets[0]?.playerId||0);
        for(const card of (answer.items||[]))if(expected&&Number(card.playerId)===expected)warnLossOnce(card);
      }
      say((state.language==='ar'?'رد سوق EA الأصلي: ':'Native EA market response: ')+`${answer.items?.length||0} items · ${answer.durationMs}ms · ${answer.identicalToPrevious?'same listing IDs for this mode':'different/first listing IDs for this mode'}`,'success');
    }catch(e){
      state.nativeProbeSnapshot=null;
      $('nativeOffers')?.replaceChildren();if($('lowestPriceValue'))$('lowestPriceValue').textContent='—';
      if($('lowestPriceMeta'))$('lowestPriceMeta').textContent='No verified fresh event';
      say((state.language==='ar'?'فحص السوق لم يتأكد: ':'Market check unconfirmed: ')+String(e?.message||e),'warning');
    }finally{state.marketProbeBusy=false;if(buttonUI)buttonUI.disabled=false;}
  }
  function fieldList(){
    const inputs=[...document.querySelectorAll('input, select')].filter(e=>visible(e)&&!e.closest('#gpts-v3-host')&&!(e.type==='hidden'||e.type==='password'));
    return inputs.map(e=>({el:e,label:[e.getAttribute('aria-label'),e.getAttribute('placeholder'),e.id,e.name,e.closest('label')?.innerText,e.closest('.ut-form-field,.filter-row,.field-container')?.textContent].filter(Boolean).join(' ').toLowerCase().slice(0,240)}));
  }
  function findField(patterns){
    const found=fieldList().filter(({label})=>patterns.some(p=>p.test(label)));
    return found.length===1?found[0].el:null;
  }
  function findNativeSearchButton(){
    const native=Native?.marketSearchButton();if(native)return native;
    const zones=[...document.querySelectorAll('.ut-market-search-filters-view, .ut-market-search-view, .ut-pinned-list-container, [class*="market-search"]')].filter(visible);
    const buttons=[...document.querySelectorAll('button')].filter(b=>visible(b)&&!b.disabled&&b.id!=='gpts-v3-nav'&&!b.closest('#gpts-v3-host'));
    return buttons.find(b=>zones.some(z=>z.contains(b))&&/^(search|بحث|rechercher|suchen|buscar)$/i.test(b.textContent.trim()))||
     buttons.find(b=>zones.some(z=>z.contains(b))&&/btn-standard/.test(b.className)&&/primary|call-to-action/.test(b.className))||null;
  }
  function findBackButton(){return [...document.querySelectorAll('button.ut-navigation-button-control,button[aria-label="Back"],button[data-testid*="back"]')].find(x=>visible(x)&&!x.closest('#gpts-v3-host'))||null;}
  function setNativeValue(el,value){if(el.tagName==='SELECT'){const o=[...el.options].find(x=>normalize(x.value)===normalize(value)||normalize(x.textContent)===normalize(value));if(!o)return false;el.value=o.value;}else{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;if(setter)setter.call(el,String(value));else el.value=String(value);}el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));return true;}
  const bridge=[
    ['player',[/player.*name|name.*player|search.*player|اسم.*لاعب/i]],
    ['minBid',[/min.*bid|bid.*min|minimum.*bid/i]],['maxBid',[/max.*bid|bid.*max|maximum.*bid/i]],
    ['minBin',[/min.*buy.?now|buy.?now.*min|minimum.*bin/i]],['maxBin',[/max.*buy.?now|buy.?now.*max|maximum.*bin/i]],
    ['quality',[/quality|rarity|نوع.*بطاق/i]],['position',[/position|مركز/i]],
    ['nation',[/nation|country|دولة|جنسية/i]],['league',[/league|دوري/i]],['club',[/club|نادي/i]]
  ];
  function inspectNative(){
    const fields=fieldList();let linked=0;
    for(const [id,patterns] of bridge)if(findField(patterns))linked++;
    const hasSearch=!!findNativeSearchButton();
    const bridgeStatus=Native?.nativeStatus();
    const m=state.nativeModelReport?.filters;
    const appLinked=m?.controllerActive?bridge.filter(([id])=>m.priceFields?.[id]?.supported||(m.nativePickerApi&&m.enumKeys?.[id])).length:0;
    const msg=`EA: ${fields.length} حقل DOM ظاهر · DOM ${linked}/${bridge.length} · APP ${appLinked}/${bridge.length} · زر Search: ${hasSearch?'موجود':'غير مكتشف'}. Native: ${bridgeStatus?.hasForm?'Form detected':'Form unavailable'}.`;
    state.lastNative=msg;$('nativeInfo').textContent=msg;$('nativeInfo').className='native-status '+(hasSearch?'good':'bad');$('syncCount').textContent=`EA FILTERS: DOM ${linked}/${bridge.length} | APP ${appLinked}/${bridge.length}`;
    addLog(msg,hasSearch?'success':'warning');return{linked,fields,hasSearch};
  }
  function compatibilityAudit(){
    const hasMarket=[...document.querySelectorAll('.ut-market-search-filters-view,.ut-market-search-view,[class*="market-search"]')].some(visible);
    const hasSearch=Boolean(findNativeSearchButton());
    const rows=resultRows();
    const checks=[];
    const add=(name,condition,detail,viewDependent=true)=>checks.push({name,status:condition?'pass':viewDependent&&!hasMarket?'unknown':'fail',detail});
    add('Native market search screen',hasMarket,hasMarket?'DOM market container recognized':'Open Transfers → Transfer Market → Search',false);
    if(!hasMarket)checks[checks.length-1].status='unknown';
    add('Native Search button',hasSearch,hasSearch?'Visible Search control found':'EA Search button missing');
    for(const [id,patterns] of bridge){
      const field=findField(patterns);
      const n=state.nativeModelReport?.filters;
      const nativePrice=n?.controllerActive&&n.priceFields?.[id]?.supported;
      const nativePicker=n?.controllerActive&&n.nativePickerApi&&n.enumKeys?.[id];
      if(nativePrice)add('EA Filter: '+id,true,'EA internal UI + criteria available; DOM selector not required');
      else if(nativePicker)add('EA Filter: '+id,true,'EA native filter event available; verify option list when opened');
      else add('EA Filter: '+id,Boolean(field),field?`Visible ${field.tagName} mapped`:'No matching native method or DOM control in current view');
    }
    add('Result list container',[...document.querySelectorAll('.SearchResults,.ut-market-search-results-view')].some(visible),'Only required when result view is open');
    if(!rows.length)checks[checks.length-1].status='unknown';
    add('Buy Now control',Boolean(buyButton()),'Only present when a purchasable listing is selected');
    checks[checks.length-1].status=buyButton()?'pass':'unknown';
    const first=rows[0]||null;
    const card=first?rowCard(first):null;
    for(const [label,ok] of [
      ['Result: player name',Boolean(card?.name)],
      ['Result: rating',Number.isInteger(card?.rating)&&card.rating>0],
      ['Result: item ID',Boolean(card?.itemId)],
      ['Result: rarity',Boolean(card?.rarity)],
      ['Result: Buy Now price',Number.isInteger(card?.price)&&card.price>0]
    ]){
      add(label,ok,first?(ok?'Read from a visible result':'Visible result lacks readable data'):'Open a result list to test',false);
      if(!first)checks[checks.length-1].status='unknown';
    }
    add('Confirmation dialog',Boolean(dialog()),'Only required during a native purchase dialog',false);
    checks[checks.length-1].status=dialog()?'pass':'unknown';
    add('CAPTCHA/security challenge',!blocked(),'Session must stop if protection appears',false);
    const counters={pass:checks.filter(x=>x.status==='pass').length,fail:checks.filter(x=>x.status==='fail').length,unknown:checks.filter(x=>x.status==='unknown').length};
    const report={nativeModel:state.nativeModelReport?.filters||null,kind:'GPT_SNIPE_COMPATIBILITY',version:'3.17.1',at:new Date().toISOString(),page:location.pathname,marketViewDetected:hasMarket,searchButtonDetected:hasSearch,counts:counters,checks};
    state.lastAudit=report;
    state.auditLog.unshift({at:report.at,summary:`Pass ${counters.pass}, Fail ${counters.fail}, Need view ${counters.unknown}`,marketView:hasMarket});
    state.auditLog=state.auditLog.slice(0,60);
    renderDiagnostics();
    addLog(`فحص EA: ✅${counters.pass} / ❌${counters.fail} / ◌${counters.unknown} (غير ظاهر)`,counters.fail?'warning':'info');
    return report;
  }
  function auditAsText(){
    const a=state.lastAudit||compatibilityAudit();
    const model=a.nativeModel;
    const modelLines=model?['','EA INTERNAL MODEL (not DOM):',`Controller active: ${model.controllerActive}`,`DataProvider: ${model.dataProvider}`,`Player selected in native model: ${model.selectedPlayer}`,
      ...Object.entries(model.priceFields||{}).map(([k,x])=>`${x.supported?'PASS':'FAIL'} Native Price ${k}: model=${x.model} ui=${x.ui}`),
      ...Object.entries(model.enumKeys||{}).map(([k,v])=>`${v?'PASS':'FAIL'} EA filter ${k}`)]:['','EA INTERNAL MODEL: not inspected'];
    return [`CODEX SNIPE DIAGNOSTICS v${a.version}`,`Time: ${a.at}`,`Page: ${a.page}`,`EA market view: ${a.marketViewDetected}`,`Search button: ${a.searchButtonDetected}`,`PASS: ${a.counts.pass} | FAIL: ${a.counts.fail} | NOT SHOWN: ${a.counts.unknown}`,...a.checks.map(c=>`[${c.status.toUpperCase()}] ${c.name} — ${c.detail}`),...modelLines].join('\n');
  }
  function technicalAsText(){
    const lines=state.auditLog.map(x=>`[${x.at}] ${x.summary} | marketView=${x.marketView}`);
    return ['CODEX SNIPE TECHNICAL LOG',...lines,'','Recent application events:',...state.logs.slice(0,40).map(x=>`[${x.at}] ${x.level} ${x.message}`)].join('\n');
  }
  function renderDiagnostics(){
    const a=state.lastAudit;if(!a)return;
    const summary=$('auditSummary');if(summary)summary.textContent=`✓ ${a.counts.pass}   ✕ ${a.counts.fail}   ? ${a.counts.unknown}`;
    const results=$('compatResults');if(results){results.replaceChildren();for(const row of a.checks){
      const div=document.createElement('div');div.className='audit-row '+row.status;
      const mark=document.createElement('b');mark.textContent=row.status==='pass'?'✓':row.status==='fail'?'×':'?';
      const body=document.createElement('span');body.textContent=row.name;
      const info=document.createElement('small');info.textContent=row.detail;
      div.append(mark,body,info);results.appendChild(div);
    }}
    const log=$('technicalLogs');if(log)log.textContent=technicalAsText();
  }
  function saveTextFile(filename,text,contentType='text/plain;charset=utf-8'){
    const blob=new Blob(['\ufeff'+text],{type:contentType});const url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);addLog('تم النسخ إلى الحافظة.','success');}
    catch(e){addLog('تعذر النسخ، استخدم تصدير TXT: '+e.message,'warning');}
  }
  function logsAsText(){return ['CODEX SNIPE ACTIVITY LOG',...state.logs.map(x=>`[${x.at}] [${x.level}] ${x.message}`)].join('\n');}
  function captureVisibleLowestQuiet(){displayNativeOffers();}
  function captureVisibleLowest(){displayNativeOffers({log:true});}
  function exportNativeMap(){
    const {fields,hasSearch}=inspectNative();
    const data={kind:'CODEX SNIPE DOM map - labels only',timestamp:new Date().toISOString(),urlPath:location.pathname,hasSearchButton:hasSearch,
      nativeFields:fields.slice(0,120).map(({el,label})=>({label:label.slice(0,160),tag:el.tagName,type:el.type||'',name:el.name||'',id:el.id||'',placeholder:el.placeholder||''})),
      navigation:[...document.querySelectorAll('button,a,[role="tab"],[role="menuitem"]')].filter(e=>visible(e)&&e.getBoundingClientRect().left<340).slice(0,90).map(e=>({tag:e.tagName,role:e.getAttribute('role')||'',label:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,75),className:typeof e.className==='string'?e.className.slice(0,100):''}))};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='GPT_SNIPE_EA_DOM_Map.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),2500);
    addLog('تم تصدير خريطة عناصر الصفحة بدون قيم الحقول أو رموز تسجيل الدخول.','success');
  }
  async function applyNative(){
    const audit=inspectNative();if(!audit.hasSearch){$('nativeInfo').textContent+=' Search غير متاح حتى الآن.';return {ok:false,unmapped:['EA Search'],pricesVerified:false};}
    let applied=0,pricesVerified=false;const unmapped=[];
    const prices={};for(const key of ['minBid','maxBid','minBin','maxBin']){
      const v=input(key);if(v!=='')prices[key]=v;
    }
    if(Object.keys(prices).length && Runtime?.applyPrices){
      const r=await Runtime.applyPrices(prices);
      if(r?.ok&&r?.verified){applied+=(r.applied||[]).length;pricesVerified=Boolean(r.applied?.includes('maxBin'));}
      else addLog('EA model price sync unavailable: '+(r?.reason||r?.message||'Unknown'),'warning');
    }
    for(const [id,patterns] of bridge){
      const value=input(id);if(!value)continue;
      if(id==='player')continue; // Player identity is controlled by native choose/clear, not text mirroring.
      if(state.nativeChoices?.[id]===value)continue;
      if(['minBid','maxBid','minBin','maxBin'].includes(id)&&pricesVerified)continue;
      const field=findField(patterns);
      if(field&&setNativeValue(field,value))applied++;
      else unmapped.push(id);
    }
    $('nativeInfo').textContent=`تم نقل ${applied} حقل إلى EA. غير مربوط: ${unmapped.join(', ')||'لا شيء'}. ${pricesVerified?'Max Buy confirmed in internal EA model.':''}`;
    $('nativeInfo').className='native-status '+(unmapped.length?'bad':'good');
    addLog(`المزامنة: ${applied} حقل؛ غير مربوط ${unmapped.length}. Native prices: ${pricesVerified?'verified':'not verified'}.`,unmapped.length?'warning':'success');
    return {ok:unmapped.length===0,unmapped,applied,pricesVerified};
  }
  function blocked(){return [...document.querySelectorAll('.ea-dialog-view,.ut-dialog-container,.captcha,[id*="captcha"],iframe[src*="captcha"]')].filter(visible).some(e=>/captcha|verify|robot|unusual|too many|suspicious|blocked|security|روبوت|تحقق|حظر/.test((e.textContent||e.id||e.className||'').toString().toLowerCase()));}
  function resultRows(){return [...document.querySelectorAll('.listFUTItem.has-auction-data,.SearchResults .listFUTItem')].filter(visible);}
  function noResults(){return [...document.querySelectorAll('.ut-no-results-view,[class*="no-results"]')].some(visible);}
  function priceFrom(el){
    if(!el)return null;
    for(const attr of ['data-buy-now','data-buy-now-price','data-bin-price']){const p=Core?.coins(el.getAttribute?.(attr));if(p)return p;}
    for(const node of el.querySelectorAll('[class*="buyNowPrice"],[class*="buy-now-price"],[data-testid*="buy-now-price"]')){const p=Core?.coins(node.textContent);if(p)return p;}
    const m=(el.textContent||'').match(/(?:buy\s*now|شراء\s*(?:الآن|فوري))\s*[:\-]?\s*([\d٠-٩۰-۹][\d٠-٩۰-۹\s,.،]*)/i);
    return m?Core?.coins(m[1].trim()):null;
  }
  function rowCard(row){
    const read=s=>row.querySelector(s)?.textContent?.trim()||'';
    const rating=read('.rating,.player-rating,.ratingValue');
    return{name:read('.name,.player-name,.ut-item-name,[class*="playerName"]')||row.dataset.playerName||'',rating:/^\d{2}$/.test(rating)?Number(rating):null,itemId:row.dataset.itemId||row.dataset.playerId||row.dataset.resourceId||null,rarity:row.dataset.rarity||read('.rarity,.item-rarity'),price:priceFrom(row)};
  }
  function selectedPrice(row){
    let p=priceFrom(row);if(p)return p;
    if(!row.classList.contains('selected'))return null;
    for(const el of document.querySelectorAll('.ut-item-details-view,.ut-auction-details-view,.DetailPanel,.item-details')){
      if(visible(el)){p=priceFrom(el);if(p)return p;}
    }return null;
  }
  function buyButton(){return [...document.querySelectorAll('button.buyButton,.btn-standard.buyButton,[data-testid="buy-now-button"]')].find(e=>visible(e)&&!e.disabled);}
  function dialog(){return [...document.querySelectorAll('.ea-dialog-view,.dialog,[role="dialog"]')].filter(visible).at(-1)||null;}
  function dialogConfirm(el){return [...el.querySelectorAll('button')].find(e=>visible(e)&&!e.disabled&&/^(yes|ok|confirm|buy|purchase|accept|موافق|تأكيد|شراء)$/i.test(e.textContent.trim()))||null;}
  function dialogPrice(el){const p=priceFrom(el);if(p)return p;const m=(el?.textContent||'').match(/(?:for|price|مقابل|بسعر)\s*([\d٠-٩۰-۹][\d٠-٩۰-۹,.،\s]*)/i);return m?Core.coins(m[1].trim()):null;}
  function options(){const o=Core.validate(Core.options({target:state.selectedTargets.length===1?input('player'):'',itemId:state.selectedTargets.length===1?input('itemId'):'',rarity:/^(?:any|\*any|0)$/i.test(input('quality'))?'':input('quality'),minRating:input('ratingMin'),maxRating:input('ratingMax'),maxPrice:numeric('maxBin'),maxSpend:numeric('budget'),maxBuys:numeric('maxBuys'),maxSearches:numeric('maxSearches'),intervalMs:rangeConfig().minMs,autoBuy:$('autoBuy')?.checked===true}));o.purchaseMode=input('purchaseMode')||'pharaoh';if(!['pharaoh','deep'].includes(o.purchaseMode))throw Error('وضع الشراء غير معروف');return o;}
  function stop(reason='توقف'){if(!state.running)return;state.running=false;state.nextTargetAt=0;state.token++;state.status=reason;addLog(reason,'warning');refresh();save();}
  async function waitForSearch(token, before=[]){
    const deadline=Date.now()+8500;
    while(state.running&&token===state.token&&Date.now()<deadline){
      if(blocked())throw Error('رُصد CAPTCHA أو رسالة حماية: توقف.');
      const rows=resultRows();
      // Never treat leftover cards from the previous search as a new response.
      if((rows.length && (before.length===0||rows.some((row,i)=>row!==before[i])))||noResults()){
        await nap(280);return;
      }
      await nap(160);
    }
    throw Error('لم نستطع تأكيد نتائج بحث جديدة؛ توقف دون التعامل مع نتائج قديمة.');
  }
  async function checkRow(row,o,token){
    if(!state.running||token!==state.token||!visible(row))return false;
    row.click();await nap(320);if(!state.running||blocked())return false;
    const card=rowCard(row);card.price=selectedPrice(row);
    const match=Core.canBuy(card,o,state.spent,state.bought);if(!match.ok)return false;
    state.matches++;addLog(`فرصة مطابقة: ${card.name||'لاعب'} · ${fmt(card.price)} Coins`,'success');refresh();
    if(!o.autoBuy){stop('تم العثور على عرض مطابق؛ وضع التنبيه فقط.');return true;}
    const button=buyButton();if(!button){stop('زر Buy Now غير واضح: لم يتم شراء.');return true;}
    button.click();let dlg=null;const until=Date.now()+3000;
    while(state.running&&Date.now()<until){if(blocked()){stop('رُصدت حماية أثناء الشراء.');return true;}dlg=dialog();if(dlg)break;await nap(120);}
    if(!dlg){stop('نافذة التأكيد غير واضحة: راجع الواجهة يدويًا.');return true;}
    const price=dialogPrice(dlg);
    if(!price||price!==card.price||price>o.maxPrice||state.spent+price>o.maxSpend){stop('سعر التأكيد غير مطابق؛ لم نؤكد الشراء.');return true;}
    const confirm=dialogConfirm(dlg);if(!confirm){stop('زر تأكيد الشراء غير معروف.');return true;}
    confirm.click();addLog('تم إرسال Buy Now؛ نتحقق من استجابة EA.','warning');
    const deadline=Date.now()+6500;
    while(state.running&&Date.now()<deadline){
      if(row.classList.contains('won')||document.querySelector('.listFUTItem.selected.won')){state.bought++;state.spent+=price;addLog(`شراء مؤكد عبر واجهة EA: ${card.name} · ${fmt(price)}`,'success');showOutcomeNotice('won',card);refresh();return true;}
      if(row.classList.contains('expired')||document.querySelector('.listFUTItem.selected.expired')){state.misses++;addLog('العرض انتهى قبل الشراء.','warning');showOutcomeNotice('miss',card);return true;}
      if(blocked()){stop('رسالة حماية بعد محاولة الشراء.');return true;}await nap(180);
    }
    stop('تم إرسال الطلب لكن نتيجته غير مؤكدة؛ راجع حسابك.');return true;
  }
  function warnLossOnce(card){
    const sale=Number(input('resaleReference')),threshold=Number(input('lossAlertPct')||10);
    if(!Number.isFinite(sale)||sale<=0||!Number.isFinite(threshold)||threshold<1||threshold>100)return;
    const buy=Number(card.price);
    if(!Number.isFinite(buy)||buy<=0)return;
    const net=sale*0.95,loss=(buy-net)/buy*100;
    if(loss+1e-9<threshold)return;
    const target=state.selectedTargets[0];
    const key=JSON.stringify([target?.playerId||'',input('quality'),input('event'),input('nation'),input('league'),input('club'),input('position'),input('maxBin')]);
    if(state.lossWarned.has(key))return;
    state.lossWarned.add(key);
    const note=`${state.language==='ar'?'تحذير خسارة تقديرية':'Estimated loss warning'}: ${loss.toFixed(1)}% · ${card.name||target?.name||'EA Player'} · ${fmt(buy)} Coins`;
    addSearchEvent('warning',note,'Price reference: '+fmt(sale)+' · estimated sale fee 5% · warning shown once per filters/target/session');
    addLog(note,'warning');
    // Advisory toast, deliberately distinct from confirmed purchase or auction miss.
    const host=$('gpts-toast-stack');
    if(host){
      const toast=document.createElement('article');toast.className='gpts-outcome-toast risk';toast.setAttribute('role','status');
      const badge=document.createElement('span');badge.className='gpts-toast-picture';badge.textContent='⚠';
      const body=document.createElement('div');body.className='gpts-toast-text';
      const heading=document.createElement('b');heading.textContent=state.language==='ar'?'تنبيه خسارة محتملة':'Potential loss warning';
      const detail=document.createElement('small');detail.textContent=note;body.append(heading,detail);toast.append(badge,body);
      const close=document.createElement('button');close.type='button';close.className='gpts-toast-close';close.textContent='×';close.setAttribute('aria-label','Dismiss warning');close.onclick=()=>toast.remove();toast.append(close);
      host.prepend(toast);while(host.childElementCount>3)host.lastElementChild.remove();
      setTimeout(()=>{toast.classList.add('leaving');setTimeout(()=>toast.remove(),350);},5500);
    }
  }
  function matchNativeListing(card,o){
    if(!card||!Number.isSafeInteger(card.price)||card.price<150)return {ok:false,reason:'سعر العرض غير مؤكد'};
    if(card.price>o.maxPrice)return {ok:false,reason:'السعر أعلى من Max Buy'};
    if(state.selectedTargets.length!==1||!state.nativePlayerConfirmed)return {ok:false,reason:'لا يوجد لاعب واحد مؤكد من EA'};
    const expected=Number(state.selectedTargets[0].playerId||state.selectedTargets[0].eaPlayerId||0);
    if(!Number.isSafeInteger(expected)||expected<=0)return {ok:false,reason:'Player ID المستهدف غير معروف'};
    if(!Number.isSafeInteger(Number(card.playerId))||Number(card.playerId)!==expected)return {ok:false,reason:'Player ID غير متاح أو مختلف'};
    if(o.itemId&&Number(card.itemId||0)!==Number(o.itemId))return {ok:false,reason:'Item ID غير مطابق'};
    if(o.minRating&&(!card.rating||card.rating<o.minRating))return {ok:false,reason:'التقييم أقل من المطلوب'};
    if(o.maxRating&&(!card.rating||card.rating>o.maxRating))return {ok:false,reason:'التقييم أعلى من المطلوب'};
    if(o.rarity&&!card.rarity)return {ok:false,reason:'نوع البطاقة غير متاح في بيانات العرض'};
    if(o.rarity&&!Core.text(card.rarity).includes(Core.text(o.rarity)))return {ok:false,reason:'نوع البطاقة غير مطابق'};
    if(o.target){
      const selectedId=Number(state.selectedTargets?.length===1?(state.selectedTargets[0].playerId||state.selectedTargets[0].eaPlayerId):0);
      if((!card.name||card.name==='EA Item')&&!(selectedId&&Number(card.playerId)===selectedId))return {ok:false,reason:'لا توجد هوية لاعب موثوقة'};
      if(card.name&&card.name!=='EA Item'&&!Core.text(card.name).includes(Core.text(o.target))&&!(selectedId&&Number(card.playerId)===selectedId))return {ok:false,reason:'اسم مختلف'};
    }
    if(state.spent+card.price>o.maxSpend)return {ok:false,reason:'تجاوز ميزانية الجلسة'};
    return {ok:true,reason:'matched'};
  }
  const EA_BLOCK_CODES=new Set([401,403,429,458,494,512,521]);
  function describeEAError(response){
    const code=Number(response?.code||response?.errorCode||0);
    const status=Number(response?.status||0);
    const id=code||status;
    if(id===429)return 'Rate limit / طلبات كثيرة (429)';
    if(id===401||id===403)return 'رفض/جلسة غير مصرح بها ('+id+')';
    if(id===458)return 'تحقق إضافي مطلوب؛ راجع EA (458)';
    if([494,512,521].includes(id))return 'تقييد محتمل من EA ('+id+') — تفسير غير رسمي';
    if(id>=500&&id<600)return 'خطأ خدمة EA ('+id+')';
    return response?.reason||response?.message||('EA response code '+(id||'unknown'));
  }
  async function run(o,token){
    try{
      while(state.running&&state.token===token&&state.searches<o.maxSearches&&state.bought<o.maxBuys){
        if(blocked())throw Error('حماية EA أو CAPTCHA ظاهرة. توقف ولا تحاول تجاوزها.');
        if(!Runtime?.scanMarket)throw Error('Native EA market service bridge غير متوفر — أعد تحميل Web App');
        const checkModel=await Runtime.inspectFilters();
        const actualPlayerId=Number(checkModel?.filters?.selectedPlayerId||0);
        const expectedPlayerId=Number(state.selectedTargets[0]?.playerId||0);
        if(!checkModel?.filters?.controllerActive||actualPlayerId!==expectedPlayerId){
          throw Error('فلتر اللاعب في EA لا يطابق الهدف ('+expectedPlayerId+' / '+actualPlayerId+').');
        }
        const started=Date.now();state.cycleStartedAt=started;state.cyclePhase='searching';state.nextIntervalMs=Core.randomInterval(rangeConfig().minMs,rangeConfig().maxMs);state.nextTargetAt=started+state.nextIntervalMs;
        state.searches++;refresh();const scanArgs=buildScanArgs();logScanInputs(scanArgs,'فلاتر بحث #'+state.searches);addSearchEvent('search','بدء بحث #'+state.searches,`${MODE_NAMES[scanArgs.mode]} · interval ${(state.nextIntervalMs/1000).toFixed(2)}s`);
        const response=await Runtime.scanMarket(scanArgs);collectModeStats(response,scanArgs.mode);logAppliedCriteria(response);
        if(!state.running||token!==state.token)return;
        state.lastCycleMs=Date.now()-started;
        if(!response?.ok){
          state.lastEAError=response;
          const reason=describeEAError(response);addSearchEvent('error','فشل رد EA / توقف',reason);addLog('فشل بحث EA: '+reason,'error');
          if(EA_BLOCK_CODES.has(Number(response?.code||response?.status)))addSearchEvent('blocked','تحذير حماية/تقييد EA','توقف بدون إعادة المحاولة أو تجاوز الحماية');
          throw Error(reason);
        }
        const cards=Array.isArray(response.items)?response.items:[];
        state.nativeProbeSnapshot=response;renderNativeProbeRows(response);
        if($('feedSource'))$('feedSource').textContent=MODE_NAMES[response.mode||'pharaoh']+' · '+(Number(response.durationMs)||state.lastCycleMs)+'ms';
        const note=response.firstModeSample?'أول عينة للمود':response.identicalToPrevious?'نفس أرقام العروض السابقة (لا يثبت كاش الخادم)':'تغيّر في أرقام العروض';const idsNote=' · NEW '+(response.addedTradeIds??'—')+' / REPEAT '+(response.repeatedTradeIds??'—')+' / GONE '+(response.disappearedTradeIds??'—');
        if(!cards.length)addSearchEvent('empty','لا توجد عروض في البحث #'+state.searches,note+idsNote);
        else addSearchEvent('result','تم العثور على '+cards.length+' عرض',note+' · '+response.durationMs+'ms · '+cards.slice(0,3).map(c=>(c.name||'EA Item')+' '+(c.price?fmt(c.price):'—')).join(' | '));
        let matched=false;
        for(const card of cards){
          const check=matchNativeListing(card,o);
          if(!check.ok)continue;
          matched=true;warnLossOnce(card);state.matches++;addSearchEvent('match','عرض مطابق: '+(card.name||'EA Player'),`${fmt(card.price)} Coins · Item ${card.itemId||'—'} · Trade ${card.tradeId||'—'}`);addLog(`نتيجة مطابقة من EA: ${card.name||'EA Item'} · ${fmt(card.price)}`,'success');
          if(o.autoBuy){
            if(!response.scanToken||!Runtime?.purchase){
              addSearchEvent('error','فشل التحقق من بيانات العرض','لا يوجد Scan Token مؤكد من آخر رد EA');stop('لم يتم إرسال أي شراء: هوية الاستجابة غير كافية.');break;
            }
            if(blocked()){stop('تم إيقاف الشراء لوجود حماية EA.');break;}
            addSearchEvent('buy','محاولة شراء ('+o.purchaseMode+')',`Trade ${card.tradeId} · ${fmt(card.price)} Coins`);
            const outcome=await Runtime.purchase({scanToken:response.scanToken,tradeId:String(card.tradeId||''),playerId:Number(card.playerId),price:Number(card.price),maxPrice:o.maxPrice,budgetRemaining:o.maxSpend-state.spent,mode:o.purchaseMode});
            const status=outcome?.status||'unknown';
            addSearchEvent(status==='acknowledged'?'buy':status==='rejected'?'miss':'error',
              status==='acknowledged'?'EA service acknowledged purchase':status==='rejected'?'EA rejected purchase':'Purchase status unknown / not sent',
              `${outcome?.method||o.purchaseMode} · ${outcome?.reason||'No response'}${outcome?.code?' · code '+outcome.code:''}`);
            if(status==='acknowledged'&&outcome?.ok){
              state.bought++;state.spent+=card.price;
              addLog('EA أبلغت نجاح الشراء: '+card.name+' · '+fmt(card.price)+' Coins (ملكية البطاقة غير مفحوصة بشكل مستقل)','success');
              showOutcomeNotice('won',card);refresh();
              if(state.bought>=o.maxBuys){stop('وصلنا للحد الأقصى للشراء');break;}
            }else if(status==='rejected'){
              state.misses++;addLog('EA رفضت الشراء: '+String(outcome?.reason||'Rejected'),'warning');showOutcomeNotice('miss',card);
              if(EA_BLOCK_CODES.has(Number(outcome?.code))){stop('تم الإيقاف بعد رفض EA / كود حماية '+outcome.code);break;}
            }else{
              addLog('نتيجة شراء غير مؤكدة؛ لم يتم إرسال محاولة ثانية: '+String(outcome?.reason||'unknown'),'error');
              stop('حالة الشراء غير مؤكدة؛ تحقق من النادي/غير المعين يدويًا');break;
            }
          }else stop('تم رصد فرصة مطابقة (وضع التنبيه).');
          break;
        }
        if(!state.running||token!==state.token)return;
        if(cards.length&&!matched)addSearchEvent('skip','لا توجد عروض مطابقة للفلاتر','تم فحص '+cards.length+' عرضًا دون تنفيذ شراء');
        state.cyclePhase='waiting';refresh();
        const remainder=Math.max(0,state.nextIntervalMs-(Date.now()-started));
        if(remainder){addSearchEvent('wait','انتظار الدورة التالية',`${(remainder/1000).toFixed(2)}s`);await nap(remainder);}
      }
      if(state.running)stop('انتهى الحد المحدد لعمليات البحث');
    }catch(e){
      const message=String(e?.message||e);addSearchEvent('error','تم إيقاف الجلسة',message);addLog('تم إيقاف المحرك: '+message,'error');
      if(state.running)stop('توقف عند خطأ');state.status='خطأ';refresh();
    }
  }
  async function start(){
    if(state.running||state.marketProbeBusy){if(state.marketProbeBusy)addLog('أوقف فحص السوق قبل تشغيل جلسة جديدة.','warning');return;}
    if(state.selectedTargets.length>1){addLog('ابدأ البحث بلاعب واحد أو امسح كل اللاعبين للبحث العام.','error');return;}
    if(state.selectedTargets.length===1&&(!state.nativePlayerConfirmed||!Number(state.selectedTargets[0]?.playerId))){
      addLog('اختيار اللاعب في EA غير مؤكد بالـPlayer ID.','error');return;
    }
    if(!Core){addLog('مكتبة التحقق من الفلاتر غير متاحة','error');return;}
    let o;try{o=options();}catch(e){addLog(e.message,'error');return;}
    if(!state.selectedTargets.length&&o.autoBuy){addLog('البحث العام بدون لاعب متاح للمراقبة فقط؛ أوقف Auto Buy أولًا.','error');return;}
    if(!findNativeSearchButton() && !(await Runtime?.inspectFilters?.())?.filters?.controllerActive){
      addLog('متحكم السوق غير ظاهر؛ محاولة فتح السوق الأصلي تلقائيًا.','info');
      const connected=await connectEA();
      if(!connected || !(await Runtime?.inspectFilters?.())?.filters?.controllerActive){
        addLog('فشل بدء البحث: متحكم EA الأصلي غير متاح حتى بعد إعادة فتحه.','error');
        $('compatPanel').open=true;compatibilityAudit();return;
      }
    }
    // Never start a targeted session with only a catalogue card name and an unverified EA autocomplete selection.
    if(state.selected && input('player') && !state.nativePlayerConfirmed){
      addLog('تم اختيار بطاقة في الكتالوج لكن اختيار EA الأصلي لم يُؤكد؛ راجع فلتر اللاعب في EA ثم أعد المحاولة.','warning');
      $('nativeInfo').textContent='الاسم المختار من FUT.GG لا يثبت اختيار نفس البطاقة في EA. افتح فلتر اللاعب الأصلي واختره ثم جرّب.';
      return;
    }
    try{await verifyPlayerForScan();}catch(e){addLog('Start: '+e.message,'error');return;}
    const transfer=await applyNative();
    if(!transfer?.ok){addLog('تم إيقاف Start: بعض الفلاتر لا يمكن ربطها مع سوق EA: '+(transfer?.unmapped||[]).join(', '),'error');$('compatPanel').open=true;compatibilityAudit();return;}
    const nativeMax=findField(bridge.find(([id])=>id==='maxBin')[1]);
    if(!transfer.pricesVerified && (!nativeMax||String(nativeMax.value||'').replace(/[^0-9]/g,'')!==String(numeric('maxBin')))){
      addLog('لم نستطع التحقق أن Max Buy Now انتقل إلى EA؛ لن نبدأ بحثًا بسعر غير محدد.','error');return;
    }
    const model=await Runtime?.inspectFilters?.();
    const criteriaId=Number(model?.filters?.selectedPlayerId||0);
    const targetId=Number(state.selectedTargets[0]?.playerId||0);
    if(!model?.filters?.controllerActive || (targetId ? criteriaId!==targetId : criteriaId!==0)){
      addLog('تم رفض Start: فلتر EA لا يطابق الهدف ('+targetId+' / '+criteriaId+').','error');return;
    }
    if(!targetId)addLog('بدء مراقبة السوق بدون فلتر لاعب — لا يوجد شراء تلقائي أو Match عشوائي.','info');
    if(blocked()){addLog('رسالة حماية ظاهرة؛ لن يبدأ المحرك.','error');return;}
    const availableModes=await Runtime?.scanCapabilities?.();if(!availableModes?.ok||!availableModes.modes?.[searchConfig().mode]?.available){addLog('مود البحث المختار غير متاح في جلسة EA: '+searchConfig().mode,'error');return;}
    if(searchConfig().ladderMode==='smartMaxBid'&&numeric('maxBin')<150){addLog('حدد Max Buy Now (150 أو أكثر) قبل استخدام Max Bid الذكي.','error');return;}
    if(o.autoBuy){
      const caps=await Runtime?.inspectPurchase?.();
      if(!caps?.ok||!caps?.[o.purchaseMode]?.available){addLog('لا يمكن بدء الشراء: دالة '+o.purchaseMode+' غير موجودة داخل EA في جلستك.','error');return;}
      addLog('فحص مسار الشراء: '+caps[o.purchaseMode].method+' موجود (النجاح الفعلي غير مثبت)','info');
    }
    if(o.autoBuy && !confirm(`CODEX SNIPE — تأكيد شراء آلي تجريبي\n\nMode: ${o.purchaseMode.toUpperCase()}\nEA Player ID: ${targetId}\nMax Buy: ${fmt(o.maxPrice)} Coins\nSession Budget: ${fmt(o.maxSpend)} Coins\nMax Purchases: ${o.maxBuys}\n\nسيرسل أمر شراء فعليًا عبر خدمة EA عندما يجد عرضًا مطابقًا. لا يمكن التراجع عن عملية ناجحة. لا يوجد إعادة محاولة على عرض مجهول الحالة أو مسار Raw HTTP. EA تحظر أدوات Auto Buyer وقد تعاقب الحساب.\n\nهل تؤكد تفعيل الشراء لهذه الجلسة؟`))return;
    state.ladderStep=0;state.token++;state.sessionNumber++;state.lossWarned.clear();state.running=true;state.activePurchaseMode=o.autoBuy?o.purchaseMode:'';state.started=Date.now();state.cyclePhase='searching';state.cycleStartedAt=0;state.lastCycleMs=0;state.nextIntervalMs=0;state.nextTargetAt=0;state.searches=0;state.matches=0;state.bought=0;state.misses=0;state.spent=0;state.status='يبحث';state.logs=[];state.searchEvents=[];state.lastEAError=null;renderSearchEvents();
    if(searchConfig().ladderMode==='maxBid')addLog('سلم Max Bid العادي قد يستبعد عروضًا داخل سقف Buy Now؛ الذكي هو الذي يبدأ فوق سقف الشراء.','warning');
    if(searchConfig().ladderMode==='minBid')addLog('سلم Min Bid قد يستبعد عروضًا رخيصة؛ سقف الشراء والميزانية لا يتغيران.','warning');
    addLog('بدأ فحص السوق المباشر ('+(o.autoBuy?'BUY '+o.purchaseMode.toUpperCase():'ALERT ONLY')+')','success');refresh();save();run(o,state.token);
  }
  function presetSave(){const name=prompt('اسم إعداد السنايب؟');if(!name?.trim())return;state.presets[name.trim().slice(0,45)]=readSettingsSafe();populatePresets();$('presets').value=name.trim().slice(0,45);addLog('تم حفظ Preset: '+name,'success');save();}
  function populatePresets(){const el=$('presets');if(!el)return;el.replaceChildren(new Option('اختر إعدادًا محفوظًا',''));for(const k of Object.keys(state.presets))el.append(new Option(k,k));}
  function exportLogs(){const cells=[['time','level','message'],...state.logs.map(x=>[x.at,x.level,x.message])];const text=cells.map(a=>a.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='GPT_SNIPE_Logs.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
  function setLanguage(lang){
    if(lang!=='ar'&&lang!=='en'||state.language===lang)return;
    const settings=readSettingsSafe(),opens=[...shadow.querySelectorAll('details')].map(x=>x.open);
    state.language=lang;
    const node=shadow.querySelector('#shell'),wrapper=document.createElement('div');wrapper.innerHTML=uiHTML();node.replaceWith(wrapper.firstElementChild);
    [...shadow.querySelectorAll('details')].forEach((d,i)=>d.open=opens[i]??d.open);
    fillSettings(settings);if($('soundEnabled'))$('soundEnabled').checked=state.soundEnabled;populatePresets();updateSpeedControls();renderPlayers(state.players);renderTargets();renderSelectedCard();renderEvents();updateClubLock();updateDatalists();renderModeStats();renderLogs();renderSearchEvents();renderDiagnostics();renderRuntime(state.runtimeReport);bindUI();renderPurchaseModeInfo();refresh();save();
  }
  function bindUI(){
    $('close').addEventListener('click',closePanel);
    $('player').addEventListener('input',()=>{if($('playerResultBox'))$('playerResultBox').open=true;if(!state.addPlayerMode)state.nativePlayerConfirmed=false;const host=$('playerResults');if(host)host.replaceChildren();clearTimeout(searchTimer);searchTimer=setTimeout(searchPlayers,250);});
    $('playerSearchSource').addEventListener('change',()=>{state.nativeSearchMode=input('playerSearchSource');$('playerResultBox').open=true;searchPlayers();renderSelectedCard();save();});
    $('loadPlayerEvents').addEventListener('click',()=>refreshPlayerEvents(true));
    $('eventFilterMode').addEventListener('change',()=>{state.eventFilterMode=input('eventFilterMode');refreshPlayerEvents(false);save();});
    $('clearEvents').addEventListener('click',()=>{state.eventTargets=[];renderEvents();save();});
    $('addAnotherPlayer').addEventListener('click',()=>{state.addPlayerMode=true;state.replaceTargetKey=null;showPlayerSearch();renderTargets();});
    $('clearTargets').addEventListener('click',async()=>{
      if(state.running)stop('تم مسح اللاعب المستهدف؛ إيقاف الجلسة');
      state.selectionEpoch++;
      state.selectedTargets=[];state.selected=null;state.addPlayerMode=false;state.replaceTargetKey=null;
      resetLocalPlayerFields();renderTargets();refreshPlayerEvents(false);save();
      await clearEAPlayer('مسح جميع اللاعبين');save();
    });
    $('syncPlayerEA').addEventListener('click',confirmNativePlayer);
    $('searchMode').addEventListener('change',()=>{addLog('تم اختيار محرك البحث: '+MODE_NAMES[input('searchMode')],'info');save();});
    $('bidLadderMode').addEventListener('change',()=>{state.ladderKey=null;updateLadderHelp();addLog('سلم المزايدة: '+input('bidLadderMode'),'info');save();});
    $('inspectSearchModes').addEventListener('click',()=>void inspectSearchModes());
    $('exportCompareModes').addEventListener('click',exportModeComparison);
    renderModeStats();
    $('purchaseMode').addEventListener('change',()=>{renderPurchaseModeInfo();save();});
    $('checkPurchaseCapabilities').addEventListener('click',async()=>{
      const el=$('purchaseCapabilitiesStatus');el.textContent='Checking EA…';
      const r=await Runtime?.inspectPurchase?.();
      if(!r?.ok){el.textContent=state.language==='ar'?'تعذر الوصول إلى دوال الشراء في EA.':'Could not inspect EA purchase services.';return;}
      el.textContent=['Pharaoh: '+(r.pharaoh?.method||'Unavailable'),'Deep: '+(r.deep?.method||'Unavailable'),state.language==='ar'?'وجود الدالة لا يضمن نجاح الشراء.':'API presence does not guarantee a successful trade.'].join(' | ');
      addLog('فحص المودين: '+el.textContent,'info');
    });
    $('autoBuy').addEventListener('change',()=>{renderPurchaseModeInfo();save();});
    $('speedPreset').addEventListener('change',()=>{updateSpeedControls();save();});
    $('speedMin').addEventListener('input',()=>{updateSpeedControls();save();});
    $('speedMax').addEventListener('input',()=>{updateSpeedControls();save();});
    $('language').addEventListener('change',()=>setLanguage(input('language')));
    $('runDiag').addEventListener('click',async()=>{if(Runtime?.inspectFilters)state.nativeModelReport=await Runtime.inspectFilters();compatibilityAudit();renderRuntime(state.runtimeReport);});
    $('copyDiag').addEventListener('click',()=>copyText(auditAsText()));
    $('exportDiagText').addEventListener('click',()=>saveTextFile('GPT_SNIPE_Compatibility.txt',auditAsText()));
    $('exportDiagJson').addEventListener('click',()=>saveTextFile('GPT_SNIPE_Compatibility.json',JSON.stringify(state.lastAudit||compatibilityAudit(),null,2),'application/json'));
    $('copyLog').addEventListener('click',()=>copyText(logsAsText()));
    $('exportSearchFeed').addEventListener('click',exportSearchFeed);
    $('exportLogText').addEventListener('click',()=>saveTextFile('GPT_SNIPE_Activity_Log.txt',logsAsText()));
    $('copyTechnical').addEventListener('click',()=>copyText(technicalAsText()));
    $('exportTechnical').addEventListener('click',()=>saveTextFile('GPT_SNIPE_Technical_Log.txt',technicalAsText()));


    $('inspect').addEventListener('click',async()=>{await inspectRuntime();inspectNative();});$('sync').addEventListener('click',applyNative);$('exportMap').addEventListener('click',exportNativeMap);
    $('native').addEventListener('click',connectEA);
    $('connectEA').addEventListener('click',connectEA);
    $('probeRuntime').addEventListener('click',inspectRuntime);
    $('openRuntimeMarket').addEventListener('click',async()=>{await openViaRuntime();await nap(550);inspectNative();});
    $('copyRuntime').addEventListener('click',()=>copyText(runtimeAsText()));
    $('refreshNative').addEventListener('click',async()=>{if(Runtime?.inspectFilters)state.nativeModelReport=await Runtime.inspectFilters();inspectNative();compatibilityAudit();renderRuntime(state.runtimeReport);});
    for(const btn of shadow.querySelectorAll('[data-native-picker]'))btn.addEventListener('click',()=>showNativePicker(btn.dataset.nativePicker));
    $('captureOffers').addEventListener('click',()=>displayNativeOffers({log:true}));
    $('marketProbe').addEventListener('click',()=>{unlockAudio();void probeMarketOnce();});
    $('soundEnabled').addEventListener('change',()=>{state.soundEnabled=$('soundEnabled').checked;unlockAudio();save();});
    $('previewWinSound').addEventListener('click',()=>{unlockAudio();showOutcomeNotice('won',state.selected||{name:'Demo card'},true);});
    $('previewMissSound').addEventListener('click',()=>{unlockAudio();showOutcomeNotice('miss',state.selected||{name:'Demo card'},true);});
    $('start').addEventListener('click',()=>{unlockAudio();void start();});$('stop').addEventListener('click',()=>stop('تم الإيقاف يدويًا'));
    $('export').addEventListener('click',exportLogs);$('savePreset').addEventListener('click',presetSave);
    $('presets').addEventListener('change',()=>{if(!state.running&&state.presets[$('presets').value]){fillSettings(state.presets[$('presets').value]);addLog('تم تحميل Preset','success');}});
    // Language switches rebuild #shell, but not the ShadowRoot: attach this listener once.
    if(!formChangeListenerBound){formChangeListenerBound=true;shadow.addEventListener('change',e=>{if(e.target.matches('input,select')&&!state.running)save();});}
  }
  async function init(){
    if(!Core)console.warn('[CODEX SNIPE] missing engine core');
    if(!document.getElementById('gpts-v3-nav-style')){navStyle.id='gpts-v3-nav-style';document.head?.appendChild(navStyle);}
    createPortal();
    try{const stored=await chrome.storage.local.get(STORAGE);const config=stored[STORAGE]||{};state.sessionNumber=Math.max(0,Math.trunc(Number(config.sessionNumber)||0));state.searchStats=config.searchStats&&typeof config.searchStats==='object'?config.searchStats:state.searchStats;state.presets=config.presets||{};state.cache=config.cache||[];state.logs=config.logs||[];state.searchEvents=config.searchEvents||[];state.selected=config.selected||null;state.selectedTargets=Array.isArray(config.selectedTargets)?config.selectedTargets:[];state.eventTargets=Array.isArray(config.eventTargets)?config.eventTargets:[];state.eventFilterMode=config.eventFilterMode==='all'?'all':'any';state.variantCache=config.variantCache&&typeof config.variantCache==='object'?config.variantCache:{};
      if(config.language==='en')setLanguage('en');
      fillSettings({...config.settings,autoBuy:false});
      if(!state.selectedTargets.length){state.selected=null;resetLocalPlayerFields();}
      if($('soundEnabled'))state.soundEnabled=$('soundEnabled').checked;populatePresets();updateSpeedControls();renderLogs();renderSearchEvents();renderTargets();renderSelectedCard();renderEvents();updateClubLock();updateDatalists();renderModeStats();}
    catch(e){addLog('تعذر قراءة الإعدادات المحلية: '+e.message,'warning');}
    updateSpeedControls();observeNav();refresh();timer=setInterval(refresh,1000);const gaugeTick=setInterval(()=>{if(shadow)paintSpeedGauge(Math.max(0,state.nextTargetAt-Date.now()));},80);window.addEventListener('pagehide',()=>clearInterval(gaugeTick),{once:true});
    window.addEventListener('pagehide',()=>{if(state.running)stop('صفحة EA اتقفلت أو اتحدثت');});
    addLog('واجهة CODEX SNIPE v3.17.1 جاهزة — وضع الشراء التجريبي مغلق افتراضيًا.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
