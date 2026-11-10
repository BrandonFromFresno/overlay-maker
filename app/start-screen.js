// UI-only starting overlays. Real editor artwork and input behavior are shared with the preview.
const STARTER_TEMPLATES=Object.entries(GAME_SIR_SKINS).map(([nativeSkin,record])=>({id:nativeSkin,name:record.name,description:'GameSir G7 Pro 8K · '+record.name+' skin. Ready to customize.',nativeSkin,baseColor:'#ffffff',buttonBaseColor:'#ffffff',accent:'#df1d34'}));
let startScreenOpen=true,startScreenInitialized=false,selectedStarter='Gold',starterPreview=null,startThumbnailsReady=false;
function starterProject(id){const preset=STARTER_TEMPLATES.find(item=>item.id===id);if(!preset)throw Error('Unknown starting overlay');return {...defaults,...{baseColor:preset.baseColor,buttonBaseColor:preset.buttonBaseColor,accent:preset.accent,pressed:GAME_SIR_SKINS[preset.nativeSkin].testing.HighlightColor||'#e84950',nativeSkin:preset.nativeSkin},buttonColors:{},text:'',breathing:false,glow:0};}
function previewProject(){return startScreenOpen&&starterPreview?starterPreview:project;}
function chooseStarter(id){
 if(!STARTER_TEMPLATES.some(item=>item.id===id))return;selectedStarter=id;starterPreview=starterProject(id);syncStartScreen();
 if(rendererReady)renderInputFrame(performance.now());
}
function syncStartScreen(){
 if(!startScreenInitialized)return;
 const busy=!rendererReady||!!projectAction;
 $('startEditing').disabled=busy;$('continueEditing').disabled=busy;$('openStartProject').disabled=busy;
 document.querySelectorAll('[data-starter]').forEach(button=>{button.disabled=busy;button.setAttribute('aria-pressed',button.dataset.starter===selectedStarter);});
 $('startLoading').hidden=rendererReady;$('startPreview').setAttribute('aria-busy',String(!rendererReady));
 $('startLoading').textContent=rendererLoading?'Loading controller artwork…':'Preview unavailable. Use Retry loading above.';
 const choice=STARTER_TEMPLATES.find(item=>item.id===selectedStarter);
 $('startTitle').textContent=choice?.name||project.name||'Current job';
 $('startDescription').textContent=choice?.description||'Your current design is ready to continue. Choosing another starting overlay leaves it untouched until you start editing.';
 $('startEditing').textContent=choice?'Use '+choice.name:'Continue current job';
 $('continueEditing').hidden=!choice;
 $('continueEditing').textContent=project.name?'Continue '+project.name:'Edit current design';
 $('returnToEditor').textContent='Templates';$('returnToEditor').setAttribute('aria-pressed',String(startScreenOpen));
}
function syncStartConnection(pad){if(!startScreenInitialized||!startScreenOpen)return;const text=pad?'Connected · '+pad.id:deviceReadError?'Controller access unavailable':'Connect your controller and press a button for live preview.';if($('startConnection').textContent!==text)$('startConnection').textContent=text;$('startConnection').dataset.connected=String(!!pad);}
function openEditorFromStart(){
 if(!startScreenInitialized)return;startScreenOpen=false;document.body.dataset.view='editor';$('startView').hidden=true;document.querySelector('main').hidden=false;
 $('preview').prepend($('canvas'));$('canvas').tabIndex=0;$('canvas').setAttribute('aria-label','Controller overlay preview. Drag to move the selected target, or use arrow keys to nudge. Hold Shift for 10 pixel steps.');
 syncProjectActions();if($('status').textContent==='Ready. Choose a starting skin or continue your current job.')status('Ready. Customize your job, then verify inputs and export.');if(rendererReady)renderInputFrame(performance.now());$('returnToEditor').focus({preventScroll:true});
}
function showStartScreen(){
 if(!rendererReady||projectAction)return;startScreenOpen=true;document.body.dataset.view='start';selectedStarter='current';starterPreview=null;
 document.querySelector('main').hidden=true;$('startView').hidden=false;$('startPreview').prepend($('canvas'));$('canvas').tabIndex=-1;$('canvas').setAttribute('aria-label','Selected starting overlay preview');
 clearInputPreview();setMode('live');syncProjectActions();syncStartScreen();renderInputFrame(performance.now());$('startEditing').focus({preventScroll:true});
}
function createStartThumbnails(){
 if(!rendererReady||startThumbnailsReady)return;startThumbnailsReady=true;
 // GameSir supplied complete cover images; keep thumbnails independent of the editable canvas.
 for(const preset of STARTER_TEMPLATES){const image=document.querySelector('[data-starter="'+preset.id+'"] img');image.src=GAME_SIR_SKINS[preset.id].thumbnail;image.hidden=false;}
}
function initializeStartScreen(){
 startScreenInitialized=true;document.body.dataset.view='start';selectedStarter=restoredProject?'current':'Gold';starterPreview=restoredProject?null:starterProject('Gold');
 for(const preset of STARTER_TEMPLATES){const card=document.createElement('button');card.className='starter-card';card.dataset.starter=preset.id;card.setAttribute('aria-pressed','false');const image=document.createElement('img');image.alt='';image.hidden=true;const text=document.createElement('span');text.textContent=preset.name;card.append(image,text);card.onclick=()=>chooseStarter(preset.id);$('starterChoices').append(card);}
 $('startEditing').onclick=()=>{if(!rendererReady||projectAction)return;const choice=STARTER_TEMPLATES.find(item=>item.id===selectedStarter);if(choice){checkpoint();project=validate(starterProject(choice.id));moveTarget='controller';clearInputPreview();setMode('live');sync();persist();}openEditorFromStart();if(choice)status(choice.name+' loaded. Name your customer job and customize it.');};
 $('continueEditing').onclick=openEditorFromStart;
 $('openStartProject').onclick=()=>$('open').click();$('returnToEditor').onclick=showStartScreen;
 $('skinSearch').oninput=filterStarterSkins;$('clearSkinSearch').onclick=()=>{$('skinSearch').value='';filterStarterSkins();$('skinSearch').focus();};$('skinSearch').onkeydown=event=>{if(event.key==='Escape'&&event.target.value){event.preventDefault();event.stopPropagation();$('clearSkinSearch').click();}};
 document.querySelector('main').hidden=true;$('startPreview').prepend($('canvas'));$('canvas').tabIndex=-1;$('canvas').setAttribute('aria-label','Selected starting overlay preview');syncStartScreen();
}

function filterStarterSkins(){const query=$('skinSearch').value.trim().toLowerCase();let count=0;for(const preset of STARTER_TEMPLATES){const button=document.querySelector('[data-starter="'+preset.id+'"]');button.hidden=!((preset.name+' '+preset.nativeSkin).toLowerCase().includes(query));if(!button.hidden)count++;}$('skinCount').textContent=count+' / '+STARTER_TEMPLATES.length+' skins';$('skinEmpty').hidden=count>0;}
