function validateComicGunfire(value,p){
 for(const key of ['comicEnabled','comicRepeat']){p[key]=value[key]??COMIC_DEFAULTS[key];if(typeof p[key]!=='boolean')throw Error('Invalid '+key);}
 p.comicSelection=value.comicSelection??'random';if(!['random','bang','zap','boom','pow'].includes(p.comicSelection))throw Error('Unknown comic word');
 for(const [key,[min,max]]of Object.entries(COMIC_RANGES)){p[key]=value[key]??COMIC_DEFAULTS[key];if(!Number.isFinite(p[key])||p[key]<min||p[key]>max||key==='comicMaxActive'&&!Number.isInteger(p[key]))throw Error('Invalid '+key);}
}
function syncComicGunfire(){
 const active=project.comicEnabled,still=project.animationMode==='still';$('comicStatus').textContent=active?(still?'Paused':'On'):'Off';
 for(const key of Object.keys(COMIC_DEFAULTS))if(key!=='comicEnabled')$(key).disabled=!active;
 $('comicInterval').disabled=!active||!project.comicRepeat;
 for(const [key,value]of Object.entries({comicSize:project.comicSize.toFixed(2)+'×',comicDuration:project.comicDuration+' ms',comicX:project.comicX+' px',comicY:project.comicY+' px',comicIntensity:Math.round(project.comicIntensity*100)+'%',comicRotation:project.comicRotation+'°',comicThreshold:Math.round(project.comicThreshold*100)+'%',comicInterval:project.comicInterval+' ms',comicMaxActive:project.comicMaxActive}))$(key+'Value').textContent=value;
 $('comicFitNote').hidden=!active;$('previewComic').disabled=!active||still||!rendererReady;$('comicMotionNote').hidden=!still;
}
function initializeComicGunfire(){
 let releaseTimer;
 $('previewComic').onclick=()=>{
  clearTimeout(releaseTimer);clearInputPreview();renderer.draw(project,{},performance.now());input={RT:1};syncManualPreview();
  status('Simulated right-trigger '+(project.comicRepeat?'hold':'press')+'. Select Live controller when finished.');
  const current=input;releaseTimer=setTimeout(()=>{if(input===current&&input.RT===1){delete input.RT;syncManualPreview();}},project.comicRepeat?1100:140);
 };
 $('rt').addEventListener('input',()=>clearTimeout(releaseTimer));
 $('resetComic').onclick=()=>surfaceEdit({...COMIC_DEFAULTS},'Comic Gunfire FX reset and turned off. Other effects and artwork are preserved.');
}

function syncComicPlacementFeedback(){
 if(!project.comicEnabled||!$('comicGunfire').open)return;
 const fit=renderer.comicState().placement,note=fit?(fit.autoFit<.99?'Auto-fit: '+Math.round(fit.autoFit*100)+'% of requested size to keep inputs and source edges clear.':'Fits at the requested size. Position stays clear of artwork and inputs.'):'No clear space at this position. Move the controller to restore comic bursts.';
 if($('comicFitNote').textContent!==note)$('comicFitNote').textContent=note;
}
