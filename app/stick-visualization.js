// Joystick presentation only. No filtering, remapping or delay is applied to live axes.
const STICK_DEFAULTS={stickStyle:'tilt',stickTrailLength:'medium',stickTrailColor:'#ff2d55'};
function createStickTrailPainter(ctx,getLayout){
 let history=[[],[]],previous=[null,null],lastTime=-Infinity,identity='',style='tilt';
 const spans={short:160,medium:340,long:650},clamp=v=>Math.max(-1,Math.min(1,Number.isFinite(v)?v:0));
 return {
  inspect:()=>history.map(points=>points.map(p=>({...p}))),
  update(p,state,time){
   const layout=getLayout(),nextStyle=p.stickStyle||'tilt',paused=time-lastTime>250,rewound=time<lastTime;
   if(layout.id!==identity||nextStyle!==style||paused||rewound||nextStyle==='tilt'||p.animationMode==='still'){history=[[],[]];previous=[null,null];}
   identity=layout.id;style=nextStyle;lastTime=time;
   const life=(spans[p.stickTrailLength]||340)*(p.animationMode==='reduced'?.55:1);
   for(let i=0;i<2;i++){
    const points=history[i];let x=clamp(state.axes?.[i*2]),y=clamp(state.axes?.[i*2+1]),length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}
    // Keep a predecessor until the adjoining segment has faded, avoiding a snapped tail.
    while(points.length>1&&time-points[1].time>life)points.shift();
    if(points.length===1&&time-points[0].time>life)points.length=0;
    const prior=previous[i];previous[i]={x,y,time};
    if(nextStyle==='tilt'||p.animationMode==='still')continue;
    if(prior&&Math.hypot(x-prior.x,y-prior.y)>.001){
     if(!points.length||time-points.at(-1).time>32)points.push({...prior});
     points.push({x,y,time});while(points.length>256)points.shift();
    }
   }
  },
  draw(p,state,index,time){
   if((p.stickStyle||'tilt')==='tilt')return;
   const stick=getLayout().sticks[index];if(!stick)return;
   const [x,y,,,,radius,rimRadius]=stick,r=Math.max(8,(rimRadius||radius*1.35)-7),travel=r-8,scale=r/118,life=(spans[p.stickTrailLength]||340)*(p.animationMode==='reduced'?.55:1),points=history[index];
   ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();ctx.lineCap='round';ctx.lineJoin='round';
   const xy=a=>[x+a.x*travel,y+a.y*travel],mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
   // Midpoint curves remain in the convex socket and keep the endpoint at the current input.
   for(const outline of [true,false])for(let i=1;i<points.length;i++){
    const a=xy(points[i-1]),b=xy(points[i]),start=i>1?mid(xy(points[i-2]),a):a,end=i===points.length-1?b:mid(a,b),age=Math.max(0,Math.min(1,1-(time-points[i].time)/life)),alpha=age*age;
    if(alpha<.003)continue;
    ctx.beginPath();ctx.moveTo(...start);ctx.quadraticCurveTo(...a,...end);
    ctx.globalAlpha=alpha*(outline?.65:.9);ctx.strokeStyle=outline?'#060b14':p.stickTrailColor||'#ff2d55';ctx.lineWidth=(outline?7:3.5)*scale;ctx.stroke();
   }
   let ax=clamp(state.axes?.[index*2]),ay=clamp(state.axes?.[index*2+1]),length=Math.hypot(ax,ay);if(length>1){ax/=length;ay/=length;}
   const cx=x+ax*travel,cy=y+ay*travel;ctx.globalAlpha=1;ctx.fillStyle=p.stickTrailColor||'#ff2d55';ctx.strokeStyle='#080d16';ctx.lineWidth=2.5*scale;ctx.beginPath();ctx.arc(cx,cy,6*scale,0,Math.PI*2);ctx.fill();ctx.stroke();
   // A small white center makes the exact current position legible on all skins.
   ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx,cy,2*scale,0,Math.PI*2);ctx.fill();ctx.restore();
  }
 };
}
