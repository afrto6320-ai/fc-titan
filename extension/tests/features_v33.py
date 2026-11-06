from playwright.sync_api import sync_playwright
import pathlib,base64,tempfile,json
root=pathlib.Path(__file__).resolve().parent.parent
html=(root/'tests/fixture33.html').read_text()
css='data:text/css;base64,'+base64.b64encode((root/'embedded.css').read_bytes()).decode()
html=html.replace("getURL:x=>'/'+x",f"getURL:x=>'{css}'")
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1500,'height':960})
 page.set_content(html)
 page.add_script_tag(content=(root/'snipe-core.js').read_text())
 page.add_script_tag(content=(root/'native-market.js').read_text())
 page.add_script_tag(content=(root/'embedded.js').read_text())
 page.locator('#gpts-v3-nav').click()
 sh=page.locator('#gpts-v3-host')
 assert sh.locator('#connectEA').count()==1
 sh.locator('#connectEA').click()
 page.wait_for_timeout(2800)
 assert 'connected' in sh.locator('#nativeConnectStatus').inner_text().lower(),sh.locator('#nativeConnectStatus').inner_text()
 assert page.locator('.ut-market-search-filters-view').count()==1
 with page.expect_download() as download:
  sh.locator('#exportConnection').click()
 report=json.loads(pathlib.Path(download.value.path()).read_text())
 assert report['ok'] and report['stage']=='search',report
 assert report['snapshot']['searchFound']
 assert sh.locator('[data-native-picker="club"]').is_disabled()
 sh.locator('[data-native-picker="league"]').click()
 sh.locator('.native-option').filter(has_text='Premier League').click()
 page.wait_for_function("!document.querySelector('#gpts-v3-host').shadowRoot.querySelector('[data-native-picker=club]').disabled")
 sh.locator('[data-native-picker="club"]').click()
 page.wait_for_timeout(650)
 assert sh.locator('.native-option').count()==3,sh.locator('#pickerStatus').inner_text()
 sh.locator('.native-option').first.click()
 assert sh.locator('#club').input_value()=='Liverpool'
 assert page.locator('#nativeClub').get_attribute('data-picked')=='Liverpool'
 sh.locator('#player').fill('Salah')
 sh.locator('#playerResults .result').first.wait_for(timeout=2500)
 sh.locator('#playerResults .result').first.click()
 sh.locator('#syncPlayerEA').click()
 page.wait_for_timeout(900)
 assert 'Native EA selected' in sh.locator('#playerSyncState').inner_text(),sh.locator('#playerSyncState').inner_text()
 sh.locator('#maxBin').fill('1000')
 sh.locator('#start').click()
 page.wait_for_timeout(1200)
 assert (page.evaluate('window.__eaSearches||0'))>=1,sh.locator('#logs').inner_text()
 sh.locator('#stop').click()
 sh.locator('#priceControls > summary').click()
 sh.locator('#priceSource').select_option('futbin');sh.locator('#itemId').fill('50540979')
 sh.locator('#priceControls > summary').click()
 page.evaluate("() => {window.__deniedPriceRequests=0;window.__deniedMessageTypes=[];chrome.runtime.sendMessage=async m=>{window.__deniedMessageTypes.push(m.type);if(m.type==='CODEX_GET_PRICES')window.__deniedPriceRequests++;return {ok:false,status:403,code:'HTTP_ERROR'};};}")
 searches=page.evaluate('window.__eaSearches||0')
 sh.locator('#start').click()
 sh.locator('#quoteBox').filter(has_text='HTTP 403').wait_for()
 assert sh.locator('#priceControls').get_attribute('open') is not None
 assert page.evaluate('__deniedPriceRequests')==1 and page.evaluate('window.__eaSearches||0')==searches, (page.evaluate('__deniedMessageTypes'),page.evaluate('window.__eaSearches||0'),searches)
 assert sh.locator('#priceSource').input_value()=='futbin'
 print('PASS: denied Futbin reference expands pricing, displays HTTP 403, sends no market search and retains the chosen source')
 page.screenshot(path=str(pathlib.Path(tempfile.gettempdir())/'GPT_SNIPE_v3.3.1_local_preview.png'))
 print('PASS: native navigation, connection report download, original picker & click, player autocomplete, EA search click (synthetic fixture only)')
 b.close()
