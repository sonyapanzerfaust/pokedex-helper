'use strict';
const conditionNames={
 'swarm-yes':'объявлен swarm этого вида','swarm-no':'обычная таблица без swarm',
 'radar-on':'участок травы Poké Radar','radar-off':'обычная трава без Poké Radar',
 'time-day':'день','time-morning':'утро','time-night':'ночь','radio-off':'обычное радио',
 'radio-hoenn':'Hoenn Sound по средам после National Dex','radio-sinnoh':'Sinnoh Sound по четвергам после National Dex',
 'backlot-mentioned':'Backlot назвал вид сегодня или вчера','backlot-not-mentioned':'обычная таблица сада',
 'bug-catching-contest-yes':'конкурс ловли жуков по вторникам, четвергам и субботам','bug-catching-contest-no':'вне конкурса',
 'headbutt-tree-common':'группа обычных деревьев','headbutt-tree-rare':'редкая группа деревьев','headbutt-tree-secret':'особое скрытое дерево',
 'other-correct-password':'правильно ответь старейшине в Dragon’s Den','other-event-arceus-in-party':'приведи совместимого ивентового Arceus',
 'other-received-kanto-starter':'получи стартера Kanto у Oak','other-regirock-regice-registeel-in-party':'приведи трёх титанов в команде',
 'other-snorlax-11-beat-league':'после боя со Snorlax на Route 11 и повторной победы в Лиге',
 'other-talk-to-cynthias-grandmother':'поговори с бабушкой Cynthia в Celestic Town','other-talked-to-32-people-underground':'32 разговора с игроками в Underground',
 'other-giratina-not-caught-in-distortion-world':'Giratina остался непойманным в Distortion World',
 'story-progress-awakened-beasts':'пробуди зверей в Burned Tower','story-progress-beat-elite-four-round-two':'победи усиленную Лигу',
 'story-progress-beat-galactic-coronet':'заверши сюжет Team Galactic на Mt. Coronet','story-progress-beat-red':'победи Red на Mt. Silver',
 'story-progress-beat-team-galactic-iron-island':'вместе с Riley победи Galactic на Iron Island','story-progress-before-national-dex':'до National Dex',
 'story-progress-cure-eldritch-nightmares':'разбуди сына Eldritch с помощью Lunar Wing','story-progress-defeat-jupiter':'победи Jupiter в Eterna',
 'story-progress-defeat-mars':'освободи Valley Windworks от Mars','story-progress-hall-of-fame':'войди в Hall of Fame',
 'story-progress-national-dex':'получи National Dex','story-progress-oak-eterna-city':'после посещения Pal Park поговори с Oak в Eterna',
 'story-progress-receive-tm-from-claire':'получи TM у Clair после Dragon’s Den','story-progress-returned-machine-part':'верни Machine Part в Power Plant',
 'story-progress-vermilion-copycat':'забери куклу Copycat и встреть Steven у фан-клуба Vermilion','story-progress-zephyr-badge':'получи Zephyr Badge',
 'first-party-pokemon-high-friendship':'высокая дружба первого покемона','great-marsh-daily-slot-none':'обычная таблица болота',
 'slot2-none':'без картриджа в Slot-2','johto-safari-blocks-inactive':'таблица без активных блоков',
 'tv-option-blue':'после Лиги выбери синий цвет в разговоре с мамой','tv-option-red':'после Лиги выбери красный цвет в разговоре с мамой',
 'weekday-friday':'пятница','weekday-saturday':'суббота','weekday-thursday':'четверг','weekday-tuesday':'вторник'
};
function condition(code){
  if(conditionNames[code])return I18n.display(conditionNames[code]);
  const identifier=value=>{
    if(value==='any-pokemon')return I18n.t('encounter.any');
    const canonical=({ 'nidoran-m':'Nidoran♂','nidoran-f':'Nidoran♀',firered:'FireRed',leafgreen:'LeafGreen' })[value]??value;
    if(I18n.language==='ja')return globalThis.jaIdentifier(canonical);
    return globalThis.europeanIdentifier(canonical,I18n.language);
  };
  const blockTypes={plains:'encounter.plains',peak:'encounter.peak',forest:'encounter.forest',water:'encounter.water'};
  const rules=[
    [/^johto-safari-blocks-(\w+)-min-(\d+)$/,(_,type,n)=>I18n.t("encounter.at_least")+n+I18n.t("encounter.block_points_of_type")+I18n.t(blockTypes[type]??type)+I18n.t("encounter.in_this_area")],
    [/^great-marsh-daily-slot-(\d+)-of-32$/,(_,n)=>I18n.t("encounter.daily_area_rotation")+n+I18n.t("encounter.of_32_species_selection_slots")],
    [/^honey-tree-group-(\w)$/,(_,group)=>I18n.t("encounter.honey_tree_group")+group.toUpperCase()],
    [/^slot2-(.+)$/,(_,cart)=>I18n.t("encounter.cartridge")+identifier(cart)+I18n.t("encounter.in_slot_2")],[/^trade-(.+)$/,(_,mon)=>I18n.t("encounter.offer")+identifier(mon)],
    [/^item-(.+)$/,(_,item)=>I18n.t("encounter.requires")+identifier(item)],[/^coins-(\d+)$/,(_,n)=>n+I18n.t("encounter.game_corner_coins")],
    [/^starter-(.+)$/,(_,mon)=>I18n.t("encounter.starter")+identifier(mon)]
  ];
  for(const [pattern,replacement] of rules)if(pattern.test(code))return code.replace(pattern,replacement);
  return code.replace(/-/g,' ');
}
function readable(text){
  return I18n.display(text).replace(/(?:story-progress|other|bug-catching-contest|backlot|swarm|time|slot2|radar|radio|johto-safari-blocks|headbutt-tree|honey-tree-group|great-marsh-daily-slot|weekday|item)-[a-z0-9-]+/gi,condition);
}
const methodKeys = {
  "Cave": "method.cave",
  "Tall Grass": "method.tall_grass",
  "Safari Zone": "method.safari_zone",
  "Great Marsh": "method.great_marsh",
  "Rock Smash": "method.rock_smash",
  "Surf": "method.surf",
  "Old Rod": "method.old_rod",
  "Good Rod": "method.good_rod",
  "Super Rod": "method.super_rod",
  "Headbutt": "method.headbutt",
  "Static Encounter": "method.static_encounter",
  "In-game Trade": "method.in_game_trade",
  "Gift Egg": "method.gift_egg",
  "Honey Trees": "method.honey_trees",
  "Gift": "method.gift",
  "Poké Radar": "method.pok_radar",
  "Swarm": "method.swarm",
  "Egg": "method.egg",
  "Evolution": "method.evolution",
  "Roaming": "method.roaming",
  "Event": "method.event"
};
function methodName(e){const method=methodLabel(e);return methodKeys[method]?I18n.t(methodKeys[method]):method}
function methodLabel(e){
  if(e.method==='walk'){
    if(e.location.includes('safari-zone'))return 'Safari Zone';
    if(e.location.includes('great-marsh'))return 'Great Marsh';
    if(/cave|coronet|tunnel|victory-road|mine|mountain|mt-|ruins|seafoam|whirl-islands/i.test(e.location))return 'Cave';
    if(/tower|mansion|chateau|ironworks|temple/.test(e.location))return I18n.t("encounter.indoors");
    return 'Tall Grass';
  }
  return ({'seaweed':I18n.t('encounter.seaweed'),'colosseum-bonus-disc-jpn':I18n.t('encounter.disc'),'wailmer-pail':I18n.t('encounter.pail'),'squirt-bottle':I18n.t('encounter.bottle'),'pokemon-ranger':'Pokémon Ranger','static':'Static Encounter','npc-trade':'In-game Trade','gift-egg':'Gift Egg','honey-tree':'Honey Trees','roaming-grass':I18n.t("encounter.roaming_grass"),'roaming-water':I18n.t("encounter.roaming_water"),'feebas-tile-fishing':I18n.t("encounter.fishing_on_a_special_tile"),'pokeflute':I18n.t('encounter.flute'),'devon-scope':I18n.t('encounter.scope')})[e.method]||e.method.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}
const namesOfGames={platinum:'Platinum',diamond:'Diamond',pearl:'Pearl',heartgold:'HeartGold',soulsilver:'SoulSilver',emerald:'Emerald',firered:'FireRed',leafgreen:'LeafGreen'};

const slotMethods=new Set(['walk','surf','old-rod','good-rod','super-rod','rock-smash','headbutt','headbutt-low','headbutt-high','headbutt-normal','honey-tree','feebas-tile-fishing','seaweed','dive']);
function encounterRow(enc) {
  const codes=enc.conditions.split(', ').filter(Boolean);
  const period=codes.find(code=>['time-morning','time-day','time-night'].includes(code));
  const conditions=codes.filter(code=>code!==period).map(code=>({
    text:model.guide.words[I18n.language]['@condition.'+code]||condition(code),
    icon:code.startsWith('radio-')?'radio':code.startsWith('swarm-')?'swarm':code.startsWith('radar-')?'radar':''
  }));
  const total=enc.slots.reduce((sum,slot)=>slot.weight===''?NaN:sum+Number(slot.weight),0);
  const weight=slotMethods.has(enc.method)&&total>0&&total<=100?total+'%':'';
  const levels=[...new Set(enc.slots.map(s=>s.level.replace(/^(\d+)[–-]\1$/,'$1')).filter(Boolean))].join(', ');
  const type=methodLabel(enc);
  const icon=methodIcon[type] || (enc.method.startsWith('headbutt')?'headbutt':enc.method==='feebas-tile-fishing'?'fishing':'special');
  return {location:globalThis.encounterLocation(enc.location,I18n.language),method:methodName(enc),icon,conditions,
    time:period?.slice(5),weight,level:levels,unknownWeight:slotMethods.has(enc.method)&&!weight};
}

const encounterIconPaths={
  morning:'M2 17h20M5 14a7 7 0 0 1 14 0M12 2v3M4 6l2 2m14-2-2 2',
  day:'M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
  night:'M21 15a9 9 0 0 1-12-12 9 9 0 1 0 12 12Z',
  radio:'M3 10h18v10H3zM5 10l13-6m-12 10h6m-6 3h6m4-2h2',
  radar:'M12 12l5-5M12 12h.01M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  swarm:'M12 2l1.8 4.2L18 8l-4.2 1.8L12 14l-1.8-4.2L6 8l4.2-1.8zM4 14v6m-3-3h6m12-3v6m-3-3h6'
};
function encounterIcon(id) {
  const ns='http://www.w3.org/2000/svg';
  const icon=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');
  icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('class','encounter-symbol');icon.setAttribute('aria-hidden','true');
  path.setAttribute('d',encounterIconPaths[id]);icon.append(path);return icon;
}

function acquisitionTable(rows, caption) {
  const word=key=>routeWord('table.'+key);
  const frame=node('div',null,'encounter-scroll'), table=node('table',null,'encounter-table');
  frame.tabIndex=0;frame.setAttribute('role','region');frame.setAttribute('aria-label',caption);frame.append(table);
  const head=node('thead'), headers=node('tr'), body=node('tbody');
  table.append(node('caption',caption),head,body);head.append(headers);
  for(const key of ['location','method','time','conditions','rate','level']){
    const th=node('th',word(key));th.scope='col';headers.append(th);
  }
  for(const row of rows) {
    const tr=node('tr');body.append(tr);
    tr.append(node('td',row.location||'—'));
    const method=node('td',row.method||'—');
    if(row.method){method.prepend(fieldIcon(row.icon||methodIcon[row.methodId]||'special'));method.title=I18n.display(row.method)}
    const time=node('td',row.time?routeWord(row.time):'—');
    if(encounterIconPaths[row.time]){time.prepend(encounterIcon(row.time));time.title=time.textContent}
    const conditions=node('td');
    for(const value of row.conditions||[]){
      const item=typeof value==='string'?{text:value}:value;
      const pill=node('span',item.text,'encounter-condition');pill.title=pill.textContent;
      if(item.icon)pill.prepend(encounterIcon(item.icon));
      conditions.append(pill);
    }
    if(!conditions.childElementCount)conditions.textContent='—';
    const chance=node('td',row.chance||row.weight||'—','encounter-number');
    if(row.weight){
      chance.append(node('small',word('slots')));
      chance.title=word('slotExplanation');
    }else if(row.chance&&row.chanceBasis)chance.title=I18n.display(row.chanceBasis);
    else if(row.unknownWeight)chance.title=I18n.t('encounter.unconfirmed');
    tr.append(method,time,conditions,chance,node('td',row.level||'—','encounter-number'));
  }
  return frame;
}

function encounterList(body,entry,item) {
  const id=entry.nationalId,view=entry.acquisition;
  const records=[entry.task,...model.guide.species[id].alternatives];
  if(entry.path){
    const other=model.guide.tasks.find(task=>task.id===(entry.early?entry.path.target:entry.path.earlyId));
    if(other)records.push(other);
  }
  const versions=model.guide.species[id].versionTable;
  if(versions?.both&&['HeartGold','SoulSilver'].includes(entry.task.game)&&!entry.task.routeNote){
    const other=versions.versions.find(game=>game!==entry.task.game);
    if(other)records.push({...entry.task,game:other});
  }
  const games=[...new Set([...records.map(record=>entry.local(record.game)),...item.encounters.map(enc=>namesOfGames[enc.game])].filter(Boolean))];
  const picker=node('select'),label=node('label',I18n.t('encounter.game')+' '),list=node('div');
  for(const game of games){const option=node('option',game);option.value=game;picker.append(option)}
  label.append(picker);body.append(label,list);
  function show(){
    const game=picker.value;
    list.replaceChildren();
    const reviewed=records.filter(record=>entry.local(record.game)===game).flatMap(record=>{
      const rows=view.rows({...record,location:entry.local(record.location)},id);
      if(record.routeNote)for(const row of rows)row.conditions.push(entry.local(record.routeNote));
      return rows;
    });
    if(reviewed.length)list.append(acquisitionTable(reviewed,routeWord('table.guide')));
    const raw=item.encounters.filter(enc=>namesOfGames[enc.game]===game).map(encounterRow);
    if(raw.length)list.append(acquisitionTable(raw,routeWord('table.encounters')));
  }
  picker.onchange=show;show();
  if(entry.method!=='Evolution'){
    const evolution=view.evolutionRows(id);
    if(evolution.length)body.append(acquisitionTable(evolution,I18n.t('method.evolution')));
  }
}
