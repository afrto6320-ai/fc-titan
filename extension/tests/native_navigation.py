"""Navigation regressions using synthetic DOM; no EA session or network required."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
BRIDGE = (ROOT / 'native-market.js').read_text()
FORM = '<div class="ut-market-search-filters-view"><input aria-label="Player Name"><button>Search</button></div>'

def run(browser, body, script='', timeout=400):
    page = browser.new_page()
    page.set_content('<main>' + body + '</main>')
    if script:
        page.add_script_tag(content=script)
    page.add_script_tag(content=BRIDGE)
    report = page.evaluate('(ms) => GPTNativeMarket.connectMarket(null, {timeoutMs:ms})', timeout)
    return page, report

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                args=['--no-sandbox', '--disable-dev-shm-usage'])
    # Original failure: tile label includes a live counter, so whole-text equality fails.
    page, report = run(browser, '<button id="transfers">Transfers</button>', f'''
      transfers.onclick=()=>{{document.querySelector('main').insertAdjacentHTML('beforeend',
        '<div class="ut-tile"><h2>Transfer Market</h2><span>150 Live Transfers</span></div>');
        document.querySelector('.ut-tile').onclick=()=>document.querySelector('main').innerHTML={FORM!r};}};
    ''')
    assert report['ok'], report
    page.close()
    print('PASS: tile heading with live counter')

    # Delayed direct navigation: no intermediate Transfer Market tile.
    page, report = run(browser, '<button id="transfers">Transfers</button>', f'''
      transfers.onclick=()=>setTimeout(()=>document.querySelector('main').innerHTML={FORM!r},1800);
    ''', 3000)
    assert report['ok'], report
    page.close()
    print('PASS: delayed direct search form')

    # Resume from market landing even when sidebar is collapsed/unavailable.
    page, report = run(browser, '<button id="entry">Search the Transfer Market</button>', f'''
      entry.onclick=()=>document.querySelector('main').innerHTML={FORM!r};
    ''')
    assert report['ok'], report
    page.close()
    print('PASS: resume existing market landing')

    # Both native controls have the same name. Neither should be excluded by its sibling.
    page, report = run(browser, '<button id="a">Transfers</button><button id="b">Transfers</button>', f'''
      a.onclick=b.onclick=()=>document.querySelector('main').innerHTML={FORM!r};
    ''')
    assert report['ok'], report
    page.close()
    print('PASS: duplicate native navigation labels')

    # Arabic diacritics and different alef spelling still identify the navigation label.
    page, report = run(browser, '<button id="entry">سُوق الإنتقالات</button>', f'''
      entry.onclick=()=>document.querySelector('main').innerHTML={FORM!r};
    ''')
    assert report['ok'], report
    page.close()
    print('PASS: Arabic label normalization')

    # Ignore extension UI, hidden tiles, disabled controls, and unrelated purchase buttons.
    page, report = run(browser, '''
      <div id="gpts-v3-host"><button onclick="window.bad=true">Transfer Market</button></div>
      <div style="display:none"><button onclick="window.bad=true">Transfer Market</button></div>
      <button disabled onclick="window.bad=true">Transfer Market</button>
      <button aria-disabled="true" onclick="window.bad=true">Transfer Market</button>
      <button onclick="window.bad=true">Buy Now Transfer Market</button>
      <input value="PRIVATE-SENTINEL">
    ''')
    assert not report['ok'], report
    assert page.evaluate('!window.bad')
    assert 'PRIVATE-SENTINEL' not in str(report)
    assert report['snapshot']['searchFound'] is False
    page.close()
    print('PASS: bounded failure, safe targets, redacted diagnostic snapshot')

    page, report = run(browser, FORM)
    assert report['ok']
    assert page.evaluate('GPTNativeMarket.marketSearchButton().textContent') == 'Search'
    page.close()
    print('PASS: existing connected form')
    browser.close()
