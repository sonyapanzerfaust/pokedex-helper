'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const {library,inside,games,gba,emulator,copy,identify,hash}=require('./library.cjs');
const components=require('./components.cjs');
const {parse,confirm,batterySize,blankFlash}=require('./save');
const families={Diamond:'Diamond/Pearl',Pearl:'Diamond/Pearl',HeartGold:'HG/SS',SoulSilver:'HG/SS',FireRed:'FireRed/LeafGreen',LeafGreen:'FireRed/LeafGreen'};
const empty=()=>({rom:{},save:{},emulator:{},metadata:{}});
function json(file,value){const tmp=file+'.'+crypto.randomUUID();fs.writeFileSync(tmp,JSON.stringify(value,null,2),{flag:'wx'});try{fs.renameSync(tmp,file)}finally{fs.rmSync(tmp,{force:true})}}
function managed({app,dialog,win,home,fixedRoot,legacy,cache,report}){
  const pointer=path.join(home,'data','library-location.json');
  let lib,state=empty(),busy=false,staging=false;
  const paths=empty();
  let previousPaths;
  function oldPaths(){return previousPaths??=(typeof legacy==='function'?legacy():legacy)}
  const ask=async(message,detail,yes)=> (await dialog.showMessageBox(win(),{type:'question',message,detail,buttons:['Отмена',yes],defaultId:0,cancelId:0})).response===1;
  function requireLib(){if(!lib)throw Error('Библиотека недоступна. Проверь диск и открой настройки библиотеки.');return lib}
  function saveState(){if(staging)return;json(requireLib().at('config','connections.json'),state);refresh()}
  function profiles(g){return [{id:'main',name:null},...(state.profiles?.[g]||[])]}
  function selected(g){return state.selected?.[g]||'main'}
  function active(g,id=selected(g)){
    if(!Object.hasOwn(games,g)||!profiles(g).some(p=>p.id===id))throw Error('PH_PROFILE');
    if(id==='main')return lib.game(g,'save');
    if(!/^[a-f0-9-]{36}$/.test(id))throw Error('PH_PROFILE');
    return lib.at('games',g.toLowerCase(),'profiles',id,'game.sav');
  }
  function addProfile(g,name,file){
    if(!Object.hasOwn(games,g)||typeof name!=='string'||!name.trim()||name.length>80)throw Error('PH_PROFILE');
    const {battery,swap}=require('./recovery.cjs'),value=battery(file,g),id=crypto.randomUUID();
    const dir=lib.at('games',g.toLowerCase(),'profiles',id);
    fs.mkdirSync(dir,{recursive:true});swap(lib.at(path.relative(lib.root,dir),'game.sav'),value.bytes);
    state.profiles??={};state.profiles[g]=[...(state.profiles[g]||[]),{id,name:name.trim()}];saveState();return id;
  }
  function selectProfile(g,id){
    guard(g);require('./recovery.cjs').battery(active(g,id),g);if(selected(g)===id)return;
    state.selected={...state.selected,[g]:id};saveState();
  }
  function guard(g,file){
    const name=emulator(g);idle(name);
    if(process.platform==='win32'){
      const result=cp.execFileSync(path.join(process.env.SystemRoot,'System32','tasklist.exe'),['/FO','CSV','/NH','/FI','IMAGENAME eq '+name+'.exe'],{encoding:'utf8',windowsHide:true,timeout:5000});
      if(file&&fs.existsSync(file))try{cp.execFileSync(path.join(process.env.SystemRoot,'System32','WindowsPowerShell','v1.0','powershell.exe'),['-NoProfile','-NonInteractive','-Command',"try { $f=[IO.File]::Open($env:PH_SAVE_PROBE,'Open','ReadWrite','None'); $f.Dispose() } catch { exit 1 }"],{env:{...process.env,PH_SAVE_PROBE:file},windowsHide:true,timeout:10000,stdio:'ignore'})}catch{throw Error('Закрой запущенный '+name+' перед этой операцией')}
      if(result.toLowerCase().includes('"'+name.toLowerCase()+'.exe"'))throw Error('Закрой запущенный '+name+' перед этой операцией');
    }
  }
  function refresh(){
    if(staging)return;
    for(const k of Object.keys(paths))paths[k]={};
    if(!lib)return;
    for(const g of Object.keys(games)){
      if(state.rom[g])paths.rom[g]=lib.game(g,'rom');
      if(state.save[g]||(state.rom[g]&&fs.existsSync(active(g))))paths.save[g]=active(g);
    }
    for(const [name,info] of Object.entries(state.emulator)){
      const file=lib.at(info.relative);if(!inside(lib.component(name),file))throw Error('Ошибочный путь эмулятора');
      paths.emulator[name]={path:file,version:info.version,arch:info.arch};
    }
    paths.metadata=state.metadata;
  }
  function log(event,fields){if(lib)fs.appendFileSync(lib.at('logs','launch.jsonl'),JSON.stringify({time:new Date().toISOString(),event,...fields})+'\n')}
  function attach(root,create){
    const candidate=library(root,{create,excluded:fixedRoot?[]:[home,path.dirname(app.getPath('exe')),process.env.ProgramFiles,process.env['ProgramFiles(x86)'],process.env.SystemRoot]});
    const meta=candidate.at('config','connections.json'),saved=fs.existsSync(meta)?JSON.parse(fs.readFileSync(meta)):empty();
    for(const k of Object.keys(empty()))if(!saved[k]||typeof saved[k]!=='object'||Array.isArray(saved[k]))throw Error('Повреждена конфигурация: '+meta);
    lib=candidate;state=saved;try{refresh()}catch(e){lib=null;throw e}
    if(create)json(pointer,{root:lib.root});
  }
  async function init(){
    if(fixedRoot){attach(fixedRoot,false);return}
    if(fs.existsSync(pointer)){attach(JSON.parse(fs.readFileSync(pointer)).root,false);return}
    const base=process.platform==='win32'?path.parse(home).root:app.getPath('appData');
    try{attach(path.join(base,'PokedexHelperData'),true);return}catch(e){log('library-error',{message:e.message})}
    const pick=await dialog.showOpenDialog(win(),{title:'Выбери родительскую папку для PokedexHelperData',properties:['openDirectory']});
    if(pick.canceled)throw Error('Библиотека пока не подключена');
    attach(path.join(pick.filePaths[0],'PokedexHelperData'),true);
  }
  async function transaction(fn){if(busy)throw Error('Дождись завершения текущей операции');busy=true;try{return await fn()}finally{busy=false}}
  function allowFresh(entries){
    for(const {g,id,file} of entries)if(file===active(g,id)){
      state.cleared??={};state.cleared[g]??={};state.cleared[g][id]=true;
    }
    saveState();
  }
  function sawSave(g){
    if(state.cleared?.[g]?.[selected(g)]){delete state.cleared[g][selected(g)];saveState()}
  }
  function recordComponent(name,result){
    if(name==='melonDS')require('./melonds-config.cjs').prepare(lib,result.path,state.emulator[name]?lib.at(state.emulator[name].relative):undefined);
    state.emulator[name]={relative:path.relative(lib.root,result.path),arch:result.arch,version:result.version,sha256:result.sha256};saveState();
  }
  function running(name){
    const pid=state.processes?.[name];if(!Number.isInteger(pid)||pid<=0)return false;
    try{process.kill(pid,0);return true}catch(e){return e.code!=='ESRCH'}
  }
  function idle(name){if(running(name))throw Error('Закрой запущенный '+name+' перед этой операцией')}
  function validateSave(g,file){
    if(!batterySize(fs.statSync(file).size))throw Error('Нужен полный battery save (.sav)');
    const data=parse(fs.readFileSync(file));if(data.game!==(families[g]||g))throw Error('Сохранение принадлежит другой игре');
    confirm(data,cache[g],g);return data;
  }
  const meter=(g)=>(received,total)=>report(g,'Копирование',received,total);
  async function backup(g,src,ext){
    const dst=lib.at('backups',g.toLowerCase()+'-'+await hash(src)+ext);
    await copy(src,dst);return dst;
  }
  async function importSave(g,file){
    guard(g,active(g));const data=validateSave(g,file),dest=active(g),exists=fs.existsSync(dest);
    let recoveryCopy;
    if(fs.existsSync(dest)&&await hash(file)!==await hash(dest)){
      if(!await ask('Заменить активное сохранение '+g+'?',dest+'\nНовая копия: '+data.caught.length+' Caught. Старое сохранение попадёт в backups.','Сохранить копию и заменить'))return false;
      const {recovery}=require('./recovery.cjs');guard(g,dest);recoveryCopy=recovery(lib,g,selected(g),dest);recoveryCopy.resume();recoveryCopy.preserve();
    }
    guard(g,dest);await copy(file,dest,{replace:exists,validate:t=>validateSave(g,t),report:meter(g)});
    if(recoveryCopy)recoveryCopy.prune();state.save[g]=true;saveState();return true;
  }
  async function importRom(g,file){
    idle(emulator(g));const ext=gba(g)?'.gba':'.nds',info=identify(file),dest=lib.game(g,'rom'),exists=fs.existsSync(dest);
    if(info.game!==g)throw Error('Выбрана игра '+info.game+' ('+info.code+'), ожидалась '+g);
    if(info.warnings.length&&!await ask('Особенности заголовка '+info.code,info.warnings.join('\n'),'Импортировать'))return false;
    if(fs.existsSync(dest)&&await hash(file)!==await hash(dest)){
      if(!await ask('Заменить внутренний ROM '+g+'?',dest+'\nСуществующий ROM останется в backups.','Заменить ROM')){
        const current=identify(dest);if(current.game!==g)throw Error('Внутренний ROM принадлежит другой игре');
        state.rom[g]=true;state.metadata[g]={...current,sha256:await hash(dest)};saveState();return true;
      }
      await backup(g,dest,ext);
    }
    const sha256=await copy(file,dest,{replace:exists,validate:t=>{if(identify(t,ext).code!==info.code)throw Error('Код копии изменился')},report:(n,total)=>{report(g,n===total?'Проверка ROM':'Копирование',n,total)}});
    state.rom[g]=true;state.metadata[g]={...info,sha256};saveState();return true;
  }
  function archive(name,exe){
    const pins=require('./component-hashes.json');
    for(const folder of [path.dirname(exe),path.dirname(path.dirname(exe))]){
      if(!fs.existsSync(folder))continue;
      const match=fs.readdirSync(folder).find(f=>Object.hasOwn(pins,f)&&f.toLowerCase().startsWith(name.toLowerCase()+'-'));
      if(match)return path.join(folder,match);
    }
    throw Error('Рядом с установкой нет проверяемого архива '+name+'. Используй кнопку установки.');
  }
  async function migrate(){
    requireLib();if(state.migrated)return;
    const legacy=oldPaths();
    if(!Object.keys(legacy.rom).length&&!Object.keys(legacy.save).length&&!Object.keys(legacy.emulator).length)return;
    if(!await ask('Скопировать прежние игры, сохранения и эмуляторы?',lib.root+'\nИсходные файлы останутся на месте. ROM и SAV сначала попадут в backups.','Скопировать'))return;
    const previous=structuredClone(state);staging=true;
    try{
    for(const g of Object.keys(games)){
      // Import the save before registering the ROM. An interrupted migration cannot boot an empty save.
      const save=legacy.save[g],rom=legacy.rom[g];
      if(save&&!state.save[g]){const b=await backup(g,save,'.sav');if(!await importSave(g,b))return}
      if(rom&&!state.rom[g]){const b=await backup(g,rom,gba(g)?'.gba':'.nds');if(!await importRom(g,b))return}
    }
    for(const [name,info] of Object.entries(legacy.emulator)){
      if(!state.emulator[name]){const result=await components.fromArchive(lib,name,archive(name,info.path));if(name==='melonDS')require('./melonds-config.cjs').prepare(lib,result.path,info.path);recordComponent(name,result)};
    }
    state.migrated=true;staging=false;saveState();
    }finally{if(staging){state=previous;staging=false;refresh()}}
  }
  async function choose(kind,g,file){
    requireLib();
    if(kind==='emulator'){idle(g);recordComponent(g,await components.fromArchive(lib,g,file));return}
    if(kind==='rom'){
      const adjacent=file.slice(0,-path.extname(file).length)+'.sav';
      if(!await importRom(g,file))return;
      report(g,'ROM подключён',0,0);
      if(fs.existsSync(adjacent)){
        if(!gba(g)&&!state.save[g]){state.expectedSave={...state.expectedSave,[g]:true};saveState()}
        try{
        const data=validateSave(g,adjacent);
        if(await ask('Импортировать соседнее сохранение '+g+'?',adjacent+'\nCaught: '+data.caught.length,'Скопировать SAV'))await importSave(g,adjacent);
        }catch(e){return {imported:true,saveWarning:e.message}}
      }
      return {imported:true};
    }else await importSave(g,file);
  }
  async function launch(name,g){
    let details={name,game:g};
    try{
      requireLib();idle(name);const info=paths.emulator[name];if(!info)throw Error('Сначала установи '+name);
      const exe=lib.at(state.emulator[name].relative),cwd=path.dirname(exe);
      if(!inside(lib.component(name),exe))throw Error('Эмулятор вне библиотеки');
      const args=[];details={...details,exe,cwd,args};
      if(await hash(exe)!==state.emulator[name].sha256)throw Error('Исполняемый файл изменился. Повтори установку '+name);
      components.inspect(exe);
      if(g){
        const rom=lib.game(g,'rom'),sav=active(g);details.rom=rom;details.save=sav;
        if(!state.rom[g]||identify(rom).game!==g)throw Error('Импортируй ROM '+g);
        if(fs.existsSync(sav)){
          fs.accessSync(sav,fs.constants.R_OK|fs.constants.W_OK);
          const blank=gba(g)&&batterySize(fs.statSync(sav).size)&&blankFlash(fs.readFileSync(sav));
          if(blank&&(state.cleared?.[g]?.[selected(g)]||(!state.save[g]&&!cache[g]&&(!state.expectedSave?.[g]||gba(g))&&(state.migrated||!oldPaths().save[g])))){
            log('uninitialized-flash',details);
          }else{validateSave(g,sav);state.save[g]=true}
        }
        else if(!state.cleared?.[g]?.[selected(g)]&&(state.save[g]||cache[g]||(!state.migrated&&oldPaths().save[g])||(state.expectedSave?.[g]&&!gba(g))))throw Error('Найден прежний прогресс. Импортируй активное сохранение '+g+' перед запуском.');
        if(name==='mGBA')args.push('-C','savegamePath='+path.dirname(sav));
        args.push(fixedRoot?path.relative(cwd,rom):rom);
      }
      if(name==='melonDS'){
        const folder=require('./melonds-config.cjs').prepare(lib,exe);
        details.config=lib.at(path.relative(lib.root,folder),'melonDS.toml');
        const cfg=lib.at(path.relative(lib.root,folder),'melonDS.toml');
        if(g&&selected(g)!=='main'&&!fs.existsSync(cfg))throw Error('PH_EMUCONFIG');
        if(fs.existsSync(cfg)){
          const current=fs.readFileSync(cfg,'utf8');
          // Keep both bytes of CRLF. A leading \s* can start between CR and LF.
          const portableConfig=fixedRoot?current.replace(/^LastROMFolder[ \t]*=.*$/gm,'LastROMFolder = ""')
            .replace(/^RecentROM[ \t]*=[ \t]*\[.*\][ \t]*$/gm,'RecentROM = []'):current;
          const saveFolder=g&&selected(g)!=='main'?path.dirname(active(g)).split(path.sep).join('/'):'';
          const next=portableConfig.replace(/^([ \t]*SaveFilePath[ \t]*=[ \t]*)[^\r\n]*$/gm,(_line,prefix)=>prefix+JSON.stringify(saveFolder));
          if(g&&selected(g)!=='main'&&!/SaveFilePath\s*=/.test(current))throw Error('PH_EMUCONFIG');
          if(current!==next){
            const recovery=lib.at('config','melonds-config-recovery');fs.mkdirSync(recovery,{recursive:true});
            const bytes=fs.readFileSync(cfg),sum=crypto.createHash('sha256').update(bytes).digest('hex'),recoveryFile=lib.at('config','melonds-config-recovery',sum+'-melonDS.toml');
            if(!fs.existsSync(recoveryFile))fs.writeFileSync(recoveryFile,bytes,{flag:'wx'});
            if(!fs.readFileSync(recoveryFile).equals(bytes))throw Error('melonDS configuration recovery verification failed');
            jsonText(cfg,next);
          }
        }
      }
      log('launch',details);
      const output=fs.openSync(lib.at('logs',name.toLowerCase()+'.log'),'a');let child;
      try{child=cp.spawn(exe,args,{cwd,shell:false,detached:true,stdio:['ignore',output,output]})}finally{fs.closeSync(output)}
      child.once('close',(code,signal)=>log('close',{...details,pid:child.pid,code,signal}));
      child.once('exit',(code,signal)=>{try{log('exit',{...details,code,signal});if(state.processes?.[name]===child.pid){delete state.processes[name];saveState()}if(code)dialog.showErrorBox(name,'Эмулятор завершился с кодом '+code+'. Подробности в '+lib.at('logs','launch.jsonl'))}catch(e){dialog.showErrorBox(name,e.message)}});
      await new Promise((resolve,reject)=>{child.once('error',reject);child.once('spawn',resolve)});
      state.processes={...state.processes,[name]:child.pid};saveState();log('spawn',{...details,pid:child.pid});child.unref();
    }catch(e){log('error',{...details,message:e.message});throw e}
  }
  return {paths,allowFresh,sawSave,profiles,selected,active,addProfile,selectProfile,guard,get busy(){return busy},init,migrate,choose,launch,idle,refresh,transaction,recordComponent,get lib(){return requireLib()},get root(){return lib?.root}};
}
function jsonText(file,text){const tmp=file+'.'+crypto.randomUUID();fs.writeFileSync(tmp,text,{flag:'wx'});fs.renameSync(tmp,file)}
module.exports={managed};
