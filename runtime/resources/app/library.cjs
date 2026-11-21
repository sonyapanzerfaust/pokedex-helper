'use strict';
const fs=require('node:fs'),p=require('node:path'),crypto=require('node:crypto');
const {pipeline}=require('node:stream/promises'),{Transform}=require('node:stream');
const games={Platinum:'CPU',HeartGold:'IPK',SoulSilver:'IPG',Diamond:'ADA',Pearl:'APA',Emerald:'BPE',FireRed:'BPR',LeafGreen:'BPG'};
const gba=g=>['Emerald','FireRed','LeafGreen'].includes(g);
const emulator=g=>gba(g)?'mGBA':'melonDS';
const inside=(base,file)=>{const rel=p.relative(base,file);return rel===''||(!rel.startsWith('..'+p.sep)&&rel!=='..'&&!p.isAbsolute(rel))};
function safe(root,...parts){
  const file=p.resolve(root,...parts);
  if(!inside(root,file))throw Error('Путь за пределами библиотеки');
  let current=p.parse(file).root;
  for(const part of file.slice(current.length).split(p.sep).filter(Boolean)){
    current=p.join(current,part);
    const s=fs.lstatSync(current,{throwIfNoEntry:false});
    if(s&&(s.isSymbolicLink()||(s.isFile()&&s.nlink!==1)))throw Error('Ссылка в пути библиотеки: '+current);
  }
  return file;
}
function space(dir,size){const s=fs.statfsSync(dir);if(s.bavail*s.bsize<size+4*1024*1024)throw Error('Недостаточно места: '+dir)}
function library(root,{create=false,excluded=[]}={}){
  if(!p.isAbsolute(root)||p.resolve(root)===p.parse(root).root||excluded.some(x=>x&&inside(x,root)))throw Error('Выбери отдельную папку для библиотеки');
  root=p.resolve(root);
  safe(root);
  if(create)fs.mkdirSync(root,{recursive:true});
  const marker=safe(root,'config','library.json');
  if(!create&&!fs.existsSync(marker))throw Error('Сохранённая библиотека недоступна: '+root);
  if(create&&!fs.existsSync(marker)&&fs.readdirSync(root).length)throw Error('Для новой библиотеки выбери пустую папку');
  space(root,0);
  const probe=safe(root,'.probe-'+crypto.randomUUID());fs.writeFileSync(probe,'',{flag:'wx'});fs.unlinkSync(probe);
  for(const sub of ['config','logs','backups','games','emulators'])fs.mkdirSync(safe(root,sub),{recursive:true});
  if(!fs.existsSync(marker))fs.writeFileSync(marker,'{"version":1}',{flag:'wx'});
  if(JSON.parse(fs.readFileSync(marker)).version!==1)throw Error('Неизвестный формат библиотеки');
  function at(...parts){if(!fs.existsSync(safe(root,'config','library.json')))throw Error('Библиотека недоступна: '+root);return safe(root,...parts)}
  return {root,at,game(g,kind){
    if(!Object.hasOwn(games,g)||!['rom','save'].includes(kind))throw Error('Неизвестная игра');
    const dir=at('games',g.toLowerCase());fs.mkdirSync(dir,{recursive:true});
    return at('games',g.toLowerCase(),'game.'+(kind==='save'?'sav':gba(g)?'gba':'nds'));
  },component(name){if(!['melonDS','mGBA'].includes(name))throw Error('Неизвестный эмулятор');return at('emulators',name.toLowerCase())}};
}
function crc16(bytes){let n=0xffff;for(const b of bytes){n^=b;for(let i=0;i<8;i++)n=(n>>>1)^((n&1)?0xa001:0)}return n}
function identify(file,ext=p.extname(file).toLowerCase()){
  const ds=ext==='.nds';if(!ds&&ext!=='.gba')throw Error('Нужен ROM .nds или .gba');
  const h=Buffer.alloc(ds?512:192),fd=fs.openSync(file,'r');let size;
  try{size=fs.fstatSync(fd).size;if(fs.readSync(fd,h,0,h.length,0)!==h.length)throw Error('Неполный заголовок ROM')}finally{fs.closeSync(fd)}
  const base=ds?0:160,title=h.toString('latin1',base,base+12).replace(/\0+$/,''),code=h.toString('latin1',base+12,base+16),maker=h.toString('latin1',base+16,base+18);
  const game=Object.keys(games).find(g=>gba(g)!==ds&&games[g]===code.slice(0,3));
  const regions={E:'Английское издание (включая США)',D:'Германия',F:'Франция',I:'Италия',J:'Япония',K:'Корея',S:'Испания'};
  if(!game||!Object.hasOwn(regions,code[3])||(!ds&&code[3]==='K'))throw Error('Неизвестный код картриджа: '+code);
  const warnings=[],sections={};
  if(maker!=='01')warnings.push('Необычный Maker Code');
  if(!title.trim())warnings.push('Пустое название картриджа');
  if(ds){
    if(size>512*1024*1024)throw Error('Превышен размер NDS ROM');
    for(const [label,o] of [['ARM9',32],['ARM7',48],['FNT',64],['FAT',72]]){
      const start=h.readUInt32LE(o),length=h.readUInt32LE(o+(o<64?12:4));
      if(start<512||!length||start+length>size)throw Error('Повреждён указатель '+label);
      sections[label]={start,length};
    }
    if(crc16(h.subarray(0,350))!==h.readUInt16LE(350))warnings.push('CRC16 заголовка не совпадает');
    if(h.readUInt32LE(128)>size)warnings.push('Заявленный размер ROM больше файла');
  }else{
    if(size<1024||size>32*1024*1024||h[178]!==0x96||h[3]!==0xea)throw Error('Повреждён заголовок GBA');
    let sum=0x19;for(const v of h.subarray(160,189))sum+=v;
    if(((sum+h[189])&255)!==0)warnings.push('Контрольная сумма заголовка GBA не совпадает');
  }
  return {game,code,title,maker,region:regions[code[3]],size,sections,warnings};
}
async function hash(file){const h=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(file))h.update(chunk);return h.digest('hex')}
async function copy(source,dest,{replace=false,validate,report=()=>{}}={}){
  const size=fs.statSync(source).size,dir=p.dirname(dest);fs.mkdirSync(dir,{recursive:true});
  if(fs.existsSync(dest)&&fs.statSync(dest).size===size){
    const existing=await hash(dest);if(existing===await hash(source)){if(validate)await validate(dest);report(size,size);return existing}
  }
  space(dir,size);
  const temp=p.join(dir,'.import-'+crypto.randomUUID());let count=0,last=0;
  try{
    const measure=new Transform({transform(chunk,enc,cb){count+=chunk.length;if(Date.now()-last>120||count===size){report(count,size);last=Date.now()}cb(null,chunk)}});
    await pipeline(fs.createReadStream(source),measure,fs.createWriteStream(temp,{flags:'wx'}));
    const digest=await hash(temp);
    if(count!==size||digest!==await hash(source))throw Error('Исходный файл изменился при копировании');
    if(validate)await validate(temp);
    if(fs.existsSync(dest)&&await hash(dest)===digest)return digest;
    if(replace)fs.renameSync(temp,dest);
    else{fs.linkSync(temp,dest);fs.unlinkSync(temp)}
    return digest;
  }finally{fs.rmSync(temp,{force:true})}
}
module.exports={games,gba,emulator,library,safe,inside,identify,hash,copy,space};
