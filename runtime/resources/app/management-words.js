'use strict';
if(typeof module!=='undefined')require('./locale-loader.cjs');
function managementText(key,language){
  const updates = {
    checkHelper: ['Check for Helper updates','Проверить обновления хелпера','アプリの更新を確認','Rechercher une mise à jour','Verifica aggiornamenti','Nach Updates suchen','Buscar actualizaciones'],
    helperCurrent: ['You have the latest version.','У тебя актуальная версия.','最新バージョンです。','Votre version est à jour.','Hai la versione più recente.','Die Version ist aktuell.','Tienes la última versión.'],
    helperInstall: ['Update and restart','Обновить и перезапустить','更新して再起動','Mettre à jour et redémarrer','Aggiorna e riavvia','Aktualisieren und neu starten','Actualizar y reiniciar'],
    helperLater: ['Later','Позже','あとで','Plus tard','Più tardi','Später','Más tarde'],
    helperReady: ['A new version is available','Доступна новая версия','新しいバージョンがあります','Nouvelle version disponible','Nuova versione disponibile','Neue Version verfügbar','Nueva versión disponible'],
    helperFailed: ['Update failed','Не удалось обновить','更新に失敗しました','Échec de la mise à jour','Aggiornamento non riuscito','Update fehlgeschlagen','Error al actualizar']
  };
  if (Object.hasOwn(updates,key)) return updates[key][['en','ru','ja','fr','it','de','es'].indexOf(language)] ?? updates[key][0];
  const id='management.'+key;
  return globalThis.dexLocales[language]?.[id]??globalThis.dexLocales.en[id]??key;
}
if(typeof module!=='undefined')module.exports=managementText;
