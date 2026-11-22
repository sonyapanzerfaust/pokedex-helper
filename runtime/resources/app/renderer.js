'use strict';
const service=window.desktop;
const routeWord=key=>model.guide.words[I18n.language]?.['@ui.'+key]??model.guide.words.en['@ui.'+key];
const games=['Platinum','HeartGold','SoulSilver','Diamond','Pearl','Emerald','FireRed','LeafGreen'];
const $=id=>document.getElementById(id);
function node(tag,text,cls){const el=document.createElement(tag);if(text!=null)el.textContent=I18n.display(text);if(cls)el.className=cls;return el}
function safely(fn){return async(...args)=>{try{return await fn(...args)}catch(e){if(e.name!=='AbortError'){const target=$('wizard').open?$('wizardError'):activePage==='route'?$('actionError'):$('pageStatus');if(target)target.textContent=managementError(e);console.error(e)}}}}
function button(label,fn){const b=node('button',label);b.onclick=safely(fn);return b}
const badges=['Coal Badge','Forest Badge','Cobble Badge','Fen Badge','Relic Badge','Mine Badge','Icicle Badge','Beacon Badge'];
const boundaries=['Coal Badge','Forest Badge','Relic Badge','Cobble Badge','Fen Badge','Mine Badge','Icicle Badge','Событие Giratina','Чемпион Cynthia'];
let model,prefs,sections=[],step=0,queued=Promise.resolve();
const names=new Map();
const trainingLevels=new Map();
function applyLocale(){
  I18n.set(prefs.language);document.documentElement.lang=I18n.language;
  for(const el of document.querySelectorAll('[data-i18n]'))(Array.from(el.childNodes).find(n=>n.nodeType===Node.TEXT_NODE)||el.appendChild(document.createTextNode(''))).nodeValue=I18n.t(el.dataset.i18n);
  for(const attr of ['placeholder','aria-label'])for(const el of document.querySelectorAll('[data-'+attr+']'))el.setAttribute(attr,I18n.t(el.getAttribute('data-'+attr)));
}
function applyAppearance(){
  const scale=Number(prefs.interfaceScale);
  service.setScale(Number.isInteger(scale)&&scale>=90&&scale<=150&&scale%5===0?scale:115);
  document.body.classList.toggle('compact',!!prefs.compactSidebar);
  $('compact').setAttribute('aria-pressed',String(!!prefs.compactSidebar));
}
function scaleControl(){
  const root=node('div',null,'scale-control'),slider=node('input'),caption=node('label');
  slider.type='range';slider.id='interfaceScale';slider.min=90;slider.max=150;slider.step=5;slider.value=prefs.interfaceScale;
  caption.htmlFor=slider.id;
  const refresh=()=>{caption.textContent=routeWord('scale')+' · '+slider.value+'%'};
  slider.oninput=()=>{prefs.interfaceScale=Number(slider.value);applyAppearance();refresh()};
  slider.onchange=safely(save);
  const reset=button(routeWord('resetScale'),async()=>{slider.value=115;slider.oninput();await save()});
  refresh();root.append(caption,slider,reset);return root;
}
function revealTask(section,key){
  if(!section)return;
  $('search').value='';$('filter').value='all';render();
  const card=document.querySelector('[data-section="'+section.stage+'"]');
  if(!card)return;
  card.open=true;updateExpandButton();const target=key?card.querySelector('[data-task="'+CSS.escape(key)+'"]'):card.querySelector('summary');
  if(target){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'center'})}
}
function save(){const copy=structuredClone(prefs);queued=queued.catch(()=>{}).then(()=>service.prefs(copy));return queued}
const automatic=()=>prefs.mode==='auto';
const dex=()=>model.cache.Platinum;
const selected=()=>automatic()&&dex()?.starter?dex().starter:Number(prefs.starter)||387;
function checked(e){return prefs.manual[e.key]??!!prefs.done[e.legacyId]}
function story(e){
  if(!automatic())return checked(e);
  if(Object.hasOwn(prefs.manual,e.key))return prefs.manual[e.key];
  const pt=dex(),i=badges.indexOf(e.name);
  if(e.key==='platinum.complete')return pt?.caught?.length===493;
  return checked(e)||!!(i>=0&&pt?.badges&(1<<i))||!!({'Событие Giratina':pt?.giratina,'Чемпион Cynthia':pt?.league,'National Dex':pt?.national,'493 / 493 caught':pt?.caught.length===493})[e.name];
}
function donorGames(id){return Object.entries(model.cache).filter(([g,d])=>g!=='Platinum'&&d.caught.includes(id)).map(([g])=>g)}
function detail(entry){
  $('detailTitle').textContent=I18n.display(entry.name);
  const body=$('detailBody');body.replaceChildren();
  const id=entry.nationalId, item=model.methods[id], view=entry.acquisition;
  const listed=new Set([entry.task.game+' · '+entry.how]);
  function alternative(game,line){
    const text=[game,line].filter(Boolean).join(' · ');
    if(listed.has(text))return;
    listed.add(text);
    body.append(node('p',text));
  }
  for(const option of model.guide.species[id].alternatives)
    alternative(option.game,view.format(option,id));
  if(entry.path){
    const other=model.guide.tasks.find(t=>t.id===(entry.early?entry.path.target:entry.path.earlyId));
    if(other)alternative(other.game,view.format(other,id));
  }
  if(entry.method!=='Evolution')for(const line of view.evolution(id))alternative('',line);
  const versions=model.guide.species[id].versionTable;
  if(versions && ['HeartGold','SoulSilver'].includes(entry.task.game) && versions.both){
    const other=versions.versions.find(game=>game!==entry.task.game);
    if(other)alternative(other,entry.how);
  }
  if(item.encounters.length)encounterList(body,entry,item);
  if(!body.childElementCount)body.append(node('p',routeWord('noAlternatives')));
  $('detail').showModal();
}
function celebrate(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const canvas=node('canvas');canvas.className='confetti';document.body.append(canvas);
  canvas.width=innerWidth;canvas.height=innerHeight;
  const ctx=canvas.getContext('2d'),start=performance.now(),colors=['#f9c669','#68d5a0','#6799ed','#f28788'];
  const pieces=Array.from({length:110},()=>[Math.random()*canvas.width,Math.random()*-300,1+Math.random()*3,Math.random()*6]);
  function frame(t){ctx.clearRect(0,0,canvas.width,canvas.height);pieces.forEach(([x,y,v,a],i)=>{ctx.fillStyle=colors[i%4];ctx.fillRect(x+25*Math.sin(t/270+a),y+(t-start)*v/5,6,9)});if(t-start<3400)requestAnimationFrame(frame);else canvas.remove()}
  requestAnimationFrame(frame);
}
async function milestone(){
  const p=dex();if(!p)return;
  let resolved=false;
  if(automatic())for(const path of model.guide.deferrals){if(prefs.deferred[path.id]&&p.caught.includes(path.id)){delete prefs.deferred[path.id];resolved=true}}
  if(resolved)await save();
  const key=String(p.trainer),past=prefs.milestones[key],count=p.caught.length;
  if(past?.count===count)return;
  const first=count===493&&past&&past.count<493&&!past.reached;
  prefs.milestones[key]={count,reached:!!past?.reached||count===493};await save();
  if(first&&automatic())celebrate();
}
function updateLaunch(){
  const game=$('donorSelect').value;
  const emu=['Emerald','FireRed','LeafGreen'].includes(game)?'mGBA':'melonDS';
  const missing=!model.availability.rom[game]?'ROM '+game:!model.availability.emulator[emu]?emu:'';
  $('play').textContent=I18n.t("renderer.play")+game;$('play').disabled=!!missing;
  $('play').textContent=$('play').textContent.replace(/^[▶▷]\s*/, '');$('play').prepend(fieldIcon('launch'));
  $('play').title=$('play').textContent;$('play').setAttribute('aria-label',$('play').title);
  $('donorSelect').title=game;
  $('launchHint').textContent=missing?I18n.t("renderer.connect")+missing+I18n.t("renderer.in_settings"):I18n.t("renderer.emulator")+emu;
}
let boxNumber=0;
function roster(){
  const root=$('roster'),pt=dex();root.replaceChildren();
  if(!$('team').open)return;
  if(!pt){root.append(node('p',I18n.t("renderer.connect_your_platinum_save")));return}
  const selector=node('select');selector.setAttribute('aria-label',I18n.t("renderer.party_or_box"));
  for(let i=0;i<=18;i++){
    const o=node('option',i?I18n.t('renderer.pc_box',{number:i}):I18n.t("renderer.active_party"));o.value=i;selector.append(o);
  }
  selector.value=boxNumber;selector.onchange=()=>{boxNumber=Number(selector.value);roster();root.querySelector('select').focus()};
  const grid=node('div',null,'members');root.append(selector,grid);
  const mons=boxNumber?pt.boxes.filter(m=>m.box===boxNumber):pt.party;
  mons.forEach((m,i)=>{
    const card=node('div',null,'member');
    const text=node('div');text.append(node('strong',m.egg?I18n.t("renderer.egg"):names.get(m.species)||'#'+m.species),
      node('small',(boxNumber?I18n.t("renderer.cell")+m.slot:I18n.t("renderer.slot")+(i+1))+(Number.isInteger(m.level)?I18n.t("renderer.lv")+m.level:'')));
    card.append(text);grid.append(card);
  });
  if(!mons.length)grid.append(node('p',I18n.t("renderer.empty")));
}
function stageType(n){return n<=9?I18n.t("renderer.platinum_story"):n<=15?I18n.t("renderer.after_the_league"):n<=21?I18n.t("renderer.donor"):n===22?I18n.t("renderer.evolutions"):I18n.t("renderer.final_tasks")}
function taskMark(e,s){
  if(e.kind==='transfer')return routeWord('transfer');
  if(!e.nationalId)return I18n.t("renderer.story");
  if(e.path||s.stage===15)return I18n.t("renderer.rare_encounter");
  if(e.method)return e.local(model.guide.methods[e.method]||e.method);
  return routeWord('task');
}

let routeFilterKey,filteredOpen=new Map();
function updateExpandButton(){
  const cards=[...$('sections').querySelectorAll('details')];
  $('expand').disabled=!cards.length;
  $('expand').textContent=cards.length&&cards.every(card=>card.open)?I18n.t('navigation.collapse_all'):I18n.t('navigation.expand_all');
}
function render(){

  const pt=dex(),auto=automatic(),caught=new Set(auto?pt?.caught:Object.keys(prefs.caught).filter(id=>prefs.caught[id]).map(Number)),seen=new Set(auto?pt?.seen:[]);
  sections=approvedRoute(model.guide,model.catalog,selected(),prefs.deferred,caught,I18n.language,model.methods);
  const complete=e=>e.goal?caught.has(e.nationalId):e.deferred?false:story(e);
  const dexMilestone=sections.find(s=>s.stage==='platinum.finish').entries.find(e=>e.key==='9-9');
  const storyStages=sections.filter(s=>typeof s.stage==='number');
  const gateOf=s=>s.entries.find(e=>e.name===boundaries[s.stage-1]);
  const platinumStage=storyStages.find(s=>!story(gateOf(s)));
  // Presentation order puts Postgame first; its donor-dependent goals cannot gate Emerald.
  const recommended=[...storyStages,...sections.filter(s=>['emerald','frlg','diamond','pearl','hgss'].includes(s.stage)),...sections.filter(s=>['evolutions','platinum.finish','events'].includes(s.stage))];
  const active=recommended.find(s=>{
    if(s.stage<=9)return !story(s.entries.find(e=>e.name===boundaries[s.stage-1]));
    if(dexMilestone&&!story(dexMilestone))return s.stage==='platinum.finish';
    return s.entries.some(e=>!complete(e)&&!e.deferred&&!e.path);
  })?.stage;
  const q=$('search').value.trim().toLowerCase(),filter=$('filter').value;
  $('caught').textContent=auto&&!pt?'—':caught.size;$('seen').textContent=auto&&pt?seen.size:'—';
  $('manual').textContent=storyStages.filter(s=>story(gateOf(s))).length+' / '+storyStages.length;$('progress').value=caught.size;
  $('source').textContent=auto?(pt?I18n.t('renderer.save_source',{id:String(pt.tid)}):I18n.t("renderer.automatic_mode_connect_your_platinum_save")):I18n.t("renderer.manual_mode_record_catches_from_your_console");
  if(!(auto&&pt?.starter)&&!prefs.starter)$('source').textContent+=I18n.t("renderer.previewing_the_turtwig_line_choose_your_starter_in");
  const entriesByKey=new Map(sections.flatMap(section=>section.entries.map(e=>[e.key,e])));
  const available=e=>{
    if(complete(e)||e.deferred||(auto&&!pt))return false;
    if(platinumStage && e.key===gateOf(platinumStage).key)return true;
    if(!platinumStage && !story(dexMilestone) && e.key==='9-8')return true;
    if(e.key==='9-9')return !platinumStage && story(entriesByKey.get('9-8'));
    if(e.method==='Evolution'&&auto&&e.task.game==='Platinum'&&trainingLevels.has(e.nationalId)){
      const source=e.task.requirements.requires_species?.[0];
      return source&&[...(pt.party||[]),...(pt.boxes||[])].some(mon=>mon.species===source&&!mon.egg&&Number.isInteger(mon.level)&&mon.level<100);
    }
    if(e.kind!=='story'||e.task.game==='Platinum'||e.key==='open.events')return false;
    if(automatic()&&!pt?.national)return false;
    if(!dexMilestone||!story(dexMilestone))return false;
    return e.task.depends_on.every(key=>key==='open.platinum.10'||(entriesByKey.has(key)&&complete(entriesByKey.get(key))));
  };
  const objectiveSection=recommended.find(s=>s.entries.some(available));
  const next=objectiveSection?.entries.find(available);
  const shownStage=platinumStage||sections.find(s=>s.stage==='platinum.finish');
  paintScene(document.querySelector('.campaign'),sceneFor(sections.find(s=>s.stage===active)||shownStage));
  paintScene(document.querySelector('.now'),sceneFor(shownStage));
  $('currentStage').textContent=shownStage.title;
  $('nextTask').textContent=next?[next.name,next.place].map(I18n.display).filter(Boolean).join(' · '):caught.size===493?I18n.t("renderer.route_complete"):routeWord('none');
  $('jump').hidden=!next;$('jump').onclick=()=>revealTask(objectiveSection,next?.key);
  $('currentNav').onclick=()=>revealTask(shownStage,null);
  $('stageRemaining').textContent=platinumStage?I18n.plural('route.remaining',platinumStage.entries.filter(e=>!complete(e)).length):I18n.t('renderer.story_complete');
  $('syncBadge').textContent=routeWord(!auto?'manualMode':model.errors.Platinum?'syncError':pt?'syncOk':'syncWait');
  for(const [id,key] of Object.entries({routeNav:'routeNav',campaignLabel:'campaign',objectiveLabel:'objective',jump:'jump',currentNav:'current',availableFilter:'availableNow',deferredFilter:'deferFilter'}))$(id).textContent=routeWord(key);
  $('compact').title=routeWord('compact');$('compact').setAttribute('aria-label',routeWord('compact'));
  updateLaunch();roster();
  for(const [id,icon] of Object.entries({routeNav:'⌖',setup:'⚙',backups:'▤',export:'↑',import:'↓',play:'▶'})){const el=$(id);el.dataset.icon=icon;el.title=el.textContent;el.setAttribute('aria-label',el.textContent)}
  decorateNavigation();
  $('donorSelect').title=$('donorSelect').value;
  $('diagnostics').hidden=!auto||!Object.keys(model.errors).length;
  $('status').textContent=Object.entries(model.errors).map(([g,msg])=>g+' · '+I18n.message(msg)+(model.cache[g]?I18n.t("renderer.showing_the_last_known_data"):'')).join('\n')||(pt?I18n.t("renderer.last_platinum_read_succeeded_sha_256")+pt.hash:I18n.t("renderer.waiting_for_a_save"));
  const line=selected();document.body.dataset.theme=prefs.theme==='auto'?String(line):prefs.theme;
  const focused=document.activeElement,oldRow=focused.closest('[data-task]');
  const oldSection=focused.closest('details[data-section]');
  const controlIndex=oldRow?[...oldRow.querySelectorAll('input,button')].indexOf(focused):-1;
  const byNumber=/^#(\d{1,3})$/.exec(q);
  const filtered=!!q||filter!=='all',filterKey=JSON.stringify([q,filter]);
  if(filterKey!==routeFilterKey){routeFilterKey=filterKey;filteredOpen.clear()}
  $('sections').replaceChildren();
  for(const s of sections){
    const entries=s.entries.filter(e=>{
      const c=caught.has(e.nationalId),v=seen.has(e.nationalId);
      return (byNumber?e.nationalId===Number(byNumber[1]):[e.name,e.place,e.how,...[e.name,e.place,e.how].map(I18n.display),e.nationalId?String(e.nationalId).padStart(3,'0'):''].join(' ').toLowerCase().includes(q))&&
        (filter==='all'||filter==='available'&&available(e)||filter==='deferred'&&e.deferred||filter==='missing'&&e.nationalId&&!c||filter==='seen'&&v&&!c||filter==='caught'&&c||filter==='done'&&complete(e)||filter==='donor'&&!c&&e.nationalId&&donorGames(e.nationalId).length);
    });
    if(!entries.length)continue;
    const d=node('details'),title=node('div'),summary=node('summary');d.dataset.section=s.stage;d.open=filtered?(filteredOpen.get(String(s.stage))??true):sectionOpen(prefs.open,s.stage,s.stage===active);
    summary.onclick=ev=>{ev.preventDefault();d.open=!d.open;updateExpandButton();if(filtered)filteredOpen.set(String(s.stage),d.open);else{prefs.open[s.stage]=d.open;safely(save)()}};
    const species=s.entries.filter(e=>e.goal);
    const gate=s.stage<=9?s.entries.find(e=>e.name===boundaries[s.stage-1]):null;
    const status=gate&&story(gate)?I18n.t("renderer.story_complete"):s.stage===active?I18n.t("renderer.current_stage"):gate?I18n.t("renderer.story_pending"):'';
    d.classList.toggle('current',s.stage===active);
    title.append(node('strong',s.title),node('small',s.description,'section-purpose'));
    if(typeof s.stage==='number')title.title=stageType(s.stage);
    if(status)title.append(node('small',status));
    summary.append(sceneImage(sceneFor(s)),title);if(species.length)summary.append(node('span',I18n.t("renderer.caught")+species.filter(e=>caught.has(e.nationalId)).length+'/'+species.length,'counter'));d.append(summary);
    let previousPhase;
    for(const e of entries){
      if(s.stage==='platinum.finish'){
        const phase=e.task?.phase||e.phase;
        if(phase!==previousPhase){const n=Number(phase.split('.')[1]);const title=n===15?routeWord('swarmHeading'):e.local?e.local(model.guide.titles[n]||model.guide.titles[phase]):model.guide.words[I18n.language][model.guide.titles[n]];
          const sub=node('h3',title,'route-subheading');sub.prepend(sceneImage(sceneFor({stage:phase})));d.append(sub);previousPhase=phase}
      }
      const id=e.nationalId,row=node('div',null,'row'),box=node('input'),content=node('div'),tag=node('span',null,'badge');
      row.dataset.task=e.key;box.type='checkbox';box.checked=complete(e);box.disabled=!!(e.deferred||(auto&&e.goal));box.setAttribute('aria-label',(id?I18n.t("renderer.registered_in_platinum"):I18n.t("renderer.story.2"))+I18n.display(e.name));
      box.onchange=safely(async()=>{if(e.goal){if(auto)return;prefs.caught[id]=box.checked}else prefs.manual[e.key]=box.checked;await save();render()});
      const h=node('h3');if(id)h.append(node('span','#'+String(id).padStart(3,'0'),'number'));h.append(document.createTextNode(I18n.display(e.name)));if(id)h.append(node('small',taskMark(e,s),'task-mark'));if(id&&methodIcon[e.method])h.prepend(fieldIcon(methodIcon[e.method]));content.append(h);if(e.place)content.append(node('div',e.place,'place'));content.append(node('div',readable(e.how),'note'));
      if(e.method==='Evolution'){
        const parents=e.task.requirements.requires_species||[];
        const snapshot=auto&&model.cache[e.task.game];
        const inventory=snapshot&&Array.isArray(snapshot.party)&&Array.isArray(snapshot.boxes)?[...snapshot.party,...snapshot.boxes]:null;
        const status=inventory&&parents.length?parents.every(n=>inventory.some(m=>m.species===n&&!m.egg))?'sourcePresent':'sourceAbsent':
          e.task.game!=='Platinum'?'localSource':parents.every(n=>caught.has(n))?'sourceRegistered':'sourceMissing';
        content.append(node('small',routeWord(status)));
      }
      if(id){
        content.append(button(I18n.t("renderer.acquisition_methods.2"),()=>detail(e)));
        if(e.path&&(e.early||e.late)&&!caught.has(id))content.append(button(prefs.deferred[id]?I18n.t("renderer.undo_skip"):I18n.t("renderer.skip"),async()=>{prefs.deferred[id]=!prefs.deferred[id];await save();render()}));
        if(!auto&&e.goal&&(e.method==='Evolution'||!['Platinum'].includes(e.task.game)))content.append(button((prefs.tasks[e.key]?'✓ ':'')+(e.method==='Evolution'?I18n.t("renderer.evolution_complete"):I18n.t("renderer.transfer_complete")),async()=>{prefs.tasks[e.key]=!prefs.tasks[e.key];await save();render()}));
        const donors=donorGames(id);
        if(e.exclusive)content.append(node('small',e.exclusive,'place'));
        tag.textContent=e.kind==='local_requirement'?(checked(e)?I18n.t('navigation.completed'):routeWord('available')):e.deferred?routeWord('deferred'):caught.has(id)?'☑ '+routeWord('registered'):donors.length?I18n.t("renderer.obtained_in_donor_awaiting_transfer")+donors.join(', '):routeWord('unchecked')+(seen.has(id)?' · '+I18n.t('pokedex.seen'):'');
        if(prefs.manual['species-'+id]||prefs.done['species-'+id]||prefs.tasks['species-'+id])content.append(node('small',routeWord('historical')));
      }else tag.textContent=I18n.t("renderer.story.3");
      if(id)row.dataset.species=id;
      row.dataset.state=e.deferred?'deferred':e.goal&&caught.has(id)?'registered':id&&donorGames(id).length?'donor':'missing';
      const indicator=box.disabled?node('span',e.deferred?'↷':complete(e)?'✓':'◇'):box;
      if(id)h.after(tag);
      row.append(indicator,content);d.append(row);
    }
    $('sections').append(d);
  }
  updateExpandButton();
  if(!$('sections').childElementCount){
    const empty=node('div',null,'empty'),message=node('p',I18n.t("renderer.no_matches"));
    message.setAttribute('role','status');
    empty.append(message,button(I18n.t('navigation.clear_search_filters'),()=>{
      $('search').value='';$('filter').value='all';render();$('search').focus();
    }));
    $('sections').append(empty);
  }
  if(oldSection){
    const card=$('sections').querySelector('[data-section="'+CSS.escape(oldSection.dataset.section)+'"]');
    const row=oldRow&&card?.querySelector('[data-task="'+CSS.escape(oldRow.dataset.task)+'"]');
    const target=(card?.open&&row&&(controlIndex<0?row:row.querySelectorAll('input,button')[controlIndex]))||card?.querySelector('summary')||$('filter');
    if(target===row)target.tabIndex=-1;
    target.focus({preventScroll:true});
  }
}
const pages=['Добро пожаловать','Эмуляторы и режим','ROM-файлы','Сохранения','Стартер','Итоговая конфигурация'];
function select(label,key,options){
  const field=node('label',label+' '),menu=node('select');
  for(const [value,name] of options){const o=node('option',name);o.value=value;menu.append(o)}
  menu.dataset.preference=key;menu.value=prefs[key];menu.onchange=safely(async()=>{prefs[key]=menu.value;if(key==='language')applyLocale();await save();const restoreFocus=document.activeElement===menu;render();refreshControls();
    const area=$('wizard').open?$('choices'):$('settingsContent');
    if(restoreFocus)area.querySelector('[data-preference="'+key+'"]')?.focus({preventScroll:true});
  });field.append(menu);return field;
}
const romMessages=new Map();
async function choose(kind,g){
  try{
    if(kind==='rom')romMessages.delete(g);
    const {importResult,...state}=await service.choose(kind,g);
    Object.assign(model,state);
    if(kind==='rom'&&importResult?.imported)romMessages.set(g,I18n.display('ROM подключён')+(importResult.saveWarning?' · '+I18n.display('Соседний файл SAV не импортирован')+' · '+I18n.message(importResult.saveWarning):''));
  }catch(e){
    if(kind!=='rom')throw e;
    romMessages.set(g,I18n.display('Импорт ROM не выполнен')+' · '+managementError(e));
  }
  refreshControls();render();
}
function refreshControls(){if($('wizard').open)wizard();else if(activePage==='settings')showSettings()}
function openStep(index){if(index<0){showSettings();return}step=index;wizard();if(!$('wizard').open)$('wizard').showModal()}
const installs=new Map();
function showProgress(name){
  const box=document.getElementById('install-'+name),state=installs.get(name);
  if(!box)return;
  box.hidden=!state;
  if(!state)return;
  const bar=box.querySelector('progress'),label=box.querySelector('span');
  label.textContent=I18n.display(state.phase)+(state.total?' · '+Math.floor(100*state.received/state.total)+'%':'');
  if(state.total){bar.max=state.total;bar.value=state.received}else bar.removeAttribute('value');
}
async function install(name){
  if(installs.has(name))return;
  installs.set(name,{phase:I18n.t("renderer.preparing")});refreshControls();
  try{Object.assign(model,await service.component(name,'update'))}
  finally{installs.delete(name);refreshControls()}
}
function emulatorControls(parent){
  for(const name of ['melonDS','mGBA']){
    const area=node('section',null,'info-card');parent.append(area);
    const info=model.paths.emulator[name];area.append(node('h3',name),node('p',info?[mt(model.availability.emulator[name]?'present':'missingFile'),I18n.display(info.version),info.arch,info.path].filter(Boolean).join(' · '):I18n.t("renderer.not_connected")));
    const trigger=button(info?I18n.t("renderer.update"):I18n.t("renderer.install")+name,()=>install(name));trigger.disabled=installs.has(name);
    area.append(trigger,button(I18n.t("renderer.import_official_archive"),()=>choose('emulator',name)));
    if(info){
      const launch=button(I18n.t("renderer.launch"),()=>service.component(name,'launch'));
      launch.disabled=!model.availability.emulator[name];area.append(launch,button(I18n.t("renderer.check_for_updates"),async()=>{const r=await service.component(name,'check');(activePage==='settings'?$('pageStatus'):$('wizardError')).textContent=r.available?I18n.t("renderer.available_version")+r.version:I18n.t("renderer.up_to_date")}));
    }
    const box=node('div',null,'install-meter');box.id='install-'+name;
    const bar=node('progress');bar.setAttribute('aria-label',I18n.t("renderer.installing")+name);
    box.append(node('span'),bar);area.append(box);showProgress(name);
  }
}
function fileControls(area,kind){
    const status=node('p');status.id='library-progress';area.append(status);if(kind==='save'&&window.desktop)area.append(button(I18n.t("renderer.select_melonds_save_folder"),()=>choose('folder','Platinum')));
    for(const g of games){const line=node('div',null,'setting');line.append(node('strong','Pokémon '+g),button(kind==='rom'?mt(model.paths.rom[g]?'replaceRom':'importRom'):I18n.t('renderer.saves'),()=>choose(kind,g)),node('small',model.paths[kind][g]||I18n.t("renderer.not_connected.2")));
      if(kind==='rom'&&model.paths.rom[g])line.append(node('small',mt(model.availability.rom[g]?'present':'missingFile')));
      if(kind==='rom'&&model.paths.metadata?.[g]){const m=model.paths.metadata[g];line.append(node('small',[m.code,I18n.display(m.region),...m.warnings.map(I18n.message)].join(' · ')))}
      if(kind==='save'&&model.paths.save[g]&&!model.errors[g])line.append(node('small',mt(model.cache[g]?'okSync':'unread')));
      if(kind==='save'&&model.cache[g])line.append(node('small',I18n.t("renderer.last_read")+model.cache[g].caught.length+I18n.t("renderer.caught_badges")+model.cache[g].badges.toString(2).replace(/0/g,'').length));
      if(kind==='save'&&model.profileLists?.[g]?.length>1)line.append(node('small',model.profileLists[g].map(p=>p.name||mt('main')).join(' · ')));
      if(kind==='save'&&(model.paths.save[g]||model.paths.rom[g]))line.append(node('small',mt('profile')+' · '+(model.profileNames?.[g]||mt('main'))),button(mt('title'),()=>openBackups(g,null)));
      if(kind==='rom'&&romMessages.has(g))line.append(node('small',romMessages.get(g)));
      if(kind==='save'&&model.errors[g])line.append(node('small',I18n.message(model.errors[g])));area.append(line)}
  }
function starterControls(area){
    if(automatic()&&dex()?.starter){area.append(node('strong',mt('starterLabel')+' · '+names.get(dex().starter)),node('small',mt('detected')));return}
    const choices=node('div',null,'starter-options');
    for(const id of [387,390,393]){
      const pick=button(names.get(id),async()=>{
        prefs.starter=String(id);prefs.stage='';
        prefs.starterOverride=automatic()&&dex()?.starter!==id?dex()?.trainer:null;
        await save();render();refreshControls();
      });
      pick.setAttribute('aria-pressed',String(id===selected()&&!!(prefs.starter||automatic()&&dex()?.starter)));
      choices.append(pick);
    }
    area.append(choices);
    if(automatic()&&dex()?.starter)area.append(node('p',I18n.t("renderer.from_your_platinum_save")+names.get(dex().starter)+'.'));
  }
function wizard(){
  
  const area=$('choices');area.replaceChildren();$('wizardError').textContent='';$('wizardTitle').textContent=I18n.display(pages[step]);$('step').textContent=(step+1)+' / 6';
  $('step').hidden=step<0;$('prev').hidden=step<0;$('next').hidden=step<0;

  $('prev').disabled=step===0;$('next').textContent=step===5?I18n.t("renderer.finish"):I18n.t("renderer.next");
  if(step===0)area.append(select(I18n.t('settings.language'),'language',[['en','English'],['ru','Русский']]),node('p',I18n.t("renderer.pok_dex_helper_guides_you_through_catching_all")),node('small',model.platform));
  if(step===1)area.append(select(I18n.t("renderer.mode"),'mode',[['auto',I18n.t("renderer.automatic")],['manual',I18n.t("renderer.manual")]]),node('p',I18n.t("renderer.automatic_mode_is_for_emulator_play_helper_reads")),node('p',I18n.t("renderer.manual_mode_is_for_nintendo_ds_or_tracking")));
  if(step===1)emulatorControls(area);
  if(step===2||step===3)fileControls(area,step===2?'rom':'save');
  if(step===4)starterControls(area);
  if(step===5)area.append(node('p',model.platform+' · '+(automatic()?I18n.t("renderer.automatic"):I18n.t("renderer.manual"))),node('p',I18n.t("renderer.starter.2")+(prefs.starter||automatic()&&dex()?.starter?names.get(selected()):I18n.t("renderer.not_selected"))),node('p',I18n.t("renderer.emulators")+(Object.keys(model.paths.emulator).join(', ')||I18n.t("renderer.skipped"))),node('p','ROM: '+(Object.keys(model.paths.rom).join(', ')||I18n.t("renderer.skipped"))),node('p',I18n.t("renderer.saves.2")+(Object.keys(model.paths.save).join(', ')||I18n.t("renderer.skipped"))));
}
function mergeLegacy(value){
  for(const field of ['done','manual','caught','tasks','deferred'])for(const [k,v] of Object.entries(value[field]||{}))if(typeof v==='boolean'&&v)prefs[field][k]=true;
}
async function init(){
  model=await service.get();prefs={interfaceScale:115,compactSidebar:false,language:model.prefs||Object.keys(model.legacy||{}).length?'ru':'en',mode:'auto',theme:'auto',starter:'',stage:'',runner:true,manual:{},done:{},caught:{},tasks:{},deferred:{},open:{},milestones:{},...model.prefs};
  applyLocale();applyAppearance();
  $('wizard').addEventListener('close',()=>$('choices').replaceChildren());
  $('compact').onclick=safely(async()=>{prefs.compactSidebar=!prefs.compactSidebar;applyAppearance();await save()});
  $('routeNav').onclick=()=>{navigate('route');window.scrollTo(0,pageScroll.route);$('routeNav').focus({preventScroll:true})};
  if(!model.prefs){mergeLegacy(model.legacy);await save()}
  for(const s of model.catalog)for(const e of s.entries)if(e.nationalId)names.set(e.nationalId,e.name);
  // Read the immutable Generation IV method table, before display localization.
  // A plain level-up can be pursued with an owned parent. Item, trade, location
  // and other conditional evolutions need evidence this view cannot establish.
  for(const [id,spec] of Object.entries(model.methods)){
    const match=spec.evolution?.length===1&&spec.evolution[0].match(/ → level-up, ур\. (\d+)$/);
    if(match)trainingLevels.set(Number(id),Number(match[1]));
  }
  for(const game of games)$('donorSelect').append(node('option',game));
  $('donorSelect').onchange=updateLaunch;$('team').ontoggle=roster;
  $('play').onclick=safely(()=>service.play($('donorSelect').value));$('backups').onclick=safely(()=>openBackups());
  $('search').oninput=render;$('filter').onchange=render;
  $('expand').onclick=safely(async()=>{
    const cards=[...$('sections').querySelectorAll('details')],expand=cards.some(card=>!card.open);
    const persist=!$('search').value.trim()&&$('filter').value==='all';
    for(const card of cards){card.open=expand;if(persist)prefs.open[card.dataset.section]=expand;else filteredOpen.set(card.dataset.section,expand)}
    updateExpandButton();if(persist)await save();
  });
  $('export').onclick=safely(()=>service.exportProgress({version:3,...prefs,dex:dex()}));
  $('import').onclick=safely(async()=>{const value=await service.importProgress();if(!value)return;if(!value.done&&!value.manual)throw Error(I18n.t("renderer.unknown_progress_format"));mergeLegacy(value);if(value.version===3){for(const [k,allowed] of Object.entries({mode:['auto','manual'],theme:['auto','387','390','393'],starter:['387','390','393']}))if(allowed.includes(value[k]))prefs[k]=value[k];if(typeof value.runner==='boolean')prefs.runner=value.runner;for(const [k,v] of Object.entries(value.milestones||{}))if(v?.reached)prefs.milestones[k]={count:493,reached:true}}await save();render()});
  $('setup').onclick=showSettings;$('prev').onclick=()=>{step--;wizard()};
  $('next').onclick=safely(async()=>{if(step<5){step++;wizard()}else{prefs.configured=true;await save();$('wizard').close();render()}});
  service.updates(safely(async update=>{Object.assign(model,update);await milestone();render();if($('wizard').open)wizard();else if(activePage==='settings'&&['saves','appearance'].includes(settingsPanel)&&!$('settingsContent').contains(document.activeElement))showSettings();else if(activePage==='backups'&&!inArchive&&!$('backupContent').contains(document.activeElement))await openBackups()}));
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',render);
  service.installProgress(state=>{const p=document.getElementById('library-progress');if(p&&games.includes(state.name))p.textContent=state.name+' · '+I18n.display(state.phase)+(state.phase==='Копирование'&&state.total?' '+Math.floor(100*state.received/state.total)+'%':'');if(installs.has(state.name)){installs.set(state.name,state);showProgress(state.name)}});
  await milestone();render();navigate('route');if(!prefs.configured)openStep(0);
}
safely(init)();
