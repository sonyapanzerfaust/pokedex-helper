// Synthetic banks exercise layouts without requiring commercial games or real saves.
const assert=require('node:assert/strict');
const {parse,confirm}=require('../runtime/resources/app/save.js');
function crc(b){let c=65535;for(const x of b){c^=x<<8;for(let i=0;i<8;i++)c=(c&32768?c*2^4129:c*2)&65535}return c}
for(const [game,g,pc,s,dex,tr] of [['Diamond/Pearl',0xc100,0xc100,0x121e0,0x12dc,0x64],['HG/SS',0xf628,0xf700,0x12310,0x12b8,0x64],['Platinum',0xcf2c,0xcf2c,0x121e4,0x1328,0x68]]){
  const bytes=Buffer.alloc(0x80000);
  for(const bank of [0,0x40000]){
    for(const [start,size,type] of [[0,g,0],[pc,s,1]]){
      const b=bytes.subarray(bank+start,bank+start+size);
      b.writeUInt32LE(1,size-20);b.writeUInt32LE(bank?5:4,size-16);b.writeUInt32LE(size,size-12);b.writeUInt32LE(0x20060623,size-8);b.writeUInt16LE(type,size-4);
      if(!type){b.writeUInt32LE(0xbeefcafe,dex);b[dex+4]=b[dex+68]=bank?3:1;b[tr+28]=7}
      b.writeUInt16LE(crc(b.subarray(0,size-(game==='HG/SS'?16:20))),size-2);
    }
  }
  if(game==='Platinum')module.exports.platinumFixture=Buffer.from(bytes);
  const good=parse(bytes);assert.equal(good.game,game);assert.deepEqual(good.caught,[1,2]);assert.equal(good.party.length,0);
  if(game==='HG/SS')assert.throws(()=>confirm(good,null,'SoulSilver'));
  bytes[0x40000+8]^=255;const fallback=parse(bytes);
  assert.deepEqual(fallback.caught,[1]);assert.throws(()=>confirm(fallback,good,game));
  bytes[8]^=255;assert.throws(()=>parse(bytes));
}
for(const emerald of [true,false]){
 const bytes=Buffer.alloc(0x20000);
 for(const bank of [0,0xe000])for(let slot=0;slot<14;slot++){
   const id=(slot+3)%14,b=bytes.subarray(bank+slot*4096,bank+(slot+1)*4096);
   if(id===0){b.writeUInt32LE(emerald?5:1,0xac);b[0x900]=1;b[0x28]=b[0x5c]=bank?5:1}
   b.writeUInt16LE(id,0xff4);b.writeUInt32LE(0x08012025,0xff8);b.writeUInt32LE(bank?101:100,0xffc);
   let sum=0;for(let i=0;i<0xf80;i+=4)sum=(sum+b.readUInt32LE(i))>>>0;b.writeUInt16LE((sum+(sum>>>16))&65535,0xff6);
 }
 const good=parse(bytes);assert.equal(good.game,emerald?'Emerald':'FireRed/LeafGreen');assert.deepEqual(good.caught,[1,3]);
 bytes[0xe000]^=1;assert.deepEqual(parse(bytes).caught,[1]);bytes[0]^=1;assert.throws(()=>parse(bytes));
}
