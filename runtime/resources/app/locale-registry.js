'use strict';
// Only reviewed, bundled language packs belong here. Display names stay native.
function sortLanguagePacks(packs) {
  const collator = new Intl.Collator('en', { usage: 'sort' });
  const scripts = ['Latn', 'Cyrl', 'Jpan'];
  const entries = packs.map(pack => {
    const locale = new Intl.Locale(pack.id);
    const script = locale.maximize().script;
    const rank = scripts.indexOf(script);
    const names = new Intl.DisplayNames([locale.baseName], { type: 'language', languageDisplay: 'standard' });
    const base = new Intl.DisplayNames([locale.language + '-' + script], { type: 'language' }).of(locale.language);
    const name = pack.name ?? names.of(locale.baseName);
    return { pack: { ...pack, name }, rank: rank < 0 ? scripts.length : rank, script, base };
  });
  // Compare native base names before variant labels to keep regions together.
  entries.sort((a, b) => a.rank - b.rank || collator.compare(a.script, b.script)
    || collator.compare(a.base, b.base) || collator.compare(a.pack.name, b.pack.name));
  return Object.freeze(entries.map(entry => Object.freeze(entry.pack)));
}
globalThis.dexLanguages = sortLanguagePacks([
  {id:'en',name:'English',guide:true},
  {id:'ru',name:'Русский',guide:true},
  {id:'ja',name:'日本語',guide:false},
  {id:'fr',name:'Français',guide:false},
  {id:'it',name:'Italiano',guide:false},
  {id:'de',name:'Deutsch',guide:false},
  {id:'es',name:'Español',guide:false}
]);
if(typeof module!=='undefined')module.exports=globalThis.dexLanguages;
