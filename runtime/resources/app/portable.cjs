'use strict';
const fs=require('node:fs'),path=require('node:path');
const {safe,inside,hash,space,library,games,gba,identify}=require('./library.cjs');
const {battery,swap}=require('./recovery.cjs');
const configFiles=['preferences-v1.json','snapshots-v1.json','helper-state.json','pre-1.0-catalog-progress.json','window-bounds.json'];
const json=file=>JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const record=(file,value)=>swap(file,Buffer.from(JSON.stringify(value)));
function verifyConfig(root){
  const cfg=safe(root,'config','connections.json'),state=json(cfg);
  for(const key of ['rom','save','emulator','metadata']){
    if(!state[key]||typeof state[key]!=='object'||Array.isArray(state[key]))throw Error(cfg+' · '+key);
  }
  if(json(safe(root,'config','library.json')).version!==1)throw Error(cfg);
  for(const name of configFiles){const file=safe(root,'config',name);if(fs.existsSync(file))json(file)}
  return state;
}
function validateCopy(root){
  const state=verifyConfig(root);
  const snapshots=safe(root,'config','snapshots-v1.json'),cache=fs.existsSync(snapshots)?json(snapshots):{};
  if(fs.existsSync(safe(root,'config','pending-reset.json')))throw Error('Complete the pending reset in the previous copy first.');
  for(const [g,enabled] of Object.entries(state.rom)){
    if(!Object.hasOwn(games,g))throw Error(g);
    if(enabled&&identify(safe(root,'games',g.toLowerCase(),'game.'+(gba(g)?'gba':'nds'))).game!==g)throw Error(g);
  }
  for(const g of Object.keys(games)){
    const ids=['main',...(state.profiles?.[g]||[]).map(p=>p.id)];
    if(!ids.includes(state.selected?.[g]||'main')||ids.length!==new Set(ids).size)throw Error('Invalid profile: '+g);
    for(const id of ids){
      if(id!=='main'&&!/^[a-f0-9-]{36}$/i.test(id))throw Error('Invalid profile: '+id);
      const file=safe(root,'games',g.toLowerCase(),...(id==='main'?[]:['profiles',id]),'game.sav');
      if(!fs.existsSync(file)){
        if(!state.cleared?.[g]?.[id]&&(id!=='main'||state.save[g]&&id===(state.selected?.[g]||'main')))throw Error(file);
        continue;
      }
      if(gba(g)&&fs.statSync(file).size===131072&&fs.readFileSync(file).every(n=>n===255)&&!cache[g]&&!state.save[g]&&id==='main')continue;
      battery(file,g);
    }
  }
  for(const [name,e] of Object.entries(state.emulator)){
    if(!['melonDS','mGBA'].includes(name)||path.isAbsolute(e.relative)||!inside(safe(root,'emulators',name.toLowerCase()),safe(root,e.relative))||!fs.statSync(safe(root,e.relative)).isFile())throw Error('Invalid emulator: '+name);
  }
}
function walk(root,dir=root){
  const files=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const file=safe(root,path.relative(root,dir),entry.name);
    if(entry.isDirectory())files.push(...walk(root,file));else if(entry.isFile())files.push(file);else throw Error(file);
  }
  return files;
}
function inventory(source,oldHome){
  if(!source)return [];
  verifyConfig(source);
  const files=walk(source).map(src=>({src,rel:path.relative(source,src)}));
  for(const name of configFiles){
    const src=safe(oldHome,'data',name);if(fs.existsSync(src))files.push({src,rel:path.join('config',name)});
  }
  const archive=safe(oldHome,'backups');
  if(fs.existsSync(archive))for(const src of walk(archive))files.push({src,rel:path.join('legacy-backups',path.relative(archive,src))});
  const names=new Set();
  for(const f of files){
    if(names.has(f.rel.toLowerCase()))throw Error('Conflicting files: '+f.rel);
    names.add(f.rel.toLowerCase());
    if(path.basename(f.rel)==='restore.json'||path.basename(f.rel)==='pending-reset.json')throw Error('Finish pending recovery before copying: '+f.src);
  }
  return files.sort((a,b)=>a.rel.localeCompare(b.rel));
}
function previous(home){
  const pointer=safe(home,'data','library-location.json');
  if(fs.existsSync(pointer)){
    const root=json(pointer).root;if(typeof root!=='string'||!path.isAbsolute(root))throw Error(pointer);
    if(!fs.existsSync(root))return null;
    verifyConfig(root);return root;
  }
  return null;
}
async function initialize(data,{oldHome,choose,confirmFresh,checkSpace=space,onCopy=()=>{}}={}){
  const root=safe(data,'library'),stage=safe(data,'.library-stage'),journal=safe(data,'.initialization.json'),marker=safe(data,'portable.json');
  fs.mkdirSync(data,{recursive:true});
  if(fs.existsSync(marker)&&json(marker).version!==1)throw Error(marker);
  if(fs.existsSync(root)){
    verifyConfig(root);
    if(!fs.existsSync(marker)&&!fs.existsSync(journal))throw Error('Missing portable configuration: '+marker);
    if(!fs.existsSync(marker))record(marker,{version:1});
    if(fs.existsSync(journal))fs.unlinkSync(journal);
    return root;
  }
  if(fs.existsSync(marker))throw Error('Missing portable library: '+root);
  for(const item of fs.readdirSync(data))if(!['cache','logs','.initialization.json','.library-stage','.copying'].includes(item))throw Error('Unrecognized existing data: '+item);
  let job;
  if(fs.existsSync(journal)){
    job=json(journal);if(job.version!==1||job.source&&(!path.isAbsolute(job.source)||!path.isAbsolute(job.home)))throw Error(journal);
    if(job.source&&(!choose||await choose(job.source,true)!=='copy'))throw Error('Migration paused.');
  }else{
    if(fs.existsSync(stage)||fs.existsSync(safe(data,'.copying')))throw Error('Unrecognized staging data: '+data);
    const prior=oldHome&&previous(oldHome);
    const choice=prior?await choose(prior,false):(!confirmFresh||await confirmFresh()?'fresh':'cancel');
    if(!['fresh','copy'].includes(choice))throw Error('Migration paused.');
    job={version:1,source:choice==='copy'?prior:null,home:choice==='copy'?oldHome:null};record(journal,job);
  }
  if(job.source&&(inside(job.source,data)||inside(data,job.source)||inside(safe(job.home,'backups'),data)))throw Error('Overlapping libraries: '+data);
  const files=inventory(job.source,job.home),tmp=safe(data,'.copying');
  fs.mkdirSync(stage,{recursive:true});
  const expected=new Map(),needed=[];
  for(const {src,rel} of files){
    const dst=safe(stage,rel),sha=await hash(src);expected.set(rel,sha);
    if(!fs.existsSync(dst)||await hash(dst)!==sha)needed.push({src,rel,dst});
  }
  if(job.source)for(const f of walk(stage))if(!expected.has(path.relative(stage,f)))throw Error('Unexpected staged file: '+f);
  checkSpace(data,needed.reduce((n,f)=>n+fs.statSync(f.src).size,0));
  for(const {src,rel,dst} of needed){
    fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,tmp);
    if(await hash(tmp)!==expected.get(rel))throw Error('File changed: '+src);
    const stat=fs.statSync(src);fs.utimesSync(tmp,stat.atime,stat.mtime);fs.renameSync(tmp,dst);onCopy(rel);
  }
  if(job.source){
    const latest=inventory(job.source,job.home);
    if(latest.length!==files.length)throw Error('Library changed during migration.');
    for(const {src,rel} of latest)if(await hash(src)!==expected.get(rel)||await hash(safe(stage,rel))!==expected.get(rel))throw Error('File changed: '+src);
    validateCopy(stage);
    const cfg=safe(stage,'config','connections.json'),state=json(cfg);
    if(Object.keys(state.processes||{}).length){
      for(const [name,pid] of Object.entries(state.processes)){
        if(!Number.isInteger(pid)||pid<=0)continue;
        if(process.platform==='win32'){
          const list=require('node:child_process').execFileSync(path.join(process.env.SystemRoot,'System32','tasklist.exe'),['/FO','CSV','/NH','/FI','PID eq '+pid],{encoding:'utf8',windowsHide:true,timeout:5000});
          if(list.toLowerCase().includes('"'+name.toLowerCase()+'.exe"'))throw Error('Close the previous emulator: '+name);
        }
      }
      delete state.processes;record(cfg,state);
    }
  }else{
    // A fresh stage is private and has no user files. Resume initialization after interruption.
    for(const f of walk(stage))if(!['config/library.json','config/connections.json'].includes(path.relative(stage,f).split(path.sep).join('/')))throw Error(f);
    fs.mkdirSync(safe(stage,'config'),{recursive:true});
    record(safe(stage,'config','library.json'),{version:1});
    record(safe(stage,'config','connections.json'),{rom:{},save:{},metadata:{},emulator:{},migrated:true});
  }
  library(stage);fs.mkdirSync(safe(stage,'legacy-backups'),{recursive:true});
  if(fs.existsSync(root))throw Error(root);
  fs.renameSync(stage,root);record(marker,{version:1});fs.unlinkSync(journal);return root;
}
module.exports={initialize,previous,verifyConfig};
