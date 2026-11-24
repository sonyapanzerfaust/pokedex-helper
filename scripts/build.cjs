'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),app=path.join(root,'runtime/resources/app'),out=path.join(root,'dist');
const {desktop,source}=require('./release-files.cjs');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function copy(from,to,files){for(const f of files){const target=path.join(to,f);fs.mkdirSync(path.dirname(target),{recursive:true});fs.cpSync(path.join(from,f),target,{recursive:true})}}
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(300000)});if(!r.ok)throw Error(url+' '+r.status);return Buffer.from(await r.arrayBuffer())}
async function build(target){
  if(!['source','win32-ia32','win32-x64','win32-arm64','linux-x64','linux-arm64'].includes(target))throw Error('Unknown target '+target);
  const stage=fs.mkdtempSync(path.join(os.tmpdir(),'pokedex-build-'));
  const portable=['win32-x64','linux-x64'].includes(target),prefix='Pokedex-Helper-'+require(path.join(app,'package.json')).version+'-portable-'+target,folderName=portable?'PokedexHelper':prefix,folder=path.join(stage,folderName);fs.mkdirSync(folder);
  if(target==='linux-x64' && process.platform!=='linux')throw Error('Build the Linux portable archive on Linux to preserve executable permissions.');
  if(target==='source'){copy(root,folder,source)}
  else{
    const version=target==='win32-ia32'?'43.8.12':'45.3.3';
    const local=process.env.POKEDEX_RUNTIME_CACHE,asset='electron-v'+version+'-'+target+'.zip',base='https://github.com/electron/electron/releases/download/v'+version+'/';
    const zip=local?fs.readFileSync(path.join(local,target==='win32-ia32'?asset:'electron-'+target.split('-')[1]+'.zip')):await get(base+asset);
    const sums=local?fs.readFileSync(path.join(local,'SHASUMS256.txt'),'utf8'):(await get(base+'SHASUMS256.txt')).toString();
    const expected=target==='win32-ia32'?'e25dbd7102c2df6e100427822083e181dd67aea7a8de02249bc8dc18ddbf4e45':sums.split(/\r?\n/).map(l=>l.trim().split(/\s+\*?/)).find(([,name])=>name===asset)?.[0];
    if(hash(zip)!==expected)throw Error('Electron SHA-256 mismatch');
    const file=path.join(stage,'runtime.zip');fs.writeFileSync(file,zip);
    if(process.platform==='win32')execFileSync('tar',['-xf',file,'-C',folder]);else execFileSync('unzip',['-q',file,'-d',folder]);
    copy(app,path.join(folder,'resources/app'),desktop);
    const windows=target.startsWith('win32'),exe=path.join(folder,windows?'electron.exe':'electron');
    if(windows){
      const binary=fs.readFileSync(exe),machine=binary.readUInt16LE(binary.readUInt32LE(60)+4);
      if(machine!==(target.endsWith('ia32')?332:target.endsWith('arm64')?43620:34404))throw Error('Unexpected PE architecture');
    }
    if(portable && windows){
      if(process.platform!=='win32')throw Error('Build the Windows release candidate on Windows to embed the icon.');
      execFileSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(root,'scripts','embed-icon.ps1'),exe,path.join(app,'art','notebook.ico')],{stdio:'inherit'});
    }
    fs.renameSync(exe,path.join(folder,windows?'PokedexHelper.exe':'PokedexHelper'));
    if(portable){
      const appDir=path.join(folder,'resources','app'),meta=path.join(appDir,'package.json');
      fs.writeFileSync(meta,JSON.stringify({...JSON.parse(fs.readFileSync(meta)),portable:true}));
      const files=fs.readdirSync(appDir,{recursive:true}).filter(f=>fs.statSync(path.join(appDir,f)).isFile());
      fs.writeFileSync(path.join(appDir,'portable-integrity.json'),JSON.stringify(Object.fromEntries(files.map(f=>[f.split(path.sep).join('/'),hash(fs.readFileSync(path.join(appDir,f)))]))));
      fs.renameSync(path.join(folder,'LICENSE'),path.join(folder,'LICENSE-electron.txt'));
      fs.mkdirSync(path.join(folder,'data'));copy(root,folder,['PORTABLE.md','THIRD_PARTY_NOTICES.md','RELEASE-NOTES.md','LICENSE']);
    }else{copy(root,folder,['PORTABLE.md','THIRD_PARTY_NOTICES.md','LICENSE'])}
  }
  fs.mkdirSync(out,{recursive:true});
  const gz=target==='source'||target.startsWith('linux'),artifact=path.join(out,prefix+(gz?'.tar.gz':'.zip'));
  if(gz)execFileSync('tar',['-czf',artifact,'-C',stage,folderName]);
  else if(process.platform==='win32')execFileSync('tar',['-acf',artifact,'-C',stage,folderName]);
  else execFileSync('zip',['-qr',artifact,folderName],{cwd:stage});
  const listing=execFileSync(gz||process.platform==='win32'?'tar':'unzip',gz||process.platform==='win32'?['-tf',artifact]:['-Z1',artifact],{encoding:'utf8'}).split(/\r?\n/);
  if(!listing.some(x=>x.endsWith('/index.html'))||listing.some(x=>/\.(sav|nds|gba|mch)$/i.test(x)))throw Error('Unexpected archive contents');
  if(target==='source'){
    const actual=listing.map(f=>f.trim().replaceAll('\\','/')).filter(f=>f&&!f.endsWith('/')).map(f=>f.slice(folderName.length+1)).sort();
    require('node:assert/strict').deepEqual(actual,[...source].sort());
    for(const f of source){
      const text=fs.readFileSync(path.join(folder,f)).toString('utf8');
      if([root,os.homedir(),process.env.USERNAME&&'Users/'+process.env.USERNAME].filter(Boolean).some(v=>text.toLowerCase().includes(v.toLowerCase()))||/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text)||/gh[pousr]_[a-zA-Z0-9]{30,}/.test(text))throw Error('Review candidate source: '+f);
    }
    fs.writeFileSync(artifact+'.files.txt',actual.join('\n')+'\n');
  }
  if(portable){
    if(listing.some(f=>/\/data\/.+|\.(?:pem|key|pfx|dmp|nds|gba|sav|srm|bin\.bak)$|\/(?:emulators|backups|\.git)\//i.test(f)))throw Error('Personal data or emulator files in package');
    const appDir=path.join(folder,'resources','app');
    for(const f of fs.readdirSync(appDir,{recursive:true}).filter(f=>/\.(js|cjs|json|html|css|ps1|svg|txt)$/i.test(f))){
      const content=fs.readFileSync(path.join(appDir,f),'utf8');
      if(content.includes(root)||content.includes(os.homedir()))throw Error('Local path or private key in package: '+f);
    }
    const local=path.join(out,'PokedexHelper'),dest=fs.existsSync(local)?fs.mkdtempSync(local+'-'):local;
    fs.cpSync(folder,dest,{recursive:true,errorOnExist:true,force:false});
    console.log('Unpacked:',dest);
  }
  const sum=hash(fs.readFileSync(artifact));fs.writeFileSync(artifact+'.sha256',sum+'  '+path.basename(artifact)+'\n');console.log(path.basename(artifact),sum);
  if(fs.realpathSync(path.dirname(stage))!==fs.realpathSync(os.tmpdir())||!path.basename(stage).startsWith('pokedex-build-'))throw Error('Unexpected staging directory');
  fs.rmSync(stage,{recursive:true,force:true});
}
(async()=>{for(const target of process.argv.slice(2))await build(target)})().catch(e=>{console.error(e);process.exitCode=1});
