'use strict';
// Optional Windows launch check. The source library is opened for reading only.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {library,emulator}=require('../runtime/resources/app/library.cjs');
const {managed}=require('../runtime/resources/app/managed.cjs');
async function run(){
  if(process.platform!=='win32'||!process.argv[2])throw Error('Supply a Windows managed library path');
  const source=path.resolve(process.argv[2]),root=fs.mkdtempSync(path.join(os.tmpdir(),'dex-launch-copy-'));
  const home=path.join(root,'helper'),data=path.join(home,'data'),lib=library(path.join(root,'Пользователь','Мои игры','Pokédex Helper','data','library'),{create:true});
  const state=JSON.parse(fs.readFileSync(path.join(source,'config','connections.json')));
  const games=['Platinum','Emerald'];
  for(const g of games)for(const k of ['rom','save']){
    const dest=lib.game(g,k);fs.copyFileSync(path.join(source,path.relative(lib.root,dest)),dest);
  }
  fs.cpSync(path.join(source,'emulators'),lib.at('emulators'),{recursive:true});
  for(const variable of ['APPDATA','LOCALAPPDATA']){process.env[variable]=path.join(root,variable);fs.mkdirSync(process.env[variable])}
  delete state.processes;delete state.selected;delete state.profiles;
  fs.mkdirSync(data,{recursive:true});fs.writeFileSync(path.join(data,'library-location.json'),JSON.stringify({root:lib.root}));
  fs.writeFileSync(lib.at('config','connections.json'),JSON.stringify(state));
  let activeLib=lib,drive;
  const subst=path.join(process.env.SystemRoot,'System32','subst.exe'),exec=require('node:child_process').execFileSync;
  try{
  if(process.argv.includes('--relocate')){
    const folder=path.join(root,'Переносимая копия'),dataRoot=path.join(folder,'data');
    const portable=require('../runtime/resources/app/portable.cjs');await portable.initialize(dataRoot,{oldHome:home,choose:async()=>'copy'});
    drive=['V:','W:','X:'].find(x=>!fs.existsSync(x+path.sep));if(!drive)throw Error('No free drive letter');
    exec(subst,[drive,root]);activeLib=library(await portable.initialize(path.join(drive+path.sep,path.basename(folder),'data')));
  }
  const m=managed({home,fixedRoot:activeLib.root,app:{getPath:()=>path.join(home,'client.exe')},dialog:{showErrorBox(){}},win:()=>null,legacy:{rom:{},save:{},emulator:{}},cache:{}});await m.init();
  for(const g of games){
    const name=emulator(g);await m.launch(name,g);
    const record=fs.readFileSync(activeLib.at('logs','launch.jsonl'),'utf8').trim().split('\n').map(x=>JSON.parse(x)).at(-1);
    assert.equal(record.event,'spawn');assert.equal(record.rom,activeLib.game(g,'rom'));assert.equal(record.save,m.active(g));assert.equal(path.resolve(record.cwd,record.args.at(-1)),record.rom);
    try{
      await new Promise(r=>setTimeout(r,1200));process.kill(record.pid,0);
      const title=require('node:child_process').execFileSync('powershell.exe',['-NoProfile','-Command','[Console]::OutputEncoding=[Text.Encoding]::UTF8;(Get-Process -Id '+record.pid+').MainWindowTitle'],{encoding:'utf8',windowsHide:true});console.log(g,title.trim());
      assert.throws(()=>m.guard(g,record.save),/Закрой/);await assert.rejects(m.launch(name,g),/Закрой/);console.log(g,name,'started on disposable files; replacement blocked');
    }finally{try{process.kill(record.pid)}catch(e){if(e.code!=='ESRCH')throw e}}
    await new Promise(r=>setTimeout(r,350));
  }
  }finally{if(drive)exec(subst,[drive,'/D'])}
  if(path.dirname(root)===path.resolve(os.tmpdir())&&path.basename(root).startsWith('dex-launch-copy-'))fs.rmSync(root,{recursive:true});
}
run().catch(e=>{console.error(e);process.exitCode=1});
