'use strict';
const {app,BrowserWindow,Menu,ipcMain,dialog:nativeDialog,shell}=require('electron');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {parse,confirm,batterySize,blankFlash}=require('./save');
const components=require('./components.cjs');
const games=['Platinum','HeartGold','SoulSilver','Diamond','Pearl','Emerald','FireRed','LeafGreen'];
const home=app.helperLibrary||path.join(app.getPath('documents'),'PokedexHelper');
const local=app.helperLibrary;
const dir=local?path.join(local,'config'):path.join(home,'data'),backup=local?path.join(local,'legacy-backups'):path.join(home,'backups');
fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(backup,{recursive:true});
function read(name,fallback){const file=path.join(dir,name);return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')):fallback}
const localePacks=require('./locale-loader.cjs');
const i18n=require('./i18n');
const prior=read('preferences-v1.json',null);i18n.set(prior?.language||(prior?'ru':'en'));
const menuLabels={
  filemenu: ["File","Файл","ファイル","Fichier","File","Datei","Archivo"],
  editmenu: ["Edit","Правка","編集","Édition","Modifica","Bearbeiten","Editar"],
  viewmenu: ["View","Вид","表示","Affichage","Visualizza","Ansicht","Ver"],
  windowmenu: ["Window","Окно","ウィンドウ","Fenêtre","Finestra","Fenster","Ventana"],
  help: ["Help","Помощь","ヘルプ","Aide","Aiuto","Hilfe","Ayuda"],
  undo: ["Undo","Отменить","元に戻す","Annuler","Annulla","Rückgängig","Deshacer"],
  redo: ["Redo","Повторить","やり直す","Rétablir","Ripeti","Wiederholen","Rehacer"],
  cut: ["Cut","Вырезать","切り取り","Couper","Taglia","Ausschneiden","Cortar"],
  copy: ["Copy","Копировать","コピー","Copier","Copia","Kopieren","Copiar"],
  paste: ["Paste","Вставить","貼り付け","Coller","Incolla","Einfügen","Pegar"],
  delete: ["Delete","Удалить","削除","Supprimer","Elimina","Löschen","Eliminar"],
  selectall: ["Select All","Выделить всё","すべて選択","Tout sélectionner","Seleziona tutto","Alles auswählen","Seleccionar todo"],
  reload: ["Reload","Перезагрузить","再読み込み","Recharger","Ricarica","Neu laden","Recargar"],
  forcereload: ["Force Reload","Принудительно перезагрузить","強制再読み込み","Forcer le rechargement","Forza ricaricamento","Neu laden erzwingen","Forzar recarga"],
  toggledevtools: ["Toggle Developer Tools","Инструменты разработчика","開発者ツール","Outils de développement","Strumenti di sviluppo","Entwicklerwerkzeuge","Herramientas de desarrollo"],
  resetzoom: ["Actual Size","Исходный масштаб","実際のサイズ","Taille réelle","Dimensioni effettive","Originalgröße","Tamaño real"],
  zoomin: ["Zoom In","Увеличить","拡大","Agrandir","Ingrandisci","Vergrößern","Acercar"],
  zoomout: ["Zoom Out","Уменьшить","縮小","Réduire","Riduci","Verkleinern","Alejar"],
  togglefullscreen: ["Toggle Full Screen","Полный экран","フルスクリーン切替","Plein écran","Schermo intero","Vollbild","Pantalla completa"],
  minimize: ["Minimize","Свернуть","最小化","Réduire la fenêtre","Riduci a icona","Minimieren","Minimizar"],
  zoom: ["Zoom","Развернуть","拡大・縮小","Agrandir la fenêtre","Ingrandisci la finestra","Maximieren","Maximizar"],
  close: ["Close Window","Закрыть окно","ウィンドウを閉じる","Fermer la fenêtre","Chiudi finestra","Fenster schließen","Cerrar ventana"],
  quit: ["Quit","Выйти","終了","Quitter","Esci","Beenden","Salir"],
  learnmore: ["Learn More","Подробнее","詳しく見る","En savoir plus","Ulteriori informazioni","Mehr erfahren","Más información"],
};
function localizeMenu(){
  const menu=Menu.getApplicationMenu();
  if(!menu)return;
  const column=['en','ru','ja','fr','it','de','es'].indexOf(i18n.language);
  function translate(items){
    for(const item of items){
      const labels=menuLabels[item.role?.toLowerCase()]??Object.values(menuLabels).find(row=>row.includes(item.label.replaceAll('&','')));
      if(labels)item.label=labels[column];
      if(item.submenu)translate(item.submenu.items);
    }
  }
  translate(menu.items);
  Menu.setApplicationMenu(menu);
}
const dialog={showErrorBox:(title,detail)=>nativeDialog.showErrorBox(i18n.message(title),i18n.message(detail))};
for(const fn of ['showOpenDialog','showSaveDialog','showMessageBox'])dialog[fn]=(win,opts)=>{
 const options={...opts};for(const field of ['title','message','detail'])if(options[field])options[field]=i18n.message(options[field]);
 if(opts.buttons)options.buttons=opts.buttons.map(i18n.message);if(opts.filters)options.filters=opts.filters.map(f=>({...f,name:i18n.display(f.name)}));
 return nativeDialog[fn](win,options);
};
function persist(name,value){const file=path.join(dir,name);fs.writeFileSync(file+'.tmp',JSON.stringify(value));fs.renameSync(file+'.tmp',file)}
function readLegacy(){
const legacyPaths=read('connections-v1.json',{rom:{},save:{},emulator:{}});
const old=read('donors.json',{});
for(const game of games){
  const gba=['Emerald','FireRed','LeafGreen'].includes(game), emu=gba?'mGBA':'melonDS';
  const rom=old[game]?.rom || path.join(home,'games',game,game.toLowerCase()+(gba?'.gba':'.nds'));
  if(!legacyPaths.rom[game]&&fs.existsSync(rom))legacyPaths.rom[game]=rom;
  const sav=rom.replace(/\.[^.]+$/,'.sav');
  if(!legacyPaths.save[game]&&fs.existsSync(sav))legacyPaths.save[game]=sav;
  const exe=old[game]?.exe || path.join(home,'emulators',emu,emu+'.exe');
  if(!legacyPaths.emulator[emu]&&fs.existsSync(exe))legacyPaths.emulator[emu]={path:exe,version:'локальная'};
}
return legacyPaths;
}
let win;
const cache=read('snapshots-v1.json',{}), errors={},pending=new Map(), checked=new Map();
const families={Diamond:'Diamond/Pearl',Pearl:'Diamond/Pearl',HeartGold:'HG/SS',SoulSilver:'HG/SS',FireRed:'FireRed/LeafGreen',LeafGreen:'FireRed/LeafGreen'};
const manager=require('./managed.cjs').managed({app,dialog,win:()=>win,home,fixedRoot:local,legacy:local?{rom:{},save:{},emulator:{}}:readLegacy,cache,report:(name,phase,received,total)=>win?.webContents.send('install-progress',{name,phase,received,total})});
const paths=manager.paths;
const {recovery}=require('./recovery.cjs');
const backupRetries=new Map(),backupErrors=new Map();
function logSave(game,message){
  console.warn('Save synchronization',game,message);
  try{fs.appendFileSync(manager.lib.at('logs','save-sync.jsonl'),JSON.stringify({time:new Date().toISOString(),game,profile:manager.selected(game),message})+'\n')}catch{}
}
const management=require('./save-management.cjs').management({manager,dialog,win:()=>win,read,persist,i18n,legacyFolder:backup,openFolder:file=>shell.openPath(path.dirname(file)),backupErrors,refresh:g=>{
  checked.delete(g);pending.delete(g);poll(g,true);notify()
}});
function snapshot(){return {canUpdateHelper,profileLists:manager.root?Object.fromEntries(games.map(g=>[g,manager.profiles(g)])):{},version:require('./package.json').version,availability:{rom:Object.fromEntries(Object.entries(paths.rom).map(([g,f])=>[g,fs.existsSync(f)])),emulator:Object.fromEntries(Object.entries(paths.emulator).map(([g,e])=>[g,fs.existsSync(e.path)]))},profileNames:manager.root?Object.fromEntries(games.map(g=>[g,manager.profiles(g).find(p=>p.id===manager.selected(g))?.name])):{},profiles:manager.root?Object.fromEntries(games.map(g=>[g,manager.selected(g)])):{},cache,errors,paths,libraryRoot:manager.root,platform:process.platform+' '+process.arch}}
function notify(){if(win&&!win.isDestroyed())win.webContents.send('snapshots',snapshot())}
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function poll(game,explicit=false){
  if(!paths.save[game])return;
  try{
    const id=manager.selected(game),file=manager.active(game);const stat=fs.statSync(file);if(!batterySize(stat.size))throw Error('Неполный или неподдерживаемый файл');
    const bytes=fs.readFileSync(file),hash=digest(bytes);
    if(checked.get(game)===hash && !errors[game]&&(!backupRetries.has(game)||Date.now()<backupRetries.get(game)))return;
    if(!explicit&&pending.get(game)!==hash){pending.set(game,hash);return}
    if(['Emerald','FireRed','LeafGreen'].includes(game)&&!cache[game]&&blankFlash(bytes))throw Error('Ожидание первого сохранения через игровое меню');
    const data=parse(bytes);confirm(data,explicit?null:cache[game],game);
    if(data.game!==(families[game]||game))throw Error('Формат сейва не соответствует выбранной игре');
    if(!bytes.equals(fs.readFileSync(file)))return;
    const r=recovery(manager.lib,game,id,file);
    if(read('preferences-v1.json',{}).autoBackup!==false){
      try{
        r.resume();
        if(r.stamp().observed!==hash){
          r.create({bytes,hash},true);r.mark({observed:hash,error:null});
        }
        backupRetries.delete(game);backupErrors.delete(game+'/'+id);
      }catch(e){
        backupRetries.set(game,Date.now()+60000);
        try{r.mark({error:e.message})}catch{}
        if(backupErrors.get(game+'/'+id)!==e.message)logSave(game,e.message);
        backupErrors.set(game+'/'+id,e.message);
      }
    }
    manager.sawSave(game);cache[game]={...data,hash,profile:id};persist('snapshots-v1.json',cache);checked.set(game,hash);delete errors[game];notify();
  }catch(err){pending.delete(game);if(errors[game]!==err.message){errors[game]=err.message;logSave(game,err.message);notify()}}
}
function tick(){try{if(manager.root&&!manager.busy){management.resume();manager.refresh();for(const g of games)poll(g)}}catch(e){errors.library=e.message;notify()}}
async function setupLibrary(){
  await manager.transaction(async()=>{if(!manager.root)await manager.init();management.resume();if(!local)await manager.migrate()});
  delete errors.library;tick();notify();return snapshot();
}
ipcMain.handle('library',setupLibrary);
ipcMain.handle('get',()=>({...snapshot(),prefs:read('preferences-v1.json',null),legacy:read('helper-state.json',read('pre-1.0-catalog-progress.json',{})),guide:{...require('./approved-data.json'),words:localePacks.words},catalog:require('./catalog.json').sections,methods:require('./methods.json')}));
ipcMain.handle('prefs',(_,value)=>{const was=read('preferences-v1.json',{});persist('preferences-v1.json',value);i18n.set(value.language);if(was.language!==value.language)localizeMenu();if(was.autoBackup===false&&value.autoBackup!==false)checked.clear()});
ipcMain.handle('importProgress',async()=>{
  const choice=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'Прогресс Pokédex Helper',extensions:['json']}]});
  if(choice.canceled)return null;
  return JSON.parse(fs.readFileSync(choice.filePaths[0],'utf8').replace(/^\uFEFF/,''));
});
ipcMain.handle('exportProgress',async(_,value)=>{
  const choice=await dialog.showSaveDialog(win,{defaultPath:'pokedex-progress.json',filters:[{name:'JSON',extensions:['json']}]});
  if(choice.canceled)return;
  if(path.extname(choice.filePath).toLowerCase()!=='.json')throw Error('Выбери файл с расширением .json');
  fs.writeFileSync(choice.filePath,JSON.stringify(value,null,2));
});
ipcMain.handle('choose',async(_,kind,name)=>{
  if(!['emulator','save','rom','folder'].includes(kind))throw Error('Неизвестная настройка');
  if(kind==='emulator'?!['melonDS','mGBA'].includes(name):!games.includes(name))throw Error('Неизвестная игра');
  const filter=kind==='save'?['sav']:kind==='rom'?(['Emerald','FireRed','LeafGreen'].includes(name)?['gba']:['nds']):['zip','7z','appimage'];
  const filterNames={save:'renderer.saves',rom:'renderer.rom_files',emulator:'management.emulators'};
  const pick=await dialog.showOpenDialog(win,{properties:[kind==='folder'?'openDirectory':'openFile'],filters:kind==='folder'?[]:[{name:i18n.t(filterNames[kind]),extensions:filter}]});
  if(pick.canceled)return snapshot();
  let file=pick.filePaths[0];
  if(kind==='folder'){
    const next=await dialog.showOpenDialog(win,{defaultPath:file,title:'Сохранение '+name,properties:['openFile'],filters:[{name:i18n.t('renderer.saves'),extensions:['sav']}]});
    if(next.canceled)return snapshot();
    file=next.filePaths[0];
  }
  const result=await manager.transaction(()=>manager.choose(kind,name,file));tick();return {...snapshot(),importResult:result};
});
const installations=new Set();
const canUpdateHelper=app.isPackaged && require('./package.json').portable===true &&
  ['win32','linux'].includes(process.platform) && process.arch==='x64';
let checkingHelper=false;
async function checkHelper(manual){
  if(!canUpdateHelper || checkingHelper)return;
  checkingHelper=true;
  const text=key=>require('./management-words.js')(key,i18n.language);
  const updater=require('./helper-update.cjs'), root=path.dirname(app.getPath('exe'));
  let offered=false;
  try{
    updater.cleanup(root);
    const update=await updater.latest(require('./package.json').version);
    if(!win || win.isDestroyed())return;
    if(!update){
      if(manual)await nativeDialog.showMessageBox(win,{message:text('helperCurrent')});
      return;
    }
    offered=true;
    const choice=await nativeDialog.showMessageBox(win,{type:'question',message:text('helperReady')+' · '+update.version,
      buttons:[text('helperLater'),text('helperInstall')],defaultId:0,cancelId:0});
    if(choice.response!==1)return;
    await manager.transaction(async()=>{
      manager.idle('mGBA');manager.idle('melonDS');
      await updater.prepare(root,update);
      app.quit();
    });
  }catch(error){if(manual||offered)nativeDialog.showErrorBox(text('helperFailed'),error.message)}
  finally{checkingHelper=false}
}
ipcMain.handle('updateHelper',()=>checkHelper(true));
ipcMain.handle('component',async(_,name,action)=>{
  if(!['melonDS','mGBA'].includes(name))throw Error('Неизвестная программа');
  if(action==='launch'){await manager.transaction(()=>manager.launch(name));return snapshot()}
  if(action==='check'){const {version,asset}=await components.release(name);return {version,size:asset.size,available:version!==paths.emulator[name]?.version}}
  if(action!=='update')throw Error('Неизвестное действие');
  if(installations.has(name))throw Error('Установка уже выполняется');
  installations.add(name);
  try{
    const report=(phase,received=0,total=0)=>win.webContents.send('install-progress',{name,phase,received,total});
    await manager.transaction(async()=>{manager.idle(name);const result=await components.install(win,manager.lib,name,report,dialog);if(result)manager.recordComponent(name,result)});
    return snapshot();
  }finally{installations.delete(name)}

});
ipcMain.handle('play',async(_,game)=>{
  if(!games.includes(game))throw Error('Неизвестная игра');
  await manager.transaction(()=>manager.launch(require('./library.cjs').emulator(game),game));
});
ipcMain.handle('saveView',(_,g,id)=>management.view(g,id));
ipcMain.handle('saveAction',async(_,op,g,id,key)=>manager.transaction(()=>management.action(op,g,id,key)));
ipcMain.handle('resetApp',async(_,saves,backups)=>manager.transaction(()=>management.reset(saves===true,backups===true)));
if(!local&&!app.requestSingleInstanceLock())app.quit();
else{
app.on('second-instance',()=>win?.focus());
app.whenReady().then(async()=>{
  const {screen}=require('electron');
  const saved=read('window-bounds.json',null);
  const positioned=saved&&[saved.x,saved.y,saved.width,saved.height].every(Number.isInteger);
  const {workArea}=positioned?screen.getDisplayMatching(saved):screen.getPrimaryDisplay();
  const workAreaSize=workArea;
  const bounds={width:Math.min(workArea.width,saved?.width||820),height:Math.min(workArea.height,saved?.height||900)};
  if(positioned){
    bounds.x=Math.max(workArea.x,Math.min(saved.x,workArea.x+workArea.width-bounds.width));
    bounds.y=Math.max(workArea.y,Math.min(saved.y,workArea.y+workArea.height-bounds.height));
  }
  win=new BrowserWindow({icon:path.join(__dirname,'art','notebook.ico'),...bounds,minWidth:Math.min(480,workAreaSize.width),minHeight:Math.min(420,workAreaSize.height),autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());
  localizeMenu();
  win.on('close',()=>{try{if(!win.isMaximized()&&!win.isMinimized())persist('window-bounds.json',win.getBounds())}catch(e){dialog.showErrorBox('Pokédex Helper',e.message)}});
  if(local)await setupLibrary();
  await win.loadFile(path.join(__dirname,'index.html'));
  try{if(!local)await setupLibrary()}catch(e){errors.library=e.message;notify();dialog.showErrorBox('Локальная библиотека',e.message)}
  tick();setInterval(tick,2200);
  if(canUpdateHelper)void checkHelper(false);
}).catch(e=>{dialog.showErrorBox('Pokédex Helper',e.message);app.quit()});app.on('window-all-closed',()=>app.quit());
}
