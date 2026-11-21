'use strict';
const assert=require('node:assert/strict');
const guide=require('../runtime/resources/app/approved-data.json');
const {approvedRoute,sectionOpen,isRouteNarration}=require('../runtime/resources/app/approved.js');
const {sections:catalog}=require('../runtime/resources/app/catalog.json');
const source=require('../route-research/ORDERED_ROUTE.json');
guide.words={en:require('../runtime/resources/app/locales/approved-en.json'),ru:require('../runtime/resources/app/locales/approved-ru.json')};
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
const expectedSections=[1,2,3,4,5,6,7,8,9,'platinum.finish','emerald','frlg','diamond','pearl','hgss','evolutions','events'];
assert(sectionOpen({'15':true},'platinum.finish',false));
assert(sectionOpen({'evolutions.get.176':true},'evolutions',false));
assert.equal(sectionOpen({'10':true,'platinum.finish':false},'platinum.finish',true),false);
for(const [starter,line] of [[387,'Turtwig'],[390,'Chimchar'],[393,'Piplup']]){
 const visited=new Set();for(const t of guide.tasks.map(t=>({...t,...guide.variants[line][t.id]})).sort((a,b)=>a.position-b.position)){
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
    assert(sections.find(s=>s.stage==='emerald').description.includes('41'));
    const finals=sections.find(s=>s.stage==='platinum.finish');
    for(const key of ['9-9','10-6','open.platinum.15'])assert(finals.entries.some(e=>e.key===key));
    assert(sections.every(s=>s.entries.every(e=>(e.method==='Evolution')===(s.stage==='evolutions'))));
    for(const s of sections)for(const e of s.entries){
      if(/^platinum\.(10|11|12|13|14|15)$/.test(e.task?.phase)&&e.method!=='Evolution')assert.equal(s.stage,'platinum.finish');
    }
    const indices=new Map(sections.find(s=>s.stage==='evolutions').entries.map((e,i)=>[e.key,i]));
    for(const e of sections.find(s=>s.stage==='evolutions').entries)
      for(const dep of e.task.depends_on)if(indices.has(dep))assert(indices.get(dep)<indices.get(e.key));
  }
  const expectedKeys=guide.tasks.filter(t=>{
    const path=guide.deferrals.find(p=>p.target===t.id);return !isRouteNarration(t)&&(!path||state[path.id]);
  }).map(t=>t.id);
  expectedKeys.push('story-giratina',...catalog.filter(s=>s.stage>=1&&s.stage<=15).flatMap(s=>s.entries.filter(e=>!e.nationalId).map(e=>e.key)));
  assert.deepEqual(rows.map(e=>e.key).sort(),expectedKeys.sort());
  assert.equal(new Set(rows.map(e=>e.key)).size,rows.length);
  assert.equal(stages[0].stage,1);assert.equal(stages[10].group,'emerald');
  assert(stages.filter(s=>s.group==='evolutions').every(s=>s.entries.every(t=>t.method==='Evolution')));
  assert.deepEqual(rows.filter(t=>t.goal).map(t=>t.nationalId).sort((a,b)=>a-b),Array.from({length:493},(_,i)=>i+1));
  assert.deepEqual(rows.map(t=>t.key),render('ru').flatMap(s=>s.entries.map(e=>e.key)));
  for(const d of guide.deferrals){const selected=rows.find(t=>t.goal&&t.nationalId===d.id);assert.equal(selected.key,state[d.id]?d.target:d.earlyId)}
 }
}
console.log('Approved route: 493 unique goals, 3 starters, all 64 Skip combinations, 8 Pal Park batches and locale parity.');
