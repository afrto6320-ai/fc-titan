const text={
 ar:{intro:'الإضافة تظهر داخل القائمة اليسرى في Web App. افتح اللعبة واضغط CODEX SNIPE فوق Evolutions.',open:'افتح EA Web App',note:'لو التبويب مش ظاهر، اعمل Refresh. فعّل نسخة واحدة من الإضافة فقط.'},
 en:{intro:'The extension appears in the left Web App navigation above Evolutions. Open CODEX SNIPE from there.',open:'Open EA Web App',note:'If the tab is missing, refresh the game. Keep only one CODEX SNIPE extension enabled.'}
};
chrome.storage.local.get('gpts_embedded_v3').then(data=>{
 const lang=data?.gpts_embedded_v3?.language==='en'?'en':'ar';document.documentElement.lang=lang;document.documentElement.dir=lang==='en'?'ltr':'rtl';
 for(const [key,value] of Object.entries(text[lang]))document.getElementById(key).textContent=value;
}).catch(()=>{});
document.getElementById('open').addEventListener('click',async()=>{await chrome.tabs.create({url:'https://www.ea.com/ea-sports-fc/ultimate-team/web-app/'});window.close();});
