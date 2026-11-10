const HOLO_DATA=[
 ['liquid','Liquid spectrum','Blue-violet liquid folds',5,1,.18,.12],['pearl','Pearl silk','Soft pastel iridescence',3,.85,.6,.48],['chrome','Liquid chrome','Neutral reflective bands',5,1.1,.8,.12],['oil','Oil slick','Deep spectral reflections',7,1.2,.05,.02],['aurora','Aurora foil','Cyan and violet flowing light',4,1,.15,.1],['candy','Candy glass','Pink and cyan ribbons',4,1.25,.18,.2],['gold','Golden alloy','Warm bronze and gold folds',6,.9,.1,.06],['opal','Opal mist','Cream, rose and aqua shimmer',3,.8,.45,.32]
].map(([id,name,description,zoom,complexity,washout,whiteMix])=>({id,name,description,zoom,complexity,washout,whiteMix}));
// Original liquid-field renderer. No fffuel shaders, GlslCanvas code or downloaded images.
function createHolographicPainter(ctx,mask,forceCPU=false){
 const w=768,h=432,layer=document.createElement('canvas');layer.width=1672;layer.height=941;const g=layer.getContext('2d');
 const source=document.createElement('canvas');let gl=null,program=null,initialized=false,failed=false,key='',backend='idle',listeners=false,cpuTick=-Infinity,cpuSettings='';
 const cpu=document.createElement('canvas');cpu.width=288;cpu.height=162;const c=cpu.getContext('2d');const pixels=c.createImageData(288,162),TAU=Math.PI*2;
 const previous=document.createElement('canvas'),next=document.createElement('canvas'),blended=document.createElement('canvas');previous.width=next.width=blended.width=288;previous.height=next.height=blended.height=162;const previousContext=previous.getContext('2d'),nextContext=next.getContext('2d'),blendContext=blended.getContext('2d');
 const styles=['liquid','pearl','chrome','oil','aurora','candy','gold','opal'];
 function init(){
  if(initialized)return;initialized=true;if(forceCPU){backend='cpu';return;}
  try{
   source.width=w;source.height=h;gl=source.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true,depth:false});if(!gl)throw Error('No WebGL');
   const compile=(type,code)=>{const shader=gl.createShader(type);gl.shaderSource(shader,code);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Shader compilation');return shader;};
   const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}');
   const fragment=compile(gl.FRAGMENT_SHADER,`
    precision highp float;
    uniform vec2 resolution; uniform float zoom, complexity, washout, whiteMix, hue, seed, phase; uniform int style;
    vec3 rotateHue(vec3 rgb,float angle){
     float y=dot(rgb,vec3(.299,.587,.114)),i=dot(rgb,vec3(.596,-.275,-.321)),q=dot(rgb,vec3(.212,-.523,.311));
     float ri=i*cos(angle)-q*sin(angle),rq=i*sin(angle)+q*cos(angle);
     return clamp(vec3(y+.956*ri+.621*rq,y-.272*ri-.647*rq,y-1.106*ri+1.703*rq),0.,1.);
    }
    void main(){
     vec2 q=(gl_FragCoord.xy/resolution-.5)*vec2(1.78,1.)*(25./zoom);
     q.x+=.42*sin(q.y*3.1+phase+seed);q.y+=.36*sin(q.x*2.7-phase*.7+seed*.7);
     float f=sin(q.x*3.8+sin(q.y*2.2)*complexity*2.)+.55*sin(q.y*4.3+q.x*1.8)+.25*cos(q.x*6.2-q.y*3.9+phase);
     float b=f*complexity*1.8+phase*.16;
     float t=.5+.5*sin(f*1.3+seed);vec3 rgb=.5+.5*cos(vec3(b+1.7,b+3.8,b+5.9));
     if(style==0)rgb=mix(mix(vec3(.08,.25,.95),vec3(.75,.18,.88),.5+.5*sin(b)),vec3(.04,.92,1.),pow(t,4.)*.55);
     if(style==1)rgb=rgb*.45+.55;
     if(style==2)rgb=vec3(.18+.7*t);
     if(style==3)rgb*=.64;
     if(style==4)rgb=mix(vec3(.03,.93,.8),vec3(.52,.12,1.),.5+.5*sin(b));
     if(style==5)rgb=mix(vec3(1.,.18,.65),vec3(.12,.93,1.),.5+.5*sin(b));
     if(style==6)rgb=vec3(1.,.66,.16)*(.25+.75*t);
     if(style==7)rgb=mix(mix(vec3(1.,.77,.86),vec3(.2,.9,.84),t),vec3(1.,.93,.71),.3);
     if(abs(hue)>.0001)rgb=rotateHue(rgb,hue);
     float shade=.47+.45*(.5+.5*sin(f*1.6));float shine=pow(.5+.5*sin(f*1.6),16.)*.5;
     rgb=clamp(rgb*shade+shine,0.,1.);float gray=dot(rgb,vec3(.2126,.7152,.0722));rgb=mix(rgb,vec3(gray),washout);rgb=mix(rgb,vec3(1.),whiteMix*.8);
     gl_FragColor=vec4(rgb,1.);
    }`);
   program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader linking');gl.useProgram(program);
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);gl.viewport(0,0,w,h);backend='webgl';
   if(!listeners){listeners=true;source.addEventListener('webglcontextlost',event=>{event.preventDefault();failed=true;backend='cpu';key='';cpuSettings='';});source.addEventListener('webglcontextrestored',()=>{initialized=false;failed=false;gl=null;program=null;backend='idle';key='';cpuSettings='';});}
  }catch{failed=true;backend='cpu';}
 }
 // Scalar field evaluation avoids allocating RGB arrays for every pixel.
 function cpuDraw(p,phase){
  const zoom=25/(p.holoZoom||5),complexity=p.holoComplexity||1,seed=(p.holoSeed||1)*.137,style=styles.indexOf(p.holoStyle),hue=(p.holoHue||0)*Math.PI/180,white=p.holoWhiteMix??.12,wash=p.holoWashout??.18,cosHue=Math.cos(hue),sinHue=Math.sin(hue),useHue=Math.abs(hue)>.0001,keep=1-white*.8,add=white*.8;
  const clamp=n=>Math.max(0,Math.min(1,n)),matrix=[];
  if(useHue)for(let k=0;k<3;k++){const r=k===0?1:0,g=k===1?1:0,b=k===2?1:0,yy=r*.299+g*.587+b*.114,ii=r*.596-g*.275-b*.321,qq=r*.212-g*.523+b*.311,ri=ii*cosHue-qq*sinHue,rq=ii*sinHue+qq*cosHue;matrix.push(yy+.956*ri+.621*rq,yy-.272*ri-.647*rq,yy-1.106*ri+1.703*rq);}
  for(let y=0;y<162;y++){
   const baseY=(.5-(y+.5)/162)*zoom,offset=.42*Math.sin(baseY*3.1+phase+seed);
   for(let x=0;x<288;x++){
    const qx=((x+.5)/288-.5)*1.78*zoom+offset,qy=baseY+.36*Math.sin(qx*2.7-phase*.7+seed*.7),f=Math.sin(qx*3.8+Math.sin(qy*2.2)*complexity*2)+.55*Math.sin(qy*4.3+qx*1.8)+.25*Math.cos(qx*6.2-qy*3.9+phase),b=f*complexity*1.8+phase*.16,t=.5+.5*Math.sin(f*1.3+seed),v=.5+.5*Math.sin(b),h=.5+.5*Math.sin(f*1.6),h2=h*h,h4=h2*h2,h8=h4*h4,shade=.47+.45*h,shine=h8*h8*.5;
    let red,green,blue;
    if(style===0){const t2=t*t,k=t2*t2*.55;red=(.08+.67*v)*(1-k)+.04*k;green=(.25-.07*v)*(1-k)+.92*k;blue=(.95-.07*v)*(1-k)+k;}
    else if(style===2)red=green=blue=.18+.7*t;
    else if(style===4){red=.03+.49*v;green=.93-.81*v;blue=.8+.2*v;}
    else if(style===5){red=1-.88*v;green=.18+.75*v;blue=.65+.35*v;}
    else if(style===6){red=.25+.75*t;green=red*.66;blue=red*.16;}
    else if(style===7){red=(1-.8*t)*.7+.3;green=(.77+.13*t)*.7+.279;blue=(.86-.02*t)*.7+.213;}
    else{red=.5+.5*Math.cos(b+1.7);green=.5+.5*Math.cos(b+3.8);blue=.5+.5*Math.cos(b+5.9);if(style===1){red=red*.45+.55;green=green*.45+.55;blue=blue*.45+.55;}else if(style===3){red*=.64;green*=.64;blue*=.64;}}
    if(useHue){const r=red,g=green,b=blue;red=clamp(matrix[0]*r+matrix[3]*g+matrix[6]*b);green=clamp(matrix[1]*r+matrix[4]*g+matrix[7]*b);blue=clamp(matrix[2]*r+matrix[5]*g+matrix[8]*b);}
    red=clamp(red*shade+shine);green=clamp(green*shade+shine);blue=clamp(blue*shade+shine);const gray=red*.2126+green*.7152+blue*.0722,i=(y*288+x)*4;
    pixels.data[i]=((red*(1-wash)+gray*wash)*keep+add)*255;pixels.data[i+1]=((green*(1-wash)+gray*wash)*keep+add)*255;pixels.data[i+2]=((blue*(1-wash)+gray*wash)*keep+add)*255;pixels.data[i+3]=255;
   }
  }c.putImageData(pixels,0,0);return cpu;
 }
 return {
  backend:()=>backend,
  draw(p,time=0){
   if(!p.holoEnabled||(p.holoOpacity??.75)===0)return;init();
   const animated=p.holoAnimate!==false&&p.animationMode!=='still',sampleTime=animated?time:p.holoAnimate===false?0:1200;
   const settings=[p.holoStyle,p.holoZoom,p.holoComplexity,p.holoWashout,p.holoWhiteMix,p.holoHue,p.holoSeed,p.nativeSkin,p.holoSpeed].join('|'),nextKey=settings+'|'+sampleTime;
   const phaseAt=t=>((t/(1000*(p.holoSpeed||8))*TAU)%(TAU*100)+TAU*100)%(TAU*100);
   if(nextKey!==key){
    key=nextKey;g.clearRect(0,0,1672,941);
    if(gl&&!failed){
     gl.useProgram(program);gl.uniform2f(gl.getUniformLocation(program,'resolution'),w,h);
     const values={zoom:p.holoZoom||5,complexity:p.holoComplexity||1,washout:p.holoWashout??.18,whiteMix:p.holoWhiteMix??.12,hue:(p.holoHue||0)*Math.PI/180,seed:(p.holoSeed||1)*.137,phase:phaseAt(sampleTime)};
     for(const[name,value]of Object.entries(values))gl.uniform1f(gl.getUniformLocation(program,name),value);gl.uniform1i(gl.getUniformLocation(program,'style'),Math.max(0,styles.indexOf(p.holoStyle)));gl.drawArrays(gl.TRIANGLES,0,6);g.drawImage(source,0,0,1672,941);
    }else if(animated){
     // Interpolate deterministic 20 Hz fields at presentation time. Controller
     // input is drawn independently and never waits for the material sampler.
     const interval=1000/20,tick=Math.floor(sampleTime/interval),blend=(sampleTime-tick*interval)/interval,signature=settings+'|'+p.holoSpeed;
     if(tick!==cpuTick||signature!==cpuSettings){
      if(tick===cpuTick+1&&signature===cpuSettings)previousContext.drawImage(next,0,0);
      else previousContext.drawImage(cpuDraw(p,phaseAt(tick*interval)),0,0);
      nextContext.drawImage(cpuDraw(p,phaseAt((tick+1)*interval)),0,0);cpuTick=tick;cpuSettings=signature;
     }
     blendContext.drawImage(previous,0,0);blendContext.globalAlpha=blend;blendContext.drawImage(next,0,0);blendContext.globalAlpha=1;g.drawImage(blended,0,0,1672,941);
    }else g.drawImage(cpuDraw(p,phaseAt(sampleTime)),0,0,1672,941);
    if(mask){g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0);g.globalCompositeOperation='source-over';}
   }
   ctx.save();ctx.globalAlpha=p.holoOpacity??.75;ctx.globalCompositeOperation=p.holoBlend||'source-over';ctx.drawImage(layer,0,0);ctx.restore();
  }
 };
}
