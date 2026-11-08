const HOLO_DATA=[
 ['liquid','Liquid spectrum','Blue-violet liquid folds',5,1,.18,.12],['pearl','Pearl silk','Soft pastel iridescence',3,.85,.6,.48],['chrome','Liquid chrome','Neutral reflective bands',5,1.1,.8,.12],['oil','Oil slick','Deep spectral reflections',7,1.2,.05,.02],['aurora','Aurora foil','Cyan and violet flowing light',4,1,.15,.1],['candy','Candy glass','Pink and cyan ribbons',4,1.25,.18,.2],['gold','Golden alloy','Warm bronze and gold folds',6,.9,.1,.06],['opal','Opal mist','Cream, rose and aqua shimmer',3,.8,.45,.32]
].map(([id,name,description,zoom,complexity,washout,whiteMix])=>({id,name,description,zoom,complexity,washout,whiteMix}));
// Original liquid-field renderer. No fffuel shaders, GlslCanvas code or downloaded images.
function createHolographicPainter(ctx,mask,forceCPU=false){
 const w=768,h=432,layer=document.createElement('canvas');layer.width=1672;layer.height=941;const g=layer.getContext('2d');
 const source=document.createElement('canvas');let gl=null,program=null,initialized=false,failed=false,key='',backend='idle',lastFrame=-Infinity;
 const cpu=document.createElement('canvas');cpu.width=288;cpu.height=162;const c=cpu.getContext('2d');const pixels=c.createImageData(288,162),TAU=Math.PI*2;
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
    void main(){
     vec2 q=(gl_FragCoord.xy/resolution-.5)*vec2(1.78,1.)*(25./zoom);
     q.x+=.42*sin(q.y*3.1+phase+seed);q.y+=.36*sin(q.x*2.7-phase*.7+seed*.7);
     float f=sin(q.x*3.8+sin(q.y*2.2)*complexity*2.)+.55*sin(q.y*4.3+q.x*1.8)+.25*cos(q.x*6.2-q.y*3.9+phase);
     float b=f*complexity*1.8+phase*.16+hue;
     float t=.5+.5*sin(f*1.3+seed);vec3 rgb=.5+.5*cos(vec3(b+1.7,b+3.8,b+5.9));
     if(style==0)rgb=mix(mix(vec3(.08,.25,.95),vec3(.75,.18,.88),.5+.5*sin(b)),vec3(.04,.92,1.),pow(t,4.)*.55);
     if(style==1)rgb=rgb*.45+.55;
     if(style==2)rgb=vec3(.18+.7*t);
     if(style==3)rgb*=.64;
     if(style==4)rgb=mix(vec3(.03,.93,.8),vec3(.52,.12,1.),.5+.5*sin(b));
     if(style==5)rgb=mix(vec3(1.,.18,.65),vec3(.12,.93,1.),.5+.5*sin(b));
     if(style==6)rgb=vec3(1.,.66,.16)*(.25+.75*t);
     if(style==7)rgb=mix(mix(vec3(1.,.77,.86),vec3(.2,.9,.84),t),vec3(1.,.93,.71),.3);
     float shade=.47+.45*(.5+.5*sin(f*1.6));float shine=pow(.5+.5*sin(f*1.6),24.)*.6;
     rgb=clamp(rgb*shade+shine,0.,1.);float gray=dot(rgb,vec3(.2126,.7152,.0722));rgb=mix(rgb,vec3(gray),washout);rgb=mix(rgb,vec3(1.),whiteMix*.8);
     gl_FragColor=vec4(rgb,1.);
    }`);
   program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader linking');gl.useProgram(program);
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);gl.viewport(0,0,w,h);backend='webgl';
   source.addEventListener('webglcontextlost',event=>{event.preventDefault();failed=true;backend='cpu';key='';});
  }catch{failed=true;backend='cpu';}
 }
 function cpuDraw(p,phase){
  const zoom=25/(p.holoZoom||5),complexity=p.holoComplexity||1,seed=(p.holoSeed||1)*.137,style=styles.indexOf(p.holoStyle),hue=(p.holoHue||0)*Math.PI/180,white=p.holoWhiteMix??.12,wash=p.holoWashout??.18;
  for(let y=0;y<162;y++)for(let x=0;x<288;x++){
   let qx=((x+.5)/288-.5)*1.78*zoom,qy=(.5-(y+.5)/162)*zoom;qx+=.42*Math.sin(qy*3.1+phase+seed);qy+=.36*Math.sin(qx*2.7-phase*.7+seed*.7);
   const f=Math.sin(qx*3.8+Math.sin(qy*2.2)*complexity*2)+.55*Math.sin(qy*4.3+qx*1.8)+.25*Math.cos(qx*6.2-qy*3.9+phase),b=f*complexity*1.8+phase*.16+hue,t=.5+.5*Math.sin(f*1.3+seed),v=.5+.5*Math.sin(b),shade=.47+.45*(.5+.5*Math.sin(f*1.6)),shine=(.5+.5*Math.sin(f*1.6))**24*.6;
   let rgb=[.5+.5*Math.cos(b+1.7),.5+.5*Math.cos(b+3.8),.5+.5*Math.cos(b+5.9)];
   if(style===0){const k=t**4*.55;rgb=[(.08+.67*v)*(1-k)+.04*k,(.25-.07*v)*(1-k)+.92*k,(.95-.07*v)*(1-k)+k];}
   if(style===1)rgb=rgb.map(n=>n*.45+.55);if(style===2)rgb=[.18+.7*t,.18+.7*t,.18+.7*t];if(style===3)rgb=rgb.map(n=>n*.64);
   if(style===4)rgb=[.03+(.52-.03)*v,.93+(.12-.93)*v,.8+.2*v];if(style===5)rgb=[1+(.12-1)*v,.18+(.93-.18)*v,.65+.35*v];if(style===6)rgb=[1,.66,.16].map(n=>n*(.25+.75*t));if(style===7)rgb=[(1-.8*t)*.7+.3,(.77+.13*t)*.7+.279,(.86-.02*t)*.7+.213];
   rgb=rgb.map(n=>Math.max(0,Math.min(1,n*shade+shine)));const gray=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722,i=(y*288+x)*4;
   for(let k=0;k<3;k++)pixels.data[i+k]=((rgb[k]*(1-wash)+gray*wash)*(1-white*.8)+white*.8)*255;pixels.data[i+3]=255;
  }c.putImageData(pixels,0,0);return cpu;
 }
 return {
  backend:()=>backend,
  draw(p,time=0){
   if(!p.holoEnabled||(p.holoOpacity??.75)===0)return;init();
   const phase=p.holoAnimate===false?0:time/(1000*(p.holoSpeed||8))*TAU,settings=[p.holoStyle,p.holoZoom,p.holoComplexity,p.holoWashout,p.holoWhiteMix,p.holoHue,p.holoSeed].join('|');
   const animated=p.holoAnimate!==false&&p.animationMode!=='still',stamp=animated?Math.floor(phase*30):phase,nextKey=settings+'|'+stamp;
   if(nextKey!==key&&(settings!==key.split('|').slice(0,7).join('|')||!animated||time<lastFrame||time-lastFrame>=80)){
    key=nextKey;lastFrame=time;let image;
    if(gl&&!failed){
     gl.useProgram(program);gl.uniform2f(gl.getUniformLocation(program,'resolution'),w,h);
     const values={zoom:p.holoZoom||5,complexity:p.holoComplexity||1,washout:p.holoWashout??.18,whiteMix:p.holoWhiteMix??.12,hue:(p.holoHue||0)*Math.PI/180,seed:(p.holoSeed||1)*.137,phase};
     for(const [name,value] of Object.entries(values))gl.uniform1f(gl.getUniformLocation(program,name),value);gl.uniform1i(gl.getUniformLocation(program,'style'),Math.max(0,styles.indexOf(p.holoStyle)));gl.drawArrays(gl.TRIANGLES,0,6);image=source;
    }else image=cpuDraw(p,phase);
    g.clearRect(0,0,1672,941);g.drawImage(image,0,0,1672,941);if(mask){g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0);g.globalCompositeOperation='source-over';}
   }
   ctx.save();ctx.globalAlpha=p.holoOpacity??.75;ctx.globalCompositeOperation=p.holoBlend||'source-over';ctx.drawImage(layer,0,0);ctx.restore();
  }
 };
}
