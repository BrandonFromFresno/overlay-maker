// Independent right-trigger bursts. Uses the shared normalized input, never the demo bridge.
const COMIC_DEFAULTS={comicEnabled:false,comicSelection:'random',comicSize:1,comicDuration:350,comicX:0,comicY:0,comicIntensity:1,comicRotation:8,comicThreshold:.18,comicRepeat:false,comicInterval:160,comicMaxActive:4};
const COMIC_RANGES={comicSize:[.5,1.8],comicDuration:[220,650],comicX:[-600,600],comicY:[-350,350],comicIntensity:[.25,1.25],comicRotation:[0,18],comicThreshold:[.05,.95],comicInterval:[75,600],comicMaxActive:[1,8]};
function createComicGunfirePainter(ctx,getLayout,random=Math.random){
 const W=1672,H=1241,cell=10,cols=Math.ceil(W/cell),rows=Math.ceil(H/cell),stride=cols+1;
 let artwork=null,bursts=[],pressed=false,nextRepeat=Infinity,lastTime=-Infinity,identity='',placementKey='',placement=null,bag=[],serial=0;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);},lerp=(a,b,t)=>a+(b-a)*t;
 function prepare(){if(artwork)return;artwork=createComicArtwork();for(const asset of Object.values(artwork))for(const layer of asset.layers)for(const s of layer.shapes)s.path=new Path2D(s.d);}
 function fit(p,layout){
  const envelopeRotation=Math.max(p.comicRotation,...bursts.map(b=>Math.abs(b.rotation)*180/Math.PI)),envelopeIntensity=Math.max(p.comicIntensity,...bursts.map(b=>b.intensity));
  const key=[envelopeRotation,envelopeIntensity,layout.id,p.offsetX,p.offsetY,p.comicSize,p.comicIntensity,p.comicRotation,p.comicX,p.comicY].join('|');if(key===placementKey)return placement;
  placementKey=key;
  // Reserve the complete silhouettes, including floating trigger travel and gauges.
  // A low-resolution summed-area mask makes collision checks constant-time per candidate.
  const c=document.createElement('canvas');c.width=cols;c.height=rows;const g=c.getContext('2d',{willReadFrequently:true}),ox=p.offsetX||0,oy=p.offsetY||0;
  g.scale(1/cell,1/cell);g.translate(ox,oy);if(layout.body)g.drawImage(layout.body,0,300,1672,941);if(layout.floatImage)g.drawImage(layout.floatImage,0,0);
  g.fillStyle='#fff';for(const r of layout.reserved)g.fillRect(...r);
  const pixels=g.getImageData(0,0,cols,rows).data,sums=new Uint32Array((cols+1)*(rows+1));
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)sums[(y+1)*stride+x+1]=(pixels[(y*cols+x)*4+3]>2?1:0)+sums[y*stride+x+1]+sums[(y+1)*stride+x]-sums[y*stride+x];
  function free(x,y,hw,hh){const l=Math.max(0,Math.floor((x-hw)/cell)-1),r=Math.min(cols,Math.ceil((x+hw)/cell)+1),t=Math.max(0,Math.floor((y-hh)/cell)-1),b=Math.min(rows,Math.ceil((y+hh)/cell)+1);return sums[b*stride+r]-sums[t*stride+r]-sums[b*stride+l]+sums[t*stride+l]===0;}
  const [rx,ry,rw,rh]=layout.rt,rotation=(envelopeRotation+8)*Math.PI/180;
  // Reserve the entire overshoot, settling, jitter and exit envelope, not just a still frame.
  let result=null;
  for(let autoFit=1;autoFit>=.18&&!result;autoFit-=.08){
   const scale=.43*p.comicSize*autoFit,peak=1+.12*envelopeIntensity;
   const hw=(390*Math.cos(rotation)+218*Math.sin(rotation))*scale*peak+14,hh=(218*Math.cos(rotation)+390*Math.sin(rotation))*scale*peak+24;
   const targetX=rx+rw+ox+hw+18+p.comicX,targetY=ry+oy-hh-14+p.comicY;
   const loX=hw+8,hiX=W-hw-8,loY=hh+8,hiY=Math.min(H-hh-8,Math.max(390,ry+oy+rh+90));let best=Infinity;
   const consider=(x,y)=>{if(x<loX||x>hiX||y<loY||y>hiY||!free(x,y,hw,hh))return;const d=(x-targetX)**2+(y-targetY)**2*1.3;if(d<best){best=d;result={x,y,scale,autoFit,halfWidth:hw,halfHeight:hh};}};
   consider(Math.max(loX,Math.min(hiX,targetX)),Math.max(loY,Math.min(hiY,targetY)));
   for(let y=loY;y<=hiY;y+=12)for(let x=loX;x<=hiX;x+=12)consider(x,y);
  }
  placement=result;return placement;
 }
 function spawn(p,time){
  if(bursts.length>=p.comicMaxActive)return;
  if(!placement)return;
  let word=p.comicSelection;
  if(word==='random'){if(!bag.length){bag=['bang','zap','boom','pow'];for(let i=3;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}word=bag.pop();}
  const overlap=bursts.length>0;
  // Keep each instance's clock and motion intact; hand off lettering so rapid shots
  // never stack a small unreadable word over a full-size word.
  for(const old of bursts)if(old.handoffStart===undefined){old.handoffStart=time;old.handoffDuration=p.comicDuration;}
  bursts.push({word,overlap,start:time,duration:p.comicDuration,intensity:p.comicIntensity,rotation:(random()*2-1)*p.comicRotation*Math.PI/180,jx:(random()*2-1)*7,jy:(random()*2-1)*4,placement:{...placement},id:++serial});
 }
 function drawLayer(layer,alpha,secondary,power){for(const [i,s]of layer.shapes.entries()){ctx.save();if(layer.role==='accent'){const direction=[[-1,-1],[1,-1],[1,1],[-1,1]][i%4];ctx.translate(direction[0]*14*secondary*power,direction[1]*10*secondary*power);ctx.rotate((i%2?1:-1)*.018*secondary*power);}ctx.translate(s.dx||0,s.dy||0);ctx.globalAlpha=alpha*(s.opacity??1);if(s.clip){ctx.beginPath();ctx.rect(...s.clip);ctx.clip();}ctx.fillStyle=s.fill;ctx.fill(s.path);if(s.width&&s.stroke!=='none'){ctx.strokeStyle=s.stroke;ctx.lineWidth=s.width;ctx.lineJoin='round';ctx.stroke(s.path);}ctx.restore();}}
 return {
  // Snapshot supports deterministic producer QA without exposing mutable animation state.
  inspect:()=>({active:bursts.length,spawned:serial,pressed,placement:placement&&{...placement},instances:bursts.map(b=>({id:b.id,word:b.word,start:b.start}))}),
  draw(p,state,time){
   const enabled=p.comicEnabled&&p.animationMode!=='still';
   if(!enabled){bursts=[];pressed=false;nextRepeat=Infinity;lastTime=time;return;}
   const layout=getLayout(),changed=identity!==layout.id,rewound=time<lastTime,suspended=time-lastTime>1000&&Number.isFinite(lastTime);
   identity=layout.id;lastTime=time;
   if(changed||rewound){bursts=[];pressed=false;nextRepeat=Infinity;}
   if(suspended){bursts=[];nextRepeat=time+p.comicInterval;}
   prepare();const previousPlacement=placement;fit(p,layout);if(placement!==previousPlacement)for(const b of bursts)b.placement=placement&&{...placement};
   bursts=bursts.filter(b=>time-b.start<b.duration);
   // Clear at neutral only re-arms; already visible instances complete their own exit.
   const depth=state.RT||0,threshold=p.comicThreshold??.18,release=Math.max(.01,threshold-.08);
   if(pressed&&depth<=release){pressed=false;nextRepeat=Infinity;}
   if(!pressed&&depth>=threshold){pressed=true;spawn(p,time);nextRepeat=time+p.comicInterval;}
   else if(pressed&&p.comicRepeat&&time>=nextRepeat){spawn(p,time);nextRepeat+=(Math.floor((time-nextRepeat)/p.comicInterval)+1)*p.comicInterval;}
   if(!p.comicRepeat)nextRepeat=time+p.comicInterval;
   // Composite every burst silhouette first, then all lettering. Incoming geometry
   // must never paint over the outgoing word during its readable handoff.
   for(const lettering of [false,true])for(const b of bursts){
    if(!b.placement)continue;
    const ms=(time-b.start)*350/b.duration;if(ms<0)continue;const a=artwork[b.word],reduced=p.animationMode==='reduced',power=b.intensity*(reduced?.35:1),exit=smooth((ms-200)/150),alpha=(.24+.76*smooth(ms/25))*(1-exit);
    const impact=ms<25?lerp(.42,.34,smooth(ms/25)):ms<70?lerp(.34,1+.10*power,1-(1-(ms-25)/45)**3):1+.10*power*Math.exp(-(ms-70)/32)*Math.cos((ms-70)/32);
    const secondary=smooth((ms-70)/150),settle=ms<25?.36:ms<85?lerp(.36,1+.07*power,1-(1-(ms-25)/60)**3):1+.07*power*Math.exp(-(ms-85)/40)*Math.cos((ms-85)/27);
    ctx.save();ctx.translate(b.placement.x+b.jx,b.placement.y+b.jy-12*exit*power);ctx.rotate(b.rotation+a.tilt*(reduced?.25:1)*(1-exit));ctx.scale(b.placement.scale,b.placement.scale);
    for(const layer of a.layers){
     const type=layer.role==='type'||layer.role==='shine',accent=layer.role==='accent',cloud=layer.role==='cloud';
     if(type!==lettering)continue;
     const s=(type?settle:impact)*(1-(type?.12:.06)*exit)*(accent?1+.10*secondary*power:cloud?1+.025*secondary*power:1);
     ctx.save();const snap=1-smooth(ms/130);if(type&&b.word==='zap')ctx.scale(1+.055*snap*power,1-.035*snap*power);if(type&&b.word==='pow')ctx.scale(1+.025*snap*power,1-.065*snap*power);if(cloud)ctx.scale(1+.03*secondary*power,1+.04*secondary*power);ctx.scale(s,s);if(!type)ctx.rotate((b.word==='zap'?-.025:.018)*power*secondary*(reduced?.25:1));if(type)ctx.translate(0,ms<90?(1-s)*10:0);
     const handoff=b.handoffStart===undefined?0:smooth(((time-b.handoffStart)*350/b.handoffDuration-35)/20),arrive=b.overlap&&type?smooth((ms-35)/20):1;
     drawLayer(layer,alpha*arrive*(type?1-handoff:1-.92*handoff)*(accent?1-.25*exit:1),secondary,power);ctx.restore();
    }
    ctx.restore();
   }
  }
 };
}
