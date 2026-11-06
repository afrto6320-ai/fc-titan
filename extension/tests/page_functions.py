"""Chromium MAIN/ISOLATED boundary + selected methods from supplied EA source.

Scripts are installed into actual browser worlds using CDP. Chrome runtime/storage
are stubbed only in the isolated world; this does not validate extension installation.

Vendor source stays outside the extension. Pass FC_EA_SOURCE_DIR pointing to the
captured js directory; the test fails if that source is unavailable.
"""
from pathlib import Path
import json, os, base64
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent.parent
SOURCE=Path(os.environ.get('FC_EA_SOURCE_DIR', '/workspace/fc-captured-webapp/FC_WebApp_Archive_v3/assets/www.ea.com/ea-sports-fc/ultimate-team/web-app/js'))
source=(SOURCE/'compiled_3.js').read_text()
methods=['eSearchSelected','eFilterChanged','ePlayerNameChanged','eMinBidPriceChanged',
         'eMaxBidPriceChanged','eMinBuyPriceChanged','eMaxBuyPriceChanged']

def extract_method(name,text=source,owner='UTMarketSearchFiltersViewController'):
    prefix=owner+'.prototype.'+name+'=function'
    start=text.index(prefix)
    body=text.index('{',start)
    depth=0;quote=None;escaped=False
    for i in range(body,len(text)):
        char=text[i]
        if quote:
            if escaped: escaped=False
            elif char=='\\': escaped=True
            elif char==quote: quote=None
        elif char in "'\"`": quote=char
        elif char=='{': depth+=1
        elif char=='}':
            depth-=1
            if depth==0:return text[start:i+1]+';'
    raise AssertionError('Unterminated source method '+name)

contracts='\n'.join(extract_method(name) for name in methods)
contracts+='\n'+extract_method('bid',(SOURCE/'compiled_2.js').read_text(),'UTItemActionController')
contracts+='\n'+extract_method('move',(SOURCE/'compiled_2.js').read_text(),'UTItemActionController')
prefix=(ROOT/'tests/fixture33.html').read_text().split('<script>')[0]
html=prefix+'<script>'+(ROOT/'tests/ea_harness.js').read_text()+'\n'+contracts+'</script></body></html>'
URL='https://www.ea.com/ea-sports-fc/ultimate-team/web-app/'

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    context=browser.new_context(viewport={'width':1500,'height':1000},accept_downloads=True)
    context.route('https://www.ea.com/**',lambda route:route.fulfill(status=200,content_type='text/html',body=html) if route.request.url==URL else route.abort())
    page=context.new_page();errors=[]
    page.route('**/test-portraits/**',lambda route:route.fulfill(status=200,content_type='image/svg+xml',body='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="blue"/></svg>'))
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(URL)
    page.add_script_tag(content=(ROOT/'trade-core.js').read_text())
    page.add_script_tag(content=(ROOT/'ea-options.js').read_text())
    page.add_script_tag(content=(ROOT/'ea-page-bridge.js').read_text())
    cdp=context.new_cdp_session(page)
    frame=cdp.send('Page.getFrameTree')['frameTree']['frame']['id']
    world=cdp.send('Page.createIsolatedWorld',{'frameId':frame,'worldName':'gpts-test-extension'})['executionContextId']
    css='data:text/css;base64,'+base64.b64encode((ROOT/'embedded.css').read_bytes()).decode()
    stale={'name':'Mohamed Salah','rating':88,'itemId':50540979,'playerId':None,'source':'futgg','key':'item:50540979'}
    stored={'gpts_embedded_v3':{'selected':stale,'selectedTargets':[stale],'settings':{'player':'Mohamed Salah','itemId':'50540979'}}}
    shim='window.chrome={runtime:{getURL:()=>'+json.dumps(css)+',sendMessage:async()=>{throw Error("Unexpected external catalogue request")}},storage:{local:{get:async()=>('+json.dumps(stored)+'),set:async()=>{}}}};'
    shim+='window.__playedTones=0;const originalOscillator=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){window.__playedTones++;return originalOscillator.call(this);};'
    scripts=['price-providers.js','snipe-core.js','trade-core.js','ea-options.js','ea-page-client.js','native-market.js','embedded.js']
    loaded=cdp.send('Runtime.evaluate',{'contextId':world,'expression':shim+'\n'+'\n'.join((ROOT/name).read_text() for name in scripts)})
    assert 'exceptionDetails' not in loaded,loaded
    def request(command,args=None):
        expression='GPTPageClient.request('+json.dumps(command)+','+json.dumps(args or {})+').then(result=>({ok:true,result}),e=>({ok:false,code:e.code,message:e.message}))'
        result=cdp.send('Runtime.evaluate',{'contextId':world,'expression':expression,'awaitPromise':True,'returnByValue':True})
        assert 'exceptionDetails' not in result,result
        return result['result']['value']
    try:
        page.locator('#gpts-v3-nav').click(timeout=8000)
    except Exception:
        print('Extension diagnostics:',[w.url for w in context.service_workers],errors,
              page.evaluate('({bridge:typeof window.__GPT_EA_PAGE_BRIDGE_V1__, app:typeof getAppMain, title:document.title})'),flush=True)
        raise
    sh=page.locator('#gpts-v3-host')
    # Real Chrome isolated world: page cannot reach the isolated client.
    assert page.evaluate('typeof window.GPTPageClient')=='undefined'
    assert page.evaluate('window.__GPT_EA_PAGE_BRIDGE_V1__') is True
    sh.locator('#player').fill('moha')
    sh.locator('#playerResults .result .avatar img').first.wait_for()
    assert 'EA native' in sh.locator('#provider').inner_text()
    sh.locator('#maxBin').fill('1000');sh.locator('#maxSearches').fill('1')
    sh.locator('#start').click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#nativeConnectStatus').textContent.includes('PAGE FUNCTIONS')")
    assert page.locator('.ut-market-search-filters-view button').count()==0
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#playerSyncState').textContent.includes('ea-database-mask')")
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#searchCount').textContent==='1'")
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#runBadge').textContent.includes('STANDBY')")
    assert request('connect')['ok']
    assert page.evaluate('__nav.currentController.viewmodel.searchCriteria.maskedDefId')==209331
    assert sh.locator('#itemId').input_value()=='50540979'
    page.evaluate('window.__testSearches=0;window.__testCacheClears=0')
    sh.locator('#clearTargets').click()
    page.wait_for_function('__nav.currentController.viewmodel.searchCriteria.maskedDefId===0')
    print('PASS: catalogue 50540979 to EA 209331, prefix-only engine, one-click native connection and confirmation')
    print('PASS: actual Chromium isolated world; native navigation without a DOM Search button')

    sh.locator('[data-native-picker="league"]').click()
    sh.locator('.native-option').filter(has_text='LaLiga').click()
    page.wait_for_function('__nav.currentController.viewmodel.searchCriteria.league===53')
    sh.locator('[data-native-picker="club"]').click()
    sh.locator('.native-option').filter(has_text='Real Madrid').wait_for()
    assert sh.locator('.native-option').filter(has_text='Liverpool').count()==0
    sh.locator('.native-option').filter(has_text='Real Madrid').click()
    page.wait_for_function('__nav.currentController.viewmodel.searchCriteria.club===243')
    print('PASS: native option collections, selection handlers, dependent club choices')

    sh.locator('#player').fill('Salah')
    sh.locator('#playerResults .result .avatar img').first.wait_for()
    assert sh.locator('#playerResults .result .avatar img').first.get_attribute('src').endswith('/209331.svg')
    sh.locator('#playerResults .result').first.click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#playerSyncState').textContent.includes('209331')")
    assert page.evaluate('__nav.currentController.viewmodel.searchCriteria.maskedDefId')==209331
    assert sh.locator('#selectedTargets .target-chip').count()==1
    assert sh.locator('#itemId').input_value()==''
    scoped=request('options',{'kind':'event'})['result']
    assert scoped['meta']['scope']=='selected-player'
    assert [x['id'] for x in scoped['options']]==[-1,1,12]
    page.evaluate('window.__conceptFn=services.Item.searchConceptItems;services.Item.searchConceptItems=undefined')
    assert request('options',{'kind':'event','refresh':True})['code']=='EDITIONS_UNAVAILABLE'
    page.evaluate('()=>{services.Item.searchConceptItems=window.__conceptFn;}')
    sh.locator('[data-native-picker="event"]').click()
    sh.locator('.native-option').filter(has_text='Icon').wait_for()
    assert sh.locator('.native-option').filter(has_text='Unrelated event').count()==0
    sh.locator('.native-option').filter(has_text='Icon').click()
    page.wait_for_function('__nav.currentController.viewmodel.searchCriteria.rarities[0]===12')
    print('PASS: native local player lookup, exact base-player ID, separate rarity selection')

    sh.locator('#maxBin').fill('1000');sh.locator('#maxSearches').fill('2')
    sh.locator('#sync').click()
    page.wait_for_function('window.__nativeMaxBin===1000')
    sh.locator('#start').click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#searchCount').textContent==='1'")
    offset=sh.locator('#cycleRing').evaluate('(e)=>e.style.strokeDashoffset')
    page.wait_for_function('(old)=>document.querySelector("#gpts-v3-host").shadowRoot.querySelector("#cycleRing").style.strokeDashoffset!==old',arg=offset)
    page.wait_for_function('window.__testSearches===2',timeout=12000)
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#runBadge').textContent.includes('STANDBY')")
    assert page.evaluate('window.__testCacheClears')==4
    assert page.evaluate('__testObservers.size')==0
    assert sh.locator('#searchCount').inner_text()=='2'
    print('PASS: source-derived native search and price handlers, fresh empty responses, repeat search')

    # Export reports contain only the whitelisted snapshot, never the full user object.
    with page.expect_download() as dl: sh.locator('#exportConnection').click()
    report=Path(dl.value.path()).read_text()
    assert json.loads(report)['mode']=='page-functions'
    assert 'PRIVATE-SENTINEL' not in report
    print('PASS: native connection report export and data minimization')

    # Stop while an EA request is in flight: detach listener, count no unconfirmed result.
    page.evaluate('window.__testDelay=1800;window.__testSearches=0')
    sh.locator('#start').click()
    page.wait_for_function('window.__testSearches===1')
    sh.locator('#stop').click()
    page.wait_for_timeout(2300)
    assert page.evaluate('window.__testSearches')==1
    assert page.evaluate('__testObservers.size')==0
    assert sh.locator('#searchCount').inner_text()=='0'
    print('PASS: Stop detaches native pending result and prevents another search')

    # A real result event is serialized, checked and produces an alert without a purchase.
    page.evaluate("window.__testDelay=50;window.__testSearches=0;resetTrade('alert-trade')")
    sh.locator('#start').click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#matchCount').textContent==='1'")
    assert sh.locator('#buyCount').inner_text()=='0'
    assert '50540979' in sh.locator('#nativeOffers').inner_text()
    assert page.evaluate('__testSearches')==1
    print('PASS: authoritative native result ID/rarity/price, matching alert, zero purchases')

    # Native buy uses the original object/action contract, without a DOM row or general popup.
    dialogs=[];approve=[False]
    def dialog_handler(dialog):
        dialogs.append(dialog.message)
        dialog.accept() if approve[0] else dialog.dismiss()
    page.on('dialog',dialog_handler)
    page.evaluate("resetTrade('native-buy-1');window.__bidScenario='won'")
    sh.locator('#autoBuy').check();sh.locator('#maxBuys').fill('1')
    sh.locator('#start').click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#buyCount').textContent==='1'")
    assert page.evaluate('__bidCalls')==1 and page.evaluate('__lastBidItem===__testItems[0]')
    assert sh.locator('#spent').inner_text()=='900' and not dialogs
    audio_check=cdp.send('Runtime.evaluate',{'contextId':world,'expression':'window.__playedTones','returnByValue':True})
    assert audio_check['result']['value']>=4
    assert 'already pending' not in sh.locator('#playerResults').inner_text()
    sh.locator('#shell').evaluate('(e)=>e.scrollTop=0')
    page.screenshot(path='/tmp/CODEX_SNIPE_v3.5.0_gauge.png')
    print('PASS: native action-controller bid with exact EA object, confirmed isWon receipt, no general warning')

    page.evaluate("resetTrade('loss-declined')")
    page.evaluate('window.__testAverage=700');sh.locator('#start').click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#sessionStatus').textContent.includes('الخسارة')")
    assert len(dialogs)==1 and page.evaluate('__bidCalls')==1
    assert sh.locator('#buyCount').inner_text()=='0'
    approve[0]=True;page.evaluate("resetTrade('loss-approved')")
    sh.locator('#start').click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#buyCount').textContent==='1'")
    assert len(dialogs)==2 and page.evaluate('__bidCalls')==2
    print('PASS: >10% after-tax loss confirmation only, declined purchase sends no bid, accepted risk matches the same trade')

    # An already-dispatched purchase completes after Stop and must still be accounted once.
    page.evaluate('window.__testAverage=null');page.evaluate("resetTrade('stopped-purchase');window.__bidDelay=1300")
    sh.locator('#start').click();page.wait_for_function('__bidCalls===3')
    sh.locator('#stop').click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#buyCount').textContent==='1'")
    frozen=sh.locator('#time').inner_text();page.wait_for_timeout(700)
    assert sh.locator('#time').inner_text()==frozen and sh.locator('#spent').inner_text()=='900'
    assert page.evaluate('__bidCalls')==3
    print('PASS: Stop freezes runtime, prevents new buys and records the in-flight confirmed receipt once')
    sh.locator('#autoBuy').uncheck();page.evaluate('window.__bidDelay=30')

    # Server-side identity/price/cap checks must reject before a native bid.
    snap=request('connect')['result']['snapshot']
    assert request('beginSession',{'criteriaKey':snap['criteriaKey'],'maxPrice':1000,'maxSpend':500,'maxBuys':1})['code']=='BAD_ARGUMENT'
    page.evaluate("resetTrade('limit-check')")
    limited=request('beginSession',{'criteriaKey':snap['criteriaKey'],'maxPrice':850,'maxSpend':1000,'maxBuys':1,'autoBuy':True})['result']['sessionId']
    result=request('search',{'maxBin':1000,'criteriaKey':snap['criteriaKey']})['result']
    args={'sessionId':limited,'searchId':result['searchId'],'tradeId':'limit-check','instanceId':'123456','expectedPrice':900}
    assert request('buy',args)['code']=='LIMIT'
    assert request('buy',{**args,'expectedPrice':901})['code']=='PRICE_MISMATCH'
    assert request('buy',{**args,'tradeId':'foreign-trade'})['code']=='LISTING_MISMATCH'
    assert request('buy',{**args,'instanceId':'wrong-instance'})['code']=='PRICE_MISMATCH'
    assert page.evaluate('__bidCalls')==3
    print('PASS: native budget, price and listing guards reject without dispatching a bid')

    page.evaluate("resetTrade('lost-race');window.__bidScenario='expired'")
    sh.locator('#autoBuy').check();sh.locator('#maxSearches').fill('1');sh.locator('#start').click()
    try:
        page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#misses').textContent==='1'",timeout=8000)
    except Exception:
        print('Lost-auction diagnostics:',sh.locator('#logs').inner_text(),page.evaluate('({calls:__bidCalls,scenario:__bidScenario})'),flush=True)
        raise
    assert sh.locator('#buyCount').inner_text()=='0' and sh.locator('#spent').inner_text()=='0'
    sh.locator('#autoBuy').uncheck();page.evaluate("window.__bidScenario='won'")
    assert sh.locator('.outcome-toast.missed').count()==1
    assert sh.locator('.outcome-toast.missed').evaluate('(e)=>getComputedStyle(e).animationName')=='toast-fade'
    print('PASS: lost auction counts as a miss, shows a distinct missed toast, and never counts as a purchase')

    snap=request('connect')['result']['snapshot']
    retry_session=request('beginSession',{'criteriaKey':snap['criteriaKey'],'maxPrice':1000,'maxSpend':10000,'maxBuys':1,'autoBuy':True})['result']['sessionId']
    result=request('search',{'maxBin':1000,'criteriaKey':snap['criteriaKey']})['result']
    before=page.evaluate('__bidCalls')
    repeated=request('buy',{'sessionId':retry_session,'searchId':result['searchId'],'tradeId':'lost-race','instanceId':'123456','expectedPrice':900})
    assert repeated['result']['status']=='already-attempted' and page.evaluate('__bidCalls')==before
    request('cancel')
    print('PASS: the same previously attempted Trade ID is skipped across sessions without dispatching or counting a second bid')

    assert request('connect')['ok']
    assert not request('constructor')['ok']
    assert request('applyPrices',{'maxBin':-10})['code']=='BAD_ARGUMENT'
    snap=request('readFilters')['result']
    assert request('search',{'maxBin':1001,'criteriaKey':snap['criteriaKey']})['code']=='PRICE_MISMATCH'
    assert request('search',{'maxBin':1000,'criteriaKey':'stale'})['code']=='FILTER_MISMATCH'
    assert request('selectPlayer',{'id':999999,'query':'Salah'})['code']=='PLAYER_MISMATCH'
    # Player locks the native league filter; no forced override is performed.
    opts=request('options',{'kind':'league'})['result']
    assert request('choose',{'token':opts['token'],'index':1})['code']=='FILTER_LOCKED'
    assert request('clearPlayer')['ok']
    opts=request('options',{'kind':'club'})['result']
    page.evaluate('__nav.currentController.viewmodel.searchCriteria.league=13')
    assert request('choose',{'token':opts['token'],'index':1})['code']=='STALE_OPTIONS'
    print('PASS: fixed command allowlist, price/player/fingerprint validation, native locks, stale options')

    # Reproduce reported club duplicates, unresolved translation keys and failed badges.
    def badge(route):
        if 'fallback' in route.request.url:
            route.fulfill(status=200,content_type='image/svg+xml',body='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="24" height="24" fill="green"/></svg>')
        else: route.fulfill(status=404,body='')
    page.route('**/test-badges/**',badge)
    page.evaluate('''(() => {
      const view=__nav.currentController.getView(),fields=view.getFilters(),ctrl=fields.searchFilters.get(enums.UISearchFilters.CLUB);
      window.__badgeOptions=[{id:-1,value:'-1',label:'Any'},
        {id:9,value:'9',label:'Same Club'},{id:9,value:'9',label:'Same Club'},
        {id:10,value:'10',label:'Same Club'},{id:99,value:'99',label:'*global.teamabbr15.2027.team99'}];
      ctrl.getOptions=()=>window.__badgeOptions.slice();ctrl.index=0;
      ctrl.iconTable=new Map([['9','/test-badges/missing.png'],['10','/test-badges/also-missing.png']]);
      view.getFilters=()=>({...fields,generateFilterImage:(kind,id)=>id===9?'/test-badges/fallback.svg':''});
    })()''')
    sh.locator('[data-native-picker="club"]').click()
    sh.locator('.native-option-group summary').wait_for()
    assert sh.locator('#nativePickerResults').inner_text().count('Same Club')==1
    sh.locator('.native-option-group summary').click()
    sh.locator('.native-option[data-ea-id="9"]').wait_for()
    assert sh.locator('.native-option[data-ea-id="9"]').count()==1
    assert sh.locator('.native-option[data-ea-id="10"]').count()==1
    assert sh.locator('.native-option[data-ea-id="99"]').count()==0
    assert '1 duplicates removed' in sh.locator('#pickerStatus').inner_text() or '1 مكرر' in sh.locator('#pickerStatus').inner_text()
    sh.locator('.native-option[data-ea-id="9"][data-image-state="loaded"]').wait_for()
    sh.locator('.native-option[data-ea-id="10"][data-image-state="unavailable"]').wait_for()
    assert sh.locator('.native-option[data-ea-id="10"] img').count()==0
    sh.locator('#showUnresolvedOptions').check()
    sh.locator('.native-option[data-ea-id="99"]').wait_for()
    assert 'global.teamabbr' not in sh.locator('#nativePickerResults').inner_text()
    page.screenshot(path='/tmp/CODEX_SNIPE_3.4.2_club_groups.png')
    sh.locator('.native-option-filter').fill('10')
    assert sh.locator('.native-option').count()==1
    sh.locator('.native-option').click()
    page.wait_for_function('__nav.currentController.viewmodel.searchCriteria.club===10')
    sh.locator('#compatPanel summary').click()
    sh.locator('#runDiag').click()
    result_check=sh.locator('.audit-row').filter(has_text='Result list container')
    assert 'fail' not in (result_check.get_attribute('class') or '')
    assert sh.locator('h1').inner_text()=='CODEX SNIPE'
    print('PASS: duplicate IDs removed, distinct clubs retained, missing names disclosed, native badge fallback, correct ID selected, branding')

    # A fresh scan gathers native pages, omits overfetch sentinels, and does not buy.
    sh.locator('#resultsCount').fill('37')
    page.evaluate("""(() => {
      const template=resetTrade('pagination-base');
      const rows=Array.from({length:45},(_,i)=>({...template,id:123456+i,getAuctionData:()=>({tradeId:'page-trade-'+i,buyNowPrice:1000-i*10})}));
      window.__testPages=[rows.slice(0,21),rows.slice(20,41),rows.slice(40)];window.__testPageRequests=[];window.__testDelay=400;
    })()""")
    before=page.evaluate('({cache:__testCacheClears,bids:__bidCalls})')
    sh.locator('#scanMarket').click()
    offset=sh.locator('#cycleRing').evaluate('(e)=>e.style.strokeDashoffset')
    page.wait_for_function('(old)=>document.querySelector("#gpts-v3-host").shadowRoot.querySelector("#cycleRing").style.strokeDashoffset!==old',arg=offset)
    sh.locator('.market-card').nth(36).wait_for()
    assert sh.locator('.market-card').count()==37
    assert sh.locator('#lowestPriceValue').inner_text()=='640 Coins'
    assert page.evaluate('__testPageRequests')==[1,2]
    assert page.evaluate('__testCacheClears')==before['cache']+3 and page.evaluate('__bidCalls')==before['bids']
    assert '37/37' in sh.locator('#marketResponse').inner_text()
    assert 'market-full' not in sh.locator('#marketPanel').get_attribute('class')
    sh.locator('#marketFull').click()
    assert 'market-full' in sh.locator('#marketPanel').get_attribute('class')
    assert sh.locator('.market-card').first.locator('.market-portrait img').count()==1
    assert sh.locator('.market-card[data-trade-id="page-trade-20"]').count()==1
    page.screenshot(path='/tmp/CODEX_SNIPE_v3.7.0_market_full.png')
    sh.locator('#marketFull').click()
    old_response=sh.locator('#marketResponse').inner_text()
    sh.locator('#scanMarket').click()
    page.wait_for_function('(old)=>{const s=document.querySelector("#gpts-v3-host").shadowRoot;return !s.querySelector("#resultsCount").disabled&&s.querySelector("#marketResponse").textContent!==old;}',arg=old_response)
    assert sh.locator('.market-card').count()==37
    assert 'نفس العروض' in sh.locator('#marketResponse').inner_text()
    page.evaluate('window.__testPages=[[]]')
    sh.locator('#scanMarket').click()
    page.wait_for_function("()=>{const s=document.querySelector('#gpts-v3-host').shadowRoot;return !s.querySelector('#resultsCount').disabled&&s.querySelector('#marketResponse').textContent.includes('0/37');}")
    assert sh.locator('.market-card').count()==0 and sh.locator('#lowestPriceValue').inner_text()=='—'
    assert 'لا توجد عروض' in sh.locator('#nativeOffers').inner_text()
    # Change filters while the native controller is the result screen.
    sh.locator('[data-native-picker="quality"]').click();sh.locator('.native-option').filter(has_text='Gold').wait_for()
    assert page.evaluate('__nav.currentController instanceof UTMarketSearchFiltersViewController')
    print('PASS: manual scan makes fresh requests, paginates 37 real rows, deduplicates sentinel, updates minimum, reports repeated offers, clears on empty, reconnects pickers')

    # Cancel during native pagination: no partial batch is exposed as a completed scan.
    sh.locator('#resultsCount').fill('100')
    page.evaluate("""(() => {
      const item=resetTrade('cancel-page');
      const rows=Array.from({length:41},(_,i)=>({...item,id:123456+i,getAuctionData:()=>({tradeId:'cancel-page-'+i,buyNowPrice:900})}));
      window.__testPages=[rows.slice(0,21),rows.slice(20,41),rows.slice(40)];window.__testPageRequests=[];window.__testDelay=500;
    })()""")
    sh.locator('#scanMarket').click();page.wait_for_function('__testPageRequests.includes(2)');sh.locator('#stop').click();page.wait_for_timeout(700)
    assert sh.locator('.market-card').count()==0 and sh.locator('#lowestPriceValue').inner_text()=='—'
    assert page.evaluate('__testPageRequests')==[1,2] and page.evaluate('__testObservers.size')==0
    sh.locator('#resultsCount').fill('20')
    print('PASS: Stop during pagination detaches the observer, clears partial results and prevents the next page')

    # Selected external source drives the cap; the native Max Buy Now remains a hard ceiling.
    page.evaluate('window.__testPages=undefined;window.__testDelay=50;window.__testItems=[]')
    mock_prices="""window.__priceCalls=[];chrome.runtime.sendMessage=async m=>{window.__priceCalls.push(m);if(window.__priceFail)return {ok:false,error:'provider unavailable test'};const p=m.payload;return {ok:true,result:{quotes:[{provider:p.provider,platform:p.platform,itemId:p.ids[0],price:1200,retrievedAt:Date.now(),providerUpdatedAt:null}]}};};"""
    cdp.send('Runtime.evaluate',{'contextId':world,'expression':mock_prices})
    sh.locator('#loadEditions').click();sh.locator('#priceEdition option[value="50540979"]').wait_for(state='attached')
    sh.locator('#priceEdition').select_option('50540979');page.wait_for_function("()=>!document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#priceEdition').disabled");sh.locator('#priceSource').select_option('futbin');sh.locator('#pricePlatform').select_option('pc');sh.locator('#pricePercent').fill('75')
    sh.locator('#maxSearches').fill('1');sh.locator('#start').click()
    page.wait_for_function('window.__nativeMaxBin===900')
    page.wait_for_function("()=>!document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#start').disabled")
    assert 'FUTBIN' in sh.locator('#quoteBox').inner_text() and '1,200' in sh.locator('#quoteBox').inner_text()
    assert sh.locator('#maxBin').input_value()=='1000'
    baseline=page.evaluate('__testSearches')
    cdp.send('Runtime.evaluate',{'contextId':world,'expression':'window.__priceFail=true'})
    sh.locator('#start').click();page.wait_for_timeout(250)
    assert page.evaluate('__testSearches')==baseline
    assert 'provider unavailable test' in sh.locator('#logs').inner_text()
    cdp.send('Runtime.evaluate',{'contextId':world,'expression':'window.__priceFail=false'})
    sh.locator('#priceSource').select_option('manual');sh.locator('#itemId').fill('');sh.locator('#pricePercent').fill('100')
    print('PASS: exact-edition/PC provider quote sets effective search cap, manual Max Buy Now stays intact, provider failure prevents starting')

    # MAIN rejects stale/wrong-edition quotes and limits renewed quotes to the hard Max Buy Now.
    snap=request('connect')['result']['snapshot']
    fresh_quote={'provider':'futbin','platform':'pc','itemId':50540979,'price':1200,'retrievedAt':page.evaluate('Date.now()')}
    session_args={'criteriaKey':snap['criteriaKey'],'maxPrice':900,'hardMaxPrice':1000,'maxSpend':10000,'maxBuys':1,'autoBuy':True,'itemId':50540979,'referenceQuote':fresh_quote,'referencePrice':1200}
    assert request('beginSession',{**session_args,'referenceQuote':{**fresh_quote,'retrievedAt':fresh_quote['retrievedAt']-100000}})['code']=='QUOTE_STALE'
    session_id=request('beginSession',session_args)['result']['sessionId']
    assert request('updateQuote',{'sessionId':session_id,'quote':fresh_quote,'maxPrice':1100})['code']=='LIMIT'
    assert request('updateQuote',{'sessionId':session_id,'quote':{**fresh_quote,'platform':'console'},'maxPrice':900})['code']=='QUOTE_STALE'
    assert request('updateQuote',{'sessionId':session_id,'quote':{**fresh_quote,'itemId':209331},'maxPrice':900})['code']=='QUOTE_STALE'
    assert request('updateQuote',{'sessionId':session_id,'quote':fresh_quote,'maxPrice':950})['ok']
    request('cancel')
    print('PASS: MAIN quote freshness, exact edition/platform and immutable hard price ceiling on renewal')

    # Native post-purchase moves preserve the confirmed receipt on failure.
    for destination,failed in [('club',False),('transfer',False),('club',True),('leave',False)]:
        page.evaluate("""([destination,failed])=>{resetTrade('move-'+destination+'-'+failed);window.__bidScenario='won';window.__moveFailed=failed;}""",[destination,failed])
        before=page.evaluate('({bids:__bidCalls,moves:__moveCalls})')
        sh.locator('#postPurchase').select_option(destination);sh.locator('#autoBuy').check();sh.locator('#start').click()
        page.wait_for_function("()=>{const s=document.querySelector('#gpts-v3-host').shadowRoot;return s.querySelector('#buyCount').textContent==='1'&&!s.querySelector('#start').disabled;}")
        assert page.evaluate('__bidCalls')==before['bids']+1 and sh.locator('#spent').inner_text()=='900'
        assert page.evaluate('__moveCalls')==before['moves']+(0 if destination=='leave' else 1)
        if destination!='leave':assert page.evaluate('__lastMovePile')==({'club':1,'transfer':2}[destination])
        if failed:assert 'النقل لم يتأكد' in sh.locator('#logs').inner_text()
    sh.locator('#postPurchase').select_option('leave');sh.locator('#autoBuy').uncheck()
    print('PASS: original EA action move sends confirmed item to Club/Transfer List, leave performs no move, failed move never retries or erases purchase')

    # Repeated clicks queue one fresh scan, never overlap requests or append prior cards.
    sh.locator('#autoBuy').uncheck();sh.locator('#resultsCount').fill('20')
    page.evaluate("window.__testItems=[];window.__testPages=undefined;window.__testDelay=350;window.__requestsMax=0;window.__searchedPlayers=[]")
    before=page.evaluate('__testSearches')
    sh.locator('#scanMarket').click();sh.locator('#scanMarket').click();sh.locator('#scanMarket').click();sh.locator('#scanMarket').click()
    page.wait_for_function('(before)=>__testSearches===before+2',arg=before)
    page.wait_for_function("()=>!document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#resultsCount').disabled")
    assert page.evaluate('__requestsMax')==1 and sh.locator('.market-card').count()==0
    assert 'market-full' not in sh.locator('#marketPanel').get_attribute('class')
    assert page.evaluate('__nativeMinBid')==0 and page.evaluate('__nativeMaxBid===0||__nativeMaxBid>=__nativeMaxBin')
    assert sh.locator('#maxBid').input_value()==''
    print('PASS: rapid clicks coalesce to one additional fresh request, no overlap, no bid-filter mutation, no stale card accumulation')

    # Stable workspace layout, positions and pinned multi-player cards.
    assert sh.locator('[data-panel-key="players"] #transferSection #priceSource').count()==1
    assert sh.locator('.column.right > [data-panel-key="logs"] + [data-panel-key="connection"]').count()==1
    sh.locator('#editLayout').click()
    original_cap=sh.locator('#maxBin').input_value()
    sh.locator('[data-panel-key="stats"] > .panel-head [data-move="column"]').click()
    assert sh.locator('.column.control > [data-panel-key="stats"]').count()==1
    sh.locator('#resetLayout').click()
    assert sh.locator('.column.right > [data-panel-key="stats"]').count()==1 and sh.locator('#maxBin').input_value()==original_cap
    sh.locator('#editLayout').click()
    sh.locator('#addPlayer').click()
    page.evaluate('window.__duplicatePlayers=true')
    sh.locator('#player').fill('Salah');sh.locator('#playerResults .result').first.wait_for()
    assert sh.locator('#playerResults .result').count()==1 and 'RW' in sh.locator('#playerResults .result').first.inner_text()
    page.evaluate('window.__duplicatePlayers=false')
    sh.locator('#player').fill('son');sh.locator('#playerResults .result').filter(has_text='Son Heungmin').wait_for()
    sh.locator('#playerResults .result').filter(has_text='Son Heungmin').click()
    page.wait_for_function("__nav.currentController.viewmodel.searchCriteria.maskedDefId===200104")
    assert sh.locator('#selectedTargets .selected-card').count()==2 and sh.locator('#playerSearchDrawer').is_hidden()
    assert sh.locator('.selected-card[data-player-id="200104"] img').count()==1
    assert 'LW' in sh.locator('.selected-card[data-player-id="200104"]').inner_text()
    sh.locator('.selected-card[data-player-id="209331"] .target-card-select').click()
    page.wait_for_function("()=>{const s=document.querySelector('#gpts-v3-host').shadowRoot;return !s.querySelector('#start').disabled&&__nav.currentController.viewmodel?.searchCriteria.maskedDefId===209331;}")
    assert page.evaluate('__nav.currentController.viewmodel.searchCriteria.rarities')==[12]
    sh.locator('.selected-card[data-player-id="200104"] .target-card-select').click()
    page.wait_for_function("()=>!document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#start').disabled&&__nav.currentController.viewmodel?.searchCriteria.maskedDefId===200104")
    assert page.evaluate('__nav.currentController.viewmodel.searchCriteria.rarities')==[]
    sh.locator('#shell').evaluate('(e)=>e.scrollTop=0')
    page.screenshot(path='/tmp/CODEX_SNIPE_v3.8.0_targets.png')
    print('PASS: combined player/transfer panels, pricing placement, connection below logs, reversible panel ordering, native positions, duplicate player IDs removed, pinned cards and collapsed picker')

    # A two-player run preserves a single budget ledger. A second 900 purchase cannot fit 1500 total.
    page.evaluate('window.__autoTargetOffers=true;window.__searchedPlayers=[];window.__testDelay=120;window.__testItems=[]')
    sh.locator('#speedPreset').select_option('custom');sh.locator('#speedMin').fill('0.6');sh.locator('#speedMax').fill('0.6')
    sh.locator('#maxSearches').fill('4');sh.locator('#maxBuys').fill('2');sh.locator('#budget').fill('1500');sh.locator('#autoBuy').check()
    calls=page.evaluate('__bidCalls');sh.locator('#start').click()
    page.wait_for_function("()=>document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#searchCount').textContent==='1'")
    cdp.send('Runtime.evaluate',{'contextId':world,'expression':'window.__savedTradeHelper=window.CodexTradeCore;delete window.CodexTradeCore;'})
    page.wait_for_timeout(250)
    assert len(sh.locator('#time').inner_text().split(':'))==3 and sh.locator('#cyclePhase').inner_text()!='—'
    angle=sh.locator('#gaugeRotor').evaluate('(e)=>getComputedStyle(e).transform')
    page.wait_for_function('(angle)=>getComputedStyle(document.querySelector("#gpts-v3-host").shadowRoot.querySelector("#gaugeRotor")).transform!==angle',arg=angle)
    page.wait_for_function("()=>{const s=document.querySelector('#gpts-v3-host').shadowRoot;return s.querySelector('#searchCount').textContent==='4'&&!s.querySelector('#start').disabled;}",timeout=12000)
    cdp.send('Runtime.evaluate',{'contextId':world,'expression':'window.CodexTradeCore=window.__savedTradeHelper;'})
    assert page.evaluate('__searchedPlayers')==[209331,200104,209331,200104]
    assert page.evaluate('__bidCalls')==calls+1 and sh.locator('#buyCount').inner_text()=='1' and sh.locator('#spent').inner_text()=='900'
    assert sh.locator('#gaugeRotor').evaluate('(e)=>e.style.animationPlayState')=='paused'
    # With enough budget both players can be purchased, still in one session.
    page.evaluate('window.__searchedPlayers=[]')
    sh.locator('#budget').fill('2000');sh.locator('#maxSearches').fill('2');calls=page.evaluate('__bidCalls');sh.locator('#start').click()
    page.wait_for_function("()=>{const s=document.querySelector('#gpts-v3-host').shadowRoot;return s.querySelector('#buyCount').textContent==='2'&&!s.querySelector('#start').disabled;}",timeout=12000)
    assert page.evaluate('__searchedPlayers')==[209331,200104] and page.evaluate('__bidCalls')==calls+2
    assert sh.locator('#spent').inner_text()=='1,800' and sh.locator('.outcome-toast.won').count()>=1
    assert 'LW' in sh.locator('.market-card').first.inner_text()
    print('PASS: native round-robin target selection, exact ID/rarity checks, one budget/purchase ledger across players, rotor animates during run and pauses at stop, confirmed-purchase toasts')
    page.evaluate('window.__autoTargetOffers=false;window.__testDelay=50')
    sh.locator('.selected-card[data-player-id="200104"] > .target-remove').click()
    page.wait_for_function('__nav.currentController.viewmodel?.searchCriteria.maskedDefId===209331')
    assert sh.locator('.selected-card').count()==1
    sh.locator('#maxBuys').fill('1');sh.locator('#maxSearches').fill('1');sh.locator('#budget').fill('10000')

    # Ladder sends six distinct bid constraints while preserving the purchase ceiling and native filters.
    sh.locator('#autoBuy').uncheck();sh.locator('#maxBin').fill('1500');sh.locator('#bidLadderCeiling').fill('1900');sh.locator('#bidLadder').select_option('max')
    page.evaluate('window.__testItems=[];window.__sentMaxBids=[];window.__sentMinBids=[]')
    for _ in range(6):
        sh.locator('#scanMarket').click()
        page.wait_for_function("()=>!document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#resultsCount').disabled")
    assert page.evaluate('__sentMaxBids')==[1500,1600,1700,1800,1900,0]
    assert page.evaluate('__sentMinBids')==[0]*6 and page.evaluate('__nativeMaxBin')==1500
    assert sh.locator('#maxBid').input_value()==''
    sh.locator('#bidLadder').select_option('off');sh.locator('#scanMarket').click()
    page.wait_for_function("()=>!document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#resultsCount').disabled")
    assert page.evaluate('__sentMaxBids.at(-1)')==0
    sh.locator('#bidLadderCeiling').fill('200000');sh.locator('#bidLadder').select_option('max');page.evaluate('window.__sentMaxBids=[]')
    for _ in range(7):
        sh.locator('#scanMarket').click();page.wait_for_function("()=>!document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#resultsCount').disabled")
    assert page.evaluate('__sentMaxBids')==[1500,1600,1700,1800,1900,2000,2100]
    sh.locator('#bidLadder').select_option('off')
    print('PASS: short and 200k native Max Bid ladders, no premature wrap, fixed Min Bid and Buy Now ceiling, reversible fixed-bid mode')

    # A layout wrapper may change while the actual native results controller stays the same.
    page.evaluate("resetTrade('same-inner-controller');window.__testDelay=350")
    sh.locator('#scanMarket').click()
    page.wait_for_function('__nav.currentController instanceof UTMarketSearchResultsSplitViewController')
    page.evaluate('__nav.currentController=__nav.currentController._listController')
    sh.locator('.market-card[data-trade-id="same-inner-controller"]').wait_for()
    assert 'RW' in sh.locator('.market-card').first.inner_text()
    assert sh.locator('.market-position').first.inner_text()=='RW'
    print('PASS: same native result controller survives wrapper changes without a false VIEW_CHANGED error')

    # An awaited navigation command cannot pop a running search; cancellation stops a pending navigation too.
    page.evaluate('__nav.isTransitioning=true')
    cdp.send('Runtime.evaluate',{'contextId':world,'expression':"window.__pendingNav=GPTPageClient.request('connect').then(r=>({ok:true}),e=>({ok:false,code:e.code}));"})
    page.wait_for_timeout(100)
    assert request('status')['result']['busy'] is True
    assert request('search',{'maxBin':1500,'criteriaKey':'unused'})['code']=='BUSY'
    request('cancel')
    pending=cdp.send('Runtime.evaluate',{'contextId':world,'expression':'window.__pendingNav','awaitPromise':True,'returnByValue':True})
    assert pending['result']['value']['code']=='CANCELLED'
    page.evaluate('__nav.isTransitioning=false')
    assert request('connect')['ok']
    # A genuine Back/navigation is still rejected and never turns old rows into new results.
    sh.locator('#scanMarket').click();page.wait_for_function('__nav.currentController instanceof UTMarketSearchResultsSplitViewController')
    page.evaluate('__nav.popToViewController(__nav.childViewControllers.find(c=>c instanceof UTMarketSearchFiltersViewController))')
    page.wait_for_function("()=>!document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#resultsCount').disabled")
    assert sh.locator('.market-card').count()==0 and 'EA closed or changed' in sh.locator('#marketResponse').inner_text()
    page.wait_for_timeout(400);page.evaluate('window.__testDelay=50;window.__testItems=[]')
    print('PASS: native operation lock prevents overlapping navigation/search, cancellation stops pending navigation, real view changes clear current rows')

    # Hide intro reclaims vertical space; presets restore native filter IDs and targets, not just labels.
    sh.locator('#shell').evaluate('(e)=>e.scrollTop=0')
    old_y=sh.locator('.layout').evaluate('(e)=>e.offsetTop')
    sh.locator('#toggleIntro').click()
    assert sh.locator('.intro').is_hidden()
    new_y=sh.locator('.layout').evaluate('(e)=>e.offsetTop')
    assert new_y<old_y
    sh.locator('#toggleIntro').click();assert sh.locator('.intro').is_visible()
    page.remove_listener('dialog',dialog_handler)
    page.once('dialog',lambda d:d.accept('Native saved filter'))
    sh.locator('#maxBin').fill('1000');sh.locator('#saveFilterTop').click()
    sh.locator('#presets option[value="Native saved filter"]').wait_for(state='attached')
    page.on('dialog',dialog_handler)
    sh.locator('#clearTargets').click();page.wait_for_function('__nav.currentController.viewmodel?.searchCriteria.maskedDefId===0')
    sh.locator('#maxBin').fill('700');sh.locator('#presets').select_option('Native saved filter')
    page.wait_for_function("()=>{const s=document.querySelector('#gpts-v3-host').shadowRoot;return !s.querySelector('#start').disabled&&__nav.currentController.viewmodel?.searchCriteria.maskedDefId===209331;}")
    assert sh.locator('#maxBin').input_value()=='1000' and page.evaluate('__nativeMaxBin')==1000
    assert page.evaluate('__nav.currentController.viewmodel.searchCriteria.rarities')==[12]
    assert sh.locator('.selected-card').count()==1 and sh.locator('#playerSearchDrawer').is_hidden()
    # The same save action must restore generic GK/nation filters with no selected player.
    sh.locator('#clearTargets').click();page.wait_for_function('__nav.currentController.viewmodel?.searchCriteria.maskedDefId===0')
    sh.locator('[data-native-picker="position"]').click();sh.locator('.native-option').filter(has_text='GK').click()
    sh.locator('[data-native-picker="nation"]').click();sh.locator('.native-option').filter(has_text='Spain').click()
    page.remove_listener('dialog',dialog_handler);page.once('dialog',lambda d:d.accept('Spanish keepers'))
    sh.locator('#saveFilterTop').click();sh.locator('#presets option[value="Spanish keepers"]').wait_for(state='attached')
    page.on('dialog',dialog_handler)
    sh.locator('[data-native-picker="position"]').click();sh.locator('.native-option').filter(has_text='Any position').click()
    sh.locator('[data-native-picker="nation"]').click();sh.locator('.native-option').filter(has_text='Any nation').click()
    sh.locator('#presets').select_option('Spanish keepers')
    page.wait_for_function("()=>!document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#start').disabled&&__nav.currentController.viewmodel?.searchCriteria.nation===45")
    assert page.evaluate('__nav.currentController.viewmodel.searchCriteria.position')=='GK'
    assert sh.locator('.selected-card').count()==0 and sh.locator('#maxBin').input_value()=='1000'
    sh.locator('#presets').select_option('Native saved filter')
    page.wait_for_function("()=>!document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#start').disabled&&__nav.currentController.viewmodel?.searchCriteria.maskedDefId===209331")
    badge=sh.locator('.selected-portrait .position-badge').first.bounding_box();rating=sh.locator('.selected-portrait > b').first.bounding_box()
    assert badge['y']>rating['y'] and abs(badge['x']-rating['x'])<20
    sh.locator('#shell').evaluate('(e)=>e.scrollTop=800');sh.locator('#scrollTop').wait_for();sh.locator('#scrollTop').click()
    page.wait_for_function("()=>document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#shell').scrollTop<5")
    page.screenshot(path='/tmp/CODEX_SNIPE_v3.8.0_compact.png')
    print('PASS: intro toggle reclaims space, header filter save/load restores native IDs/player/prices, card position sits under rating, floating Top scrolls the dashboard')

    # A successful transport with no isWon state is uncertain, not a completed purchase.
    page.evaluate("resetTrade('uncertain-buy');window.__bidScenario='pending'")
    sh.locator('#autoBuy').check();sh.locator('#start').click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#logs').textContent.includes('not confirmed won')")
    assert sh.locator('#buyCount').inner_text()=='0' and sh.locator('#spent').inner_text()=='0'
    snap=request('connect')['result']['snapshot']
    assert request('beginSession',{'criteriaKey':snap['criteriaKey'],'maxPrice':1000,'maxSpend':1000,'maxBuys':1})['code']=='PURCHASE_UNCERTAIN'
    print('PASS: unconfirmed native purchase never increments counters and blocks automatic retries')

    page.evaluate('window.__testMarketAllowed=false')
    sh.locator('#connectEA').click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#nativeConnectStatus').textContent.includes('unavailable')")
    with page.expect_download() as dl: sh.locator('#exportConnection').click()
    assert json.loads(Path(dl.value.path()).read_text())['stage']=='MARKET_UNAVAILABLE'
    print('PASS: EA market eligibility remains enforced; failure report replaces old success')
    assert not errors,errors
    page.screenshot(path='/tmp/GPT_SNIPE_v3.4_NATIVE_FUNCTIONS.png')
    browser.close()
