// Procedural theme artwork: no network, image downloads or external runtime dependencies.
// Kept as a factory so the same painter is embedded verbatim in exported overlays.
function createThemePainter(ctx, faces, shellMask) {
 const artwork=createButtonArtworkPainter();
 const TAU=Math.PI*2, layer=document.createElement('canvas');layer.width=1672;layer.height=941;
 const g=layer.getContext('2d');let cacheKey='',previous={},impacts=new Map(),lastTime=-1;
 const ring=(c,x,y,r)=>{c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();};
 const line=(c,points)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const star=(c,x,y,r,n=5)=>{c.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n-Math.PI/2,d=i%2?r*.42:r;c.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d);}c.closePath();c.fill();};
 function spiral(c,x,y,r,turns=3,phase=0){c.beginPath();for(let i=0;i<=120;i++){const t=i/120,a=t*TAU*turns+phase,d=r*t;c.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d);}c.stroke();}
 function leaf(c,x,y,r){c.beginPath();c.moveTo(x,y+r);c.bezierCurveTo(x-r*1.6,y,x-r,y-r*1.2,x,y-r);c.bezierCurveTo(x+r,y-r*1.2,x+r*1.6,y,x,y+r);c.fill();}
 function sigil(c,kind,r,phase=0){artwork.symbol(c,kind,r,phase);}
 function shell(style,accent){
  const key=style+'|'+accent+'|'+shellMask.dataset.skin;if(key===cacheKey)return;cacheKey=key;
  g.clearRect(0,0,1672,941);g.save();g.strokeStyle=accent;g.fillStyle=accent;g.lineWidth=4;g.lineCap='round';
  if(['ninja','uchiha'].includes(style)){
   for(const [x,y] of [[240,550],[1450,530]]){g.save();g.translate(x,y);g.rotate(-.3);sigil(g,style==='uchiha'?'sharingan':'rasengan',125);g.restore();}
   for(let j=0;j<5;j++)line(g,[[180,770+j*18],[440,690+j*16],[890,245+j*20],[1400,180+j*22]]);
  }else if(style==='pirate'){
   g.save();g.translate(290,590);sigil(g,'compass',165);g.restore();
   g.save();g.translate(1440,580);sigil(g,'pirate-skull',100);g.translate(0,-80);sigil(g,'straw-hat',90);g.restore();
   g.setLineDash([12,14]);g.beginPath();g.moveTo(270,800);g.bezierCurveTo(380,420,1150,750,1400,340);g.stroke();g.setLineDash([]);
   for(let j=0;j<4;j++)line(g,[[90,480+j*36],[1450,120+j*36]]);
  }else if(style==='saiyan'){
   for(const [x,y] of [[220,620],[1450,620]]){g.save();g.translate(x,y);sigil(g,'ki-core',145);g.restore();}
   for(let j=0;j<11;j++){const x=160+j*130;line(g,[[x,900],[x+45,640],[x+15,670],[x+130,220]]);}
  }else if(style==='water'){
   for(let j=0;j<9;j++){g.beginPath();for(let x=50;x<1650;x+=12)g.lineTo(x,180+j*72+Math.sin(x/150+j*.65)*42);g.stroke();}
  }else if(style==='soul'){
   for(const [x,y,a] of [[240,560,-.3],[1440,540,.3]]){g.save();g.translate(x,y);g.rotate(a);sigil(g,'hell-butterfly',120);g.restore();}
   for(let i=0;i<4;i++)line(g,[[500+i*14,830],[1030+i*14,100]]);
  }else if(style==='flame'){
   for(let i=0;i<13;i++){g.save();g.translate(110+i*125,650+(i%3)*65);g.rotate((i%3-1)*.15);sigil(g,'flame',55+i%3*20);g.restore();}
   line(g,[[480,780],[1030,90]]);line(g,[[500,790],[1050,100]]);
  }else if(style==='curse'){
   for(const [x,y] of [[250,580],[1440,520]]){for(let i=0;i<4;i++)ring(g,x,y,50+i*30);g.save();g.translate(x,y);sigil(g,'void',125);g.restore();}
   g.setLineDash([6,14]);ring(g,835,470,350);
  }else if(style==='hero'||style==='kaiju'){
   for(let i=0;i<10;i++){const x=80+i*170,y=300+(i%3)*130;line(g,[[x,800],[x, y],[x+65,y-65],[x+65,80]]);ring(g,x,y,9);}
   if(style==='kaiju')for(let i=0;i<8;i++)line(g,[[130+i*210,900],[170+i*210,660],[140+i*210,560],[190+i*210,260]]);
  }else if(style==='chainsaw'){
   for(const [x,y] of [[240,580],[1440,520]]){g.save();g.translate(x,y);sigil(g,'saw',130);g.restore();}
   for(let i=0;i<17;i++){g.save();g.translate(150+i*90,800-i*32);g.rotate(-.35);g.strokeRect(-22,-13,44,26);g.restore();}
  }else if(style==='hunter'||style==='duelist'){
   for(const [x,y,a] of [[230,550,-.3],[1420,580,.3]]){g.save();g.translate(x,y);g.rotate(a);sigil(g,style==='hunter'?'card':'millennium',140);g.restore();}
   g.setLineDash([4,12]);g.strokeRect(140,170,1390,620);
  }else if(style==='clover'){
   g.save();g.translate(1420,560);sigil(g,'anti-magic',140);g.restore();
   for(let i=0;i<10;i++){g.save();g.translate(170+(i*313)%1400,190+(i*167)%600);g.rotate(i*.7);sigil(g,'clover',40+i%3*12);g.restore();}
   for(let i=0;i<3;i++)ring(g,835,470,260+i*28);
  }else if(style==='gold'){
   for(let i=0;i<22;i++)star(g,130+(i*233)%1430,170+(i*149)%660,15+i%4*7);
   for(const x of [220,1450]){g.save();g.translate(x,590);sigil(g,'ladybug',110);g.restore();}
  }else if(style==='spy'){
   for(const x of [220,1440]){g.save();g.translate(x,560);sigil(g,'rose',100);g.restore();}
   for(let i=0;i<14;i++)line(g,[[100+i*115,900],[620+i*115,80]]);
  }else if(style==='occult'){
   for(const x of [220,1440]){g.save();g.translate(x,560);sigil(g,'alien',100);g.restore();for(let i=0;i<4;i++)ring(g,x,560,120+i*20);}
  }else if(style==='assassin'){
   g.save();g.translate(1440,550);sigil(g,'round-glasses',105);g.restore();
   for(const x of [230,1440]){g.save();g.translate(x,550);sigil(g,'crosshair',125);g.restore();}
   for(let i=0;i<8;i++)line(g,[[100,270+i*60],[1570,270+i*60]]);
  }
  g.restore();g.globalCompositeOperation='destination-in';g.drawImage(shellMask,0,0);g.globalCompositeOperation='source-over';
 }
 const pulse=document.createElement('canvas');pulse.width=1672;pulse.height=941;const pc=pulse.getContext('2d'),motion=createVFXPainter(pc);
 function button(key,style,p,state,time){artwork.draw(ctx,faces[key],key,style,p,state,time);}
 return {
  update(p,state,time){
   if(time<lastTime){impacts.clear();previous={};}lastTime=time;
   for(const key of [...Object.keys(faces),'LSB','RSB','LT','RT']){const down=typeof state[key]==='number'?state[key]>.15:!!state[key];if(down&&!previous[key])impacts.set(key,time);previous[key]=down;}
   for(const [key,start] of impacts)if(time-start>700)impacts.delete(key);
  },
  shell(p,state,time){
   const style=p.themeStyle||'none',amount=p.themeIntensity??.7;if(style==='none'||amount===0)return;
   shell(style,p.accent);ctx.save();ctx.globalAlpha=amount*.4;ctx.drawImage(layer,0,0);ctx.restore();
   const c=pc,phase=time/(p.effectSpeed*1000)*TAU;
   c.globalCompositeOperation='source-over';c.clearRect(0,0,1672,941);c.strokeStyle=p.accent;c.fillStyle=p.accent;c.lineWidth=3;
   const density=(p.animationMode==='reduced'?.45:.8)*(p.effectDensity||1),seconds=p.effectSpeed||5;
   if(['flame','soul'].includes(style)){motion.fire(time,seconds,density,p.accent,style==='soul');motion.particles('embers',time,seconds,density*.4,p.accent,.3);}
   else if(['saiyan','hero','kaiju'].includes(style))motion.ribbons('aura',time,seconds,density,p.accent,.4);
   else if(['water','pirate'].includes(style))motion.ribbons('flow',time,seconds,density,p.accent,.3);
   else if(['ninja','uchiha','curse','occult'].includes(style))motion.vortex(time,seconds,density*.7,p.accent);
   else if(style==='chainsaw'){motion.particles('embers',time,seconds,density*.5,p.accent,.25);motion.light('sweep',time,seconds,.5,p.accent);}
   else motion.light('sweep',time,seconds,.7,p.accent);
   c.globalCompositeOperation='destination-in';c.drawImage(shellMask,0,0);c.globalCompositeOperation='source-over';
   ctx.save();ctx.globalAlpha=amount*(p.animationMode==='reduced'?.16:.38);ctx.drawImage(pulse,0,0);ctx.restore();
  },
  bursts(p,time){
   if(!p.inputBurst||p.animationMode==='still'||!impacts.size)return;
   // Reuse a small transient canvas; pulses are confined to shell, never button faces.
   const c=pc;c.globalCompositeOperation='source-over';c.clearRect(0,0,1672,941);
   for(const [key,start]of impacts){const progress=(time-start)/700,f=faces[key],pos=f?.center||({LT:[456,25],RT:[1180,25]})[key];if(!pos)continue;motion.burst(pos[0],pos[1],f?.radius||42,progress,p.accent,key.charCodeAt(0));}
   c.globalAlpha=1;c.globalCompositeOperation='destination-in';c.drawImage(shellMask,0,0);ctx.drawImage(pulse,0,0);c.globalCompositeOperation='source-over';
  },
  controls(p,state,time){for(const key of ['A','B','X','Y'])button(key,p.buttonStyle,p,state,time);button('Home',p.homeStyle,p,state,time);},
  sample(c,kind,color){c.save();c.translate(32,32);c.strokeStyle=c.fillStyle=color;sigil(c,kind,23);c.restore();}
 };
}
