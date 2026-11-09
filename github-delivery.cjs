'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function createGitHubDelivery({userData,safeStorage,fetch:fetchImpl=globalThis.fetch}){
 const configFile=path.join(userData,'delivery-connection.json'),recordsFile=path.join(userData,'delivery-records.json'),backups=path.join(userData,'delivery-backups');
 let connection=null,records=[],busy=false,restoreWarning='';
 const canEncrypt=()=>Boolean(safeStorage?.isEncryptionAvailable())&&!(process.platform==='linux'&&safeStorage.getSelectedStorageBackend?.()==='basic_text');
 function atomic(file,data){const temp=path.join(path.dirname(file),'.delivery-'+crypto.randomUUID()+'.tmp');try{fs.writeFileSync(temp,data,{flag:'wx'});fs.renameSync(temp,file);}finally{try{fs.rmSync(temp,{force:true});}catch{}}}
 try{if(fs.existsSync(configFile)){const saved=JSON.parse(fs.readFileSync(configFile,'utf8'));if(!canEncrypt())throw Error();connection={repository:saved.repository,hostBase:saved.hostBase?hostingBase(saved.hostBase):'',branch:saved.branch||'main',token:safeStorage.decryptString(Buffer.from(saved.secret,'base64'))};}}catch{restoreWarning='Reconnect GitHub to restore secure access. Saved deliveries are preserved.';}
 try{records=JSON.parse(fs.readFileSync(recordsFile,'utf8'));if(!Array.isArray(records))records=[];}catch{}
 const slug=name=>String(name||'overlay').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64)||'overlay';
 function repository(value){if(typeof value!=='string'||!value.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}\/[a-zA-Z0-9_.-]{1,100}$/)||value.endsWith('/.')||value.endsWith('/..'))throw Error('Use owner/repository, for example your-account/overlay-deliveries.');return value;}
 async function api(route,options={},auth=connection){
  if(!auth)throw Error('Connect your delivery repository first.');
  let response;try{response=await fetchImpl('https://api.github.com/repos/'+repository(auth.repository)+route,{...options,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:'Bearer '+auth.token,...options.headers},signal:AbortSignal.timeout(20000)});}catch{throw Error('GitHub could not be reached. Check your connection and retry.');}
  if(response.status===404&&options.allowMissing)return null;
  if(!response.ok)throw Error(response.status===401?'GitHub token was rejected. Reconnect with a valid token.':response.status===403?'GitHub denied access or reached a rate limit. Check repository Contents read/write permission.':response.status===404?'Repository not found. Check its name and token access.':`GitHub request failed (${response.status}). Retry without changing your project.`);
  return response.json();
 }
 function hostingBase(value){let url;try{url=new URL(value);}catch{throw Error('Enter the HTTPS hosting URL from your free Cloudflare Pages project.');}if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.hostname==='localhost'||url.hostname.endsWith('.localhost')||url.hostname.endsWith('.local')||/^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)||url.hostname.includes(':'))throw Error('Use a public HTTPS hosting URL without credentials, query or fragment.');return url.href.replace(/\/?$/,'/');}
 function publicRecord(record){const {id,name,url,path,createdAt,status,repository}=record;return {id,name,url,path,createdAt,status,repository};}
 function state(){return {connected:!!connection,repository:connection?.repository||'',hostBase:connection?.hostBase||'',warning:restoreWarning,busy,deliveries:records.map(publicRecord)};}
 async function connect(value){
  if(busy)throw Error('Wait for the current delivery to finish.');
  if(!canEncrypt())throw Error('Secure credential storage is unavailable. Connect from the Windows app; tokens are never stored as plain text.');
  const selectedRepository=repository(value?.repository?.trim()),host=value?.hostBase?.trim();
  const next={repository:selectedRepository,hostBase:host?hostingBase(host):'',token:value?.token?.trim()||(connection?.repository===selectedRepository?connection.token:'')};if(!next.token||next.token.length>1000)throw Error('Enter a repository-scoped GitHub token in the app.');
  const repo=await api('',{},next);next.branch=repo.default_branch||'main';const secret=safeStorage.encryptString(next.token).toString('base64');atomic(configFile,JSON.stringify({repository:next.repository,hostBase:next.hostBase,branch:next.branch,secret}));connection=next;restoreWarning='';
  if(next.hostBase){let changed=false;for(const record of records)if(record.repository===next.repository&&!record.url){record.url=new URL(record.path,next.hostBase).href;record.status='uploaded';changed=true;}if(changed)atomic(recordsFile,JSON.stringify(records));}
  return state();
 }
 async function disconnect(){if(busy)throw Error('Wait for the current delivery to finish.');fs.rmSync(configFile,{force:true});connection=null;restoreWarning='';return state();}
 async function publish({name,html,projectJSON}){
  if(busy)throw Error('A delivery is already uploading.');if(!connection)throw Error('Connect GitHub first.');
  if(typeof name!=='string'||name.length>80||typeof html!=='string'||html.length>30e6||!html.includes('startCustomerOverlay')||html.includes('http://127.0.0.1:18777/events'))throw Error('Export a customer overlay, not a studio bridge page.');
  if(Buffer.byteLength(html)>25*1024*1024)throw Error('The customer page exceeds the free host’s 25 MiB file limit. Reduce imported image sizes.');
  if(typeof projectJSON!=='string'||projectJSON.length>17e6||JSON.parse(projectJSON)?.version!==1)throw Error('A valid editable project backup is required.');
  busy=true;try{
   const site={branch:connection.branch,base:connection.hostBase},hash=crypto.createHash('sha256').update(html).digest('hex'),folder='overlays/'+slug(name)+'/'+hash.slice(0,16),file=folder+'/index.html',url=site.base?new URL(folder+'/index.html',site.base).href:'';
   const id=crypto.createHash('sha256').update(connection.repository+'|'+file).digest('hex');
   // Save the editable source before uploading. It is never placed in the public repository.
   fs.mkdirSync(backups,{recursive:true});atomic(path.join(backups,id+'.overlay'),projectJSON);
   const existing=await api('/contents/'+file+'?ref='+encodeURIComponent(site.branch),{allowMissing:true});
   const blobHash=crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+Buffer.byteLength(html)+'\0'),Buffer.from(html)])).digest('hex');
   if(existing&&existing.sha!==blobHash)throw Error('This delivery path already contains different content. Nothing was overwritten.');
   if(!existing)await api('/contents/'+file,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Add finished controller overlay '+slug(name),content:Buffer.from(html).toString('base64'),branch:site.branch})});
   const deliveryURL=records.find(record=>record.id===id)?.url||url;
   const record={id,name,url:deliveryURL,hash,path:file,repository:connection.repository,createdAt:new Date().toISOString(),status:deliveryURL?'uploaded':'stored'};records=[record,...records.filter(r=>r.id!==id)];atomic(recordsFile,JSON.stringify(records));return publicRecord(record);
  }finally{busy=false;}
 }
 async function check(id){if(typeof id!=='string'||!(/^[a-f0-9]{64}$/).test(id))throw Error('Delivery not found.');const record=records.find(r=>r.id===id);if(!record)throw Error('Delivery not found.');if(!record.url)return publicRecord(record);let response;const previous=record.status;record.status='uploaded';
  // Only probe URLs created by this module. Never forward a token to the public site.
  try{const url=new URL(record.url);if(url.protocol!=='https:'||url.username||url.password)throw Error();url.searchParams.set('delivery',record.hash.slice(0,16));response=await fetchImpl(url.href,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});if(response.ok&&/^text\/html\b/i.test(response.headers?.get('content-type')||'')){const html=await response.text();if(crypto.createHash('sha256').update(html).digest('hex')===record.hash){record.status='live';}}}catch{/* Pages deployment can take several minutes; leave the record pending. */}
  if(previous!==record.status)atomic(recordsFile,JSON.stringify(records));return publicRecord(record);
 }
 function openProject(id){if(typeof id!=='string'||!(/^[a-f0-9]{64}$/).test(id))throw Error('Delivery not found.');const record=records.find(r=>r.id===id);if(!record)throw Error('Delivery not found.');return fs.readFileSync(path.join(backups,id+'.overlay'),'utf8');}
 return {state,connect,disconnect,publish,check,openProject};
}
module.exports={createGitHubDelivery};
