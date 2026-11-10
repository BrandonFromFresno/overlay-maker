// Original, time-based stylized VFX. No stock footage, external assets or per-frame randomness.
// Factories are serialized verbatim into self-contained customer exports.
function createVFXPainter(c){
 const TAU=Math.PI*2,W=1672,H=941,sprites=new Map(),smokeSprites=new Map();
 const hash=n=>{let x=Math.imul((n+1)|0,374761393);x=Math.imul(x^(x>>>13),1274126177);return((x^(x>>>16))>>>0)/4294967296;};
 const clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{n=clamp(n);return n*n*(3-2*n);},fract=n=>n-Math.floor(n);
 const life=u=>smooth(u/.12)*(1-smooth((u-.55)/.45));
 function rgba(color,a){const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));return `rgba(${rgb.join(',')},${clamp(a)})`;}
 function mix(a,b,t){return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');}
 function glow(x,y,r,color,alpha=1){
  let sprite=sprites.get(color);if(!sprite){if(sprites.size>=12)sprites.clear();sprite=document.createElement('canvas');sprite.width=sprite.height=64;const g=sprite.getContext('2d'),v=g.createRadialGradient(32,32,0,32,32,32);v.addColorStop(0,rgba(color,.55));v.addColorStop(.22,rgba(color,.24));v.addColorStop(.6,rgba(color,.07));v.addColorStop(1,rgba(color,0));g.fillStyle=v;g.fillRect(0,0,64,64);sprites.set(color,sprite);}
  c.save();c.globalAlpha*=alpha;c.drawImage(sprite,x-r,y-r,r*2,r*2);c.restore();
 }
 function stroke(points,color,width,alpha=1){c.save();c.globalAlpha*=alpha;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore();}
 function particles(kind,time,seconds,density,color,softness=.5){
  const clock=time/(1000*seconds),count=Math.round((kind==='comets'?22:kind==='fireflies'?36:kind==='snow'?60:52)*density);
  c.save();c.shadowBlur=0;
  for(let i=0;i<count;i++){
   const seed=i*19+{embers:43,fireflies:817,snow:301,rain:602,comets:123}[kind],duration=.45+hash(seed+7)*.85,u=fract(clock/duration+hash(seed)),envelope=life(u),size=.9+hash(seed+4)*2.7;
   if(envelope<.002)continue;
   let x=hash(seed+2)*(W+180)-90,y,dx=0,dy=0,r=size;
   if(kind==='embers'){x+=Math.sin(u*5+hash(seed+5)*TAU)*(22+hash(seed+9)*55)+u*(hash(seed+11)-.5)*160;y=1090-1290*Math.pow(u,1.22);dx=Math.cos(u*5+hash(seed+5)*TAU)*6;dy=-12-22*u;r*=.65+.6*Math.sin(Math.PI*u);}
   if(kind==='snow'||kind==='rain'){x+=Math.sin(clock*.7+hash(seed+5)*TAU)*(kind==='snow'?45:9)+u*(kind==='rain'?-100:40);y=-140+u*1230;dx=kind==='rain'?-7:Math.cos(clock*.7+hash(seed+5)*TAU)*4;dy=kind==='rain'?55+hash(seed+8)*75:3;}
   if(kind==='fireflies'){x+=Math.sin(clock*1.4+hash(seed+5)*TAU)*65;y=hash(seed+8)*H+Math.cos(clock*.93+hash(seed+10)*TAU)*45;r*=.7+.35*Math.sin(clock*2+hash(seed+1)*TAU);}
   if(kind==='comets'){x=-220+u*2170;y=hash(seed+8)*1100-80+Math.sin(u*3.2+hash(seed+9)*TAU)*60;dx=65+hash(seed+6)*100;dy=Math.cos(u*3.2+hash(seed+9)*TAU)*12;r*=1.3;}
   const tint=kind==='embers'?mix(color,'#ffcc73',Math.floor(hash(seed+3)*4)/3*.55):kind==='snow'?mix(color,'#ffffff',.72):color;
   c.save();c.globalAlpha=envelope*(.45+hash(seed+13)*.5);
   if(softness>0)glow(x,y,r*(3+softness*5),tint,.65);
   if(kind==='rain'||kind==='comets'||kind==='embers'){
    const tail=c.createLinearGradient(x-dx,y-dy,x,y);tail.addColorStop(0,rgba(tint,0));tail.addColorStop(.65,rgba(tint,.6));tail.addColorStop(1,mix(tint,'#ffffff',.55));
    stroke([[x-dx,y-dy],[x,y]],tail,kind==='rain'?1.1+size*.3:size*.8,.9);
   }
   c.fillStyle=mix(tint,'#ffffff',kind==='embers'?.28:.6);c.beginPath();c.ellipse(x,y,r,kind==='embers'?r*1.5:r,Math.sin(clock+i)*.25,0,TAU);c.fill();c.restore();
  }c.restore();
 }
 function ribbons(kind,time,seconds,density,color,softness=.5){
  const t=time/(seconds*1000)*TAU,n=Math.round((kind==='flow'?5:4)*density);c.save();c.shadowBlur=0;
  for(let i=0;i<n;i++){
   const points=[],left=[],right=[],origin=(i+.5)*W/n,phase=hash(i+73)*TAU,width=(kind==='flow'?18:42)*( .7+hash(i+61)*.8);
   for(let j=0;j<=44;j++){const u=j/44,y=-160+u*1250,x=origin+Math.sin(u*5.5-t*.7+phase)*70+Math.sin(u*10+t*.4+phase)*18,w=width*(.2+.8*Math.sin(u*Math.PI))*(.65+.35*Math.sin(u*7+t+phase));points.push([x,y]);left.push([x-w,y]);right.push([x+w,y]);}
   const gradient=c.createLinearGradient(origin-110,0,origin+110,0);gradient.addColorStop(0,rgba(color,0));gradient.addColorStop(.35,rgba(color,kind==='flow'?.12:.22));gradient.addColorStop(.55,rgba(mix(color,'#ffffff',.4),kind==='flow'?.35:.5));gradient.addColorStop(.75,rgba(color,.16));gradient.addColorStop(1,rgba(color,0));c.fillStyle=gradient;c.beginPath();left.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));right.reverse().forEach(([x,y])=>c.lineTo(x,y));c.closePath();c.fill();
   stroke(points,color,kind==='flow'?1.2:2,.18+softness*.12);
  }c.restore();
 }
 function lightning(time,seconds,density,color,softness=.5){
  const clock=time/(seconds*1000),tick=clock*14,k=Math.floor(tick),blend=smooth(fract(tick)),n=Math.round(3*density);c.save();c.shadowBlur=0;
  for(let j=0;j<n;j++){
   const points=[],origin=(j+.5)*W/n,brightness=.65+.2*Math.sin(clock*7+j*2.1);
   for(let i=0;i<25;i++){const jitter=(hash(i*31+j*977+k*101)*(1-blend)+hash(i*31+j*977+(k+1)*101)*blend-.5)*98;points.push([origin+jitter+Math.sin(i*.6+j)*14,-110+i*50+(hash(i+j*71)-.5)*20]);}
   stroke(points,color,12+softness*10,.09*brightness);stroke(points,color,5,.32*brightness);stroke(points,mix(color,'#ffffff',.55),2,brightness);stroke(points,'#effbff',.75,brightness*.85);
   for(let fork=0;fork<3;fork++){const start=6+fork*6,[x,y]=points[start],sign=fork%2?1:-1,branch=[[x,y]];for(let i=1;i<6;i++)branch.push([x+sign*i*19+(hash(i+j*63+fork*17+k)*(1-blend)+hash(i+j*63+fork*17+k+1)*blend-.5)*18,y+i*23]);const alpha=(.25+.4*(.5+.5*Math.sin(clock*6+fork+j)));stroke(branch,color,2.4,alpha);stroke(branch,'#e8faff',.7,alpha*.8);glow(x,y,24+softness*12,color,.18);}
  }c.restore();
 }
 function waves(time,seconds,density,color){const clock=time/(seconds*1000),n=Math.round(5*density);c.save();for(let i=0;i<n;i++){const u=fract(clock/(.9+hash(i+51)*.5)+hash(i+9)),envelope=life(u),r=40+(1-Math.pow(1-u,2))*1080;c.save();c.translate(836+Math.sin(i*2)*28,470+Math.cos(i)*18);c.scale(1,.72);for(const[w,alpha]of [[13,.06],[5,.2],[1.7,.8]]){c.strokeStyle=color;c.lineWidth=w;c.globalAlpha=envelope*alpha;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();}c.restore();}c.restore();}
 function vortex(time,seconds,density,color){const clock=time/(seconds*1000),n=Math.round(5*density);c.save();for(let i=0;i<n;i++){const a=[],b=[];for(let j=0;j<=65;j++){const u=j/65,angle=u*TAU*1.1+i*TAU/n+clock*1.3,r=45+u*900,w=Math.sin(Math.PI*u)*(5+12*(1-u));a.push([836+Math.cos(angle)*(r+w),470+Math.sin(angle)*(r+w)*.68]);b.push([836+Math.cos(angle)*(r-w),470+Math.sin(angle)*(r-w)*.68]);}c.fillStyle=rgba(color,.18+hash(i+77)*.18);c.beginPath();a.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));b.reverse().forEach(([x,y])=>c.lineTo(x,y));c.closePath();c.fill();}glow(836,470,150,color,.3);c.restore();}
 function light(kind,time,seconds,density,color){
  const clock=time/(seconds*1000),n=kind==='prism'?Math.round(5*density):2;c.save();c.transform(1,0,-.28,1,200,0);
  for(let i=0;i<n;i++){const u=fract(clock/(1+hash(i+6)*.65)+i/n),x=-650+u*3100,width=kind==='prism'?160+hash(i+4)*160:300,ink=kind==='prism'?`hsl(${i*57+Math.sin(clock*.4)*30},75%,73%)`:color,gradient=c.createLinearGradient(x,0,x+width,0);gradient.addColorStop(0,kind==='prism'?ink.replace('hsl(','hsla(').replace(')',',0)'):rgba(color,0));gradient.addColorStop(.18,kind==='prism'?ink:rgba(color,.06));gradient.addColorStop(.5,ink);gradient.addColorStop(.82,kind==='prism'?ink:rgba(color,.06));gradient.addColorStop(1,kind==='prism'?ink.replace('hsl(','hsla(').replace(')',',0)'):rgba(color,0));c.globalAlpha=life(u)*(kind==='prism'?.16:.24);c.fillStyle=gradient;c.fillRect(x,-200,width,1400);}
  c.restore();
 }
 function speedlines(time,seconds,density,color){const clock=time/(seconds*1000);c.save();for(let i=0;i<Math.round(28*density);i++){const u=fract(clock/(.35+hash(i+50)*.6)+hash(i+3)),x=-350+u*2350,y=hash(i+11)*1100-80,len=80+hash(i+17)*260,w=1+hash(i+29)*4;c.globalAlpha=life(u)*(.3+hash(i+4)*.5);const gradient=c.createLinearGradient(x-len,y,x,y);gradient.addColorStop(0,rgba(color,0));gradient.addColorStop(1,color);c.fillStyle=gradient;c.beginPath();c.moveTo(x,y);c.lineTo(x-len,y-w);c.lineTo(x-len*.7,y+w);c.closePath();c.fill();}c.restore();}
 function flamePath(x,y,w,h,t){const lean=Math.sin(t)*w*.22;c.beginPath();c.moveTo(x-w*.45,y);c.bezierCurveTo(x-w*.85,y-h*.35,x-w*.3,y-h*.62,x-w*.28+lean,y-h*.72);c.bezierCurveTo(x-w*.2,y-h*.42,x+w*.2,y-h*.65,x+lean,y-h);c.bezierCurveTo(x+w*.7,y-h*.72,x+w*.12,y-h*.62,x+w*.37,y-h*.43);c.bezierCurveTo(x+w*.82,y-h*.4,x+w*.72,y-h*.17,x+w*.45,y);c.quadraticCurveTo(x,y+h*.12,x-w*.45,y);c.closePath();}
 function smokeSprite(color,variant,softness=.5){
  const edge=Math.round(softness*4)/4,key=color+'|'+variant+'|'+edge;if(smokeSprites.has(key))return smokeSprites.get(key);const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const g=canvas.getContext('2d'),phase=variant*TAU/4;
  for(let j=0;j<3;j++){const px=128+Math.sin(j*2.1+phase)*24,py=128+Math.cos(j*1.7+phase)*16,r=64+j*5,gradient=g.createRadialGradient(px,py,0,px,py,r);gradient.addColorStop(0,rgba(color,.8));gradient.addColorStop(.82-edge*.5,rgba(color,.45));gradient.addColorStop(1,rgba(color,0));g.fillStyle=gradient;const knots=Array.from({length:9},(_,k)=>{const a=k*TAU/9,d=r*(.86+.13*Math.sin(a*3+phase)+.06*Math.sin(a*5-phase+j));return[px+Math.cos(a)*d,py+Math.sin(a)*d];});g.beginPath();g.moveTo(...knots[0]);for(let k=0;k<knots.length;k++){const a=knots[(k+8)%9],b=knots[k],d=knots[(k+1)%9],e=knots[(k+2)%9];g.bezierCurveTo(b[0]+(d[0]-a[0])/6,b[1]+(d[1]-a[1])/6,d[0]-(e[0]-b[0])/6,d[1]-(e[1]-b[1])/6,d[0],d[1]);}g.closePath();g.fill();}
  if(smokeSprites.size>=16)smokeSprites.clear();smokeSprites.set(key,canvas);return canvas;
 }
 function fire(time,seconds,density,color,cool=false,heightScale=1,softness=.5){
  const clock=time/(seconds*1000)*TAU,n=Math.round(6*density);c.save();
  // Authored billow silhouettes morph through a small cached atlas, with smooth
  // lifetime expansion, curl and alpha. No per-frame gradients or particle textures.
  for(let i=0;i<Math.round(9*density);i++){const u=fract(clock/TAU/(1.1+hash(i+7)*.6)+hash(i+66)),r=32+135*u,x=hash(i+37)*W+Math.sin(u*4+hash(i+9)*TAU)*60,y=880-u*780,alpha=life(u)*.095,morph=fract(u*.7+hash(i+80))*4,index=Math.floor(morph),blend=smooth(fract(morph)),shade=cool?'#829ab5':'#a38c80';c.save();c.translate(x,y);c.rotate(Math.sin(u*3+i)*.35);c.scale(.8+u*.3,1);c.globalAlpha=alpha*(1-blend);c.drawImage(smokeSprite(shade,index),-r,-r,r*2,r*2);c.globalAlpha=alpha*blend;c.drawImage(smokeSprite(shade,(index+1)%4),-r,-r,r*2,r*2);c.restore();}
  for(let i=0;i<n;i++){const x=(i+.5)*W/n+Math.sin(clock*.3+i)*20,h=heightScale*(170+hash(i+13)*170)*(.88+.12*Math.sin(clock*1.2+i)),w=65+hash(i+18)*65,y=990+hash(i+3)*50;
   c.globalAlpha=1;if(softness>0)glow(x,y-h*.3,h*(.3+.5*softness),color,.1+softness*.1);
   for(const[scale,alpha,tint]of [[1,.55,mix(color,cool?'#305a9b':'#b93418',.4)],[.68,.7,mix(color,cool?'#c9faff':'#ffd06e',.6)],[.34,.8,cool?'#d9ffff':'#fff2ba']]){c.globalAlpha=alpha;flamePath(x,y,w*scale,h*scale,clock+i*.93);const g=c.createLinearGradient(x,y,x,y-h*scale);g.addColorStop(0,rgba(tint,0));g.addColorStop(.22,rgba(tint,.8));g.addColorStop(.72,tint);g.addColorStop(1,rgba(tint,.35));c.fillStyle=g;c.fill();}
  }c.restore();
 }
 function smoke(time,seconds,density,color,softness=.5){const clock=time/(seconds*1000),shade=mix('#a9acb6',color,.18);c.save();for(let i=0;i<Math.round(10*density);i++){const u=fract(clock/(1.2+hash(i+16)*.9)+hash(i+81)),r=45+165*Math.pow(u,.8),x=hash(i+42)*W+Math.sin(u*4+hash(i+11)*TAU)*90,y=1080-u*1320,phase=fract(u*.65+hash(i+3))*4,k=Math.floor(phase),blend=smooth(fract(phase)),opacity=life(u)*.43;c.save();c.translate(x,y);c.rotate(Math.sin(u*2+i)*.45);c.scale(.8+u*.4,1);c.globalAlpha=opacity*(1-blend);c.drawImage(smokeSprite(shade,k,softness),-r,-r,r*2,r*2);c.globalAlpha=opacity*blend;c.drawImage(smokeSprite(shade,(k+1)%4,softness),-r,-r,r*2,r*2);c.restore();}c.restore();}
 function burst(x,y,r,progress,color,seed=0){if(progress<=0||progress>=1)return;const alpha=smooth(progress/.045)*Math.pow(1-progress,2),distance=r+16+(1-Math.pow(1-progress,3))*130;c.save();c.globalAlpha=alpha;for(const[width,a]of [[10,.08],[3,.3],[1.3,.8]]){c.strokeStyle=color;c.lineWidth=width;c.globalAlpha=alpha*a;c.beginPath();c.arc(x,y,distance,0,TAU);c.stroke();}for(let i=0;i<7;i++){const angle=i*TAU/7+hash(i+seed)*.3,travel=r+20+progress*(110+hash(i+seed+3)*90),px=x+Math.cos(angle)*travel,py=y+Math.sin(angle)*travel;c.globalAlpha=alpha*.6;stroke([[px,py],[px-Math.cos(angle)*12*(1-progress),py-Math.sin(angle)*12*(1-progress)]],color,1.6); }c.restore();}
 return{hash,smooth,life,rgba,mix,glow,particles,ribbons,lightning,waves,vortex,light,speedlines,fire,smoke,flamePath,burst};
}
