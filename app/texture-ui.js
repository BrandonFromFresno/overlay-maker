let personalTextures=[];
function syncTextureControls(){
 $('textureOpacityValue').textContent=Math.round((project.textureOpacity??.3)*100)+'%';$('textureScaleValue').textContent=(project.textureScale||1).toFixed(2)+'×';$('textureRotationValue').textContent=(project.textureRotation||0)+'°';
 const active=project.textureId!=='none';for(const id of ['textureOpacity','textureScale','textureRotation','textureBlend','textureMonochrome','textureInvert','removeTexture'])$(id).disabled=!active;
 $('shuffleTexture').disabled=!active||project.textureId==='custom';
 $('textureCurrent').textContent=project.textureId==='custom'?(project.textureName||'Imported texture'):TEXTURE_DATA.find(t=>t.id===project.textureId)?.name||'No texture';
 document.querySelectorAll('[data-texture]').forEach(card=>card.setAttribute('aria-pressed',card.dataset.texture===project.textureId));
 document.querySelectorAll('[data-personal-texture]').forEach(card=>{const record=personalTextures.find(r=>r.id===card.dataset.personalTexture);card.setAttribute('aria-pressed',project.textureId==='custom'&&project.textureImage===record?.source);});
}
function applyTexture(values){if(Object.entries(values).every(([key,value])=>project[key]===value))return;checkpoint();Object.assign(project,values,{presetId:''});sync();persist();}
function importedTextureSettings(){const rgb=[1,3,5].map(i=>parseInt(project.baseColor.slice(i,i+2),16)),light=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>160;return {textureBlend:light?'multiply':'screen',textureInvert:light,textureOpacity:.45};}
function renderPersonalTextures(){
 $('personalTextures').replaceChildren();$('personalTexturesEmpty').hidden=personalTextures.length>0;
 for(const record of personalTextures){
  const row=document.createElement('div');row.className='personal-texture';const card=document.createElement('button');card.dataset.personalTexture=record.id;card.setAttribute('aria-label','Apply texture '+record.name);
  const image=new Image();image.loading='lazy';image.decoding='async';image.src=record.source;image.alt='';const name=document.createElement('span');name.textContent=record.name;card.append(image,name);card.onclick=()=>applyTexture({textureId:'custom',textureImage:record.source,textureName:record.name,...importedTextureSettings()});
  const remove=document.createElement('button');remove.className='texture-delete';remove.textContent='Remove from library';remove.setAttribute('aria-label','Remove '+record.name+' from library');remove.onclick=async()=>{remove.disabled=true;remove.setAttribute('aria-busy','true');try{await textureLibrary.remove(record.id);personalTextures=personalTextures.filter(t=>t.id!==record.id);renderPersonalTextures();syncTextureControls();status('Removed from the local library. Any texture used by your open design is preserved.');}catch{status('The texture could not be removed from storage.');}finally{remove.disabled=false;remove.removeAttribute('aria-busy');}};
  row.append(card,remove);$('personalTextures').appendChild(row);
 }
 syncTextureControls();
}
async function importTextureFile(file){
 if(!['image/jpeg','image/png'].includes(file.type)||file.size>25e6)throw Error('Choose JPG or PNG textures under 25 MB each.');
 const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
 const image=new Image();image.src=src;await image.decode();if(image.naturalWidth*image.naturalHeight>64e6)throw Error('Use an image with 64 megapixels or fewer.');
 const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(image.naturalWidth*scale));c.height=Math.max(1,Math.round(image.naturalHeight*scale));const g=c.getContext('2d');g.drawImage(image,0,0,c.width,c.height);
 const source=c.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',.88);if(source.length>4e6)throw Error('Texture is too detailed. Resize the image and try again.');return {id:crypto.randomUUID(),name:file.name.replace(/\.[^.]+$/,'').slice(0,80),source};
}
function initializeTextureUI(){
 const c=document.createElement('canvas'),painter=createTexturePainter(c.getContext('2d'),null);
 for(const texture of TEXTURE_DATA){const card=document.createElement('button');card.className='texture-card';card.dataset.texture=texture.id;card.setAttribute('aria-label','Apply '+texture.name+' texture');card.setAttribute('aria-pressed','false');const preview=document.createElement('canvas');preview.width=128;preview.height=84;preview.setAttribute('aria-hidden','true');const g=preview.getContext('2d');g.fillStyle='#55555e';g.fillRect(0,0,128,84);if(texture.id!=='none')g.drawImage(painter.thumbnail(texture.id,1),0,0,128,84);const name=document.createElement('strong');name.textContent=texture.name;const detail=document.createElement('small');detail.textContent=texture.description;card.append(preview,name,detail);card.onclick=()=>applyTexture({textureId:texture.id,textureImage:'',textureName:'',textureBlend:'multiply',textureOpacity:.3,textureInvert:false});$('textureGrid').appendChild(card);}
 $('importTextures').onclick=()=>$('textureFiles').click();
 $('textureFiles').onchange=async event=>{
  const selected=Array.from(event.target.files),files=selected.slice(0,20);if(!files.length)return;
  try{await runProjectAction('importTextures','Importing textures…',async()=>{let imported=0,saved=0,first=null,failures=[];
   for(const [index,file] of files.entries()){status('Importing texture '+(index+1)+' of '+files.length+'…');try{const record=await importTextureFile(file);first??=record;imported++;try{await textureLibrary.put(record);saved++;personalTextures.push(record);}catch{failures.push('Local storage is unavailable; save the project to keep the selected image.');}}catch(error){failures.push(file.name+': '+error.message);}}
   if(first){applyTexture({textureId:'custom',textureImage:first.source,textureName:first.name,...importedTextureSettings()});await logoPending;}renderPersonalTextures();
   const skipped=selected.length-files.length,message=imported+' of '+files.length+' textures imported; '+saved+' saved locally. '+(failures.length?failures[0]:first?'First texture applied.':'No texture applied.')+(skipped?' '+skipped+' extra files were not processed; import them in another batch.':'');
   status(message,failures.length||skipped?'warning':'success');
  });}finally{event.target.value='';}
 };
 $('shuffleTexture').onclick=()=>applyTexture({textureSeed:project.textureSeed%65535+1});
 $('removeTexture').onclick=()=>applyTexture({textureId:'none',textureImage:'',textureName:''});
 $('openTextureSource').onclick=async()=>{try{if(window.desktop?.openTextureSource)await window.desktop.openTextureSource();else window.open('https://www.fffuel.co/tttexture/','_blank','noopener,noreferrer');}catch{status('Open https://www.fffuel.co/tttexture/ in your browser to download images.');}};
 $('personalTexturesEmpty').textContent='Loading your saved textures…';textureLibrary.list().then(records=>{personalTextures=records;$('personalTexturesEmpty').textContent='Your imported textures will appear here. They stay available offline.';renderPersonalTextures();}).catch(()=>{$('personalTexturesEmpty').textContent='Local library storage is unavailable. Imported textures still save with your project.';});
}
