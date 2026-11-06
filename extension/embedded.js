/* CODEX SNIPE v3.9.4 embedded interface; uses native EA services without exporting authentication tokens. */
(() => {
  'use strict';
  if (window.__GPT_SNIPE_V3__) return;
  window.__GPT_SNIPE_V3__ = true;
  const Extension=window.CodexExtensionClient;
  const Core = window.GPTSnipeCore;
  const Native = window.GPTNativeMarket;
  const Page = window.GPTPageClient;
  const STORAGE = 'gpts_embedded_v3';
  const READY = 'جاهز';
  const state = {
    open:false, running:false, starting:false, token:0, searches:0, matches:0, bought:0, misses:0, spent:0,
    started:0, ended:0, status:READY, logs:[], players:[], cache:[], selected:null,
    presets:{}, lastProvider:'لم يتم البحث', lastNative:'لم يتم فحص صفحة السوق', pendingQuery:0, speedValue:0, speedTarget:0, speedMinMs:2000, speedMaxMs:5000, nextIntervalMs:0, lastCycleMs:0, selectedTargets:[], language:'ar', lastAudit:null, auditLog:[], lowestObserved:null, eventTargets:[], nativeChoices:{}, nativeConnectInProgress:false, pickerOptions:[], pickerKind:"", nativePlayerConfirmed:false, pageMode:false, pageSnapshot:null, pageConnection:null, nativeItems:[]
  };

  const TRANSLATIONS = {"ar":{"back":"↩ الرجوع إلى EA","title":"مركز تحكم CODEX SNIPE","subtitle":"فلترة وبحث من داخل Web App مع مراقبة الاتصال والنتائج — بدون ادعاء وجود بيانات سوق غير متاحة.","hint":"أول بحث يتصل بواجهة EA الأصلية تلقائيًا. حالة الاتصال ومصدر البيانات ظاهران في اللوحة.","language":"اللغة / Language","players":"البحث عن اللاعبين من EA","player_search":"ابحث بالاسم أو Player ID","player_placeholder":"مثال: Salah, Messi, Mbappé","player_note":"البحث الافتراضي وصورة اللاعب الأساسية من EA. اختَر الندرة/الحدث لتحديد نوع البطاقة؛ الصورة ليست معاينة كاملة لكل إصدار.","pick":"قائمة اللاعبين المختارين","pick_note":"اختيار لاعب يحدد الاسم والـID. عند اختيار عدة لاعبين يلزم دعم الربط الأصلي لكل هدف.","clear":"مسح الاختيارات","filters":"فلاتر Transfer Market","bridge_note":"القوائم غير المكتشفة تُعرض كمفقودة، ولا نحاول تخمين أسماء خيارات EA.","item":"EA Item ID لنسخة محددة (اختياري)","quality":"الجودة / Quality","minrating":"أقل تقييم","maxrating":"أعلى تقييم","position":"المركز","nation":"البلد / الجنسية","league":"الدوري","club":"النادي","minbid":"Min Bid","maxbid":"Max Bid","minbin":"Min Buy Now","maxbin":"Max Buy Now (Coins)","event":"إصدارات اللاعب / الندرة — EA","catalog_hint":"اقتراحات البلد والنادي والدوري مبنية على البطاقات التي تم تحميلها فقط، وليست القائمة الكاملة من EA.","inspect":"فحص الفلاتر","sync":"تطبيق المدعوم","native":"افتح سوق EA","map":"خريطة DOM","native_pending":"افتح شاشة البحث الأصلية في EA أولًا.","engine":"إعدادات السنايب","speedpreset":"نطاق سرعة البحث","speedmin":"سرعة من (ثانية)","speedmax":"سرعة إلى (ثانية)","speedhelp":"في كل دورة يتم اختيار زمن جديد داخل المدى. المؤشر يعرض الوقت المختار فعلاً؛ الاستجابة قد تستغرق أكثر.","maxsearches":"أقصى عدد بحث","maxbuys":"أقصى عدد مشتريات","budget":"سقف إجمالي صرف الجلسة","autobuy":"Auto Buy Now — متوقف افتراضيًا","autobuy_note":"تنفيذ عبر دالة EA الأصلية مع حدود السعر والميزانية. تأكيد إضافي فقط عند خسارة تقديرية تتجاوز 10% ووجود مرجع.","start":"▶ بدء البحث","stop":"■ إيقاف","preset_save":"حفظ إعدادات","presets":"الإعدادات المحفوظة","warning":"محرك السوق لم يتم التحقق منه على حساب EA حقيقي. لا توجد محاولات لتجاوز CAPTCHA أو قيود EA.","stats":"عدادات الجلسة","runtime":"مدة تشغيل البحث","speed":"حالة الجولة والوقت المتبقي","speeddetail":"العداد يعكس الجولة الفعلية، وليس Ping للخادم.","actual":"مدة آخر بحث ومعالجة","next":"الفاصل القادم","searches":"عمليات بحث","matches":"مطابقات","bought":"شراء مؤكد","misses":"فشل/انتهاء","spent":"Coins مصروفة","status":"الحالة","mode":"الوضع","lowest":"أقل سعر ظاهر في النتائج","lowestNote":"أقل Buy Now من العناصر المقروءة بالصفحة فقط، ليس أقل سعر السوق كله.","checkLowest":"فحص السعر الظاهر","logs":"سجل النشاط","csv":"تصدير CSV","copylog":"نسخ اللوج","txtlog":"تصدير TXT","lognote":"سجلات الجهاز فقط. لا تحفظ الإضافة كلمات مرور أو كوكيز.","compat":"فحص توافق EA — أخضر / أحمر","compatdesc":"الفحص يميّز بين عنصر موجود، عنصر مفقود، وشاشة غير مفتوحة. الأحمر لا يظهر إلا عند توقع عنصر ولم يُعثر عليه.","rescan":"إعادة الفحص","copydiag":"نسخ التقرير","txtdiag":"تصدير التقرير TXT","jsondiag":"تصدير JSON","diagnosticlogs":"لوج الفحص التقني","copysys":"نسخ التشخيص","txtsys":"تصدير TXT","datalink":"مصدر البيانات وحالة السوق","datahelp":"البحث الافتراضي من EA وصورها الأصلية عند توفرها. عروض السوق تظهر بعد رد بحث مؤكد؛ لا تعني قوائم الفلاتر وجود عروض حالية.","none":"غير متوفر","marketneeded":"يلزم فتح شاشة البحث الأصلية","selclear":"إزالة","all_quality":"كل الأنواع","empty":"لا توجد بيانات بعد","searchhint":"اكتب حرفين على الأقل.","notlinked":"غير مربوط","no_presets":"اختر إعدادًا محفوظًا","notobserved":"لم تُقرأ عروض","cardcount":"بطاقة","connect":"ربط سوق EA الأصلي","connect_status":"حالة الاتصال بالسوق","connect_desc":"يفتح Transfers ثم Transfer Market ثم شاشة البحث باستخدام قوائم EA الأصلية. لو فشل ستظهر المرحلة المتوقفة.","connect_start":"اتصل بسوق EA","native_picker_title":"اختيار من قوائم EA الأصلية","native_picker_desc":"الخيارات والأرقام من عناصر تحكم EA. الصور من موارد EA عند توفرها؛ بعض الأسماء أو الشعارات قد تكون غير متاحة.","native_picker_empty":"اتصل بالسوق أولًا، ثم اختر فئة من القوائم.","native_offers":"نتائج سوق EA الظاهرة","native_offers_desc":"النتائج الحقيقية التي يمكن قراءتها من واجهة السوق، وليست كتالوج FUT.GG.","refresh_offers":"قراءة نتائج EA"},"en":{"back":"↩ Back to EA","title":"CODEX SNIPE Control Center","subtitle":"Embedded player lookup, market filters, and verified connection diagnostics.","hint":"The first search connects to the native EA interface. The panel shows connection and source status.","language":"Language / اللغة","players":"EA Player Search","player_search":"Search by name or Player ID","player_placeholder":"e.g. Salah, Messi, Mbappé","player_note":"Default search and base-player portraits use EA. Choose rarity/event separately; portraits are not full previews of every card version.","pick":"Selected Players","pick_note":"Selecting a card fills its name and ID. Multiple targets require a verified native binding.","clear":"Clear selected","filters":"Transfer Market Filters","bridge_note":"Unavailable EA controls are reported, never guessed.","item":"Specific EA card Item ID (optional)","quality":"Quality","minrating":"Min Rating","maxrating":"Max Rating","position":"Position","nation":"Nation","league":"League","club":"Club","minbid":"Min Bid","maxbid":"Max Bid","minbin":"Min Buy Now","maxbin":"Max Buy Now (Coins)","event":"Player editions / EA rarity","catalog_hint":"Nation, league and club suggestions come only from loaded catalogue cards, not the full EA lists.","inspect":"Inspect Native Filters","sync":"Apply Supported","native":"Open EA Market","map":"DOM Map","native_pending":"Open the native EA search screen first.","engine":"Engine Settings","speedpreset":"Search Interval Range","speedmin":"Speed from (seconds)","speedmax":"Speed to (seconds)","speedhelp":"A new interval is sampled each cycle. The gauge shows the selected interval, not server speed.","maxsearches":"Max Searches","maxbuys":"Max Purchases","budget":"Session Budget","autobuy":"Auto Buy Now — off by default","autobuy_note":"Native EA purchase with price and budget limits. Additional confirmation only for a known estimated loss above 10%.","start":"▶ START SEARCH","stop":"■ STOP","preset_save":"Save Preset","presets":"Saved Presets","warning":"Native market automation is unverified on EA. No CAPTCHA or protection bypass.","stats":"Session Overview","runtime":"ACTIVE RUNTIME","speed":"Cycle phase and countdown","speeddetail":"Tracks the actual cycle; not server ping.","actual":"Last search and processing","next":"Next target interval","searches":"SEARCHES","matches":"MATCHES","bought":"BOUGHT","misses":"MISSES","spent":"COINS SPENT","status":"STATUS","mode":"SESSION MODE","lowest":"Lowest observed listing","lowestNote":"Lowest readable Buy Now on this page only, not the entire market.","checkLowest":"Scan visible prices","logs":"Activity Logs","csv":"Export CSV","copylog":"Copy Log","txtlog":"Export TXT","lognote":"Local-only log; no passwords or cookies collected.","compat":"EA Compatibility — green / red","compatdesc":"Checks distinguish supported, missing, and not-on-screen. Red means missing only when the target view is present.","rescan":"Run Diagnostics","copydiag":"Copy Report","txtdiag":"Export Report TXT","jsondiag":"Export JSON","diagnosticlogs":"Technical Diagnostics Log","copysys":"Copy Diagnostics","txtsys":"Export TXT","datalink":"Catalogue & Market Status","datahelp":"Default player search uses EA and its available portraits. Listings require a confirmed response; filter choices do not prove current listings.","none":"Unavailable","marketneeded":"Open native market search first","selclear":"Remove","all_quality":"All types","empty":"No data yet","searchhint":"Enter at least two characters.","notlinked":"Unlinked","no_presets":"Choose a saved preset","notobserved":"No listings read","cardcount":"cards","connect":"Connect EA Market","connect_status":"Native market connection","connect_desc":"Uses the original Transfers, Transfer Market and Search navigation. Reports where connection fails.","connect_start":"Connect to EA Market","native_picker_title":"Browse original EA choices","native_picker_desc":"Choices and IDs come from EA controls. Images use EA assets when available; some names or badges may be unavailable.","native_picker_empty":"Connect to the market first, then pick a category.","native_offers":"Native EA market listings","native_offers_desc":"Observed original EA listings, not FUT.GG catalogue cards.","refresh_offers":"Read EA results"}};
  const tr = key => (TRANSLATIONS[state.language]||TRANSLATIONS.ar)[key]||key;
  const fmt = v => Number(v || 0).toLocaleString('en-US');
  const nap = ms => new Promise(resolve => setTimeout(resolve,ms));
  const safe = x => String(x ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const visible = el => Boolean(el && el.isConnected && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none');
  const normalize = x => String(x||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  let nav = null, portal = null, shadow = null, timer = null, observer = null, mountTimer = null, searchTimer = null;
  const $ = id => shadow?.getElementById(id) || null;

  function addLog(message,level='info') {
    const entry={at:new Date().toISOString(),message:String(message).slice(0,500),level};
    state.logs.unshift(entry); if(state.logs.length>160) state.logs.length=160;
    if(shadow){renderLogs();if($('technicalLogs'))$('technicalLogs').textContent=technicalAsText();} save();
  }
  function save(){
    const payload={presets:state.presets,logs:state.logs.slice(0,70),cache:state.cache.slice(0,80),selected:state.selected,selectedTargets:state.selectedTargets.slice(0,12),eventTargets:state.eventTargets.slice(0,15),language:state.language,panelLayout:state.panelLayout||null,introHidden:Boolean(state.introHidden),priceControlsOpen:Boolean(state.priceControlsOpen),settings:readSettingsSafe()};
    try{void Extension.storageSet({[STORAGE]:payload}).catch(()=>{});}catch{}
  }
  function readSettingsSafe(){
    if(!shadow) return {};
    return Object.fromEntries(['player','itemId','ratingMin','ratingMax','quality','position','club','league','nation','minBid','maxBid','minBin','maxBin','interval','maxSearches','maxBuys','budget','autoBuy','speedPreset','speedMin','speedMax','event','postPurchase','resultsCount','priceSource','pricePlatform','pricePercent','soundEnabled','bidLadder','bidLadderCeiling','searchRoute'].map(k=>[k,$(k)?.type==='checkbox'?$(k).checked:$(k)?.value||'']));
  }
  function input(id){return $(id)?.value.trim()||'';}
  function numeric(id){return Number(input(id)||0);}
  function fillSettings(obj={}){for(const [k,value] of Object.entries(obj)){const e=$(k);if(!e||k==='referencePrice')continue;if(e.type==='checkbox')e.checked=Boolean(value);else e.value=value??'';}updateNativeLabels();}
  function updateNativeLabels(){for(const id of ['quality','position','nation','league','club','event']){const el=$('nativeLabel'+id.charAt(0).toUpperCase()+id.slice(1));if(el)el.textContent=input(id)||'— EA';}}
  function uiHTML(){return `
  <main id="shell" dir="${state.language==='ar'?'rtl':'ltr'}" lang="${state.language}" aria-label="CODEX SNIPE dashboard">
    <header class="top"><div class="brand"><div class="mark" aria-hidden="true">◎</div><div><h1>CODEX <span>SNIPE</span></h1><small>ULTIMATE TEAM · EMBEDDED CONSOLE · v3.9.4</small></div></div>
      <div class="head-actions"><label class="lang-label">${tr('language')} <select id="language"><option value="ar" ${state.language==='ar'?'selected':''}>العربية</option><option value="en" ${state.language==='en'?'selected':''}>English</option></select></label><span id="connection" class="pill warn">● EA WEB APP</span><span id="runBadge" class="pill">● STANDBY</span><button type="button" id="close" class="ghost">${tr('back')}</button></div></header>
    <div class="intro"><div><div class="eyebrow">TRANSFER WORKSPACE / V3.9.4</div><h2>${tr('title')}</h2><p>${tr('subtitle')}</p></div><div class="hint">${tr('hint')}</div></div>
    <div class="layout">
      <div class="column control">
        <details class="panel collapsible" open><summary class="panel-head"><h3><em>⌕</em> ${tr('players')}</h3><span class="tiny-tag">PLAYER FINDER</span></summary>
          <div class="panel-body"><label class="field full"><span>${tr('player_search')}</span><input id="player" autocomplete="off" type="search" placeholder="${tr('player_placeholder')}" aria-label="Player search"></label>
          <div class="price-toolbar form-grid">
            <label class="field"><span>${state.language==='ar'?'مرجع سعر البحث والشراء':'Search / buy price source'}</span><select id="priceSource"><option value="manual">Max Buy Now — ${state.language==='ar'?'يدوي':'Manual'}</option><option value="futgg">FUT.GG</option><option value="futbin">Futbin</option></select></label>
            <label class="field"><span>${state.language==='ar'?'منصة الأسعار':'Price platform'}</span><select id="pricePlatform"><option value="console">Console · PS / Xbox</option><option value="pc">PC</option></select></label>
            <label class="field full"><span>${state.language==='ar'?'إصدار الكارت من EA':'Exact EA edition'}</span><select id="priceEdition"><option value="">${state.language==='ar'?'حمّل الإصدارات ثم اختر نسخة':'Load editions and choose one'}</option></select></label>
            <label class="field"><span>${state.language==='ar'?'نسبة سقف الشراء من المرجع %':'Buy ceiling as % of reference'}</span><input id="pricePercent" type="number" min="1" max="200" value="100"></label>
            <div class="action-row"><button type="button" id="loadEditions" class="secondary">${state.language==='ar'?'إصدارات EA':'EA editions'}</button><button type="button" id="refreshQuote" class="secondary">${state.language==='ar'?'تحديث السعر':'Refresh quote'}</button></div>
          </div><div id="quoteBox" class="quote-box" aria-live="polite">${state.language==='ar'?'اختر مصدرًا وإصدارًا لقراءة سعره. Max Buy Now يظل الحد الأقصى.':'Choose a source and exact edition. Max Buy Now remains the hard ceiling.'}</div>
          <p class="desc">${tr('player_note')}</p><div id="playerResults" class="results" aria-live="polite"><div class="muted">${tr('searchhint')}</div></div>
          <div class="mini-bar"><span id="provider">FUT.GG</span><span id="cardCount">0 ${tr('cardcount')}</span></div>
          <div class="selection-head"><strong>${tr('pick')}</strong><button id="clearTargets" class="ghost small" type="button">${tr('clear')}</button></div>
          <div id="selectedTargets" class="target-list"></div><p class="desc">${tr('pick_note')}</p><div class="action-row"><button id="syncPlayerEA" class="secondary" type="button">↗ EA player autocomplete</button><span id="playerSyncState" class="native-mini-state">EA: not verified</span></div></div></details>
        <details class="panel collapsible market-connection" open><summary class="panel-head"><h3><em>⬡</em> ${tr('connect')}</h3><span class="tiny-tag">NATIVE EA</span></summary>
          <div class="panel-body"><p class="desc">${tr('connect_desc')}</p><div class="action-row"><button type="button" class="primary" id="connectEA">⚡ ${tr('connect_start')}</button><button type="button" class="secondary" id="refreshNative">${tr('inspect')}</button></div>
          <div id="nativeConnectStatus" class="native-status">${tr('native_pending')}</div><div id="nativeConnectSteps" class="connect-steps"></div><button type="button" class="secondary" id="exportConnection">${state.language==='ar'?'تصدير تقرير الاتصال':'Export connection report'}</button></div></details>
        <details class="panel collapsible" open><summary class="panel-head"><h3><em>⚙</em> ${tr('filters')}</h3><span class="tiny-tag">EA FILTER BRIDGE</span></summary>
          <div class="panel-body"><p class="desc">${tr('bridge_note')}</p>
           <div class="form-grid">
            <div class="field"><span>${tr('event')}</span><input id="event" type="hidden"><button class="native-select" type="button" data-native-picker="event"><span class="native-select-label" id="nativeLabelEvent">— EA</span><span>▾</span></button></div>
            <div class="field"><span>${tr('quality')}</span><input id="quality" type="hidden"><button class="native-select" type="button" data-native-picker="quality"><span class="native-select-label" id="nativeLabelQuality">— EA</span><span>▾</span></button></div>

            ${[['position','position'],['nation','nation'],['league','league'],['club','club']].map(([id,key])=>`<div class="field ${id==='event'?'full':''}"><span>${tr(key)}</span><input id="${id}" type="hidden"><button class="native-select" type="button" data-native-picker="${id}"><span class="native-select-label" id="nativeLabel${id.charAt(0).toUpperCase()+id.slice(1)}">— EA</span><span>▾</span></button></div>`).join('')}
            <label class="field full"><span>${tr('item')}</span><input id="itemId" placeholder="Optional" inputmode="numeric"></label>
            <label class="field"><span>${tr('minrating')}</span><input id="ratingMin" inputmode="numeric" type="number" min="1" max="99" placeholder="—"></label>
            <label class="field"><span>${tr('maxrating')}</span><input id="ratingMax" inputmode="numeric" type="number" min="1" max="99" placeholder="—"></label>
            <div class="field full"><span>${tr('native_picker_title')}</span><div id="pickerStatus" class="native-status picker-status">${tr('native_picker_empty')}</div><div id="nativePickerResults" class="native-picker-results"></div></div>
            <div class="event-targets"><button class="ghost small" type="button" id="addEvent">+ Event</button><div id="eventTargets" class="target-list"></div></div>
            <label class="field"><span>${tr('minbid')}</span><input id="minBid" inputmode="numeric" type="number" min="0" placeholder="0"></label>
            <label class="field"><span>${tr('maxbid')}</span><input id="maxBid" inputmode="numeric" type="number" min="0" placeholder="—"></label>
            <label class="field"><span>${tr('minbin')}</span><input id="minBin" inputmode="numeric" type="number" min="0" placeholder="0"></label>
            <label class="field"><span>${tr('maxbin')}</span><input id="maxBin" inputmode="numeric" type="number" min="150" value="1000"></label>
           </div><p class="desc" style="margin-top:10px">${tr('native_picker_desc')}</p>
           <div class="action-row"><button type="button" class="secondary" id="inspect">${tr('inspect')}</button><button type="button" class="secondary" id="sync">${tr('sync')}</button><button type="button" class="ghost" id="native">${tr('native')}</button><button type="button" class="ghost" id="exportMap">${tr('map')}</button></div>
           <div id="nativeInfo" class="native-status">${tr('native_pending')}</div>
          </div></details>
        <details class="panel collapsible" open><summary class="panel-head"><h3><em>⌁</em> ${tr('engine')}</h3><span class="tiny-tag">ENGINE CONTROLS</span></summary>
          <div class="panel-body"><div class="form-grid">
             <label class="field full"><span>${state.language==='ar'?'مسار بحث السوق':'Market search route'}</span><select id="searchRoute"><option value="sdk" selected>${state.language==='ar'?'EA SDK مباشر — MAIN':'Direct EA SDK — MAIN'}</option><option value="screen">${state.language==='ar'?'معالج شاشة EA الأصلية':'Original EA screen handler'}</option></select></label>
             <p class="desc full">${state.language==='ar'?'المباشر يستخدم فلاترك دون تعديل أسعار شاشة اللعبة. مسار الشاشة يستخدم بحث EA الأصلي. قد تعيد EA نفس العروض في الحالتين.':'Direct mode uses your filters without changing screen prices. Screen mode uses the original EA search handler. Both may return the same auctions.'}</p>
             <label class="field full"><span>${tr('speedpreset')}</span><select id="speedPreset"><option value="1-3">1–3 sec</option><option value="2-5" selected>2–5 sec</option><option value="5-8">5–8 sec</option><option value="0.6-5">0.6–5 sec</option><option value="custom">Custom / يدوي</option></select></label>
             <label class="field"><span>${tr('speedmin')}</span><input id="speedMin" type="number" min="0.6" max="60" step="0.1" value="2" disabled></label>
             <label class="field"><span>${tr('speedmax')}</span><input id="speedMax" type="number" min="0.6" max="60" step="0.1" value="5" disabled></label>
             <label class="field"><span>${tr('maxsearches')}</span><input id="maxSearches" type="number" min="1" max="300" value="30"></label>
             <label class="field"><span>${tr('maxbuys')}</span><input id="maxBuys" type="number" min="1" max="30" value="1"></label>
             <label class="field full"><span>${state.language==='ar'?'سلم تغيير Max Bid':'Max Bid search ladder'}</span><select id="bidLadder"><option value="max" selected>${state.language==='ar'?'تصاعدي حتى الحد المختار ثم بحث شامل':'Rise to the chosen limit, then broad search'}</option><option value="off">${state.language==='ar'?'متوقف — استخدم القيم الثابتة':'Off — keep fixed bids'}</option></select></label>
             <label class="field full"><span>${state.language==='ar'?'نهاية سلم Max Bid (حتى 15 مليون)':'Max Bid ladder ceiling (up to 15 million)'}</span><input id="bidLadderCeiling" type="number" min="150" max="15000000" step="50" value="200000"></label>
             <p id="bidCycleStatus" class="desc full">${state.language==='ar'?'السلم يرفع Max Bid حتى النهاية المختارة، ثم يبحث بدون حد ويبدأ من جديد. Min Bid ثابت، وسقف الشراء لا يتغير.':'Max Bid rises to the selected ceiling, then runs uncapped and starts again. Min Bid and purchase limits stay fixed.'}</p>
             <label class="field full"><span>${tr('budget')} (Coins)</span><input id="budget" type="number" min="150" value="10000"></label>
             <label class="field full"><span>${state.language==='ar'?'بعد تأكيد الشراء':'After confirmed purchase'}</span><select id="postPurchase"><option value="leave">${state.language==='ar'?'اتركه كما هو (Unassigned)':'Leave in Unassigned'}</option><option value="club">${state.language==='ar'?'إرساله للنادي':'Send to Club'}</option><option value="transfer">${state.language==='ar'?'إرساله لقائمة الانتقالات':'Send to Transfer List'}</option></select></label><p class="desc full">${state.language==='ar'?'ميزانية الجلسة تجمع كل المشتريات. Max Buy Now حد الكارت الواحد. سرعة من / إلى تحدد الفاصل بين بدايات البحث.':'Session budget caps total spending; Max Buy Now caps one card. Speed from / to sets the interval between search starts.'}</p>
           </div><p class="desc" style="margin-top:12px">${tr('speedhelp')}</p>
           <label class="checkbox"><input type="checkbox" id="autoBuy"><span><b>${tr('autobuy')}</b><br>${tr('autobuy_note')}</span></label>
           <div class="action-row"><button type="button" id="start" class="primary">${tr('start')}</button><button type="button" id="stop" class="danger" disabled>${tr('stop')}</button><button type="button" id="savePreset" class="secondary">${tr('preset_save')}</button></div>
           <label class="field" style="margin-top:13px"><span>${tr('presets')}</span><select id="presets"><option value="">${tr('no_presets')}</option></select></label>
           <div id="lossRiskStatus" class="native-status"></div>
          </div></details>
      </div>
      <div class="column right">
        <details class="panel collapsible" open><summary class="panel-head"><h3><em>▦</em> ${tr('stats')}</h3><small id="sessionLabel">SESSION INACTIVE</small></summary>
          <div class="native-clock"><div id="gaugeRotor" class="gauge-rotor" aria-hidden="true"></div><svg viewBox="0 0 200 200" class="cycle-gauge" aria-hidden="true"><circle cx="100" cy="100" r="88" class="clock-track"/><circle cx="100" cy="100" r="76" class="cycle-track"/><circle id="cycleRing" cx="100" cy="100" r="76" class="cycle-progress"/><circle id="cycleDot" cx="100" cy="24" r="5" class="cycle-dot"/></svg><div class="clock-center"><div class="timer-label">${tr('runtime')}</div><div id="time" class="timer-value">00:00:00</div><b id="cyclePhase">—</b><span id="speedValue">—</span></div><div class="clock-range"><span id="gaugeMin">2.0</span>–<span id="gaugeMax">5.0</span> sec</div></div>
          <div class="stats"><div class="metric"><span class="emoji">⌕</span><small>${tr('searches')}</small><strong id="searchCount" class="accent">0</strong></div><div class="metric"><span class="emoji">◇</span><small>${tr('matches')}</small><strong id="matchCount">0</strong></div><div class="metric"><span class="emoji">✓</span><small>${tr('bought')}</small><strong id="buyCount">0</strong></div><div class="metric"><span class="emoji">✕</span><small>${tr('misses')}</small><strong id="misses">0</strong></div></div>
          <div class="second-stats"><div class="substat"><span>${tr('spent')}</span><b id="spent">0</b></div><div class="substat"><span>${tr('status')}</span><b id="status">READY</b></div><div class="substat"><span>${tr('mode')}</span><b id="sessionMode">STANDBY</b></div></div>
          <div class="cycle-details"><span>${state.language==='ar'?'مدة الجولة المختارة':'Selected cycle'}: <b id="sampledInterval">—</b></span><span>${tr('next')}: <b id="nextDelay">—</b></span><span>${tr('actual')}: <b id="actualCycle">—</b></span></div>
          <div class="status-line"><strong id="sessionStatus">● STANDBY</strong><small id="syncCount">EA FILTERS: NOT LINKED</small></div></details>
        <section class="panel market-panel" id="marketPanel"><div class="panel-head"><h3>▥ ${state.language==='ar'?'نتائج السوق وأقل سعر':'Market results & lowest price'}</h3><button id="marketFull" type="button" class="ghost">${state.language==='ar'?'شاشة كاملة / رجوع':'Full page / back'}</button></div><div class="panel-body">
          <div class="market-toolbar"><label class="field"><span>${state.language==='ar'?'عدد الكروت المطلوب (1–100)':'Requested cards (1–100)'}</span><input type="number" id="resultsCount" min="1" max="100" value="20"></label><button id="scanMarket" type="button" class="primary">${state.language==='ar'?'فحص السوق — بحث جديد':'Scan market — fresh search'}</button></div>
          <div class="market-summary"><div class="market-low"><small>${tr('lowest')}</small><b id="lowestPriceValue">—</b><small id="lowestPriceMeta">${tr('notobserved')}</small></div><div id="marketResponse" class="response-status" aria-live="polite">${state.language==='ar'?'لم يُطلب بحث بعد':'No search requested yet'}</div></div>
          <p class="desc">${state.language==='ar'?'أقل سعر ضمن العروض المستلمة فقط. كل فحص ينفذ بحث EA جديدًا بالفلاتر الحالية؛ نفس العروض قد ترجع مجددًا من EA. عدد الكروت حد أقصى وليس ضمان توافرها.':'Minimum among received listings only. Each scan requests EA again with current filters; EA may return the same listings. The card count is a maximum, not guaranteed availability.'}</p>
          <div id="nativeOffers" class="native-offers" aria-live="polite"><div class="muted">—</div></div>
        </div></section>
        <details class="panel collapsible" open><summary class="panel-head"><h3><em>☷</em> ${tr('logs')}</h3><span class="tiny-tag">LIVE LOG</span></summary><div class="log-actions"><button class="ghost small" id="export" type="button">${tr('csv')}</button><button class="ghost small" id="copyLog" type="button">${tr('copylog')}</button><button class="ghost small" id="exportLogText" type="button">${tr('txtlog')}</button></div><div id="logs" class="logs" aria-live="polite"></div><div class="notice">${tr('lognote')}</div></details>
        <details class="panel collapsible" id="compatPanel"><summary class="panel-head"><h3><em>◈</em> ${tr('compat')}</h3><span id="auditSummary" class="tiny-tag">NOT TESTED</span></summary><div class="panel-body"><p class="desc">${tr('compatdesc')}</p><div class="action-row"><button id="runDiag" type="button" class="primary">${tr('rescan')}</button><button id="copyDiag" type="button" class="secondary">${tr('copydiag')}</button><button id="exportDiagText" type="button" class="ghost">${tr('txtdiag')}</button><button id="exportDiagJson" type="button" class="ghost">${tr('jsondiag')}</button></div><div id="compatResults" class="compat-list"><div class="muted">${tr('empty')}</div></div></div></details>
        <details class="panel collapsible" id="technicalPanel"><summary class="panel-head"><h3><em>▤</em> ${tr('diagnosticlogs')}</h3><span class="tiny-tag">TECHNICAL</span></summary><div class="panel-body"><div class="action-row"><button id="copyTechnical" class="secondary" type="button">${tr('copysys')}</button><button id="exportTechnical" class="ghost" type="button">${tr('txtsys')}</button></div><pre id="technicalLogs" class="technical-logs">${tr('empty')}</pre></div></details>
        <details class="panel collapsible"><summary class="panel-head"><h3><em>ⓘ</em> ${tr('datalink')}</h3><span class="tiny-tag">STATUS</span></summary><div class="panel-body"><p class="desc">${tr('datahelp')}</p><div id="dataHealth" class="native-status">${tr('empty')}</div></div></details>
      </div>
    </div><footer class="footer"><span>CODEX SNIPE v3.9.4 · Unofficial · Independent</span><span>SEARCH • INSPECT • MONITOR</span></footer>
  </main>`;}
  function organizeWorkspace(){
    $('runDock')?.remove();state.dockObserver?.disconnect();
    const ar=state.language==='ar',players=$('player').closest('.panel'),filters=$('itemId').closest('.panel'),connection=$('connectEA').closest('.panel'),logs=$('logs').closest('.panel');
    const body=players.querySelector(':scope > .panel-body'),work=document.createElement('div');work.className='selection-workbench';
    const drawer=document.createElement('div');drawer.id='playerSearchDrawer';drawer.className='player-search-drawer';
    drawer.append($('player').closest('label'),$('playerResults'),$('provider').closest('.mini-bar'));
    const board=document.createElement('div');board.className='selected-board';
    board.append(body.querySelector('.selection-head'),$('selectedTargets'));
    const note=document.createElement('p');note.id='rotationNote';note.className='desc';board.append(note);
    const add=document.createElement('button');add.type='button';add.id='addPlayer';add.className='secondary add-player';add.textContent=ar?'+ إضافة لاعب آخر':'+ Add another player';board.append(add);
    const sync=$('syncPlayerEA').closest('.action-row');board.append(sync);
    work.append(drawer,board);body.prepend(work);
    for(const p of [...body.querySelectorAll(':scope > p.desc')])p.remove();
    const pricing=document.createElement('details');pricing.id='priceControls';pricing.className='price-controls';pricing.open=Boolean(state.priceControlsOpen);
    const priceTitle=document.createElement('summary');priceTitle.textContent=ar?'مرجع السعر وإصدار الكارت':'Price source and card edition';pricing.append(priceTitle,body.querySelector('.price-toolbar'),$('quoteBox'));
    const priceActions=document.createElement('div');priceActions.className='provider-actions';
    const link=document.createElement('a');link.id='providerSite';link.target='_blank';link.rel='noopener noreferrer';link.textContent=ar?'فتح موقع مصدر السعر ↗':'Open price provider ↗';link.href='https://www.futbin.com/27/players';priceActions.append(link);pricing.append(priceActions);
    filters.querySelector(':scope > .panel-body').insertBefore(pricing,filters.querySelector(':scope > .panel-body > .action-row'));
    filters.id='transferSection';filters.classList.add('transfer-section');filters.querySelector('h3').textContent=ar?'⚙ الترانسفير والفلاتر':'⚙ Transfer filters';body.append(filters);
    players.querySelector(':scope > .panel-head h3').textContent=ar?'اللاعبون والترانسفير':'Players & transfer workspace';
    logs.insertAdjacentElement('afterend',connection);
    const header=shadow.querySelector('.head-actions');
    const introButton=document.createElement('button');introButton.id='toggleIntro';introButton.type='button';introButton.className='ghost';header.prepend(introButton);
    const saveTop=document.createElement('button');saveTop.id='saveFilterTop';saveTop.type='button';saveTop.className='primary';saveTop.textContent=ar?'حفظ الفلتر':'Save filter';header.prepend(saveTop);
    const scrollTop=document.createElement('button');scrollTop.id='scrollTop';scrollTop.type='button';scrollTop.className='ghost scroll-top';scrollTop.textContent=ar?'↑ أعلى':'↑ Top';scrollTop.hidden=true;$('shell').append(scrollTop);
    applyIntroVisibility();
    const layoutButton=document.createElement('button');layoutButton.id='editLayout';layoutButton.className='ghost';layoutButton.textContent=ar?'ترتيب اللوحات':'Arrange panels';layoutButton.type='button';header.prepend(layoutButton);
    const reset=document.createElement('button');reset.id='resetLayout';reset.className='ghost layout-reset';reset.textContent=ar?'الترتيب الافتراضي':'Reset layout';reset.type='button';header.prepend(reset);
    const active=document.createElement('div');active.className='active-target-strip';const label=document.createElement('span');label.textContent=ar?'اللاعب النشط':'Active player';const value=document.createElement('b');value.id='activeTargetName';value.textContent='—';active.append(label,value);$('sessionLabel').closest('.panel').querySelector('.panel-head').insertAdjacentElement('afterend',active);
    $('toasts')?.remove();const feedback=document.createElement('div');feedback.id='toasts';feedback.className='toast-stack';feedback.setAttribute('aria-live','polite');shadow.append(feedback);
    const sound=document.createElement('label');sound.className='checkbox sound-toggle';sound.innerHTML='<input type="checkbox" id="soundEnabled" checked><span>'+(ar?'صوت الشراء وفوات العرض':'Purchase and missed-auction sounds')+'</span>';
    $('postPurchase').closest('.panel-body').append(sound);
    const keys=[['players',players],['engine',$('postPurchase').closest('.panel')],['stats',$('sessionLabel').closest('.panel')],['market',$('marketPanel')],['logs',logs],['connection',connection],['compat',$('compatPanel')],['technical',$('technicalPanel')],['data',$('dataHealth').closest('.panel')]];
    for(const [key,panel] of keys){
      panel.dataset.panelKey=key;
      const controls=document.createElement('div');controls.className='panel-arrange';
      for(const [action,label] of [['up','↑'],['down','↓'],['column','↔']]){const b=document.createElement('button');b.type='button';b.className='panel-move';b.dataset.move=action;b.textContent=label;b.title=action==='column'?(ar?'نقل للعمود الآخر':'Move to other column'):action==='up'?(ar?'أعلى':'Move up'):(ar?'أسفل':'Move down');b.setAttribute('aria-label',b.title);controls.append(b);}
      panel.querySelector(':scope > .panel-head').append(controls);
    }
    const clubHint=document.createElement('small');clubHint.id='clubHint';clubHint.className='help';$('club').closest('.field').append(clubHint);
    const pickerArea=$('nativePickerResults').closest('.field');pickerArea.id='nativePickerArea';pickerArea.hidden=true;pickerArea.setAttribute('role','dialog');state.pickerVisible=false;state.pickerAnchor=null;
    const dock=document.createElement('div');dock.id='runDock';dock.className='run-dock';dock.dir=ar?'rtl':'ltr';dock.setAttribute('aria-label',ar?'تحكم البحث الثابت':'Persistent search controls');
    const summary=document.createElement('div');summary.className='dock-summary';const brand=document.createElement('b');brand.textContent='CODEX SNIPE';const dockStatus=document.createElement('span');dockStatus.id='dockStatus';summary.append(brand,dockStatus);
    const actions=$('start').closest('.action-row');actions.classList.add('dock-actions');const scan=document.createElement('button');scan.id='dockScan';scan.type='button';scan.className='secondary';scan.textContent=ar?'فحص السوق':'Scan market';actions.append(scan);dock.append(summary,actions);shadow.append(dock);
    const resizeDock=()=>{portal.style.setProperty('--run-dock-height',Math.ceil(dock.getBoundingClientRect().height)+'px');positionNativePicker();};
    if(typeof ResizeObserver==='function'){state.dockObserver=new ResizeObserver(resizeDock);state.dockObserver.observe(dock);}resizeDock();
    for(const b of shadow.querySelectorAll('[data-native-picker]')){b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','nativePickerArea');}
    restorePanelLayout();
  }
  function applyIntroVisibility(){
    const intro=shadow?.querySelector('.intro');if(intro)intro.hidden=Boolean(state.introHidden);
    const b=$('toggleIntro');if(b){b.textContent=state.language==='ar'?(state.introHidden?'إظهار المقدمة':'إخفاء المقدمة'):(state.introHidden?'Show intro':'Hide intro');b.setAttribute('aria-expanded',String(!state.introHidden));}
  }
  function panelNodes(){return new Map([...shadow.querySelectorAll('[data-panel-key]')].map(p=>[p.dataset.panelKey,p]));}
  function capturePanelLayout(){state.panelLayout=Object.fromEntries(['control','right'].map(column=>[column,[...shadow.querySelector('.column.'+column).children].filter(p=>p.dataset.panelKey).map(p=>p.dataset.panelKey)]));}
  function restorePanelLayout(){
    if(!state.panelLayout)return;const panels=panelNodes(),used=new Set();
    for(const column of ['control','right'])for(const key of Array.isArray(state.panelLayout[column])?state.panelLayout[column]:[]){if(used.has(key)||!panels.has(key))continue;used.add(key);shadow.querySelector('.column.'+column).append(panels.get(key));}
  }
  function bindWorkspace(){
    $('priceControls').addEventListener('toggle',()=>{state.priceControlsOpen=$('priceControls').open;save();});
    $('dockScan').addEventListener('click',scanMarket);
    $('runDock').addEventListener('pointerdown',()=>closeNativePicker());
    $('shell').addEventListener('scroll',positionNativePicker,{passive:true});
    $('shell').addEventListener('pointerdown',event=>{if(!state.pickerVisible)return;const path=event.composedPath();if(!path.includes($('nativePickerArea'))&&!path.includes(state.pickerAnchor))closeNativePicker();},true);
    $('shell').addEventListener('keydown',event=>{if(event.key==='Escape'&&state.pickerVisible){event.preventDefault();event.stopPropagation();closeNativePicker({focus:true});}});
    $('toggleIntro').addEventListener('click',()=>{state.introHidden=!state.introHidden;applyIntroVisibility();save();});
    $('saveFilterTop').addEventListener('click',presetSave);
    const updateTop=()=>{const panel=$('marketPanel');$('scrollTop').hidden=(panel.classList.contains('market-full')?panel.scrollTop:$('shell').scrollTop)<180;};
    $('shell').addEventListener('scroll',updateTop,{passive:true});$('marketPanel').addEventListener('scroll',updateTop,{passive:true});
    $('scrollTop').addEventListener('click',()=>{const panel=$('marketPanel');(panel.classList.contains('market-full')?panel:$('shell')).scrollTo({top:0,behavior:'smooth'});});
    $('addPlayer').addEventListener('click',()=>{if(state.running||state.starting||state.scanning)return;state.selectionCollapsed=false;$('playerSearchDrawer').hidden=false;$('player').value='';renderPlayers([],state.language==='ar'?'اكتب اسم لاعب لإضافته':'Search to add another player');$('player').focus();});
    $('editLayout').addEventListener('click',()=>{$('shell').classList.toggle('arranging');});
    $('resetLayout').addEventListener('click',()=>{const panels=panelNodes();for(const [col,keys] of Object.entries({control:['players','engine'],right:['stats','market','logs','connection','compat','technical','data']}))for(const key of keys)shadow.querySelector('.column.'+col).append(panels.get(key));capturePanelLayout();save();});
    for(const b of shadow.querySelectorAll('.panel-move'))b.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();const panel=b.closest('[data-panel-key]'),parent=panel.parentElement;
      if(b.dataset.move==='up'&&panel.previousElementSibling)parent.insertBefore(panel,panel.previousElementSibling);
      if(b.dataset.move==='down'&&panel.nextElementSibling)panel.nextElementSibling.insertAdjacentElement('afterend',panel);
      if(b.dataset.move==='column')shadow.querySelector('.column.'+(parent.classList.contains('control')?'right':'control')).append(panel);
      capturePanelLayout();save();
    });
    $('soundEnabled').addEventListener('change',()=>{if($('soundEnabled').checked)unlockAudio();save();});
  }
  let audioContext=null;
  function unlockAudio(){
    if(!$('soundEnabled')?.checked)return;
    try{const Type=window.AudioContext||window.webkitAudioContext;if(!Type)return;audioContext??=new Type();if(audioContext.state==='suspended')void audioContext.resume().catch(()=>{});}catch{}
  }
  function playOutcome(won){
    if(!$('soundEnabled')?.checked||!audioContext||audioContext.state!=='running')return;
    try{const at=audioContext.currentTime,notes=won?[523.25,659.25,783.99,1046.5]:[392,311.13,233.08];
      notes.forEach((hz,i)=>{const osc=audioContext.createOscillator(),gain=audioContext.createGain(),start=at+i*.095;osc.type=won?'sine':'triangle';osc.frequency.value=hz;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.07,start+.012);gain.gain.exponentialRampToValueAtTime(.001,start+.2);osc.connect(gain);gain.connect(audioContext.destination);osc.start(start);osc.stop(start+.22);});
    }catch{}
  }
  function showOutcome(kind,item){
    const toast=document.createElement('article');toast.className='outcome-toast '+kind;toast.dataset.tradeId=item.tradeId;
    const icon=document.createElement('span');icon.className='outcome-icon';icon.textContent=kind==='won'?'✓':'↘';
    const text=document.createElement('div'),title=document.createElement('b'),detail=document.createElement('p');title.textContent=kind==='won'?(state.language==='ar'?'تم اصطياد الكارت!':'Card secured!'):(state.language==='ar'?'العرض فاتك':'Auction missed');detail.textContent=(item.name||'EA')+' · '+fmt(item.price)+' Coins';text.append(title,detail);toast.append(icon,text);
    const host=$('toasts');host.append(toast);while(host.children.length>4)host.firstElementChild.remove();playOutcome(kind==='won');setTimeout(()=>toast.remove(),4800);
  }
  async function activateTarget(target){
    const switchToken=state.token,guard=()=>{if(state.token!==switchToken)throw Object.assign(Error('Target switch stopped.'),{code:'CANCELLED'});};
    const ready=await Page.request('connect');guard();state.pageMode=true;state.pageConnection=ready;mergePageSnapshot(ready.snapshot);
    const select=()=>Page.request('selectPlayer',{id:Number(target.playerId||target.itemId),itemId:target.itemId,source:target.source||'catalogue',nativeToken:target.nativeToken,searchQuery:target.searchQuery,query:target.name});
    let report;
    try{report=await select();}catch(e){
      if(e.code!=='PLAYER_STALE')throw e;
      const pool=await Page.request('players',{query:target.searchQuery||target.name.split(' ')[0]}),entry=pool.items.find(x=>x.playerId===Number(target.playerId));
      if(!entry)throw Error('EA cannot refresh the exact player ID for '+target.name);
      guard();target.nativeToken=entry.nativeToken;target.searchQuery=entry.searchQuery;report=await select();
    }
    guard();if(target.playerId&&target.playerId!==report.resolvedPlayerId)throw Error('EA target identity changed.');
    target.playerId=report.resolvedPlayerId;state.selected=target;mergePageSnapshot(report.snapshot);
    for(const kind of ['quality','event','position','nation','league','club']){
      guard();const id=target.filterChoices?.[kind],current=state.pageSnapshot.selections?.[kind];
      if(id==null||id===current?.id)continue;
      if(!current?.enabled)throw Error('EA locked the saved '+kind+' filter for '+target.name);
      const choices=await Page.request('options',{kind}),option=choices.options.find(x=>x.id===id);
      guard();if(!option)throw Error('EA no longer supports the saved '+kind+' for '+target.name);
      mergePageSnapshot((await Page.request('choose',{token:choices.token,index:option.index})).snapshot);
    }
    $('player').value=target.name;$('itemId').value=target.itemId||'';state.nativePlayerConfirmed=true;state.priceQuote=null;state.effectiveMaxPrice=null;state.lastRisk=null;
    if($('playerSyncState'))$('playerSyncState').textContent='✓ EA player ID '+target.playerId+' · native target';
    upsertTarget(target);renderTargets();return state.pageSnapshot;
  }
  function createPortal(){
    if(portal?.isConnected)return;
    portal=document.createElement('div');portal.id='gpts-v3-host';portal.setAttribute('aria-label','CODEX SNIPE app');
    portal.style.cssText='position:fixed;inset:0 0 0 90px;z-index:2147483000;display:none;min-width:0;';
    shadow=portal.attachShadow({mode:'open'});
    const link=document.createElement('link');link.rel='stylesheet';link.href=Extension.getURL('embedded.css');shadow.appendChild(link);
    const app=document.createElement('div');app.innerHTML=uiHTML();while(app.firstChild)shadow.appendChild(app.firstChild);
    document.documentElement.appendChild(portal);
    organizeWorkspace();bindUI();refresh();renderLogs();
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
  function positionPortal(){if(!portal)return;portal.style.left=(window.innerWidth<650?'0px':calcLeft()+'px');positionNativePicker();}
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
  function closePanel(){if(!portal)return;closeNativePicker();state.open=false;portal.style.display='none';nav?.classList.remove('gpts-active');}
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
    paintSpeedGauge(state.running?state.nextIntervalMs:0);
  }
  function rangeConfig(){
    const lo=numeric('speedMin'),hi=numeric('speedMax');
    if(!Number.isFinite(lo)||!Number.isFinite(hi)||lo<0.6||hi>60||hi<lo)throw Error('اختار مدى سرعة صحيحًا بين 0.6 و60 ثانية، وأقصى زمن لا يقل عن الأقل.');
    return {minMs:Math.round(lo*1000),maxMs:Math.round(hi*1000)};
  }
  function paintSpeedGauge(ms){
    const now=performance.now(),core=window.CodexTradeCore||globalThis.CodexTradeCore;
    const elapsed=state.startedMono==null?0:Math.max(0,(state.running?now:state.endedMono??now)-state.startedMono),cycle=state.cycleStart==null?0:Math.max(0,now-state.cycleStart),seconds=Math.floor(elapsed/1000);
    const fallback={clock:[Math.floor(seconds/3600),Math.floor(seconds%3600/60),seconds%60].map(x=>String(x).padStart(2,'0')).join(':'),remaining:state.running?Math.max(0,state.nextIntervalMs-cycle):0,progress:state.running&&state.nextIntervalMs>0?Math.min(1,cycle/state.nextIntervalMs):0};
    state.clockFallback=typeof core?.pace!=='function';
    const metrics=state.clockFallback?fallback:core.pace(now,{running:state.running,startedMono:state.startedMono,endedMono:state.endedMono,cycleStart:state.cycleStart,intervalMs:state.nextIntervalMs,phase:state.phase});
    if($('time'))$('time').textContent=metrics.clock;
    const active=state.running||state.scanning;
    const rotor=$('gaugeRotor');if(rotor){
      rotor.style.animationPlayState=active?'running':'paused';
      if(typeof rotor.animate==='function'){
        if(state.rotorNode!==rotor){state.rotorAnimation?.cancel();state.rotorNode=rotor;rotor.style.animation='none';state.rotorAnimation=rotor.animate([{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],{duration:1200,iterations:Infinity});state.rotorAnimation.pause();}
        if(active&&state.rotorAnimation.playState!=='running')state.rotorAnimation.play();
        if(!active&&state.rotorAnimation.playState!=='paused')state.rotorAnimation.pause();
      }
    }
    const phase=active?(state.phase||'searching'):'stopped';
    const labels=state.language==='ar'?{searching:'بحث EA',buying:'شراء EA',waiting:'انتظار الجولة',stopped:'متوقف'}:{searching:'EA search',buying:'EA purchase',waiting:'Next search',stopped:'Stopped'};
    if($('cyclePhase'))$('cyclePhase').textContent=labels[phase]||phase;
    if($('speedValue'))$('speedValue').textContent=active?(phase==='waiting'?(metrics.remaining/1000).toFixed(1)+'s':((now-(state.phaseStarted||now))/1000).toFixed(1)+'s'):'—';
    const activeProgress=phase==='waiting'?metrics.progress:((now-(state.phaseStarted||now))%1400)/1400;
    if(active)state.gaugeProgress=activeProgress;
    const progress=state.gaugeProgress||0,circumference=2*Math.PI*76;
    if($('cycleRing')){$('cycleRing').style.strokeDasharray=String(circumference);$('cycleRing').style.strokeDashoffset=String(circumference*(1-progress));}
    if($('cycleDot')){const angle=-Math.PI/2+progress*Math.PI*2;$('cycleDot').setAttribute('cx',String(100+76*Math.cos(angle)));$('cycleDot').setAttribute('cy',String(100+76*Math.sin(angle)));}
    if($('nextDelay'))$('nextDelay').textContent=state.running?(metrics.remaining/1000).toFixed(2)+'s':'—';
    if($('actualCycle'))$('actualCycle').textContent=state.lastCycleMs>0?(state.lastCycleMs/1000).toFixed(2)+'s':'—';
    if($('sampledInterval'))$('sampledInterval').textContent=state.nextIntervalMs>0?(state.nextIntervalMs/1000).toFixed(2)+'s':'—';
    if($('lossRiskStatus')){
      const risk=state.lastRisk||(state.priceQuote&&typeof core?.lossRisk==='function'?core.lossRisk(numeric('maxBin'),state.priceQuote.price):null);
      $('lossRiskStatus').textContent=risk?.known?(state.language==='ar'?'تقدير بعد ضريبة 5%: ':'After 5% tax: ')+risk.lossPct.toFixed(1)+'% '+(state.language==='ar'?'خسارة من تكلفة الشراء؛ التنبيه عند أكثر من 10%.':'loss on purchase cost; confirm only above 10%.'):(state.language==='ar'?'الخسارة غير محسوبة بدون مرجع لنفس النسخة. يُستخدم سعر المصدر المختار، أو متوسط EA إن توفر.':'Loss unknown without an edition reference. Uses the chosen provider or an available EA average.');
    }
  }
  function phase(value){state.phase=value;state.phaseStarted=performance.now();refresh();}
  async function waitCycle(token){phase('waiting');while(state.running&&state.token===token){const left=state.nextIntervalMs-(performance.now()-state.cycleStart);if(left<=0)break;await nap(Math.min(100,left));}}
  function refresh(){if(!shadow)return;
    const sec=state.started?Math.floor(((state.ended||Date.now())-state.started)/1000):0;
    const show={searchCount:fmt(state.searches),matchCount:fmt(state.matches),buyCount:fmt(state.bought),spent:fmt(state.spent),misses:fmt(state.misses),time:`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`,status:state.running?'LIVE':state.status==='خطأ'?'ERROR':'READY'};
    for(const [k,v] of Object.entries(show))if($(k))$(k).textContent=v;
    if($('sessionMode'))$('sessionMode').textContent=state.running?($('autoBuy')?.checked?'AUTO BUY':'ALERT ONLY'):'STANDBY';
    paintSpeedGauge(state.running?state.nextIntervalMs:0);
    if($('saveFilterTop'))$('saveFilterTop').disabled=state.running||state.starting||state.scanning||state.editionUpdating;
    if($('addPlayer'))$('addPlayer').disabled=state.running||state.starting||state.scanning||state.editionUpdating;
    for(const b of shadow.querySelectorAll('.target-card-select,.target-remove'))b.disabled=state.running||state.starting||state.scanning||state.editionUpdating;
    $('start').disabled=state.running||state.starting||state.scanning||state.editionUpdating||Boolean(state.pickerPending);$('stop').disabled=!(state.running||state.starting||state.scanning);
    if($('dockStatus'))$('dockStatus').textContent=(state.running||state.scanning?(state.selected?.name||'EA Market')+' · '+($('cyclePhase')?.textContent||''):state.status);
    if($('scanMarket')){$('scanMarket').disabled=state.running||state.starting||state.editionUpdating||Boolean(state.pickerPending);$('scanMarket').textContent=state.scanning?(state.scanQueued?(state.language==='ar'?'تحديث جديد في الانتظار':'Refresh queued'):(state.language==='ar'?'جارٍ الفحص — اضغط لطلب تحديث':'Scanning — click to refresh again')):(state.language==='ar'?'فحص السوق — بحث جديد':'Scan market — fresh search');}
    if($('dockScan')){$('dockScan').disabled=$('scanMarket').disabled;$('dockScan').textContent=state.scanning?(state.scanQueued?(state.language==='ar'?'تحديث منتظر':'Refresh queued'):(state.language==='ar'?'طلب تحديث':'Request refresh')):(state.language==='ar'?'فحص السوق':'Scan market');}
    for(const id of ['player','itemId','postPurchase','resultsCount','priceSource','pricePlatform','priceEdition','pricePercent','bidLadder','bidLadderCeiling','searchRoute','loadEditions','refreshQuote','autoBuy','budget','maxBuys','maxSearches','maxBin','minBin','minBid','maxBid','ratingMin','ratingMax'])if($(id))$(id).disabled=state.running||state.starting||state.scanning||state.editionUpdating;
    for(const button of shadow.querySelectorAll('[data-native-picker]'))button.disabled=state.running||state.starting||state.scanning||state.editionUpdating;
    updateClubAvailability();
    $('runBadge').innerHTML=state.running?'<i></i> LIVE SCANNING':'<i></i> STANDBY';$('runBadge').className='pill'+(state.running?' green':'');
    $('sessionLabel').textContent=state.running?'ACTIVE SESSION':'SESSION INACTIVE';$('sessionStatus').textContent=state.running?'● SCANNING':`● ${state.status}`;
    const nativeReady=Boolean(state.pageSnapshot&&state.pageConnection?.ok),sdkSelected=input('searchRoute')==='sdk';
    const connected=state.pageMode?nativeReady&&(!sdkSelected||state.pageSnapshot?.capabilities?.directSearch===true):Boolean(findNativeSearchButton());
    $('connection').textContent=state.pageMode?(connected?(sdkSelected?'● EA SDK DIRECT CONNECTED':'● EA SCREEN FUNCTIONS CONNECTED'):'● EA FUNCTIONS · RECONNECT / RELOAD REQUIRED'):(connected?'● EA MARKET DETECTED (DOM)':'● EA WEB APP · VIEW UNCONFIRMED');
    $('connection').className='pill'+(connected?' green':' warn');
    $('provider').textContent='المصدر: '+state.lastProvider;
    if($('quoteBox'))$('quoteBox').dataset.status=state.priceQuote&&Date.now()-state.priceQuote.retrievedAt>=90000?(state.language==='ar'?'السعر قديم — حدّث المرجع':'Quote expired — refresh required'):'';
  }

  function safeImg(x){try{const u=new URL(x);return u.protocol==='https:'&&['game-assets.fut.gg','www.fut.gg'].includes(u.hostname)?u.href:'';}catch{return '';}}
  function targetKey(p){return p.playerId?'player-'+p.playerId:String(p.key||p.itemId||p.name);}
  function stashActiveTarget(){
    const selected=state.selected;if(!selected)return;
    const target=state.selectedTargets.find(x=>x.key===selected.key);if(!target)return;
    target.itemId=Number(input('itemId'))||null;
    if(state.pageSnapshot?.player?.id===selected.playerId){
      target.filterChoices=Object.fromEntries(Object.entries(state.pageSnapshot.selections||{}).map(([kind,x])=>[kind,x.id]));
      target.rarities=[...(state.pageSnapshot.rarities||[])];
    }
  }
  function upsertTarget(p){
    const key=targetKey(p),existing=state.selectedTargets.find(x=>x.key===p.key||x.key===key||p.playerId&&x.playerId===p.playerId);
    if(existing){Object.assign(existing,p,{key});state.selectedTargets=state.selectedTargets.filter(x=>x===existing||x.key!==key&&(!p.playerId||x.playerId!==p.playerId));return existing;}
    const target={...p,key};state.selectedTargets.push(target);return target;
  }
  function renderTargets(){
    const host=$('selectedTargets');if(!host)return;host.replaceChildren();host.dataset.count=state.selectedTargets.length;
    const locked=state.running||state.starting||state.scanning;
    for(const target of state.selectedTargets){
      const active=target.key===state.selected?.key,card=document.createElement('article');card.className='target-chip selected-card'+(active?' active':'');card.dataset.playerId=target.playerId||'';
      const choose=document.createElement('button');choose.type='button';choose.className='target-card-select';choose.disabled=locked;choose.setAttribute('aria-pressed',String(active));
      const image=document.createElement('div');image.className='selected-portrait';
      const url=target.source==='ea-native'?imageFromNative(target.imageUrl):safeImg(target.imageUrl);
      if(url){const img=document.createElement('img');img.src=url;img.alt=target.name;img.loading='lazy';img.onerror=()=>img.remove();image.append(img);}
      const rating=document.createElement('b');rating.textContent=target.rating||'—';image.append(rating);
      const pos=document.createElement('span');pos.className='position-badge';pos.textContent=target.position||'—';image.append(pos);
      const name=document.createElement('strong');name.textContent=target.name;
      const meta=document.createElement('small');meta.textContent=target.itemId?'Item '+target.itemId:(state.language==='ar'?'كل الإصدارات المطابقة للفلتر':'Editions matching filters');
      const status=document.createElement('span');status.className='target-active';status.textContent=active?(state.language==='ar'?'اللاعب النشط':'Active target'):(state.language==='ar'?'ضمن دورة البحث':'In search rotation');
      choose.append(image,name,meta,status);choose.addEventListener('click',()=>selectPlayer(target));
      const remove=document.createElement('button');remove.type='button';remove.className='target-remove';remove.disabled=locked;remove.textContent='×';remove.title=tr('selclear');
      remove.addEventListener('click',async()=>{
        if(state.running||state.starting||state.scanning)return;
        state.selectedTargets=state.selectedTargets.filter(x=>x.key!==target.key);
        if(active){state.selected=null;state.nativePlayerConfirmed=false;state.priceQuote=null;
          if(state.selectedTargets.length)selectPlayer(state.selectedTargets[0]);
          else{state.selectionCollapsed=false;$('player').value='';$('itemId').value='';if(state.pageMode)try{await Page.request('connect');mergePageSnapshot((await Page.request('clearPlayer')).snapshot);}catch(e){addLog(e.message,'warning');}}
        }
        renderTargets();save();
      });
      card.append(choose,remove);host.append(card);
    }
    if(!state.selectedTargets.length){const empty=document.createElement('div');empty.className='selected-empty';empty.textContent=state.language==='ar'?'اختَر لاعبًا ليظهر كارتُه هنا':'Select a player to pin their card here';host.append(empty);}
    if($('playerSearchDrawer'))$('playerSearchDrawer').hidden=Boolean(state.selectionCollapsed&&state.selectedTargets.length);
    if($('activeTargetName'))$('activeTargetName').textContent=state.selected?.name||'—';
    if($('rotationNote'))$('rotationNote').textContent=state.language==='ar'?`${state.selectedTargets.length} لاعب · البحث عليهم بالتبادل · ميزانية مشتركة`:`${state.selectedTargets.length} targets · round-robin search · shared budget`;
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
    if(state.running||state.starting){addLog('أوقف الجلسة قبل تغيير اللاعب.','warning');return;}
    stashActiveTarget();clearTimeout(searchTimer);state.pendingQuery++;
    state.priceQuote=null;state.editions=[];if($('priceEdition'))$('priceEdition').replaceChildren(new Option('—',''));if($('quoteBox'))$('quoteBox').textContent='—';
    if(state.selectedTargets.length>=12&&!state.selectedTargets.some(x=>x.playerId===p.playerId||x.key===p.key)){addLog('الحد الأقصى 12 لاعبًا.','warning');return;}
    const existing=state.selectedTargets.find(x=>x.playerId&&x.playerId===p.playerId||x.key===p.key);
    const chosen=existing?{...existing,...p,itemId:existing.itemId,filterChoices:existing.filterChoices,rarities:existing.rarities}:{...p};
    state.lastRisk=null;state.selected=upsertTarget(chosen);state.selectionCollapsed=true;state.nativePlayerConfirmed=false;
    state.pickerRequestSeq=(state.pickerRequestSeq||0)+1;state.pickerOptions=[];
    if($('nativePickerResults'))$('nativePickerResults').replaceChildren();
    if($('pickerStatus'))$('pickerStatus').textContent=state.language==='ar'?'سيتم عرض إصدارات اللاعب المؤكد عند فتح الحدث.':'Open Events to read the confirmed player editions.';
    const key=state.selected.key;
    $('player').value=p.name||'';
    $('itemId').value=state.selected.itemId?String(state.selected.itemId):'';
    if(state.pageMode){
      renderTargets();renderPlayers(state.players);refresh();save();
      if(state.selected.filterChoices){state.editionUpdating=true;refresh();void activateTarget(state.selected).then(()=>{stashActiveTarget();save();}).catch(e=>addLog(e.message,'error')).finally(()=>{state.editionUpdating=false;refresh();});}
      else void confirmNativePlayer();return;
    }
    // Catalogue metadata must never be falsely presented as a confirmed native EA filter.
    // Keep native selections already explicitly made; changing player does not silently clear EA state.
    updateNativeLabels();
    const field=findField(bridge[0][1]);
    if(state.selectedTargets.length===1&&field){
      if(setNativeValue(field,p.name))addLog('نُقل اسم اللاعب إلى EA؛ اضغط EA player autocomplete لتأكيد البطاقة من الاقتراح الأصلي.','warning');
    }else if(!field){addLog('تم اختيار البطاقة لكن فلتر اسم EA غير ظاهر. افتح شاشة سوق EA أولًا.','warning');}
    renderTargets();renderPlayers(state.players);refresh();save();
    addLog(`تم اختيار ${p.name} · Item ID: ${p.itemId||'غير متوفر'}`,'success');
    if(Native?.hasForm() && state.selectedTargets.length===1){
      // Native lookup only if the original EA form is already open; never claim a catalogue match is a native selection.
      void confirmNativePlayer();
    }
  }
  async function confirmNativePlayer(){
    state.nativePlayerConfirmed=false;
    if($('playerSyncState'))$('playerSyncState').textContent=state.language==='ar'?'EA: جارٍ التحقق من الاختيار…':'EA: verifying the current selection…';
    const selected=state.selected;
    if(!selected){addLog('اختر لاعبًا واحدًا أولًا.','warning');return;}
    if(Page&&!state.pageMode && !await connectEA())return;
    if(state.selected!==selected)return;
    if(state.pageMode){
      const id=Number(selected.playerId||selected.itemId);
      try{
        const ready=await Page.request('connect');if(state.selected!==selected)return;mergePageSnapshot(ready.snapshot);
        const select=()=>Page.request('selectPlayer',{id,itemId:selected.itemId,source:selected.source||'catalogue',nativeToken:selected.nativeToken,searchQuery:selected.searchQuery,query:selected.name});
        let report;try{report=await select();}catch(e){if(e.code!=='PLAYER_STALE')throw e;const pool=await Page.request('players',{query:selected.searchQuery||selected.name.split(' ')[0]}),entry=pool.items.find(x=>x.playerId===id);if(!entry)throw Error('EA did not refresh the exact player ID.');selected.nativeToken=entry.nativeToken;selected.searchQuery=entry.searchQuery;report=await select();}
        if(state.selected!==selected)return;
        selected.playerId=report.resolvedPlayerId;selected.nativePlayerId=report.resolvedPlayerId;
        state.selected=upsertTarget(selected);
        mergePageSnapshot(report.snapshot);state.nativePlayerConfirmed=true;stashActiveTarget();renderTargets();save();
        $('playerSyncState').textContent='✓ EA player ID '+report.resolvedPlayerId+' · '+report.resolution;
        addLog('EA confirmed native player ID: '+report.resolvedPlayerId+' · '+report.resolution,'success');
      }catch(e){addLog(e.message,'error');$('playerSyncState').textContent='EA: '+e.message;}
      return;
    }
    if(!Native?.hasForm()&&!await connectEA())return;
    const field=findField(bridge[0][1])||document.querySelector('.ut-player-search-control--input-container input,input[placeholder*="Player Name" i]');
    if(!field){addLog('لم يظهر إدخال اسم اللاعب الأصلي في EA.','error');return;}
    setNativeValue(field,selected.name);field.focus();await nap(430);
    const options=[...document.querySelectorAll('[role="option"],.ut-player-search-results li,.ut-list-container .ut-list-row,.ut-search-result-item')]
      .filter(visible).filter(el=>normalize(el.textContent).includes(normalize(selected.name)));
    if(options.length===1){options[0].click();state.nativePlayerConfirmed=true;addLog('تم اختيار اللاعب من اقتراح EA الأصلي: '+selected.name,'success');}
    else addLog('لم يظهر اقتراح واحد مؤكد من EA للاعب '+selected.name+'؛ افتح فلتر اللاعب الأصلي واختر البطاقة بنفسك.','warning');
    if($('playerSyncState'))$('playerSyncState').textContent=state.nativePlayerConfirmed?'✓ Native EA selected':'EA selection not verified';
  }
  function renderPlayers(list=[],notice=''){
    state.players=list;
    const host=$('playerResults');if(!host)return;host.replaceChildren();$('cardCount').textContent=`${list.length} ${tr('cardcount')}`;
    if(notice){const d=document.createElement('div');d.className='muted';d.textContent=notice;host.appendChild(d);}
    for(const p of [...new Map(list.map(p=>[p.playerId||p.itemId||p.key,p])).values()].slice(0,24)){
      const b=document.createElement('button');b.type='button';b.className='result';
      if(state.selectedTargets.some(x=>x.key===String(p.key||p.itemId||p.playerId||p.name)))b.classList.add('chosen');
      const avatar=document.createElement('span');avatar.className='avatar';avatar.textContent=String(p.name||'?').charAt(0).toUpperCase();
      const url=p.source==='ea-native'?imageFromNative(p.imageUrl):safeImg(p.imageUrl);if(url){avatar.textContent='';const img=document.createElement('img');img.src=url;img.alt=p.name;img.loading='lazy';img.onerror=()=>{avatar.textContent=String(p.name||'?')[0].toUpperCase();img.remove();};avatar.appendChild(img);}
      const info=document.createElement('span');info.className='rdata';const name=document.createElement('b');name.textContent=p.name||'Unknown';const desc=document.createElement('small');desc.textContent=`${p.position||'—'} · ${p.rarity||'—'} · ${p.club||'—'} · Item ID ${p.itemId||'—'} · Player ID ${p.playerId||'—'}`;
      info.append(name,desc);const rating=document.createElement('span');rating.className='rating';rating.textContent=p.rating||'—';
      b.append(avatar,info,rating);b.addEventListener('click',()=>selectPlayer(p));host.appendChild(b);
    }
  }
  async function searchPlayers(queryOverride){
    if(state.running||state.starting||state.scanning)return;
    const term=typeof queryOverride==='string'?queryOverride:input('player');const token=++state.pendingQuery;
    if(term.length<2){renderPlayers([], 'اكتب حرفين أو أكثر.');return;}
    if(Page&&!state.pageMode){
      const ready=await connectEA({refreshPlayers:false});
      if(token!==state.pendingQuery)return;
      if(!ready){renderPlayers([],state.language==='ar'?'بحث EA غير جاهز؛ راجع تقرير الاتصال.':'EA player search is unavailable; check the connection report.');return;}
    }
    if(state.pageMode){
      try{
        const ready=await Page.request('connect');if(token!==state.pendingQuery)return;mergePageSnapshot(ready.snapshot);
        const response=await Page.request('players',{query:term});if(token!==state.pendingQuery)return;
        renderPlayers(response.items,response.items.length?'EA native player database — select rarity/event separately.':'No matching native EA player.');
        state.lastProvider='EA native · '+response.items.length;
        $('dataHealth').textContent='EA native player search (base players, not all card versions)';refresh();
      }catch(e){if(token===state.pendingQuery){renderPlayers([],e.message);addLog(e.message,'error');}}
      return;
    }
    const local=state.cache.filter(p=>normalize(p.name).includes(normalize(term))||String(p.itemId||'')===term||String(p.playerId||'')===term).slice(0,12);
    renderPlayers(local, local.length?'نتائج محفوظة من بحث سابق — جاري تحديث الكتالوج…':'جاري البحث في كتالوج FUT.GG…');
    state.lastProvider='FUT.GG · جاري الاتصال';refresh();
    try{
      const response=await Extension.request({type:'GPTS_SEARCH_FUTGG',payload:{query:term,page:1}});
      if(token!==state.pendingQuery)return;
      if(!response?.ok)throw Error(response?.error||'تعذر الاتصال بمصدر اللاعبين');
      const list=(response.result.items||[]).filter(p=>p&&p.name).map(p=>({...p,source:'futgg',searchQuery:term}));
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
  function hasSelectedLeague(){return state.pageMode?Number(state.pageSnapshot?.selections?.league?.id)>0:Boolean(state.domLeagueSelected);}
  function updateClubAvailability(){
    const button=shadow.querySelector('[data-native-picker="club"]');if(!button)return;
    const league=hasSelectedLeague(),locked=state.pageMode&&state.pageSnapshot?.selections?.club?.enabled===false;
    button.disabled=state.running||state.starting||state.scanning||state.editionUpdating||!league||locked;
    const hint=!league?(state.language==='ar'?'اختر دوريًا أولًا لعرض أنديته':'Select a league to see its clubs'):locked?(state.language==='ar'?'EA قفلت فلتر النادي للاختيار الحالي':'EA locked Club for the current selection'):'';
    button.title=hint;if($('clubHint'))$('clubHint').textContent=hint;
    if(!league&&state.pickerVisible&&state.pickerKind==='club')closeNativePicker();
  }
  function mergePageSnapshot(snapshot){
    if(!snapshot)return;
    state.pageSnapshot=snapshot;
    for(const kind of ['quality','position','nation','league','club','event']){
      const selection=snapshot.selections?.[kind];
      if($(kind))$(kind).value=selection?.label||'';
      state.nativeChoices[kind]=selection?.label||'';
    }
    state.nativePlayerConfirmed=Boolean(snapshot.player?.id && snapshot.maskedDefId===snapshot.player.id &&
      (!state.selected||snapshot.player.id===Number(state.selected.playerId||state.selected.itemId)));
    updateNativeLabels();updateClubAvailability();
  }
  async function connectEA(options={}){
    if(state.nativeConnectionPromise)return state.nativeConnectionPromise;
    const pending=connectEAOnce(options);state.nativeConnectionPromise=pending;
    try{return await pending;}finally{if(state.nativeConnectionPromise===pending)state.nativeConnectionPromise=null;}
  }
  async function connectEAOnce(options={}){
    if(!Native){addLog('محرك الاتصال بواجهة EA غير محمّل.','error');return false;}
    if(state.nativeConnectInProgress)return false;
    state.nativeConnectInProgress=true;const btn=$('connectEA');if(btn)btn.disabled=true;
    const panel=$('nativeConnectStatus');if(panel){panel.textContent='Connecting to original EA market…';panel.className='native-status';}
    try{
      let report;
      if(Page){
        const switchingSource=!state.pageMode;
        report=await Page.request('connect');state.pageMode=true;state.pageConnection=report;
        if(switchingSource){
          renderPlayers([],state.language==='ar'?'تم الاتصال ببحث EA. اكتب اسم اللاعب لقراءة اقتراحاته الأصلية.':'Connected to EA player search. Type a name to read its native suggestions.');
          state.lastProvider='EA native player engine';
          const q=state.selected?.searchQuery||input('player');if(!state.starting&&!state.running&&!state.scanning&&options.refreshPlayers!==false&&q.length>=2)void searchPlayers(q);
        }
        mergePageSnapshot(report.snapshot);for(const step of report.trace)markConnectProgress(step);
        $('dataHealth').textContent='EA PAGE FUNCTIONS · native controllers & local player engine';
      }else{state.pageMode=false;report=await Native.connectMarket(markConnectProgress);}

      if(panel){panel.textContent=report.ok?(state.pageMode?'✓ EA PAGE FUNCTIONS — native search controller connected':'✓ EA Transfer Market Search connected (DOM)'):'✕ EA connection stopped at '+report.stage+' — '+report.trace.at(-1);panel.className='native-status '+(report.ok?'good':'bad');}
      addLog(report.ok?'اتصلنا بواجهة بحث EA الأصلية':'تعذر الوصول لسوق EA عند المرحلة: '+report.stage+' — '+report.trace.at(-1),report.ok?'success':'warning');
      inspectNative();return report.ok;
    }catch(e){if(Page){state.pageConnection={ok:false,mode:'page-functions',stage:e.code||'EA_ERROR',trace:[e.message],at:new Date().toISOString()};state.pageSnapshot=null;}addLog('تعذر الاتصال بواجهة EA: '+e.message,'error');if(panel)panel.textContent=e.message;return false;}
    finally{state.nativeConnectInProgress=false;if(btn)btn.disabled=false;refresh();}
  }
  function imageFromNative(src){try{const url=new URL(src,location.href);if(url.protocol==='https:')return url.href;}catch{}return '';}
  function positionNativePicker(){
    const area=$('nativePickerArea'),anchor=state.pickerAnchor;if(!state.pickerVisible||!area||!anchor?.isConnected)return;
    const rect=anchor.getBoundingClientRect();if(!anchor.getClientRects().length||rect.bottom<8||rect.top>window.innerHeight-8){closeNativePicker();return;}
    const bottom=Math.min(window.innerHeight-10,($('runDock')?.getBoundingClientRect().top||window.innerHeight)-8),below=bottom-rect.bottom-5,above=rect.top-10;
    const openUp=below<170&&above>below,height=Math.max(100,Math.min(330,openUp?above:below));
    const width=Math.min(Math.max(180,rect.width),window.innerWidth-20),left=Math.max(10,Math.min(rect.left,window.innerWidth-width-10));
    area.style.width=width+'px';area.style.left=left+'px';area.style.top=openUp?'auto':rect.bottom+5+'px';area.style.bottom=openUp?window.innerHeight-rect.top+5+'px':'auto';area.style.maxHeight=height+'px';area.style.setProperty('--picker-height',height+'px');
  }
  function closeNativePicker({focus=false}={}){const anchor=state.pickerAnchor;
    state.pickerVisible=false;state.pickerRequestSeq=(state.pickerRequestSeq||0)+1;
    $('nativePickerResults')?.replaceChildren();if($('nativePickerArea'))$('nativePickerArea').hidden=true;
    for(const b of shadow.querySelectorAll('[data-native-picker]'))b.setAttribute('aria-expanded','false');
    state.pickerAnchor=null;if(focus&&anchor?.isConnected)anchor.focus({preventScroll:true});
  }
  async function showNativePicker(kind){
    if(kind==='club'&&!hasSelectedLeague()){updateClubAvailability();throw Error(state.language==='ar'?'اختر دوريًا من EA أولًا، ثم افتح النادي.':'Choose an EA league before opening Club.');}
    if(state.pickerVisible&&state.pickerKind===kind){closeNativePicker({focus:true});return;}
    closeNativePicker();const requestId=(state.pickerRequestSeq||0)+1;state.pickerRequestSeq=requestId;
    state.pickerVisible=true;state.pickerKind=kind;state.pickerAnchor=shadow.querySelector('[data-native-picker="'+kind+'"]');$('nativePickerArea').hidden=false;$('nativePickerArea').setAttribute('aria-label',tr(kind));positionNativePicker();
    for(const b of shadow.querySelectorAll('[data-native-picker]'))b.setAttribute('aria-expanded',String(b.dataset.nativePicker===kind));
    const target=$('nativePickerResults'),status=$('pickerStatus');if(!target||!status)return;
    target.replaceChildren();status.classList.remove('picker-ready');status.textContent='EA '+kind+' · Loading original options…';
    if(!state.pageMode&&!Native?.hasForm()){
      const connected=await connectEA();if(!connected){status.textContent='لا يمكن عرض فلاتر '+kind+' قبل الاتصال بشاشة السوق الأصلية.';return;}
    }
    if(state.pageMode){const ready=await Page.request('connect');mergePageSnapshot(ready.snapshot);}
    if(state.pickerPending)await state.pickerPending.catch(()=>{});if(state.pickerRequestSeq!==requestId)return;
    const pending=state.pageMode?Page.request('options',{kind}):Native.openPicker(kind);state.pickerPending=pending;refresh();
    let found;try{found=await pending;}finally{if(state.pickerPending===pending)state.pickerPending=null;refresh();}
    if(state.pickerRequestSeq!==requestId)return;
    state.pickerKind=kind;state.pickerOptions=found.options||[];
    const ar=state.language==='ar',meta=found.meta||{rawCount:found.options.length,uniqueCount:found.options.length,duplicatesRemoved:0,unresolvedNames:0};
    state.lastPickerAudit={kind,...meta,images:{loaded:0,missing:0,pending:0}};
    status.textContent=found.ok?(ar?`EA ${kind}: ${meta.uniqueCount} اختيار بالـID · ${meta.duplicatesRemoved} مكرر حُذف · ${meta.unresolvedNames} اسم غير متاح`:`EA ${kind}: ${meta.uniqueCount} IDs · ${meta.duplicatesRemoved} duplicates removed · ${meta.unresolvedNames} unresolved names`):found.reason;
    if(meta.scope==='selected-player')status.textContent+=ar?` · إصدارات اللاعب ${meta.playerId} فقط (${meta.editionCount})`:` · player ${meta.playerId} editions only (${meta.editionCount})`;
    if(found.ok&&meta.nameGroups!=null)status.textContent+=ar?` · ${meta.nameGroups} أسماء أندية مجمعة`:` · ${meta.nameGroups} club-name groups`;
    if(!found.ok){addLog('EA options unavailable: '+kind,'warning');return;}
    status.classList.add('picker-ready');positionNativePicker();
    const source=document.createElement('p');source.className='desc native-source';source.dataset.source='ea-native';
    source.textContent=ar?'خيارات فلتر EA الأصلية؛ وجود اختيار لا يعني وجود عروض له الآن. الصور من EA عند توفرها.':'Original EA filter choices; a choice does not prove current listings exist. Images use EA assets when available.';if(kind==='club')source.textContent+=ar?' الاسم المتشابه يظهر مرة واحدة؛ افتحه لاختيار الدوري والـID.':' Equal names appear once; expand to choose the league and ID.';target.append(source);
    const bar=document.createElement('input');bar.type='search';bar.className='native-option-filter';bar.placeholder=ar?'بحث بالاسم أو EA ID أو الدوري':'Search name, EA ID or league';target.appendChild(bar);
    const toggleLabel=document.createElement('label');toggleLabel.className='native-unresolved-toggle';
    const unresolved=document.createElement('input');unresolved.type='checkbox';unresolved.id='showUnresolvedOptions';
    const toggleText=document.createElement('span');toggleText.textContent=ar?`إظهار خيارات بلا اسم موثق (${meta.unresolvedNames})`:`Show choices without a resolved name (${meta.unresolvedNames})`;
    toggleLabel.append(unresolved,toggleText);toggleLabel.hidden=!meta.unresolvedNames;target.append(toggleLabel);
    const grid=document.createElement('div');grid.className='native-option-grid';target.appendChild(grid);
    const imageStatus=document.createElement('p');imageStatus.className='desc native-image-status';imageStatus.setAttribute('aria-live','polite');target.append(imageStatus);
    let generation=0;
    const render=()=>{
      const current=++generation;grid.replaceChildren();const term=normalize(bar.value);let count=0,hidden=0;
      const images={loaded:0,missing:0,pending:0};
      const report=()=>{
        if(current!==generation)return;
        state.lastPickerAudit={kind,...meta,images:{...images}};
        imageStatus.textContent=ar?`صور EA: ${images.loaded} محمّلة · ${images.missing} غير متاحة · ${images.pending} بانتظار التحميل`:`EA images: ${images.loaded} loaded · ${images.missing} unavailable · ${images.pending} pending`;
      };
      const filtered=state.pickerOptions.filter(opt=>{
        if(opt.unresolved&&!unresolved.checked){hidden++;return false;}
        const searchable=[opt.label,opt.id,opt.leagueLabel,opt.leagueId].filter(x=>x!==null&&x!==undefined).join(' ');
        return !term||normalize(searchable).includes(term);
      });
      const appendNativeImage=(button,opt)=>{
        const fallback=document.createElement('span');fallback.className='native-option-fallback';fallback.textContent='◈';fallback.title=ar?'شعار غير متاح من EA':'EA image unavailable';
        const candidates=(opt.images||[{url:opt.image}]).map(x=>imageFromNative(x.url)).filter(Boolean);
        if(candidates.length){
          const img=document.createElement('img');img.alt='';img.loading='lazy';let attempt=0,settled=false;images.pending++;
          img.onload=()=>{if(settled)return;settled=true;images.loaded++;images.pending--;button.dataset.imageState='loaded';report();};
          img.onerror=()=>{
            if(settled)return;
            if(++attempt<candidates.length){img.src=candidates[attempt];return;}
            settled=true;images.pending--;images.missing++;button.dataset.imageState='unavailable';img.replaceWith(fallback);report();
          };
          img.src=candidates[0];button.append(img);
        }else{images.missing++;button.dataset.imageState='unavailable';button.append(fallback);}
      };
      const grouped=kind==='club'&&window.CodexEAOptions?window.CodexEAOptions.groups(filtered):filtered.map(opt=>({label:opt.label,options:[opt]}));
      for(const group of grouped.slice(0,160)){
        let destination=grid;
        if(group.options.length>1){
          const section=document.createElement('details');section.className='native-option-group';section.dataset.optionGroup='true';
          const summary=document.createElement('summary');summary.title=ar?'مجموعة أسماء؛ افتح لتحديد الدوري والـID':'Name group; expand to choose the league and ID';
          const preview={...group.options[0],images:group.options.slice(0,4).flatMap(opt=>opt.images||[{url:opt.image}])};appendNativeImage(summary,preview);
          const label=document.createElement('span');label.className='native-group-label';label.textContent=group.label;summary.append(label);
          const note=document.createElement('small');note.textContent=ar?`${group.options.length} اختيارات EA — افتح لتحديد الدوري والـID`:`${group.options.length} EA choices — expand for league and ID`;
          label.append(note);section.append(summary);grid.append(section);destination=section;
        }
        for(const opt of group.options){
        const button=document.createElement('button');button.type='button';button.className='native-option';button.dataset.eaId=opt.id??'';
        button.title=(opt.unresolved?(ar?'اسم غير متاح من EA':'Name unavailable from EA'):opt.label)+(opt.id!=null?' · EA ID '+opt.id:'');
        appendNativeImage(button,opt);
        const info=document.createElement('span');info.className='native-option-info';
        const text=document.createElement('span');text.textContent=group.options.length>1?(opt.leagueLabel||'EA ID '+opt.id):opt.unresolved?(ar?`EA ID ${opt.id} — الاسم غير متاح`:`EA ID ${opt.id} — name unavailable`):opt.label;
        const detail=document.createElement('small');detail.textContent=[opt.id!=null?'EA ID '+opt.id:'',opt.leagueLabel||''].filter(Boolean).join(' · ');
        info.append(text,detail);button.append(info);
        button.addEventListener('click',async()=>{
          button.disabled=true;let result;
          try{result=state.pageMode?await Page.request('choose',{token:found.token,index:opt.index}):Native.chooseOption(opt.index);}
          catch(e){status.textContent=e.message;button.disabled=false;return;}
          if(kind==='event'&&state.nativeChoices.event!==result.label){state.priceQuote=null;state.lastRisk=null;if($('quoteBox'))$('quoteBox').textContent='—';$('itemId').value='';$('priceEdition').value='';}
          if(result.snapshot)mergePageSnapshot(result.snapshot);
          if(!result.ok){status.textContent='EA changed the options: reopen the picker.';button.disabled=false;return;}
          if(kind==='league'&&!result.snapshot){state.domLeagueSelected=!/^(any(?: league)?|all|league|الدوري|دوري|الكل|أي(?: دوري)?)$/i.test(String(result.label).trim());$('club').value='';state.nativeChoices.club='';}
          const inputEl=$(kind);if(inputEl)inputEl.value=result.label;
          state.nativeChoices[kind]=result.label;updateNativeLabels();stashActiveTarget();addLog('EA selection: '+kind+' — '+result.label+' · ID '+(opt.id??'unavailable'),'success');
          status.textContent='✓ EA '+kind+': '+result.label;generation++;closeNativePicker({focus:true});updateClubAvailability();save();
        });destination.append(button);
        }
      }
      if(!grid.childElementCount){const empty=document.createElement('p');empty.className='desc';empty.textContent=ar?'لا توجد أسماء مطابقة. يمكن إظهار الخيارات غير المترجمة من الاختيار أعلاه.':'No matching names. Unresolved names can be enabled above.';grid.append(empty);}
      report();
    };
    bar.addEventListener('input',render);unresolved.addEventListener('change',render);render();
    addLog(`EA ${kind}: ${meta.rawCount} native rows, ${meta.uniqueCount} distinct choices, ${meta.duplicatesRemoved} duplicate IDs removed, ${meta.unresolvedNames} unresolved names`,'info');
  }

  function nativeOfferImage(row){
    const img=row.querySelector('img');if(img?.currentSrc||img?.src)return imageFromNative(img.currentSrc||img.src);
    for(const el of [row,...row.querySelectorAll('.ut-item-image,.player-image,.image')].slice(0,8)){
      const bg=getComputedStyle(el).backgroundImage||'';const m=bg.match(/url\(["']?([^"')]+)["']?\)/);if(m)return imageFromNative(m[1]);
    }return '';
  }
  function resultLimit(){const n=numeric('resultsCount');if(!Number.isSafeInteger(n)||n<1||n>100)throw Error('اختر عدد نتائج من 1 إلى 100.');return n;}
  function clearMarket(message='EA …'){
    state.nativeItems=[];state.nativeSearchId=null;state.lowestObserved=null;state.lastMarket=null;state.marketError=message;
    if($('nativeOffers'))$('nativeOffers').textContent=message;
    if($('marketResponse'))$('marketResponse').textContent=message;
    captureVisibleLowestQuiet();
  }
  function acceptMarket(response){
    state.nativeItems=response.items;state.nativeSearchId=response.searchId;state.marketError=null;state.lastMarket=response;
    for(const target of state.selectedTargets){const item=response.items.find(x=>x.playerId===target.playerId&&x.position&&(target.itemId?x.itemId===target.itemId:x.itemId===target.playerId));if(item)target.position=item.position;}renderTargets();
    displayNativeOffers();captureVisibleLowestQuiet();
    const ar=state.language==='ar';
    $('marketResponse').textContent=(response.transport==='ea-sdk-direct'?'EA SDK':(ar?'رد EA':'EA response'))+' #'+response.searchId+' · '+new Date(response.receivedAt).toLocaleTimeString()+' · '+response.count+'/'+response.requested+' · '+response.pages+(ar?' صفحة':' page(s)')+(response.identicalToPrevious?(ar?' · نفس العروض في الرد الجديد':' · Same listings returned again'):'')+(Number.isInteger(response.newTrades)?(ar?' · أرقام جديدة مقارنة بآخر رد: ':' · New Trade IDs: ')+response.newTrades:'')+(response.moreAvailable?(ar?' · توجد نتائج إضافية خارج العدد المختار':' · More results outside the chosen count'):'')+(response.transport==='ea-sdk-direct'?' · SDK '+(response.sdkStatus??'—')+' · '+response.durationMs+'ms':'');
  }
  async function loadPriceEditions(){
    if(state.running||state.starting||state.scanning)return;
    if(!await connectEA()||!state.pageMode)throw Error('EA MAIN bridge required.');
    if(state.selected&&!state.nativePlayerConfirmed)await confirmNativePlayer();
    const playerId=state.selected?.playerId;const response=await Page.request('editions');if(state.selected?.playerId!==playerId)throw Error('تغير اللاعب؛ أعد تحميل إصداراته.');if(!response.complete)throw Error('EA edition catalogue incomplete.');
    state.editions=response.items;
    $('priceEdition').replaceChildren(new Option(state.language==='ar'?'اختر نسخة EA':'Choose EA edition',''));
    for(const x of response.items)$('priceEdition').append(new Option((x.name||state.selected?.name||'EA')+' · '+x.rating+' · Rarity '+x.rarityId+' · ID '+x.itemId,String(x.itemId)));
    $('priceEdition').value=input('itemId');
  }
  async function refreshPrice(force=false){
    const provider=input('priceSource');state.priceQuote=null;displayNativeOffers();
    if(provider==='manual'){$('quoteBox').textContent='Max Buy Now · '+fmt(numeric('maxBin'))+' Coins';return null;}
    const id=Number(input('itemId'));if(!Number.isSafeInteger(id)||id<=0)throw Error('اختر إصدار EA محددًا أو أدخل EA Item ID لنسخة الكارت أولًا.');
    const platform=input('pricePlatform');$('quoteBox').textContent=provider.toUpperCase()+' …';
    let reply;
    try{reply=await Extension.request({type:'CODEX_GET_PRICES',payload:{provider,platform,ids:[id],force,baseIds:state.selected?.playerId?{[id]:state.selected.playerId}:{}}});}
    catch(error){
      state.lastPriceStatus={provider,platform,itemId:id,at:new Date().toISOString(),ok:false,stage:'extension-messaging',status:null,code:error.code||'RUNTIME_UNAVAILABLE'};
      const explanation=state.language==='ar'?'الإضافة غير متصلة بخدمة الأسعار ('+state.lastPriceStatus.code+'). فعّل النسخة الجديدة وحدّث صفحة EA بالكامل بعد تحديث الإضافة. لم نستلم ردًا من موقع الأسعار.':error.message;
      $('priceControls').open=true;$('quoteBox').textContent=explanation;throw Error(explanation);
    }
    state.lastPriceStatus={provider,platform,itemId:id,at:new Date().toISOString(),ok:reply?.ok===true,stage:'provider-response',status:reply?.status||null,code:reply?.code||null};
    if(!reply?.ok){$('priceControls').open=true;const explanation=reply?.status===400?provider.toUpperCase()+' رفض صيغة الطلب لهذه النسخة (HTTP 400). لا يوجد سعر مؤكد.':reply?.status===403?(provider==='futbin'?'Futbin رفض طلب الأسعار (HTTP 403). قد يكون تقييد وصول أو حماية آلية؛ فتح الموقع لا يضمن إتاحة الأسعار للإضافة. استخدم رابط المصدر للمراجعة، أو اختر FUT.GG أو السعر اليدوي بنفسك. لا يوجد سعر مؤكد.':'مصدر السعر رفض الوصول (HTTP 403). افتح موقع المصدر وراجع إتاحته؛ لا يوجد سعر مؤكد.'):reply?.status===429?'مصدر السعر طلب تقليل الطلبات (HTTP 429). حاول لاحقًا.':reply?.error||'Price provider unavailable.';$('quoteBox').textContent=explanation;throw Error(explanation);}
    const q=reply.result.quotes.find(x=>x.itemId===id&&x.provider===provider&&x.platform===platform);state.lastPriceStatus.quoteAvailable=Boolean(q);
    if(!q||!Number.isSafeInteger(q.price)||q.price<=0||!Number.isFinite(q.retrievedAt)||Date.now()-q.retrievedAt<0||Date.now()-q.retrievedAt>=90000)throw Error('لا يوجد سعر حديث لنفس النسخة والمنصة من المصدر المختار.');
    if(input('priceSource')!==provider||input('pricePlatform')!==platform||Number(input('itemId'))!==id)throw Error('تغير الإصدار أو مصدر السعر أثناء الطلب؛ حدّث السعر مجددًا.');
    state.priceQuote=q;$('quoteBox').textContent=provider.toUpperCase()+' · '+platform+' · '+fmt(q.price)+' Coins · Item '+id+' · '+new Date(q.retrievedAt).toLocaleTimeString()+(state.language==='ar'?' (وقت الجلب؛ وقت تحديث المصدر غير متاح)':' (retrieved; provider update time unavailable)');
    displayNativeOffers();return q;
  }
  async function preparePrice(){
    state.effectiveMaxPrice=null;resultLimit();
    if(input('priceSource')==='manual'){state.priceQuote=null;return;}
    const percent=numeric('pricePercent');if(!Number.isFinite(percent)||percent<1||percent>200)throw Error('نسبة السعر من 1 إلى 200%.');
    const q=await refreshPrice(Boolean(state.previousQuote&&Date.now()-state.previousQuote.retrievedAt>30000));state.previousQuote=q;const ceiling=window.CodexPrices.cap(q.price,percent,numeric('maxBin'));
    if(ceiling<150||ceiling<numeric('minBin'))throw Error('سقف السعر المرجعي أقل من الحد الأدنى المسموح.');
    state.effectiveMaxPrice=ceiling;
    $('quoteBox').textContent+=(state.language==='ar'?' · سقف البحث الفعلي: ':' · Effective search ceiling: ')+fmt(ceiling);
  }
  async function scanMarket(){
    unlockAudio();if(state.scanning){state.scanQueued=true;refresh();return;}
    if(state.running||state.starting||state.editionUpdating||state.pickerPending)return;
    closeNativePicker();clearTimeout(searchTimer);state.pendingQuery++;const token=++state.token;state.scanning=true;state.cycleStart=performance.now();state.nextIntervalMs=0;phase('searching');clearMarket();
    try{
      stashActiveTarget();if(state.selectedTargets.length>1){const target=state.selectedTargets[(state.manualTargetIndex||0)%state.selectedTargets.length];await activateTarget(target);if(token!==state.token)return;}
      await preparePrice();if(token!==state.token)return;
      if(!await connectEA()||!state.pageMode)throw Error(state.pageConnection?.trace?.at(-1)||'يلزم جسر EA MAIN للفحص الجديد.');
      if(token!==state.token)return;
      if(state.selected&&!state.nativePlayerConfirmed)await confirmNativePlayer();
      if(state.selected&&!state.nativePlayerConfirmed)throw Error('EA player selection is not confirmed.');
      if(token!==state.token)return;
      const applied=await applyNative({cycle:true});if(!applied.ok)throw Error(applied.unmapped.join(', '));
      if(token!==state.token)return;
      logSearchPrices(applied,'scan');
      const response=await Page.request('search',{criteriaKey:state.pageSnapshot.criteriaKey,maxBin:state.effectiveMaxPrice||numeric('maxBin'),playerId:state.pageSnapshot.player?.id||null,limit:resultLimit(),route:input('searchRoute')||'sdk',planId:state.searchPlan?.id});
      if(token!==state.token)return;
      state.lastCycleMs=performance.now()-state.cycleStart;state.searches++;state.manualTargetIndex=(state.manualTargetIndex||0)+1;acceptMarket(response);
      addLog('فحص EA جديد #'+response.searchId+' · '+response.count+' عرض · '+response.pages+' صفحة'+(response.identicalToPrevious?' · أعادت EA نفس العروض':''),'success');
      $('marketPanel').scrollTop=0;
    }catch(e){if(token===state.token){state.scanQueued=false;clearMarket(e.message);addLog(e.message,'error');}}
    finally{if(token===state.token){state.scanning=false;state.phase='stopped';refresh();if(state.scanQueued){state.scanQueued=false;void scanMarket();}}}
  }
  function displayNativeOffers(){
    const target=$('nativeOffers');if(!target)return;
    if(state.pageMode){
      target.replaceChildren();
      if(!state.nativeItems.length){const empty=document.createElement('div');empty.className='market-empty';empty.textContent=state.marketError||(state.language==='ar'?'لا توجد عروض في رد EA الحالي.':'No listings in the current EA response.');target.append(empty);return;}
      const minimum=Math.min(...state.nativeItems.map(x=>x.price).filter(x=>x>0));
      for(const [index,item] of state.nativeItems.entries()){
        const node=document.createElement('article');node.className='market-card';node.dataset.tradeId=item.tradeId;
        const portrait=document.createElement('div');portrait.className='market-portrait';
        const url=imageFromNative(item.image);if(url){const img=document.createElement('img');img.src=url;img.alt='';img.loading='lazy';img.onerror=()=>img.remove();portrait.append(img);}
        const rating=document.createElement('b');rating.textContent=item.rating||'—';const position=document.createElement('span');position.className='market-position';position.textContent=item.position||'—';portrait.append(rating,position);
        const info=document.createElement('div');info.className='market-card-info';
        const quote=document.createElement('small');quote.className='card-reference';const q=state.priceQuote;
        quote.textContent=q&&q.itemId===item.itemId&&Date.now()-q.retrievedAt<90000?q.provider.toUpperCase()+' · '+q.platform+' · '+fmt(q.price)+' Coins':(state.language==='ar'?'مرجع خارجي لنفس النسخة: غير مقروء':'Exact-edition provider quote: unavailable');
        const title=document.createElement('h4');title.textContent=item.name||('EA Player '+item.playerId);
        const detail=document.createElement('p');detail.textContent=(item.position||'—')+' · Item '+item.itemId+' · Rarity '+(item.rarityId??'—')+' · Player '+item.playerId;
        const trade=document.createElement('small');trade.className='trade-id';trade.textContent='#'+(index+1)+' · Trade '+item.tradeId+(item.observedAt?' · '+new Date(item.observedAt).toLocaleTimeString():'');
        info.append(quote,title,detail,trade);
        const price=document.createElement('div');price.className='market-card-price';price.textContent=item.price>0?fmt(item.price)+' Coins':(state.language==='ar'?'لا يوجد Buy Now':'No Buy Now');
        const tag=document.createElement('small');tag.textContent=!(item.price>0)?(state.language==='ar'?'مزايدة فقط':'Bid only'):item.price===minimum?(state.language==='ar'?'أقل سعر مستلم':'Lowest received'):'Buy Now';price.append(tag);
        node.append(portrait,info,price);target.append(node);
      }
      return;
    }
    target.replaceChildren();const rows=resultRows().slice(0,24);
    if(!rows.length){const empty=document.createElement('div');empty.className='muted';empty.textContent='No visible EA market listings. Open native market search results first.';target.append(empty);return;}
    for(const row of rows){const card=rowCard(row);const view=document.createElement('div');view.className='native-offer';
      const imageUrl=nativeOfferImage(row);if(imageUrl){const im=document.createElement('img');im.src=imageUrl;im.alt='';im.referrerPolicy='no-referrer';im.loading='lazy';view.append(im);}
      const info=document.createElement('div');info.className='native-offer-info';
      const a=document.createElement('b');a.textContent=card.name||'EA Item (name unknown)';
      const b=document.createElement('small');b.textContent=[card.rating&&`OVR ${card.rating}`,card.rarity,card.itemId&&`ID ${card.itemId}`].filter(Boolean).join(' · ')||'Details unavailable';
      const c=document.createElement('strong');c.textContent=card.price?fmt(card.price)+' Coins':'Price not readable';
      info.append(a,b,c);view.append(info);target.append(view);
    }
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
    if(state.pageMode){
      const snap=state.pageSnapshot,linked=Object.values(snap?.selections||{}).filter(Boolean).length;
      const msg='EA PAGE FUNCTIONS · filters '+linked+'/6 · native search '+(snap?.hasForm?'ready':'not current');
      state.lastNative=msg;$('nativeInfo').textContent=msg;$('nativeInfo').className='native-status '+(snap?.hasForm?'good':'bad');$('syncCount').textContent='EA FUNCTIONS: '+linked+'/6';
      return{linked,fields:[],hasSearch:Boolean(snap?.hasForm)};
    }
    const fields=fieldList();let linked=0;
    for(const [id,patterns] of bridge)if(findField(patterns))linked++;
    const hasSearch=!!findNativeSearchButton();
    const bridgeStatus=Native?.nativeStatus();const msg=`EA: ${fields.length} حقل ظاهر · ${linked}/${bridge.length} قابل للمطابقة · زر Search: ${hasSearch?'موجود':'غير مكتشف'}. Native: ${bridgeStatus?.hasForm?'Form detected':'Form unavailable'}.`;
    state.lastNative=msg;$('nativeInfo').textContent=msg;$('nativeInfo').className='native-status '+(hasSearch?'good':'bad');$('syncCount').textContent=`EA FILTERS: ${linked}/${bridge.length}`;
    addLog(msg,hasSearch?'success':'warning');return{linked,fields,hasSearch};
  }
  function compatibilityAudit(){
    const hasMarket=[...document.querySelectorAll('.ut-market-search-filters-view,.ut-market-search-view,[class*="market-search"]')].some(visible);
    const hasSearch=state.pageMode?Boolean(state.pageSnapshot?.capabilities?.search):Boolean(findNativeSearchButton());
    const rows=resultRows();
    const checks=[];
    const add=(name,condition,detail,viewDependent=true)=>checks.push({name,status:condition?'pass':viewDependent&&!hasMarket?'unknown':'fail',detail});
    add('EA MAIN-world function bridge',state.pageMode,state.pageMode?'Native controller connection confirmed':'Connect to EA to test page functions',false);
    if(!state.pageMode)checks[checks.length-1].status='unknown';
    if(state.pageMode)for(const [key,ok] of Object.entries(state.pageSnapshot?.capabilities||{}))add('EA function: '+key,ok,'From the current EA controller snapshot',false);
    add('Native market search screen',hasMarket,hasMarket?'DOM market container recognized':'Open Transfers → Transfer Market → Search',false);
    if(!hasMarket)checks[checks.length-1].status='unknown';
    add(state.pageMode?'Native search action':'Native Search button',hasSearch,state.pageMode?'EA eSearchSelected handler':(hasSearch?'Visible Search control found':'EA Search button missing'));
    for(const [id,patterns] of bridge){
      const field=findField(patterns);
      const snapshot=state.pageSnapshot;
      const linked=state.pageMode?(id==='player'?Boolean(snapshot?.player):['minBid','maxBid','minBin','maxBin'].includes(id)?Boolean(snapshot?.prices):Boolean(snapshot?.selections?.[id])):Boolean(field);
      add('EA Filter: '+id,linked,state.pageMode?'EA controller snapshot (use refresh to read current filters)':field?`Visible ${field.tagName} mapped`:'Selector/label unavailable in current view');
      if(state.pageMode&&id==='player'&&!snapshot?.player)checks[checks.length-1].status='unknown';
    }
    add('Result list container',[...document.querySelectorAll('.SearchResults,.ut-market-search-results-view')].some(visible),'Only required when result view is open');
    if(!hasMarket||(state.pageMode&&state.pageSnapshot?.hasForm))checks[checks.length-1].status='unknown';
    add('Buy Now control',Boolean(buyButton()),'Only present when a purchasable listing is selected');
    checks[checks.length-1].status=buyButton()?'pass':'unknown';
    const first=rows[0]||null;
    const card=state.pageMode?state.nativeItems[0]:(first?rowCard(first):null);
    for(const [label,ok] of [
      ['Result: player name',Boolean(card?.name)],
      ['Result: rating',Number.isInteger(card?.rating)&&card.rating>0],
      ['Result: item ID',Boolean(card?.itemId)],
      ['Result: rarity',state.pageMode?Number.isInteger(card?.rarityId):Boolean(card?.rarity)],
      ['Result: Buy Now price',Number.isInteger(card?.price)&&card.price>0]
    ]){
      add(label,ok,first?(ok?'Read from a visible result':'Visible result lacks readable data'):'Open a result list to test',false);
      if(!card)checks[checks.length-1].status='unknown';
    }
    add('Confirmation dialog',Boolean(dialog()),'Only required during a native purchase dialog',false);
    checks[checks.length-1].status=dialog()?'pass':'unknown';
    add('CAPTCHA/security challenge',!blocked(),'Session must stop if protection appears',false);
    const counters={pass:checks.filter(x=>x.status==='pass').length,fail:checks.filter(x=>x.status==='fail').length,unknown:checks.filter(x=>x.status==='unknown').length};
    const report={kind:'CODEX_SNIPE_COMPATIBILITY',version:'3.9.4',at:new Date().toISOString(),page:location.pathname,marketViewDetected:hasMarket,searchButtonDetected:hasSearch,counts:counters,checks,nativeFunctions:state.pageMode?state.pageSnapshot:null};
    state.lastAudit=report;
    state.auditLog.unshift({at:report.at,summary:`Pass ${counters.pass}, Fail ${counters.fail}, Need view ${counters.unknown}`,marketView:hasMarket});
    state.auditLog=state.auditLog.slice(0,60);
    renderDiagnostics();
    addLog(`فحص EA: ✅${counters.pass} / ❌${counters.fail} / ◌${counters.unknown} (غير ظاهر)`,counters.fail?'warning':'info');
    return report;
  }
  function auditAsText(){
    const a=state.lastAudit||compatibilityAudit();
    return [`CODEX SNIPE DIAGNOSTICS v${a.version}`,`Time: ${a.at}`,`Page: ${a.page}`,`EA market view: ${a.marketViewDetected}`,`Search button: ${a.searchButtonDetected}`,`PASS: ${a.counts.pass} | FAIL: ${a.counts.fail} | NOT SHOWN: ${a.counts.unknown}`,...a.checks.map(c=>`[${c.status.toUpperCase()}] ${c.name} — ${c.detail}`)].join('\n');
  }
  function technicalAsText(){
    const lines=state.auditLog.map(x=>`[${x.at}] ${x.summary} | marketView=${x.marketView}`);
    return ['CODEX SNIPE TECHNICAL LOG',...lines,'','Last native option audit:',JSON.stringify(state.lastPickerAudit||null),'','Extension runtime:',JSON.stringify({uiVersion:'3.9.4',...Extension?.status(),helpers:{trade:typeof window.CodexTradeCore?.pace,prices:typeof window.CodexPrices?.cap,native:typeof window.GPTPageClient?.request}}),'','Clock diagnostics:',JSON.stringify({fallback:state.clockFallback===true,tradeHelper:typeof window.CodexTradeCore?.pace,rotor:state.rotorAnimation?.playState||null}),'','Last prepared SDK query:',JSON.stringify(state.searchPlan||null),'','Last bid ladder:',JSON.stringify(state.lastBidCycle||null),'','Last price-provider status:',JSON.stringify(state.lastPriceStatus||null),'','Last confirmed market response:',JSON.stringify(state.lastMarket?{searchId:state.lastMarket.searchId,requested:state.lastMarket.requested,count:state.lastMarket.count,pages:state.lastMarket.pages,receivedAt:state.lastMarket.receivedAt,localCacheCleared:state.lastMarket.localCacheCleared,freshEvent:state.lastMarket.freshEvent,identicalToPrevious:state.lastMarket.identicalToPrevious,transport:state.lastMarket.transport,nativePrices:state.lastMarket.nativePrices,sdkStatus:state.lastMarket.sdkStatus,newTrades:state.lastMarket.newTrades}:null),'','Recent application events:',...state.logs.slice(0,40).map(x=>`[${x.at}] ${x.level} ${x.message}`)].join('\n');
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
    const blob=new Blob([contentType.startsWith('application/json')?text:'\ufeff'+text],{type:contentType});const url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);addLog('تم النسخ إلى الحافظة.','success');}
    catch(e){addLog('تعذر النسخ، استخدم تصدير TXT: '+e.message,'warning');}
  }
  function logsAsText(){return ['CODEX SNIPE ACTIVITY LOG',...state.logs.map(x=>`[${x.at}] [${x.level}] ${x.message}`)].join('\n');}
  function captureVisibleLowestQuiet(){
    const prices=(state.pageMode?state.nativeItems.map(x=>x.price):resultRows().map(priceFrom)).filter(x=>Number.isSafeInteger(x)&&x>0);
    if(!prices.length){state.lowestObserved=null;if($('lowestPriceValue'))$('lowestPriceValue').textContent='—';if($('lowestPriceMeta'))$('lowestPriceMeta').textContent=tr('notobserved');return;}
    const value=Math.min(...prices);
    state.lowestObserved={price:value,at:new Date().toISOString(),sampleCount:prices.length};
    if($('lowestPriceValue'))$('lowestPriceValue').textContent=fmt(value)+' Coins';
    if($('lowestPriceMeta'))$('lowestPriceMeta').textContent=`${prices.length} readable listing(s) · ${new Date().toLocaleTimeString()}`;
  }
  function exportNativeMap(){
    const {fields,hasSearch}=inspectNative();
    const data={kind:'CODEX SNIPE DOM map - labels only',timestamp:new Date().toISOString(),urlPath:location.pathname,hasSearchButton:hasSearch,
      nativeFields:fields.slice(0,120).map(({el,label})=>({label:label.slice(0,160),tag:el.tagName,type:el.type||'',name:el.name||'',id:el.id||'',placeholder:el.placeholder||''})),
      navigation:[...document.querySelectorAll('button,a,[role="tab"],[role="menuitem"]')].filter(e=>visible(e)&&e.getBoundingClientRect().left<340).slice(0,90).map(e=>({tag:e.tagName,role:e.getAttribute('role')||'',label:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,75),className:typeof e.className==='string'?e.className.slice(0,100):''}))};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='CODEX_SNIPE_EA_DOM_Map.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),2500);
    addLog('تم تصدير خريطة عناصر الصفحة بدون قيم الحقول أو رموز تسجيل الدخول.','success');
  }
  async function applyNative({cycle=false}={}){
    if(state.pageMode){
      try{
        const maxBin=state.effectiveMaxPrice||numeric('maxBin'),base={minBid:numeric('minBid'),maxBid:numeric('maxBid'),minBin:numeric('minBin'),maxBin};
        if(input('bidLadder')==='max'&&(!Number.isSafeInteger(numeric('bidLadderCeiling'))||numeric('bidLadderCeiling')<Math.max(150,maxBin,base.minBid,base.maxBid)||numeric('bidLadderCeiling')>15000000))throw Error('نهاية سلم Max Bid يجب ألا تقل عن بدايته، وحتى 15 مليون.');
        let ladder=null,key;
        if(cycle&&input('bidLadder')==='max'){
          const ceiling=numeric('bidLadderCeiling');key=JSON.stringify([state.pageSnapshot?.criteriaKey,base,ceiling]);state.bidCounts??=new Map();const index=state.bidCounts.get(key)||0;
          const compute=(window.CodexTradeCore||globalThis.CodexTradeCore)?.bidLadder;
          if(typeof compute==='function')ladder=compute({enabled:true,index,maxBuyNow:maxBin,minBid:base.minBid,maxBid:base.maxBid,ceiling});
          else{const tick=n=>n<1000?50:n<10000?100:n<50000?250:n<100000?500:1000;let value=Math.max(150,maxBin,base.minBid,base.maxBid);value=Math.ceil(value/tick(value))*tick(value);
            if(!Number.isSafeInteger(ceiling)||ceiling<value||ceiling>15000000)throw Error('اختر نهاية سلم لا تقل عن قيمة بدايته، وحتى 15 مليون.');
            const values=[];while(value<=ceiling&&values.length<16000){values.push(value);value+=tick(value);}const step=index%(values.length+1);ladder={minBid:base.minBid,maxBid:step===values.length?0:values[step],step,broad:step===values.length,cycleLength:values.length+1,ceiling};}

          base.maxBid=ladder.maxBid;
        }
        const route=input('searchRoute')||'sdk';
        const report=route==='sdk'?await Page.request('prepareSearch',{criteriaKey:state.pageSnapshot.criteriaKey,prices:base}):await Page.request('applyPrices',base);
        state.searchPlan=route==='sdk'?{id:report.planId,prices:report.prices,criteriaKey:report.snapshot.criteriaKey}:null;
        const effective=route==='sdk'?report.prices:report.snapshot.prices;
        for(const [field,value] of Object.entries(base))if(effective[field]!==value)throw Error('EA changed '+field+'; choose Direct EA SDK to avoid linked screen prices.');
        if(ladder){state.bidCounts.set(key,(state.bidCounts.get(key)||0)+1);if(state.bidCounts.size>120)state.bidCounts.delete(state.bidCounts.keys().next().value);state.lastBidCycle={...ladder,maxBin,at:new Date().toISOString()};if($('bidCycleStatus'))$('bidCycleStatus').textContent='Min Bid: '+fmt(base.minBid)+' · Max Bid: '+(base.maxBid?fmt(base.maxBid):(state.language==='ar'?'بدون حد':'Uncapped'))+' · Max Buy Now: '+fmt(maxBin);}

        mergePageSnapshot(report.snapshot);
        if(effective.maxBin!==(state.effectiveMaxPrice||numeric('maxBin')))throw Error('EA Max Buy Now mismatch.');
        for(const id of ['ratingMin','ratingMax'])if(input(id))addLog('Rating range is checked against results; EA does not expose a market rating filter.','info');
        $('nativeInfo').textContent='✓ '+(route==='sdk'?'EA SDK criteria prepared':'EA screen prices confirmed')+' · Max Bid '+fmt(effective.maxBid)+' · Max Buy Now '+fmt(effective.maxBin);
        return{ok:true,unmapped:[],applied:4,prices:{...effective},ladder:ladder?{...ladder}:null};
      }catch(e){addLog(e.message,'error');return{ok:false,unmapped:[e.message]};}
    }
    const audit=inspectNative();if(!audit.hasSearch){$('nativeInfo').textContent+=' Search غير متاح حتى الآن.';return {ok:false,unmapped:['EA Search']};}
    let applied=0;const unmapped=[];
    for(const [id,patterns] of bridge){
      const value=input(id);if(!value)continue;
      if(id==='player'&&state.nativePlayerConfirmed)continue; // preserve EA autocomplete's actual selected item
      if(state.nativeChoices?.[id]===value)continue; // preserve EA picker selection
      const field=findField(patterns);
      if(field&&setNativeValue(field,value))applied++;
      else if(['quality','position','nation','club','league'].includes(id)&&state.nativeChoices?.[id]===value)continue; // already selected in EA
      else unmapped.push(id);
    }
    $('nativeInfo').textContent=`تم نقل ${applied} حقل إلى واجهة EA. غير مربوط: ${unmapped.join(', ')||'لا شيء'}.`;
    $('nativeInfo').className='native-status '+(unmapped.length?'bad':'good');
    addLog(`المزامنة: ${applied} حقل؛ لم تتم مطابقة ${unmapped.length}.`,unmapped.length?'warning':'success');
    return {ok:unmapped.length===0,unmapped,applied};
  }
  function logSearchPrices(applied,kind){
    if(!applied.prices)return;
    const ar=state.language==='ar',prices=applied.prices,ladder=applied.ladder;
    const mode=ladder?(ar?'سلم Max Bid · خطوة ':'Max Bid ladder · step ')+(ladder.step+1)+'/'+ladder.cycleLength:(ar?'مزايدة ثابتة — السلم متوقف':'Fixed bids — ladder off');
    const maximum=prices.maxBid===0?(ar?'بدون حد (0)':'Uncapped (0)'):fmt(prices.maxBid);
    const target=state.selected?.name||state.pageSnapshot?.player?.name||(ar?'الفلاتر الحالية':'Current filters');
    addLog((kind==='scan'?(ar?'إرسال فحص السوق':'Dispatch market scan'):(ar?'إرسال بحث السنايب':'Dispatch snipe search'))+' · '+target+' · '+mode+' · Min Bid: '+fmt(prices.minBid)+' · Max Bid: '+maximum+' · Min Buy Now: '+fmt(prices.minBin)+' · Max Buy Now: '+fmt(prices.maxBin),'info');
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
  function options(){return Core.validate(Core.options({target:input('player'),itemId:input('itemId'),rarity:input('quality'),minRating:input('ratingMin'),maxRating:input('ratingMax'),maxPrice:state.effectiveMaxPrice||numeric('maxBin'),maxSpend:numeric('budget'),maxBuys:numeric('maxBuys'),maxSearches:numeric('maxSearches'),intervalMs:rangeConfig().minMs,autoBuy:$('autoBuy').checked}));}
  function stop(reason='توقف'){state.scanQueued=false;const scanPending=state.scanning;if(!state.running&&!state.starting&&!state.scanning)return;state.starting=false;state.running=false;state.scanning=false;state.ended=Date.now();state.endedMono=performance.now();state.phase='stopped';state.token++;if(state.pageMode)void Page.request('cancel').catch(()=>{});if(scanPending)clearMarket(reason);state.status=reason;addLog(reason,'warning');refresh();save();}
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
      if(row.classList.contains('won')||document.querySelector('.listFUTItem.selected.won')){state.bought++;state.spent+=price;addLog(`شراء مؤكد عبر واجهة EA: ${card.name} · ${fmt(price)}`,'success');refresh();return true;}
      if(row.classList.contains('expired')||document.querySelector('.listFUTItem.selected.expired')){state.misses++;addLog('العرض انتهى قبل الشراء.','warning');return true;}
      if(blocked()){stop('رسالة حماية بعد محاولة الشراء.');return true;}await nap(180);
    }
    stop('تم إرسال الطلب لكن نتيجته غير مؤكدة؛ راجع حسابك.');return true;
  }
  async function checkNativeOffers(o,token){
    for(const item of state.nativeItems){
      if(!state.running||token!==state.token)return;
      if(state.handledTrades?.has(item.tradeId))continue;
      if(item.observedAt&&Date.now()-item.observedAt>30000)continue;
      const baseId=state.selected?Number(state.selected.playerId||state.selected.itemId):null;
      if(baseId&&item.playerId!==baseId)continue;
      const rarities=state.pageSnapshot?.rarities||[];
      if(rarities.length&&!rarities.includes(item.rarityId))continue;
      // EA applied native category filters; verify the returned ID, rarity and price again.
      const check=Core.canBuy(item,{...o,target:baseId?'':o.target,rarity:''},state.spent,state.bought);
      if(!check.ok)continue;
      if(!o.autoBuy){
        state.matches++;addLog('EA confirmed matching listing: '+(item.name||item.playerId)+' · '+fmt(item.price)+' Coins','success');
        stop('EA native match found — alert mode.');return;
      }
      state.matches++;phase('buying');
      const args={sessionId:o.sessionId,searchId:state.nativeSearchId,tradeId:item.tradeId,instanceId:item.instanceId,expectedPrice:item.price};
      let response=await Page.request('buy',args);
      if(response.status==='approval-required'){
        state.lastRisk=response.risk;refresh();
        const risk=response.risk;
        const accepted=confirm((state.language==='ar'?'خسارة تقديرية أكثر من 10% بعد الضريبة':'Estimated loss above 10% after tax')+'\n'+
          'Buy: '+fmt(item.price)+' · Resale reference: '+fmt(risk.reference)+' · Net: '+fmt(risk.net)+'\n'+risk.lossPct.toFixed(1)+'% loss · '+response.riskSource);
        if(!accepted){stop('تم إلغاء الشراء بسبب الخسارة التقديرية.');return;}
        if(!state.running||state.token!==token)return;
        response=await Page.request('buy',{...args,approvedRiskKey:response.riskKey});
      }
      if(response.status==='bought'){
        if(state.activeSessionId===response.sessionId&&!state.receipts.has(response.receiptId)){
          state.handledTrades?.add(item.tradeId);showOutcome('won',item);state.receipts.add(response.receiptId);state.bought=response.buys;state.spent=response.spent;
          state.lastRisk=response.risk;addLog('EA purchase confirmed · '+response.tradeId+' · '+fmt(response.price)+' Coins','success');refresh();
          const moved=response.destination;if(moved?.status==='moved')addLog((state.language==='ar'?'تم إرسال الكارت إلى ':'Sent purchased card to ')+moved.destination,'success');
          if(moved?.status==='failed'){addLog('تم الشراء، لكن النقل لم يتأكد: '+moved.reason,'warning');stop('راجع مكان الكارت في EA؛ الشراء مؤكد.');}

        }
        return;
      }
      if(response.status==='already-attempted'){state.handledTrades?.add(item.tradeId);continue;}
      if(response.status==='missed'){state.handledTrades?.add(item.tradeId);showOutcome('missed',item);state.misses++;addLog(response.reason,'warning');refresh();continue;}
      throw Error('EA purchase needs a new price/risk verification; no purchase confirmed.');
    }
  }
  async function run(o,token){
    try{while(state.running&&state.token===token&&state.searches<o.maxSearches&&state.bought<o.maxBuys){
      if(blocked())throw Error('تم اكتشاف رسالة حماية.');
      if(state.pageMode){
        const started=Date.now();state.cycleStart=performance.now();state.nextIntervalMs=Core.randomInterval(rangeConfig().minMs,rangeConfig().maxMs);phase('searching');clearMarket('EA …');
        if(o.targets?.length>1){await activateTarget(o.targets[state.searches%o.targets.length]);if(!state.running||token!==state.token)return;o.target=state.selected.name;o.itemId=state.selected.itemId?String(state.selected.itemId):'';}
        if(input('priceSource')!=='manual'){
          await preparePrice();if(!state.running||token!==state.token)return;
          o.maxPrice=state.effectiveMaxPrice;
          if(!(o.targets?.length>1))await Page.request('updateQuote',{sessionId:o.sessionId,quote:state.priceQuote,maxPrice:o.maxPrice});
        }
        const ready=await Page.request('connect');mergePageSnapshot(ready.snapshot);
        if(!(o.targets?.length>1)&&ready.snapshot.criteriaKey!==o.criteriaKey)throw Error('Native EA filters changed; restart the session to confirm them.');
        if(!state.running||token!==state.token)return;
        const applied=await applyNative({cycle:true});if(!applied.ok)throw Error(applied.unmapped.join(', '));
        if(!state.running||token!==state.token)return;
        if(o.targets?.length>1){o.criteriaKey=state.pageSnapshot.criteriaKey;await Page.request('rotateTarget',{sessionId:o.sessionId,targetKey:state.selected.key,criteriaKey:o.criteriaKey,maxPrice:o.maxPrice,quote:state.priceQuote||null});}
        if(!state.running||token!==state.token)return;
        logSearchPrices(applied,'snipe');
        refresh();
        const response=await Page.request('search',{maxBin:o.maxPrice,criteriaKey:o.criteriaKey,playerId:state.selected?Number(state.selected.playerId||state.selected.itemId):null,limit:resultLimit(),route:input('searchRoute')||'sdk',planId:state.searchPlan?.id});
        if(!state.running||token!==state.token)return;
        state.searches++;acceptMarket(response);
        addLog((response.transport||'EA native')+' search #'+state.searches+' · confirmed response: '+response.count+' listing(s)','success');
        await checkNativeOffers(o,token);
        state.lastCycleMs=Date.now()-started;
        captureVisibleLowestQuiet();refresh();
        if(state.running&&state.bought<o.maxBuys&&state.searches<o.maxSearches)await waitCycle(token);
        continue;
      }
      let b=findNativeSearchButton();if(!b){const back=findBackButton();if(back){back.click();await nap(450);b=findNativeSearchButton();}}
      if(!b)throw Error('زر EA Search مش موجود. افتح صفحة Transfer Market Search.');
      const started=Date.now();state.nextIntervalMs=Core.randomInterval(rangeConfig().minMs,rangeConfig().maxMs);const priorRows=resultRows();b.click();state.searches++;refresh();addLog(`بحث #${state.searches} · الفاصل المختار ${(state.nextIntervalMs/1000).toFixed(2)}s`);
      await waitForSearch(token,priorRows);if(!state.running||token!==state.token)return;
      displayNativeOffers();
      for(const row of resultRows().slice(0,30)){if(await checkRow(row,o,token))break;if(!state.running)return;}
      if(!state.running||state.bought>=o.maxBuys)break;
      state.lastCycleMs=Date.now()-started;captureVisibleLowestQuiet();refresh();const remainder=Math.max(0,state.nextIntervalMs-state.lastCycleMs);if(remainder)await nap(remainder);
    }if(state.running)stop(state.bought>=o.maxBuys?'اكتمل عدد المشتريات':'اكتمل عدد عمليات البحث');}
    catch(e){if(token!==state.token)return;clearMarket(e.message);state.status='خطأ';addLog(`تم إيقاف المحرك: ${e.message}`,'error');if(state.running)stop('توقف عند خطأ');state.status='خطأ';refresh();}
  }
  async function start(){
    if(state.running||state.starting||state.scanning||state.editionUpdating||state.pickerPending)return;
    closeNativePicker();clearTimeout(searchTimer);state.pendingQuery++;
    const startToken=++state.token;state.starting=true;refresh();
    try{
    unlockAudio();stashActiveTarget();const targets=state.selectedTargets.map(x=>JSON.parse(JSON.stringify(x)));
    if(targets.length>1){if(input('priceSource')!=='manual'&&targets.some(x=>!x.itemId))throw Error('اختر إصدار كارت لكل لاعب قبل استخدام التسعير الخارجي.');await activateTarget(targets[0]);if(startToken!==state.token)return;}
    if(!Core){addLog('مكتبة التحقق من الفلاتر غير متاحة','error');return;}
    let o;try{await preparePrice();o=options();o.maxPrice=state.effectiveMaxPrice||o.maxPrice;o.targets=targets;}catch(e){clearMarket(e.message);addLog(e.message,'error');return;}
    if(startToken!==state.token)return;
    if(Page && !await connectEA())return;
    if(startToken!==state.token)return;
    if(!state.pageMode&&!findNativeSearchButton()){
      addLog('زر Search غير ظاهر؛ محاولة فتح السوق الأصلي تلقائيًا.','info');
      const connected=await connectEA();
      if(!connected || !findNativeSearchButton()){
        addLog('فشل بدء البحث: زر EA Search غير متاح بعد محاولة ربط السوق. افتح خريطة DOM لتحديد المشكلة.','error');
        $('compatPanel').open=true;compatibilityAudit();return;
      }
    }
    // Never start a targeted session with only a catalogue card name and an unverified EA autocomplete selection.
    if(state.selected && input('player') && !state.nativePlayerConfirmed)await confirmNativePlayer();
    if(state.selected && input('player') && !state.nativePlayerConfirmed){
      addLog('تم اختيار بطاقة في الكتالوج لكن اختيار EA الأصلي لم يُؤكد؛ راجع فلتر اللاعب في EA ثم أعد المحاولة.','warning');
      $('nativeInfo').textContent='الاسم المختار من FUT.GG لا يثبت اختيار نفس البطاقة في EA. افتح فلتر اللاعب الأصلي واختره ثم جرّب.';
      return;
    }
    if(startToken!==state.token)return;
    const transfer=await applyNative();
    if(!transfer?.ok){addLog('تم إيقاف Start: بعض الفلاتر لا يمكن ربطها مع سوق EA: '+(transfer?.unmapped||[]).join(', '),'error');$('compatPanel').open=true;compatibilityAudit();return;}
    if(state.pageMode)o.criteriaKey=state.pageSnapshot.criteriaKey;
    const nativeMax=findField(bridge.find(([id])=>id==='maxBin')[1]);
    if(state.pageMode?(input('searchRoute')==='sdk'?state.searchPlan?.prices?.maxBin:state.pageSnapshot?.prices?.maxBin)!==o.maxPrice:(!nativeMax||String(nativeMax.value||'').replace(/[^0-9]/g,'')!==String(numeric('maxBin')))){
      addLog('لم نستطع التحقق أن Max Buy Now انتقل إلى EA؛ لن نبدأ بحثًا بسعر غير محدد.','error');return;
    }
    if(startToken!==state.token)return;
    if(blocked()){addLog('رسالة حماية ظاهرة؛ لن يبدأ المحرك.','error');return;}
    if(o.autoBuy&&!state.pageMode){addLog('Auto Buy يحتاج جسر MAIN ودالة شراء EA الأصلية.','error');return;}
    if(state.pageMode){
      const native=await Page.request('beginSession',{criteriaKey:o.criteriaKey,route:input('searchRoute')||'sdk',planId:state.searchPlan?.id,maxPrice:o.maxPrice,hardMaxPrice:numeric('maxBin'),maxSpend:o.maxSpend,maxBuys:o.maxBuys,autoBuy:o.autoBuy,itemId:o.itemId,minRating:o.minRating,maxRating:o.maxRating,targets:targets.length>1?targets.map(x=>({key:x.key,playerId:x.playerId,itemId:Number(x.itemId)||null,rarities:x.rarities||[]})):[],postPurchase:input('postPurchase'),referencePrice:state.priceQuote?.price||null,referenceQuote:state.priceQuote||null});
      o.sessionId=native.sessionId;state.activeSessionId=native.sessionId;
    }
    if(startToken!==state.token)return;
    state.token++;state.running=true;state.started=Date.now();state.ended=0;state.startedMono=performance.now();state.endedMono=null;state.cycleStart=null;state.bidCounts??=new Map();state.receipts=new Set();state.handledTrades=new Set();state.phase='searching';state.lastRisk=null;state.lastCycleMs=0;state.nextIntervalMs=0;state.searches=0;state.matches=0;state.bought=0;state.misses=0;state.spent=0;state.status='يبحث';state.logs=[];
    addLog(o.autoBuy?'بدأ Auto Snipe (اختيار صريح)':'بدأ البحث في وضع التنبيه بدون شراء','success');refresh();save();run(o,state.token);
    }catch(e){addLog(e.message,'error');}finally{state.starting=false;refresh();}
  }
  async function presetSave(){
    if(state.running||state.starting||state.scanning)return;
    const name=prompt(state.language==='ar'?'اسم الفلتر المحفوظ؟':'Saved filter name?');if(!name?.trim())return;
    try{
      if(state.pageMode)mergePageSnapshot((await Page.request('connect')).snapshot);stashActiveTarget();
      state.presets[name.trim().slice(0,45)]={version:2,settings:readSettingsSafe(),targets:JSON.parse(JSON.stringify(state.selectedTargets)),activeKey:state.selected?.key||null,filterChoices:Object.fromEntries(Object.entries(state.pageSnapshot?.selections||{}).filter(([,x])=>x).map(([k,x])=>[k,x.id]))};
      populatePresets();$('presets').value='';addLog('تم حفظ الفلتر: '+name,'success');save();
    }catch(e){addLog(e.message,'error');}
  }
  async function loadPreset(preset){
    if(state.running||state.starting||state.scanning||state.editionUpdating)return;
    state.editionUpdating=true;refresh();state.priceQuote=null;state.effectiveMaxPrice=null;state.lastRisk=null;
    try{
      fillSettings(preset.settings||preset);
      if(preset.version===2&&Array.isArray(preset.targets)){
        state.selectedTargets=preset.targets.slice(0,12).map(x=>JSON.parse(JSON.stringify(x)));
        state.selected=state.selectedTargets.find(x=>x.key===preset.activeKey)||state.selectedTargets[0]||null;
        if(state.selected){await activateTarget(state.selected);state.selectionCollapsed=true;}
        else{
          if(!await connectEA())throw Error('EA filter connection unavailable.');mergePageSnapshot((await Page.request('clearPlayer')).snapshot);
          for(const kind of ['quality','event','position','nation','league','club']){
            const id=preset.filterChoices?.[kind];if(id==null||state.pageSnapshot.selections?.[kind]?.id===id)continue;
            const found=await Page.request('options',{kind}),option=found.options.find(x=>x.id===id);if(!option)throw Error('Saved EA filter unavailable: '+kind);
            mergePageSnapshot((await Page.request('choose',{token:found.token,index:option.index})).snapshot);
          }
        }
        const report=await applyNative();if(!report.ok)throw Error(report.unmapped.join(', '));
        addLog('تم استرجاع الفلتر وأرقام اختيارات EA.','success');
      }else addLog('تم تحميل إعداد قديم؛ راجع اختيارات EA الأصلية قبل البحث.','warning');
      renderTargets();save();
    }catch(e){addLog('تعذر استرجاع الفلتر: '+e.message,'error');}
    finally{state.editionUpdating=false;$('presets').value='';refresh();}
  }
  function populatePresets(){const el=$('presets');if(!el)return;el.replaceChildren(new Option('اختر إعدادًا محفوظًا',''));for(const k of Object.keys(state.presets))el.append(new Option(k,k));}
  function exportLogs(){const cells=[['time','level','message'],...state.logs.map(x=>[x.at,x.level,x.message])];const text=cells.map(a=>a.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='CODEX_SNIPE_Logs.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
  function setLanguage(lang){
    if(lang!=='ar'&&lang!=='en'||state.language===lang)return;
    closeNativePicker();
    const settings=readSettingsSafe(),opens=new Map([...shadow.querySelectorAll('details[id],details[data-panel-key]')].map(d=>[d.dataset.panelKey||d.id,d.open]));
    state.language=lang;
    const node=shadow.querySelector('#shell'),wrapper=document.createElement('div');wrapper.innerHTML=uiHTML();node.replaceWith(wrapper.firstElementChild);
    organizeWorkspace();for(const d of shadow.querySelectorAll('details[id],details[data-panel-key]')){const key=d.dataset.panelKey||d.id;if(opens.has(key))d.open=opens.get(key);}
    fillSettings(settings);populatePresets();updateSpeedControls();renderPlayers(state.players);renderTargets();renderEvents();updateDatalists();renderLogs();renderDiagnostics();bindUI();displayNativeOffers();captureVisibleLowestQuiet();refresh();save();
  }
  function bindUI(){
    bindWorkspace();$('close').addEventListener('click',closePanel);
    $('searchRoute').addEventListener('change',()=>{state.searchPlan=null;save();});
    $('maxBin').addEventListener('input',()=>{state.effectiveMaxPrice=null;state.lastRisk=null;refresh();});
    for(const id of ['priceSource','pricePlatform','pricePercent','itemId'])$(id).addEventListener('change',()=>{state.priceQuote=null;state.effectiveMaxPrice=null;$('quoteBox').textContent='—';if($('providerSite'))$('providerSite').href=input('priceSource')==='futgg'?'https://www.fut.gg/players/':'https://www.futbin.com/27/players';state.lastRisk=null;displayNativeOffers();});
    $('loadEditions').addEventListener('click',()=>loadPriceEditions().catch(e=>addLog(e.message,'error')));
    $('refreshQuote').addEventListener('click',()=>refreshPrice(true).catch(e=>{$('quoteBox').textContent=e.message;addLog(e.message,'warning');}));
    $('priceEdition').addEventListener('change',async()=>{
      const id=Number(input('priceEdition')),edition=state.editions?.find(x=>x.itemId===id);
      $('itemId').value=id?String(id):'';state.priceQuote=null;state.effectiveMaxPrice=null;$('quoteBox').textContent='—';
      if(!edition){save();return;}
      state.editionUpdating=true;refresh();
      try{
        const ready=await Page.request('connect');mergePageSnapshot(ready.snapshot);
        const available=await Page.request('options',{kind:'event'}),option=available.options.find(x=>x.id===edition.rarityId);
        if(!option)throw Error('EA does not expose this edition rarity in market filters.');
        const result=await Page.request('choose',{token:available.token,index:option.index});mergePageSnapshot(result.snapshot);
        if(state.selected){Object.assign(state.selected,{itemId:id,rating:edition.rating||state.selected.rating,position:edition.position||state.selected.position});upsertTarget(state.selected);stashActiveTarget();renderTargets();}
        $('quoteBox').textContent=(state.language==='ar'?'تم تحديد إصدار EA؛ الشراء يطابق Item ID بالضبط.':'EA edition selected; purchases require the exact Item ID.');
      }catch(e){$('itemId').value='';$('priceEdition').value='';addLog(e.message,'error');}finally{state.editionUpdating=false;save();refresh();}
    });
    $('scanMarket').addEventListener('click',scanMarket);
    $('marketFull').addEventListener('click',()=>{closeNativePicker();$('marketPanel').classList.toggle('market-full');$('marketPanel').scrollTop=0;});
    $('player').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(searchPlayers,430);});
    $('addEvent').addEventListener('click',addEvent);
    $('clearTargets').addEventListener('click',async()=>{
      if(state.running||state.starting||state.scanning)return;
      try{
        if(state.pageMode){await Page.request('connect');const response=await Page.request('clearPlayer');mergePageSnapshot(response.snapshot);}
        state.priceQuote=null;state.editions=[];$('quoteBox').textContent='—';$('priceEdition').replaceChildren(new Option('—',''));state.selectionCollapsed=false;state.selectedTargets=[];state.selected=null;state.nativePlayerConfirmed=false;$('player').value='';$('itemId').value='';
        $('playerSyncState').textContent=state.language==='ar'?'EA: لم يتم اختيار لاعب':'EA: no player selected';
        renderTargets();renderPlayers(state.players);save();
      }catch(e){addLog(e.message,'error');}
    });
    $('syncPlayerEA').addEventListener('click',confirmNativePlayer);
    $('speedPreset').addEventListener('change',()=>{updateSpeedControls();save();});
    $('speedMin').addEventListener('input',()=>{updateSpeedControls();save();});
    $('speedMax').addEventListener('input',()=>{updateSpeedControls();save();});
    $('language').addEventListener('change',()=>setLanguage(input('language')));
    $('runDiag').addEventListener('click',compatibilityAudit);
    $('copyDiag').addEventListener('click',()=>copyText(auditAsText()));
    $('exportDiagText').addEventListener('click',()=>saveTextFile('CODEX_SNIPE_Compatibility.txt',auditAsText()));
    $('exportDiagJson').addEventListener('click',()=>saveTextFile('CODEX_SNIPE_Compatibility.json',JSON.stringify(state.lastAudit||compatibilityAudit(),null,2),'application/json'));
    $('copyLog').addEventListener('click',()=>copyText(logsAsText()));
    $('exportLogText').addEventListener('click',()=>saveTextFile('CODEX_SNIPE_Activity_Log.txt',logsAsText()));
    $('copyTechnical').addEventListener('click',()=>copyText(technicalAsText()));
    $('exportTechnical').addEventListener('click',()=>saveTextFile('CODEX_SNIPE_Technical_Log.txt',technicalAsText()));


    $('inspect').addEventListener('click',inspectNative);$('sync').addEventListener('click',applyNative);$('exportMap').addEventListener('click',exportNativeMap);
    $('native').addEventListener('click',connectEA);
    $('connectEA').addEventListener('click',connectEA);
    $('exportConnection').addEventListener('click',()=>{
      const report=Page?state.pageConnection:Native?.connectionReport?.();
      if(!report){addLog(state.language==='ar'?'اضغط اتصل بسوق EA أولًا.':'Connect to EA Market first.','warning');return;}
      saveTextFile('CODEX_SNIPE_Connection.json',JSON.stringify({...report,optionAudit:state.lastPickerAudit||null},null,2),'application/json');
    });
    $('refreshNative').addEventListener('click',async()=>{
      try{if(state.pageMode){const snap=await Page.request('readFilters');mergePageSnapshot(snap);}}
      catch(e){addLog(e.message,'error');}
      inspectNative();compatibilityAudit();
    });
    for(const btn of shadow.querySelectorAll('[data-native-picker]'))btn.addEventListener('click',()=>showNativePicker(btn.dataset.nativePicker).catch(e=>{addLog(e.message,'error');$('pickerStatus').textContent=e.message;}));

    $('start').addEventListener('click',start);$('stop').addEventListener('click',()=>stop('تم الإيقاف يدويًا'));
    $('export').addEventListener('click',exportLogs);$('savePreset').addEventListener('click',presetSave);
    $('presets').addEventListener('change',()=>{const preset=state.presets[input('presets')];if(preset)void loadPreset(preset);});
    shadow.addEventListener('change',e=>{if(e.target.matches('input,select')&&!state.running)save();});
  }
  async function init(){
    if(!Core)console.warn('[CODEX SNIPE] missing engine core');
    if(!document.getElementById('gpts-v3-nav-style')){navStyle.id='gpts-v3-nav-style';document.head?.appendChild(navStyle);}
    createPortal();
    try{const stored=await Extension.storageGet(STORAGE);const config=stored[STORAGE]||{};state.presets=config.presets||{};state.cache=config.cache||[];state.logs=config.logs||[];state.selected=config.selected||null;state.selectedTargets=Array.isArray(config.selectedTargets)?config.selectedTargets:[];state.eventTargets=Array.isArray(config.eventTargets)?config.eventTargets:[];
      if(config.language==='en')setLanguage('en');
      state.priceControlsOpen=Boolean(config.priceControlsOpen);$('priceControls').open=state.priceControlsOpen;state.introHidden=Boolean(config.introHidden);applyIntroVisibility();state.panelLayout=config.panelLayout||null;restorePanelLayout();fillSettings(config.settings||{});populatePresets();updateSpeedControls();renderLogs();renderTargets();renderEvents();updateDatalists();}
    catch(e){addLog('تعذر قراءة الإعدادات المحلية: '+e.message,'warning');}
    updateSpeedControls();observeNav();refresh();timer=setInterval(refresh,200);
    const animate=()=>{if(state.open&&(state.running||state.scanning))paintSpeedGauge(state.nextIntervalMs);requestAnimationFrame(animate);};requestAnimationFrame(animate);
    window.addEventListener('pagehide',()=>{if(state.running)stop('صفحة EA اتقفلت أو اتحدثت');});
    addLog('واجهة CODEX SNIPE v3.9.4 جاهزة — بانتظار اكتشاف قائمة EA.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
