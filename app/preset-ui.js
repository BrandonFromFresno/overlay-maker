let presetFavorites=new Set(),presetsStarted=false;
try{const saved=JSON.parse(localStorage.getItem('overlay-preset-favorites')||'[]');if(Array.isArray(saved))presetFavorites=new Set(saved.filter(id=>PRESET_DATA.some(p=>p.id===id)));}catch{}
function syncPresetOrigin(){
 const preset=PRESET_DATA.find(p=>p.id===(project.presetOrigin||project.presetId));
 $('presetCurrent').textContent=preset?(project.presetId?'Current: ':'Customized: ')+preset.name:'Choose a theme to get started';
 $('restoreTheme').disabled=!preset;
}
function filterPresets(){
 const query=$('presetSearch').value.trim().toLowerCase(),favorites=$('presetFavoritesOnly').getAttribute('aria-pressed')==='true';let visible=0;
 document.querySelectorAll('[data-preset]').forEach(card=>{const preset=PRESET_DATA.find(p=>p.id===card.dataset.preset),show=(!favorites||presetFavorites.has(preset.id))&&[preset.name,preset.inspiration,preset.description].join(' ').toLowerCase().includes(query);card.closest('.preset-entry').hidden=!show;card.hidden=!show;if(show)visible++;});
 $('presetCount').textContent=visible+(visible===1?' theme':' themes');$('presetEmpty').hidden=visible>0;$('presetEmpty').textContent=favorites?'No matching favorites. Star a theme to save it here.':'No matching themes. Try Naruto, Dragon Ball or water.';
}
async function startPresetPreviews(){
 if(presetsStarted)return;presetsStarted=true;
 try{const canvas=document.createElement('canvas');canvas.width=1672;canvas.height=1241;const painter=await createOverlayRenderer(canvas,ASSET_DATA,FONT_DATA);
  for(const preset of PRESET_DATA){const p=buildPresetProject({...defaults,text:''},preset);painter.draw({...p,breathing:false,glow:3},{},1200,true);const target=document.querySelector('[data-preset="'+preset.id+'"] canvas');target?.getContext('2d').drawImage(canvas,0,0,280,210);await new Promise(resolve=>requestAnimationFrame(resolve));}
 }catch{status('Some theme previews could not load. Presets are still available.');}
}
function initializePresetUI(){
 for(const preset of PRESET_DATA){
  const entry=document.createElement('div');entry.className='preset-entry';
  const card=document.createElement('button');card.className='preset-card';card.dataset.preset=preset.id;card.setAttribute('aria-pressed','false');card.setAttribute('aria-label','Apply '+preset.name+' preset');
  const preview=document.createElement('canvas');preview.width=280;preview.height=210;preview.className='preset-preview';preview.setAttribute('aria-hidden','true');
  const swatches=document.createElement('span');swatches.className='preset-swatches';for(const color of [preset.baseColor,preset.buttonBaseColor,preset.accent,preset.pressed]){const swatch=document.createElement('i');swatch.style.backgroundColor=color;swatches.appendChild(swatch);}
  const title=document.createElement('strong');title.textContent=preset.name;const subtitle=document.createElement('small');subtitle.textContent=preset.inspiration;const detail=document.createElement('span');detail.className='preset-detail';detail.textContent=preset.description;
  card.append(preview,swatches,title,subtitle,detail);card.onclick=()=>applyAnimePreset(preset);
  const star=document.createElement('button');star.className='preset-favorite';star.textContent='★';star.setAttribute('aria-label','Favorite '+preset.name);star.setAttribute('aria-pressed',presetFavorites.has(preset.id));star.onclick=()=>{if(presetFavorites.has(preset.id))presetFavorites.delete(preset.id);else presetFavorites.add(preset.id);star.setAttribute('aria-pressed',presetFavorites.has(preset.id));try{localStorage.setItem('overlay-preset-favorites',JSON.stringify([...presetFavorites]));}catch{status('Favorites could not be saved on this device.');}filterPresets();};
  entry.append(card,star);$('presetGrid').appendChild(entry);
 }
 $('presetSearch').oninput=filterPresets;
 $('presetFavoritesOnly').onclick=()=>{const button=$('presetFavoritesOnly');button.setAttribute('aria-pressed',button.getAttribute('aria-pressed')!=='true');filterPresets();};
 $('editButtonArt').onclick=$('editTheme').onclick=openThemeEditor;
 $('previewThemeInputs').onclick=()=>{const next=mode==='demo'?'rest':'demo';clearInputPreview();setMode(next);};
 $('restoreTheme').onclick=()=>{const preset=PRESET_DATA.find(p=>p.id===(project.presetOrigin||project.presetId));if(!preset)return;checkpoint();project=validate(buildPresetProject(project,preset,{wordmark:false}));clearInputPreview();sync();persist();status(preset.name+' look restored. Your artwork, texture and controller position are preserved.');};
 $('removeTheme').onclick=()=>{checkpoint();Object.assign(project,{themeStyle:'none',buttonStyle:'none',homeStyle:'none',presetId:'',presetOrigin:''});sync();persist();status('Theme artwork removed. Your colors, texture, layout and effects are preserved.');};
}
