// Technical startup check in a disposable Electron profile.
const os=require('node:os'),path=require('node:path'),fs=require('node:fs');
const {app,BrowserWindow}=require('electron');
const client=process.env.POKEDEX_UI_CLIENT||path.resolve(__dirname,'../runtime/resources/app');
const before=Boolean(process.env.POKEDEX_UI_BEFORE);
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'pokedex-smoke-'));
app.setPath('userData',scratch);app.setPath('documents',scratch);
const helper=path.join(scratch,'PokedexHelper'),data=path.join(helper,'data');fs.mkdirSync(data,{recursive:true});
const lib=require(path.join(client,'library.cjs')).library(path.join(scratch,'Library'),{create:true});
fs.writeFileSync(path.join(data,'library-location.json'),JSON.stringify({root:lib.root}));
const state={rom:{},save:{},metadata:{},emulator:{},migrated:true};
fs.writeFileSync(lib.game('Platinum','save'),require('./save-checks.cjs').platinumFixture);state.save.Platinum=true;
fs.writeFileSync(lib.at('config','connections.json'),JSON.stringify(state));
fs.writeFileSync(path.join(data,'preferences-v1.json'),JSON.stringify({configured:true,mode:'auto',language:'ru',manual:{'2-24':true,'unmapped-v0':true},tasks:{'species-999':true}}));

fs.writeFileSync(path.join(data,'window-bounds.json'),JSON.stringify({width:820,height:900}));
app.on('browser-window-created',(_,win)=>{
  win.showInactive();
  let reloaded=false;
  win.webContents.on('did-finish-load',async()=>{
    try{
      const js=code=>win.webContents.executeJavaScript(code);
      await js("new Promise((resolve,reject)=>{let tries=0;const t=setInterval(()=>{if(document.querySelector('#sections details')&&(!automatic()||dex())){clearInterval(t);resolve()}else if(++tries>120){clearInterval(t);reject(Error('startup'))}},100)})");
      if(reloaded){if(await js('prefs.interfaceScale')!==125||Math.abs(win.webContents.getZoomFactor()-1.25)>.001)throw Error('Scale persistence');app.exit(0);return}
      await new Promise(r=>setTimeout(r,550));
      async function capturePage(name){
        await js('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
        await new Promise(resolve=>setTimeout(resolve,250));
        const capture=await win.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true});
        fs.writeFileSync(path.resolve(__dirname,'../docs/screenshots/'+name+'.png'),capture.toPNG());
      }
      await js("prefs.language='en';applyLocale();render();document.getElementById('routeNav').click();window.scrollTo(0,0)");
      for(const [lang,expected] of [['ru','Маршрут 221 · Высокая трава · 25%'],['en','Route 221 · Tall Grass · 25%']]){
        const check=await js(`(()=>{
          prefs.language=${JSON.stringify(lang)};applyLocale();render();
          const row=key=>document.querySelector('[data-task="'+key+'"]');
          const primary=row('get.185').querySelector('.note').textContent;
          const checkpoint=row('6-1');
          row('get.185').querySelector('button').click();
          const details=document.getElementById('detailBody').textContent;
          document.getElementById('detail').close();
          return [primary,checkpoint.querySelector('.note').textContent,
            checkpoint.querySelector('input').type,details,row('2-24').querySelector('input').checked];
        })()`);
        if(check[0]!==expected||!check[1].includes(lang==='ru'?'бабушки':'grandmother')||check[2]!=='checkbox'||
          !check[3].includes('214')||check[3].includes(expected)||!check[4])throw Error('Catch detail or saved checkpoint: '+check);
      }

      await js(`(async()=>{
        const search=document.getElementById('search'),filter=document.getElementById('filter'),expand=document.getElementById('expand');
        search.value='#185';search.dispatchEvent(new Event('input'));
        if(!document.querySelector('[data-task="get.185"]')||document.querySelector('[data-species]:not([data-species="185"])'))throw Error('Displayed Dex number lookup');
        const savedOpen=JSON.stringify(prefs.open);
        expand.click();render();
        if(document.querySelector('#sections details[open]')||expand.disabled||JSON.stringify(prefs.open)!==savedOpen)throw Error('Filtered section disclosure');
        search.value='no-such-pokemon';search.dispatchEvent(new Event('input'));
        if(!expand.disabled)throw Error('Empty result actions');
        document.querySelector('#sections .empty button').click();
        if(document.activeElement!==search||filter.value!=='all'||!document.querySelector('[data-task="get.185"]'))throw Error('Recover from empty search');
        const checkpoint=document.querySelector('[data-task="2-24"] input');
        checkpoint.closest('details').open=true;checkpoint.focus();render();
        if(document.activeElement!==document.querySelector('[data-task="2-24"] input')&&document.activeElement!==document.querySelector('[data-task="2-24"]').closest('details').querySelector('summary'))throw Error('Route keyboard focus');
        model.errors.Platinum='ENOENT';render();
        if(document.getElementById('diagnostics').hidden||!document.getElementById('status').textContent.includes('ENOENT'))throw Error('SAV error diagnostics');
        delete model.errors.Platinum;render();
        if(!document.getElementById('diagnostics').hidden)throw Error('Recovered SAV diagnostics');
        await openBackups('invalid-game');
        if(!document.getElementById('pageStatus').textContent||!document.querySelector('#backupContent button')||document.querySelector('#backupContent .backup-actions'))throw Error('Unavailable backup view');
        await openBackups();document.getElementById('routeNav').click();
        search.focus({preventScroll:true});window.scrollTo(0,0);
      })()`);
      await capturePage('route');
      await js("document.querySelector('[data-section=emerald]').scrollIntoView({block:'start'})");await capturePage('campaigns');
      await js("Promise.all([...new Set([...document.querySelectorAll('img.section-art')].map(i=>i.src))].map(url=>{const img=new Image();img.src=url;return img.decode()}))");
      const paintings=await js("new Set([...document.querySelectorAll('img.section-art')].map(i=>i.src)).size");if(paintings!==8)throw Error('Scene coverage: '+paintings);
      await js("showSettings()");await capturePage('settings');
      await js("openBackups()");await capturePage('backups');
      win.hide();
      for(const width of [820,540]){
        win.setSize(width,900);
        for(const lang of ['en','ru']){
          await js("prefs.language="+JSON.stringify(lang)+";applyLocale();render();showSettings()");
          for(const scale of [90,100,115,125,150]){
            await js("document.getElementById('interfaceScale').value="+scale+";document.getElementById('interfaceScale').dispatchEvent(new Event('input'));");
            await new Promise(r=>setTimeout(r,60));
            const dimensions=await js("(()=>{const a=document.querySelector('aside').getBoundingClientRect(),m=document.querySelector('main').getBoundingClientRect(),w=document.querySelector('#settingsPage');return [document.documentElement.scrollWidth,document.documentElement.clientWidth,a.left,a.right,m.left,w.scrollWidth,w.clientWidth]})()");
            const [scroll,viewport,left,right,main,dialog,inside]=dimensions;
            if(scroll>viewport+1||left!==0||main<right-1||dialog>inside+1||Math.abs(win.webContents.getZoomFactor()-scale/100)>.001)throw Error('Layout '+JSON.stringify({scale,width,lang,dimensions}));
          }
          for(const panel of ['roms','emulators','saves','app']){
            const fits=await js("document.getElementById('tab-"+panel+"').click();document.documentElement.scrollWidth<=document.documentElement.clientWidth+1");
            if(!fits)throw Error('Horizontal overflow: '+panel+' '+width+' '+lang);
          }
          await js("openBackups()");
          if(!await js("!document.querySelector('dialog[open]')&&document.documentElement.scrollWidth<=document.documentElement.clientWidth+1"))throw Error('Backups layout');
          await js("settingsPanel='appearance';document.getElementById('routeNav').click()");
        }
      }
      await js("document.getElementById('compact').click();document.getElementById('jump').click();");
      if(!await js("document.body.classList.contains('compact') && document.activeElement.hasAttribute('data-task')"))throw Error('Navigation');
      const contrast=await js("(()=>{\n        function l(rgb){const values=rgb.match(/[\\d.]+/g).slice(0,3).map(x=>{const c=Number(x)/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4});return .2126*values[0]+.7152*values[1]+.0722*values[2]}\n        return ['387','390','393'].map(theme=>{document.body.dataset.theme=theme;const fg=l(getComputedStyle(document.querySelector('.counter')).color),bg=l(getComputedStyle(document.querySelector('#sections details')).backgroundColor);return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05)})\n      })()");
      if(!contrast.every(n=>n>=4.5))throw Error('Counter contrast '+JSON.stringify(contrast));
      await js("showSettings();const range=document.getElementById('interfaceScale');range.value=125;range.dispatchEvent(new Event('input'));range.dispatchEvent(new Event('change'));queued");
      console.log('Layout OK: 2 window widths, 5 scales, 2 languages. Counter contrast',contrast);
      reloaded=true;win.reload()
    }catch(e){console.error(e);app.exit(1)}
  })
});
require(path.join(client,'main.cjs'));
setTimeout(()=>app.exit(2),60000).unref();
