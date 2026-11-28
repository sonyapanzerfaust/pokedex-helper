'use strict';

// The reviewed source and its IDs also identify tasks in older progress exports.
// Apply version-specific routing after starter variants have been selected.
function revisedRoutePlan(source) {
  const tasks = new Map(source.map(task => [task.id, task]));
  const patch = (id, change) => tasks.set(id, {...tasks.get(id), ...change});
  const story = (id, game, phase, position, depends_on) =>
    tasks.set(id, {id, game, phase, position, depends_on, kind:'story', steps:'@revision.'+id});
  const legacy = ids => Object.fromEntries(ids.map(id => [id, tasks.get(id).species_ids]));
  const emeraldBatches = source.filter(task => task.id.startsWith('palpark.Emerald.')).map(task => task.id);
  const wailmer = tasks.get('emerald.local.320');
  const relicanth = tasks.get('emerald.local.369');
  patch('get.320', {...wailmer, id:'get.320', kind:'acquire', progressAliases:['emerald.local.320'], routeNote:'@revision.wailmer'});
  patch('get.369', {...relicanth, id:'get.369', kind:'acquire', progressAliases:['emerald.local.369'], routeNote:'@revision.holdRegi', holdUntil:'open.emerald.ancients'});
  patch('emerald.local.321', {depends_on:['get.320'], routeNote:'@revision.evolveWailmer', holdUntil:'open.emerald.ancients'});
  patch('get.321', {
    phase:'platinum.10',
    position:tasks.get('get.488').position+.1,
    method:'Pal Park',
    location:'Sinnoh Route 221',
    depends_on:['open.platinum.10'],
    requirements:{requires_species:[],items:[],hm:[]},
    routeNote:'@revision.platinumWailord',
    donor:'Emerald',
    holdUntil:'open.emerald.ancients'
  });
  patch('open.emerald.ancients', {depends_on:['open.emerald.sea','emerald.local.321','get.369'], routeNote:'@revision.openRegi'});
  patch('open.emerald.sea', {routeNote:'@revision.emeraldDive'});
  patch('open.emerald.dewford', {routeNote:'@revision.emeraldFieldMoves'});
  patch('open.emerald.lavaridge', {routeNote:'@revision.emeraldDig'});
  patch('open.emerald.post', {routeNote:'@revision.emeraldPost'});
  const emeraldTransfer = 'transfer.emerald';
  const kantoTransfer = 'transfer.frlg';
  const goldTransfer = 'transfer.heartgold';
  const silverTransfer = 'transfer.soulsilver';
  const emeraldIds = [...new Set([...Object.values(legacy(emeraldBatches)).flat(),320,321,369])];
  const emeraldDependencies = emeraldIds.map(id => id===321 ? 'emerald.local.321' : 'get.'+String(id).padStart(3,'0'));
  const transfer = (id, game, phase, position, species_ids, depends_on, old, channel) =>
    tasks.set(id,{id, game, phase, position, species_ids, depends_on, kind:'transfer', old, steps:'@revision.'+channel});
  transfer(emeraldTransfer,'Emerald','emerald.post',tasks.get(emeraldBatches.at(-1)).position,
    emeraldIds,['open.emerald.ancients',...emeraldDependencies],legacy(emeraldBatches),'palPark');
  const kanto = tasks.get('palpark.Kanto.1');
  transfer(kantoTransfer,kanto.game,kanto.phase,kanto.position,kanto.species_ids,kanto.depends_on,legacy([kanto.id]),'palPark');

  const hp = id => tasks.get(id).position;
  const silverStart = 'open.soulsilver.start';
  const silverViolet = 'open.soulsilver.violet';
  const silverIlex = 'open.soulsilver.ilex';
  const silverCoast = 'open.soulsilver.coast';
  const silverIce = 'open.soulsilver.ice';
  const silverLugia = 'open.soulsilver.lugia';
  const goldLeague = 'open.heartgold.league';
  const goldViolet = 'open.heartgold.violet';
  const johtoStories = source.filter(task => task.game==='HG/SS' && task.kind==='story');
  for (const task of johtoStories) patch(task.id,{game:'HeartGold',routeNote:'@revision.'+task.id});
  story(silverStart,'SoulSilver','soulsilver',hp('open.johto.start'),[]);
  story(silverIlex,'SoulSilver','soulsilver',hp('open.johto.headbutt'),[silverViolet]);
  story(goldViolet,'HeartGold','johto.start',hp('get.023')-.5,['open.johto.start']);
  story(silverViolet,'SoulSilver','soulsilver',hp('get.023')-.5,[silverStart]);
  for(const id of [goldViolet,silverViolet])patch(id,{title:'@revision.violetTitle',steps:'@revision.violet'});
  patch('open.johto.headbutt',{depends_on:[goldViolet]});
  for(const id of ['get.069','get.179','get.027','get.019','get.187'])patch(id,{depends_on:[goldViolet]});
  story(silverCoast,'SoulSilver','soulsilver',hp('get.052')-.5,[silverIlex]);
  story(silverIce,'SoulSilver','soulsilver',hp('get.225')-.5,[silverCoast]);
  story(silverLugia,'SoulSilver','soulsilver',hp('get.249')-.5,[silverIce]);
  patch('get.152',{game:'SoulSilver',depends_on:[silverStart]});
  patch('get.155',{game:'HeartGold',routeNote:'@revision.extraStarter'});
  patch('get.158',{routeNote:'@revision.mainStarter'});
  patch('get.165',{depends_on:[silverStart]});
  patch('get.023',{depends_on:[silverViolet]});
  patch('get.013',{depends_on:[silverIlex]});
  patch('get.052',{depends_on:[silverCoast]});
  patch('get.225',{depends_on:[silverIce]});
  patch('get.249',{game:'SoulSilver',depends_on:[silverLugia],routeNote:'@revision.lugia',
    requirements:{...tasks.get('get.249').requirements,items:['Silver Wing','Tidal Bell'],hm:['Surf','Whirlpool']}});
  patch('get.250',{depends_on:['open.johto.coast'],routeNote:'@revision.hoOh'});
  story(goldLeague,'HeartGold','heartgold',hp('open.johto.late')-.1,['get.250']);
  patch('open.johto.late',{depends_on:[goldLeague]});
  patch('get.380',{routeNote:'@revision.latias'});
  patch('get.486',{depends_on:['open.platinum.10','get.377','get.378','get.379']});
  patch('get.063',{routeNote:'@revision.tradeRegistered'});
  patch('get.441',{routeNote:'@revision.tradeRegistered'});
  for (const id of ['get.377','get.378','get.379']) patch(id,{routeNote:'@revision.'+id});

  const oldJohto = legacy(['trade.johto.starters','trade.hgss']);
  const silverIds = [...new Set(Object.values(oldJohto).flat())].filter(id => tasks.get('get.'+String(id).padStart(3,'0'))?.game==='SoulSilver');
  const goldIds = [...new Set(Object.values(oldJohto).flat())].filter(id => !silverIds.includes(id));
  const captureKeys = ids => ids.map(id => 'get.'+String(id).padStart(3,'0'));
  const johtoTradePosition = hp('trade.hgss');
  transfer(goldTransfer,'HeartGold','kanto.silver',johtoTradePosition,goldIds,captureKeys(goldIds),oldJohto,'unionRoom');
  transfer(silverTransfer,'SoulSilver','soulsilver',johtoTradePosition+.1,silverIds,captureKeys(silverIds),oldJohto,'unionRoom');
  for (const [id,channel] of [['trade.Diamond','unionRoom'],['trade.Pearl','unionRoom']])
    patch(id,{steps:'@revision.'+channel});

  const replacements = Object.fromEntries([
    ...emeraldBatches.map(id=>[id,[emeraldTransfer]]),
    [kanto.id,[kantoTransfer]], ['trade.johto.starters',[goldTransfer,silverTransfer]], ['trade.hgss',[goldTransfer,silverTransfer]],
    ['emerald.local.320',['get.320']], ['emerald.local.369',['get.369']]
  ]);
  for (const id of Object.keys(replacements)) tasks.delete(id);
  return [...tasks.values()].map(task=>({...task,
    depends_on:[...new Set((task.depends_on||[]).flatMap(id=>replacements[id]||[id]))]
  })).sort((a,b)=>a.position-b.position);
}

function requiredCopies(plan) {
  const counts = new Map();
  const branches = new Map();
  const trades = new Map();
  for (const task of plan) {
    const parent = task.requirements?.requires_species?.[0];
    if (task.method==='Evolution' && task.national_dex_id!==292)
      branches.set(parent,(branches.get(parent)||0)+1); // Ninjask and Shedinja share one Nincada.
    if (task.method==='In-game Trade' && parent) trades.set(parent,(trades.get(parent)||0)+1);
  }
  for (const parent of new Set([...branches.keys(),...trades.keys()])) {
    const count=(branches.get(parent)||0)+(trades.get(parent)||0);
    if(count>1)counts.set(parent,count);
  }
  counts.set(320,2); // Keep the base form through Pal Park and use the second to open the Regi caves.
  return counts;
}

function transferred(task, id, caught, marked, stillNeeded = () => false) {
  return (caught.has(id) && !stillNeeded(id)) ||
    Object.entries(task.old||{}).some(([key, species]) => species.includes(id) && marked(key));
}

function clamperlRemaining(caught, previouslyTransferred, inventory) {
  const branches = [367,368].filter(id=>!caught.has(id)).length;
  if (inventory !== null)
    return Math.max(caught.has(366)?0:1,branches-inventory);
  // An old Pal Park task or the Pokédex entry can confirm one copy in manual mode.
  return caught.has(366)||previouslyTransferred?Math.min(branches,1):Math.max(1,branches);
}

// A location is paired with its access checkpoint. Counts come from the active
// evolution/breeding tasks so one-use items cover every planned recipient.
const routeItems = [
  {gate:'2-22', place:'The Underground', action:'mine', items:['Thunder Stone','Moon Stone','Fire Stone','Leaf Stone','Water Stone','Sun Stone']},
  {gate:'story.riley', place:'Iron Island', action:'pickup', items:['Protector']},
  {gate:'9-9', place:'Iron Island', action:'byron', items:['Metal Coat']},
  {gate:'story.riley', place:'Iron Island', action:'lastRoom', items:['Shiny Stone']},
  {gate:'7-8', place:'Route 210', action:'climbDowsing', items:['Shiny Stone']},
  {gate:'6-1', place:'Route 212', action:'dowsing', items:['Dawn Stone']},
  {gate:'6-1', place:'Mt. Coronet', action:'surfPickup', items:['Dawn Stone']},
  {gate:'8-0', place:'Galactic Warehouse', action:'warehouse', items:['Dusk Stone']},
  {gate:'story.waterfall', place:'Victory Road', action:'strengthPickup', items:['Dusk Stone']},
  {gate:'4-2', place:'Route 214', action:'dowsing', items:['Razor Fang']},
  {gate:'4-2', place:'Route 214', action:'pickup', items:['Magmarizer']},
  {gate:'story.waterfall', place:'Victory Road', action:'pickup', items:['Razor Claw']},
  {gate:'7-8', place:'Acuity Lakefront', action:'climbPickup', items:['Reaper Cloth']},
  {gate:'6-1', place:'Valley Windworks', action:'surfPickup', items:['Electirizer']},
  {gate:'6-1', place:'Route 204', action:'surfPickup', items:['Sea Incense']},
  {gate:'6-1', place:'Fuego Ironworks', action:'surfPickup', items:['Rock Incense']},
  {gate:'4-2', place:'Solaceon Ruins', action:'lastRoom', items:['Odd Incense']},
  {gate:'8-0', place:'Veilstone City', action:'climbPickup', items:['Full Incense']},
  {gate:'6-1', place:'Celestic Town', action:'dowsing', items:["King's Rock"]},
  {gate:'10-6', place:'Route 225', action:'surfPickup', items:['Dubious Disc']},
  {gate:'9-9', place:'Eterna Galactic Building', action:'pickup', items:['Upgrade']},
  {gate:'open.johto.coast', place:'Slowpoke Well', action:'well', items:["King's Rock"], trade:true},
  {gate:'open.johto.late', place:'Mt. Mortar', action:'dragonScale', items:['Dragon Scale'], trade:true},
  {gate:'open.kanto.power', place:'Vermilion City', action:'surfPickup', items:['Luck Incense'], trade:true},
  {gate:'open.kanto.silver', place:'Route 20', action:'seafoamTooth', items:['Deep Sea Tooth'], trade:true},
  {gate:'open.kanto.silver', place:'Route 20', action:'seafoamScale', items:['Deep Sea Scale'], trade:true}
];

function itemChecklist(plan, local, acquisition, species, language) {
  const uses = new Map();
  for (const task of plan) {
    if (!['Evolution','Egg'].includes(task.method)) continue;
    for (const item of task.requirements.items||[]) {
      if (!uses.has(item)) uses.set(item, []);
      uses.get(item).push(task.national_dex_id);
    }
  }
  const split = new Set(['Shiny Stone','Dawn Stone','Dusk Stone',"King's Rock"]);
  const result = new Map();
  const format = (key, data) => local('@revision.'+key).replace(/\{(\w+)\}/g,(_,field)=>data[field]);
  const names = new Intl.ListFormat(language,{type:'conjunction'});
  for (const stop of routeItems) {
    const lines = result.get(stop.gate)||[];
    for (const item of stop.items) {
      if (!uses.has(item)) continue;
      const targets = split.has(item) ? [uses.get(item).shift()] : uses.get(item);
      const breeding = item.endsWith('Incense');
      const data = {item:acquisition.term(item), count:breeding?1:targets.length,
        place:acquisition.place(stop.place), targets:names.format(targets.map(id=>species[id].name))};
      lines.push(format('itemLine',data)+' '+format('item.'+stop.action,data)+
        (stop.trade?' '+local('@revision.item.trade'):'')+(breeding?' '+local('@revision.item.reusable'):''));
    }
    result.set(stop.gate,lines);
  }
  return result;
}

if(typeof module!=='undefined')module.exports={revisedRoutePlan,requiredCopies,transferred,clamperlRemaining,itemChecklist};
