'use strict';
const assert=require('node:assert/strict');
const guide=require('../runtime/resources/app/approved-data.json');
const {approvedRoute,sectionOpen,isRouteNarration}=require('../runtime/resources/app/approved.js');
const {revisedRoutePlan,requiredCopies,transferred,clamperlRemaining}=require('../runtime/resources/app/route-revisions.js');
const {sections:catalog}=require('../runtime/resources/app/catalog.json');
const source=require('../route-research/ORDERED_ROUTE.json');
guide.words=require('../runtime/resources/app/locale-loader.cjs').words;
assert.deepEqual(Object.keys(guide.words.en).sort(),Object.keys(guide.words.ru).sort());
const batches=source.tasks.filter(t=>t.id.startsWith('palpark.'));
assert.equal(batches.length,8);assert.equal(batches.filter(t=>t.game==='Emerald').length,7);
for(const [file,expected] of Object.entries(guide.inputs)){
 const bytes=require('node:fs').readFileSync(require('node:path').join(__dirname,'../route-research',file));
 assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),expected,file);
}
const optional=new Set(guide.deferrals.filter(x=>x.donorAlternative).map(x=>x.target));
assert.deepEqual(guide.tasks.filter(x=>!optional.has(x.id)).map(x=>[x.id,x.position,x.depends_on]),source.tasks.map(x=>[x.id,x.position,x.depends_on]));
function checkWords(x){if(typeof x==='string'&&x.startsWith('@'))for(const d of Object.values(guide.words))assert(d[x],x);else if(x&&typeof x==='object')Object.values(x).forEach(checkWords)}
for(const name of ['tasks','variants','species','deferrals','titles','methods'])checkWords(guide[name]);
const expectedSections=[1,2,3,4,5,6,7,8,9,'platinum.finish','emerald','frlg','diamond','pearl','heartgold','soulsilver','evolutions','events'];
assert(sectionOpen({hgss:true},'heartgold',false));
assert(!sectionOpen({hgss:true,soulsilver:false},'soulsilver',true));
assert(sectionOpen({'15':true},'platinum.finish',false));
assert(sectionOpen({'evolutions.get.176':true},'evolutions',false));
assert.equal(sectionOpen({'10':true,'platinum.finish':false},'platinum.finish',true),false);
for(const [starter,line] of [[387,'Turtwig'],[390,'Chimchar'],[393,'Piplup']]){
 const plan=revisedRoutePlan(guide.tasks.map(t=>({...t,...guide.variants[line][t.id]})));
 const visited=new Set();for(const t of plan){
  assert(t.depends_on.every(k=>visited.has(k)),t.id);visited.add(t.id);
 }
 for(let mask=0;mask<2**guide.deferrals.length;mask++){
  const state=Object.fromEntries(guide.deferrals.map((x,i)=>[x.id,Boolean(mask&(1<<i))]));
  const render=(lang,caught=new Set())=>approvedRoute(guide,catalog,starter,JSON.parse(JSON.stringify(state)),caught,lang);
  const stages=render('en'),rows=stages.flatMap(s=>s.entries);
  for(const sections of [stages,render('ru')]){
    assert.deepEqual(sections.map(s=>s.stage),expectedSections);
    sections.forEach((s,i)=>assert(s.title.startsWith(String(i+1).padStart(2,'0')+' · ')));
    assert(!sections.some(s=>s.entries.some(e=>e.task&&isRouteNarration(e.task))));
    assert.equal(new Set(sections.map(s=>s.description)).size,sections.length);
    assert(sections.every(s=>s.entries.length&&s.description.length>30&&!s.description.includes('{')));
    const donor=sections.find(s=>s.stage==='emerald');
    assert.equal(donor.entries.filter(e=>e.kind==='transfer').length,1);
    assert(!sections.some(s=>s.entries.some(e=>e.key.startsWith('palpark.'))));
    const finals=sections.find(s=>s.stage==='platinum.finish');
    for(const key of ['9-9','10-6','open.platinum.15'])assert(finals.entries.some(e=>e.key===key));
    assert(sections.every(s=>s.entries.every(e=>e.kind==='local_requirement'||(e.method==='Evolution')===(s.stage==='evolutions'))));
    for(const s of sections)for(const e of s.entries){
      if(/^platinum\.(10|11|12|13|14|15)$/.test(e.task?.phase)&&e.method!=='Evolution')assert.equal(s.stage,'platinum.finish');
    }
    const indices=new Map(sections.find(s=>s.stage==='evolutions').entries.map((e,i)=>[e.key,i]));
    for(const e of sections.find(s=>s.stage==='evolutions').entries)
      for(const dep of e.task.depends_on)if(indices.has(dep))assert(indices.get(dep)<indices.get(e.key));
  }
  const expectedKeys=plan.filter(t=>{
    const path=guide.deferrals.find(p=>p.target===t.id);return !isRouteNarration(t)&&(!path||state[path.id]);
  }).map(t=>t.id);
  expectedKeys.push('story-giratina','story.windworks','story.bicycle','story.secretpotion','story.psyduck','story.lakes','story.waterfall','story.marley','story.heatran','story.orbs','story.strength','story.celestic','story.riley',...catalog.filter(s=>s.stage>=1&&s.stage<=15).flatMap(s=>s.entries.filter(e=>!e.nationalId).map(e=>e.key)));
  assert.deepEqual(rows.map(e=>e.key).sort(),expectedKeys.sort());
  assert.equal(new Set(rows.map(e=>e.key)).size,rows.length);
  assert.equal(stages[0].stage,1);assert.equal(stages[10].group,'emerald');
  assert(stages.filter(s=>s.group==='evolutions').every(s=>s.entries.every(t=>t.method==='Evolution')));
  assert.deepEqual(rows.filter(t=>t.goal).map(t=>t.nationalId).sort((a,b)=>a-b),Array.from({length:493},(_,i)=>i+1));
  assert.deepEqual(rows.map(t=>t.key),render('ru').flatMap(s=>s.entries.map(e=>e.key)));
  for(const d of guide.deferrals){const selected=rows.find(t=>t.goal&&t.nationalId===d.id);assert.equal(selected.key,state[d.id]?d.target:d.earlyId)}
 }
}
const changed=revisedRoutePlan(guide.tasks);
const copies=requiredCopies(changed);
assert.deepEqual(Object.fromEntries(copies),{44:2,61:2,79:2,133:7,236:3,281:2,320:2,361:2,366:2,412:2});
assert(!copies.has(265)&&!copies.has(280)&&!copies.has(290));
const route=approvedRoute(guide,catalog,387,{},new Set(),'en');
const entries=Object.fromEntries(route.flatMap(section=>section.entries.map(e=>[e.key,e])));
const emerald=entries['transfer.emerald'].task;
assert(entries['open.emerald.ancients'].task.depends_on.includes('emerald.local.321'));
assert(entries['open.emerald.ancients'].task.depends_on.includes('get.369'));
assert.equal(entries['get.321'].task.game,'Platinum');
assert.equal(entries['get.321'].task.method,'Pal Park');
const platinumPost=route.find(section=>section.stage==='platinum.finish').entries;
assert(platinumPost.indexOf(entries['9-9'])<platinumPost.indexOf(entries['get.321']));
assert.equal(entries['get.320'].task.game,'Emerald');
assert.equal(entries['get.369'].task.holdUntil,'open.emerald.ancients');
assert.equal(entries['emerald.local.321'].task.holdUntil,'open.emerald.ancients');
const legacy=key=>key==='palpark.Emerald.1'||key==='trade.hgss';
assert(transferred(emerald,258,new Set(),legacy));
assert(!transferred(emerald,285,new Set(),legacy));
assert(!transferred(emerald,320,new Set(),legacy));
assert(transferred(emerald,320,new Set([320]),legacy));
assert.equal(clamperlRemaining(new Set(),false,0),2);
assert.equal(clamperlRemaining(new Set(),true,null),1);
assert.equal(clamperlRemaining(new Set([366,367]),false,0),1);
assert.equal(clamperlRemaining(new Set([366]),false,2),0);
const hg=entries['transfer.heartgold'],ss=entries['transfer.soulsilver'];
assert(!hg.transferIds.some(id=>ss.transferIds.includes(id)));
assert(ss.transferIds.includes(249)&&ss.transferIds.includes(152));
assert(hg.transferIds.includes(380)&&!ss.transferIds.includes(381)&&!hg.transferIds.includes(381));
assert(transferred(ss.task,52,new Set(),legacy));
assert(!transferred(ss.task,152,new Set(),legacy));
assert(entries['2-22'].items.some(s=>s.includes('Moon Stone ×5')));
assert(entries['open.kanto.silver'].items.filter(s=>s.includes('Route 20')).length===2);
assert(entries['open.kanto.power'].items.some(s=>s.includes('Luck Incense')));
assert(entries['open.johto.late'].items.some(s=>s.includes('Dragon Scale')));
console.log('Approved route: 493 goals, three starters, all 64 Skip combinations, donor split, old progress, required copies and items.');
for(const lang of ['en','ru']){
  const rows=approvedRoute(guide,catalog,387,{},new Set(),lang).flatMap(s=>s.entries);
  const row=key=>rows.find(e=>e.key===key);
  const before=(first,second)=>assert(rows.indexOf(row(first))<rows.indexOf(row(second)),first);
  assert.equal(row('get.185').how,lang==='en'?'Route 221 · Tall Grass · 25%':'Маршрут 221 · Высокая трава · 25%');
  assert.equal(row('get.447').how,lang==='en'?'Iron Island · Egg from Riley':'Железный остров · Яйцо от Райли');
  for(const [first,second] of [['1-10','get.129'],['story.secretpotion','story.psyduck'],['story.psyduck','get.333'],['6-1','get.194'],['6-1','get.185'],['9-9','get.304'],['10-6','get.055']])before(first,second);
  assert.match(row('get.123').how,/15%.*5%.*5%/);
  assert.match(row('get.349').how,/50%/);
  assert.match(row('get.451').how,/10%/);
  assert.match(row('get.304').how,/22%/);
  assert.match(row('get.212').how,/Scyther → Scizor.*Metal Coat/);
  const view=row('get.185').acquisition;
  for(const t of guide.tasks.filter(t=>t.national_dex_id)){
    const id=t.national_dex_id, line=view.format(t,id);
    const narrative='SENTINEL';
    assert.equal(view.format({...t,steps:narrative,action:narrative,registration:narrative,
      requirements:{...t.requirements,access:narrative,rate_basis:narrative}},id),line);
    if(lang==='en')assert(!/[А-Яа-яЁё]/.test(line),line);
    for(const alt of guide.species[id].alternatives)
      assert(!view.format({...alt,steps:narrative,access:narrative},id).includes(narrative));
  }
}
