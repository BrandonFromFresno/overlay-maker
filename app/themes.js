// Procedural theme artwork: no network, image downloads or external runtime dependencies.
// Kept as a factory so the same painter is embedded verbatim in exported overlays.
function createThemePainter(ctx, faces, shellMask) {
 const TAU=Math.PI*2, layer=document.createElement('canvas');layer.width=1672;layer.height=941;
 const g=layer.getContext('2d');let cacheKey='',previous={},impacts=new Map(),lastTime=-1;
 const ring=(c,x,y,r)=>{c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();};
 const line=(c,points)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const star=(c,x,y,r,n=5)=>{c.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n-Math.PI/2,d=i%2?r*.42:r;c.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d);}c.closePath();c.fill();};
 function spiral(c,x,y,r,turns=3,phase=0){c.beginPath();for(let i=0;i<=120;i++){const t=i/120,a=t*TAU*turns+phase,d=r*t;c.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d);}c.stroke();}
 function leaf(c,x,y,r){c.beginPath();c.moveTo(x,y+r);c.bezierCurveTo(x-r*1.6,y,x-r,y-r*1.2,x,y-r);c.bezierCurveTo(x+r,y-r*1.2,x+r*1.6,y,x,y+r);c.fill();}
 function sigil(c,kind,r,phase=0){
  c.lineWidth=Math.max(1.5,r*.055);c.lineCap='round';c.lineJoin='round';
  if(kind==='rasengan'){
   for(let i=0;i<5;i++){c.save();c.rotate(phase+i*TAU/5);c.scale(1,.48);ring(c,0,0,r*(.48+i*.08));c.restore();}
   spiral(c,0,0,r*.8,2,-phase);c.beginPath();c.arc(0,0,r*.13,0,TAU);c.fill();
  }else if(kind==='sharingan'){
   ring(c,0,0,r*.64);c.beginPath();c.arc(0,0,r*.15,0,TAU);c.fill();
   for(let i=0;i<3;i++){c.save();c.rotate(phase+i*TAU/3);c.beginPath();c.arc(0,-r*.64,r*.16,0,TAU);c.fill();c.beginPath();c.moveTo(r*.12,-r*.72);c.quadraticCurveTo(r*.35,-r*.38,-r*.06,-r*.34);c.quadraticCurveTo(r*.1,-r*.48,r*.12,-r*.72);c.fill();c.restore();}
  }else if(kind==='ki-core'){
   for(let i=0;i<8;i++){c.save();c.rotate(i*TAU/8+phase*.2);line(c,[[0,-r*.58],[r*.1,-r*.76],[0,-r]]);c.restore();}ring(c,0,0,r*.42);star(c,0,0,r*.25);
  }else if(kind==='compass'){
   ring(c,0,0,r*.84);for(let i=0;i<8;i++){c.save();c.rotate(i*TAU/8);c.beginPath();c.moveTo(0,-r);c.lineTo(r*.13,0);c.lineTo(0,r*.28);c.lineTo(-r*.13,0);c.closePath();c.fill();c.restore();}
  }else if(kind==='water-crest'){
   for(let i=0;i<3;i++){c.beginPath();for(let j=0;j<=30;j++){const x=-r+j*r/15,y=Math.sin(x/r*3+phase+i)*r*.2+(i-1)*r*.45;c.lineTo(x,y);}c.stroke();}
  }else if(kind==='soul-flame'||kind==='flame'){
   c.beginPath();c.moveTo(0,r);c.bezierCurveTo(-r*1.2,r*.3,-r*.55,-r*.3,-r*.3,-r*.5);c.quadraticCurveTo(-r*.2,0,0,-r);c.bezierCurveTo(r*.1,-r*.1,r*1.2,r*.25,0,r);c.fill();
   c.save();c.globalCompositeOperation='destination-out';c.beginPath();c.ellipse(0,r*.42,r*.16,r*.3,0,0,TAU);c.fill();c.restore();
  }else if(kind==='void'){
   for(let i=0;i<3;i++){c.save();c.rotate(i*TAU/3+phase*.2);c.scale(1,.37);ring(c,0,0,r*.9);c.restore();}c.beginPath();c.arc(0,0,r*.24,0,TAU);c.fill();
  }else if(kind==='clover'){
   for(let i=0;i<5;i++){c.save();c.rotate(i*TAU/5);leaf(c,0,-r*.45,r*.34);c.restore();}
  }else if(kind==='saw'){
   c.beginPath();for(let i=0;i<32;i++){const a=i*TAU/32,d=r*(i%2?.78:1);c.lineTo(Math.cos(a)*d,Math.sin(a)*d);}c.closePath();c.stroke();ring(c,0,0,r*.36);
  }else if(kind==='millennium'){
   line(c,[[0,-r],[-r,r*.72],[r,r*.72],[0,-r]]);c.beginPath();c.ellipse(0,r*.12,r*.5,r*.22,0,0,TAU);c.stroke();ring(c,0,r*.12,r*.12);
  }else if(kind==='rose'){
   for(let i=0;i<5;i++){c.save();c.rotate(i*TAU/5+phase*.08);c.beginPath();c.ellipse(0,-r*.36,r*.35,r*.55,0,0,TAU);c.stroke();c.restore();}ring(c,0,0,r*.18);
  }else if(kind==='alien'){
   c.beginPath();c.ellipse(0,0,r*.76,r,0,0,TAU);c.stroke();for(const sign of [-1,1]){c.beginPath();c.ellipse(sign*r*.35,-r*.1,r*.17,r*.34,-sign*.5,0,TAU);c.fill();}
  }else if(kind==='star')star(c,0,0,r);
  else if(kind==='card'){c.strokeRect(-r*.65,-r,r*1.3,r*2);star(c,0,0,r*.42);}
  else {ring(c,0,0,r*.76);ring(c,0,0,r*.35);for(let i=0;i<4;i++){c.save();c.rotate(i*TAU/4+phase*.1);line(c,[[0,-r*.55],[0,-r]]);c.restore();}}
 }
 function shell(style,accent){
  const key=style+'|'+accent;if(key===cacheKey)return;cacheKey=key;
  g.clearRect(0,0,1672,941);g.save();g.strokeStyle=accent;g.fillStyle=accent;g.lineWidth=4;g.lineCap='round';
  if(['ninja','uchiha'].includes(style)){
   for(const [x,y] of [[240,550],[1450,530]]){g.save();g.translate(x,y);g.rotate(-.3);sigil(g,style==='uchiha'?'sharingan':'rasengan',125);g.restore();}
   for(let j=0;j<5;j++)line(g,[[180,770+j*18],[440,690+j*16],[890,245+j*20],[1400,180+j*22]]);
  }else if(style==='pirate'){
   g.save();g.translate(290,590);sigil(g,'compass',165);g.restore();
   g.setLineDash([12,14]);g.beginPath();g.moveTo(270,800);g.bezierCurveTo(380,420,1150,750,1400,340);g.stroke();g.setLineDash([]);
   for(let j=0;j<4;j++)line(g,[[90,480+j*36],[1450,120+j*36]]);
  }else if(style==='saiyan'){
   for(const [x,y] of [[220,620],[1450,620]]){g.save();g.translate(x,y);sigil(g,'ki-core',145);g.restore();}
   for(let j=0;j<11;j++){const x=160+j*130;line(g,[[x,900],[x+45,640],[x+15,670],[x+130,220]]);}
  }else if(style==='water'){
   for(let j=0;j<9;j++){g.beginPath();for(let x=50;x<1650;x+=12)g.lineTo(x,180+j*72+Math.sin(x/150+j*.65)*42);g.stroke();}
  }else if(style==='soul'||style==='flame'){
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
   for(let i=0;i<10;i++){g.save();g.translate(170+(i*313)%1400,190+(i*167)%600);g.rotate(i*.7);sigil(g,'clover',40+i%3*12);g.restore();}
   for(let i=0;i<3;i++)ring(g,835,470,260+i*28);
  }else if(style==='gold'){
   for(let i=0;i<22;i++)star(g,130+(i*233)%1430,170+(i*149)%660,15+i%4*7);
   for(const x of [220,1450]){g.save();g.translate(x,590);sigil(g,'rose',110);g.restore();}
  }else if(style==='spy'){
   for(const x of [220,1440]){g.save();g.translate(x,560);sigil(g,'rose',100);g.restore();}
   for(let i=0;i<14;i++)line(g,[[100+i*115,900],[620+i*115,80]]);
  }else if(style==='occult'){
   for(const x of [220,1440]){g.save();g.translate(x,560);sigil(g,'alien',100);g.restore();for(let i=0;i<4;i++)ring(g,x,560,120+i*20);}
  }else if(style==='assassin'){
   for(const x of [230,1440]){g.save();g.translate(x,550);sigil(g,'crosshair',125);g.restore();}
   for(let i=0;i<8;i++)line(g,[[100,270+i*60],[1570,270+i*60]]);
  }
  g.restore();g.globalCompositeOperation='destination-in';g.drawImage(shellMask,0,0);g.globalCompositeOperation='source-over';
 }
 const emblemCanvas=document.createElement('canvas');emblemCanvas.width=128;emblemCanvas.height=128;
 const e=emblemCanvas.getContext('2d'),pulse=document.createElement('canvas');pulse.width=1672;pulse.height=941;const pc=pulse.getContext('2d');
 function button(key,style,p,state,time){
  const f=faces[key];if(!f||style==='none'||!style)return;
  const home=key==='Home',active=!!state[key],r=(f.radius||50)-5;
  ctx.save();ctx.clip(f.path);ctx.translate(...f.center);ctx.scale(r/56,r/56);
  const phase=time/(p.effectSpeed*1000)*TAU,boost=active?1:.72;
  let bg=p.buttonColors?.[key]?.[active?'pressed':'rest']||(active?p.pressed:p.buttonBaseColor),ink=p.accent;
  // Theme materials deliberately replace the face; its pressed color becomes the rim.
  const orb=style==='dragon-balls',eye=style==='sharingan';
  if(orb)bg='#f28b18';if(eye)bg='#b5102a';if(style==='rasengan')bg='#064a80';
  const grad=ctx.createRadialGradient(-18,-22,2,0,0,65);grad.addColorStop(0,orb?'#fff1a5':eye?'#f84454':style==='rasengan'?'#b0f5ff':bg);grad.addColorStop(.6,bg);grad.addColorStop(1,orb?'#9c3d03':eye?'#540512':style==='rasengan'?'#032547':'#10131e');
  ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,56,0,TAU);ctx.fill();
  ctx.lineWidth=active?5:2;ctx.strokeStyle=active?(p.buttonColors?.[key]?.pressed||p.pressed):orb?'#ffcc5e':eye?'#2d0610':p.accent;ring(ctx,0,0,52);
  if(orb){
   const count={A:1,B:2,X:3,Y:4}[key]||4;ctx.fillStyle='#bc2818';
   if(count===1)star(ctx,0,0,13);else for(let i=0;i<count;i++){const a=i*TAU/count-Math.PI/2;star(ctx,Math.cos(a)*20,Math.sin(a)*20,9);}
  }else{
   const motifs={'ninja-seals':'rasengan','pirate-coins':'compass','slayer-crests':'water-crest','soul-marks':'soul-flame','cursed-seals':'void','hero-tech':'crosshair','saw-teeth':'saw','hunter-cards':'card','clover-runes':'clover','duel-gems':'millennium','gold-stars':'star','spy-tech':'rose','occult-eyes':'alien','kaiju-cores':'ki-core','crosshairs':'crosshair'};
   e.clearRect(0,0,128,128);e.save();e.translate(64,64);e.strokeStyle=e.fillStyle=eye?'#180710':style==='rasengan'?'#d6ffff':ink;e.globalAlpha=boost;sigil(e,motifs[style]||style,home?38:29,phase*(eye?.22:1));e.restore();ctx.drawImage(emblemCanvas,-64,-64);
  }
  // Labels stay legible on stylized ABXY buttons; Home is always reserved for its emblem.
  if(!home&&(p.themeLabels??true)){ctx.fillStyle='#ffffff';ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.font='700 16px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(key,34,33);ctx.shadowBlur=0;}
  ctx.restore();
 }
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
   c.globalCompositeOperation='source-over';c.clearRect(0,0,1672,941);c.strokeStyle=p.accent;c.fillStyle=p.accent;c.lineWidth=5;
   if(['water','pirate'].includes(style)){
    for(let j=0;j<3;j++){c.beginPath();for(let x=40;x<1640;x+=12)c.lineTo(x,420+j*100+Math.sin(x/170+phase+j)*55);c.stroke();}
   }else if(['saiyan','hero','kaiju'].includes(style)){
    for(let i=0;i<16;i++){const x=100+i*100,y=940-((time/(p.effectSpeed*1000)+i*.137)%1)*1000;line(c,[[x,y],[x+22,y-85],[x+12,y-65]]);}
   }else if(['ninja','uchiha','curse','occult'].includes(style)){
    for(const x of [240,1440])for(let i=0;i<3;i++){c.beginPath();c.arc(x,570,90+i*32,phase+i,phase+i+1.5);c.stroke();}
   }else if(['soul','flame','chainsaw'].includes(style)){
    for(let i=0;i<18;i++){const y=900-((time/(p.effectSpeed*1000)+i*.17)%1)*800,x=100+(i*211)%1480;c.beginPath();c.ellipse(x,y,3,12+i%4*2,.3,0,TAU);c.fill();}
   }else{
    // A restrained scanning accent follows the remaining engraved treatments.
    const x=(phase/TAU%1)*1900-120;c.beginPath();c.moveTo(x,940);c.lineTo(x+330,0);c.stroke();
   }
   c.globalCompositeOperation='destination-in';c.drawImage(shellMask,0,0);c.globalCompositeOperation='source-over';
   ctx.save();ctx.globalAlpha=amount*(p.animationMode==='reduced'?.16:.38);ctx.drawImage(pulse,0,0);ctx.restore();
  },
  bursts(p,time){
   if(!p.inputBurst||p.animationMode==='still'||!impacts.size)return;
   // Reuse a small transient canvas; pulses are confined to shell, never button faces.
   const c=pc;c.globalCompositeOperation='source-over';c.clearRect(0,0,1672,941);c.strokeStyle=p.accent;c.lineWidth=4;
   for(const [key,start] of impacts){const progress=(time-start)/700,pos=faces[key]?.center||({LSB:[456,290],RSB:[1033,523],LT:[456,25],RT:[1180,25]})[key];if(!pos)continue;c.globalAlpha=(1-progress)*.6*(p.animationMode==='reduced'?.35:1);for(let i=0;i<2;i++)ring(c,...pos,52+progress*130+i*12);}
   c.globalAlpha=1;c.globalCompositeOperation='destination-in';c.drawImage(shellMask,0,0);ctx.drawImage(pulse,0,0);c.globalCompositeOperation='source-over';
  },
  controls(p,state,time){for(const key of ['A','B','X','Y'])button(key,p.buttonStyle,p,state,time);button('Home',p.homeStyle,p,state,time);},
  sample(c,kind,color){c.save();c.translate(32,32);c.strokeStyle=c.fillStyle=color;sigil(c,kind,23);c.restore();}
 };
}
