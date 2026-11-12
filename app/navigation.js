// Task navigation only. Settings, artwork and input remain in their existing owners.
let toolReturnFocus=null,toolNavigating=false,toolResultsKey='';
const STUDIO_TASKS=[
 {id:'templates',name:'Choose a controller template',hint:'Select a visual model and skin.',words:'gamesir model device starting default template skin'},
 {id:'shell',name:'Change shell color or pattern',hint:'Open Shell and palette.',panel:'shell',target:'baseColor',words:'base housing paint checker camouflage'},
 {id:'buttons',name:'Customize button colors',hint:'Pick a button on the controller or in the list.',panel:'buttons',target:'buttonSelect',words:'a b x y dpad trigger bumper thumbstick home individual'},
 {id:'logo',name:'Add a customer logo',hint:'Open artwork import.',panel:'artwork',target:'upload',words:'brand image png jpeg upload artwork'},
 {id:'artwork',name:'Edit text and fonts',hint:'Open the wordmark and font controls.',panel:'artwork',target:'text',words:'name typeface typography text size italic'},
 {id:'presets',name:'Choose an anime preset',hint:'Browse themes and signature button artwork.',panel:'presets',target:'presetSearch',words:'dragon ball naruto sharingan rasengan theme'},
 {id:'demo',name:'Try the input demo',hint:'Simulated presses; no controller needed.',words:'animation preview simulate test play'},
 {id:'verify',name:'Verify physical controller inputs',hint:'Open the live input check without starting it.',words:'hardware connect testing press release stick diagonal'},
 {id:'customer',name:'Preview the customer experience',hint:'Open the customer setup page in a separate Windows review window.',words:'buyer checkout obs streamlabs setup delivery preview'},
 {id:'export',name:'Export and deliver an overlay',hint:'Customer URLs, HTML, PNG and studio OBS testing.',words:'save download upload github hosting handoff finish'},
 {id:'effects',name:'Adjust effects and button artwork',hint:'Open motion, glow and signature artwork.',panel:'effects',target:'effect',words:'animation particle fire smoke home rasengan swap'},
 {id:'layout',name:'Position the controller or artwork',hint:'Open movement and precise positioning controls.',panel:'layout',target:'moveController',words:'drag align center move x y layout'},
 {id:'holographic',name:'Add a holographic finish',hint:'Open liquid, chrome and foil finishes.',panel:'holographic',target:'holoEnabled',words:'iridescent holo shine'},
 {id:'textures',name:'Apply a shell texture',hint:'Open built-in finishes and your local image library.',panel:'textures',target:'textureBlend',words:'grain paint scratches texture import'},
 {id:'abstract',name:'Add abstract waves',hint:'Open flowing color folds.',panel:'abstract',target:'abstractEnabled',words:'fffuel wave abstract'},
 {id:'save',name:'Save an editable project',hint:'Save an .overlay backup of the current design.',words:'save project backup file customer job configuration'},
 {id:'open',name:'Open a saved project',hint:'Choose an editable .overlay or .json project.',words:'restore backup customer job file'}
];
function syncQuickDemo(){for(const id of ['startDemo','quickDemo']){const button=$(id);button.textContent=mode==='demo'?'Stop demo · use live input':'Try input demo';button.setAttribute('aria-pressed',String(mode==='demo'));button.disabled=!rendererReady||!!projectAction;}}
function toggleQuickDemo(){if(!rendererReady||projectAction)return;const next=mode==='demo'?'live':'demo';clearInputPreview();setMode(next);syncQuickDemo();status(next==='demo'?'Simulated input demo. Physical controller checks and OBS receive only real input.':'Live controller input selected. Connect a gamepad and press a button.');}
function taskDescription(task){const choice=startScreenOpen&&chosenStarter();return choice&&!['templates','demo','open'].includes(task.id)?'Use '+choice.name+', then '+task.hint.charAt(0).toLowerCase()+task.hint.slice(1):task.hint;}
function renderStudioTasks(){
 const query=$('toolSearch').value.trim().toLowerCase(),key=JSON.stringify([query,rendererReady,rendererLoading,projectAction,startScreenOpen,chosenStarter()?.name]);if(key===toolResultsKey)return;toolResultsKey=key;const terms=query.split(/\s+/).filter(Boolean).map(word=>word.length>3?word.replace(/s$/,''):word),matches=STUDIO_TASKS.filter(t=>{const text=(t.name+' '+t.hint+' '+t.words+(t.panel?' change edit customize':'')).toLowerCase();return terms.every(word=>text.includes(word));});$('toolResults').replaceChildren();
 for(const task of matches){const button=document.createElement('button');button.className='tool-result';button.dataset.task=task.id;button.disabled=!rendererReady||rendererLoading||!!projectAction;const title=document.createElement('strong'),hint=document.createElement('span');title.textContent=task.name;hint.textContent=taskDescription(task);button.append(title,hint);button.onclick=()=>runStudioTask(task);button.onkeydown=event=>{const all=Array.from($('toolResults').querySelectorAll('button:not(:disabled)')),i=all.indexOf(button);if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();all[(i+(event.key==='ArrowDown'?1:-1)+all.length)%all.length]?.focus();}};$('toolResults').appendChild(button);}
 $('toolEmpty').hidden=!!matches.length;$('toolCount').textContent=matches.length+' tools'+(!rendererReady?(rendererLoading?' · Available after artwork loads.':' · Retry loading or choose another visual model.'):'');
}
function openToolFinder(){if(document.querySelector('dialog[open]'))return;toolReturnFocus=document.activeElement;toolResultsKey='';$('toolSearch').value='';renderStudioTasks();$('toolDialog').showModal();$('toolSearch').focus();}
function runStudioTask(task){
 if(!rendererReady||rendererLoading||projectAction)return;toolNavigating=true;$('toolDialog').close();
 if(task.id==='templates'){if(!startScreenOpen)showStartScreen();$('visualModelChoice').focus();return;}
 if(task.id==='demo'){toggleQuickDemo();(startScreenOpen?$('startDemo'):$('quickDemo')).focus();return;}
 if(task.id==='open'){$('open').click();return;}
 if(startScreenOpen)$('startEditing').click();
 if(task.id==='save'){$('save').click();return;}
 if(task.panel){selectInspector(task.panel,true);const target=$(task.target),details=target.closest('details');if(details)details.open=true;target.focus();target.scrollIntoView({block:'nearest'});return;}
 if(task.id==='verify'){$('verifyWorkspace').click();return;}
 openExport();if(task.id==='customer'){if(!$('previewCustomer').disabled)$('previewCustomer').click();else if(customerFontIssue()){status(customerFontIssue(),'warning');$('chooseDeliveryFont').focus();}else{status(window.desktop?.previewCustomer?'Retry the local connection to open the customer preview. Customer HTML can still be saved.':'Customer preview is available in the Windows app. You can save the customer HTML here.','info');$('customerExport').focus();}}
}
function initializeNavigation(){
 $('findTool').onclick=openToolFinder;$('closeTools').onclick=()=>$('toolDialog').close();$('startDemo').onclick=toggleQuickDemo;$('quickDemo').onclick=toggleQuickDemo;
 $('toolSearch').oninput=renderStudioTasks;$('toolSearch').onkeydown=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();$('toolDialog').close();return;}if(event.key==='ArrowDown'){event.preventDefault();$('toolResults').querySelector('button:not(:disabled)')?.focus();}if(event.key==='Enter'){const found=$('toolResults').querySelectorAll('button:not(:disabled)');if(found.length===1){event.preventDefault();found[0].click();}}};
 document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'||event.key==='F1'){if(!document.querySelector('dialog[open]')){event.preventDefault();openToolFinder();}}});
 $('toolDialog').addEventListener('close',()=>{if(!toolNavigating&&!document.querySelector('dialog[open]'))(toolReturnFocus?.isConnected&&!toolReturnFocus.disabled?toolReturnFocus:$('findTool')).focus({preventScroll:true});toolNavigating=false;});
}
