'use strict';
const {app,dialog}=require('electron');
const path=require('node:path'),fs=require('node:fs');
const {safe}=require('./library.cjs');
const distribution=require('./package.json').portable===true;
const base=distribution?path.dirname(app.getPath('exe')):path.resolve(__dirname,'../../..','.development');
const data=path.join(base,'data');
const startupLanguages=['en','ru','ja','fr','it','de','es'];
const startupText={
  fatal: ["Cannot open the portable library. Close the emulators and the previous Helper. Check the drive, free space, write permission and application files, then restart.","Не удалось открыть переносимую библиотеку. Закрой эмуляторы и прежний Helper. Проверь диск, свободное место, права записи и файлы приложения, затем повтори запуск.","ライブラリを開けません。エミュレーターと以前の Helper を閉じ、ドライブの空き容量、書き込み権限、アプリのファイルを確認して再起動してください。","Impossible d’ouvrir la bibliothèque portable. Fermez les émulateurs et l’ancien Helper. Vérifiez le disque, l’espace libre, les droits d’écriture et les fichiers de l’application, puis relancez-la.","Impossibile aprire la libreria portatile. Chiudi gli emulatori e il precedente Helper. Controlla unità, spazio libero, permessi di scrittura e file dell’app, poi riavvia.","Portable Bibliothek kann nicht geöffnet werden. Schließe die Emulatoren und den bisherigen Helper. Prüfe Laufwerk, freien Speicher, Schreibrechte und Programmdateien und starte erneut.","No se puede abrir la biblioteca portátil. Cierra los emuladores y el Helper anterior. Comprueba la unidad, el espacio libre, los permisos de escritura y los archivos de la aplicación y reiníciala."],
  fresh: ["Create an empty portable library?","Создать пустую переносимую библиотеку?","空のポータブルライブラリを作成しますか？","Créer une bibliothèque portable vide ?","Creare una libreria portatile vuota?","Leere portable Bibliothek erstellen?","¿Crear una biblioteca portátil vacía?"],
  move: ["If you are moving an existing installation, copy its data folder first.","Если переносишь существующую установку, сначала скопируй её папку data.","既存の環境を移す場合は、先に data フォルダーをコピーしてください。","Si vous déplacez une installation, copiez d’abord son dossier data.","Per spostare un’installazione esistente, copia prima la cartella data.","Kopiere beim Umziehen einer vorhandenen Installation zuerst deren Ordner data.","Si trasladas una instalación existente, copia primero su carpeta data."],
  close: ["Close","Закрыть","閉じる","Fermer","Chiudi","Schließen","Cerrar"],
  start: ["Start with an empty library","Начать с пустой библиотеки","空のライブラリで開始","Commencer avec une bibliothèque vide","Inizia con una libreria vuota","Mit leerer Bibliothek beginnen","Empezar con una biblioteca vacía"],
  copy: ["Copy library","Копировать библиотеку","ライブラリをコピー","Copier la bibliothèque","Copia libreria","Bibliothek kopieren","Copiar biblioteca"],
  migrate: ["Copy your previous library?","Скопировать прежнюю библиотеку?","以前のライブラリをコピーしますか？","Copier la bibliothèque précédente ?","Copiare la libreria precedente?","Bisherige Bibliothek kopieren?","¿Copiar la biblioteca anterior?"],
  contents: ["Close the previous Helper and emulators. This copies ROMs, emulators, all save profiles, backups, settings and route progress. The original library stays in place.","Закрой прежний Helper и эмуляторы. Будут скопированы ROM, эмуляторы, сохранения всех профилей, резервные копии, настройки и прогресс. Исходная библиотека останется на месте.","以前の Helper とエミュレーターを閉じてください。ROM、エミュレーター、全プロフィールのセーブ、バックアップ、設定、攻略の進捗をコピーします。元のライブラリはそのまま残ります。","Fermez l’ancien Helper et les émulateurs. Les ROM, émulateurs, profils de sauvegarde, copies de secours, paramètres et progression seront copiés. La bibliothèque d’origine sera conservée.","Chiudi il precedente Helper e gli emulatori. Verranno copiati ROM, emulatori, salvataggi di tutti i profili, backup, impostazioni e progressi. La libreria originale resterà al suo posto.","Schließe den bisherigen Helper und die Emulatoren. ROMs, Emulatoren, alle Spielstandprofile, Sicherungen, Einstellungen und Fortschritt werden kopiert. Die ursprüngliche Bibliothek bleibt erhalten.","Cierra el Helper anterior y los emuladores. Se copiarán las ROM, los emuladores, las partidas de todos los perfiles, las copias de seguridad, los ajustes y el progreso. La biblioteca original se conservará."],
};
function startupLanguage(preferences) {
  try {
    const code=JSON.parse(fs.readFileSync(preferences,'utf8').replace(/^\uFEFF/,'')).language;
    if(startupLanguages.includes(code))return code;
  } catch { /* A new or inaccessible library may have no readable preferences. */ }
  return (app.isReady()?app.getLocale():Intl.DateTimeFormat().resolvedOptions().locale).split('-')[0];
}
let language=startupLanguage(path.join(data,'library','config','preferences-v1.json'));
const startupLabel=key=>startupText[key][startupLanguages.indexOf(language)]??startupText[key][0];
function fatal(err){
  const messages = [
    ["Incomplete update:","Неполное обновление:","更新が不完全です：","Mise à jour incomplète :","Aggiornamento incompleto:","Unvollständige Aktualisierung:","Actualización incompleta:"],
    ["Complete the pending reset in the previous copy first.","Сначала заверши начатый сброс в прежней копии.","以前のコピーでリセットを完了してください。","Terminez d’abord la réinitialisation de l’ancienne copie.","Completa prima il ripristino nella copia precedente.","Schließe zuerst das Zurücksetzen in der bisherigen Kopie ab.","Completa primero el restablecimiento en la copia anterior."],
    ["Invalid profile:","Недействительный профиль:","無効なプロフィール：","Profil invalide :","Profilo non valido:","Ungültiges Profil:","Perfil no válido:"],
    ["Invalid emulator:","Недействительный эмулятор:","無効なエミュレーター：","Émulateur invalide :","Emulatore non valido:","Ungültiger Emulator:","Emulador no válido:"],
    ["Conflicting files:","Конфликт файлов:","ファイルの競合：","Fichiers en conflit :","File in conflitto:","Dateikonflikt:","Conflicto de archivos:"],
    ["Finish pending recovery before copying:","Перед копированием заверши восстановление:","コピーの前に復元を完了してください：","Terminez la restauration avant la copie :","Completa il recupero prima di copiare:","Wiederherstellung vor dem Kopieren abschließen:","Completa la recuperación antes de copiar:"],
    ["Missing portable configuration:","Отсутствует конфигурация portable-версии:","ポータブル設定がありません：","Configuration portable absente :","Configurazione portatile mancante:","Portable Konfiguration fehlt:","Falta la configuración portátil:"],
    ["Missing portable library:","Отсутствует переносимая библиотека:","ポータブルライブラリがありません：","Bibliothèque portable absente :","Libreria portatile mancante:","Portable Bibliothek fehlt:","Falta la biblioteca portátil:"],
    ["Unrecognized existing data:","Неизвестные данные в папке:","不明な既存データ：","Données existantes non reconnues :","Dati esistenti non riconosciuti:","Unbekannte vorhandene Daten:","Datos existentes desconocidos:"],
    ["Unrecognized staging data:","Неизвестные временные данные:","不明な一時データ：","Données temporaires non reconnues :","Dati temporanei non riconosciuti:","Unbekannte temporäre Daten:","Datos temporales desconocidos:"],
    ["Overlapping libraries:","Папки библиотек пересекаются:","ライブラリの場所が重複しています：","Emplacements des bibliothèques imbriqués :","Percorsi delle librerie sovrapposti:","Bibliothekspfade überschneiden sich:","Las rutas de las bibliotecas se solapan:"],
    ["Unexpected staged file:","Неожиданный файл в промежуточной копии:","予期しない一時ファイル：","Fichier temporaire inattendu :","File temporaneo inatteso:","Unerwartete temporäre Datei:","Archivo temporal inesperado:"],
    ["File changed:","Файл изменился:","ファイルが変更されました：","Fichier modifié :","File modificato:","Datei geändert:","Archivo modificado:"],
    ["Library changed during migration.","Во время переноса библиотека изменилась.","移行中にライブラリが変更されました。","La bibliothèque a changé pendant la migration.","La libreria è cambiata durante la migrazione.","Bibliothek wurde während der Übertragung geändert.","La biblioteca cambió durante la migración."],
    ["Close the previous emulator:","Закрой ранее запущенный эмулятор:","以前のエミュレーターを閉じてください：","Fermez l’émulateur précédent :","Chiudi l’emulatore precedente:","Bisherigen Emulator schließen:","Cierra el emulador anterior:"],
  ];
  const row=messages.find(([source])=>err.message===source||err.message.startsWith(source+' '));
  const detail=row?(row[startupLanguages.indexOf(language)]??row[0])+err.message.slice(row[0].length):err.message;
  dialog.showErrorBox('Pokédex Helper',startupLabel('fatal')+'\n\n'+data+'\n'+detail);
  app.exit(1);
}
async function start(){
  if(distribution){
    const sums=JSON.parse(fs.readFileSync(path.join(__dirname,'portable-integrity.json'),'utf8'));
    for(const [file,sum] of Object.entries(sums)){
      if(require('node:crypto').createHash('sha256').update(fs.readFileSync(safe(__dirname,file))).digest('hex')!==sum)throw Error('Incomplete update: '+file);
    }
  }
  for(const [key,sub] of Object.entries({userData:'cache/electron',sessionData:'cache/chromium',crashDumps:'logs/crashes'})){
    const folder=safe(data,sub);fs.mkdirSync(folder,{recursive:true});app.setPath(key,folder);
  }
  app.setAppLogsPath(safe(data,'logs'));
  if(!app.requestSingleInstanceLock()){app.quit();return}
  await app.whenReady();
  const oldHome=distribution&&!fs.existsSync(path.join(data,'library'))?path.join(app.getPath('documents'),'PokedexHelper'):null;
  const root=await require('./portable.cjs').initialize(data,{oldHome,confirmFresh:distribution?async()=>{
    language=startupLanguage(path.join(data,'library','config','preferences-v1.json'));
    const r=await dialog.showMessageBox({type:'question',title:'Pokédex Helper',message:startupLabel('fresh'),detail:startupLabel('move')+'\n'+data,buttons:[startupLabel('close'),startupLabel('start')],defaultId:0,cancelId:0});return r.response===1
  }:undefined,choose:async(source,resuming)=>{
    language=startupLanguage(path.join(oldHome,'data','preferences-v1.json'));
    const buttons=['close','copy','start'].map(startupLabel);
    const {response}=await dialog.showMessageBox({type:'question',title:'Pokédex Helper',message:startupLabel('migrate'),detail:startupLabel('contents')+'\n\n'+source+'\n→ '+data,buttons:resuming?buttons.slice(0,2):buttons,defaultId:0,cancelId:0});
    return ['cancel','copy','fresh'][response];
  }});
  app.helperLibrary=root;
  require('./main.cjs');
}
start().catch(e=>{if(e.message==='Migration paused.')app.quit();else fatal(e)});
