// Keep device lifecycle and page interruptions separate from the saved design.
const disconnectedDeviceKeys=new Set();
let inputFrameId=null,inputPaused=false,rendererLoading=false,lastInputTime=0;
function controllerPads(){
 try{const pads=navigator.getGamepads?Array.from(navigator.getGamepads()):[];deviceReadError=navigator.getGamepads?'':'Controller input is unavailable in this browser. Use the Windows app.';return pads;}
 catch{deviceReadError='Controller access is unavailable. Allow controller access in this browser, or reopen the Windows app.';return [];}
}
function forwardControllerInput(actual,time,force=false){
 if(!window.desktop?.input)return;
 const signature=JSON.stringify(actual);
 if(force||signature!==lastBridgeState||time-lastBridge>=250){
  try{window.desktop.input(actual);lastBridgeState=signature;}catch{/* A closing desktop bridge must not stop the preview. */}
  lastBridge=time;
 }
}
function renderInputFrame(time){
 if(inputPaused)return;
 const pad=updateControllerSetup(controllerPads()),actual=pad?readStandardGamepad(pad):{};
 const feedback=controllerFeedback(pad);if($('controllerStatus').textContent!==feedback)$('controllerStatus').textContent=feedback;
 forwardControllerInput(actual,time);syncStartConnection(pad);if(!startScreenOpen)observeProductionInput(pad,actual);lastInputTime=time;
 if(!rendererReady)return;
 let visible=mode==='live'?actual:input;
 if(mode==='demo'){const ls=(1+Math.sin(time/1100))/2,rs=(1+Math.cos(time/1300))/2;visible={axes:[Math.sin(time/700)*ls,Math.cos(time/700)*ls,Math.cos(time/900)*rs,Math.sin(time/900)*rs],LT:(1+Math.sin(time/700))/2,RT:(1+Math.cos(time/900))/2};visible[keys[Math.floor(time/500)%keys.length]]=true;}
 renderer.draw(previewProject(),visible,time,mode==='peak');syncComicPlacementFeedback();
}
function scheduleInputFrame(){
 if(inputPaused||inputFrameId!==null)return;
 inputFrameId=requestAnimationFrame(time=>{inputFrameId=null;renderInputFrame(time);scheduleInputFrame();});
}
let rendererAssetKey='';
function requestControllerRenderer(){
 if(!rendererLoading&&controllerRendererKey(previewProject())!==rendererAssetKey)loadOverlayRenderer();
}
async function loadOverlayRenderer(){
 if(rendererLoading)return;const snapshot={...previewProject()},requestedKey=controllerRendererKey(snapshot);
 rendererLoading=true;rendererReady=false;
 $('retryLoad').hidden=true;$('retryLoad').disabled=true;$('previewLoading').hidden=false;$('previewLoading').textContent='Loading controller artwork…';
 $('canvas').getContext('2d').clearRect(0,0,1672,1241);
 document.querySelector('main').setAttribute('aria-busy','true');syncProjectActions();status('Loading controller template…');
 try{
  const assets=await controllerAssetsFor(snapshot),next=await createOverlayRenderer($('canvas'),assets,FONT_DATA);
  if(controllerRendererKey(previewProject())!==requestedKey)return;
  renderer=next;rendererAssetKey=requestedKey;sync();
  let warning=startupNotice;
  try{await logoPending;}catch{warning='Saved artwork or texture could not load. Replace the image or open a valid project.';}
  rendererReady=true;syncComicGunfire();syncStickVisualization();createStartThumbnails();$('previewLoading').hidden=true;
  status('Ready. '+(warning||(startScreenOpen?'Choose a starting skin or continue your current job.':'Customize your job, then verify inputs and export.')),warning?'warning':'info');
  renderInputFrame(performance.now());scheduleInputFrame();
 }catch(error){
  rendererAssetKey='';$('previewLoading').textContent='Controller artwork could not load. Choose Retry loading.';$('retryLoad').hidden=false;
  status('Controller artwork could not load. Retry or choose another visual model.','error');
 }finally{rendererLoading=false;$('retryLoad').disabled=false;document.querySelector('main').setAttribute('aria-busy','false');syncProjectActions();if(controllerRendererKey(previewProject())!==requestedKey)requestControllerRenderer();}
}
function initializeInputLifecycle(){
 // Release the old page's state before waiting for assets or restored images.
 forwardControllerInput({},performance.now(),true);scheduleInputFrame();
 window.addEventListener('gamepaddisconnected',event=>{
  if(!event.gamepad)return;disconnectedDeviceKeys.add(gamepadKey(event.gamepad));renderInputFrame(performance.now());
 });
 window.addEventListener('gamepadconnected',event=>{
  if(!event.gamepad)return;disconnectedDeviceKeys.delete(gamepadKey(event.gamepad));renderInputFrame(performance.now());
 });
 window.addEventListener('pagehide',()=>{
  inputPaused=true;if(inputFrameId!==null)cancelAnimationFrame(inputFrameId);inputFrameId=null;
  forwardControllerInput({},performance.now(),true);
  if(rendererReady&&mode==='live')renderer.draw(project,{},lastInputTime);
 });
 window.addEventListener('pageshow',()=>{
  inputPaused=false;renderInputFrame(performance.now());scheduleInputFrame();
 });
}
