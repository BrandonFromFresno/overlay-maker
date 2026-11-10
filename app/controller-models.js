// A visual template never identifies or restricts the physical input device.
const CONTROLLER_PACKS=Object.create(null),controllerPackLoads=new Map();
const DEFAULT_VISUAL_MODEL='G7ProCE';
const MODEL_EXTRA_KEYS=['L4','R4','L5','R5','C1','C2','C3','C4','T1','T2','T3'];
function visualModelOf(p){return p.visualModel||DEFAULT_VISUAL_MODEL;}
function controllerDefinition(id){return CONTROLLER_CATALOG.find(m=>m.id===id);}
function controllerVariant(model,id){return controllerDefinition(model)?.variants.find(v=>v.id===id);}
function controllerLabel(p){return controllerDefinition(visualModelOf(p))?.name||'Controller overlay';}
function controllerAppearanceKey(p){return visualModelOf(p)+'/'+p.nativeSkin;}
function controllerRendererKey(p){const model=visualModelOf(p);return model===DEFAULT_VISUAL_MODEL?model:model+'/'+p.nativeSkin;}
function controllerSkinRecord(p){if(!p.nativeSkin)return null;return visualModelOf(p)===DEFAULT_VISUAL_MODEL?GAME_SIR_SKINS[p.nativeSkin]:CONTROLLER_PACKS[visualModelOf(p)]?.[p.nativeSkin];}
async function loadControllerPack(id){
 if(id===DEFAULT_VISUAL_MODEL||CONTROLLER_PACKS[id])return;
 if(!controllerDefinition(id))throw Error('Unknown visual model');
 if(controllerPackLoads.has(id))return controllerPackLoads.get(id);
 const promise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='controller-data/'+encodeURIComponent(id)+'.js';script.onload=()=>{if(CONTROLLER_PACKS[id])resolve();else{script.remove();reject(Error('Controller artwork package is incomplete.'));}};script.onerror=()=>{script.remove();reject(Error('Controller artwork could not load. Retry loading.'));};document.head.appendChild(script);});
 controllerPackLoads.set(id,promise);try{await promise;}catch(error){controllerPackLoads.delete(id);throw error;}
}
async function controllerAssetsFor(p){
 const model=visualModelOf(p);await loadControllerPack(model);
 if(model===DEFAULT_VISUAL_MODEL)return{...ASSET_DATA,skins:GAME_SIR_SKINS};
 const skin=controllerSkinRecord(p);if(!skin)throw Error('Selected controller artwork is unavailable.');
 return{...ASSET_DATA,skins:{[p.nativeSkin]:skin}};
}
function visualControlKeys(p){
 if(visualModelOf(p)===DEFAULT_VISUAL_MODEL)return colorKeys;
 return controllerVariant(visualModelOf(p),p.nativeSkin)?.controls||colorKeys;
}
let controllerPickerKey='';
function syncControllerControls(){
 const model=visualModelOf(project),definition=controllerDefinition(model),available=visualControlKeys(project),key=controllerAppearanceKey(project);
 $('visualModelName').textContent=definition.name;$('currentModelBadge').textContent=definition.name.replace(/^GameSir /,'').toUpperCase();
 $('nativeSkinNote').hidden=!project.nativeSkin;$('nativeSkinNote').textContent=project.nativeSkin?definition.name+' · '+(controllerVariant(model,project.nativeSkin)?.name||project.nativeSkin)+' · White restores the original artwork colors.':'';
 $('defaultOverlayHint').textContent='Restore this visual model’s default appearance. Your job name stays; Undo restores the design.';
 $('modelInputNote').textContent='The visual model is independent of your input device. Any browser-standard gamepad can drive it.';
 $('original').textContent=project.nativeSkin?'Use original template artwork':'Load Cudi reference';$('originalArtworkHint').textContent=project.nativeSkin?'Show this template without your text or logo. Your artwork stays available.':'An example from the original project. Your text and imported logo stay available.';
 $('homeStyle').disabled=!available.includes('Home');
 $('modelControlNote').hidden=available.includes('Home');$('modelControlNote').textContent=!available.includes('Home')?'This layout has no Home button artwork. Home input can still be observed during the physical input check.':'';
 if(controllerPickerKey===key)return;controllerPickerKey=key;
 const selected=$('buttonSelect').value;$('buttonSelect').replaceChildren();
 for(const button of available){const option=document.createElement('option');option.value=button;option.textContent=model===DEFAULT_VISUAL_MODEL?(buttonNames[button]||button):({A:'Bottom face button',B:'Right face button',X:'Left face button',Y:'Top face button'}[button]||buttonNames[button]||(MODEL_EXTRA_KEYS.includes(button)?button+' (preview only)':button));$('buttonSelect').appendChild(option);}
 if(available.includes(selected))$('buttonSelect').value=selected;
 for(const button of document.querySelectorAll('#buttons button')){button.hidden=!available.includes(button.dataset.key);const k=button.dataset.key;if(['A','B','X','Y'].includes(k))button.textContent=model===DEFAULT_VISUAL_MODEL?k:({A:'Bottom face',B:'Right face',X:'Left face',Y:'Top face'}[k]);}
 for(const extra of MODEL_EXTRA_KEYS)if(available.includes(extra)&&!document.querySelector('#buttons button[data-key="'+extra+'"]')){const button=document.createElement('button');button.dataset.key=extra;button.textContent=extra;button.setAttribute('aria-label','Preview '+extra);button.setAttribute('aria-pressed','false');button.onclick=()=>{input[extra]=!input[extra];syncManualPreview();setMode('rest');};$('buttons').appendChild(button);}
 syncButtonColors();
 queueMicrotask(()=>{if(inspectorPanel==='presets')startPresetPreviews();if($('effectCatalog').open)$('effectCatalog').dispatchEvent(new Event('toggle'));});
}
