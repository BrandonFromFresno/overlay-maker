// Editor interaction state only: artwork, rendering styles and gamepad mapping are unchanged.
let editElement=null,pendingCheckpoint=null,lastSyncedState=null,historyNavigation=false;
let rendererReady=false,projectAction='',publishedState=null,startupNotice='';
const panelScroll=new Map();let autosaveTimer=null,autosaveWarningShown=false;
function schedulePersist(){clearTimeout(autosaveTimer);autosaveTimer=setTimeout(()=>{autosaveTimer=null;persist();},300);}
let assetWarningState=null;
function watchArtworkLoad(promise){
 const source={logo:project.logo,texture:project.textureImage};
 const current=()=>project.logo===source.logo&&project.textureImage===source.texture;
 promise.then(()=>{if(current())assetWarningState=null;},()=>{
  if(!current())return;
  const repeated=assetWarningState?.logo===source.logo&&assetWarningState?.texture===source.texture;assetWarningState=source;
  if(rendererReady&&!repeated)status('Artwork or texture could not be decoded. Import another PNG or JPEG.','warning');
 });
}
function projectState(value){return {...value,buttonColors:JSON.stringify(value.buttonColors)};}
function sameState(a,b){if(!a||!b)return false;const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(key=>a[key]===b[key]);}
function checkpoint(){
 editElement=null;const snapshot=JSON.stringify(project),pushed=history.at(-1)!==snapshot;
 if(pushed)history.push(snapshot);pendingCheckpoint={snapshot,state:projectState(project),pushed};
}
function recordEdit(element){
 const discrete=element?.tagName==='SELECT'||element?.type==='checkbox';
 if(discrete||editElement!==element){checkpoint();editElement=discrete?null:element;}
}
function syncEditorState(){
 const state=projectState(project);
 if(pendingCheckpoint?.pushed&&sameState(pendingCheckpoint.state,state)&&history.at(-1)===pendingCheckpoint.snapshot)history.pop();
 pendingCheckpoint=null;if(lastSyncedState&&!sameState(lastSyncedState,state)&&!historyNavigation)future=[];
 lastSyncedState=state;if(history.length>50)history.splice(0,history.length-50);
 const target=inspectorPanel==='buttons'?'Select a button':moveTarget==='artwork'?'Drag artwork':'Drag controller';$('canvasTarget').textContent=target;$('centerController').disabled=project.offsetX===0&&project.offsetY===0;
 syncProjectActions();
}
function navigateHistory(redo=false){
 const from=redo?future:history,to=redo?history:future;if(!from.length||projectAction)return;
 editElement=null;pendingCheckpoint=null;to.push(JSON.stringify(project));project=JSON.parse(from.pop());historyNavigation=true;
 try{sync();persist();}finally{historyNavigation=false;}status(redo?'Change restored.':'Last change undone.');
}
function syncProjectActions(){
 const unavailable=!rendererReady||!!projectAction;document.querySelector('main').inert=unavailable;$('name').disabled=unavailable||startScreenOpen;
 for(const id of ['open','save','exportMenu','html','png','upload','importTextures','customerExport','uploadCustomer','connectGitHub','openDelivery'])$(id).disabled=unavailable;
 if(startScreenOpen)for(const id of ['save','exportMenu','html','png','upload','importTextures'])$(id).disabled=true;
 $('returnToEditor').disabled=unavailable;syncStartScreen();
 $('publish').disabled=unavailable||startScreenOpen||!bridgeUsable();
 $('copy').disabled=!!projectAction||!bridgeUsable()||!$('obsUrl').value.startsWith('http');
 $('publicationStatus').dataset.kind=bridgeSetup.phase==='error'||publishedState&&!sameState(publishedState,projectState(project))?'warning':'info';
 syncProduction();const publicationMessage=setupPublicationMessage();if($('publicationStatus').textContent!==publicationMessage)$('publicationStatus').textContent=publicationMessage;syncSetupState();
 if(projectAction!=='publish'){const label=publishedState?'Update OBS overlay':'Send design to OBS';if($('publish').textContent!==label)$('publish').textContent=label;}
 $('publish').title=window.desktop?.publish?'Send the current design to the local OBS URL':'Available in the Windows desktop app';
}
async function runProjectAction(id,label,action){
 if(projectAction||!rendererReady)return;projectAction=id;editElement=null;
 const button=$(id),original=button.textContent,focused=document.activeElement===button;
 button.textContent=label;button.setAttribute('aria-busy','true');document.querySelector('main').inert=true;syncProjectActions();status(label);
 try{await action();}catch(error){status('Could not '+({save:'save the project',open:'open the project',upload:'import the logo',html:'export HTML',png:'export PNG',publish:'update OBS',importTextures:'import textures',customerExport:'export the customer overlay',uploadCustomer:'upload the customer overlay',connectGitHub:'connect GitHub',openDelivery:'open the delivery project'}[id]||'complete the action')+': '+(error.message||'Please try again.'),'error');}
 finally{projectAction='';button.textContent=original;button.removeAttribute('aria-busy');document.querySelector('main').inert=false;syncProjectActions();if(focused&&!button.disabled)button.focus({preventScroll:true});}
}
function syncManualPreview(){
 for(const key of ['lt','rt']){const value=Number(input[key.toUpperCase()]||0);$(key).value=value;$(key+'Value').textContent=Math.round(value*100)+'%';}
 document.querySelectorAll('#buttons button').forEach(button=>button.setAttribute('aria-pressed',!!input[button.dataset.key]));
}
function openThemeEditor(){
 selectInspector('effects');const section=$('themeSummary').closest('.theme-section');
 $('inspector').scrollTop+=section.getBoundingClientRect().top-$('inspector').getBoundingClientRect().top-16;
 $('buttonStyle').focus({preventScroll:true});
}
function controllerFeedback(pad){
 if(mode==='live'){
  if(pad)return 'Live · '+pad.id.slice(0,42);if(deviceReadError)return 'Controller access unavailable';
  const selected=latestGamepads.filter(p=>selectedDeviceKey==='auto'||gamepadKey(p)===selectedDeviceKey);
  if(selected.length)return 'Unsupported controller mode';
  return selectedDeviceKey==='auto'?'Waiting for controller':'Selected controller disconnected';
 }
 const label=mode==='demo'?'Animated demo · simulated input':mode==='peak'?'Peak glow preview':Object.values(input).some(value=>value===true||typeof value==='number'&&value>0)?'Manual input preview':'Rest preview';
 return label+(pad?' · controller connected':'');
}
function initializeEditorUX(){
 $('save').title='Save project (Ctrl+S)';$('open').title='Open project (Ctrl+O)';$('undo').title='Undo (Ctrl+Z)';$('redo').title='Redo (Ctrl+Shift+Z or Ctrl+Y)';
 document.addEventListener('keydown',event=>{
  if(!(event.ctrlKey||event.metaKey)||event.altKey||document.querySelector('dialog[open]'))return;
  const key=event.key.toLowerCase(),field=event.target.closest('input,textarea,[contenteditable=true]'),editing=field&&(field.tagName==='TEXTAREA'||field.isContentEditable||['text','search','number','email','url','password','tel'].includes(field.type));
  if(key==='s'||key==='o'){event.preventDefault();if(!projectAction)$(key==='s'?'save':'open').click();}
  else if(!startScreenOpen&&!editing&&(key==='z'||key==='y')){event.preventDefault();navigateHistory(key==='y'||event.shiftKey);}
 });
 for(const key of fields){$(key).addEventListener('blur',()=>{editElement=null;if($(key).type==='number'&&(!$(key).value||$(key).validity.badInput))$(key).value=project[key];});}
 const flushEdits=()=>{if(drag)finishDrag();if(autosaveTimer)persist();};
 window.addEventListener('beforeunload',flushEdits);window.addEventListener('pagehide',flushEdits);
}
