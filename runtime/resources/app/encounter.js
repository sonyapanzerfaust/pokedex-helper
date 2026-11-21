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
  const rules=[
    [/^johto-safari-blocks-(\w+)-min-(\d+)$/,(_,type,n)=>I18n.t("encounter.at_least")+n+I18n.t("encounter.block_points_of_type")+type+I18n.t("encounter.in_this_area")],
    [/^great-marsh-daily-slot-(\d+)-of-32$/,(_,n)=>I18n.t("encounter.daily_area_rotation")+n+I18n.t("encounter.of_32_species_selection_slots")],
    [/^honey-tree-group-(\w)$/,(_,group)=>I18n.t("encounter.honey_tree_group")+group.toUpperCase()],
    [/^slot2-(.+)$/,(_,cart)=>I18n.t("encounter.cartridge")+cart+I18n.t("encounter.in_slot_2")],[/^trade-(.+)$/,(_,mon)=>I18n.t("encounter.offer")+mon.replace(/-/g,' ')+' NPC'],
    [/^item-(.+)$/,(_,item)=>I18n.t("encounter.requires")+item.replace(/-/g,' ')],[/^coins-(\d+)$/,(_,n)=>n+I18n.t("encounter.game_corner_coins")],
    [/^starter-(.+)$/,(_,mon)=>I18n.t("encounter.starter")+mon]
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
  return ({'static':'Static Encounter','npc-trade':'In-game Trade','gift-egg':'Gift Egg','honey-tree':'Honey Trees','roaming-grass':I18n.t("encounter.roaming_grass"),'roaming-water':I18n.t("encounter.roaming_water"),'feebas-tile-fishing':I18n.t("encounter.fishing_on_a_special_tile"),'pokeflute':'Poké Flute','devon-scope':'Devon Scope'})[e.method]||e.method.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}
const namesOfGames={platinum:'Platinum',diamond:'Diamond',pearl:'Pearl',heartgold:'HeartGold',soulsilver:'SoulSilver',emerald:'Emerald',firered:'FireRed',leafgreen:'LeafGreen'};
function registration(game){
  return game==='platinum'?I18n.t("encounter.registered_when_obtained_in_platinum"):['emerald','firered','leafgreen'].includes(game)?I18n.t("encounter.transfer_via_pal_park_on_route_221_after"):I18n.t("encounter.trade_from")+namesOfGames[game]+I18n.t("encounter.to_platinum_in_the_union_room");
}
function encounterList(body,entry,item){
  const picker=node('select'),label=node('label',I18n.t("encounter.game"));label.append(picker);body.append(label);
  const available=Object.keys(namesOfGames).filter(g=>item.encounters.some(e=>e.game===g));
  const suggested=available.find(g=>entry.place.toLowerCase().includes(g))||available[0];
  for(const game of available){const option=node('option',namesOfGames[game]);option.value=game;picker.append(option)}
  const list=node('div');body.append(list);
  function show(){
    const game=picker.value;list.replaceChildren(node('p',registration(game)));
    for(const enc of item.encounters.filter(e=>e.game===game)){
      const conditions=enc.conditions.split(', ').filter(Boolean).map(condition);
      const random=['walk','surf','old-rod','good-rod','super-rod','rock-smash','headbutt','headbutt-low','headbutt-high','headbutt-normal','honey-tree','feebas-tile-fishing'].includes(enc.method);
      const total=enc.slots.reduce((n,s)=>s.weight===''?NaN:n+Number(s.weight),0);
      const rate=Number.isFinite(total)&&total>0&&total<=100?total+'%':I18n.t("encounter.unconfirmed");
      const levels=[...new Set(enc.slots.map(s=>s.level.replace(/^(\d+)–\1$/,'$1')))].join(', ');
      list.append(node('p',[enc.location.replace(/-/g,' '),methodName(enc),...conditions,random?I18n.t("encounter.combined_weight_of_the_listed_slots")+rate:'', I18n.t("encounter.lv")+levels].filter(Boolean).join(' · ')));
    }
  }
  if(available.length){picker.value=suggested;picker.onchange=show;show()}else label.remove();
}
