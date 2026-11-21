'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const app = path.resolve(__dirname, '../runtime/resources/app');
const read = name => fs.readFileSync(path.join(app, name), 'utf8');
const locales = fs.readdirSync(path.join(app,'locales')).filter(file => file.endsWith('.js'));
const context = vm.createContext({ structuredClone, methods: JSON.parse(read('methods.json')), catalog: JSON.parse(read('catalog.json')).sections });
for (const file of locales) vm.runInContext(read('locales/'+file),context);
const {en,ru} = context.dexLocales;
for (const dict of Object.values(context.dexLocales)) {
  assert.deepEqual(Object.keys(dict).sort(),Object.keys(en).sort(),'Key coverage differs');
  for (const [key,value] of Object.entries(dict)) assert(typeof value==='string' && value.trim(),key);
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
console.log(Object.keys(en).length+' keys in '+locales.length+' locales; active route texts covered.');
