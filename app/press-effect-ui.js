function validatePressEffects(value,p){
 for(const [key,choices]of Object.entries({pressEffectStyle:['rings','sparks','shockwave','halo'],triggerEffect:['none','glow','ripples','arcs','jet'],pressEffectInputs:['triggers','sticks','all'],pressEffectColorMode:['accent','pressed','custom']})){p[key]=value[key]??PRESS_EFFECT_DEFAULTS[key];if(!choices.includes(p[key]))throw Error('Unknown '+key);}
 p.pressEffectColor=value.pressEffectColor??PRESS_EFFECT_DEFAULTS.pressEffectColor;if(typeof p.pressEffectColor!=='string'||!/^#[0-9a-f]{6}$/i.test(p.pressEffectColor))throw Error('Invalid press effect color');
 for(const [key,[min,max]]of Object.entries(PRESS_EFFECT_RANGES)){p[key]=value[key]??PRESS_EFFECT_DEFAULTS[key];if(!Number.isFinite(p[key])||p[key]<min||p[key]>max)throw Error('Invalid '+key);}
}
function syncPressEffects(){
 const active=project.inputBurst||project.triggerEffect!=='none';$('pressEffectStatus').textContent=active?(project.animationMode==='still'?'Paused':'On'):'Off';$('editPressColors').hidden=project.pressEffectColorMode!=='pressed';$('pressEffectColor').closest('label').hidden=project.pressEffectColorMode!=='custom';$('pressEffectInputs').disabled=project.triggerEffect==='none';$('pressEffectStyle').disabled=!project.inputBurst;$('pressEffectDuration').disabled=!project.inputBurst;
 for(const key of ['pressEffectColorMode','pressEffectIntensity','pressEffectSize'])$(key).disabled=!active;$('pressEffectColor').disabled=!active||project.pressEffectColorMode!=='custom';
 $('pressEffectDurationValue').textContent=project.pressEffectDuration+' ms';$('pressEffectSizeValue').textContent=project.pressEffectSize.toFixed(2)+'×';$('pressEffectIntensityValue').textContent=Math.round(project.pressEffectIntensity*100)+'%';
 $('pressEffectMotionNote').hidden=project.animationMode!=='still';$('previewPressEffects').disabled=!active||project.animationMode==='still';$('previewPressEffects').textContent=mode==='demo'?'Stop effect demo':'Try effect demo';$('previewPressEffects').setAttribute('aria-pressed',String(mode==='demo'));
}
function initializePressEffects(){
 $('previewPressEffects').onclick=()=>{toggleQuickDemo();syncPressEffects();};$('editPressColors').onclick=()=>{selectInspector('buttons',true);$('buttonSelect').focus();};
 $('editPressEffects').onclick=()=>{selectInspector('effects',true);$('pressEffects').open=true;$('pressEffects').scrollIntoView({block:'start'});$('inputBurst').focus();};
 $('resetPressEffects').onclick=()=>surfaceEdit({...PRESS_EFFECT_DEFAULTS,inputBurst:false},'Press effects reset. Other artwork and effects are preserved.');
}
