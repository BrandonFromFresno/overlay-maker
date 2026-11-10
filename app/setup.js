// Setup preferences are separate from saved overlay designs.
let selectedDeviceKey='auto',latestGamepads=[],latestController=null,deviceListKey='',deviceReadError='',bridgeCheckPending=false;
let bridgeSetup={phase:'unknown',url:'',hasOverlay:false,clients:0,error:''},bridgePolling=null;
function gamepadKey(pad){return String(pad.index??0)+'|'+pad.id;}
function bridgeUsable(){return !!window.desktop?.publish&&(!window.desktop?.getSetupState||bridgeSetup.phase==='ready');}
function updateControllerSetup(pads){
 latestGamepads=pads.filter(p=>p?.connected);
 for(const key of disconnectedDeviceKeys)if(!latestGamepads.some(p=>gamepadKey(p)===key))disconnectedDeviceKeys.delete(key);
 latestGamepads=latestGamepads.filter(p=>!disconnectedDeviceKeys.has(gamepadKey(p)));
 const signature=JSON.stringify(latestGamepads.map(p=>[gamepadKey(p),p.mapping]));
 if(signature!==deviceListKey){
  deviceListKey=signature;const select=$('controllerDevice');select.replaceChildren();
  const auto=document.createElement('option');auto.value='auto';auto.textContent='Auto — first compatible controller';select.appendChild(auto);
  for(const pad of latestGamepads){const option=document.createElement('option');option.value=gamepadKey(pad);option.textContent='Controller '+((pad.index??0)+1)+' · '+pad.id+(pad.mapping==='standard'?'':' — switch to PC / XInput mode');option.disabled=pad.mapping!=='standard';select.appendChild(option);}
  if(selectedDeviceKey!=='auto'&&!latestGamepads.some(p=>gamepadKey(p)===selectedDeviceKey)){const missing=document.createElement('option');missing.value=selectedDeviceKey;missing.textContent='Selected controller disconnected';select.appendChild(missing);}
  select.value=selectedDeviceKey;
 }
 latestController=selectedDeviceKey==='auto'?(latestGamepads.find(p=>p.mapping==='standard'&&gamepadKey(p)===gamepadKey(latestController||{}))||latestGamepads.find(p=>p.mapping==='standard')):latestGamepads.find(p=>gamepadKey(p)===selectedDeviceKey&&p.mapping==='standard');
 const selected=latestGamepads.find(p=>gamepadKey(p)===selectedDeviceKey);
 const hint=deviceReadError?deviceReadError:latestController?'Connected. Live input is ready.':selectedDeviceKey!=='auto'?(selected?'Selected controller uses an unsupported mode. Switch it to PC / XInput mode.':'Selected controller is disconnected. Reconnect it or choose a connected controller.'):latestGamepads.length?'Controller detected in an unsupported mode. Switch it to PC / XInput mode.':'Connect your controller, focus this window, then press any button.';
 if($('connectionHint').textContent!==hint)$('connectionHint').textContent=hint;
 $('connectionHint').dataset.kind=latestController?'success':'info';return latestController;
}
async function refreshSetupState(){
 if(bridgeCheckPending||!window.desktop?.getSetupState)return;bridgeCheckPending=true;
 try{const next=await window.desktop.getSetupState();if(!next||!['ready','starting','error'].includes(next.phase))throw Error('Invalid setup response');bridgeSetup=next;if(next.phase==='ready'&&next.hasOverlay&&next.url&&!$('obsUrl').value.startsWith('http'))$('obsUrl').value=next.url;syncProjectActions();}
 catch{bridgeSetup={...bridgeSetup,phase:'error',error:'Could not check the local OBS connection. Try again.'};syncProjectActions();}
 finally{bridgeCheckPending=false;syncSetupState();}
}
function setupPublicationMessage(){
 if(!window.desktop?.publish)return 'OBS setup is available in the Windows app. HTML and PNG exports work here.';
 if(window.desktop.getSetupState&&bridgeSetup.phase!=='ready')return bridgeSetup.phase==='error'?bridgeSetup.error||'Local OBS connection unavailable. Close other copies of Overlay Studio and retry.':'Starting the local OBS connection…';
 if(publishedState&&!sameState(publishedState,projectState(project)))return 'Design changed. Send it to OBS again, then refresh the Browser Source.';
 if(publishedState)return bridgeSetup.clients>0?'Overlay page connected. Check that it appears in OBS.':'Current design sent. Add the Browser Source below, or refresh your existing source.';
 if(bridgeSetup.warning)return bridgeSetup.warning;
 return bridgeSetup.hasOverlay?'A previous overlay is available. Send this design to update it.':'Send this design, then copy the URL into an OBS Browser Source.';
}
function syncSetupState(){
 const problem=!!window.desktop?.getSetupState&&bridgeSetup.phase==='error';$('retryBridge').hidden=!problem;
 $('retryBridge').disabled=!!projectAction||bridgeCheckPending||!window.desktop?.retryBridge;
 const connectionText=!window.desktop?.publish?'Windows app required for live OBS input':!bridgeUsable()?'Local connection unavailable':bridgeSetup.clients>0?'Overlay page connected':'Waiting for the Browser Source';if($('overlayConnection').textContent!==connectionText)$('overlayConnection').textContent=connectionText;
}
function openExport(guide=false){$('obsSetup').open=guide;$('exportDialog').showModal();const target=guide?($('publish').disabled?$('closeExport'):$('publish')):!$('uploadCustomer').disabled?$('uploadCustomer'):!$('customerExport').disabled?$('customerExport'):$('chooseDeliveryFont');target.focus();}
function initializeSetup(){
 try{const preference=localStorage.getItem('overlay-setup-guide');$('setupGuide').open=['open','closed'].includes(preference)?preference==='open':false;}catch{$('setupGuide').open=false;}
 $('setupGuide').addEventListener('toggle',()=>{try{localStorage.setItem('overlay-setup-guide',$('setupGuide').open?'open':'closed');}catch{}});
 $('dismissSetup').onclick=()=>$('setupGuide').open=false;
 const openOBS=()=>openExport(true);
 $('setupOBS').onclick=openOBS;
 try{const saved=localStorage.getItem('overlay-input-device');if(saved==='auto'||/^\d+\|.{1,2048}$/.test(saved||''))selectedDeviceKey=saved;}catch{}
 $('controllerDevice').onchange=()=>{selectedDeviceKey=$('controllerDevice').value;latestController=null;try{localStorage.setItem('overlay-input-device',selectedDeviceKey);}catch{}clearInputPreview();setMode('live');renderInputFrame(performance.now());};
 $('retryBridge').onclick=async()=>{if(projectAction||bridgeCheckPending)return;bridgeCheckPending=true;bridgeSetup={...bridgeSetup,phase:'starting'};syncProjectActions();$('retryBridge').disabled=true;$('retryBridge').setAttribute('aria-busy','true');try{bridgeSetup=await window.desktop.retryBridge();syncProjectActions();status(bridgeSetup.phase==='ready'?'Local OBS connection ready. You can send your design.':bridgeSetup.error||'Connection unavailable. Close other copies and retry.',bridgeSetup.phase==='ready'?'success':'warning');}catch(error){status('Could not retry the OBS connection: '+error.message,'error');}finally{bridgeCheckPending=false;$('retryBridge').removeAttribute('aria-busy');syncProjectActions();}};
 refreshSetupState();bridgePolling=setInterval(refreshSetupState,1000);window.addEventListener('pagehide',()=>{clearInterval(bridgePolling);bridgePolling=null;});window.addEventListener('pageshow',()=>{refreshSetupState();if(!bridgePolling)bridgePolling=setInterval(refreshSetupState,1000);});
}
