const {contextBridge,ipcRenderer,webFrame}=require('electron');
const api={setScale(percent){if(Number.isInteger(percent)&&percent>=90&&percent<=150&&percent%5===0)webFrame.setZoomFactor(percent/100)}};
for(const name of ['get','prefs','importProgress','exportProgress','choose','play','saveView','saveAction','resetApp','component','library'])api[name]=(...args)=>ipcRenderer.invoke(name,...args);
api.installProgress=callback=>ipcRenderer.on('install-progress',(_,value)=>callback(value));
api.updates=callback=>ipcRenderer.on('snapshots',(_,value)=>callback(value));
contextBridge.exposeInMainWorld('desktop',api);
