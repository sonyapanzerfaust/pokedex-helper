'use strict';
// Adapt the reviewed task sequence without using display strings as progress keys.
function approvedRoute(guide, catalog, starter, deferred, caught, language, methods) {
  const local = value => typeof value === 'string' && value.startsWith('@')
    ? (guide.words[language]?.[value] ?? guide.words.en[value]) : value;
  const acquisition = (typeof module === 'undefined' ? acquisitionView : require('./acquisition.js'))(guide, language, methods || require('./methods.json'));
  const label = key => local('@ui.' + key);
  const line = ({387:'Turtwig',390:'Chimchar',393:'Piplup'})[starter] || 'Turtwig';
  const overrides = guide.variants[line];
  const plan = guide.tasks.map(task => ({...task,...overrides[task.id]})).sort((a,b)=>a.position-b.position);
  const order = [1,2,3,4,5,6,7,8,9,'platinum.finish','emerald','frlg','diamond','pearl','hgss','evolutions','events'];
  const batches = plan.filter(t=>t.id.startsWith('palpark.Emerald.'));
  const parameters = {
    targets:batches.reduce((sum,t)=>sum+t.species_ids.length,0),
    slots:batches.length*6, batches:batches.length
  };
  for(const game of ['Diamond','Pearl']){
    parameters[game]=plan.find(t=>t.phase===game.toLowerCase() && t.method==='Gift').action;
  }
  const sections = order.map((stage,index)=>({
    stage,group:stage,title:String(index+1).padStart(2,'0')+' · '+local(guide.titles[stage]).replace(/^\d+ · /,''),entries:[],
    description:local('@section.'+stage+'.description').replace(/\{(\w+)\}/g,(_,key)=>parameters[key])
  }));
  const bySection = new Map(sections.map(section=>[section.stage,section]));
  const paths = new Map(guide.deferrals.map(path=>[path.id,path]));
  const deferredNow = id => Boolean(deferred[id] && !caught.has(id));
  function group(t) {
    const phase=t.phase;
    if(t.method==='Evolution') return 'evolutions';
    if(phase==='platinum.temple'||phase==='platinum.finish')return 'platinum.finish';
    if (/^platinum\.\d+$/.test(phase)) return Number(phase.split('.')[1])<=9 ? Number(phase.split('.')[1]) : 'platinum.finish';
    if (phase.startsWith('emerald.')) return 'emerald';
    if (/^(firered|leafgreen)\./.test(phase)) return 'frlg';
    if (/^(johto|kanto)\./.test(phase)) return 'hgss';
    return phase;
  }
  for(const task of plan){
    if(isRouteNarration(task))continue;
    const id=task.national_dex_id, path=paths.get(id), skip=deferredNow(id);
    const early=path?.earlyId===task.id, late=path?.target===task.id;
    if(late&&!skip)continue;
    const g=group(task);
    const section=bySection.get(g);
    const goal=!!id && (task.kind==='acquire'||early||late) && !(early&&skip);
    const species=guide.species[id];
    let how=id ? acquisition.format(task,id) : local(task.steps||task.action);
    if(task.species_ids){
      const ids=task.species_ids.filter(n=>{
        const neededForTemple=[377,378,379].includes(n)&&!caught.has(486);
        if(caught.has(n)&&!neededForTemple)return false;
        if(n===214&&!deferredNow(214)&&task.id==='trade.hgss')return false;
        return !(deferredNow(n)&&paths.get(n)?.omitFrom&&task.id.startsWith(paths.get(n).omitFrom));
      });
      if(task.conditional_filler && deferredNow(349))ids.push(349);
      for(const p of paths.values())if(p.addTo===task.id&&deferredNow(p.id))ids.push(p.id);
      how+=' '+ids.map(n=>guide.species[n].name).join(', ');
    }
    const row={key:task.id,name:species?.name || (task.kind==='story'?local('@milestone.'+task.id):task.kind==='transfer'?label('transfer'):label('task')),
      place:[local(task.game),local(task.location)].filter(Boolean).join(' · '),how,nationalId:id,goal,
      kind:task.kind||'action',method:task.method,early,late,deferred:early&&skip,path,task,local};
    if(task.kind==='story' && guide.words[language]['@stop.'+task.id]){
      row.place=acquisition.place(local('@stop.'+task.id));
      row.how=local('@checkpoint.'+task.id);
    }
    if(id){
      row.place=task.game==='Platinum'?'':task.game;
      row.acquisition=acquisition;
    }
    section.entries.push(row);
  }
  // The pre-integration story checklist uses stable IDs also found in old exports.
  for(const source of catalog.filter(s=>s.stage>=1&&s.stage<=15)){
    const section=bySection.get(source.stage<=9?source.stage:'platinum.finish');
    const originals=source.entries.filter(e=>!e.nationalId);
    if(source.stage===9){
      const dexMilestones=originals.filter(e=>e.key==='9-8'||e.key==='9-9');
      bySection.get('platinum.finish').entries.unshift(...dexMilestones.map(e=>({...e,kind:'legacyStory',phase:'platinum.10'})));
    }
    const rows=originals.filter(e=>e.key!=='9-8'&&e.key!=='9-9').map(e=>({...e,kind:'legacyStory',phase:'platinum.'+source.stage}));
    const next=section.entries.findIndex(e=>e.task?.phase==='platinum.'+(source.stage+1));
    section.entries.splice(next<0?section.entries.length:next,0,...rows);
    if(source.stage===8)section.entries.push({key:'story-giratina',name:'Событие Giratina',place:'Distortion World',how:'',kind:'legacyStory'});
  }
  // Place unlocks immediately before the first dependent stop. Keep the keys
  // and legacyId of catalog rows so existing checkbox and badge state survives.
  function checkpoint(stage, key, before, place, title) {
    const entries=bySection.get(stage).entries;
    const old=entries.findIndex(e=>e.key===key);
    const row=old<0 ? {key,kind:'legacyStory',name:title,phase:entries.find(e=>e.key===before)?.task?.phase}
      : entries.splice(old,1)[0];
    row.place=acquisition.place(place);
    row.how=local('@checkpoint.'+key);
    const index=entries.findIndex(e=>e.key===before);
    entries.splice(index<0?entries.length:index,0,row);
  }
  checkpoint(1,'1-10','get.129','Route 218');
  checkpoint(2,'2-4','get.412','Floaroma Meadow');
  checkpoint(2,'story.windworks','get.425','Valley Windworks','Valley Windworks');
  checkpoint(3,'story.bicycle','get.175','Eterna City',label('bicycle'));
  checkpoint(4,'4-2','get.118','Route 209');
  checkpoint(4,'3-9','get.442','Route 209 · Hallowed Tower');
  checkpoint(6,'story.secretpotion','get.333','Valor Lakefront','SecretPotion');
  checkpoint(6,'story.psyduck','get.333','Route 210',acquisition.place('Route 210')+' · Psyduck');
  checkpoint(6,'story.celestic','get.194','Celestic Town',label('ruins'));
  checkpoint(6,'6-1','get.194','Celestic Town');
  checkpoint(6,'story.strength','get.042','Iron Island','HM04 Strength');
  checkpoint(6,'story.riley','get.447','Iron Island',label('riley'));
  checkpoint(7,'story.lakes','get.349','Lake Verity',label('lakes'));
  checkpoint(8,'8-0','get.308','Veilstone Galactic HQ');
  checkpoint(8,'story-giratina','get.480','Distortion World');
  checkpoint(9,'9-4','get.073','Sunyshore Gym');
  checkpoint(9,'story.waterfall','get.082','Sunyshore City','HM07 Waterfall');
  checkpoint('platinum.finish','9-9','get.488','Sandgem Town');
  checkpoint('platinum.finish','10-6','get.055','Fight Area');
  checkpoint('platinum.finish','story.marley','get.087','Victory Road','Marley');
  checkpoint('platinum.finish','story.heatran','get.485','Stark Mountain','Magma Stone');
  checkpoint('platinum.finish','story.orbs','get.483','Celestic Town',label('orbs'));
  return sections;
}
// Keep explicit choices from an earlier, split section until the merged card is toggled.
function isRouteNarration(task){
  return /^open\.platinum\.(?:[1-9]|1[0-4]|finish)$/.test(task.id)||task.id==='open.events';
}
function sectionOpen(open, id, fallback){
  if(Object.hasOwn(open,id))return open[id];
  const aliases=Object.keys(open).filter(key=>
    (id==='evolutions'&&key.startsWith('evolutions.'))||
    (id==='platinum.finish'&&(/^(10|11|12|13|14|15)$/.test(key)||key==='platinum.temple'||key.startsWith('platinum.finish.'))));
  return aliases.length?aliases.some(key=>open[key]):fallback;
}
if(typeof module!=='undefined')module.exports={approvedRoute,sectionOpen,isRouteNarration};
