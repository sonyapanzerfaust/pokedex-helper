'use strict';
if(typeof module!=='undefined'){require('./locales/en');require('./locales/ru')}
function managementText(key,language){
  const id='management.'+key;
  return globalThis.dexLocales[language]?.[id]??globalThis.dexLocales.en[id]??key;
}
if(typeof module!=='undefined')module.exports=managementText;
