'use strict';
const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const {parse,confirm}=require('./save');
const {games}=require('./library.cjs');
const families={Diamond:'Diamond/Pearl',Pearl:'Diamond/Pearl',HeartGold:'HG/SS',SoulSilver:'HG/SS',FireRed:'FireRed/LeafGreen',LeafGreen:'FireRed/LeafGreen'};
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function battery(file,g){
  const stat=fs.statSync(file);
  if(!stat.isFile()||![131072,524288].includes(stat.size))throw Error('Нужен полный battery save (.sav)');
  const bytes=fs.readFileSync(file),data=parse(bytes);
  if(data.game!==(families[g]||g))throw Error('Сохранение принадлежит другой игре');
  confirm(data,null,g);
  if(!bytes.equals(fs.readFileSync(file)))throw Error('Исходный файл изменился при копировании');
  return {bytes,hash:digest(bytes),caught:data.caught.length,size:bytes.length,time:stat.mtimeMs,data};
}
function swap(file,bytes){
  const tmp=file+'.'+crypto.randomUUID()+'.tmp';
  try{
    const fd=fs.openSync(tmp,'wx');try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd)}finally{fs.closeSync(fd)}
    if(!fs.readFileSync(tmp).equals(bytes))throw Error('PH_VERIFY');
    fs.renameSync(tmp,file);
  }finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp)}
}
function recovery(lib,g,id,active,guard=()=>{}){
  if(!Object.hasOwn(games,g)||!(id==='main'||/^[a-f0-9-]{36}$/.test(id)))throw Error('PH_PROFILE');
  const folder=()=>lib.at('backups','profiles',g.toLowerCase(),id);
  function local(...parts){return lib.at(path.relative(lib.root,folder()),...parts)}
  const legacy=lib.at('backups'),pattern=new RegExp('^'+g.toLowerCase()+'[-_]([a-f0-9]{64})\\.sav$');
  const canonical=/^([a-f0-9]{64})\.sav$/;
  function scan(){
    const entries=[],review=[];
    const gather=(dir,regex,prefix)=>{
      if(!fs.existsSync(dir))return;
      for(const item of fs.readdirSync(dir,{withFileTypes:true})){
        const match=regex.exec(item.name);
        if(!match){
          if(item.isFile()&&/\.sav$/i.test(item.name)&&(!prefix||!Object.keys(games).some(k=>item.name.toLowerCase().startsWith(k.toLowerCase())&&/[-_][a-f0-9]{64}\.sav$/.test(item.name))))review.push(item.name);
          continue;
        }
        try{
          const file=lib.at(path.relative(lib.root,dir),item.name),{hash,size,caught,time}=battery(file,g);
          if(hash!==match[1])throw Error('PH_VERIFY');
          entries.push({key:prefix+item.name,file,size,caught,time,hash});
        }catch{review.push(item.name)}
      }
    };
    gather(folder(),canonical,'');if(id==='main')gather(legacy,pattern,'legacy/');
    return {entries:entries.sort((a,b)=>b.time-a.time||a.key.localeCompare(b.key)),review};
  }
  function resolve(key){const entry=scan().entries.find(e=>e.key===key);if(!entry)throw Error('PH_MISSING');return entry}
  function ensure(){fs.mkdirSync(folder(),{recursive:true})}
  function stamp(){const f=local('status.json');return fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):{}}
  function mark(fields){ensure();swap(local('status.json'),Buffer.from(JSON.stringify({...stamp(),...fields})))}
  function prune(keep=[]){
    if(fs.existsSync(local('restore.json')))return;
    const rows=scan().entries;
    for(const row of rows.filter(e=>!keep.includes(e.key)).slice(Math.max(0,10-rows.filter(e=>keep.includes(e.key)).length))){
      fs.unlinkSync(resolve(row.key).file);
    }
  }
  function create(value,automatic=false,trim=true){
    ensure();
    const rows=scan().entries,existing=rows.find(e=>e.hash===value.hash);
    if(!existing){
      const target=local(value.hash+'.sav');
      if(fs.existsSync(target))throw Error('PH_VERIFY');
      swap(target,value.bytes);
      if(battery(target,g).hash!==value.hash)throw Error('PH_VERIFY');
      if(automatic)mark({lastAuto:Date.now(),error:null});
    }
    if(trim&&!existing)prune();
    return {key:existing?.key||value.hash+'.sav',duplicate:!!existing};
  }
  function preserve(){
    ensure();
    let before=null,old=null;
    if(fs.existsSync(active)){
      try{before=battery(active,g);old=create(before,false,false).key}
      catch(e){
        if(before||![131072,524288].includes(fs.statSync(active).size))throw e;
        const bytes=fs.readFileSync(active),hash=digest(bytes);
        const dest=local('damaged-'+hash+'.sav');
        if(!fs.existsSync(dest))swap(dest,bytes);
        if(!fs.readFileSync(dest).equals(bytes))throw Error('PH_VERIFY');
        before={bytes,hash};
      }
    }
    return {before,old};
  }
  function restore(key,afterWrite=()=>{}){
    ensure();guard();const src=resolve(key),chosen=battery(src.file,g);
    const journal=local('restore.json');if(fs.existsSync(journal))throw Error('PH_RECOVERY');
    const {before,old}=preserve();
    const activeHash=()=>fs.existsSync(active)?digest(fs.readFileSync(active)):null;
    const previous=before?.hash??null;
    swap(journal,Buffer.from(JSON.stringify({previous,expected:chosen.hash})));
    try{
      guard();if(activeHash()!==previous)throw Error('PH_CHANGED');
      swap(active,chosen.bytes);
      try{afterWrite();if(battery(active,g).hash!==chosen.hash)throw Error('PH_VERIFY')}
      catch(e){guard();if(before)swap(active,before.bytes);else fs.unlinkSync(active);if(activeHash()!==previous)throw Error('PH_RECOVERY');throw e}
    }catch(e){if(activeHash()===previous)fs.unlinkSync(journal);throw e}
    fs.unlinkSync(journal);prune([...new Set([key,old].filter(Boolean))]);
    return chosen.data;
  }
  function resume(){
    const journal=local('restore.json');if(!fs.existsSync(journal))return;
    const job=JSON.parse(fs.readFileSync(journal));
    const hash=fs.existsSync(active)?digest(fs.readFileSync(active)):null;
    if(hash===job.expected)battery(active,g);
    else if(hash!==job.previous)throw Error('PH_RECOVERY');
    fs.unlinkSync(journal);
  }
  function remove(key){if(fs.existsSync(local('restore.json')))throw Error('PH_RECOVERY');fs.unlinkSync(resolve(key).file)}
  function exp(key,dest){const row=resolve(key);if(path.extname(dest).toLowerCase()!=='.sav'||require('./library.cjs').inside(fs.realpathSync(lib.root),path.join(fs.realpathSync(path.dirname(dest)),path.basename(dest)))||fs.existsSync(dest))throw Error('PH_EXPORT');fs.copyFileSync(row.file,dest,fs.constants.COPYFILE_EXCL);if(digest(fs.readFileSync(dest))!==row.hash)throw Error('PH_VERIFY')}
  return {scan,create,preserve,prune,restore,remove,exp,resolve,stamp,mark,resume};
}
module.exports={battery,digest,swap,recovery};
