// Technical startup check in a disposable Electron profile.
const os=require('node:os'),path=require('node:path'),fs=require('node:fs');
const {app,BrowserWindow}=require('electron');
const client=process.env.POKEDEX_UI_CLIENT||path.resolve(__dirname,'../runtime/resources/app');
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'pokedex-smoke-'));
app.setPath('userData',scratch);app.setPath('documents',scratch);
const helper=path.join(scratch,'PokedexHelper'),data=path.join(helper,'data');fs.mkdirSync(data,{recursive:true});
const lib=require(path.join(client,'library.cjs')).library(path.join(scratch,'Library'),{create:true});
fs.writeFileSync(path.join(data,'library-location.json'),JSON.stringify({root:lib.root}));
const state={rom:{},save:{},metadata:{},emulator:{},migrated:true};
if(process.env.POKEDEX_FIXTURE){fs.copyFileSync(process.env.POKEDEX_FIXTURE,lib.game('Platinum','save'));state.save.Platinum=true}
fs.writeFileSync(lib.at('config','connections.json'),JSON.stringify(state));
fs.writeFileSync(path.join(data,'preferences-v1.json'),JSON.stringify({configured:true,manual:{'2-24':true,'unmapped-v0':true},tasks:{'species-999':true}}));
let pass=0;
app.on('browser-window-created',(_,win)=>{
  win.hide();win.on('show',()=>win.hide());
  win.webContents.on('did-finish-load',async()=>{
    try{
      const result=await win.webContents.executeJavaScript(`(async()=>{
        const wait=()=>new Promise(r=>setTimeout(r,100));
        for(let i=0;i<120&&!document.querySelector('#sections details');i++)await wait();
        if(!document.querySelector('#sections details'))throw Error('Startup: '+document.getElementById('status').textContent);
        for(let i=0;i<50&&document.getElementById('caught').textContent==='—';i++)await wait();
        if(!prefs.manual['2-24']||!prefs.manual['unmapped-v0']||!prefs.tasks['species-999'])throw Error('Legacy marks lost');
        const oldCount=document.getElementById('caught').textContent;
        if(model.cache.Platinum){const v=await service.saveView('Platinum','main');if(v.entries.length!==1||!v.stamp.lastAuto||v.entries[0].caught!==Number(oldCount))throw Error('Automatic backup after save/reload')}
        if(${pass}===0){
          if(I18n.language!=='ru')throw Error('Existing profile language');
          if(model.cache.Platinum){await openBackups('Platinum','main');if(!document.querySelector('.backup-card')||!document.getElementById('backupContent').textContent.includes(mt('restore')))throw Error('Backup UI');
          if(document.querySelector('dialog[open]')||activePage!=='backups')throw Error('Backups navigation')}
          document.getElementById('setup').click();
          for(const panel of ['roms','emulators','saves','app','appearance']){
            document.getElementById('tab-'+panel).click();if(activePage!=='settings'||settingsPanel!==panel||document.querySelector('dialog[open]'))throw Error('Settings redirected to onboarding');
          }
          if(document.getElementById('diagnostics').getBoundingClientRect().height)throw Error('Visible diagnostics');

          const language=document.querySelector('[data-preference=language]');language.value='en';language.dispatchEvent(new Event('change'));
          await queued;await wait();
          document.getElementById('routeNav').click();
          const early=document.querySelector('[data-task="try.honey.446"]');
          const skip=[...early.querySelectorAll('button')].find(b=>b.textContent==='Skip');if(!skip)throw Error('Missing Skip: '+early.textContent+' '+I18n.language);skip.click();
          for(let i=0;i<30&&!document.querySelector('[data-task="get.446"]');i++)await wait();
          await queued;
        }else{
          if(I18n.language!=='en'||!prefs.deferred[446]||!document.querySelector('[data-task="get.446"]'))throw Error('Skip or language lost after reload');
          const restore=[...document.querySelector('[data-task="get.446"]').querySelectorAll('button')].find(b=>b.textContent==='Undo skip');restore.click();
          for(let i=0;i<30&&document.querySelector('[data-task="get.446"]');i++)await wait();
          if(prefs.deferred[446])throw Error('Restore failed');
        }
        if(oldCount!==document.getElementById('caught').textContent)throw Error('Skip changed caught count');
        if(${pass}===1 && model.cache.Platinum && !model.cache.Platinum.caught.includes(446)){
          const last=model.cache.Platinum;
          model.cache.Emerald={caught:[446]};render();
          if(document.getElementById('caught').textContent!==oldCount)throw Error('Donor counted in Platinum');
          prefs.deferred[446]=true;
          model.cache.Platinum={...last,caught:[...last.caught,446]};await milestone();render();
          if(prefs.deferred[446]||document.getElementById('caught').textContent!==String(+oldCount+1))throw Error('Registration did not resolve Skip');
          model.cache.Platinum=last;delete model.cache.Emerald;render();
        }
        document.getElementById('routeNav').click();
        const open=()=>Array.from(document.querySelectorAll('#sections details')).map(d=>d.open).join(',');
        const before=open(),q=document.getElementById('search');
        q.value='Heracross';q.dispatchEvent(new Event('input'));await wait();
        if(document.querySelectorAll('#sections details').length>=before.split(',').length)throw Error('Search sections');
        q.value='';q.dispatchEvent(new Event('input'));await wait();
        if(before!==open())throw Error('Search changed open sections');
        return {rows:document.querySelectorAll('.row').length,sections:document.querySelectorAll('#sections details').length,caught:document.getElementById('caught').textContent};
      })()`);
      console.log(JSON.stringify(result));if(pass++===0)win.reload();else app.exit(0);
    }catch(e){console.error(e);app.exit(1)}
  });
});
require(path.join(client,'main.cjs'));
setTimeout(()=>app.exit(2),25000).unref();
