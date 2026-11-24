'use strict';
const I18n = (() => {
  const locales = globalThis.dexLocales;
  const sourceKeys = new Map(Object.entries(locales.ru).map(([key, value]) => [value, key]));
  let language = 'en';
  function set(value) { language = Object.hasOwn(locales, value) ? value : 'en'; }
  function t(key, params = {}) {
    const message = locales[language][key] ?? locales.en[key] ?? key;
    return (language === "ja" ? globalThis.jaGameText(message) : message).replace(/\{(\w+)\}/g, (raw, name) => {
      const value = params[name];
      return typeof value === 'number' ? new Intl.NumberFormat(language).format(value) : value ?? raw;
    });
  }
  function plural(key, count) {
    const category = new Intl.PluralRules(language).select(count);
    const localKey = key + '.' + category;
    if(Object.hasOwn(locales[language],localKey))return t(localKey,{count});
    // A missing language pack must use English grammar as well as English text.
    return t(key + '.' + new Intl.PluralRules('en').select(count), {count});
  }
  function display(value) {
    if (typeof value !== 'string' || language === 'ru') return value;
    if(sourceKeys.has(value))return t(sourceKeys.get(value));
    return language === "ja" ? globalThis.jaGameText(value) : globalThis.europeanGameText(value, language);
  }
  const fragments = [...sourceKeys.keys()].sort((a,b) => b.length-a.length);
  const configErrors = [
    ["melonDS configuration recovery verification failed","Не удалось проверить восстановление конфигурации melonDS","melonDS の設定の復元を検証できませんでした","Échec de la vérification de la configuration restaurée de melonDS","Verifica del ripristino della configurazione di melonDS non riuscita","Wiederhergestellte melonDS-Konfiguration konnte nicht geprüft werden","No se pudo verificar la configuración restaurada de melonDS"],
    ["melonDS configuration copy failed","Не удалось скопировать конфигурацию melonDS","melonDS の設定をコピーできませんでした","Échec de la copie de la configuration de melonDS","Copia della configurazione di melonDS non riuscita","melonDS-Konfiguration konnte nicht kopiert werden","No se pudo copiar la configuración de melonDS"],
    ["Unsupported melonDS configuration entry","Неподдерживаемая запись конфигурации melonDS","未対応の melonDS 設定項目です","Entrée de configuration melonDS non prise en charge","Voce di configurazione di melonDS non supportata","Nicht unterstützter melonDS-Konfigurationseintrag","Entrada de configuración de melonDS no compatible"],
    ["Conflicting melonDS portable resource:","Конфликт ресурсов переносимого melonDS:","ポータブル版 melonDS のリソースが競合しています：","Conflit de ressource de melonDS portable :","Risorsa di melonDS portatile in conflitto:","Ressourcenkonflikt bei portablem melonDS:","Conflicto de recursos de melonDS portátil:"],
  ];
  function message(value) {
    if (!value || typeof value !== 'string') return value;
    const error=configErrors.find(([source])=>value===source||value.startsWith(source+' '));
    if(error)return error[['en','ru','ja','fr','it','de','es'].indexOf(language)]+value.slice(error[0].length);
    if (language === 'ru') return value;
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
