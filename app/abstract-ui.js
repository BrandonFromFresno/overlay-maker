// Abstract shell controls share the editor's history, validation and saved project.
const ABSTRACT_DEFAULTS={abstractEnabled:false,abstractStyle:'silk',abstractComplexity:10,abstractSaturation:2.4,abstractDistortion:7,abstractMix:3,abstractTone:'light',abstractOpacity:.8,abstractUseAccent:true,abstractColor:'#62c9e7',abstractSeed:1,abstractZoom:1,abstractRotation:0,abstractAnimate:false,abstractSpeed:12,abstractPhase:0};
const ABSTRACT_RANGES={abstractComplexity:[2,30],abstractSaturation:[.1,6],abstractDistortion:[0,30],abstractMix:[0,15],abstractOpacity:[0,1],abstractSeed:[1,65535],abstractZoom:[.5,3],abstractRotation:[-180,180],abstractSpeed:[2,20],abstractPhase:[0,360]};
function validateAbstractSettings(value,p){
 for(const[key,[min,max]]of Object.entries(ABSTRACT_RANGES)){p[key]=value[key]??ABSTRACT_DEFAULTS[key];if(!Number.isFinite(p[key])||p[key]<min||p[key]>max||key==='abstractSeed'&&!Number.isInteger(p[key]))throw Error('Invalid '+key);}
 for(const key of ['abstractEnabled','abstractUseAccent','abstractAnimate']){p[key]=value[key]??ABSTRACT_DEFAULTS[key];if(typeof p[key]!=='boolean')throw Error('Invalid '+key);}
 for(const[key,values]of [['abstractStyle',ABSTRACT_DATA.map(s=>s.id)],['abstractTone',['light','dark']]]){p[key]=value[key]??ABSTRACT_DEFAULTS[key];if(!values.includes(p[key]))throw Error('Unknown '+key);}
 p.abstractColor=value.abstractColor??ABSTRACT_DEFAULTS.abstractColor;if(typeof p.abstractColor!=='string'||!/^#[0-9a-f]{6}$/i.test(p.abstractColor))throw Error('Invalid abstract color');
}
function abstractStyleValues(id){const style=ABSTRACT_DATA.find(s=>s.id===id);return {abstractStyle:id,abstractComplexity:style.complexity,abstractDistortion:style.distortion,abstractSaturation:style.saturation,abstractMix:style.mix,abstractTone:style.tone};}
function syncAbstractControls(){
 const active=project.abstractEnabled;
 for(const key of [...Object.keys(ABSTRACT_RANGES),'abstractStyle','abstractTone','abstractUseAccent','abstractColor','abstractAnimate','abstractVariation','freezeAbstract','resetAbstract'])$(key).disabled=!active;
 $('abstractColor').disabled=!active||project.abstractUseAccent;$('abstractSpeed').disabled=!active||!project.abstractAnimate||project.animationMode==='still';$('freezeAbstract').disabled=!active||!project.abstractOpacity||!project.abstractAnimate||project.animationMode==='still';
 for(const[key,text]of Object.entries({abstractComplexity:project.abstractComplexity.toFixed(1),abstractSaturation:project.abstractSaturation.toFixed(2)+'×',abstractDistortion:project.abstractDistortion.toFixed(1),abstractMix:project.abstractMix.toFixed(1),abstractOpacity:Math.round(project.abstractOpacity*100)+'%',abstractZoom:project.abstractZoom.toFixed(2)+'×',abstractRotation:project.abstractRotation+'°',abstractSpeed:project.abstractSpeed+'s',abstractPhase:Math.round(project.abstractPhase)+'°'}))$(key+'Value').textContent=text;
 $('abstractStatus').textContent=!active?'Off · Your shell is unchanged.':!project.abstractOpacity?'Hidden · Increase strength to see this layer.':project.animationMode==='still'&&project.abstractAnimate?'Still motion mode · Animation is paused.':project.abstractAnimate?'Animated · Freeze a frame to keep a still look.':'Static · Saved frame is included in exports.';
 $('abstractDescription').textContent=ABSTRACT_DATA.find(s=>s.id===project.abstractStyle).description;
}
function initializeAbstractUI(){
 for(const style of ABSTRACT_DATA){const option=document.createElement('option');option.value=style.id;option.textContent=style.name;$('abstractStyle').appendChild(option);}
 $('abstractVariation').onclick=()=>surfaceEdit({abstractSeed:project.abstractSeed%65535+1},'New abstract variation. Undo restores the previous one.');
 $('resetAbstract').onclick=()=>surfaceEdit({...ABSTRACT_DEFAULTS,abstractEnabled:true},'Abstract settings reset. Other layers are unchanged.');
 $('openAbstractSource').onclick=async()=>{try{if(window.desktop?.openAbstractSource)await window.desktop.openAbstractSource();else window.open('https://www.fffuel.co/aaabstract/','_blank','noopener,noreferrer');}catch{status('Open https://www.fffuel.co/aaabstract/ in your browser.','warning');}};
 $('freezeAbstract').onclick=()=>surfaceEdit({abstractAnimate:false,abstractPhase:renderer.abstractPhase()},'Abstract frame frozen. Live controller inputs still work.');
}
