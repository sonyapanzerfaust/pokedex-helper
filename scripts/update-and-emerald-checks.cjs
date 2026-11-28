'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const cp=require('node:child_process'),{EventEmitter}=require('node:events');
const app='../runtime/resources/app/';
const {candidate,replaceFiles}=require(app+'helper-update.cjs');
const {library,hash}=require(app+'library.cjs'),components=require(app+'components.cjs');
const {emerald}=require('./recovery-checks.cjs');
async function check(){
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'helper-regression-')),root=path.join(temp,'installed');
  const originalSpawn=cp.spawn,originalInspect=components.inspect,originalExec=cp.execFileSync;
  try{
    const source=path.join(temp,'release'),stage=path.join(temp,'stage');
    for(const p of [root,source,stage])fs.mkdirSync(p);
    const binary=process.platform==='win32'?'PokedexHelper.exe':'PokedexHelper';
    for(const p of [root,source]){
      fs.mkdirSync(path.join(p,'data'));fs.writeFileSync(path.join(p,'data','progress'),p);
      fs.mkdirSync(path.join(p,'resources'));fs.writeFileSync(path.join(p,binary),p);
    }
    replaceFiles(root,source,stage);
    assert.equal(fs.readFileSync(path.join(root,'data','progress'),'utf8'),root);
    assert.equal(fs.readFileSync(path.join(root,binary),'utf8'),source);
    const asset='Pokedex-Helper-1.10.0-portable-linux-x64.tar.gz';
    const release={tag_name:'v1.10',assets:[{name:asset,size:123,digest:'sha256:'+'a'.repeat(64),browser_download_url:'https://github.com/sonyapanzerfaust/pokedex-helper/releases/download/v1.10/'+asset}]};
    assert.equal(candidate(release,'1.2.1','linux','x64').version,'1.10.0');
    assert.equal(candidate(release,'1.10.1','linux','x64'),undefined);
    assert.throws(()=>candidate({...release,assets:[]},'1.2.1','linux','x64'));
    const lib=library(path.join(temp,'library'),{create:true}),exe=lib.at('emulators','mgba','release','mGBA.exe');
    fs.mkdirSync(path.dirname(exe),{recursive:true});fs.writeFileSync(exe,'stub');
    const rom=path.join(temp,'emerald.gba'),buffer=Buffer.alloc(1024);
    buffer.write('EMERALD',160);buffer.write('BPEE01',172);buffer[178]=0x96;buffer[3]=0xea;
    buffer[189]=-(0x19+buffer.subarray(160,189).reduce((a,b)=>a+b,0));fs.writeFileSync(rom,buffer);
    const trailer=Buffer.alloc(16,0x42),save=Buffer.concat([emerald(),trailer]);
    fs.writeFileSync(path.join(temp,'emerald.sav'),save);
    const m=require(app+'managed.cjs').managed({fixedRoot:lib.root,home:temp,app:{},legacy:{save:{},rom:{},emulator:{}},
      cache:{},report(){},win:()=>null,dialog:{showMessageBox:async()=>({response:0})}});
    // Libraries created before 1.2.1 could remember an adjacent, unimported save.
    fs.writeFileSync(lib.at('config','connections.json'),JSON.stringify({rom:{},save:{},emulator:{},metadata:{},expectedSave:{Emerald:true}}));
    await m.init();m.recordComponent('mGBA',{path:exe,version:'test',arch:process.arch,sha256:await hash(exe)});
    await m.choose('rom','Emerald',rom);
    const sav=m.active('Emerald');assert(!fs.existsSync(sav));
    components.inspect=()=>{};let launches=0;
    cp.spawn=(_,args)=>{
      assert(args.includes('savegamePath='+path.dirname(sav)));launches++;
      const child=new EventEmitter();child.pid=2147483000;child.unref=()=>{};
      process.nextTick(()=>child.emit('spawn'));return child;
    };
    await m.launch('mGBA','Emerald');assert(!fs.existsSync(sav));
    fs.writeFileSync(sav,Buffer.concat([Buffer.alloc(131072,255),trailer]));
    await m.launch('mGBA','Emerald');
    fs.unlinkSync(sav);
    cp.execFileSync=(exe,...args)=>path.basename(exe)==='tasklist.exe'?'':originalExec(exe,...args);
    await m.choose('save','Emerald',path.join(temp,'emerald.sav'));
    assert(fs.readFileSync(sav).equals(save));await m.launch('mGBA','Emerald');
    fs.unlinkSync(sav);await assert.rejects(m.launch('mGBA','Emerald'));
    assert.equal(launches,3);
    const ndsSave=require('./save-checks.cjs').platinumFixture;
    const ndsInput=path.join(temp,'platinum.sav');
    fs.writeFileSync(ndsInput,ndsSave);
    await m.choose('save','Platinum',ndsInput);
    assert(fs.readFileSync(m.active('Platinum')).equals(ndsSave));
    assert(fs.readFileSync(ndsInput).equals(ndsSave));
    console.log('Portable update, data preservation, fresh Emerald launch and GBA/NDS save imports passed.');
  }finally{cp.execFileSync=originalExec;cp.spawn=originalSpawn;components.inspect=originalInspect;fs.rmSync(temp,{recursive:true,force:true})}
}
check().catch(e=>{console.error(e);process.exitCode=1});
