// Original flowing-band renderer. Inspired by the reference's controls, not its shader.
const ABSTRACT_DATA=[
 {id:'silk',name:'Silk waves',description:'Soft, flowing folds',complexity:10,distortion:7,saturation:2.4,mix:3,tone:'light'},
 {id:'bloom',name:'Folded bloom',description:'Curved fans with a satin edge',complexity:14,distortion:11,saturation:2,mix:5,tone:'light'},
 {id:'tide',name:'Deep tide',description:'Wide, sculpted color bands',complexity:7,distortion:16,saturation:3.2,mix:8,tone:'dark'}
];
function createAbstractPainter(ctx,mask,forceCPU=false){
 const TAU=Math.PI*2,canvas=()=>document.createElement('canvas');
 const source=canvas(),layer=canvas(),previous=canvas(),next=canvas(),blend=canvas();
 layer.width=1672;layer.height=941;const g=layer.getContext('2d');
 for(const c of [previous,next,blend]){c.width=320;c.height=180;}
 const pg=previous.getContext('2d'),ng=next.getContext('2d'),bg=blend.getContext('2d'),pixels=pg.createImageData(320,180);
 let gl=null,program=null,initialized=false,listeners=false,backend='idle',key='',cpuKey='',tick=-Infinity,lastPhase=0;
 const clamp=n=>Math.max(0,Math.min(1,n));
 function init(){
  if(initialized)return;initialized=true;backend='cpu';if(forceCPU)return;
  try{
   source.width=768;source.height=432;gl=source.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true});if(!gl)return;
   const shader=(type,text)=>{const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw Error('Abstract shader compilation');}return s;};
   const vertex=shader(gl.VERTEX_SHADER,'attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}');
   const fragment=shader(gl.FRAGMENT_SHADER,`precision highp float;
    varying vec2 uv; uniform float complexity,distortion,saturation,mixture,tone,seed,phase,zoom,rotation; uniform int style; uniform vec3 ink;
    void main(){
     vec2 q=(uv-vec2(.5))*vec2(1.7777778,1.)/zoom;float a=rotation;
     q=mat2(cos(a),sin(a),-sin(a),cos(a))*q;
     float d=distortion/30.,s=seed*.173;
     vec2 v=q+vec2(.2*d*sin(q.y*5.+s+sin(phase)),.17*d*cos(q.x*4.-s+cos(phase)));
     float flow=v.x*2.1+v.y*.6+d*.55*sin(v.y*4.5+sin(phase)+s);
     if(style==1){vec2 radial=v+vec2(.18+sin(s)*.12,-.12);flow=atan(radial.y,radial.x)*floor(complexity*.5)/complexity+length(radial)*(.7+d*1.8);}
     if(style==2)flow=v.y*1.7+v.x*.5+d*.8*sin(v.x*3.+cos(phase)+s);
     flow+=.12*sin(phase);
     float wave=sin(flow*complexity+sin(s)*3.),fold=pow(.5+.5*wave,1.8);
     float hueField=.5+.5*sin(v.x*2.7-v.y*2.1+s+sin(phase)*.3);
     vec3 other=vec3(ink.g,ink.b,ink.r);
     vec3 color=mix(ink,other,hueField*mixture/15.);
     float gray=dot(color,vec3(.2126,.7152,.0722));color=clamp(vec3(gray)+(color-vec3(gray))*saturation/2.,0.,1.);
     vec3 paper=mix(vec3(.075,.09,.12),vec3(.97,.965,.95),tone);
     vec3 shadow=mix(color*.26,color*.64+.2,tone);
     vec3 rgb=mix(shadow,paper,.14+.86*fold);
     rgb+=vec3(pow(.5+.5*sin(flow*complexity+.65),18.)*.055);
     gl_FragColor=vec4(clamp(rgb,0.,1.),1.);
    }`);
   program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Abstract shader linking');
   gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);gl.viewport(0,0,768,432);backend='webgl';
   if(!listeners){listeners=true;source.addEventListener('webglcontextlost',event=>{event.preventDefault();gl=null;backend='cpu';key='';cpuKey='';});source.addEventListener('webglcontextrestored',()=>{initialized=false;program=null;key='';cpuKey='';backend='idle';});}
  }catch{gl=null;backend='cpu';}
 }
 function cpu(p,phase){
  const ink=[1,3,5].map(i=>parseInt((p.abstractUseAccent?p.accent:p.abstractColor).slice(i,i+2),16)/255),tone=p.abstractTone==='light'?1:0,d=p.abstractDistortion/30,s=p.abstractSeed*.173,rotation=p.abstractRotation*Math.PI/180,cs=Math.cos(rotation),sn=Math.sin(rotation),si=Math.sin(phase),co=Math.cos(phase),st=Math.sin(s),style=p.abstractStyle,shadowScale=.26+.38*tone,shadowOffset=.2*tone,paperR=.075*(1-tone)+.97*tone,paperG=.09*(1-tone)+.965*tone,paperB=.12*(1-tone)+.95*tone;
  for(let y=0;y<180;y++)for(let x=0;x<320;x++){
   const qx=((x+.5)/320-.5)*1.7777778/p.abstractZoom,qy=(.5-(y+.5)/180)/p.abstractZoom,rx=cs*qx-sn*qy,ry=sn*qx+cs*qy,vx=rx+.2*d*Math.sin(ry*5+s+si),vy=ry+.17*d*Math.cos(rx*4-s+co);
   let flow=vx*2.1+vy*.6+d*.55*Math.sin(vy*4.5+si+s);
   if(style==='bloom'){const ax=vx+.18+st*.12,ay=vy-.12;flow=Math.atan2(ay,ax)*Math.floor(p.abstractComplexity*.5)/p.abstractComplexity+Math.hypot(ax,ay)*(.7+d*1.8);}
   if(style==='tide')flow=vy*1.7+vx*.5+d*.8*Math.sin(vx*3+co+s);
   flow+=.12*si;
   const angle=flow*p.abstractComplexity+st*3,fold=(.5+.5*Math.sin(angle))**1.8,hue=(.5+.5*Math.sin(vx*2.7-vy*2.1+s+si*.3))*p.abstractMix/15;
   const red=ink[0]*(1-hue)+ink[1]*hue,green=ink[1]*(1-hue)+ink[2]*hue,blue=ink[2]*(1-hue)+ink[0]*hue,gray=red*.2126+green*.7152+blue*.0722,amount=.14+.86*fold,z=.5+.5*Math.sin(angle+.65),z2=z*z,z4=z2*z2,z8=z4*z4,shine=z8*z8*z2*.055,index=(y*320+x)*4,sat=p.abstractSaturation/2;
   pixels.data[index]=clamp((clamp(gray+(red-gray)*sat)*shadowScale+shadowOffset)*(1-amount)+paperR*amount+shine)*255;
   pixels.data[index+1]=clamp((clamp(gray+(green-gray)*sat)*shadowScale+shadowOffset)*(1-amount)+paperG*amount+shine)*255;
   pixels.data[index+2]=clamp((clamp(gray+(blue-gray)*sat)*shadowScale+shadowOffset)*(1-amount)+paperB*amount+shine)*255;pixels.data[index+3]=255;
  }pg.putImageData(pixels,0,0);return previous;
 }
 function phaseAt(p,time){return ((p.abstractPhase/360*TAU+(p.abstractAnimate&&p.animationMode!=='still'?time/(p.abstractSpeed*1000)*TAU:0))%TAU+TAU)%TAU;}
 return{
  backend:()=>backend,phase:()=>lastPhase/TAU*360,
  draw(p,time=0){
   if(!p.abstractEnabled||!p.abstractOpacity)return;init();
   const settings=[p.abstractStyle,p.abstractComplexity,p.abstractDistortion,p.abstractSaturation,p.abstractMix,p.abstractTone,p.abstractSeed,p.abstractZoom,p.abstractRotation,p.abstractUseAccent?p.accent:p.abstractColor,p.abstractPhase,p.abstractSpeed,p.nativeSkin].join('|'),animated=p.abstractAnimate&&p.animationMode!=='still',stamp=animated?time:0,signature=settings+'|'+stamp;
   lastPhase=phaseAt(p,time);
   if(signature!==key){key=signature;g.clearRect(0,0,1672,941);
    if(gl){
     gl.useProgram(program);const ink=[1,3,5].map(i=>parseInt((p.abstractUseAccent?p.accent:p.abstractColor).slice(i,i+2),16)/255);gl.uniform3f(gl.getUniformLocation(program,'ink'),...ink);
     for(const[name,value]of Object.entries({complexity:p.abstractComplexity,distortion:p.abstractDistortion,saturation:p.abstractSaturation,mixture:p.abstractMix,tone:p.abstractTone==='light'?1:0,seed:p.abstractSeed,phase:lastPhase,zoom:p.abstractZoom,rotation:p.abstractRotation*Math.PI/180}))gl.uniform1f(gl.getUniformLocation(program,name),value);
     gl.uniform1i(gl.getUniformLocation(program,'style'),['silk','bloom','tide'].indexOf(p.abstractStyle));gl.drawArrays(gl.TRIANGLES,0,6);g.drawImage(source,0,0,1672,941);
    }else if(animated){
     const interval=50,currentTick=Math.floor(time/interval),fraction=(time-currentTick*interval)/interval;
     if(tick!==currentTick||cpuKey!==settings){
      if(tick===currentTick+1&&cpuKey===settings)pg.drawImage(next,0,0);else cpu(p,phaseAt(p,currentTick*interval));
      // cpu() writes previous; preserve the left sample while evaluating the right.
      bg.drawImage(previous,0,0);cpu(p,phaseAt(p,(currentTick+1)*interval));ng.drawImage(previous,0,0);pg.drawImage(blend,0,0);tick=currentTick;cpuKey=settings;
     }
     bg.drawImage(previous,0,0);bg.globalAlpha=fraction;bg.drawImage(next,0,0);bg.globalAlpha=1;g.drawImage(blend,0,0,1672,941);
    }else{cpuKey='';g.drawImage(cpu(p,lastPhase),0,0,1672,941);}
    if(mask){g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0);g.globalCompositeOperation='source-over';}
   }
   ctx.save();ctx.globalAlpha=p.abstractOpacity;ctx.drawImage(layer,0,0);ctx.restore();
  }
 };
}
