'use strict';
const {batterySize}=require('./save');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {battery,recovery,swap}=require('./recovery.cjs');
const text=require('./management-words.js');
function management({manager,dialog,win,read,persist,i18n,legacyFolder,openFolder,backupErrors,refresh}){
  const t=k=>text(k,i18n.language);
  const prefs=()=>read('preferences-v1.json',{});
  const available=()=>Object.keys({...manager.paths.rom,...manager.paths.save});
  function scope(g,id){
    if(!available().includes(g))throw Error('PH_PROFILE');
    const file=manager.active(g,id),r=recovery(manager.lib,g,id,file,()=>{
      if(manager.active(g,id)!==file)throw Error('PH_CHANGED');
      manager.guard(g,file);
    });
    r.resume();return {file,r};
  }
  const ask=async(key,detail)=> (await dialog.showMessageBox(win(),{type:'warning',message:t(key),detail,buttons:[t('cancel'),t('confirm')],defaultId:0,cancelId:0})).response===1;
  const profileName=(g,id)=>manager.profiles(g).find(x=>x.id===id)?.name||t('main');
  function describe(g,id){return g+' · '+profileName(g,id)}
  function view(g,id){
    const games=available();
    if(g===undefined)g=games[0];
    if(!g)return {games};
    id??=manager.selected(g);
    const {file,r}=scope(g,id),{entries,review}=r.scan();
    let data;
    try{const {caught,time,size}=battery(file,g);data={caught,time,size}}
    catch(e){data={error:e.code==='ENOENT'?t('absent'):i18n.message(e.message)}}
    const stamp=r.stamp();if(backupErrors?.has(g+'/'+id))stamp.error=backupErrors.get(g+'/'+id);
    return {games,g,id,profiles:manager.profiles(g),selected:manager.selected(g),file,data,entries,review,stamp,auto:prefs().autoBackup!==false};
  }
  function historical(name){
    if(typeof name!=='string'||path.basename(name)!==name||!name.toLowerCase().endsWith('.sav')||!fs.readdirSync(legacyFolder).includes(name))throw Error('PH_MISSING');
    const file=path.join(legacyFolder,name),st=fs.lstatSync(file);
    if(!st.isFile()||st.nlink!==1||!batterySize(st.size))throw Error('PH_VERIFY');
    const bytes=fs.readFileSync(file),hash=require('./recovery.cjs').digest(bytes),data=require('./save').parse(bytes);
    const metadata=file+'.json';
    if(fs.existsSync(metadata)){
      const side=fs.lstatSync(metadata);
      if(!side.isFile()||side.size>1024*1024||JSON.parse(fs.readFileSync(metadata,'utf8').replace(/^\uFEFF/,'')).sha256!==hash)throw Error('PH_VERIFY');
    }
    return {name,file,hash,game:data.game,caught:data.caught.length,time:st.mtimeMs,size:st.size};
  }
  function archive(){
    if(!fs.existsSync(legacyFolder))return [];
    return fs.readdirSync(legacyFolder).filter(n=>/\.sav$/i.test(n)).map(name=>{
      try{return historical(name)}catch{return {name,error:true}}
    }).sort((a,b)=>(b.time||0)-(a.time||0));
  }
  async function action(op,g,id,key){
    if(op==='archive')return archive();
    const {file,r}=scope(g,id),label=describe(g,id);
    if(op==='folder'){if(await openFolder(file))throw Error('PH_MISSING');return}
    if(op==='archiveImport'){
      const row=historical(key.name);if(row.hash!==key.hash||row.game!==g)throw Error('PH_VERIFY');
      if(!await ask('archiveImport',[row.file,label,t('limit')+' · 10'].join('\n')))return;
      const value=battery(row.file,g);if(value.hash!==row.hash)throw Error('PH_CHANGED');
      return r.create(value).duplicate?'duplicate':'done';
    }
    if(op==='make')return r.create(battery(file,g)).duplicate?'duplicate':'done';
    if(op==='select'){manager.selectProfile(g,id);refresh(g);return 'done'}
    if(op==='newProfile'){
      const pick=await dialog.showOpenDialog(win(),{properties:['openFile'],filters:[{name:'Battery save',extensions:['sav']}]});
      if(pick.canceled)return;manager.addProfile(g,key,pick.filePaths[0]);return 'done';
    }
    const row=r.resolve(key),info=[label,new Date(row.time).toLocaleString(i18n.language),'Caught '+row.caught,row.size+' B',row.file].join('\n');
    if(op==='restore'){
      if(!await ask('restore',info+'\n'+t('target')+': '+file+'\n'+t('protect')))return;
      r.restore(key);if(id===manager.selected(g))refresh(g);return 'done';
    }
    if(op==='delete'){if(!await ask('delete',info+'\n'+t('irreversible')))return;r.remove(key);return 'done'}
    if(op==='export'){
      const pick=await dialog.showSaveDialog(win(),{defaultPath:g+'-'+row.hash.slice(0,12)+'.sav',filters:[{name:'Battery save',extensions:['sav']}]});
      if(pick.canceled)return;r.exp(key,pick.filePath);return 'done';
    }
    throw Error('PH_PROFILE');
  }
  function targets(saves,backups){
    const list=[];
    for(const g of available())for(const {id} of manager.profiles(g)){
      const {file,r}=scope(g,id);
      if(saves&&fs.existsSync(file))list.push({g,id,file});
      if(backups)for(const row of r.scan().entries)list.push({g,id,file:row.file});
    }
    return list;
  }
  function journal(){return manager.lib.at('config','pending-reset.json')}
  function checkedPair(entry){
    const lib=manager.lib,file=lib.at(entry.file),stage=lib.at(entry.stage);
    const base=path.basename(stage);
    if(!/^\.reset-[a-f0-9-]{36}$/.test(base)||path.dirname(stage)!==path.dirname(file))throw Error('PH_RECOVERY');
    const dest=manager.active(entry.g,entry.id);
    const lower=entry.g.toLowerCase(),folder=lib.at('backups','profiles',lower,entry.id);
    const name=path.basename(file),dir=path.dirname(file);
    if(file!==dest&&!(dir===folder&&/^[a-f0-9]{64}\.sav$/.test(name))&&!(entry.id==='main'&&dir===lib.at('backups')&&new RegExp('^'+lower+'[-_][a-f0-9]{64}\\.sav$').test(name)))throw Error('PH_RECOVERY');
    return {file,stage};
  }
  function finish(job){
    const failures=[];
    for(const entry of job.entries){
      try{const {file,stage}=checkedPair(entry);if(!fs.existsSync(stage))continue;
        if(job.committed)fs.unlinkSync(stage);
        else{manager.guard(entry.g);if(fs.existsSync(file))throw Error('PH_CHANGED');fs.renameSync(stage,file)}
      }catch(e){failures.push(entry.file+' · '+t(e.message))}
    }
    if(failures.length)throw Error(failures.join('\n'));
    if(job.committed&&job.entries.length)manager.allowFresh(job.entries.map(e=>({...e,file:checkedPair(e).file})));
    if(!job.committed&&job.previous)persist('preferences-v1.json',job.previous);
    fs.unlinkSync(journal());
  }
  function resume(){if(fs.existsSync(journal()))finish(JSON.parse(fs.readFileSync(journal())))}
  async function reset(saves,backups){
    resume();
    const list=targets(saves,backups),summary=list.map(x=>describe(x.g,x.id)+' · '+x.file).join('\n');
    if(!await ask('reset',t('resetInfo')+(summary?'\n'+summary:'')))return false;
    if((saves||backups)&&!await ask('confirm',t('irreversible')+'\n'+summary))return false;
    const checks=new Set(list.map(x=>x.g));for(const g of checks)manager.guard(g);for(const row of list)if(row.file===manager.active(row.g,row.id))manager.guard(row.g,row.file);
    if(JSON.stringify(targets(saves,backups))!==JSON.stringify(list))throw Error('PH_CHANGED');
    const previous=prefs(),next={configured:false,language:'en'};
    for(const k of ['done','manual','caught','tasks','deferred','milestones'])if(previous[k]!==undefined)next[k]=previous[k];
    const job={previous,entries:list.map(x=>({...x,file:path.relative(manager.lib.root,x.file),stage:path.relative(manager.lib.root,path.join(path.dirname(x.file),'.reset-'+crypto.randomUUID()))})),committed:false};
    const saveJob=()=>swap(journal(),Buffer.from(JSON.stringify(job)));
    saveJob();
    try{
      for(const entry of job.entries){const {file,stage}=checkedPair(entry);fs.renameSync(file,stage)}
      persist('preferences-v1.json',next);job.committed=true;saveJob();
    }catch(e){job.committed=false;persist('preferences-v1.json',previous);finish(job);throw e}
    finish(job);i18n.set('en');return true;
  }
  return {view,action,reset,resume};
}
module.exports={management};
