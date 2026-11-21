'use strict';
const I18n = (() => {
  const locales = globalThis.dexLocales;
  const sourceKeys = new Map(Object.entries(locales.ru).map(([key, value]) => [value, key]));
  let language = 'en';
  function set(value) { language = Object.hasOwn(locales, value) ? value : 'en'; }
  function t(key, params = {}) {
    const message = locales[language][key] ?? locales.en[key] ?? key;
    return message.replace(/\{(\w+)\}/g, (raw, name) => {
      const value = params[name];
      return typeof value === 'number' ? new Intl.NumberFormat(language).format(value) : value ?? raw;
    });
  }
  function plural(key, count) { return t(key + '.' + new Intl.PluralRules(language).select(count), {count}); }
  function display(value) {
    if (typeof value !== 'string' || language === 'ru') return value;
    return sourceKeys.has(value) ? t(sourceKeys.get(value)) : value;
  }
  const fragments = [...sourceKeys.keys()].sort((a,b) => b.length-a.length);
  function message(value) {
    if (language === 'ru' || !value || typeof value !== 'string') return value;
    if (sourceKeys.has(value)) return display(value);
    // Leave filesystem paths intact when a native diagnostic includes one.
    let out = '';
    for (let i = 0; i < value.length;) {
      const path = value.slice(i).match(/^(?:[a-z]:[\\/]|\\\\)[^\r\n]*/i);
      if (path) { out += path[0]; i += path[0].length; continue; }
      const match = fragments.find(s => value.startsWith(s,i));
      if (match) { out += display(match); i += match.length; }
      else out += value[i++];
    }
    return out;
  }
  return {set,t,plural,display,message,get language(){return language}};
})();
if (typeof module !== 'undefined') module.exports = I18n;
