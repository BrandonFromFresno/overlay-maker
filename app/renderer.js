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
  faces[key] = {path, center, symbols: Array.from(group.children).map(node => ({
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
 let patternKey='',patternCanvas=null;
 function prepareBase(color,buttonColor) {
  const key=color+'|'+buttonColor;if(key===tintColor)return;tintColor=key;
  if(tinted.base)tinted.base.width=0;
  tinted.base=tint(images.base,color,1672,941);
  const controls=tint(images.base,buttonColor,1672,941),g=controls.getContext('2d');
  g.globalCompositeOperation='destination-in';g.drawImage(controlMask,0,0);
  const body=tinted.base.getContext('2d');body.globalCompositeOperation='destination-out';body.drawImage(controlMask,0,0);body.globalCompositeOperation='lighter';body.drawImage(controls,0,0);body.globalCompositeOperation='source-over';controls.width=0;
 }
 function shellPattern(pattern,accent){
  const key=pattern+'|'+accent;if(key===patternKey)return patternCanvas;
  patternKey=key;if(patternCanvas)patternCanvas.width=0;
  patternCanvas=document.createElement('canvas');patternCanvas.width=1672;patternCanvas.height=941;
  const g=patternCanvas.getContext('2d');g.fillStyle=accent;g.strokeStyle=accent;g.lineWidth=6;
  if(pattern==='checker'){g.fillStyle='#0a0c12';for(let y=0;y<941;y+=110)for(let x=0;x<1672;x+=110)if((x/110+y/110)%2===0)g.fillRect(x,y,110,110);}
  if(pattern==='slashes'){for(let x=-900;x<2200;x+=190){g.beginPath();g.moveTo(x,1000);g.lineTo(x+650,-80);g.lineTo(x+690,-80);g.lineTo(x+40,1000);g.fill();}}
  if(pattern==='clouds'){for(let y=90;y<1000;y+=230)for(let x=100;x<1800;x+=300){g.beginPath();g.arc(x,y,60,0,Math.PI*1.7);g.arc(x+54,y-18,33,Math.PI,Math.PI*3);g.stroke();}}
  if(pattern==='stars'){for(let i=0;i<20;i++){const x=90+(i*251)%1500,y=100+(i*173)%750;g.save();g.translate(x,y);g.beginPath();for(let j=0;j<10;j++){const r=j%2?10:25,a=j*Math.PI/5-Math.PI/2;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();g.restore();}}
  if(pattern==='hex'){for(let y=0;y<1000;y+=140)for(let x=0;x<1750;x+=160){g.beginPath();for(let j=0;j<6;j++){const a=j*Math.PI/3;g.lineTo(x+(y/140%2)*80+Math.cos(a)*72,y+Math.sin(a)*72);}g.closePath();g.stroke();}}
  if(pattern==='halftone'){g.beginPath();for(let y=15;y<941;y+=38)for(let x=15;x<1672;x+=38){const r=2+6*(x/1672);g.moveTo(x+r,y);g.arc(x,y,r,0,Math.PI*2);}g.fill();}
  if(pattern==='split'){g.beginPath();g.moveTo(800,0);g.lineTo(1600,0);g.lineTo(930,941);g.lineTo(130,941);g.closePath();g.fill();}
  g.globalCompositeOperation='destination-in';g.drawImage(shellMask,0,0);g.globalCompositeOperation='source-over';return patternCanvas;
 }
 function shellEffect(effect,accent,time,seconds,amount){
  const phase=((time/(seconds*1000))%1+1)%1,hash=i=>{const n=Math.sin(i*127.1+9.2)*43758.5453;return n-Math.floor(n);};
  lc.clearRect(0,0,1672,941);lc.save();lc.fillStyle=accent;lc.strokeStyle=accent;lc.lineCap='round';lc.shadowColor=accent;lc.shadowBlur=14;
  if(effect==='aura'){for(let j=0;j<7;j++){lc.beginPath();for(let y=1000;y>=-80;y-=18){const x=180+j*220+Math.sin(y/160+phase*Math.PI*2+j)*65;lc.lineTo(x,y);}lc.lineWidth=4+j%3*3;lc.stroke();}}
  if(effect==='waves'){for(let j=0;j<5;j++){lc.beginPath();lc.arc(835,480,90+((phase+j/5)%1)*850,0,Math.PI*2);lc.lineWidth=9;lc.stroke();}}
  if(effect==='lightning'){for(let j=0;j<5;j++){lc.beginPath();const start=150+j*330;lc.moveTo(start,-20);for(let y=20,i=0;y<1000;y+=55,i++)lc.lineTo(start+Math.sin(i*3.8+j+Math.floor(phase*18))*55+(y/941)*150,y);lc.lineWidth=3;lc.stroke();}}
  if(effect==='speedlines'){for(let i=0;i<28;i++){const x=((i*129+phase*2400)%2400)-500,y=hash(i)*1100;lc.beginPath();lc.moveTo(x,y);lc.lineTo(x+140+hash(i+7)*200,y-100);lc.lineWidth=1+hash(i+3)*4;lc.stroke();}}
  if(effect==='embers'){lc.fillStyle=mix(accent,'#fff2cc',.35);for(let i=0;i<45;i++){const x=60+hash(i)*1550+Math.sin(phase*Math.PI*2+i)*28,y=1000-((phase+hash(i+30))%1)*1100;lc.beginPath();lc.arc(x,y,2+hash(i+10)*4,0,Math.PI*2);lc.fill();}}
  if(effect==='halftone'){lc.shadowBlur=0;lc.beginPath();for(let y=24;y<941;y+=42)for(let x=24;x<1672;x+=42){const r=2+(1+Math.sin(phase*Math.PI*2+x/300+y/250))*4;lc.moveTo(x+r,y);lc.arc(x,y,r,0,Math.PI*2);}lc.fill();}
  if(effect==='sweep'){lc.shadowBlur=0;const x=-700+phase*3000;const g=lc.createLinearGradient(x,0,x+420,0);g.addColorStop(0,accent+'00');g.addColorStop(.5,mix(accent,'#ffffff',.45)+'d0');g.addColorStop(1,accent+'00');lc.fillStyle=g;lc.transform(1,0,-.45,1,450,0);lc.fillRect(x,0,420,941);}
  lc.restore();lc.globalCompositeOperation='destination-in';lc.drawImage(shellMask,0,0);lc.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=amount*.65;ctx.drawImage(layer,0,0);ctx.restore();
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
  async setLogo(src) {if(src===logoSrc)return;logoSrc=src;logo=null;if(src){const image=new Image();image.src=src;await image.decode();if(logoSrc===src)logo=image;}},
  draw(p,state={},time=0,peak=false) {
   const colors=p.buttonColors||{}, color=(key,which)=>colors[key]?.[which]||(which==='rest'?(p.buttonBaseColor||'#ffffff'):p.pressed);
   const effect=p.effect||'none', amount=p.effectIntensity??.6, seconds=p.effectSpeed||5;
   const accent=effect==='rainbow'?mix(p.accent,rainbow(time,seconds),amount):p.accent;
   const pulse=(1-Math.cos(time*2*Math.PI/(seconds*1000)))/2;
   const breathe=p.breathing?(1-Math.cos(time*2*Math.PI/(p.speed*1000)))/2:1;
   const strength=peak?1:effect==='neon'?(.018+.982*breathe)*(1-amount*.7+amount*.7*pulse):.018+.982*breathe;
   const glow=p.glow+(effect==='neon'?24*amount*(peak?1:pulse):0);
   prepareBase(p.baseColor||'#ffffff',p.buttonBaseColor||'#ffffff');ctx.clearRect(0,0,1672,1241);ctx.save();ctx.translate(p.offsetX||0,p.offsetY||0);
   ctx.save();ctx.translate(0,300);ctx.drawImage(tinted.base,0,0,1672,941);
   if(p.shellPattern&&p.shellPattern!=='none'){ctx.save();ctx.globalAlpha=p.shellPattern==='checker'?.65:.24;ctx.drawImage(shellPattern(p.shellPattern,p.accent),0,0);ctx.restore();}
   if(['aura','waves','lightning','speedlines','embers','halftone','sweep'].includes(effect)&&amount>0)shellEffect(effect,accent,time,seconds,amount);
   if(time<lastActive)lastActive=-Infinity;
   if(Object.entries(state).some(([key,v])=>key!=='axes'&&(v===true||typeof v==='number'&&v>0)))lastActive=time;
   if(effect==='reactive') {
    const power=Math.max(0,1-(time-lastActive)/600)*amount;
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
   [[456,290,'leftStick','LSB',0],[1033,523,'rightStick','RSB',2]].forEach(([x,y,key,button,i])=>{
    const axes=state.axes||[];x+=(axes[i]||0)*38;y+=(axes[i+1]||0)*38;ctx.drawImage(cap(key,color(button,'rest')),x-90,y-90,180,180);
    if(state[button]){ctx.fillStyle=color(button,'pressed');ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(x,y,68,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;label(button==='LSB'?'L3':'R3',x,y,33,mix(color(button,'pressed'),'#000000',.8));}
   });
   ctx.restore();trigger(242,state.LT||0,false,color('LT','rest'),color('LT','pressed'));trigger(1430,state.RT||0,true,color('RT','rest'),color('RT','pressed'));ctx.restore();
  }
 };
}
function readStandardGamepad(pad){const keys=['A','B','X','Y','LB','RB','LT','RT','Share','Options','LSB','RSB','DPad_Up','DPad_Down','DPad_Left','DPad_Right','Home'];const out={axes:Array.from(pad.axes||[])};keys.forEach((k,i)=>{out[k]=i===6||i===7?(pad.buttons[i]?.value||0):!!pad.buttons[i]?.pressed;});return out;}
