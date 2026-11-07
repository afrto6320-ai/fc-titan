"""Manifest-order MAIN/ISOLATED regression with a synthetic native EA service.
No extension installation, live account, external request or real purchase.
"""
from pathlib import Path
import base64, json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent.parent
URL='https://www.ea.com/ea-sports-fc/ultimate-team/web-app/'
HTML='''<!doctype html><html><meta charset="utf-8"><style>
body{background:#17232d;color:white;font:14px Arial}nav{position:fixed;left:0;top:0;width:80px;padding-top:100px}nav button{padding:15px 1px}main{margin-left:100px}.ut-market-search-filters-view{padding:20px}
</style><body><nav><button>Home</button><button>Transfers</button></nav><main><div class="ut-market-search-filters-view"><h1>Transfer Market Search — synthetic fixture</h1><button class="btn-standard primary">Search</button></div></main><script>
window.__calls=[];window.__bids=[];window.__clears=0;window.__emitItems=false;window.__tradeId='1234567890';
window.__criteria={minBid:0,maxBid:0,minBuy:0,maxBuy:7000,maskedDefId:0,type:'player'};
const entry={id:12345,firstName:'Fixture',lastName:'Player',rating:90};
const playerControl={searchEngine:{getEntriesForString:()=>[entry]},getSelected:()=>window.__selected||null,selectPlayerEntry:e=>{window.__selected=e;window.__criteria.maskedDefId=e.id;},clearSelection:()=>{window.__selected=null;window.__criteria.maskedDefId=0;}};
const view={getPlayerNameSearch:()=>playerControl,setMinBidPrice:()=>{},setMaxBidPrice:()=>{},setMinBuyNowPrice:()=>{},setMaxBuyNowPrice:()=>{}};
class UTMarketSearchFiltersViewController{constructor(){this.viewmodel={searchCriteria:window.__criteria,playerData:null};}getView(){return view;}}
window.UTMarketSearchFiltersViewController=UTMarketSearchFiltersViewController;
const controller=new UTMarketSearchFiltersViewController();
window.getAppMain=()=>({getRootViewController:()=>({getPresentedViewController:()=>({getCurrentViewController:()=>({getCurrentController:()=>controller})})})});
const item={definitionId:100,databaseId:12345,rating:90,name:'Fixture Player',getAuctionData:()=>({tradeId:window.__tradeId,buyNowPrice:2000})};
const observable=response=>({observe:(observer,fn)=>setTimeout(()=>fn(null,response),30),unobserve:()=>{}});
window.services={TransferMarket:{isFeatureEnabledForUser:()=>true},Item:{clearTransferMarketCache:()=>window.__clears++,searchTransferMarket:(criteria,page)=>{window.__calls.push({...criteria,page});return observable({success:true,data:{items:window.__emitItems?[item]:[]}});},bid:(raw,price)=>{window.__bids.push({original:raw===item,price});return observable({success:true});}}};
</script></body></html>'''
manifest=json.loads((ROOT/'manifest.json').read_text())
css='data:text/css;base64,'+base64.b64encode((ROOT/'embedded.css').read_bytes()).decode()

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    context=browser.new_context(viewport={'width':1500,'height':1000})
    context.route('**/*',lambda route:route.fulfill(status=200,content_type='text/html',body=HTML) if route.request.url==URL else route.abort())
    def open_page(stored=None):
        page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(URL)
        for block in manifest['content_scripts']:
            if block.get('world')=='MAIN':
                for file in block['js']:page.add_script_tag(content=(ROOT/file).read_text())
        cdp=context.new_cdp_session(page);frame=cdp.send('Page.getFrameTree')['frameTree']['frame']['id']
        world=cdp.send('Page.createIsolatedWorld',{'frameId':frame,'worldName':'ladder-extension-fixture'})['executionContextId']
        shim='window.__storage='+json.dumps(stored or {})+';window.chrome={runtime:{getURL:()=>'+json.dumps(css)+',sendMessage:async()=>({ok:true,result:{items:[]}})},storage:{local:{get:async()=>window.__storage,set:async(v)=>Object.assign(window.__storage,v)}}};'
        cdp.send('Runtime.evaluate',{'contextId':world,'expression':shim})
        for block in manifest['content_scripts']:
            if block.get('world','ISOLATED')=='ISOLATED':
                for file in block['js']:
                    result=cdp.send('Runtime.evaluate',{'contextId':world,'expression':(ROOT/file).read_text()+'\n//# sourceURL=chrome-extension://ladder-fixture/'+file})
                    assert 'exceptionDetails' not in result,result
        page.locator('#gpts-v3-nav').click();sh=page.locator('#gpts-v3-host')
        return page,sh,cdp,world,errors

    page,sh,cdp,world,errors=open_page()
    assert sh.locator('#searchMode').input_value()=='enhancer'
    assert sh.locator('#bidLadderMode').input_value()=='off'
    assert sh.locator('#bidLadderMode option').evaluate_all('(els)=>els.map(e=>e.value)')==['off','minBid','maxBid','smartMaxBid']
    sh.locator('#maxBin').fill('7000');sh.locator('#minBid').fill('0');sh.locator('#maxBid').fill('0');sh.locator('#budget').fill('14000')
    def scan():
        before=page.evaluate('__calls.length');sh.locator('#marketProbe').click()
        page.wait_for_function('(n)=>window.__calls.length>n',arg=before)
        page.wait_for_function("!document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#marketProbe').disabled")
        return page.evaluate('__calls.at(-1)')
    sh.locator('#bidLadderMode').select_option('smartMaxBid')
    assert scan()['maxBid']==7100
    assert scan()['maxBid']==7200
    assert page.evaluate('__criteria.maxBid')==0 and page.evaluate('__criteria.minBid')==0
    assert page.evaluate('__clears')==2
    sh.locator('#bidLadderMode').select_option('minBid')
    assert scan()['minBid']==0 and scan()['minBid']==150
    assert 'قد يستبعد' in sh.locator('#bidLadderHelp').inner_text()
    sh.locator('#bidLadderMode').select_option('maxBid')
    assert scan()['maxBid']==0 and scan()['maxBid']==150
    assert 'قد يستبعد' in sh.locator('#bidLadderHelp').inner_text()
    sh.locator('#bidLadderMode').select_option('off')
    sent=scan();assert sent['minBid']==0 and sent['maxBid']==0
    sh.locator('#bidLadderMode').select_option('smartMaxBid');sh.locator('#maxBin').fill('4500')
    assert scan()['maxBid']==4600
    assert 'Max Bid 0 → 4600' in sh.locator('#searchFeed').inner_text()
    print('PASS: optional ladders reach the actual MAIN service with valid prices, cache eviction, unchanged model and truthful logs')
    sh.locator('#language').select_option('en')
    assert sh.locator('#bidLadderMode').input_value()=='smartMaxBid'
    assert 'above' in sh.locator('#bidLadderHelp').inner_text()
    saved=cdp.send('Runtime.evaluate',{'contextId':world,'expression':'window.__storage','returnByValue':True})['result']['value']
    restored,restored_sh,_,_,restored_errors=open_page(saved)
    assert restored_sh.locator('#bidLadderMode').input_value()=='smartMaxBid'
    assert restored_sh.locator('#maxBin').input_value()=='4500'
    assert not restored_errors;restored.close()
    print('PASS: language rebuild and a fresh UI load retain the selected ladder and prices')

    # Two monitoring searches must advance the same choice used by manual scans.
    sh.locator('#maxBin').fill('7000');sh.locator('#maxSearches').fill('2')
    sh.locator('#speedPreset').select_option('custom');sh.locator('#speedMin').fill('0.6');sh.locator('#speedMax').fill('0.6')
    before=page.evaluate('__calls.length');sh.locator('#start').click()
    page.wait_for_function('(n)=>window.__calls.length===n+2',arg=before)
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#stop').disabled")
    assert page.evaluate('__calls.slice(-2).map(c=>c.maxBid)')==[7100,7200]
    print('PASS: Start monitoring advances the smart ladder across actual search cycles')

    # Use the actual native autocomplete bridge before enabling a synthetic purchase.
    sh.locator('#player').fill('Fixture')
    sh.locator('#playerResults .result').first.click()
    page.wait_for_function('__criteria.maskedDefId===12345')
    sh.locator('#maxBuys').fill('1');sh.locator('#autoBuy').check()
    page.evaluate('window.__emitItems=true')
    page.on('dialog',lambda dialog:dialog.accept())
    sh.locator('#start').click()
    page.wait_for_function('__bids.length===1')
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#stop').disabled")
    assert page.evaluate('__bids[0]')=={'original':True,'price':2000}
    assert page.evaluate('__calls.at(-1).maxBid')==7100 and page.evaluate('__calls.at(-1).maxBuy')==7000
    assert sh.locator('#bidLadderMode').input_value()=='smartMaxBid'
    print('PASS: optional smart ladder permits a verified-target Auto Buy using the original item and actual Buy Now, not the bid ceiling')
    sh.locator('#bidLadderMode').select_option('minBid')
    page.evaluate("window.__tradeId='1234567891'")
    sh.locator('#start').click()
    page.wait_for_function('__bids.length===2')
    page.wait_for_function("document.querySelector('#gpts-v3-host').shadowRoot.querySelector('#stop').disabled")
    assert page.evaluate('__bids[1]')=={'original':True,'price':2000}
    assert page.evaluate('__calls.at(-1).minBid')==0 and page.evaluate('__calls.at(-1).maxBuy')==7000
    print('PASS: Min Bid is also selectable for a verified-target Auto Buy without changing purchase price or ceiling')
    assert not errors,errors
    sh.locator('#bidLadderMode').select_option('smartMaxBid')
    sh.locator('#bidLadderMode').scroll_into_view_if_needed()
    page.screenshot(path='/tmp/CODEX_SNIPE_v3.17.1_ladder.png')
    browser.close()
