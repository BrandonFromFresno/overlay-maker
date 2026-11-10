// Visual layout selection is isolated from the saved job and the physical input device.
let selectedVisualModel=DEFAULT_VISUAL_MODEL;
function starterTemplates(model){return controllerDefinition(model).variants.map(v=>({id:v.id,name:v.name,description:controllerDefinition(model).name+' · '+v.name+' artwork. Any compatible input device can drive this layout.',nativeSkin:v.id,visualModel:model,thumbnail:v.thumbnail||GAME_SIR_SKINS[v.id]?.thumbnail,baseColor:'#ffffff',buttonBaseColor:'#ffffff',accent:'#df1d34'}));}
let STARTER_TEMPLATES=starterTemplates(DEFAULT_VISUAL_MODEL);
let startScreenOpen=true,startScreenInitialized=false,selectedStarter='Gold',starterPreview=null,startThumbnailsReady=false;
function defaultOverlayProject(model=DEFAULT_VISUAL_MODEL){return {...defaults,visualModel:model,nativeSkin:model===DEFAULT_VISUAL_MODEL?'':controllerDefinition(model).defaultVariant,buttonColors:{},text:'',breathing:false,glow:0};}
function starterProject(id,model=visualModelOf(project)){
 const preset=starterTemplates(model).find(v=>v.id===id);if(!preset)throw Error('Unknown starting overlay');
 return {...defaults,visualModel:model,baseColor:preset.baseColor,buttonBaseColor:preset.buttonBaseColor,accent:preset.accent,pressed:model===DEFAULT_VISUAL_MODEL?(GAME_SIR_SKINS[id].testing.HighlightColor||'#e84950'):'#e84950',nativeSkin:id,buttonColors:{},text:'',breathing:false,glow:0};
}
function previewProject(){return startScreenOpen&&starterPreview?starterPreview:project;}
function chosenStarter(){return selectedStarter==='default'?{id:'default',name:'Default overlay',description:'The default '+controllerDefinition(selectedVisualModel).name+' appearance, ready to customize.'}:STARTER_TEMPLATES.find(v=>v.id===selectedStarter);}
function chooseStarter(id){
 if(id!=='default'&&!STARTER_TEMPLATES.some(v=>v.id===id))return;
 selectedStarter=id;
 const base=id==='default'?defaultOverlayProject(selectedVisualModel):starterProject(id,selectedVisualModel);
 starterPreview=id!=='default'&&$('keepTemplateStyle').checked?{...project,visualModel:selectedVisualModel,nativeSkin:base.nativeSkin}:base;
 requestControllerRenderer();syncStartScreen();if(rendererReady)renderInputFrame(performance.now());
}
function syncStartScreen(){
 if(!startScreenInitialized)return;const busy=!rendererReady||!!projectAction,choice=chosenStarter(),model=controllerDefinition(selectedVisualModel);
 $('visualModelChoice').value=selectedVisualModel;$('visualModelChoice').disabled=rendererLoading||!!projectAction;$('keepTemplateStyle').disabled=rendererLoading||!!projectAction;
 $('defaultStarter').disabled=busy;$('defaultStarter').setAttribute('aria-pressed',String(selectedStarter==='default'));$('startEditing').disabled=busy;
 $('continueEditing').disabled=rendererLoading||!!projectAction;$('openStartProject').disabled=busy;
 document.querySelectorAll('[data-starter]').forEach(button=>{button.disabled=busy;button.setAttribute('aria-pressed',button.dataset.starter===selectedStarter);});
 $('startLoading').hidden=rendererReady;$('startPreview').setAttribute('aria-busy',String(!rendererReady));$('startLoading').textContent=rendererLoading?'Loading controller artwork…':'Preview unavailable. Retry loading or choose another visual model.';
 $('startTitle').textContent=choice?.name||project.name||'Current job';$('startDescription').textContent=choice?.description||'Your current design is ready to continue. Previewing a layout keeps it unchanged until you apply it.';
 $('startEditing').textContent=choice?'Use '+choice.name:'Continue current job';$('continueEditing').hidden=!choice;$('continueEditing').textContent=project.name?'Continue '+project.name:'Edit current design';
 $('returnToEditor').textContent='Templates';$('returnToEditor').setAttribute('aria-pressed',String(startScreenOpen));
 if(startScreenOpen)$('currentModelBadge').textContent=model.name.replace(/^GameSir /,'').toUpperCase();
 $('startingModelContext').textContent=model.name.toUpperCase()+' · VISUAL TEMPLATE';
}
function syncStartConnection(pad){if(!startScreenInitialized||!startScreenOpen)return;const text=pad?'Connected · '+pad.id:deviceReadError?'Controller access unavailable':'Connect any compatible gamepad and press a button for live preview.';if($('startConnection').textContent!==text)$('startConnection').textContent=text;$('startConnection').dataset.connected=String(!!pad);}
function openEditorFromStart(){
 if(!startScreenInitialized)return;startScreenOpen=false;document.body.dataset.view='editor';$('startView').hidden=true;document.querySelector('main').hidden=false;
 $('preview').prepend($('canvas'));$('canvas').tabIndex=0;$('canvas').setAttribute('aria-label','Controller overlay preview. Drag to move the selected target, or use arrow keys to nudge. Hold Shift for 10 pixel steps.');
 requestControllerRenderer();syncProjectActions();if($('status').textContent==='Ready. Choose a starting skin or continue your current job.')status('Ready. Customize your job, then verify inputs and export.');if(rendererReady)renderInputFrame(performance.now());$('returnToEditor').focus({preventScroll:true});
}
function showStartScreen(){
 if(rendererLoading||projectAction)return;startScreenOpen=true;document.body.dataset.view='start';selectedVisualModel=visualModelOf(project);selectedStarter='current';starterPreview=null;buildStarterChoices();
 document.querySelector('main').hidden=true;$('startView').hidden=false;$('startPreview').prepend($('canvas'));$('canvas').tabIndex=-1;$('canvas').setAttribute('aria-label','Selected starting overlay preview');
 clearInputPreview();setMode('live');requestControllerRenderer();syncProjectActions();syncStartScreen();if(rendererReady)renderInputFrame(performance.now());$('startEditing').focus({preventScroll:true});
}
function createStartThumbnails(){
 if(!startScreenInitialized||startThumbnailsReady)return;startThumbnailsReady=true;
 for(const preset of STARTER_TEMPLATES){const image=document.querySelector('[data-starter="'+preset.id+'"] img');image.src=preset.thumbnail;image.hidden=false;}
}
function buildStarterChoices(){
 STARTER_TEMPLATES=starterTemplates(selectedVisualModel);$('starterChoices').replaceChildren();startThumbnailsReady=false;
 for(const preset of STARTER_TEMPLATES){const card=document.createElement('button');card.className='starter-card';card.dataset.starter=preset.id;card.setAttribute('aria-pressed','false');const image=document.createElement('img');image.alt='';image.hidden=true;const text=document.createElement('span');text.textContent=preset.name;card.append(image,text);card.onclick=()=>chooseStarter(preset.id);$('starterChoices').append(card);}
 createStartThumbnails();filterStarterSkins();
}
function initializeStartScreen(){
 startScreenInitialized=true;document.body.dataset.view='start';selectedVisualModel=visualModelOf(project);selectedStarter=restoredProject?'current':'Gold';starterPreview=restoredProject?null:starterProject('Gold',DEFAULT_VISUAL_MODEL);
 for(const model of CONTROLLER_CATALOG){const option=document.createElement('option');option.value=model.id;option.textContent=model.name;$('visualModelChoice').appendChild(option);}
 $('keepTemplateStyle').checked=restoredProject;
 $('visualModelChoice').onchange=()=>{selectedVisualModel=$('visualModelChoice').value;$('skinSearch').value='';buildStarterChoices();chooseStarter(controllerDefinition(selectedVisualModel).defaultVariant);};
 $('keepTemplateStyle').onchange=()=>{if(selectedStarter!=='current')chooseStarter(selectedStarter);};
 buildStarterChoices();
 $('startEditing').onclick=()=>{if(!rendererReady||projectAction)return;const choice=chosenStarter();if(choice){checkpoint();project=validate({...starterPreview,name:project.name});moveTarget='controller';clearInputPreview();setMode('live');sync();persist();}openEditorFromStart();if(choice)status(choice.name+' loaded. The input device is independent of the visual layout.');};
 $('continueEditing').onclick=openEditorFromStart;$('defaultStarter').onclick=()=>chooseStarter('default');$('openStartProject').onclick=()=>$('open').click();$('returnToEditor').onclick=showStartScreen;
 $('skinSearch').oninput=filterStarterSkins;$('clearSkinSearch').onclick=()=>{$('skinSearch').value='';filterStarterSkins();$('skinSearch').focus();};$('skinSearch').onkeydown=event=>{if(event.key==='Escape'&&event.target.value){event.preventDefault();event.stopPropagation();$('clearSkinSearch').click();}};
 document.querySelector('main').hidden=true;$('startPreview').prepend($('canvas'));$('canvas').tabIndex=-1;$('canvas').setAttribute('aria-label','Selected starting overlay preview');syncStartScreen();
}
function filterStarterSkins(){const query=$('skinSearch').value.trim().toLowerCase();let count=0;for(const preset of STARTER_TEMPLATES){const button=document.querySelector('[data-starter="'+preset.id+'"]');button.hidden=!((preset.name+' '+preset.nativeSkin).toLowerCase().includes(query));if(!button.hidden)count++;}$('skinCount').textContent=count+' / '+STARTER_TEMPLATES.length+' skins';$('skinEmpty').hidden=count>0;}
