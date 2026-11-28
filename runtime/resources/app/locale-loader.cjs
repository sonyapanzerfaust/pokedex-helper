'use strict';
const languages=require('./locale-registry');
require('./locales/en');
require('./locales/ru');
require('./locales/interface');
require('./locales/guide-interface');
const words={en:require('./locales/approved-en.json'),ru:require('./locales/approved-ru.json'),...globalThis.dexGuideLocales};
require('./locales/ja-game');
require('./locales/european-terms');
require('./locales/european-game');
const europeanGuide=require('./locales/european-guide.json');
const europeanLanguages=['fr','it','de','es'];
const guideJapanese=require('./locales/ja-guide.json');
for(const [key,english] of Object.entries(words.en)){
  if(Object.hasOwn(europeanGuide,english))europeanLanguages.forEach((id,index)=>{words[id][key]=europeanGuide[english][index]});
  if(Object.hasOwn(guideJapanese,english))words.ja[key]=guideJapanese[english];
}
require('./locales/route-revisions.cjs')(words);
module.exports={languages,words};
