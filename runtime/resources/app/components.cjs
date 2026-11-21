'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {Worker,isMainThread,parentPort,workerData}=require('node:worker_threads');
const {safe,space}=require('./library.cjs');
const pins=require('./component-hashes.json');
function inspect(file){
  const fd=fs.openSync(file,'r'),header=Buffer.alloc(64),machine=Buffer.alloc(6);let arch;
  try{
    fs.readSync(fd,header,0,64,0);
    if(process.platform==='win32'&&header.toString('ascii',0,2)==='MZ'){
      fs.readSync(fd,machine,0,6,header.readUInt32LE(60));
      if(machine.readUInt32LE(0)===0x4550)arch=({34404:'x64',43620:'arm64',332:'ia32'})[machine.readUInt16LE(4)];
    }else if(process.platform==='linux'&&header.readUInt32BE()===0x7f454c46)arch=({62:'x64',183:'arm64'})[header.readUInt16LE(18)];
  }finally{fs.closeSync(fd)}
  if(!arch||arch!==process.arch)throw Error('Исполняемый файл не подходит для '+process.platform+' '+process.arch);
  return arch;
}
async function release(name){
  const repo=name==='melonDS'?'melonDS-emu/melonDS':'mgba-emu/mgba';
  const response=await fetch('https://api.github.com/repos/'+repo+'/releases/latest',{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error('GitHub Releases: '+response.status);
  const r=await response.json(),win=process.platform==='win32',arm=process.arch==='arm64';
  if(!['win32','linux'].includes(process.platform)||!['arm64','x64','ia32'].includes(process.arch)||r.draft||r.prerelease)throw Error('Нет совместимой стабильной сборки');
  const suffix=name==='melonDS'?(win?'windows':'appimage')+'-'+(arm?'aarch64':process.arch==='ia32'?'x86':'x86_64')+'.zip':win?(arm?null:process.arch==='ia32'?'win32.7z':'win64.7z'):'appimage-'+(arm?'arm64':'x64')+'.appimage';
  const asset=suffix&&r.assets.find(a=>a.name.toLowerCase().endsWith('-'+suffix));
  if(!asset)throw Error('Официальная сборка для этой платформы отсутствует');
  if(!asset.browser_download_url.startsWith('https://github.com/'+repo+'/releases/download/'))throw Error('Неизвестный источник архива');
  return {asset,version:r.tag_name};
}
async function install(win,lib,name,report,dialog){
  report('Поиск стабильной версии');
  const {asset,version}=await release(name);
  const hash=asset.digest?.replace(/^sha256:/,'') || require('./component-hashes.json')[asset.name];
  if(!/^[a-f0-9]{64}$/i.test(hash||''))throw Error('Контрольная сумма этой версии пока недоступна. Подключи существующую установку.');
  report('Ожидание согласия');
  const yes=await dialog.showMessageBox(win,{type:'question',message:name+' '+version+' · '+process.arch,detail:'Скачать '+(asset.size/1048576).toFixed(1)+' МиБ с GitHub и подключить?',buttons:['Отмена','Скачать'],defaultId:0,cancelId:0});
  if(yes.response!==1)return;
  report('Загрузка',0,asset.size);
  const response=await fetch(asset.browser_download_url,{signal:AbortSignal.timeout(120000)});
  if(!response.ok)throw Error('Ошибка загрузки '+response.status);
  const chunks=[];
  let received=0,lastUpdate=0;
  for await(const chunk of response.body){
    received+=chunk.length;
    if(received>asset.size)throw Error('Загрузка превысила размер релиза');
    chunks.push(chunk);
    if(Date.now()-lastUpdate>100 || received===asset.size){
      report('Загрузка',received,asset.size);lastUpdate=Date.now();
    }
  }
  report('Проверка и распаковка');
  const bytes=Buffer.concat(chunks,received);
  if(bytes.length!==asset.size || crypto.createHash('sha256').update(bytes).digest('hex')!==hash)throw Error('Размер или SHA-256 архива не совпал');
  return extractAsync(lib,name,asset.name,bytes,version,hash);
}
function unpack(lib,name,filename,bytes,version,expected){
  if(!expected||crypto.createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Контрольная сумма дистрибутива не совпала');
  const parent=lib.component(name);fs.mkdirSync(parent,{recursive:true});space(parent,bytes.length*8);
  const dir=fs.mkdtempSync(path.join(parent,'release-')),file=path.join(dir,path.basename(filename));
  fs.writeFileSync(file,bytes,{flag:'wx'});let executable=file;
  if(!file.toLowerCase().endsWith('.appimage')){
    const options={cwd:dir,encoding:'utf8',windowsHide:true,timeout:60000};
    const linux=process.platform==='linux';
    const names=execFileSync(linux?'unzip':'tar',linux?['-Z1',filename]:['-tf',filename],options).trimEnd().split(/\r?\n/);
    for(const entry of names){
      if(!/^[A-Za-z0-9_. /+-]+$/.test(entry)||entry.startsWith('/')||entry.split('/').some(v=>v==='..'||v==='.'||v.endsWith('.')||v.endsWith(' ')||/^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(v)))throw Error('Небезопасное имя в архиве');
      const target=safe(dir,entry);if(entry.endsWith('/'))continue;
      fs.mkdirSync(path.dirname(target),{recursive:true});
      // Read a single member to stdout. The archiver never creates files or links.
      const fd=fs.openSync(target,'wx');
      try{execFileSync(linux?'unzip':'tar',linux?['-p',filename,entry]:['-xOf',filename,'--',entry],{cwd:dir,stdio:['ignore',fd,'pipe'],windowsHide:true,timeout:60000})}finally{fs.closeSync(fd)}
    }
    const match=names.find(entry=>linux?entry.toLowerCase().endsWith('.appimage'):path.basename(entry).toLowerCase()===name.toLowerCase()+'.exe');
    if(!match)throw Error('В архиве отсутствует исполняемый файл');
    executable=safe(dir,match);
  }
  const arch=inspect(executable);
  if(process.platform==='linux')fs.chmodSync(executable,0o755);
  if(name==='melonDS')fs.mkdirSync(safe(dir,path.relative(dir,path.dirname(executable)),'portable'),{recursive:true});
  else fs.closeSync(fs.openSync(safe(dir,path.relative(dir,path.dirname(executable)),'portable.ini'),'a'));
  return {path:executable,version,arch,sha256:crypto.createHash('sha256').update(fs.readFileSync(executable)).digest('hex')};
}
function fromArchive(lib,name,source){
  const filename=path.basename(source),version=/^[^-]+-([0-9.]+)-/.exec(filename)?.[1];
  if(!filename.toLowerCase().startsWith(name.toLowerCase()+'-')||!Object.hasOwn(pins,filename))throw Error('Выбери официальный архив поддерживаемой версии '+name);
  return extractAsync(lib,name,filename,fs.readFileSync(source),version,pins[filename]);
}
// Extraction invokes the platform archiver per member. Keep the Electron event loop responsive.
function extractAsync(lib,name,filename,bytes,version,expected){
  return new Promise((resolve,reject)=>{
    const worker=new Worker(__filename,{workerData:{root:lib.root,name,filename,bytes,version,expected}});
    worker.once('message',resolve);worker.once('error',reject);
    worker.once('exit',code=>{if(code)reject(Error('Распаковка прервана: '+code))});
  });
}
if(!isMainThread&&workerData){
  const {root,name,filename,bytes,version,expected}=workerData;
  parentPort.postMessage(unpack(require('./library.cjs').library(root),name,filename,Buffer.from(bytes),version,expected));
}
module.exports={inspect,install,release,fromArchive};
