async function createOverlayRenderer(canvas, assets, fontAssets = {}) {
 await Promise.all(Object.entries(fontAssets).map(async([family,record])=>{
  const alias='OSL '+family;
  const existing=Array.from(document.fonts).find(face=>face.family.replaceAll('"','')===alias);
  if(existing&&existing.status!=='error'){await existing.loaded;return;}
  if(existing)document.fonts.delete(existing);
  const face=new FontFace(alias,`url("${record.source}")`,{weight:record.weight});
  document.fonts.add(face);await face.load();
 }));
 const images = {};
 await Promise.all(Object.entries(assets).filter(([,src])=>typeof src==='string').map(async ([key, src]) => {
  const image = new Image(); image.src = src; await image.decode();
  // Rasterize hot SVG layers once at their native export resolution. Repeated
  // SVG filters and embedded-image decoding must not sit on the input frame path.
  if(src.startsWith('data:image/svg+xml')&&['base','trim','ambient','clearance','leftStick','rightStick','lt','rt'].includes(key)){
   const svg=new DOMParser().parseFromString(atob(src.split(',')[1]),'image/svg+xml').documentElement,box=(svg.getAttribute('viewBox')||'0 0 '+image.width+' '+image.height).trim().split(/[ ,]+/).map(Number),raster=document.createElement('canvas');raster.width=Math.round(box[2]);raster.height=Math.round(box[3]);raster.getContext('2d').drawImage(image,0,0,raster.width,raster.height);images[key]=raster;
  }else images[key]=image;
 }));
 const legacyImages={...images},skinRecords=assets.skins||{},skinImages={};
 await Promise.all(Object.entries(skinRecords).map(async([id,record])=>{const image=new Image();image.src=record.cover;await image.decode();skinImages[id]=image;}));
 const ctx = canvas.getContext('2d');
 const layer = document.createElement('canvas'); layer.width = 1672; layer.height = 941;
 const lc = layer.getContext('2d');
 const emission=document.createElement('canvas'),artwork=document.createElement('canvas'),artEmission=document.createElement('canvas');
 for(const c of [emission,artwork,artEmission]){c.width=1672;c.height=941;}
 const ec=emission.getContext('2d'),ac=artwork.getContext('2d'),ae=artEmission.getContext('2d');let emissionKey='',artworkKey='',artEmissionKey='';
 const triggerLayer=document.createElement('canvas');triggerLayer.width=185;triggerLayer.height=200;const tc=triggerLayer.getContext('2d');
 const faceKeys = ['A','B','X','Y','Home','Share','Options','Capture','M','LB','RB','DPad_Up','DPad_Down','DPad_Left','DPad_Right'];
 const faces = {};
 // Draw faces and symbols synchronously: color changes never race image decoding.
 for (const key of faceKeys) {
  const svg = new DOMParser().parseFromString(atob(assets[key].split(',')[1]), 'image/svg+xml');
  const shape = svg.querySelector('clipPath > *');
  const path = new Path2D();
  if (shape.tagName === 'circle') {
   path.arc(+shape.getAttribute('cx'), +shape.getAttribute('cy'), +shape.getAttribute('r') - (key === 'Home' ? 2 : 0), 0, Math.PI * 2);
  } else path.addPath(new Path2D(shape.getAttribute('d')));
  const group = svg.querySelector('g[transform]');
  const center = group.getAttribute('transform').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/).slice(1).map(Number);
  faces[key] = {path, center, radius: shape.tagName==='circle'?+shape.getAttribute('r'):50, symbols: Array.from(group.children).map(node => ({
   tag: node.tagName, path: node.tagName === 'path' ? new Path2D(node.getAttribute('d')) : null,
   text: node.textContent, size: +(node.getAttribute('font-size') || 24),
   fill: node.getAttribute('fill') !== 'none', stroke: node.hasAttribute('stroke'), width: +(node.getAttribute('stroke-width') || 3)
  }))};
 }
 // Match each bumper to the actual visible shoulder, including the upper lip.
 // Its top edge follows the shell alpha; the lower edge follows the shell seam.
 const outlineCanvas=document.createElement('canvas');outlineCanvas.width=1672;outlineCanvas.height=941;
 const outlineContext=outlineCanvas.getContext('2d',{willReadFrequently:true});outlineContext.drawImage(images.base,0,0,1672,941);
 const alpha=outlineContext.getImageData(0,0,1672,180).data;
 for(const [key,start,end] of [['LB',310,640],['RB',1032,1362]]){
  const path=new Path2D();let started=false;
  for(let x=start;x<=end;x++){
   let y=0;while(y<180&&alpha[(y*1672+x)*4+3]<128)y++;
   if(y===180)continue;
   if(!started){path.moveTo(x,y);started=true;}else path.lineTo(x,y);
  }
  if(key==='LB'){path.lineTo(640,49);path.quadraticCurveTo(440,45,310,121);}
  else{path.lineTo(1362,121);path.quadraticCurveTo(1232,45,1032,49);}
  path.closePath();faces[key].path=path;
 }
 const legacyFaces={...faces};let activeSkinId='',activeSkin=null;
 let stickLayout=[[456,290,'leftStick','LSB',0,86,125],[1033,523,'rightStick','RSB',2,86,125]],dpadCircle=[634.34,529.42,124];
 let logo = null, logoSrc = '', tintColor = '', lastActive = -Infinity;
 let logoRequest=0,logoLoadingSrc=null,logoLoading=null;
 const tinted = {}, capCache = new Map(), shoulderCache = new Map();
 function tint(image, color, width, height) {
  const c = document.createElement('canvas'); c.width = width; c.height = height;
  const g = c.getContext('2d'); g.drawImage(image, 0, 0, width, height);
  if (color !== '#ffffff') {
   g.globalCompositeOperation = 'multiply'; g.fillStyle = color; g.fillRect(0, 0, width, height);
   g.globalCompositeOperation = 'destination-in'; g.drawImage(image, 0, 0, width, height);
  }
  g.globalCompositeOperation='source-over';return c;
 }
 // One protection mask keeps the physical controls out of shell tint, patterns and FX.
 const controlMask=document.createElement('canvas');controlMask.width=1672;controlMask.height=941;
 const cm=controlMask.getContext('2d');cm.fillStyle='#fff';cm.strokeStyle='#fff';cm.lineWidth=7;
 for(const key of faceKeys){cm.fill(faces[key].path);cm.stroke(faces[key].path);}
 for(const [x,y,r] of [[833.28,209.7,65],[634.34,529.42,124],[456,290,125],[1033,523,125]]){cm.beginPath();cm.arc(x,y,r,0,Math.PI*2);cm.fill();}
 const shellMask=document.createElement('canvas');shellMask.width=1672;shellMask.height=941;
 const sm=shellMask.getContext('2d');sm.drawImage(images.base,0,0,1672,941);sm.globalCompositeOperation='destination-out';sm.drawImage(controlMask,0,0);sm.globalCompositeOperation='source-over';
 const themePainter=createThemePainter(ctx,faces,shellMask),texturePainter=createTexturePainter(ctx,shellMask),surfacePainter=createSurfacePainter(ctx,shellMask),holoPainter=createHolographicPainter(ctx,shellMask);

 // Native skin art is fitted uniformly into the existing body layer. The supplied
 // SVG control paths and placement data use GameSir's 1000×720 reference space.
 function shapePath(shape){const a=shape.attrs,p=new Path2D();if(shape.tag==='path')return new Path2D(a.d);if(shape.tag==='circle')p.arc(+a.cx,+a.cy,+a.r,0,Math.PI*2);else if(shape.tag==='ellipse')p.ellipse(+a.cx,+a.cy,+a.rx,+a.ry,0,0,Math.PI*2);else if(shape.tag==='rect')p.rect(+a.x||0,+a.y||0,+a.width,+a.height);else{const points=a.points.trim().split(/[ ,]+/).map(Number);for(let i=0;i<points.length;i+=2)i?p.lineTo(points[i],points[i+1]):p.moveTo(points[i],points[i+1]);if(shape.tag==='polygon')p.closePath();}return p;}
 function rebuildMasks(){
  shellMask.dataset.skin=activeSkinId;
  cm.clearRect(0,0,1672,941);for(const key of faceKeys){cm.fill(faces[key].path);cm.stroke(faces[key].path);}
  const circles=activeSkin?[...stickLayout.map(([x,y,,,,,r])=>[x,y,r]),dpadCircle,[...faces.Home.center,Math.max(faces.Home.radius+3,faces.Home.protectedRadius||0)]]:[[833.28,209.7,65],[634.34,529.42,124],[456,290,125],[1033,523,125]];
  for(const[x,y,r]of circles){cm.beginPath();cm.arc(x,y,r,0,Math.PI*2);cm.fill();}
  sm.clearRect(0,0,1672,941);sm.drawImage(images.base,0,0,1672,941);sm.globalCompositeOperation='destination-out';sm.drawImage(controlMask,0,0);sm.globalCompositeOperation='source-over';
 }
 function activateSkin(id){
  if(id===activeSkinId)return;if(id&&!skinRecords[id])throw Error('Controller skin is unavailable');
  activeSkinId=id;activeSkin=skinRecords[id]||null;Object.assign(images,legacyImages);for(const key of Object.keys(faces))delete faces[key];Object.assign(faces,legacyFaces);
  stickLayout=[[456,290,'leftStick','LSB',0,86,125],[1033,523,'rightStick','RSB',2,86,125]];dpadCircle=[634.34,529.42,124];
  if(activeSkin){
   const image=skinImages[id],height=480*(activeSkin.height||image.height)/(activeSkin.width||image.width),scale=941/height,left=(1672-480*scale)/2,top=100+(480-height)/2;
   const bodyMatrix=new DOMMatrix([scale,0,0,scale,left-260*scale,-top*scale]),point=(x,y)=>[left+(x-260)*scale,(y-top)*scale];
   const base=document.createElement('canvas');base.width=1672;base.height=941;const bg=base.getContext('2d',{willReadFrequently:true});bg.drawImage(image,left,0,480*scale,941);
   stickLayout=['L3','R3'].map((name,i)=>{const config=activeSkin.testing[name],[x,y]=point(config.X+35,config.Y+35),r=31*scale,cap=document.createElement('canvas');cap.width=cap.height=180;cap.getContext('2d').drawImage(base,x-r,y-r,r*2,r*2,0,0,180,180);images[i?'rightStick':'leftStick']=cap;
    const pixel=bg.getImageData(Math.round(x+33*scale),Math.round(y),1,1).data;bg.fillStyle=`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;bg.beginPath();bg.arc(x,y,30.5*scale,0,Math.PI*2);bg.fill();return[x,y,i?'rightStick':'leftStick',i?'RSB':'LSB',i*2,r,35*scale];});images.base=base;
   const records=activeSkin.controls.map(record=>{const path=new Path2D();path.addPath(shapePath(record),bodyMatrix.multiply(new DOMMatrix(record.matrix)));const[x,y,w,h]=record.bounds,[bx,by]=point(x,y);return{...record,path,bounds:[bx,by,w*scale,h*scale]};});
   for(const key of faceKeys.filter(key=>!key.startsWith('DPad_'))){const source=records.filter(record=>record.kind==='face'&&(record.key==='Screenshot'?'Capture':record.key)===key),path=new Path2D();source.forEach(record=>path.addPath(record.path));const x=Math.min(...source.map(r=>r.bounds[0])),y=Math.min(...source.map(r=>r.bounds[1])),right=Math.max(...source.map(r=>r.bounds[0]+r.bounds[2])),bottom=Math.max(...source.map(r=>r.bounds[1]+r.bounds[3]));
    if(!source.length)throw Error('Skin is missing '+key);faces[key]={path,center:[(x+right)/2,(y+bottom)/2],radius:Math.min(right-x,bottom-y)/2,symbols:[]};
    // Derive the original printed emblem from the supplied cover. This retains
    // each edition's own symbols when its button is recolored or pressed.
    const ix=Math.floor(x),iy=Math.floor(y),width=Math.ceil(right)-ix,height=Math.ceil(bottom)-iy,data=bg.getImageData(ix,iy,width,height),histogram=new Uint32Array(32),luma=i=>data.data[i]*.2126+data.data[i+1]*.7152+data.data[i+2]*.0722;
    for(let py=0;py<height;py+=2)for(let px=0;px<width;px+=2){const nx=(px-width/2)/(width/2),ny=(py-height/2)/(height/2);if(nx*nx+ny*ny<.55)histogram[Math.min(31,Math.floor(luma((py*width+px)*4)/8))]++;}
    let dominant=0;for(let i=1;i<32;i++)if(histogram[i]>histogram[dominant])dominant=i;const backdrop=dominant*8+4;
    for(let i=0;i<data.data.length;i+=4){const difference=backdrop>=128?backdrop-luma(i):luma(i)-backdrop,alpha=Math.max(0,Math.min(255,(difference-22)*5));data.data[i]=data.data[i+1]=data.data[i+2]=255;data.data[i+3]=alpha;}
    const mask=document.createElement('canvas');mask.width=width;mask.height=height;mask.getContext('2d').putImageData(data,0,0);const inkTint=document.createElement('canvas');inkTint.width=width;inkTint.height=height;Object.assign(faces[key],{nativeInk:mask,inkTint,inkX:ix,inkY:iy,inkColor:''});
   }
   faces.Home.protectedRadius=19*scale;
   const d=activeSkin.testing.DPad,width=d.Width,center=point(d.X+width/2,d.Y+360),outer=30*width/66.61*scale,inner=9*width/66.61*scale;dpadCircle=[...center,width/2*scale];
   for(const[key,start,end]of [['Up',226,314],['Right',316,404],['Down',46,134],['Left',136,224]]){const path=new Path2D(),a=start*Math.PI/180,b=end*Math.PI/180;path.arc(...center,outer,a,b);path.arc(...center,inner,b,a,true);path.closePath();faces['DPad_'+key]={path,center,radius:outer,symbols:[]};}
  }
  for(const[x,y,,key,,,radius]of stickLayout)faces[key]={center:[x,y],radius};
  tintColor='';capCache.clear();shoulderCache.clear();rebuildMasks();
  if(activeSkin){const trim=document.createElement('canvas');trim.width=1672;trim.height=941;const g=trim.getContext('2d');g.strokeStyle='#ffffff';g.lineWidth=3;for(const[x,y,,,,,radius]of stickLayout){g.beginPath();g.arc(x,y,radius+5,0,Math.PI*2);g.stroke();}for(const[x,y,radius]of [[...faces.Home.center,Math.max(faces.Home.radius+3,faces.Home.protectedRadius||0)],dpadCircle]){g.beginPath();g.arc(x,y,radius+5,0,Math.PI*2);g.stroke();}g.globalCompositeOperation='destination-in';g.drawImage(shellMask,0,0);g.globalCompositeOperation='source-over';images.nativeTrim=trim;}

 }
 function prepareBase(color,buttonColor) {
  const key=color+'|'+buttonColor;if(key===tintColor)return;tintColor=key;
  if(tinted.base)tinted.base.width=0;
  tinted.base=tint(images.base,color,1672,941);
  const controls=tint(images.base,buttonColor,1672,941),g=controls.getContext('2d');
  g.globalCompositeOperation='destination-in';g.drawImage(controlMask,0,0);
  const body=tinted.base.getContext('2d');body.globalCompositeOperation='destination-out';body.drawImage(controlMask,0,0);body.globalCompositeOperation='lighter';body.drawImage(controls,0,0);body.globalCompositeOperation='source-over';controls.width=0;
 }
 function cap(key, color) {
  const id = key + color;
  if (!capCache.has(id)) { if (capCache.size >= 32) capCache.clear(); const c=tint(images[key],activeSkin?'#ffffff':color,180,180),g=c.getContext('2d');
   if(activeSkin&&color!=='#ffffff'){const pixels=g.getImageData(0,0,180,180),rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));for(let i=0;i<pixels.data.length;i+=4){const shade=.65+.35*(pixels.data[i]*.2126+pixels.data[i+1]*.7152+pixels.data[i+2]*.0722)/255;for(let k=0;k<3;k++)pixels.data[i+k]=rgb[k]*shade;}g.putImageData(pixels,0,0);}
   // The supplied crop includes socket/rim pixels. Only the rubber cap moves.
   g.globalCompositeOperation='destination-in';g.beginPath();g.arc(90,90,86,0,Math.PI*2);g.fill();g.globalCompositeOperation='source-over';capCache.set(id,c); }
  return capCache.get(id);
 }
 function mix(a, b, t) {
  const rgb = x => [1,3,5].map(i => parseInt(x.slice(i,i+2),16));
  const av = rgb(a), bv = rgb(b);
  return '#' + av.map((v,i) => Math.round(v+(bv[i]-v)*t).toString(16).padStart(2,'0')).join('');
 }
 function contrast(color){return (parseInt(color.slice(1,3),16)*.2126+parseInt(color.slice(3,5),16)*.7152+parseInt(color.slice(5,7),16)*.0722)>145?'#142126':'#ffffff';}
 function rainbow(time, seconds) {
  const h = ((time / (seconds * 1000)) % 1 + 1) % 1;
  return '#' + [0,2/3,1/3].map(offset=>Math.round(255*(.5+.5*Math.cos(Math.PI*2*(h+offset)))).toString(16).padStart(2,'0')).join('');
 }
 function recolor(image, color) {
  lc.clearRect(0,0,1672,941); lc.globalCompositeOperation='source-over'; lc.drawImage(image,0,0,1672,941);
  lc.globalCompositeOperation='source-in'; lc.fillStyle=color; lc.fillRect(0,0,1672,941); lc.globalCompositeOperation='source-over';
 }
 function label(text,x,y,size,color) {
  ctx.font=`700 ${size}px Segoe UI, Arial, sans-serif`; ctx.fillStyle=color; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,x,y);
 }
 function face(key, color, pressed) {
  const f=faces[key], [x,y]=f.center;
  if(activeSkin){ctx.save();ctx.clip(f.path);ctx.globalCompositeOperation='source-atop';ctx.fillStyle=color;ctx.fill(f.path);
   if(f.nativeInk){const ink=contrast(color);if(f.inkColor!==ink){f.inkColor=ink;const g=f.inkTint.getContext('2d');g.clearRect(0,0,f.inkTint.width,f.inkTint.height);g.drawImage(f.nativeInk,0,0);g.globalCompositeOperation='source-in';g.fillStyle=ink;g.fillRect(0,0,f.inkTint.width,f.inkTint.height);g.globalCompositeOperation='source-over';}ctx.drawImage(f.inkTint,f.inkX,f.inkY);}
   ctx.restore();return;}
  ctx.save(); ctx.clip(f.path);
  const gradient=ctx.createLinearGradient(x,y-55,x,y+65);
  gradient.addColorStop(0,mix(color,'#ffffff',pressed?.24:.08)); gradient.addColorStop(1,mix(color,'#000000',.12));
  if(key==='LB'||key==='RB'){if(!shoulderCache.has(color)){if(shoulderCache.size>=4)shoulderCache.clear();shoulderCache.set(color,tint(images.base,color,1672,941));}ctx.drawImage(shoulderCache.get(color),0,0);}else{ctx.fillStyle=gradient;ctx.fill(f.path);}
  // The shoulder artwork already carries its seam. An extra vector stroke can paint
  // transparent edge pixels outside the photographed bumper.
  if(key!=='LB'&&key!=='RB'){ctx.strokeStyle=mix(color,'#000000',.5);ctx.lineWidth=2;ctx.stroke(f.path);}
  if (pressed) {
   ctx.translate(x,y);
   // One circular emblem and a single X silhouette, safely inside the chrome rim.
   const ink=contrast(color);
   if (key==='Home') {
    ctx.save(); ctx.beginPath(); ctx.arc(0,0,25,0,Math.PI*2); ctx.clip();
    ctx.fillStyle=ink; ctx.fillRect(-25,-25,50,50);
    ctx.fillStyle=color;
    ctx.fill(new Path2D('M-22-19 Q-11-23 0-10 Q11-23 22-19 Q12-12 5-3 Q17 10 23 24 Q9 15 0 5 Q-9 15-23 24 Q-17 10-5-3 Q-12-12-22-19Z'));
    ctx.restore();
   } else for (const symbol of f.symbols) {
    if (symbol.tag==='text') label(symbol.text,0,0,symbol.size,ink);
    else {ctx.fillStyle=ink;ctx.strokeStyle=ink;ctx.lineWidth=symbol.width;ctx.lineCap='round';ctx.lineJoin='round';if(symbol.fill)ctx.fill(symbol.path);if(symbol.stroke)ctx.stroke(symbol.path);}
   }
  }
  ctx.restore();
 }
 function trigger(x, pressure, right, rest, pressed) {
  const y=162; ctx.lineWidth=10; ctx.strokeStyle='#a9bac5'; ctx.beginPath(); ctx.arc(x,y,109,right?-1.5:2.4,right?.74:4.64);ctx.stroke();
  if(pressure){ctx.strokeStyle=pressed;ctx.beginPath();ctx.arc(x,y,109,right?-1.5:2.4,(right?-1.5:2.4)+2.24*pressure);ctx.stroke();}
  label(Math.round(pressure*100)+'%',x,y,30,pressed);
  tc.clearRect(0,0,185,200);tc.drawImage(images[right?'rt':'lt'],0,0,185,200);
  tc.globalCompositeOperation='source-in';tc.fillStyle=mix(rest,pressed,pressure);tc.fillRect(0,0,185,200);tc.globalCompositeOperation='source-over';
  // Keep trigger lettering inside the original silhouette, including its slanted edge.
  if(pressure){tc.globalCompositeOperation='source-atop';tc.font='700 29px Segoe UI, Arial, sans-serif';tc.textAlign='center';tc.textBaseline='middle';tc.fillStyle=contrast(mix(rest,pressed,pressure));tc.fillText(right?'RT':'LT',right?90:92,124);tc.globalCompositeOperation='source-over';}
  ctx.drawImage(triggerLayer,0,0,185,200,right?1090:365,38,185,200);
 }
 return {
  hitTest(x,y){for(const key of faceKeys)if(ctx.isPointInPath(faces[key].path,x,y))return key;for(const[sx,sy,,key,,radius]of stickLayout)if(Math.hypot(x-sx,y-sy)<radius*90/86)return key;if(y>-262&&y<-62){if(x>365&&x<550)return 'LT';if(x>1090&&x<1275)return 'RT';}return null;},
  async setTexture(src){await texturePainter.setImage(src||'');},
  async setLogo(src) {
   if(src===logoSrc){if(logoLoadingSrc!==null){logoRequest++;logoLoadingSrc=null;logoLoading=null;}return;}
   if(src===logoLoadingSrc)return logoLoading;
   const token=++logoRequest;if(!src){logo=null;logoSrc='';logoLoadingSrc=null;logoLoading=null;return;}
   logoLoadingSrc=src;logoLoading=(async()=>{const next=new Image();next.src=src;await next.decode();if(token===logoRequest){logo=next;logoSrc=src;}})();
   try{await logoLoading;}finally{if(token===logoRequest){logoLoadingSrc=null;logoLoading=null;}}
  },
  draw(p,state={},time=0,peak=false) {
   activateSkin(p.nativeSkin||'');state=normalizeOverlayInput(state);
   const rawTime=time;themePainter.update(p,state,rawTime);time=p.animationMode==='still'?1200:p.animationMode==='reduced'?time*.35:time;
   const colors=p.buttonColors||{}, color=(key,which)=>colors[key]?.[which]||(which==='rest'?(activeSkin&&['LT','RT'].includes(key)&&p.buttonBaseColor==='#ffffff'?activeSkin.testing.L2R2.Normal:(p.buttonBaseColor||'#ffffff')):p.pressed);
   const effect=p.effect||'none', amount=(p.effectIntensity??.6)*(p.animationMode==='reduced'?.45:1), seconds=p.effectSpeed||5;
   const accent=effect==='rainbow'?mix(p.accent,rainbow(time,seconds),amount):p.accent;
   const pulse=(1-Math.cos(time*2*Math.PI/(seconds*1000)))/2;
   const breathe=p.breathing?(1-Math.cos(time*2*Math.PI/(p.speed*1000)))/2:1;
   const strength=peak?1:effect==='neon'?(.42+.58*pulse):(.08+.92*breathe);
   const glow=p.glow+(effect==='neon'?16*amount:0);
   prepareBase(p.baseColor||'#ffffff',p.buttonBaseColor||'#ffffff');ctx.clearRect(0,0,1672,1241);ctx.save();ctx.translate(p.offsetX||0,p.offsetY||0);
   ctx.save();ctx.translate(0,300);ctx.drawImage(tinted.base,0,0,1672,941);holoPainter.draw(p,time);texturePainter.draw(p);
   surfacePainter.pattern(p);
   if(!['none','rainbow','neon','reactive'].includes(effect)&&amount>0)surfacePainter.effect(effect,accent,time,seconds,amount,p);
   themePainter.shell(p,state,time);themePainter.bursts(p,rawTime);
   if(time<lastActive)lastActive=-Infinity;
   if(Object.entries(state).some(([key,v])=>key!=='axes'&&(v===true||typeof v==='number'&&v>0)))lastActive=time;
   if(effect==='reactive') {
    const active=Object.entries(state).some(([key,v])=>key!=='axes'&&(v===true||typeof v==='number'&&v>0));
    const power=(p.animationMode==='still'?(active?1:0):Math.pow(Math.max(0,1-(time-lastActive)/600),2))*amount;
    if(power){recolor(shellMask,accent);ctx.save();ctx.globalAlpha=.38*power;ctx.drawImage(layer,0,0);ctx.restore();}
   }
   for(const key of faceKeys)if(colors[key]?.rest||activeSkin&&p.buttonBaseColor!=='#ffffff')face(key,colors[key]?.rest||p.buttonBaseColor,false);
   if(!activeSkin||['neon','rainbow'].includes(effect)){
    const nextKey=[activeSkinId,p.mode==='original'?'ambient':'trim',accent,glow].join('|');
    if(nextKey!==emissionKey){emissionKey=nextKey;recolor(activeSkin?images.nativeTrim:images[p.mode==='original'?'ambient':'trim'],accent);ec.clearRect(0,0,1672,941);ec.save();ec.shadowColor=accent;ec.shadowBlur=glow;ec.drawImage(layer,0,0);ec.restore();if(activeSkin){ec.globalCompositeOperation='destination-in';ec.drawImage(shellMask,0,0);ec.globalCompositeOperation='source-over';}}
    ctx.save();ctx.globalAlpha=strength;ctx.drawImage(emission,0,0);ctx.restore();
   }
   if(p.mode!=='original'&&(p.mode==='logo'?!!logo:!!p.text)){
    const key=JSON.stringify([activeSkinId,p.mode,p.text,logoSrc,p.x,p.y,p.size,p.angle,p.fontSource,p.fontFamily,p.fontWeight,p.fontItalic]);
    if(key!==artworkKey){
     artworkKey=key;artEmissionKey='';ac.clearRect(0,0,1672,941);ac.save();ac.translate(p.x,p.y);ac.rotate(p.angle*Math.PI/180);
     if(p.mode==='logo'&&logo){const h=p.size*logo.height/logo.width;ac.drawImage(logo,-p.size/2,-h/2,p.size,h);}
     else{ac.fillStyle='#ffffff';ac.font=`${(p.fontItalic??true)?"italic ":""}${p.fontWeight||900} ${Math.round(p.size/3.5)}px ${JSON.stringify((p.fontSource==='library'?'OSL ':'')+(p.fontFamily||'Segoe UI'))}, Arial, sans-serif`;ac.textAlign='center';ac.textBaseline='middle';ac.fillText(p.text,0,0,p.size);}
     ac.restore();ac.globalCompositeOperation='destination-in';ac.drawImage(activeSkin?shellMask:images.base,0,0,1672,941);if(!activeSkin)ac.drawImage(images.clearance,0,0,1672,941);ac.globalCompositeOperation='source-over';
    }
    const nextKey=accent+'|'+glow;
    if(nextKey!==artEmissionKey){artEmissionKey=nextKey;lc.clearRect(0,0,1672,941);lc.drawImage(artwork,0,0);if(p.mode==='text'){lc.globalCompositeOperation='source-in';lc.fillStyle=accent;lc.fillRect(0,0,1672,941);lc.globalCompositeOperation='source-over';}ae.clearRect(0,0,1672,941);ae.save();ae.shadowColor=accent;ae.shadowBlur=glow;ae.drawImage(layer,0,0);ae.restore();}
    ctx.save();ctx.globalAlpha=strength;ctx.drawImage(artEmission,0,0);ctx.restore();
   }
   for(const key of faceKeys)if(state[key])face(key,color(key,'pressed'),true);
   themePainter.controls(p,state,time);
   stickLayout.forEach(([x,y,key,button,i,radius])=>{
    const axes=state.axes;
    // The base owns the fixed socket/rim. The isolated cap sits above it,
    // including the overlap at full travel; clipping to the socket cuts the cap.
    ctx.save();
    x+=axes[i]*38;y+=axes[i+1]*38;
    const pressed=state[button],ink=color(button,pressed?'pressed':'rest');
    const size=180*radius/86;ctx.drawImage(cap(key,ink),x-size/2,y-size/2,size,size);
    if(pressed){ctx.save();ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.clip();label(button==='LSB'?'L3':'R3',x,y,33,contrast(ink));ctx.restore();}
    ctx.restore();
   });
   ctx.restore();trigger(242,state.LT||0,false,color('LT','rest'),color('LT','pressed'));trigger(1430,state.RT||0,true,color('RT','rest'),color('RT','pressed'));ctx.restore();
  }
 };
}
// Shared by live input, previews and exported overlays. No dead zone or easing delays presses.
function normalizeOverlayInput(state={}){
 const number=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):0;
 const out={axes:Array.from({length:4},(_,i)=>number(state?.axes?.[i],-1,1))};
 for(const i of [0,2]){const length=Math.hypot(out.axes[i],out.axes[i+1]);if(length>1){out.axes[i]/=length;out.axes[i+1]/=length;}}
 for(const key of ['A','B','X','Y','LB','RB','Home','Share','Options','Capture','M','DPad_Up','DPad_Down','DPad_Left','DPad_Right','LSB','RSB'])out[key]=state?.[key]===true||number(state?.[key],0,1)>.5;
 out.LT=number(state?.LT,0,1);out.RT=number(state?.RT,0,1);return out;
}
function readStandardGamepad(pad){
 const keys=['A','B','X','Y','LB','RB','LT','RT','Share','Options','LSB','RSB','DPad_Up','DPad_Down','DPad_Left','DPad_Right','Home'];
 if(!pad||pad.connected===false)return normalizeOverlayInput();
 const out={axes:pad.axes};keys.forEach((k,i)=>{out[k]=i===6||i===7?pad.buttons?.[i]?.value:pad.buttons?.[i]?.pressed;});return normalizeOverlayInput(out);
}
