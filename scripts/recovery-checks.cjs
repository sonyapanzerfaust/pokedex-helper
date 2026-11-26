'use strict';
// All mutations use generated or copied fixtures inside a new temporary library.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const app=path.resolve(__dirname,'../runtime/resources/app');
const {library}=require(path.join(app,'library.cjs')),{managed}=require(path.join(app,'managed.cjs'));
const {recovery,battery,digest}=require(path.join(app,'recovery.cjs')),{management}=require(path.join(app,'save-management.cjs'));
function emerald(){
  const bytes=Buffer.alloc(131072);
  for(const bank of [0,0xe000])for(let i=0;i<14;i++){
    const page=bytes.subarray(bank+i*4096,bank+(i+1)*4096);
    if(!i){page.writeUInt32LE(7,0xac);page[0x900]=1;page[0x28]=page[0x5c]=1}
    page.writeUInt16LE(i,0xff4);page.writeUInt32LE(0x08012025,0xff8);page.writeUInt32LE(bank?2:1,0xffc);
    let sum=0;for(let j=0;j<0xf80;j+=4)sum=(sum+page.readUInt32LE(j))>>>0;
    page.writeUInt16LE((sum+(sum>>>16))&65535,0xff6);
  }
  return bytes;
}
async function run(){
  const base=fs.mkdtempSync(path.join(os.tmpdir(),'pokedex-recovery-')),home=path.join(base,'helper');
  const lib=library(path.join(base,'lib'),{create:true}),data=path.join(home,'data');
  fs.mkdirSync(data,{recursive:true});
  fs.writeFileSync(path.join(data,'library-location.json'),JSON.stringify({root:lib.root}));
  const sav=lib.game('Emerald','save'),fresh=Buffer.concat([emerald(),Buffer.alloc(16,0x42)]);fs.writeFileSync(sav,fresh);
  const connections={rom:{Emerald:true},save:{Emerald:true},metadata:{},emulator:{},migrated:true};
  if(process.argv[2]){fs.copyFileSync(process.argv[2],lib.game('Platinum','save'));connections.save.Platinum=true}
  fs.writeFileSync(lib.at('config','connections.json'),JSON.stringify(connections));
  const m=managed({home,app:{getPath:()=>path.join(home,'app.exe')},cache:{},legacy:{save:{},rom:{},emulator:{}}});await m.init();
  const prefs={configured:true,theme:'green',manual:{badge:true},deferred:{446:true},caught:{1:true},milestones:{abc:9}};
  let current=prefs,blocked=false,approve=true;
  m.guard=()=>{if(blocked)throw Error('emulator running')};
  const dialog={showMessageBox:async()=>({response:approve?1:0})};
  const svc=management({manager:m,dialog,win:()=>null,read:()=>current,persist:(_,v)=>{current=v},i18n:{language:'en',message:x=>x,set(){}},legacyFolder:base,refresh:()=>{}});
  const view=(id='main')=>svc.view('Emerald',id),act=(action,key,id='main')=>svc.action(action,'Emerald',id,key);
  const id=m.addProfile('Emerald','Treecko',sav),sibling=m.active('Emerald',id);
  await act('make',null,id);assert.equal(view(id).entries.length,1);
  if(process.argv[2]){await svc.action('make','Platinum','main');assert.equal(svc.view('Platinum').entries.length,1)}
  assert.equal(await act('make'),'done');assert.equal(await act('make'),'duplicate');
  const unknown=lib.at('backups','personal.sav');fs.writeFileSync(unknown,fresh);
  const historic=lib.at('backups','emerald_'+digest(fresh)+'.sav');fs.writeFileSync(historic,fresh);
  for(let i=1;i<=11;i++){fresh.writeUInt32LE(i,0x1ffff-4);fs.writeFileSync(sav,fresh);await act('make')}
  assert.equal(view().entries.length,10);assert.equal(view(id).entries.length,1);assert(fs.existsSync(unknown));
  const target=view().entries.at(-1),r=recovery(lib,'Emerald','main',sav,m.guard);
  fresh.writeUInt32LE(30,0x1ffff-4);fs.writeFileSync(sav,fresh);
  blocked=true;await assert.rejects(act('restore',target.key),/running/);blocked=false;
  approve=false;await act('restore',target.key);assert(fs.readFileSync(sav).equals(fresh));approve=true;
  assert.throws(()=>r.restore(target.key,()=>{throw Error('simulated verification failure')}),/simulated/);
  assert(fs.readFileSync(sav).equals(fresh));
  await act('restore',target.key);assert.equal(battery(sav,'Emerald').hash,target.hash);
  assert(view().entries.some(x=>x.hash===digest(fresh)));assert(view().entries.some(x=>x.key===target.key));
  assert(view().entries.length<=10);
  assert(!fs.readFileSync(sibling).equals(fs.readFileSync(sav)));
  const exported=path.join(base,'export.sav');r.exp(target.key,exported);
  assert.equal(digest(fs.readFileSync(exported)),target.hash);
  await act('delete',target.key);assert(!view().entries.some(x=>x.key===target.key));
  assert.throws(()=>r.exp(view().entries[0].key,sav),/PH_EXPORT/);
  assert.throws(()=>svc.view('Platinum',id),/PH_PROFILE/);
  const counts=view().entries.length;
  await svc.reset(false,false);assert.equal(view().entries.length,counts);assert(fs.existsSync(sav));assert.deepEqual(current.deferred,prefs.deferred);assert.deepEqual(current.manual,prefs.manual);
  blocked=true;await assert.rejects(svc.reset(true,false),/running/);assert(fs.existsSync(sav));blocked=false;
  await svc.reset(false,true);assert.equal(view().entries.length,0);assert(fs.existsSync(sav));assert(fs.existsSync(sibling));assert(fs.existsSync(unknown));
  await act('make');await svc.reset(true,false);assert(!fs.existsSync(sav));assert(!fs.existsSync(sibling));assert.equal(view().entries.length,1);
  await act('restore',view().entries[0].key);assert(fs.existsSync(sav));assert(fs.existsSync(exported));
  const legacy=path.join(base,'older.sav');fs.writeFileSync(legacy,fresh);
  const archived=(await svc.action('archive')).find(x=>x.name==='older.sav');
  assert.equal(archived.game,'Emerald');await act('archiveImport',{name:archived.name,hash:archived.hash});
  assert(fs.readFileSync(legacy).equals(fresh));assert(view().entries.some(x=>x.hash===archived.hash));
  fs.writeFileSync(legacy+'.json',JSON.stringify({sha256:'wrong'}));assert((await svc.action('archive')).find(x=>x.name==='older.sav').error);
  console.log('Disposable backups, profile isolation, retention, restore, rollback, reset and export OK');
}
module.exports={emerald};
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1});
