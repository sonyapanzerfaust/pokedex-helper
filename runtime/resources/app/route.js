'use strict';
const rareWays={
  214:{target:17,place:'HG/SS · Azalea Town',how:'В Ilex Forest попроси наставника научить покемона Headbutt. Вернись в Azalea Town и бей деревья. Если дерево даёт другую группу встреч, смени дерево. Обменяй Heracross в Platinum.'},
  446:{target:17,place:'HG/SS · Route 11 → Day Care',how:'Восстанови электростанцию Kanto, получи EXPN Card в радиобашне Lavender Town. Включи Poké Flute рядом со Snorlax у Diglett’s Cave. Поймай его, дай Snorlax Full Incense и оставь с Ditto в Day Care. Вылупи Munchlax и обменяй в Platinum.'}
};
const events={
  380:['HeartGold · Vermilion → Kanto','После ремонта электростанции поговори с Copycat в Saffron. Забери Lost Item у мужчины в Pokémon Fan Club в Vermilion. На выходе Steven сообщит о Latias. Ищи его на карте Pokégear в Kanto, поймай и обменяй в Platinum.'],
  381:['SoulSilver · Vermilion → Kanto','Восстанови Power Plant, поговори с Copycat в Saffron и забери её Lost Item у мужчины в Pokémon Fan Club в Vermilion. При выходе Steven расскажет о Latios. Отслеживай перемещения в Kanto по Pokégear. После поимки обменяй его в Platinum.'],
  214:['Platinum · Honey Trees','После спасения продавца в Floaroma Meadow намажь дерево мёдом. Проверь через 6–24 часа по часам DS. Heracross занимает 5% группы B. При новом выборе группы B выпадает с вероятностью 20% на обычном дереве и 70% на особом.'],
  446:['Platinum · особые Honey Trees','При новом выборе группы на особом дереве шанс группы C составляет 1%. В ней только Munchlax. На обычном дереве группа C недоступна. Повторное намазывание того же дерева может сохранить группу.'],
  442:['Platinum · Hallowed Tower, Route 209','Вставь Odd Keystone в руины. В Underground поговори с другим игроком 32 раза. Можно встречаться с одним другом, выходя и снова входя в Underground между разговорами. Продавцы не считаются. Вернись к башне и начни бой.'],
  490:['Diamond/Pearl USA · исторический подарок TRU Manaphy','Без Ranger на Windows: на отдельной копии английского Diamond/Pearl загрузи архивную Wonder Card 001 TRU Manaphy и соответствующий Gift в свободные слоты Pokesav D/P (пошагово в README). На 3DS на отдельной копии английского сохранения Diamond/Pearl открой Event Injector в PKSM на 3DS, выбери американскую карту Toys “R” Us Manaphy 2007 для D/P и сохрани копию. Запусти эту копию, освободи место в команде, забери Manaphy ур. 50 у курьера в Poké Mart и обменяй в Platinum. Один подарок на карту.'],
  489:['Platinum · Day Care, Solaceon Town','Оставь Manaphy с Ditto у воспитателей. Получи яйцо у мужчины снаружи и вылупи Phione в Platinum.'],
  491:['Platinum · Canalave → Newmoon Island','Историческая Member Card. После National Dex помоги сыну моряка, принеси Lunar Wing с Fullmoon Island. Получи восстановленную карту совместимого события у курьера, зайди в Harbor Inn на севере Canalave, затем встреться с Darkrai на острове.'],
  492:['Platinum · Route 224 → Flower Paradise','Историческое Oak’s Letter. После National Dex получи письмо события у курьера и пройди через восточную часть Victory Road на Route 224. Поговори с Oak у камня, пройди по Seabreak Path к Shaymin.'],
  493:['D/P/Pt · историческая дистрибуция','Azure Flute официально не распространяли в поколении IV. Для исторического варианта восстанови совместимую Wonder Card TRU Arceus в копии английского донорского D/P, получи у курьера в Poké Mart и обменяй в Platinum.'],
  151:['HG/SS · историческая дистрибуция','Восстанови английскую карту FAL2010 Mew в совместимой донорской копии HG/SS. Забери один подарок у курьера в Poké Mart и обменяй в Platinum.'],
  251:['HG/SS · историческая дистрибуция','На совместимой английской донорской копии восстанови карту WIN2011 Celebi. Получи подарок у курьера Poké Mart и обменяй в Platinum.'],
  385:['D/P/Pt/HG/SS · историческая дистрибуция','Используй совместимую английскую карту SMR2010 Jirachi в отдельной донорской копии, забери подарок у курьера Poké Mart и обменяй в Platinum.'],
  386:['FireRed/LeafGreen · Birth Island','Исторический AuroraTicket для совместимой версии. С билетом отправляйся на Birth Island через порт Vermilion. Подходи к перемещающемуся треугольнику кратчайшим путём и взаимодействуй с ним до боя с Deoxys. После поимки перенеси через Pal Park.']
};
function route(catalog,methods,starter,deferred){
  const donors={heartgold:17,soulsilver:17,emerald:16,diamond:19,pearl:20,firered:21,leafgreen:21};
  const swarm=catalog.find(s=>s.stage===15);
  for(const e of swarm.entries){
    if(rareWays[e.nationalId])continue;
    const candidates=methods[e.nationalId].encounters.filter(m=>donors[m.game]&&['walk','surf','old-rod','good-rod','super-rod'].includes(m.method)&&
      (!m.conditions||/^time-(day|morning|night)$/.test(m.conditions))&&!/safari|mirage/.test(m.location));
    candidates.sort((a,b)=>b.slots.reduce((n,x)=>n+Number(x.weight),0)-a.slots.reduce((n,x)=>n+Number(x.weight),0));
    const best=candidates[0];
    if(best)rareWays[e.nationalId]={target:donors[best.game],place:best.game+' · '+best.location.replace(/-/g,' '),how:'Альтернатива swarm: '+best.method.replace(/-/g,' ')+(best.conditions?' · '+best.conditions:'')+'. '+([16,21].includes(donors[best.game])?'Перенеси через Pal Park.':'Обменяй в Platinum.')};
  }
  const sections=structuredClone(catalog).filter(s=>s.stage!==0);
  const stage=id=>sections.find(s=>s.stage===id);
  for(const s of sections) for(const e of s.entries){
    if(events[e.nationalId])[e.place,e.how]=events[e.nationalId];
    if(s.stage===22){e.place='Platinum · Эволюция';e.how=methods[e.nationalId].evolution.join(' / ')}
  }
  stage(17).title='HG/SS';stage(17).desc='Johto и Kanto. Версия и условия указаны у каждого способа.';
  stage(17).entries.push(...stage(18).entries);sections.splice(sections.indexOf(stage(18)),1);
  for(const e of stage(17).entries){
    if([56,57,58,59,138,139,167,168,207,226,231,232,302,343,344,347,348,380,382,458,472].includes(e.nationalId))e.exclusive='HG/SS · эксклюзив HeartGold при обычном прохождении';
    if([37,38,52,53,140,141,165,166,216,217,225,227,303,316,317,345,346,381,383].includes(e.nationalId))e.exclusive='HG/SS · эксклюзив SoulSilver при обычном прохождении';
  }
  stage(21).title='FireRed / LeafGreen';
  stage(21).desc='Выбери одну версию. Ekans доступен в FireRed. Для LeafGreen используй вариант в SoulSilver.';
  stage(8).entries.push({key:'story-giratina',name:'Событие Giratina',place:'Distortion World',how:'Заверши встречу и выйди через портал. Ловля необязательна.'});
  stage(23).entries.sort((a,b)=>Number(!a.nationalId)-Number(!b.nationalId));
  const starts=[387,390,393];
  const destinations=new Map([[starter,1],...starts.filter(id=>id!==starter).map((id,i)=>[id,19+i])]);
  for(const id of starts){
    const from=sections.find(s=>s.entries.some(e=>e.nationalId===id)),idx=from.entries.findIndex(e=>e.nationalId===id);
    const [e]=from.entries.splice(idx,1),dest=stage(destinations.get(id));
    e.place=dest.stage===1?'Platinum · Route 201':(dest.stage===19?'Diamond':'Pearl')+' · Lake Verity';
    e.how=dest.stage===1?'Выбери у Rowan в начале игры.':'Выбери этого стартера у озера. Получи Pokédex у Rowan, поймай второго покемона и используй локальный DS-обмен в Pokémon Center. Для другого стартера нужна другая игра или отдельное новое сохранение.';
    dest.entries.unshift(e);
  }
  for(const [id,way] of Object.entries(rareWays)){
    if(!deferred[id])continue;
    const s=sections.find(s=>s.entries.some(e=>e.nationalId===Number(id)));
    const [e]=s.entries.splice(s.entries.findIndex(e=>e.nationalId===Number(id)),1);
    stage(way.target).entries.push({...e,place:way.place,how:way.how});
  }
  return sections;
}
