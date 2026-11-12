// Self-contained painter, shared verbatim by the studio and finished customer overlays.
const PRESS_EFFECT_DEFAULTS={pressEffectStyle:'rings',triggerEffect:'none',pressEffectInputs:'triggers',pressEffectColorMode:'accent',pressEffectColor:'#00dfff',pressEffectDuration:700,pressEffectSize:1,pressEffectIntensity:1};
const PRESS_EFFECT_RANGES={pressEffectDuration:[200,1400],pressEffectSize:[.5,2],pressEffectIntensity:[0,1]};
function createPressEffectPainter(ctx,faces,shellMask,getLayout=()=>({})){
 const TAU=Math.PI*2,clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{n=clamp(n);return n*n*(3-2*n);},hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 let layer,g,motion,lastTime=-1,lastLayout='',previous={},events=new Map(),state={};const sprites=new Map();
 function prepare(){if(layer)return;layer=document.createElement('canvas');layer.width=1672;layer.height=941;g=layer.getContext('2d');motion=createVFXPainter(g);}
 function sprite(color){if(sprites.has(color))return sprites.get(color);const c=document.createElement('canvas');c.width=c.height=32;const p=c.getContext('2d'),gradient=p.createRadialGradient(16,16,0,16,16,16);gradient.addColorStop(0,'#ffffff');gradient.addColorStop(.12,color);gradient.addColorStop(1,color+'00');p.fillStyle=gradient;p.fillRect(0,0,32,32);if(sprites.size>=32)sprites.delete(sprites.keys().next().value);sprites.set(color,c);return c;}
 function anchor(key){
  const layout=getLayout(),stick=layout.sticks?.find(s=>s[3]===key);if(stick)return{x:stick[0],y:stick[1],r:stick[6]||stick[5]||86};
  let face=faces[key];if(['LT','RT'].includes(key)&&face?.parts){const parts=face.parts.filter(p=>!p.floating);if(parts.length){const b=parts.reduce((v,p)=>[Math.min(v[0],p.bounds[0]),Math.min(v[1],p.bounds[1]),Math.max(v[2],p.bounds[0]+p.bounds[2]),Math.max(v[3],p.bounds[1]+p.bounds[3])],[Infinity,Infinity,-Infinity,-Infinity]);return{x:(b[0]+b[2])/2,y:(b[1]+b[3])/2,r:Math.max(24,Math.min(b[2]-b[0],b[3]-b[1])/2)};}face=faces[key==='LT'?'LB':'RB'];}
  if(face)return{x:face.center[0],y:face.center[1],r:Math.max(20,face.radius||42)};
  if(key==='LT'||key==='RT')return{x:key==='LT'?456:1180,y:25,r:42};return null;
 }
 function color(p,key){return p.pressEffectColorMode==='custom'?(p.pressEffectColor||'#00dfff'):p.pressEffectColorMode==='pressed'?(p.buttonColors?.[key]?.pressed||p.pressed||'#00c7ef'):(p.accent||'#00dfff');}
 function ring(x,y,r,ink,width,alpha,start=0,end=TAU){g.strokeStyle=ink;g.lineWidth=width;g.globalAlpha=alpha;g.beginPath();g.arc(x,y,r,start,end);g.stroke();}
 function glow(x,y,r,ink,alpha){g.globalAlpha=alpha;g.drawImage(sprite(ink),x-r,y-r,r*2,r*2);}
 function burst(style,a,u,ink,seed,size,reduced){
  if(u<=0||u>=1)return;const fade=smooth(u/.055)*Math.pow(1-u,2),r=a.r/size+12;
  g.save();g.translate(a.x,a.y);g.scale(size,size);
  if(style==='rings'){motion.burst(0,0,a.r/size,u,ink,seed);}
  else if(style==='sparks'){
   const n=reduced?8:16;for(let i=0;i<n;i++){const start=hash(seed+i)*.06,v=clamp((u-start)/(1-start)),angle=i*TAU/n+(hash(seed+i+7)-.5)*.24,travel=r+(80+hash(seed+i+17)*100)*(1-Math.pow(1-v,2)),x=Math.cos(angle)*travel,y=Math.sin(angle)*travel+v*v*24,alpha=smooth(v/.07)*Math.pow(1-v,2.5),tail=(10+hash(seed+i+20)*20)*(1-v);g.globalAlpha=alpha;g.strokeStyle=ink;g.lineWidth=1.3+hash(seed+i+21);g.lineCap='round';g.beginPath();g.moveTo(x-Math.cos(angle)*tail,y-Math.sin(angle)*tail);g.lineTo(x,y);g.stroke();glow(x,y,5,ink,alpha*.65);}
   ring(0,0,r+50*u,ink,2,fade*.4);
  }else if(style==='shockwave'){
   const radius=r+130*(1-Math.pow(1-u,3)),band=14+12*u,gradient=g.createRadialGradient(0,0,Math.max(0,radius-band),0,0,radius+band);gradient.addColorStop(0,ink+'00');gradient.addColorStop(.48,ink+'38');gradient.addColorStop(.58,ink+'bb');gradient.addColorStop(1,ink+'00');g.globalAlpha=fade;g.fillStyle=gradient;g.beginPath();g.arc(0,0,radius+band,0,TAU);g.fill();ring(0,0,radius,ink,1.7,fade*.9);ring(0,0,r+80*(1-Math.pow(1-u,2)),ink,1,fade*.35);
  }else if(style==='halo'){
   const radius=r+12+38*u;glow(0,0,radius*1.7,ink,fade*.3);for(let i=0;i<3;i++){const angle=i*TAU/3+u*.9;ring(0,0,radius+i*5,ink,i?1.2:3,fade*(i?.5:.9),angle,angle+Math.PI*.65);}ring(0,0,radius*.9,ink,1,fade*.35);
  }
  g.restore();
 }
 function pressure(style,a,depth,t,ink,seed,size,reduced){
  const r=a.r+12,amount=depth*(reduced?.5:1);g.save();g.translate(a.x,a.y);g.scale(size,size);
  if(style==='glow'){const radius=r+25+90*depth,gradient=g.createRadialGradient(0,0,r*.8,0,0,radius);gradient.addColorStop(0,ink+'00');gradient.addColorStop(.35,ink+'70');gradient.addColorStop(1,ink+'00');g.globalAlpha=amount*.75;g.fillStyle=gradient;g.beginPath();g.arc(0,0,radius,0,TAU);g.fill();ring(0,0,r+10+12*depth,ink,1+3*depth,amount*.8);}
  else if(style==='ripples'){for(let i=0;i<3;i++){const u=(t*.8+i/3)%1,alpha=smooth(u/.1)*Math.pow(1-u,1.8)*amount;ring(0,0,r+8+u*(30+130*depth),ink,1+2*depth,alpha*.9);ring(0,0,r+8+u*(30+130*depth),ink,8,alpha*.08);}}
  else if(style==='arcs'){for(let i=0;i<(reduced?3:6);i++){const angle=i*TAU/6+Math.sin(t*1.6+i)*.06,start=r+8,end=start+25+85*depth,phase=t*2+i,points=[];for(let j=0;j<=6;j++){const distance=start+(end-start)*j/6,offset=Math.sin(j*1.7+phase)*(j===0||j===6?0:3+5*depth);points.push([Math.cos(angle)*distance-Math.sin(angle)*offset,Math.sin(angle)*distance+Math.cos(angle)*offset]);}for(const [width,alpha]of [[7,.08],[1+depth, .85]]){g.globalAlpha=amount*alpha*(.75+.25*Math.sin(phase)**2);g.strokeStyle=ink;g.lineWidth=width;g.lineJoin='round';g.lineCap='round';g.beginPath();points.forEach(([x,y],j)=>j?g.lineTo(x,y):g.moveTo(x,y));g.stroke();}const p=points[4];g.globalAlpha=amount*.45;g.lineWidth=1;g.beginPath();g.moveTo(...p);g.lineTo(p[0]+Math.cos(angle+.6)*18*depth,p[1]+Math.sin(angle+.6)*18*depth);g.stroke();}}
  else if(style==='jet'){for(let i=0;i<(reduced?6:12);i++){const u=(t*.9+hash(seed+i))%1,angle=Math.atan2(470-a.y,836-a.x)+(hash(seed+i+19)-.5)*.65,travel=r+6+(25+160*depth)*(1-Math.pow(1-u,1.4)),x=Math.cos(angle)*travel,y=Math.sin(angle)*travel,alpha=smooth(u/.12)*Math.pow(1-u,1.8)*amount;g.globalAlpha=alpha;g.strokeStyle=ink;g.lineWidth=1+depth;g.lineCap='round';g.beginPath();g.moveTo(x-Math.cos(angle)*12*(1-u),y-Math.sin(angle)*12*(1-u));g.lineTo(x,y);g.stroke();glow(x,y,3+4*depth,ink,alpha*.65);}}
  g.restore();
 }
 return{
  update(p,input,time){
   const layout=getLayout().id||'';if(time<lastTime||layout!==lastLayout){events.clear();previous={};}lastLayout=layout;lastTime=time;state=input;
   const enabled=p.inputBurst&&p.animationMode!=='still';if(!enabled)events.clear();
   for(const key of new Set([...Object.keys(faces),'LSB','RSB','LT','RT'])){const value=input[key],was=!!previous[key],down=typeof value==='number'?value>(was?.08:.18):!!value;if(enabled&&down&&!was){const starts=events.get(key)||[];starts.push(time);if(starts.length>3)starts.shift();events.set(key,starts);}previous[key]=down;}
   for(const [key,starts]of events){const active=starts.filter(start=>time-start<(p.pressEffectDuration??700));if(active.length)events.set(key,active);else events.delete(key);}
  },
  draw(p,time){
   if(p.animationMode==='still'||!(p.pressEffectIntensity??1))return;const trigger=p.triggerEffect||'none',inputs=p.pressEffectInputs||'triggers',analog=[];if(inputs!=='sticks')analog.push(['LT',state.LT||0],['RT',state.RT||0]);if(inputs!=='triggers')analog.push(['LSB',Math.hypot(state.axes?.[0]||0,state.axes?.[1]||0)],['RSB',Math.hypot(state.axes?.[2]||0,state.axes?.[3]||0)]);if(!events.size&&(trigger==='none'||!analog.some(([,depth])=>depth>0)))return;prepare();g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,1672,941);
   const size=p.pressEffectSize??1,reduced=p.animationMode==='reduced',strength=(p.pressEffectIntensity??1)*(reduced?.6:1);
   for(const [key,starts]of events)for(const start of starts){const a=anchor(key);if(a)burst(p.pressEffectStyle||'rings',a,(time-start)/(p.pressEffectDuration??700),color(p,key),Array.from(key).reduce((sum,c)=>sum+c.charCodeAt(0),0),size,reduced);}
   if(trigger!=='none')for(const [key,value]of analog){const depth=clamp(value),a=anchor(key);if(depth&&a)pressure(trigger,a,depth,time/1000,color(p,key),key==='LT'?13:71,size,reduced);}
   g.globalAlpha=1;g.globalCompositeOperation='destination-in';g.drawImage(shellMask,0,0);g.globalCompositeOperation='source-over';ctx.save();ctx.globalAlpha=strength;ctx.drawImage(layer,0,0);ctx.restore();
  }
 };
}
