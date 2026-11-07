const {app,BrowserWindow,ipcMain,dialog}=require('electron');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
let win,server;const clients=new Set();let live='';
app.whenReady().then(()=>{
 const stored=path.join(app.getPath('userData'),'live.html');if(fs.existsSync(stored))live=fs.readFileSync(stored,'utf8');
 server=http.createServer((req,res)=>{
  if(req.url==='/events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Access-Control-Allow-Origin':'*'});res.write(': connected\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return;}
  if(req.url==='/overlay'){res.writeHead(live?200:404,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(live||'Open Overlay Studio and choose Send to OBS.');return;}
  res.writeHead(404);res.end();
 }).listen(18777,'127.0.0.1');
 server.on('error',()=>{win?.webContents.send('bridge-error','Port 18777 is already in use. Close other copies of Overlay Studio and reopen.');});
 win=new BrowserWindow({width:1440,height:960,minWidth:900,minHeight:680,backgroundColor:'#101012',webPreferences:{preload:path.join(__dirname,'app','preload.cjs'),contextIsolation:true,nodeIntegration:false,backgroundThrottling:false}});
 win.setMenuBarVisibility(false);win.loadFile('app/index.html');
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 ipcMain.on('input-state',(_,state)=>{const msg='data: '+JSON.stringify(state)+'\n\n';for(const client of clients)client.write(msg);});
 ipcMain.handle('list-fonts',async()=>{
  if(process.platform!=='win32')return {families:[]};
  const {execFile}=require('node:child_process');
  const script="[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false); Add-Type -AssemblyName System.Drawing; $collection = New-Object System.Drawing.Text.InstalledFontCollection; try { @($collection.Families | ForEach-Object { $_.Name } | Sort-Object -Unique) | ConvertTo-Json -Compress } finally { $collection.Dispose() }";
  return new Promise(resolve=>execFile('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,timeout:15000,maxBuffer:2000000},(error,stdout)=>{if(error){resolve({families:[]});return;}try{const result=JSON.parse(stdout.replace(/^\uFEFF/,''));resolve({families:(Array.isArray(result)?result:[result]).filter(name=>typeof name==='string'&&name.length<=120)});}catch{resolve({families:[]});}}));
 });
 ipcMain.handle('publish',(_,html)=>{if(typeof html!=='string'||html.length>30e6)throw Error('Overlay exceeds size limit');live=html;fs.writeFileSync(stored,live);return 'http://127.0.0.1:18777/overlay';});
 ipcMain.handle('save-image',async(_,data)=>{if(typeof data!=='string'||!/^data:image\/png;base64,[a-z0-9+/=]+$/i.test(data)||data.length>35e6)throw Error('Invalid PNG');const r=await dialog.showSaveDialog(win,{defaultPath:'My-overlay.png'});if(!r.canceled){fs.writeFileSync(r.filePath,Buffer.from(data.split(',')[1],'base64'));return true;}return false;});
 ipcMain.handle('save-file',async(_,{name,data})=>{if(typeof data!=='string'||data.length>35e6)throw Error('File too large');const r=await dialog.showSaveDialog(win,{defaultPath:name});if(!r.canceled){fs.writeFileSync(r.filePath,data);return true;}return false;});
});
app.on('window-all-closed',()=>{for(const c of clients)c.end();server?.close();app.quit();});
