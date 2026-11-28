'use strict';
// Section IDs are stable across the two route dictionaries.
const environmentByStage={
  1:'grassland',2:'woodland',3:'ruins',4:'grassland',5:'coast',6:'coast',7:'snow',8:'mountain',9:'cave',
  emerald:'volcano',frlg:'coast',diamond:'mountain',pearl:'cave',heartgold:'woodland',soulsilver:'coast',evolutions:'grassland',events:'ruins',
  'platinum.finish':'ruins','platinum.10':'ruins','platinum.11':'cave','platinum.12':'volcano','platinum.13':'coast','platinum.14':'woodland','platinum.15':'grassland'
};
function sceneFor(section){return environmentByStage[section.stage]||'grassland'}
function paintScene(element,scene){element.style.setProperty('--scene','url("art/'+scene+'.svg")')}
function sceneImage(scene){
  const img=document.createElement('img');img.src='art/'+scene+'.svg';img.alt='';img.className='section-art';return img;
}
const methodIcon={'Tall Grass':'grass','Safari Zone':'grass','Great Marsh':'grass','Cave':'cave','Rock Smash':'cave',Surf:'water',Dive:'water','Old Rod':'fishing','Good Rod':'fishing','Super Rod':'fishing','Tile fishing':'fishing','Honey Trees':'honey',Headbutt:'headbutt',Evolution:'evolution',Egg:'egg','Gift Egg':'egg','In-game Trade':'trade','Pal Park':'trade',Gift:'gift','Static Encounter':'special',Roaming:'special',Event:'event'};
function fieldIcon(name){
  const el=document.createElement('span');el.className='field-icon fi-'+name;el.setAttribute('aria-hidden','true');return el;
}
function decorateNavigation(){
  for(const [id,icon] of Object.entries({routeNav:'route',setup:'settings',backups:'backup',requirementsNav:'event',export:'upload',import:'download',syncBadge:'sync'})){
    const el=document.getElementById(id);
    el.textContent=el.textContent.replace(/^[⌖⚙▤↑↓]\s*/u,'');el.prepend(fieldIcon(icon));
  }
}
