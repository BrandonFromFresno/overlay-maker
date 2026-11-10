// Original vector emblems and materials. Artwork stays sharp at native export size.
// No downloaded sprites, traced footage, or decorative text is used.
function createButtonArtworkPainter(){
 const TAU=Math.PI*2,cache=new Map();
 const mix=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
 const rgba=(a,opacity)=>`rgba(${[1,3,5].map(i=>parseInt(a.slice(i,i+2),16)).join(',')},${opacity})`;
 const paths={
  'hero-bolt':'M.18-1-.72.18H-.12L-.3 1 .78-.25H.1Z',
  kunai:'M0-1 .3-.15 .13.08 .1.57H-.1L-.13.08-.3-.15Z M-.35.14H.35V.28H-.35Z',
  shuriken:'M0-1 .23-.25 1 0 .25.23 0 1-.23.25-1 0-.25-.23Z M0-.15A.15.15 0 1 0 0 .15 .15.15 0 1 0 0-.15Z',
  'anti-magic':'M-.2-1 .37-.8 .16.4H-.23Z M-.55.34H.55L.42.52H.09V.95H-.09V.52H-.42Z',
  'hunter-mark':'M-.82-.8-.45-.8 0-.16 .45-.8 .82-.8 .2.02 .82.85 .43.85 0 .2-.43.85-.82.85-.2.02Z M-.8.91H.8V1.02H-.8Z',
  'kaiju-mask':'M-.85-1-.4-.65 0-.8 .4-.65 .85-1 .61-.35 .78.15 .42.85 0 1-.42.85-.78.15-.61-.35Z M-.48-.17-.14.02-.18.18-.5.02Z M.48-.17 .14.02 .18.18 .5.02Z M-.38.49H.38L.24.68H-.24Z',
  chimera:'M-.74-.35-.85-1-.29-.7Q0-.85 .29-.7L.85-1 .74-.35Q1.02.25 .6.77L0 1-.6.77Q-1.02.25-.74-.35Z M-.5-.02A.16.2 0 1 0-.18-.02 .16.2 0 1 0-.5-.02Z M.18-.02A.16.2 0 1 0 .5-.02 .16.2 0 1 0 .18-.02Z M-.14.4 0 .26 .14.4 0 .49Z',
  alien:'M0-1C-.8-1-1.12-.42-.68.26L0 1 .68.26C1.12-.42 .8-1 0-1Z M-.65-.3C-.5-.4-.15-.12-.14.12-.41.2-.67-.04-.65-.3Z M.65-.3C.5-.4 .15-.12 .14.12 .41.2 .67-.04 .65-.3Z',
  'pull-cord':'M-.85-.87H.85L.74-.32H.15V.43H.39Q.55.43 .55.6V.88Q.55 1 .36 1H-.36Q-.55 1-.55.88V.6Q-.55.43-.39.43H-.15V-.32H-.74Z M-.58-.71V-.5H.58V-.71Z',
  'pirate-skull':'M0-.8C-.66-.8-.86-.22-.61.18L-.34.35V.72H.34V.35L.61.18C.86-.22 .66-.8 0-.8Z M-.51-.23A.2.22 0 1 0-.11-.23 .2.22 0 1 0-.51-.23Z M.11-.23A.2.22 0 1 0 .51-.23 .2.22 0 1 0 .11-.23Z M0 .01-.12.23H.12Z M-.2.44H-.12V.7H-.2Z M.12.44H.2V.7H.12Z',
  anchor:'M-.11-.47H.11V.54Q.57.45 .72.15L.47.2 .91-.27 1 .37 .8.23Q.62.79 0 1-.62.79-.8.23L-1 .37-.91-.27-.47.2-.72.15Q-.57.45-.11.54Z M-.42-.28H.42V-.1H-.42Z M0-.99A.28.28 0 1 0 0-.43 .28.28 0 1 0 0-.99Z M0-.85A.14.14 0 1 1 0-.57 .14.14 0 1 1 0-.85Z',
  'leaf-seal':'M-.1-.82C-.7-.89-1-.3-.77.25-.56.8.27.98.65.4.94-.06.61-.65.11-.62-.35-.59-.5-.04-.19.17.01.35.29.1.16-.1L.36-.21C.65.25.08.72-.38.37-.84-.02-.6-.65-.1-.62L.59-.98 .49-.48 .13-.37 .2-.65Z',
  'round-glasses':'M-.48-.49A.45.45 0 1 0-.48.41 .45.45 0 1 0-.48-.49Z M-.48-.33A.29.29 0 1 1-.48.25 .29.29 0 1 1-.48-.33Z M.48-.49A.45.45 0 1 0 .48.41 .45.45 0 1 0 .48-.49Z M.48-.33A.29.29 0 1 1 .48.25 .29.29 0 1 1 .48-.33Z M-.13-.13H.13V.01H-.13Z M0 .48C-.26.42-.3.78-.73.73-.49 1-.13.89 0 .71 .13.89 .49 1 .73.73 .3.78 .26.42 0 .48Z'
 };
 function path(data){let p=cache.get(data);if(!p){p=new Path2D(data);cache.set(data,p);}return p;}
 function star(c,x,y,r,n=5){c.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n-Math.PI/2,d=i%2?r*.44:r;c.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d);}c.closePath();c.fill();}
 function disk(c,x,y,r,fill){c.fillStyle=fill;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
 function ring(c,r,color,width){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();}
 function flame(c,r,phase,ink){
  const lean=Math.sin(phase*1.1)*r*.14,p=new Path2D();p.moveTo(0,r);p.bezierCurveTo(-r*.95,r*.58,-r*.88,-r*.05,-r*.36,-r*.56);p.bezierCurveTo(-r*.37,-r*.03,r*.02,-r*.1,lean,-r);p.bezierCurveTo(r*.1,-r*.55,r*.99,-r*.04,r*.72,r*.56);p.quadraticCurveTo(r*.4,r*.94,0,r);c.fillStyle=ink;c.fill(p);
  c.save();c.scale(.45,.6);c.translate(0,r*.55);c.fillStyle=mix(ink,'#ffffff',.8);c.fill(p);c.restore();
 }
 function symbol(c,kind,r,phase=0){
  c.save();c.scale(r,r);c.lineWidth=.06;c.lineCap='round';c.lineJoin='round';const ink=typeof c.fillStyle==='string'&&/^#[0-9a-f]{6}$/i.test(c.fillStyle)?c.fillStyle:'#f4dfac';
  const material=c.createLinearGradient(-.7,-1,.8,1);material.addColorStop(0,mix(ink,'#ffffff',parseInt(ink.slice(1,3),16)<50?.08:.5));material.addColorStop(.45,ink);material.addColorStop(1,mix(ink,'#000000',.28));c.fillStyle=material;c.strokeStyle=ink;
  if(paths[kind]){const p=path(paths[kind]);c.save();c.translate(.025,.04);c.fillStyle='#060a1280';c.fill(p,'evenodd');c.restore();c.fill(p,'evenodd');c.strokeStyle=rgba(mix(ink,'#ffffff',.7),.4);c.lineWidth=.025;c.stroke(p);}
  else if(kind==='star')star(c,0,0,1);
  else if(kind==='straw-hat'){
   c.beginPath();c.ellipse(0,.35,1,.24,0,0,TAU);c.fill();const crown=path('M-.65.29C-.64-.8 .62-.8 .65.29Z');c.fill(crown);c.fillStyle=mix(ink,'#000000',.58);c.fill(path('M-.63.02Q0 .17 .63.02V.22Q0 .39-.63.22Z'));c.strokeStyle=rgba(ink,.55);c.lineWidth=.035;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*.15,.29);c.lineTo(i*.19,.51);c.stroke();}
  }else if(kind==='compass'){
   ring(c,.88,ink,.065);ring(c,.7,rgba(ink,.5),.025);for(let i=0;i<8;i++){c.save();c.rotate(i*TAU/8);c.fillStyle=i%2?mix(ink,'#000000',.25):material;c.fill(path('M0-1 .15 0 0 .34-.15 0Z'));c.restore();}disk(c,0,0,.12,mix(ink,'#ffffff',.6));
  }else if(kind==='hell-butterfly'){
   for(const sign of [-1,1]){c.save();c.scale(sign,1);c.fill(path('M0-.08C.15-.74 .81-1.2 .99-.65 1.11-.12 .64.12 .14.16 .82.03 .94.62 .51.94 .19.84 .06.49 0-.08Z'));c.strokeStyle=mix(ink,'#000000',.55);c.lineWidth=.045;c.stroke(path('M.12.03 .64-.48 M.12.2 .52.6'));c.restore();}disk(c,0,-.22,.1,ink);c.fillStyle=ink;c.fill(path('M-.05-.15H.05L.09.65H-.09Z'));
  }else if(kind==='ladybug'){
   c.beginPath();c.ellipse(0,.12,.66,.83,0,0,TAU);c.fill();disk(c,0,-.76,.23,ink);c.strokeStyle=mix(ink,'#000000',.7);c.lineWidth=.07;c.beginPath();c.moveTo(0,-.55);c.lineTo(0,.93);c.stroke();for(const sign of [-1,1])for(const y of [-.13,.39])disk(c,sign*.31,y,.13,mix(ink,'#000000',.72));
  }else if(kind==='clover'){
   for(let i=0;i<5;i++){c.save();c.rotate(i*TAU/5);c.fill(path('M0 .1C-.62-.27-.57-1.1-.13-.94 0-.9 .04-.79 .04-.7 .19-1.16 .67-.88 .45-.34 .29-.08 .13.03 0 .1Z'));c.restore();}disk(c,0,0,.15,mix(ink,'#ffffff',parseInt(ink.slice(1,3),16)<50?.08:.5));
  }else if(kind==='saw'){
   c.beginPath();for(let i=0;i<48;i++){const a=i*TAU/48,d=i%2?.82:1;c.lineTo(Math.cos(a)*d,Math.sin(a)*d);}c.closePath();c.fill();disk(c,0,0,.48,mix(ink,'#000000',.65));ring(c,.41,ink,.07);disk(c,0,0,.11,ink);for(let i=0;i<4;i++)disk(c,Math.cos(i*TAU/4)*.65,Math.sin(i*TAU/4)*.65,.045,'#ffffff');
  }else if(kind==='millennium'){
   c.fill(path('M0-1 1 .85H-1Z'));c.strokeStyle=mix(ink,'#000000',.5);c.lineWidth=.055;c.stroke(path('M0-.69 .73.66H-.73Z'));c.fillStyle=mix(ink,'#000000',.8);c.fill(path('M-.52.17Q0-.37 .52.17 0 .7-.52.17Z'));disk(c,0,.17,.17,ink);disk(c,0,.17,.075,'#11151e');
  }else if(kind==='rose'){
   for(let i=0;i<7;i++){c.save();c.rotate(i*TAU/7);c.fillStyle=i%2?material:mix(ink,'#000000',.15);c.fill(path('M0 .35C-.58.22-.72-.6-.23-.94 .12-1.05 .65-.65 .43-.12 .26-.3 .03-.21 0 .35Z'));c.restore();}for(let i=0;i<3;i++){c.save();c.rotate(i*TAU/3);c.scale(.44,.44);c.fillStyle=mix(ink,'#ffffff',.32);c.fill(path('M0 .4C-.8 0-.5-.9 .08-.75 .56-.65 .6.04 0 .4Z'));c.restore();}
  }else if(kind==='card'){
   c.fill(path('M-.68-1H.68V1H-.68Z M-.55-.87V.87H.55V-.87Z'));star(c,0,-.25,.38);c.fillStyle=ink;c.fillRect(-.38,.38,.76,.1);c.fillRect(-.38,.6,.48,.075);
  }else if(kind==='water-crest'){
   for(let i=0;i<3;i++){c.save();c.translate(0,(i-1)*.48);c.fillStyle=i===1?material:rgba(ink,.7);c.fill(path('M-1 .16C-.58.34-.21-.44 .23-.35 .55-.29 .58.18 1-.04 .68.49 .32.14 .1-.04-.17-.28-.5.58-1 .16Z'));c.restore();}
  }else if(kind==='flame'||kind==='soul-flame'){flame(c,1,phase,ink);}
  else if(kind==='crosshair'){
   for(let i=0;i<4;i++){c.save();c.rotate(i*TAU/4);c.fill(path('M-.58-1H-.16V-.84H-.42V-.53H-.58Z'));c.restore();}ring(c,.47,ink,.075);disk(c,0,0,.09,ink);
  }else if(kind==='ki-core'){
   for(let i=0;i<8;i++){c.save();c.rotate(i*TAU/8);c.fill(path('M-.12-.54 0-1 .12-.54Z'));c.restore();}ring(c,.47,ink,.075);disk(c,0,0,.29,material);
  }else if(kind==='void'){
   c.save();c.rotate(-.35);c.scale(1,.38);ring(c,.9,ink,.18);c.restore();disk(c,0,0,.43,'#080d1a');ring(c,.44,ink,.04);
  }else if(kind==='rasengan'){
   for(let i=0;i<3;i++){c.save();c.rotate(i*TAU/3+phase*.35);c.fill(path('M-.9-.14C-.25-1.2 1.15-.55 .77.5 .77-.34-.35-.6-.9-.14Z'));c.restore();}disk(c,0,0,.16,ink);
  }else if(kind==='sharingan'){ring(c,.7,ink,.055);disk(c,0,0,.15,ink);for(let i=0;i<3;i++){c.save();c.rotate(i*TAU/3+phase*.12);c.fill(path('M0-.83C.32-.85 .42-.44 .12-.35 .23-.49 .15-.6 0-.56A.14.14 0 1 1 0-.83Z'));c.restore();}}
  c.restore();
 }
 function energyOrb(c,r,t,accent){
  c.save();const core=c.createRadialGradient(-r*.2,-r*.3,0,0,0,r);core.addColorStop(0,'#e7ffff');core.addColorStop(.22,mix(accent,'#ffffff',.55));core.addColorStop(.66,accent);core.addColorStop(1,'#06142f');disk(c,0,0,r,core);
  for(let i=0;i<4;i++){c.save();c.rotate(t*.45+i*.93);c.scale(1,.38+.15*Math.sin(t*.6+i));const gradient=c.createLinearGradient(-r,0,r,0);gradient.addColorStop(0,rgba(accent,.05));gradient.addColorStop(.45,'#e8ffff');gradient.addColorStop(1,rgba(accent,.05));c.strokeStyle=gradient;c.lineWidth=r*(.045+i*.006);c.beginPath();c.arc(0,0,r*(.55+i*.09),0,TAU);c.stroke();c.restore();}
  c.fillStyle='#ffffff';c.beginPath();c.ellipse(-r*.24,-r*.4,r*.25,r*.08,-.5,0,TAU);c.fill();c.restore();
 }
 function draw(ctx,f,key,style,p,state,time){
  if(!f||!style||style==='none')return;const home=key==='Home',active=!!state[key],r=Math.max(8,(f.radius||50)-4),t=time/(p.effectSpeed*1000)*TAU;
  const colors=p.buttonColors?.[key]||{},pressed=colors.pressed||p.pressed,base=colors.rest||p.buttonBaseColor||'#ffffff',ink=p.accent,orb=style==='dragon-balls',eye=style==='sharingan';
  const dark=orb?'#713008':eye?'#28050e':style==='rasengan'?'#04182e':mix(base,'#0b1220',.88),mid=orb?'#e98a19':eye?'#a61630':mix(ink,'#111824',.72);
  ctx.save();ctx.clip(f.path);ctx.translate(...f.center);ctx.scale(r/56,r/56);
  const surface=ctx.createRadialGradient(-18,-24,0,0,6,65);surface.addColorStop(0,orb?'#fff1a8':eye?'#e84657':mix(mid,'#ffffff',.13));surface.addColorStop(.55,mid);surface.addColorStop(1,dark);disk(ctx,0,0,56,surface);
  ring(ctx,54,mix(mid,'#ffffff',.35),1);ring(ctx,51,active?pressed:rgba(ink,.55),active?4:1.2);ring(ctx,48,rgba('#02050c',.6),1);
  if(orb){
   const count={A:1,B:2,X:3,Y:4}[key]||4;ctx.fillStyle='#a72b18';if(count===1)star(ctx,0,2,12);else for(let i=0;i<count;i++){const a=i*TAU/count-Math.PI/2;star(ctx,Math.cos(a)*18,Math.sin(a)*18+2,8.5);}
   ctx.strokeStyle='rgba(255,224,140,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,44,.15,1.65);ctx.stroke();
  }else if(style==='rasengan')energyOrb(ctx,45,t,'#278fd8');
  else if(eye){
   for(let i=0;i<48;i++){const a=i*TAU/48+Math.sin(i*7)*.012;ctx.strokeStyle=i%3?'#5b092780':'#ff6c6838';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(Math.cos(a)*18,Math.sin(a)*18);ctx.lineTo(Math.cos(a)*43,Math.sin(a)*43);ctx.stroke();}ctx.save();ctx.fillStyle='#160710';symbol(ctx,'sharingan',43,t);ctx.restore();
  }else{
   const motif={ 'ninja-seals':['leaf-seal','kunai','shuriken','rasengan'],'pirate-coins':['straw-hat','anchor','pirate-skull','compass'],'soul-marks':['hell-butterfly','anti-magic','soul-flame','hell-butterfly'],'gold-stars':['ladybug','star','rose','ladybug'],'hero-tech':['hero-bolt','crosshair','hero-bolt','crosshair'] }[style]?.[['A','B','X','Y'].indexOf(key)]||{'slayer-crests':'water-crest','cursed-seals':'void','saw-teeth':'saw','hunter-cards':'card','clover-runes':'clover','duel-gems':'millennium','spy-tech':'rose','occult-eyes':'alien','kaiju-cores':'ki-core','crosshairs':'crosshair'}[style]||style;
   ctx.fillStyle=style==='flame'?'#ffac48':style==='soul-flame'?'#80e6ff':mix(ink,'#ffffff',.55);symbol(ctx,motif,home?35:29,t);
  }
  // A restrained specular crescent gives every material a clean spherical edge.
  ctx.save();ctx.rotate(Math.sin(t*.35)*.12);const sheen=ctx.createLinearGradient(-40,-35,25,-15);sheen.addColorStop(0,'rgba(255,255,255,0)');sheen.addColorStop(.55,orb?'rgba(255,255,255,.6)':'rgba(255,255,255,.13)');sheen.addColorStop(1,'rgba(255,255,255,0)');ctx.strokeStyle=sheen;ctx.lineWidth=orb?5:2;ctx.beginPath();ctx.arc(0,0,44,3.75,5.35);ctx.stroke();ctx.restore();
  if(!home&&(p.themeLabels??true)){disk(ctx,34,33,10,'#0c111de8');ctx.fillStyle='#ffffff';ctx.font='700 15px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(key,34,33);}
  ctx.restore();
 }
 return{symbol,draw};
}
