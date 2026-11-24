'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const app = path.resolve(__dirname, '../runtime/resources/app');
const read = name => fs.readFileSync(path.join(app, name), 'utf8');
const packs = require(path.join(app,'locale-loader.cjs'));
const locales = packs.languages;
const context = vm.createContext({ structuredClone, methods: JSON.parse(read('methods.json')), catalog: JSON.parse(read('catalog.json')).sections });
for (const file of ['locale-registry.js','locales/en.js','locales/ru.js','locales/interface.js','locales/ja-game.js','locales/european-terms.js','locales/european-game.js','i18n.js']) vm.runInContext(read(file),context);
const {en,ru} = context.dexLocales;
assert.deepEqual(locales.map(pack => pack.id), ['de','en','es','fr','it','ru','ja']);
const variants = vm.runInContext("sortLanguagePacks(['ja','sr-Cyrl','en-US','de','en-GB','sr-Latn'].map(id => ({id})))", context);
assert.deepEqual(Array.from(variants, pack => pack.id), ['de','en-GB','en-US','sr-Latn','sr-Cyrl','ja']);
vm.runInContext(read('locales/encounter-locations.js'),context);
const locations=new Set(Object.values(context.methods).flatMap(m=>m.encounters.map(e=>e.location)));
for(const location of locations)for(const {id} of locales){
  const label=context.encounterLocation(location,id);
  assert(label && !label.includes('undefined'), id+' '+location);
  for(const token of location.split(' ').filter(part=>part.includes('-'))) {
    assert(!label.split(' · ').includes(token),id+' untranslated location identifier '+token);
  }
}
for (const id of ['fr','it','de','es']) {
  for (const key of Object.keys(en).filter(key => key.startsWith('encounter.'))) {
    assert(Object.hasOwn(context.dexLocales[id],key),id+' missing encounter key '+key);
  }
}
const placeholders=value=>[...value.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
const release=require('./release-files.cjs');
for (const {id,guide} of locales) {
  const dict=context.dexLocales[id];
  assert(dict,'Unloaded locale: '+id);
  if(guide)assert.deepEqual(Object.keys(dict).sort(),Object.keys(en).sort(),'Key coverage differs: '+id);
  for (const [key,value] of Object.entries(dict)) {
    assert(Object.hasOwn(en,key),'Unknown key: '+key);
    assert(typeof value==='string' && value.trim(),key);
    assert.deepEqual(placeholders(value),placeholders(en[key]),id+' '+key+' placeholders');
    if(!guide&&id!=='ja'){
      assert.equal(/^\s/.test(value),/^\s/.test(en[key]),id+' '+key+' leading whitespace');
      assert.equal(/\s$/.test(value),/\s$/.test(en[key]),id+' '+key+' trailing whitespace');
    }
  }
  for(const key of Object.keys(en).filter(k=>/^(management|renderer|navigation|settings|rom)\./.test(k)))assert(Object.hasOwn(dict,key),id+' missing interface key '+key);
  for(const key of Object.keys(packs.words.en).filter(k=>k.startsWith('@ui.')))assert(packs.words[id][key],id+' missing guide interface '+key);
  context.lang=id;
  for(const count of [0,1,2,5,21,1000000]){
    context.count=count;
    const result=vm.runInContext("I18n.set(lang);I18n.plural('route.remaining',count)",context);
    assert(!result.includes('route.remaining')&&!result.includes('{count}'),id+' plural '+count);
  }
}
for(const file of ['locale-registry.js','locale-loader.cjs','locales/interface.js','locales/guide-interface.js'])assert(release.desktop.includes(file),'Unpackaged locale resource '+file);
context.lang='unknown';assert.equal(vm.runInContext("I18n.set(lang);I18n.language",context),'en');
assert.equal(vm.runInContext("I18n.set('ja');I18n.message('C:\\\\ゲーム\\\\save.sav')",context),'C:\\ゲーム\\save.sav');
assert.equal(vm.runInContext("I18n.set('ja');I18n.t('main.unknown_game')",context),'不明なゲームです');
const activeKeys = new Set(Object.keys(en).filter(key => !key.startsWith('route.')));
const legacySources = new Map(Object.entries(ru).map(([key,value]) => [value,key]));
for (const section of context.catalog.filter(section => section.stage <= 15)) {
  for (const row of section.entries.filter(row => !row.nationalId)) {
    for (const value of [row.name,row.place,row.how]) {
      if (legacySources.has(value)) activeKeys.add(legacySources.get(value));
    }
  }
}
for (const {id} of locales) {
  for (const key of activeKeys) assert(context.dexLocales[id][key]?.trim(),id+' missing visible text '+key);
}
const {approvedRoute}=require(path.join(app,'approved.js'));
const guide={...JSON.parse(read('approved-data.json')),words:packs.words};
assert.deepEqual(Object.keys(packs.words.ja).sort(),Object.keys(packs.words.en).sort(),'Japanese walkthrough coverage');
const japanese=context.jaGameText;
for(const {name} of Object.values(guide.species))assert(/[ァ-ヶ]/.test(japanese(name)),name);
assert.equal(japanese('Squirtle'),'ゼニガメ');
assert.equal(japanese('Sinnoh Route 201'),'201ばんどうろ');
assert.equal(japanese('Sinnoh Route 223'),'223ばんすいどう');
for(const [key,value] of Object.entries(packs.words.ja))
  assert.deepEqual(placeholders(value),placeholders(packs.words.en[key]),'Japanese guide placeholder: '+key);
const starterCard=approvedRoute(guide,context.catalog,387,{},new Set(),'ja')[0].entries.find(e=>e.key==='get.387');
for (const [language, starter, professor, road] of [
  ['fr','Tortipouss','Sorbier','Route 201'], ['it','Turtwig','Rowan','Percorso 201'],
  ['de','Chelast','Eibe','Route 201'], ['es','Turtwig','Serbal','Ruta 201']
]) {
  const card = approvedRoute(guide,context.catalog,387,{},new Set(),language)[0].entries.find(e=>e.key==='get.387');
  assert.equal(context.europeanGameText(card.name,language),starter);
  assert(card.local(card.task.steps).includes(professor) && context.europeanGameText(card.how,language).includes(road),language+' starter instructions');
  assert.deepEqual(Object.keys(packs.words[language]).sort(), Object.keys(packs.words.en).sort(), language+' walkthrough coverage');
  for (const {name} of Object.values(guide.species)) assert(context.europeanTerms[name]?.length===4,name);
  for (const [key,value] of Object.entries(packs.words[language])) {
    assert(typeof value==='string' && value.trim(),language+' empty walkthrough entry '+key);
    assert.deepEqual(placeholders(value),placeholders(packs.words.en[key]),language+' guide placeholders '+key);
  }
}
assert.equal(japanese(starterCard.name),'ナエトル');
assert.equal(japanese([starterCard.task.game,starterCard.task.location].join(' · ')),'プラチナ · 201ばんどうろ');
assert.match(japanese(starterCard.local(starterCard.task.steps)),/ナナカマド博士/);
assert.doesNotMatch(japanese(starterCard.how),/[a-z]/i);
for(const starter of [387,390,393])for(const skip of [false,true]){
  const deferred=Object.fromEntries(guide.deferrals.map(({id})=>[id,skip]));
  const reference=approvedRoute(guide,context.catalog,starter,deferred,new Set(),'en');
  for(const {id} of locales){
    const route=approvedRoute(guide,context.catalog,starter,deferred,new Set(),id);
    assert.deepEqual(route.map(s=>s.entries.map(e=>[e.key,e.nationalId,e.goal])),reference.map(s=>s.entries.map(e=>[e.key,e.nationalId,e.goal])),id+' changed route identity');
    for(const section of route){
      assert(section.title&&section.description&&!section.title.includes('undefined'),id+' missing section');
      for(const row of section.entries)assert(!row.how.includes('undefined'),id+' missing description');
    }
  }
}
const files = fs.readdirSync(app).filter(x => /\.(js|cjs|html)$/.test(x));
const code = files.map(read).join('\n');
for (const match of code.matchAll(/(?:I18n\.t\(["']|data-(?:i18n|aria-label|placeholder)=")([^"']+)/g))
  assert(Object.hasOwn(en,match[1]),'Missing '+match[1]);
vm.runInContext(read('route.js'),context);
const values=new Set();
function collect(x){if(typeof x==='string')values.add(x);else if(x&&typeof x==='object')Object.values(x).forEach(collect)}
for(const starter of [387,390,393])for(const skip of [false,true]){
  context.starter=starter;context.defer=Object.fromEntries(Array.from({length:493},(_,i)=>[i+1,skip]));
  for(const stage of vm.runInContext('route(catalog,methods,starter,defer)',context)){
    collect(stage.title);for(const e of stage.entries)for(const f of ['name','place','how','exclusive','alternative'])collect(e[f]);
  }
}
for(const row of Object.values(context.methods))collect(row.evolution);
const messages=new Set(Object.values(ru));for(const value of values)if(/[А-Яа-яЁё]/.test(value))assert(messages.has(value),'Untranslated route text: '+value);
for(const [key,source] of Object.entries(ru)){
  const used=(key.startsWith('management.')&&code.includes("'"+key.slice(11)+"'"))||code.includes(key)||values.has(source)||code.includes(source)||code.includes(JSON.stringify(source).slice(1,-1))||key.startsWith('route.remaining.');
  assert(used,'Unused locale key: '+key);
}
console.log(locales.length+' locales: '+Object.keys(en).length+' full-pack keys, '+Object.keys(context.dexLocales.ja).length+' core-interface keys; fallback and route identity verified.');
