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

def extract_method(name):
    prefix='UTMarketSearchFiltersViewController.prototype.'+name+'=function'
    start=source.index(prefix)
    body=source.index('{',start)
    depth=0;quote=None;escaped=False
    for i in range(body,len(source)):
        char=source[i]
        if quote:
            if escaped: escaped=False
            elif char=='\\': escaped=True
            elif char==quote: quote=None
        elif char in "'\"`": quote=char
        elif char=='{': depth+=1
        elif char=='}':
            depth-=1
            if depth==0:return source[start:i+1]+';'
    raise AssertionError('Unterminated source method '+name)

contracts='\n'.join(extract_method(name) for name in methods)
prefix=(ROOT/'tests/fixture33.html').read_text().split('<script>')[0]
html=prefix+'<script>'+(ROOT/'tests/ea_harness.js').read_text()+'\n'+contracts+'</script></body></html>'
URL='https://www.ea.com/ea-sports-fc/ultimate-team/web-app/'

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    context=browser.new_context(viewport={'width':1500,'height':1000},accept_downloads=True)
    context.route('https://www.ea.com/**',lambda route:route.fulfill(status=200,content_type='text/html',body=html) if route.request.url==URL else route.abort())
    page=context.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(URL)
    page.add_script_tag(content=(ROOT/'ea-options.js').read_text())
    page.add_script_tag(content=(ROOT/'ea-page-bridge.js').read_text())
    cdp=context.new_cdp_session(page)
    frame=cdp.send('Page.getFrameTree')['frameTree']['frame']['id']
    world=cdp.send('Page.createIsolatedWorld',{'frameId':frame,'worldName':'gpts-test-extension'})['executionContextId']
    css='data:text/css;base64,'+base64.b64encode((ROOT/'embedded.css').read_bytes()).decode()
    shim='window.chrome={runtime:{getURL:()=>'+json.dumps(css)+',sendMessage:async()=>{throw Error("Unexpected external catalogue request")}},storage:{local:{get:async()=>({}),set:async()=>{}}}};'
    scripts=['snipe-core.js','ea-page-client.js','native-market.js','embedded.js']
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
    sh.locator('#connectEA').click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#nativeConnectStatus').textContent.includes('PAGE FUNCTIONS')")
    assert page.locator('.ut-market-search-filters-view button').count()==0
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
    sh.locator('#playerResults .result').first.click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#playerSyncState').textContent.includes('209331')")
    assert page.evaluate('__nav.currentController.viewmodel.searchCriteria.maskedDefId')==209331
    sh.locator('[data-native-picker="event"]').click()
    sh.locator('.native-option').filter(has_text='Icon').click()
    page.wait_for_function('__nav.currentController.viewmodel.searchCriteria.rarities[0]===12')
    print('PASS: native local player lookup, exact base-player ID, separate rarity selection')

    sh.locator('#maxBin').fill('1000');sh.locator('#maxSearches').fill('2')
    sh.locator('#sync').click()
    page.wait_for_function('window.__nativeMaxBin===1000')
    sh.locator('#start').click()
    page.wait_for_function('window.__testSearches===2',timeout=12000)
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#runBadge').textContent.includes('STANDBY')")
    assert page.evaluate('window.__testCacheClears')==2
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
    page.evaluate('''window.__testDelay=50;window.__testSearches=0;
      window.__testItems=[{id:123456,definitionId:50540979,databaseId:209331,rating:91,rareflag:12,
        getStaticData:()=>({commonName:'Mohamed Salah'}),getAuctionData:()=>({buyNowPrice:900,tradeId:'trade-1'})}];''')
    sh.locator('#start').click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#matchCount').textContent==='1'")
    assert sh.locator('#buyCount').inner_text()=='0'
    assert '50540979' in sh.locator('#nativeOffers').inner_text()
    assert page.evaluate('__testSearches')==1
    print('PASS: authoritative native result ID/rarity/price, matching alert, zero purchases')

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
        {id:10,value:'10',label:'Same Club'},{id:99,value:'99',label:'global.teamabbr15.2027.team99*'}];
      ctrl.getOptions=()=>window.__badgeOptions.slice();ctrl.index=0;
      ctrl.iconTable=new Map([['9','/test-badges/missing.png'],['10','/test-badges/also-missing.png']]);
      view.getFilters=()=>({...fields,generateFilterImage:(kind,id)=>id===9?'/test-badges/fallback.svg':''});
    })()''')
    sh.locator('[data-native-picker="club"]').click()
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

    page.evaluate('window.__testMarketAllowed=false')
    sh.locator('#connectEA').click()
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#nativeConnectStatus').textContent.includes('unavailable')")
    with page.expect_download() as dl: sh.locator('#exportConnection').click()
    assert json.loads(Path(dl.value.path()).read_text())['stage']=='MARKET_UNAVAILABLE'
    print('PASS: EA market eligibility remains enforced; failure report replaces old success')
    assert not errors,errors
    page.screenshot(path='/tmp/GPT_SNIPE_v3.4_NATIVE_FUNCTIONS.png')
    browser.close()
