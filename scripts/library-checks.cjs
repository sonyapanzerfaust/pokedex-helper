'use strict';
// Optional read-only fixtures: ROM SAV melonDS.zip mGBA.7z
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {library,identify,hash}=require('../runtime/resources/app/library.cjs');
const {managed}=require('../runtime/resources/app/managed.cjs'),{parse}=require('../runtime/resources/app/save.js');
async function run(){
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'PokedexLibrary-')),root=path.join(temp,'Game Library'),home=path.join(temp,'profile'),data=path.join(home,'data');
  const lib=library(root,{create:true});fs.mkdirSync(data,{recursive:true});fs.writeFileSync(path.join(data,'library-location.json'),JSON.stringify({root}));
  const source=path.join(temp,'Тест с пробелами');fs.mkdirSync(source);
  const dialog={showMessageBox:async()=>({response:1}),showErrorBox:console.error};
  const options={home,win:()=>null,app:{getPath:()=>path.join(home,'bin','app.exe')},report:()=>{},dialog,legacy:{rom:{},save:{},emulator:{}},cache:{}};
  let m=managed(options);await m.init();await assert.rejects(()=>m.launch('melonDS','Platinum'),/установи/);
  const bytes=Buffer.alloc(8192);bytes.write('POKEMON PL');bytes.write('CPUE01',12);
  for(const [o,len] of [[32,44],[48,60],[64,68],[72,76]]){bytes.writeUInt32LE(512+o*8,o);bytes.writeUInt32LE(16,len)}
  let crc=65535;for(const v of bytes.subarray(0,350)){crc^=v;for(let i=0;i<8;i++)crc=(crc>>>1)^(crc&1?0xa001:0)}bytes.writeUInt16LE(crc,350);
  const fixture=path.join(source,'картридж.nds');fs.writeFileSync(fixture,bytes);
  assert.deepEqual(identify(fixture).warnings,[]);assert.equal(identify(fixture).code,'CPUE');await m.choose('rom','Platinum',fixture);
  bytes[4096]=9;bytes[350]^=1;fs.writeFileSync(fixture,bytes);assert.equal(identify(fixture).warnings.length,1);await m.choose('rom','Platinum',fixture);await m.choose('rom','Platinum',fixture);
  assert.equal(await hash(fixture),await hash(lib.game('Platinum','rom')));
  bytes.write('ZZZZ',12);fs.writeFileSync(fixture,bytes);assert.throws(()=>identify(fixture),/Неизвестный/);
  const [rom,sav,melon,mgba]=process.argv.slice(2);
  if(rom&&sav){
    const original=[await hash(rom),await hash(sav)];
    options.legacy={rom:{Platinum:rom},save:{Platinum:sav},emulator:{}};
    // Use a pristine library for the migration scenario.
    const fresh=library(path.join(temp,'Migration Library'),{create:true});fs.writeFileSync(path.join(data,'library-location.json'),JSON.stringify({root:fresh.root}));
    m=managed(options);await m.init();await m.migrate();
    assert.equal(await hash(m.paths.rom.Platinum),original[0]);assert.equal(await hash(m.paths.save.Platinum),original[1]);
    await m.choose('save','Platinum',sav);
    let meta=m.paths.metadata.Platinum,progress=parse(fs.readFileSync(m.paths.save.Platinum));
    console.log(meta.code,meta.size,meta.warnings,progress.caught.length,'Caught',progress.seen.length,'Seen');
    for(const [name,file] of [['melonDS',melon],['mGBA',mgba]])if(file)await m.choose('emulator',name,file);
    m=managed(options);await m.init();assert.equal(m.paths.save.Platinum,fresh.game('Platinum','save'));
    const active=m.paths.save.Platinum;fs.renameSync(active,active+'.test');await assert.rejects(()=>m.launch('melonDS','Platinum'),/сохранение/);fs.renameSync(active+'.test',active);
    if(process.env.POKEDEX_CHECK_SPAWN==='1'){
      await m.launch('melonDS','Platinum');
      const log=()=>fs.readFileSync(fresh.at('logs','launch.jsonl'),'utf8').trim().split('\n').map(x=>JSON.parse(x));
      const event=log().find(e=>e.event==='spawn');assert.deepEqual(event.args,[fresh.game('Platinum','rom')]);
      console.log('spawn',event.pid,event.exe,JSON.stringify(event.args));
      try{await new Promise(r=>setTimeout(r,3500));await assert.rejects(()=>m.launch('melonDS','Platinum'),/Закрой/)}
      finally{
        if(process.platform==='win32'&&!log().some(e=>e.event==='exit')){
          const {execFileSync}=require('node:child_process');
          const output=execFileSync('powershell.exe',['-NoProfile','-Command',"$p=Get-Process -Id "+Number(event.pid)+"; $p.MainWindowTitle; $p.CloseMainWindow()"],{windowsHide:true,encoding:'utf8'});
          console.log('Window / close:',output.trim());
          for(let i=0;i<30&&!log().some(e=>e.event==='exit');i++)await new Promise(r=>setTimeout(r,100));
        }
        if(!log().some(e=>e.event==='exit'))process.kill(event.pid)
      }
      await new Promise(r=>setTimeout(r,500));
      const stdout=fs.readFileSync(fresh.at('logs','melonds.log'),'utf8');console.log('melonDS:',stdout.split(/\r?\n/).filter(x=>/ROM|Cart|save|serial|CPU[E]|boot|error/i.test(x)).slice(-16));
    }
    assert.deepEqual([await hash(rom),await hash(sav)],original);
    assert.throws(()=>fresh.at('..','outside'));
    fs.renameSync(fresh.root,fresh.root+'-offline');await assert.rejects(()=>managed(options).init(),/недоступна/);assert(!fs.existsSync(fresh.root));
  }
  console.log('Library integration OK');
  if(path.dirname(temp)===path.resolve(os.tmpdir())&&path.basename(temp).startsWith('PokedexLibrary-'))fs.rmSync(temp,{recursive:true,force:true});
}
run().catch(e=>{console.error(e);process.exitCode=1});
