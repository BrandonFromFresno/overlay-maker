// Serialized into customer pages: no editor, local bridge, credentials or external assets.
function startCustomerOverlay(){
 const canvas=document.querySelector('canvas'),updateSetup=createCustomerSetup(project,canvas);let ready=false,renderer=null,chosen='',frameId=null,paused=false,lastTime=0;const disconnected=new Set();
 const key=pad=>String(pad.index??0)+'|'+pad.id;
 function report(state,controller=''){if(window.overlayStatus?.state!==state||window.overlayStatus?.controller!==controller){window.overlayStatus=Object.freeze({state,controller});updateSetup(window.overlayStatus);}}
 function sample(){
  if(!navigator.getGamepads){report('input-unavailable');return {};}
  let pads;try{pads=Array.from(navigator.getGamepads()).filter(p=>p?.connected);}catch{report('input-blocked');return {};}
  for(const id of disconnected)if(!pads.some(p=>key(p)===id))disconnected.delete(id);pads=pads.filter(p=>!disconnected.has(key(p)));
  const supported=pads.filter(p=>p.mapping==='standard'),pad=supported.find(p=>key(p)===chosen)||supported[0];
  if(!pad){chosen='';report(pads.length?'unsupported-mode':'waiting-for-controller');return {};}
  chosen=key(pad);report('live',pad.id);return readStandardGamepad(pad);
 }
 function draw(time){lastTime=time;if(ready&&renderer)renderer.draw(project,sample(),time);}
 function schedule(){if(paused||!ready||!renderer||frameId!==null)return;frameId=requestAnimationFrame(time=>{frameId=null;draw(time);schedule();});}
 window.addEventListener('gamepaddisconnected',event=>{if(event.gamepad)disconnected.add(key(event.gamepad));if(!paused)draw(performance.now());});
 window.addEventListener('gamepadconnected',event=>{if(event.gamepad)disconnected.delete(key(event.gamepad));if(!paused)draw(performance.now());});
 window.addEventListener('pagehide',()=>{paused=true;if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;if(ready&&renderer)renderer.draw(project,{},lastTime);});
 window.addEventListener('pageshow',()=>{paused=false;if(ready&&renderer)draw(performance.now());schedule();});
 report('loading');createOverlayRenderer(canvas,assets,fontAssets).then(async value=>{renderer=value;await Promise.all([renderer.setLogo(project.mode==='logo'?project.logo:''),renderer.setTexture(project.textureId==='custom'?project.textureImage:'')]);ready=true;if(!paused)draw(performance.now());schedule();}).catch(()=>report('artwork-error'));
}
