/* Read-only decoder. Format references are listed in THIRD_PARTY_NOTICES.md. */
'use strict';
const SaveReader = (() => {
  const layouts = [
    {game:'Platinum', general:0xcf2c, storage:0x121e4, pc:0xcf2c, dex:0x1328, trainer:0x68, party:0xa0},
    {game:'Diamond/Pearl', general:0xc100, storage:0x121e0, pc:0xc100, dex:0x12dc, trainer:0x64, party:0x98},
    {game:'HG/SS', general:0xf628, storage:0x12310, pc:0xf700, dex:0x12b8, trainer:0x64, party:0x98}
  ];
  const u16 = (a,i) => a[i] | a[i+1]<<8;
  const u32 = (a,i) => (u16(a,i) | u16(a,i+2)<<16)>>>0;
  function crc(bytes) {
    let value=65535;
    for(const byte of bytes) {
      value ^= byte<<8;
      for(let i=0;i<8;i++) value=((value<<1)^((value&32768)?0x1021:0))&65535;
    }
    return value;
  }
  function flags(bytes,offset,count) {
    return Array.from({length:count},(_,i)=>i+1).filter(id=>bytes[offset+((id-1)>>3)] & (1<<((id-1)&7)));
  }
  function compare(a,b) {
    if(a===b) return 0;
    if(a===0xffffffff && b!==0xfffffffe) return -1;
    if(b===0xffffffff && a!==0xfffffffe) return 1;
    return a-b;
  }
  function block(bytes,start,size,footer,type) {
    const valid=[];
    for(const bank of [0,0x40000]) {
      const data=bytes.subarray(bank+start,bank+start+size);
      if(u32(data,size-12)!==size || ![0x20060623,0x20070903].includes(u32(data,size-8)) || u16(data,size-4)!==type) continue;
      if(crc(data.subarray(0,size-footer))===u16(data,size-2)) valid.push(data);
    }
    const selected=valid.sort((a,b)=>compare(u32(b,size-20),u32(a,size-20)) || compare(u32(b,size-16),u32(a,size-16)))[0];
    if(selected)selected.singleCopy=valid.length===1;
    return selected;
  }
  // Lexicographic order of the four encrypted substructures in a PK4.
  function permutation(rank) {
    const left=[0,1,2,3],order=[];
    for(const divisor of [6,2,1,1]) {order.push(left.splice(Math.floor(rank/divisor),1)[0]);rank%=divisor}
    return order;
  }
  function pokemon(bytes,pos) {
    const pid=u32(bytes,pos), checksum=u16(bytes,pos+6);
    if(!pid && !checksum && !bytes.subarray(pos,pos+136).some(Boolean)) return null;
    const data=new Uint8Array(128), order=permutation(((pid>>>13)&31)%24);
    let seed=checksum,sum=0;
    for(let i=0;i<128;i+=2) {
      seed=(Math.imul(seed,0x41c64e6d)+0x6073)>>>0;
      const word=u16(bytes,pos+8+i)^(seed>>>16);
      const dest=32*order[i>>5]+(i%32);
      data[dest]=word; data[dest+1]=word>>>8; sum+=word;
    }
    const species=u16(data,0);
    if(!species && !data.some(Boolean)) return null;
    if((sum&65535)!==checksum || species<1 || species>493) throw Error('Повреждена запись покемона');
    return {species,trainer:u32(data,4),pid,egg:!!(u32(data,0x30)&0x40000000),origin:data[0x57],met:u16(data,0x3e)||u16(data,0x78),metLevel:data[0x7c]&127};
  }
  function readDS(bytes) {
    for(const layout of layouts) {
      const hg=layout.game==='HG/SS',footer=hg?16:20;
      const data=block(bytes,0,layout.general,footer,0);
      if(!data) continue;
      const pc=block(bytes,layout.pc,layout.storage,footer,1);
      if(!pc || u32(data,layout.dex)!==0xbeefcafe) throw Error('Не удалось проверить PC или Pokédex');
      const caught=flags(data,layout.dex+4,493),seen=flags(data,layout.dex+68,493);
      if(caught.some(id=>!seen.includes(id))) throw Error('Флаги Caught и Seen противоречат друг другу');
      const party=[],boxes=[], count=data[layout.party-4];
      if(count>6) throw Error('Некорректное число покемонов в команде');
      for(let i=0;i<count;i++) {const mon=pokemon(data,layout.party+236*i);if(!mon) throw Error('Пустая запись в команде');party.push(mon)}
      for(let box=0;box<18;box++) for(let slot=0;slot<30;slot++) {
        const mon=pokemon(pc,(hg?box*4096:4+box*4080)+slot*136);
        if(mon) boxes.push({...mon,box:box+1,slot:slot+1});
      }
      const trainer=u32(data,layout.trainer+16), progress=data[layout.trainer+29], pt=layout.game==='Platinum';
      const starter=pt?u16(data,0xdac+2*0x30):0;
      const candidates=[...party,...boxes].filter(m=>m.species>=starter&&m.species<starter+3 && m.trainer===trainer && m.origin===12 && m.metLevel===5 && m.met===16 && !m.egg);
      return {generalBank:data.byteOffset-bytes.byteOffset,singleCopy:data.singleCopy||pc.singleCopy,game:layout.game,versionCode:hg?data[layout.trainer+28]:null,caught,seen,party,boxes,trainer,tid:trainer&65535,sid:trainer>>>16,language:data[layout.trainer+25],
        badges:data[layout.trainer+26],league:!!(progress&1),national:!!(progress&2),giratina:pt&&u16(data,0xdac+2*0xaa)>0,
        starter:[387,390,393].includes(starter)?starter:null,starterStage:candidates.length===1?candidates[0].species:null};
    }
    throw Error('Не найден корректный блок сохранения DS');
  }
  function readGBA(bytes) {
    const banks=[];
    for(const start of [0,0xe000]) {
      const sections=new Map();let revision;
      for(let i=0;i<14;i++) {
        const section=bytes.subarray(start+i*4096,start+(i+1)*4096),id=u16(section,0xff4),counter=u32(section,0xffc);
        if(id>=14 || u32(section,0xff8)!==0x08012025 || (revision!==undefined&&revision!==counter)) break;
        let sum=0;for(let j=0;j<0xf80;j+=4) sum=(sum+u32(section,j))>>>0;
        if(((sum+(sum>>>16))&65535)!==u16(section,0xff6)) break;
        sections.set(id,section);revision=counter;
      }
      if(sections.size===14) banks.push({revision,data:sections.get(0),sections});
    }
    if(!banks.length) throw Error('Сохранение GBA (.sav): ни один полный банк не прошёл проверку контрольной суммы');
    const {data,sections}=banks.sort((a,b)=>compare(b.revision,a.revision))[0];
    const key=u32(data,0xac),game=key===1?'FireRed/LeafGreen':key&&data.subarray(0x890,0xf2c).some(Boolean)?'Emerald':null;
    if(!game) throw Error('Не удалось подтвердить формат Emerald или FireRed/LeafGreen');
    const caught=flags(data,0x28,386),seen=flags(data,0x5c,386);
    if(caught.some(id=>!seen.includes(id)))throw Error('Флаги Caught и Seen противоречат друг другу');
    let badges=0;const emerald=game==='Emerald',base=emerald?0x1270:0xee0;
    for(let i=0;i<8;i++){const flag=(emerald?0x867:0x820)+i,offset=base+(flag>>3);
      if(sections.get(1+Math.floor(offset/0xf80))[offset%0xf80]&(1<<(flag&7)))badges|=1<<i;
    }
    return {game,caught,seen,badges,singleCopy:banks.length===1,trainer:u32(data,10)};
  }
  // mGBA appends 16 bytes of RTC state to some 128 KiB flash saves.
  function gbaSize(size) { return size===131072 || size===131088; }
  function batterySize(size) { return gbaSize(size) || size===524288; }
  function blankFlash(bytes) {
    return gbaSize(bytes.length) && bytes.subarray(0,131072).every(b=>b===0xff);
  }
  function parse(input) {
    const bytes=new Uint8Array(input);
    if(bytes.length===524288) return readDS(bytes);
    if(gbaSize(bytes.length)) return readGBA(bytes.subarray(0,131072));
    throw Error('Требуется raw .sav на 512 КиБ (DS) или 128 КиБ (GBA)');
  }
  function confirm(snapshot,previous,game){
    if(snapshot.game==='HG/SS' && ((game==='HeartGold'&&snapshot.versionCode===8)||(game==='SoulSilver'&&snapshot.versionCode===7)))throw Error('Сейв относится к другой версии HG/SS');
    if(snapshot.singleCopy && previous?.trainer===snapshot.trainer && previous.caught.some(id=>!snapshot.caught.includes(id)))
      throw Error('Только один корректный банк и в нём меньше записей. Сохранён последний подтверждённый снимок.');
  }
  return {parse,confirm,batterySize,blankFlash};
})();
if(typeof module!=='undefined') module.exports=SaveReader;
