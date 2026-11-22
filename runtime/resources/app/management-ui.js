'use strict';
const mt=key=>managementText(key,I18n.language);
let settingsPanel='appearance',backupGame,backupProfile,activePage='route',inArchive=false,viewGeneration=0;
function managementError(e){
  const message=e.message.replace(/^Error invoking remote method '[^']+': Error: /,'');
  const code=message.match(/\b(ENOSPC|EACCES|EPERM|EBUSY|ENOENT|EIO)\b/);
  if(code)return mt('fileError')+' ('+code[1]+')';
  return I18n.message(message.replace(/PH_[A-Z]+/g,k=>mt(k)));
}
function picker(label,entries,current,change){
  const field=node('label',label+' '),menu=node('select');
  for(const [key,name] of entries){const option=node('option',name);option.value=key;menu.append(option)}
  menu.value=current;menu.onchange=safely(()=>change(menu.value));field.append(menu);return field;
}
function checkOption(label,value,change){
  const field=node('label'),input=node('input');input.type='checkbox';input.checked=value;
  if(change)input.onchange=safely(()=>change(input.checked));field.append(input,document.createTextNode(' '+label));return {field,input};
}
const panels=['appearance','roms','emulators','saves','app'];
const pageScroll={route:0,settings:0,backups:0,requirements:0};
function navigate(page){
  if(activePage!==page){pageScroll[activePage]=window.scrollY;viewGeneration++;$('pageStatus').textContent=''}
  activePage=page;
  for(const [key,nav] of Object.entries({route:'routeNav',settings:'setup',backups:'backups',requirements:'requirementsNav'})){
    $(key+'Page').hidden=key!==page;
    if(key===page)$(nav).setAttribute('aria-current','page');else $(nav).removeAttribute('aria-current');
  }
}
function showSettings(){
  const entering=activePage!=='settings';
  navigate('settings');const title=I18n.t('renderer.settings');
  $('settingsPage').querySelector('h1').textContent=title;
  const tabs=$('settingsTabs'),area=$('settingsContent');
  tabs.setAttribute('aria-label',title);tabs.replaceChildren();area.replaceChildren();
  for(const [i,p] of panels.entries()){
    const pick=button(mt(({roms:'gamesTab',saves:'savesTab'})[p]||p),()=>activate(p));
    pick.id='tab-'+p;pick.setAttribute('role','tab');pick.setAttribute('aria-selected',String(settingsPanel===p));
    pick.setAttribute('aria-controls','settingsContent');pick.tabIndex=settingsPanel===p?0:-1;
    pick.onkeydown=e=>{
      const target={ArrowRight:(i+1)%5,ArrowLeft:(i+4)%5,Home:0,End:4}[e.key];
      if(target!==undefined){e.preventDefault();activate(panels[target])}
    };tabs.append(pick);
  }
  function activate(p){settingsPanel=p;$('pageStatus').textContent='';showSettings();$('tab-'+p).focus()}
  area.setAttribute('aria-labelledby','tab-'+settingsPanel);
  if(entering)window.scrollTo(0,pageScroll.settings);
  if(settingsPanel==='appearance'){
    area.append(scaleControl(),select(I18n.t('settings.language'),'language',[['en','English'],['ru','Русский']]),
      select(I18n.t('renderer.theme'),'theme',[['auto',I18n.t('renderer.match_starter')],['387',I18n.t('renderer.green')],['390',I18n.t('renderer.orange')],['393',I18n.t('renderer.blue')]]),
      select(I18n.t('renderer.stage_when_unknown'),'stage',[['',I18n.t('renderer.base_species')],...[0,1,2].map(i=>[String(selected()+i),names.get(selected()+i)])]));
    if(automatic()&&dex()?.starter){
      const info=node('section',null,'info-card');info.append(node('strong',mt('starterLabel')+' · '+names.get(dex().starter)),node('small',mt('detected')));area.append(info);
    }else area.append(picker(mt('starterLabel'),[387,390,393].map(id=>[id,names.get(id)]),selected(),async value=>{prefs.starter=value;prefs.stage='';await save();render();showSettings()}));
  }
  if(settingsPanel==='roms')fileControls(area,'rom');
  if(settingsPanel==='emulators')emulatorControls(area);
  if(settingsPanel==='saves'){
    area.append(select(I18n.t('renderer.mode'),'mode',[['auto',I18n.t('renderer.automatic')],['manual',I18n.t('renderer.manual')]]),node('small',mt('watch')),
      checkOption(mt('auto'),prefs.autoBackup!==false,async v=>{prefs.autoBackup=v;await save()}).field);
    area.append(node('small',mt('retention')));fileControls(area,'save');area.append(button(mt('title'),()=>openBackups()));
  }
  if(settingsPanel==='app'){
    area.append(node('p',mt('version')+' · '+model.version));
    if(model.libraryRoot)area.append(pathsDisclosure(model.libraryRoot));
    if(model.guide.edition)area.append(node('p',mt('route')+' · '+model.guide.edition));
    const saves=checkOption(mt('delSaves'),false),backups=checkOption(mt('delBackups'),false);
    area.append(node('h3',mt('reset')),node('p',mt('resetInfo')),saves.field,backups.field,button(mt('reset'),async()=>{
      await queued;if(await service.resetApp(saves.input.checked,backups.input.checked))location.reload()
    }));
  }
}

function pathsDisclosure(file){
  const box=node('details',null,'file-path');box.append(node('summary',mt('filePath')),node('small',file));return box;
}
const friendlyTime=time=>new Intl.DateTimeFormat(I18n.language,{dateStyle:'medium',timeStyle:'short'}).format(time);
const fileSize=n=>new Intl.NumberFormat(I18n.language,{maximumFractionDigits:1}).format(n/1024)+' KiB';
async function openBackups(g=backupGame,id=backupProfile,notice=''){
  const entering=activePage!=='backups';
  navigate('backups');inArchive=false;
  const body=$('backupContent'),title=$('backupsPage').querySelector('h1');title.textContent=mt('title');
  const token=++viewGeneration;
  const previousSelector=body.contains(document.activeElement)?document.activeElement.dataset.backupSelector:null;
  let view;
  try{view=await service.saveView(g,id)}
  catch(error){
    if(token!==viewGeneration)return;
    body.replaceChildren(button(mt('refresh'),()=>openBackups(g,id)));
    $('pageStatus').textContent=managementError(error);
    return;
  }
  if(token!==viewGeneration)return;
  backupGame=view.g;backupProfile=view.id;
  body.replaceChildren(node('p',mt('subtitle')));$('pageStatus').textContent=notice;
  if(entering)window.scrollTo(0,0);
  const archiveButton=button(mt('archive'),()=>openArchive(view));
  if(!view.g){body.append(node('p',mt('empty')),archiveButton);return}
  const perform=async(op,key)=>{
    if(token!==viewGeneration)return;
    const result=await service.saveAction(op,view.g,view.id,key);if(token!==viewGeneration)return;
    await openBackups(view.g,view.id,result?mt(result):'');
  };
  const selectors=node('div',null,'selectors');
  selectors.append(picker(mt('game'),view.games.map(g=>[g,'Pokémon '+g]),view.g,g=>openBackups(g,null)),
    picker(mt('profile'),view.profiles.map(p=>[p.id,p.name||mt('main')]),view.id,id=>openBackups(view.g,id)));
  const [gameMenu,profileMenu]=selectors.querySelectorAll('select');
  gameMenu.dataset.backupSelector='game';profileMenu.dataset.backupSelector='profile';
  body.append(selectors);
  if(previousSelector&&document.activeElement===document.body)(previousSelector==='game'?gameMenu:profileMenu).focus({preventScroll:true});
  const card=node('section',null,'info-card'),stats=node('dl');
  function stat(k,v){stats.append(node('dt',k),node('dd',v))}
  stat(mt('status'),view.data.error||mt('valid'));
  if(view.data.time){stat(I18n.t('pokedex.caught'),view.data.caught+(view.g==='Platinum'?' / 493':''));stat(mt('time'),friendlyTime(view.data.time))}
  stat(mt('auto'),mt(view.auto?'on':'off'));stat(mt('limit'),view.entries.length+' / 10 · '+fileSize(view.entries.reduce((sum,e)=>sum+e.size,0)));
  stat(mt('last'),view.stamp.lastAuto?friendlyTime(view.stamp.lastAuto):mt('never'));
  if(view.stamp.error)stat(mt('error'),managementError(Error(view.stamp.error)));
  card.append(node('h2',mt('active')),stats,pathsDisclosure(view.file));
  const controls=node('div',null,'backup-actions'),make=button(mt('make'),()=>perform('make'));make.className='primary';make.disabled=!!view.data.error;
  controls.append(make,button(mt('folder'),()=>perform('folder')));
  if(view.id!==view.selected)controls.append(button(mt('select'),()=>perform('select')));
  card.append(controls);body.append(card,node('h2',mt('history')));
  if(!view.entries.length)body.append(node('p',mt('none')));
  for(const entry of view.entries){
    const row=node('section',null,'backup-card'),actions=node('div',null,'backup-actions');
    for(const op of ['restore','export','delete']){const action=button(mt(op),()=>perform(op,entry.key));if(op==='restore')action.prepend(fieldIcon('restore'));actions.append(action)}
    row.append(node('strong',friendlyTime(entry.time)),node('small',I18n.t('pokedex.caught')+' '+entry.caught+' · '+fileSize(entry.size)),actions,pathsDisclosure(entry.file));body.append(row);
  }
  const tools=node('div',null,'backup-actions');tools.append(archiveButton,button(mt('refresh'),()=>openBackups(view.g,view.id)));
  const field=node('label',mt('name')+' '),input=node('input');input.maxLength=80;field.append(input);
  const add=node('details');add.append(node('summary',mt('newProfile')),field,button(mt('newProfile'),()=>perform('newProfile',input.value)));
  body.append(node('h2',mt('tools')),tools,add);
}
async function openArchive(view){
  inArchive=true;const token=++viewGeneration,rows=await service.saveAction('archive');
  if(token!==viewGeneration)return;
  const body=$('backupContent');$('backupsPage').querySelector('h1').textContent=mt('archive');$('pageStatus').textContent='';
  body.replaceChildren(button('‹ '+mt('title'),()=>openBackups()),node('p',mt('archiveHint')));window.scrollTo(0,0);
  for(const entry of rows){
    const card=node('section',null,'backup-card');
    if(entry.error)card.append(node('strong',mt('unverified')),pathsDisclosure(entry.name));
    else{
      card.append(node('strong',entry.game+' · '+friendlyTime(entry.time)),node('small',I18n.t('pokedex.caught')+' '+entry.caught+' · '+fileSize(entry.size)),pathsDisclosure(entry.file));
      if(entry.game===view.g)card.append(button(mt('archiveImport')+' · '+view.g+' / '+(view.profiles.find(p=>p.id===view.id)?.name||mt('main')),async()=>{
        const result=await service.saveAction('archiveImport',view.g,view.id,{name:entry.name,hash:entry.hash});if(result&&token===viewGeneration)await openBackups(view.g,view.id,mt(result))
      }));
    }
    body.append(card);
  }
  if(view.review?.length)body.append(node('h2',mt('review')),...view.review.map(name=>node('small',name)));
  if(!rows.length&&!view.review?.length)body.append(node('p',mt('archiveEmpty')));
}
