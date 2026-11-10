const PATTERN_DATA=[
 ['none','None','Clean','Unpatterned shell.'],['checker','Checkerboard','Classic','Even checkers inspired by woven haori fabric.'],['slashes','Racing slashes','Classic','Balanced diagonal bands with clean edges.'],['clouds','Cloud curls','Japanese','Joined cloud crests with curling tails.'],['stars','Stars','Classic','Alternating five-point stars with generous spacing.'],['hex','Honeycomb','Technical','A connected hexagonal lattice.'],['halftone','Manga halftone','Manga','Staggered ink dots with a gradual density fade.'],['split','Split panels','Classic','A single diagonal color panel.'],['seigaiha','Ocean waves','Japanese','Layered semicircles in a traditional wave repeat.'],['asanoha','Hemp-leaf geometry','Japanese','Six-way triangular leaf geometry.'],['shippo','Seven treasures','Japanese','Overlapping circular petals.'],['circuit','Circuit board','Technical','Connected traces, branches and solder pads.'],['carbon','Carbon twill','Technical','Alternating woven diagonal bundles.'],['contours','Contour lines','Organic','Smooth topographic bands.'],['chevrons','Chevrons','Classic','Interlocking V-shaped bands.'],['pinstripes','Pinstripes','Classic','Fine double stripes with consistent spacing.'],['diamonds','Diamond lattice','Geometric','Linked diamonds with small accent dots.'],['scales','Dragon scales','Organic','Overlapping curved scales.'],['camo','Camouflage','Organic','Seeded organic islands with soft outlines.'],['sunburst','Manga sunburst','Manga','Tapered rays radiating from the controller center.'],['maze','Key maze','Geometric','An orderly repeating key pattern.']
].map(([id,name,group,description])=>({id,name,group,description}));
const EFFECT_DATA=[
 ['none','None','Clean','No animated effect.','none'],['fire','Stylized fire','Atmosphere','Layered flame tongues, rising embers and softly curling smoke.','shell'],['smoke','Curling smoke','Atmosphere','Expanding sculpted billows with independent drift and dissipation.','shell'],['rainbow','Rainbow accents','Accents','Smooth color travel across trim and artwork.','accent'],['neon','Neon pulse','Accents','A slow, rounded glow pulse.','accent'],['reactive','Reactive input flash','Input','Soft shell light that fades after input.','input'],['aura','Energy aura','Energy','Layered flowing energy ribbons.','shell'],['waves','Aura waves','Energy','Expanding rings that fade as they spread.','shell'],['lightning','Lightning','Energy','Continuous branching arcs without hard frame jumps.','shell'],['speedlines','Manga speed lines','Manga','Tapered movement strokes with depth.','shell'],['embers','Drifting embers','Particles','Warm sparks drifting upward at different speeds.','shell'],['halftone','Halftone pulse','Manga','A traveling wave of manga dots.','shell'],['sweep','Energy sweep','Light','A soft diagonal light band.','shell'],['fireflies','Fireflies','Particles','Slow floating points of light with gentle breathing.','shell'],['rain','Neon rain','Particles','Layers of falling luminous trails.','shell'],['snow','Snowfall','Particles','Fine snow with slow lateral drift.','shell'],['comets','Comet trails','Particles','Bright heads with tapered tails.','shell'],['scanlines','Scanner lines','Technical','A scanning band over subtle horizontal lines.','shell'],['vortex','Spiral vortex','Energy','Rotating curved energy arms.','shell'],['prism','Prism rays','Light','Softly moving spectral beams.','shell'],['flow','Silk flow','Light','Undulating translucent ribbons.','shell']
].map(([id,name,group,description,kind])=>({id,name,group,description,kind}));
const RETIRED_EFFECT_IDS=['halftone','scanlines'];
const CURRENT_EFFECT_DATA=EFFECT_DATA.filter(record=>!RETIRED_EFFECT_IDS.includes(record.id));
function createSurfacePainter(ctx,mask){
 const layer=document.createElement('canvas');layer.width=1672;layer.height=941;const g=layer.getContext('2d');
 const pattern=document.createElement('canvas');pattern.width=1672;pattern.height=941;const a=pattern.getContext('2d');let patternKey='';
 const vfx=createVFXPainter(g);
 const TAU=Math.PI*2,hash=i=>{const n=Math.sin(i*127.1+9.2)*43758.5453;return n-Math.floor(n);};
 const line=(c,points)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const ring=(c,x,y,r)=>{c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();};
 function stamp(c,style,color,weight,seed){
  c.fillStyle=color;c.strokeStyle=color;c.lineWidth=weight;c.lineJoin='round';c.lineCap='round';
  if(style==='checker'){for(let y=-2400;y<2400;y+=110)for(let x=-2500;x<2500;x+=110)if((Math.round(x/110)+Math.round(y/110))%2===0)c.fillRect(x,y,110,110);}
  if(style==='slashes'){for(let x=-3600;x<3000;x+=190){c.beginPath();c.moveTo(x,1700);c.lineTo(x+2000,-1600);c.lineTo(x+2038,-1600);c.lineTo(x+38,1700);c.closePath();c.fill();}}
  if(style==='clouds'){for(let y=-2400;y<2400;y+=210)for(let x=-2400;x<2500;x+=300){c.beginPath();c.moveTo(x-76,y+35);c.bezierCurveTo(x-130,y+12,x-105,y-50,x-62,y-40);c.bezierCurveTo(x-58,y-110,x+40,y-118,x+54,y-46);c.bezierCurveTo(x+120,y-74,x+146,y+28,x+79,y+35);c.lineTo(x+8,y+35);c.bezierCurveTo(x-38,y+35,x-38,y-22,x,y-22);c.bezierCurveTo(x+30,y-22,x+27,y+12,x+8,y+12);c.stroke();}}
  if(style==='stars'){for(let row=-8;row<10;row++)for(let col=-14;col<15;col++){const x=col*180+(row%2)*90,y=row*180,r=(row+col)%3===0?26:16;c.beginPath();for(let j=0;j<10;j++){const d=j%2?r*.43:r,t=j*Math.PI/5-Math.PI/2;c.lineTo(x+Math.cos(t)*d,y+Math.sin(t)*d);}c.closePath();c.fill();}}
  if(style==='hex'){const r=70;for(let row=-17;row<18;row++)for(let col=-22;col<23;col++){const x=col*Math.sqrt(3)*r+(row%2)*Math.sqrt(3)*r/2,y=row*1.5*r;c.beginPath();for(let i=0;i<6;i++){const t=Math.PI/3*i+Math.PI/6;c.lineTo(x+Math.cos(t)*r,y+Math.sin(t)*r);}c.closePath();c.stroke();}}
  if(style==='halftone'){c.beginPath();for(let row=-42;row<43;row++)for(let col=-62;col<63;col++){const x=col*40+(row%2)*20,y=row*40,r=2+7*(.5+.5*Math.sin(x/900));c.moveTo(x+r,y);c.arc(x,y,r,0,TAU);}c.fill();}
  if(style==='split'){c.beginPath();c.moveTo(-100,-1700);c.lineTo(3000,-1700);c.lineTo(3000,1700);c.lineTo(-1700,1700);c.closePath();c.fill();}
  if(style==='seigaiha'||style==='scales'){const step=style==='scales'?140:180;for(let row=-20;row<21;row++)for(let col=-23;col<24;col++){const x=col*step+(row%2)*step/2,y=row*step/2;for(let i=0;i<(style==='scales'?2:4);i++){c.beginPath();c.arc(x,y,step/2-i*(style==='scales'?10:14),Math.PI,TAU);c.stroke();}}}
  if(style==='asanoha'){const r=100;for(let row=-20;row<21;row++)for(let col=-22;col<23;col++){const x=col*r*1.5,y=row*r*Math.sqrt(3)+(col%2)*r*Math.sqrt(3)/2;for(let i=0;i<6;i++){const t=i*Math.PI/3,n=t+Math.PI/3,v=[x+Math.cos(t)*r,y+Math.sin(t)*r],w=[x+Math.cos(n)*r,y+Math.sin(n)*r];line(c,[[x,y],v,w,[x,y],[(v[0]+w[0])/2,(v[1]+w[1])/2]]);}}}
  if(style==='shippo'){for(let y=-2400;y<2400;y+=140)for(let x=-2500;x<2500;x+=140)ring(c,x,y,99);}
  if(style==='circuit'){for(let row=-10;row<11;row++)for(let col=-15;col<16;col++){const x=col*180,y=row*180;line(c,[[x,y+180],[x,y+60],[x+55,y+5],[x+120,y+5],[x+160,y+45],[x+160,y+90]]);ring(c,x+160,y+100,10);line(c,[[x+36,y+180],[x+36,y+115],[x+78,y+73],[x+107,y+73]]);ring(c,x+117,y+73,8);}}
  if(style==='carbon'){for(let row=-40;row<43;row++)for(let col=-64;col<65;col++){const x=col*40,y=row*40,flip=(row+col)%4<2;c.globalAlpha=flip?.65:.24;c.fillRect(x+2,y+2,36,36);c.globalAlpha=.45;for(let j=0;j<4;j++)line(c,flip?[[x+5+j*8,y+3],[x+5+j*8,y+37]]:[[x+3,y+5+j*8],[x+37,y+5+j*8]]);}c.globalAlpha=1;}
  if(style==='contours'){for(let j=-44;j<45;j++){c.beginPath();for(let x=-2600;x<=2600;x+=20)c.lineTo(x,j*46+Math.sin(x/220+j*.18)*45+Math.sin(x/430-j*.2)*45);c.stroke();}}
  if(style==='chevrons'){for(let y=-2400;y<2400;y+=115)for(let x=-2600;x<2600;x+=260)line(c,[[x,y],[x+130,y+70],[x+260,y]]);}
  if(style==='pinstripes'){for(let x=-2500;x<2500;x+=70){line(c,[[x,-1700],[x,1700]]);c.save();c.lineWidth=Math.max(1,weight*.45);line(c,[[x+12,-1700],[x+12,1700]]);c.restore();}}
  if(style==='diamonds'){for(let y=-2400;y<2400;y+=160)for(let x=-2500;x<2500;x+=160){line(c,[[x,y-80],[x+80,y],[x,y+80],[x-80,y],[x,y-80]]);c.beginPath();c.arc(x,y,4,0,TAU);c.fill();}}
  if(style==='camo'){for(let i=0;i<600;i++){const x=-2500+hash(i+seed)*5000,y=-1600+hash(i+seed+900)*3200,r=35+hash(i+seed+500)*95;c.save();c.translate(x,y);c.rotate(hash(i+seed+70)*TAU);c.globalAlpha=.35+hash(i+seed+11)*.6;c.beginPath();c.moveTo(r,0);for(let j=1;j<=12;j++){const t=j*TAU/12,d=r*(.65+hash(j+i+seed)*.5);c.quadraticCurveTo(Math.cos(t-.2)*d*1.12,Math.sin(t-.2)*d*1.12,Math.cos(t)*d,Math.sin(t)*d);}c.closePath();c.fill();c.restore();}}
  if(style==='sunburst'){for(let i=0;i<32;i++){const t=i*TAU/32;c.beginPath();c.moveTo(Math.cos(t)*110,Math.sin(t)*110);c.lineTo(Math.cos(t-.025)*3500,Math.sin(t-.025)*3500);c.lineTo(Math.cos(t+.025)*3500,Math.sin(t+.025)*3500);c.closePath();c.fill();}}
  if(style==='maze'){for(let y=-2400;y<2400;y+=140)for(let x=-2600;x<2600;x+=140)line(c,[[x,y],[x+120,y],[x+120,y+110],[x+30,y+110],[x+30,y+35],[x+85,y+35],[x+85,y+75],[x+65,y+75]]);}
 }
 function protect(c){if(mask){c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0);c.globalCompositeOperation='source-over';}}
 return {
  pattern(p){
   const style=p.shellPattern||'none';if(style==='none'||p.patternOpacity===0)return;
   const color=p.patternUseAccent===false?p.patternColor:p.accent,key=[p.nativeSkin,style,color,p.patternScale,p.patternRotation,p.patternWeight,p.patternSeed].join('|');
   if(key!==patternKey){patternKey=key;a.clearRect(0,0,1672,941);a.save();a.translate(836,470);a.rotate((p.patternRotation||0)*Math.PI/180);a.scale(p.patternScale||1,p.patternScale||1);stamp(a,style,color,p.patternWeight||3,p.patternSeed||1);a.restore();protect(a);}
   ctx.save();ctx.globalAlpha=p.patternOpacity??(style==='checker'?.65:.24);ctx.drawImage(pattern,0,0);ctx.restore();
  },
  effect(effect,accent,time,seconds,amount,p={}){
   const phase=((time/(seconds*1000))%1+1)%1,density=(p.effectDensity||1)*(p.animationMode==='reduced'?.6:1),softness=p.effectSoftness??.5;
   g.clearRect(0,0,1672,941);g.save();g.translate(836,470);g.rotate((p.effectDirection||0)*Math.PI/180);g.translate(-836,-470);g.fillStyle=accent;g.strokeStyle=accent;g.lineCap='round';g.lineJoin='round';g.shadowBlur=0;
   if(effect==='fire'){vfx.fire(time,seconds,density,accent,false,1.65,softness);vfx.particles('embers',time,seconds,density*.35,accent,softness);}
   if(effect==='smoke')vfx.smoke(time,seconds,density,accent,softness);
   if(['embers','fireflies','snow','rain','comets'].includes(effect))vfx.particles(effect,time,seconds,density,accent,softness);
   if(effect==='aura'||effect==='flow')vfx.ribbons(effect,time,seconds,density,accent,softness);
   if(effect==='lightning')vfx.lightning(time,seconds,density,accent,softness);
   if(effect==='waves')vfx.waves(time,seconds,density,accent);
   if(effect==='vortex')vfx.vortex(time,seconds,density,accent);
   if(effect==='speedlines')vfx.speedlines(time,seconds,density,accent);
   if(effect==='sweep'||effect==='prism')vfx.light(effect,time,seconds,density,accent);
   // Compatibility renderers are retained only for already-saved retired effects.
   if(effect==='halftone'){g.beginPath();const step=48/Math.sqrt(density);for(let y=0;y<1000;y+=step)for(let x=0;x<1700;x+=step){const r=2+(1+Math.sin(phase*TAU+x/250+y/250))*4;g.moveTo(x+r,y);g.arc(x,y,r,0,TAU);}g.fill();}
   if(effect==='scanlines'){vfx.light('sweep',time,seconds,density,accent);g.globalAlpha=.18;g.lineWidth=1;for(let y=0;y<1000;y+=14/density)line(g,[[0,y],[1700,y]]);}
   g.restore();protect(g);ctx.save();ctx.globalAlpha=amount*.65;ctx.drawImage(layer,0,0);ctx.restore();
  }
 };
}
