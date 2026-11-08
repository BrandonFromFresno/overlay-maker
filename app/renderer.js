async function createOverlayRenderer(canvas, assets, fontAssets = {}) {
 await Promise.all(Object.entries(fontAssets).map(async([family,record])=>{
  const alias='OSL '+family;
  const existing=Array.from(document.fonts).find(face=>face.family.replaceAll('"','')===alias);
  if(existing){await existing.loaded;return;}
  const face=new FontFace(alias,`url("${record.source}")`,{weight:record.weight});
  document.fonts.add(face);await face.load();
 }));
 const images = {};
 await Promise.all(Object.entries(assets).map(async ([key, src]) => {
  const image = new Image(); image.src = src; await image.decode(); images[key] = image;
 }));
 const ctx = canvas.getContext('2d');
 const layer = document.createElement('canvas'); layer.width = 1672; layer.height = 941;
 const lc = layer.getContext('2d');
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
 let logo = null, logoSrc = '', tintColor = '', lastActive = -Infinity;
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
  if (!capCache.has(id)) { if (capCache.size >= 32) capCache.clear(); capCache.set(id, tint(images[key], color, 180, 180)); }
  return capCache.get(id);
 }
 function mix(a, b, t) {
  const rgb = x => [1,3,5].map(i => parseInt(x.slice(i,i+2),16));
  const av = rgb(a), bv = rgb(b);
  return '#' + av.map((v,i) => Math.round(v+(bv[i]-v)*t).toString(16).padStart(2,'0')).join('');
 }
 function rainbow(time, seconds) {
  const h = ((time / (seconds * 1000)) % 1 + 1) % 1;
  return '#' + [0,8,4].map(n => {const k=(n+h*12)%12;return Math.round(255*(.5-.5*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0');}).join('');
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
  ctx.save(); ctx.clip(f.path);
  const gradient=ctx.createLinearGradient(x,y-55,x,y+65);
  gradient.addColorStop(0,mix(color,'#ffffff',pressed?.24:.08)); gradient.addColorStop(1,mix(color,'#000000',.12));
  if(key==='LB'||key==='RB'){if(!shoulderCache.has(color)){if(shoulderCache.size>=4)shoulderCache.clear();shoulderCache.set(color,tint(images.base,color,1672,941));}ctx.drawImage(shoulderCache.get(color),0,0);}else{ctx.fillStyle=gradient;ctx.fill(f.path);}
  ctx.strokeStyle=mix(color,'#000000',.5); ctx.lineWidth=2; ctx.stroke(f.path);
  if (pressed) {
   ctx.translate(x,y);
   // One circular emblem and a single X silhouette, safely inside the chrome rim.
   const ink=(parseInt(color.slice(1,3),16)*.2126+parseInt(color.slice(3,5),16)*.7152+parseInt(color.slice(5,7),16)*.0722)>145?'#142126':'#ffffff';
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
  lc.clearRect(0,0,1672,941);lc.drawImage(images[right?'rt':'lt'],0,0,185,200);
  lc.globalCompositeOperation='source-in';lc.fillStyle=pressure?mix(mix(pressed,'#ffffff',.6),pressed,pressure):rest;lc.fillRect(0,0,185,200);lc.globalCompositeOperation='source-over';
  ctx.drawImage(layer,0,0,185,200,right?1090:365,38,185,200);
  if(pressure)label(right?'RT':'LT',right?1180:457,162,29,mix(pressed,'#000000',.7));
 }
 return {
  hitTest(x,y){for(const key of faceKeys)if(ctx.isPointInPath(faces[key].path,x,y))return key;if(Math.hypot(x-456,y-290)<90)return 'LSB';if(Math.hypot(x-1033,y-523)<90)return 'RSB';if(y>-262&&y<-62){if(x>365&&x<550)return 'LT';if(x>1090&&x<1275)return 'RT';}return null;},
  async setTexture(src){await texturePainter.setImage(src||'');},
  async setLogo(src) {if(src===logoSrc)return;logoSrc=src;logo=null;if(src){const image=new Image();image.src=src;await image.decode();if(logoSrc===src)logo=image;}},
  draw(p,state={},time=0,peak=false) {
   const rawTime=time;themePainter.update(p,state,rawTime);time=p.animationMode==='still'?1200:p.animationMode==='reduced'?time*.35:time;
   const colors=p.buttonColors||{}, color=(key,which)=>colors[key]?.[which]||(which==='rest'?(p.buttonBaseColor||'#ffffff'):p.pressed);
   const effect=p.effect||'none', amount=(p.effectIntensity??.6)*(p.animationMode==='reduced'?.45:1), seconds=p.effectSpeed||5;
   const accent=effect==='rainbow'?mix(p.accent,rainbow(time,seconds),amount):p.accent;
   const pulse=(1-Math.cos(time*2*Math.PI/(seconds*1000)))/2;
   const breathe=p.breathing?(1-Math.cos(time*2*Math.PI/(p.speed*1000)))/2:1;
   const strength=peak?1:effect==='neon'?(.018+.982*breathe)*(1-amount*.7+amount*.7*pulse):.018+.982*breathe;
   const glow=p.glow+(effect==='neon'?24*amount*(peak?1:pulse):0);
   prepareBase(p.baseColor||'#ffffff',p.buttonBaseColor||'#ffffff');ctx.clearRect(0,0,1672,1241);ctx.save();ctx.translate(p.offsetX||0,p.offsetY||0);
   ctx.save();ctx.translate(0,300);ctx.drawImage(tinted.base,0,0,1672,941);holoPainter.draw(p,time);texturePainter.draw(p);
   surfacePainter.pattern(p);
   if(!['none','rainbow','neon','reactive'].includes(effect)&&amount>0)surfacePainter.effect(effect,accent,time,seconds,amount,p);
   themePainter.shell(p,state,time);themePainter.bursts(p,rawTime);
   if(time<lastActive)lastActive=-Infinity;
   if(Object.entries(state).some(([key,v])=>key!=='axes'&&(v===true||typeof v==='number'&&v>0)))lastActive=time;
   if(effect==='reactive') {
    const active=Object.entries(state).some(([key,v])=>key!=='axes'&&(v===true||typeof v==='number'&&v>0));
    const power=(p.animationMode==='still'?(active?1:0):Math.max(0,1-(time-lastActive)/600))*amount;
    if(power){recolor(shellMask,accent);ctx.save();ctx.globalAlpha=.38*power;ctx.drawImage(layer,0,0);ctx.restore();}
   }
   for(const key of faceKeys)if(colors[key]?.rest)face(key,colors[key].rest,false);
   recolor(images[p.mode==='original'?'ambient':'trim'],accent);
   ctx.save();ctx.globalAlpha=strength;ctx.shadowColor=accent;ctx.shadowBlur=glow*strength;ctx.drawImage(layer,0,0);ctx.restore();
   if(p.mode!=='original') {
    lc.clearRect(0,0,1672,941);lc.save();lc.translate(p.x,p.y);lc.rotate(p.angle*Math.PI/180);
    if(p.mode==='logo'&&logo){const h=p.size*logo.height/logo.width;lc.drawImage(logo,-p.size/2,-h/2,p.size,h);}
    else{lc.fillStyle=accent;lc.font=`${(p.fontItalic??true)?"italic ":""}${p.fontWeight||900} ${Math.round(p.size/3.5)}px ${JSON.stringify((p.fontSource==='library'?'OSL ':'')+(p.fontFamily||'Segoe UI'))}, Arial, sans-serif`;lc.textAlign='center';lc.textBaseline='middle';lc.fillText(p.text,0,0,p.size);}
    lc.restore();lc.globalCompositeOperation='destination-in';lc.drawImage(images.base,0,0,1672,941);lc.drawImage(images.clearance,0,0,1672,941);lc.globalCompositeOperation='source-over';
    ctx.save();ctx.globalAlpha=strength;ctx.shadowColor=accent;ctx.shadowBlur=glow*strength;ctx.drawImage(layer,0,0);ctx.restore();
   }
   for(const key of faceKeys)if(state[key])face(key,color(key,'pressed'),true);
   themePainter.controls(p,state,time);
   [[456,290,'leftStick','LSB',0],[1033,523,'rightStick','RSB',2]].forEach(([x,y,key,button,i])=>{
    const axes=state.axes||[];x+=(axes[i]||0)*38;y+=(axes[i+1]||0)*38;ctx.drawImage(cap(key,color(button,'rest')),x-90,y-90,180,180);
    if(state[button]){ctx.fillStyle=color(button,'pressed');ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(x,y,68,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;label(button==='LSB'?'L3':'R3',x,y,33,mix(color(button,'pressed'),'#000000',.8));}
   });
   ctx.restore();trigger(242,state.LT||0,false,color('LT','rest'),color('LT','pressed'));trigger(1430,state.RT||0,true,color('RT','rest'),color('RT','pressed'));ctx.restore();
  }
 };
}
function readStandardGamepad(pad){const keys=['A','B','X','Y','LB','RB','LT','RT','Share','Options','LSB','RSB','DPad_Up','DPad_Down','DPad_Left','DPad_Right','Home'];const out={axes:Array.from(pad.axes||[])};keys.forEach((k,i)=>{out[k]=i===6||i===7?(pad.buttons[i]?.value||0):!!pad.buttons[i]?.pressed;});return out;}
