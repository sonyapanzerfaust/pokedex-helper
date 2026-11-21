'use strict';
const {app,dialog}=require('electron');
const path=require('node:path'),fs=require('node:fs');
const {safe}=require('./library.cjs');
const distribution=process.platform==='win32'&&require('./package.json').portable===true;
const base=distribution?path.dirname(app.getPath('exe')):path.resolve(__dirname,'../../..','.development');
const data=path.join(base,'data');
function fatal(err){
  const ru=app.isReady()&&app.getLocale().startsWith('ru');
  dialog.showErrorBox('Pokédex Helper', (ru?'Не удалось открыть переносимую библиотеку. Закрой эмуляторы и прежний Helper. Проверь доступность диска, свободное место, права записи и целостность файлов приложения. Повтори запуск.':'Cannot open the portable library. Close the emulators and the previous Helper. Check the drive, free space, write permission and application files, then restart.')+'\n\n'+data+'\n'+err.message);
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
    const ru=app.getLocale().startsWith('ru');
    const r=await dialog.showMessageBox({type:'question',title:'Pokédex Helper',message:ru?'Создать пустую переносимую библиотеку?':'Create an empty portable library?',detail:(ru?'Если сюда перенесена существующая установка, сначала скопируй её папку data.':'If you are moving an existing installation, copy its data folder first.')+'\n'+data,buttons:ru?['Закрыть','Начать с пустой библиотеки']:['Close','Start with an empty library'],defaultId:0,cancelId:0});return r.response===1
  }:undefined,choose:async(source,resuming)=>{
    let ru=app.getLocale().startsWith('ru');
    const pref=path.join(oldHome,'data','preferences-v1.json');
    if(fs.existsSync(pref))ru=JSON.parse(fs.readFileSync(pref,'utf8').replace(/^\uFEFF/,'')).language==='ru';
    const buttons=ru?['Закрыть','Копировать библиотеку','Начать с пустой библиотеки']:['Close','Copy library','Start with an empty library'];
    const {response}=await dialog.showMessageBox({type:'question',title:'Pokédex Helper',message:ru?'Перенести копию прежней библиотеки?':'Copy your previous library?',detail:(ru?'Закрой предыдущий Helper и эмуляторы. Будут скопированы ROM, эмуляторы, сохранения всех профилей, резервные копии, настройки и прогресс. Исходная библиотека останется на месте.':'Close the previous Helper and emulators. This copies ROMs, emulators, all save profiles, backups, settings and route progress. The original library stays in place.')+'\n\n'+source+'\n→ '+data,buttons:resuming?buttons.slice(0,2):buttons,defaultId:0,cancelId:0});
    return ['cancel','copy','fresh'][response];
  }});
  app.helperLibrary=root;
  require('./main.cjs');
}
start().catch(e=>{if(e.message==='Migration paused.')app.quit();else fatal(e)});
