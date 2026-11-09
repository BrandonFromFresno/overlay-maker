const {app,BrowserWindow,ipcMain,dialog,shell,safeStorage}=require('electron');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
let win,server;const clients=new Set();let live='',bridgeError='',bridgeStarting=true,storedOverlayWarning='',lastInput={},lastInputAt=0;
const overlayURL='http://127.0.0.1:18777/overlay';
function setupState(){return {phase:server?.listening?'ready':bridgeError?'error':'starting',url:overlayURL,hasOverlay:!!live,clients:clients.size,error:bridgeError,warning:storedOverlayWarning};}
function writeAtomically(filename,data){
 const temporary=path.join(path.dirname(filename),'.overlay-'+crypto.randomUUID()+'.tmp');
 try{fs.writeFileSync(temporary,data,{flag:'wx'});fs.renameSync(temporary,filename);}
 finally{try{fs.rmSync(temporary,{force:true});}catch{}}
}
function retryBridge(){if(server.listening||bridgeStarting)return Promise.resolve(setupState());bridgeStarting=true;bridgeError='';return new Promise(resolve=>{const done=()=>{server.off('listening',done);server.off('error',done);resolve(setupState());};server.once('listening',done);server.once('error',done);try{server.listen(18777,'127.0.0.1');}catch(error){bridgeStarting=false;bridgeError=error.message;done();}});}
app.whenReady().then(()=>{
 const delivery=require('./github-delivery.cjs').createGitHubDelivery({userData:app.getPath('userData'),safeStorage});
 ipcMain.handle('delivery-state',()=>delivery.state());
 ipcMain.handle('delivery-connect',(_,value)=>delivery.connect(value));
 ipcMain.handle('delivery-disconnect',()=>delivery.disconnect());
 ipcMain.handle('delivery-upload',(_,value)=>delivery.publish(value));
 ipcMain.handle('delivery-check',(_,id)=>delivery.check(id));
 ipcMain.handle('delivery-project',(_,id)=>delivery.openProject(id));
 ipcMain.handle('delivery-help',(_,kind)=>shell.openExternal(kind==='token'?'https://github.com/settings/personal-access-tokens/new':kind==='hosting'?'https://dash.cloudflare.com/':'https://github.com/BrandonFromFresno/Controlverlay-Farm'));
 const stored=path.join(app.getPath('userData'),'live.html');try{if(fs.existsSync(stored))live=fs.readFileSync(stored,'utf8');}catch{storedOverlayWarning='The previous OBS overlay could not be restored. Send this design to replace it.';}
 server=http.createServer((req,res)=>{
  if(req.url==='/events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Access-Control-Allow-Origin':'*'});res.write(': connected\n\ndata: '+JSON.stringify(Date.now()-lastInputAt<=1000?lastInput:{})+'\n\n');clients.add(res);const cleanup=()=>clients.delete(res);res.on('close',cleanup);res.on('error',cleanup);return;}
  if(req.url==='/overlay'){res.writeHead(live?200:404,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(live||'Open Overlay Studio and choose Send to OBS.');return;}
  res.writeHead(404);res.end();
 });
 server.on('listening',()=>{bridgeStarting=false;bridgeError='';});
 server.on('error',error=>{bridgeStarting=false;bridgeError=error.code==='EADDRINUSE'?'Local OBS port is in use. Close other copies of Overlay Studio, then retry the connection.':'Local OBS connection failed: '+error.message;win?.webContents.send('bridge-error',bridgeError);});
 server.listen(18777,'127.0.0.1');
 win=new BrowserWindow({width:1440,height:960,minWidth:900,minHeight:680,backgroundColor:'#101012',webPreferences:{preload:path.join(__dirname,'app','preload.cjs'),contextIsolation:true,nodeIntegration:false,backgroundThrottling:false}});
 win.setMenuBarVisibility(false);win.loadFile('app/index.html');
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 ipcMain.on('input-state',(_,state)=>{lastInput=state;lastInputAt=Date.now();const msg='data: '+JSON.stringify(state)+'\n\n';for(const client of clients)if(!client.destroyed&&!client.writableEnded)client.write(msg);});
 ipcMain.handle('get-setup-state',()=>setupState());
 ipcMain.handle('retry-bridge',()=>retryBridge());
 ipcMain.handle('open-holo-source',()=>shell.openExternal('https://www.fffuel.co/hhholographic/'));
 ipcMain.handle('open-texture-source',()=>shell.openExternal('https://www.fffuel.co/tttexture/'));
 ipcMain.handle('list-fonts',async()=>{
  if(process.platform!=='win32')return {families:[]};
  const {execFile}=require('node:child_process');
  const script="[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false); Add-Type -AssemblyName System.Drawing; $collection = New-Object System.Drawing.Text.InstalledFontCollection; try { @($collection.Families | ForEach-Object { $_.Name } | Sort-Object -Unique) | ConvertTo-Json -Compress } finally { $collection.Dispose() }";
  return new Promise(resolve=>execFile('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,timeout:15000,maxBuffer:2000000},(error,stdout)=>{if(error){resolve({families:[]});return;}try{const result=JSON.parse(stdout.replace(/^\uFEFF/,''));resolve({families:(Array.isArray(result)?result:[result]).filter(name=>typeof name==='string'&&name.length<=120)});}catch{resolve({families:[]});}}));
 });
 ipcMain.handle('publish',(_,html)=>{if(typeof html!=='string'||html.length>30e6)throw Error('Overlay exceeds size limit');if(!server.listening)throw Error('Local OBS connection unavailable. Close other copies and retry.');writeAtomically(stored,html);live=html;storedOverlayWarning='';return overlayURL;});
 ipcMain.handle('save-image',async(_,data,name)=>{if(typeof data!=='string'||!/^data:image\/png;base64,[a-z0-9+/=]+$/i.test(data)||data.length>35e6)throw Error('Invalid PNG');const r=await dialog.showSaveDialog(win,{defaultPath:typeof name==='string'&&/^[a-zA-Z0-9-]+\.png$/.test(name)?name:'My-overlay.png'});if(!r.canceled){writeAtomically(r.filePath,Buffer.from(data.split(',')[1],'base64'));return true;}return false;});
 ipcMain.handle('save-file',async(_,{name,data})=>{if(typeof data!=='string'||data.length>35e6)throw Error('File too large');const r=await dialog.showSaveDialog(win,{defaultPath:name});if(!r.canceled){writeAtomically(r.filePath,data);return true;}return false;});
});
app.on('window-all-closed',()=>{for(const c of clients)c.end();server?.close();app.quit();});
