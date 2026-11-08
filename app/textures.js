// Original procedural finishes. No fffuel photographs are distributed with the app.
const TEXTURE_DATA=[
 {id:'none',name:'No texture',description:'Keep the original shell finish'},
 {id:'grain',name:'Fine grain',description:'Soft, even surface noise'},
 {id:'concrete',name:'Concrete',description:'Mottled stone with fine pores'},
 {id:'plaster',name:'Aged plaster',description:'Weathered wall with hairline cracks'},
 {id:'paper',name:'Worn paper',description:'Fibrous paper and faded flecks'},
 {id:'scratches',name:'Scuffed paint',description:'Fine scratches and worn edges'},
 {id:'speckle',name:'Ink speckle',description:'Scattered manga-ink flecks'},
 {id:'brushed',name:'Brushed metal',description:'Directional satin hairlines'},
 {id:'canvas',name:'Woven canvas',description:'Fine crosswoven fabric'}
];
function createTexturePainter(ctx,shellMask){
 const tile=document.createElement('canvas');tile.width=512;tile.height=512;const t=tile.getContext('2d');
 const layer=document.createElement('canvas');layer.width=1672;layer.height=941;const g=layer.getContext('2d');
 let tileKey='',layerKey='',source='',image=null,generation=0;
 function generate(kind,seed=1){
  const key=kind+'|'+seed;if(key===tileKey)return tile;tileKey=key;
  let n=seed>>>0;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
  const size=512,data=t.createImageData(size,size),grid=Array.from({length:32*32},random);
  const smooth=x=>x*x*(3-2*x),noise=(x,y,step)=>{const gx=x/step,gy=y/step,ix=Math.floor(gx),iy=Math.floor(gy),fx=smooth(gx-ix),fy=smooth(gy-iy),v=(a,b)=>grid[((b%32+32)%32)*32+(a%32+32)%32];return (v(ix,iy)*(1-fx)+v(ix+1,iy)*fx)*(1-fy)+(v(ix,iy+1)*(1-fx)+v(ix+1,iy+1)*fx)*fy;};
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   let value=128+(random()-.5)*35;
   if(kind==='concrete'||kind==='plaster')value=105+noise(x,y,64)*80+(noise(x,y,16)-.5)*44+(random()-.5)*38;
   if(kind==='paper')value=177+(noise(x,y,32)-.5)*50+(random()-.5)*24;
   if(kind==='scratches')value=142+(noise(x,y,16)-.5)*22+(random()-.5)*16;
   if(kind==='speckle')value=random()<.075?30+random()*70:208+random()*30;
   if(kind==='brushed')value=115+noise(x,y,16)*25+Math.sin(y*4)*12+(random()-.5)*16;
   if(kind==='canvas')value=138+Math.cos(x*Math.PI/4)*18+Math.cos(y*Math.PI/4)*18+(random()-.5)*14;
   const i=(y*size+x)*4;data.data[i]=data.data[i+1]=data.data[i+2]=value;data.data[i+3]=255;
  }
  t.putImageData(data,0,0);t.lineCap='round';
  if(kind==='plaster')for(let i=0;i<8;i++){let x=random()*512,y=random()*512;t.strokeStyle='rgba(28,26,25,.32)';t.lineWidth=.5+random();t.beginPath();t.moveTo(x,y);for(let j=0;j<12;j++){x+=(random()-.5)*20;y+=random()*14;t.lineTo(x,y);}t.stroke();}
  if(['scratches','paper','brushed'].includes(kind))for(let i=0;i<(kind==='brushed'?420:180);i++){const x=random()*512,y=random()*512;t.strokeStyle=random()<.5?'rgba(25,22,20,.17)':'rgba(255,255,255,.24)';t.lineWidth=kind==='paper'?.5:.6+random();t.beginPath();t.moveTo(x,y);t.lineTo(x+random()*(kind==='brushed'?150:45),y+(random()-.5)*(kind==='brushed'?1:12));t.stroke();}
  return tile;
 }
 return {
  async setImage(src){
   if(src===source){if(this.pending)await this.pending;return;}source=src;image=null;layerKey='';const token=++generation;
   this.pending=src?(async()=>{const next=new Image();next.src=src;await next.decode();if(token===generation)image=next;})():Promise.resolve();await this.pending;
  },
  thumbnail(kind,seed){return generate(kind,seed);},
  draw(p){
   const kind=p.textureId||'none',opacity=p.textureOpacity??.3;if(kind==='none'||opacity===0||kind==='custom'&&(!image||source!==p.textureImage))return;
   const key=[kind,p.textureSeed,p.textureScale,p.textureRotation,p.textureMonochrome,p.textureInvert,generation].join('|');
   if(key!==layerKey){
    layerKey=key;g.clearRect(0,0,1672,941);g.save();
    g.filter=[p.textureMonochrome===false?'':'grayscale(1)',p.textureInvert?'invert(1)':''].filter(Boolean).join(' ')||'none';const pattern=g.createPattern(kind==='custom'?image:generate(kind,p.textureSeed||1),'repeat');pattern.setTransform(new DOMMatrix().translate(836,470).rotate(p.textureRotation||0).scale(p.textureScale||1));g.fillStyle=pattern;g.fillRect(0,0,1672,941);g.restore();
    g.globalCompositeOperation='destination-in';g.drawImage(shellMask,0,0);g.globalCompositeOperation='source-over';
   }
   ctx.save();ctx.globalAlpha=opacity;ctx.globalCompositeOperation=p.textureBlend||'soft-light';ctx.drawImage(layer,0,0);ctx.restore();
  }
 };
}
// IndexedDB keeps a personal image library off the public app bundle and out of source control.
const textureLibrary={
 async db(){if(!this.connection)this.connection=new Promise((resolve,reject)=>{const req=indexedDB.open('overlay-studio-textures',1);req.onupgradeneeded=()=>req.result.createObjectStore('images',{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});return this.connection;},
 async transact(mode,action){const db=await this.db();return new Promise((resolve,reject)=>{const tx=db.transaction('images',mode),req=action(tx.objectStore('images'));let result;req.onsuccess=()=>result=req.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Texture storage was interrupted'));});},
 list(){return this.transact('readonly',store=>store.getAll());},
 put(record){return this.transact('readwrite',store=>store.put(record));},
 remove(id){return this.transact('readwrite',store=>store.delete(id));}
};
