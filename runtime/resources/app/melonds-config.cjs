'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {safe}=require('./library.cjs');
// melonDS 1.1 pathInit(): <exe>/portable takes precedence over <exe>.
// Never create an empty override before preserving an adjacent portable config.
function prepare(lib,exe,previousExe){
  const cwd=path.dirname(exe),relative=path.relative(lib.root,cwd);
  const target=lib.at(relative,'portable');
  const files=['melonDS.toml','melonDS.ini'];
  const has=dir=>files.some(n=>fs.existsSync(safe(dir,n)));
  let source;
  if(has(target))return target;
  if(has(cwd))source=cwd;
  else if(previousExe){
    const prior=path.dirname(previousExe),portable=safe(prior,'portable');
    source=has(portable)?portable:has(prior)?prior:null;
  }
  if(source){
    // Recovery copies are immutable and content addressed, outside emulator data.
    const recover=lib.at('config','melonds-config-recovery');fs.mkdirSync(recover,{recursive:true});
    for(const n of files){
      const from=safe(source,n);if(!fs.existsSync(from))continue;
      const bytes=fs.readFileSync(from),sum=crypto.createHash('sha256').update(bytes).digest('hex');
      const backup=lib.at('config','melonds-config-recovery',sum+'-'+n);
      if(!fs.existsSync(backup))fs.writeFileSync(backup,bytes,{flag:'wx'});
      if(!fs.readFileSync(backup).equals(bytes))throw Error('melonDS configuration recovery verification failed');
    }
    // Copy all portable resources on upgrade (firmware, paths, etc.), not defaults.
    const stage=lib.at(relative,'.melonds-config-'+crypto.randomUUID());fs.mkdirSync(stage);
    try{
      if(path.basename(source)==='portable'){
        const walk=(dir,rel='')=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){
          const r=path.join(rel,e.name),from=safe(source,r),to=safe(stage,r);
          if(e.isDirectory()){fs.mkdirSync(to);walk(from,r)}
          else if(e.isFile()){fs.copyFileSync(from,to);if(!fs.readFileSync(from).equals(fs.readFileSync(to)))throw Error('melonDS configuration copy failed')}
          else throw Error('Unsupported melonDS configuration entry');
        }};walk(source);
      }else for(const n of files){const from=safe(source,n);if(fs.existsSync(from))fs.copyFileSync(from,safe(stage,n))}
      fs.mkdirSync(target,{recursive:true});
      for(const e of fs.readdirSync(stage)){const to=safe(target,e);if(fs.existsSync(to))throw Error('Conflicting melonDS portable resource: '+e)}
      for(const e of fs.readdirSync(stage))fs.renameSync(safe(stage,e),safe(target,e));
    }finally{fs.rmSync(stage,{recursive:true,force:true})}
  }else fs.mkdirSync(target,{recursive:true});
  fs.accessSync(target,fs.constants.R_OK|fs.constants.W_OK);
  return target;
}
module.exports={prepare};
