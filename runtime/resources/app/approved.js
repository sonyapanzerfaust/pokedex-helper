'use strict';
// Adapt the reviewed task sequence without using display strings as progress keys.
function approvedRoute(guide, catalog, starter, deferred, caught, language) {
  const local = value => typeof value === 'string' && value.startsWith('@')
    ? (guide.words[language]?.[value] ?? guide.words.en[value]) : value;
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
  const byId = new Map(plan.map(task=>[task.id,task]));
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
  function description(t) {
    const req=t.requirements||{};
    const parts=[local(t.steps||t.action), local(req.access)];
    if(t.method) parts.push([label('method'), local(guide.methods[t.method]||t.method),local(req.area),local(req.group)].filter(Boolean).join(' · '));
    if(req.rate && typeof req.rate==='object') parts.push(Object.entries(req.rate).map(([period,n])=>
      (period==='all'?'':label(period)+' ')+n+'%').join(' / '));
    if(req.rate===null && ['Tall Grass','Cave','Headbutt','Tile fishing','Honey Trees','Poké Radar','Great Marsh','Safari Zone','Super Rod','Good Rod','Old Rod','Surf'].includes(t.method))parts.push(label('unknown'));
    if(req.rate_basis)parts.push(local(req.rate_basis));
    parts.push([...(req.hm||[]),...(req.items||[]),req.rod].filter(Boolean).map(local).join(' · '));
    if(t.registration)parts.push(local(t.registration));
    return [...new Set(parts.filter(Boolean))].join(' ');
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
    const action=local(task.action);
    let how=description(task);
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
    const dependencies=new Set(task.depends_on||[]);
    for(const parent of task.requirements?.requires_species||[]){
      const choice=paths.get(parent);
      if(!choice)continue;
      if(deferredNow(parent)){
        dependencies.delete(choice.earlyId);
        if(choice.donorAlternative){
          for(const key of dependencies)if(byId.get(key)?.species_ids?.includes(parent))dependencies.delete(key);
          if(choice.addTo)dependencies.add(choice.addTo);
        }
        dependencies.add(choice.target);
        if(parent===349)dependencies.add('palpark.Emerald.7');
      }else if(parent===349)dependencies.add(choice.earlyId);
    }
    const row={key:task.id,name:species?.name || (task.kind==='story'?local('@milestone.'+task.id):task.kind==='transfer'?label('transfer'):label('task')),
      place:[local(task.game),local(task.location)].filter(Boolean).join(' · '),how,nationalId:id,goal,
      kind:task.kind||'action',method:task.method,early,late,deferred:early&&skip,path,task,local,
      dependencyText:[...dependencies].map(key=>{
        const dep=byId.get(key);return dep ? (guide.species[dep.national_dex_id]?.name||local(dep.action)):key;
      }).join(' · ')};
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
