'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {library}=require('../runtime/resources/app/library.cjs'),{prepare}=require('../runtime/resources/app/melonds-config.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'melonds-config-check-')),lib=library(path.join(root,'library'),{create:true});
const release=n=>{const dir=lib.at('emulators','melonds',n);fs.mkdirSync(dir,{recursive:true});return path.join(dir,'melonDS.exe')};
const config='[Instance0.Keyboard]\nA = 76\nB = 75\nHK_FastForward = 9\n[Instance0.Joystick]\nA = 3\n[Instance0.Window0]\nScreenLayout = 2\n[Instance0.Audio]\nVolume = 123\n[DS]\nFirmwarePath = "firmware.bin"\n';
const exe=release('original'),adjacent=path.join(path.dirname(exe),'melonDS.toml');fs.writeFileSync(adjacent,config);
const folder=prepare(lib,exe),cfg=path.join(folder,'melonDS.toml');assert.equal(fs.readFileSync(cfg,'utf8'),config);assert.equal(fs.readFileSync(adjacent,'utf8'),config);
const recovery=lib.at('config','melonds-config-recovery'),files=fs.readdirSync(recovery);assert.equal(files.length,1);assert.equal(fs.readFileSync(path.join(recovery,files[0]),'utf8'),config);
// Simulated normal emulator writes, then alternate direct/managed preparations.
const changed=config.replace('Volume = 123','Volume = 111');fs.writeFileSync(cfg,changed);
for(let i=0;i<4;i++){prepare(lib,exe);assert.equal(fs.readFileSync(cfg,'utf8'),changed)}
assert.deepEqual(fs.readdirSync(recovery),files);
// A conflicting adjacent file must never overwrite the selected portable profile.
fs.writeFileSync(adjacent,'defaults');prepare(lib,exe);assert.equal(fs.readFileSync(cfg,'utf8'),changed);
fs.writeFileSync(path.join(folder,'firmware.bin'),Buffer.from([1,2,3]));
const upgrade=release('upgrade');fs.mkdirSync(path.join(path.dirname(upgrade),'portable'));const upgraded=prepare(lib,upgrade,exe);assert.equal(fs.readFileSync(path.join(upgraded,'melonDS.toml'),'utf8'),changed);assert.deepEqual(fs.readFileSync(path.join(upgraded,'firmware.bin')),Buffer.from([1,2,3]));
const fresh=release('fresh');assert(fs.statSync(prepare(lib,fresh)).isDirectory());assert(!fs.existsSync(path.join(path.dirname(fresh),'portable','melonDS.toml')));
const legacy=release('legacy');fs.writeFileSync(path.join(path.dirname(legacy),'melonDS.ini'),'Key_A=76\n');assert.equal(fs.readFileSync(path.join(prepare(lib,legacy),'melonDS.ini'),'utf8'),'Key_A=76\n');
// Relocation copies the entire portable library; configuration bytes stay intact.
const relocated=path.join(root,'relocated');fs.cpSync(lib.root,relocated,{recursive:true});const moved=library(relocated),movedExe=path.join(relocated,path.relative(lib.root,upgrade));assert.equal(fs.readFileSync(path.join(prepare(moved,movedExe),'melonDS.toml'),'utf8'),changed);
// No save, profile, ROM, or battery-backup history is created by config preparation.
assert.equal(fs.readdirSync(lib.at('backups')).length,0);assert.equal(fs.readdirSync(lib.at('games')).length,0);
console.log('PASS: adjacent profile migration + immutable recovery; portable precedence; 4 repeated preparations; update resources; fresh defaults; legacy INI; relocated library; no game/save writes.');
fs.rmSync(root,{recursive:true,force:true});
// Exercise the real managed launcher with a disposable executable and process stub.
async function launcherChecks(){
 const cp=require('node:child_process'),{EventEmitter}=require('node:events'),components=require('../runtime/resources/app/components.cjs');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'melonds-launch-check-')),l=library(path.join(temp,'library'),{create:true}),home=path.join(temp,'home');fs.mkdirSync(home);
 const dir=l.at('emulators','melonds','release');fs.mkdirSync(dir,{recursive:true});const exe=path.join(dir,'melonDS.exe');fs.writeFileSync(exe,'test executable');fs.writeFileSync(path.join(dir,'melonDS.toml'),config);
 const originalSpawn=cp.spawn,originalInspect=components.inspect;let calls=[];
 cp.spawn=(executable,args,options)=>{calls.push({executable,args,options});const c=new EventEmitter();c.pid=2147483000; c.unref=()=>{};process.nextTick(()=>{c.emit('spawn');setImmediate(()=>c.emit('exit',0,null))});return c};components.inspect=()=>{};
 try{const m=require('../runtime/resources/app/managed.cjs').managed({home,fixedRoot:l.root,app:{getPath:()=>path.join(temp,'helper.exe')},dialog:{showErrorBox(){throw Error('Unexpected dialog')}},win:()=>null,legacy:{rom:{},save:{},emulator:{}},cache:{}});await m.init();m.recordComponent('melonDS',{path:exe,version:'1.1',arch:'x64',sha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(exe)).digest('hex')});
 for(let i=0;i<3;i++){await m.launch('melonDS');await new Promise(r=>setImmediate(r));assert.equal(fs.readFileSync(path.join(dir,'portable','melonDS.toml'),'utf8'),config)}
 assert.equal(calls.length,3);for(const c of calls){assert.equal(c.executable,exe);assert.equal(c.options.cwd,dir);assert.deepEqual(c.args,[]);assert.equal(c.options.shell,false)}
 console.log('PASS: real managed.launch path, cwd, arguments, configuration and custom settings across 3 stubbed launches. Emulator GUI was NOT run.');
 }finally{cp.spawn=originalSpawn;components.inspect=originalInspect;fs.rmSync(temp,{recursive:true,force:true})}
}
launcherChecks().catch(e=>{console.error(e);process.exitCode=1});
