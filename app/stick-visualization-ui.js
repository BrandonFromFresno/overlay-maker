function validateStickVisualization(value,p){
 p.stickStyle=value.stickStyle??'tilt';p.stickTrailLength=value.stickTrailLength??'medium';p.stickTrailColor=value.stickTrailColor??STICK_DEFAULTS.stickTrailColor;
 if(!['tilt','both','trail'].includes(p.stickStyle))throw Error('Unknown stick style');
 if(!['short','medium','long'].includes(p.stickTrailLength))throw Error('Unknown stick trail length');
 if(typeof p.stickTrailColor!=='string'||!/^#[0-9a-f]{6}$/i.test(p.stickTrailColor))throw Error('Invalid stick trail color');
}
function syncStickVisualization(){
 const hasSticks=visualControlKeys(project).includes('LSB'),trail=hasSticks&&project.stickStyle!=='tilt';$('stickStyle').disabled=!hasSticks;$('resetSticks').disabled=!hasSticks;$('previewSticks').textContent=mode==='demo'?'Stop demo · live input':'Try input demo';$('previewSticks').setAttribute('aria-pressed',String(mode==='demo'));$('previewSticks').disabled=!rendererReady||!hasSticks;$('stickTrailOptions').hidden=!trail;
 for(const key of ['stickTrailLength','stickTrailColor'])$(key).disabled=!trail;
 for(const b of document.querySelectorAll('[data-stick-color]')){b.disabled=!hasSticks;b.setAttribute('aria-pressed',String(trail&&b.dataset.stickColor.toLowerCase()===project.stickTrailColor.toLowerCase()));}
 $('stickStyleNote').textContent=!hasSticks?'This template has no analog sticks. Physical stick inputs can still be checked.':project.stickStyle==='trail'?'The cap stays centered; the marker shows live position and the path fades behind it. Stick clicks still highlight.':project.stickStyle==='both'?'The cap follows live input while a fading path shows movement inside the fixed socket.':'Original cap movement. Sockets and rims stay fixed; no movement trail.';
 $('stickTrailStillNote').hidden=!trail||project.animationMode!=='still';
}
function initializeStickVisualization(){
 for(const b of document.querySelectorAll('[data-stick-color]'))b.onclick=()=>surfaceEdit({stickTrailColor:b.dataset.stickColor},'Stick trail color updated.');
 $('previewSticks').onclick=()=>toggleQuickDemo();
 $('resetSticks').onclick=()=>surfaceEdit({...STICK_DEFAULTS},'Original stick movement restored. Other artwork and effects are preserved.');
}
