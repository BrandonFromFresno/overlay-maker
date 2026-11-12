'use strict';
// Producer review window. Served only from the loopback studio server, without a preload/IPC bridge.
const crypto=require('node:crypto');
function createCustomerPreview({BrowserWindow,parent,origin,isReady}){
 const previews=new Map();
 function respond(req,res){if(!req.url?.startsWith('/customer-preview/'))return false;const url=new URL(req.url,origin),record=previews.get(url.pathname);if(!record)return false;res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:record.html);return true;}
 async function open(html){
  if(typeof html!=='string'||html.length>30e6||!html.includes('startCustomerOverlay')||html.includes('http://127.0.0.1:18777/events'))throw Error('Preview a customer export with direct controller input.');
  if(!isReady())throw Error('The local preview connection is unavailable. Retry the local connection, then try again.');
  const pathname='/customer-preview/'+crypto.randomUUID(),url=origin+pathname+'?setup=1';
  const child=new BrowserWindow({parent:parent(),width:1280,height:900,minWidth:380,minHeight:600,title:'Customer overlay preview',backgroundColor:'#111214',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,backgroundThrottling:false}});
  previews.set(pathname,{html,child});child.setMenuBarVisibility(false);child.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  child.webContents.on('will-navigate',(event,target)=>{try{const next=new URL(target);if(next.origin!==origin||next.pathname!==pathname)event.preventDefault();}catch{event.preventDefault();}});
  child.on('closed',()=>previews.delete(pathname));
  try{await child.loadURL(url);for(const [key,record]of previews)if(key!==pathname)record.child.close();return true;}catch{previews.delete(pathname);child.destroy();throw Error('The customer preview could not open. Your design is unchanged.');}
 }
 return {open,respond};
}
module.exports={createCustomerPreview};
