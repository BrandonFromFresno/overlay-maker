// Data-only controller layouts share the existing painter and universal input state.
// This factory is embedded in finished overlays; it has no editor/native dependencies.
function buildModelGeometry(record,image,layerImages={}){
 const spec=record.modelGeometry,W=1672,H=941,canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const [bx,by,bw,bh]=spec.bodyBounds;
 const scale=Math.min((W-48)/bw,(H-24)/bh),left=(W-bw*scale)/2-bx*scale,top=(H-bh*scale)/2-by*scale;
 const matrix=new DOMMatrix([scale,0,0,scale,left,top]),point=(x,y)=>[left+x*scale,top+y*scale];
 const full=canvas(W,1241),g=full.getContext('2d');g.setTransform(scale,0,0,scale,left,top+300);g.drawImage(image,0,0,spec.sourceWidth||1000,spec.sourceHeight||720);g.resetTransform();
 const base=canvas(W,H),bg=base.getContext('2d');bg.drawImage(full,0,300,W,H,0,0,W,H);
 const floating=canvas(W,300);floating.getContext('2d').drawImage(full,0,0,W,300,0,0,W,300);
 function pathFor(shape){
  const a=shape.attrs,p=new Path2D();
  if(shape.tag==='path')return new Path2D(a.d);
  if(shape.tag==='circle')p.arc(+a.cx,+a.cy,+a.r,0,Math.PI*2);
  else if(shape.tag==='ellipse')p.ellipse(+a.cx,+a.cy,+a.rx,+a.ry,0,0,Math.PI*2);
  else if(shape.tag==='rect')p.rect(+a.x||0,+a.y||0,+a.width,+a.height);
  else{const points=a.points.trim().split(/[ ,]+/).map(Number);for(let i=0;i<points.length;i+=2)i?p.lineTo(points[i],points[i+1]):p.moveTo(points[i],points[i+1]);if(shape.tag==='polygon')p.closePath();}
  return p;
 }
 const faces={},floatShifts={};for(const key of ['LT','RT']){const parts=spec.controls.filter(p=>p.key===key&&p.floating);if(parts.length&&!spec.floatArtwork){const y=Math.min(...parts.map(p=>p.bounds[1])),bottom=Math.max(...parts.map(p=>p.bounds[1]+p.bounds[3]));floatShifts[key]=-160-point(0,(y+bottom)/2)[1];}}
 for(const item of spec.controls){
  const delta=item.floating?floatShifts[item.key]||0:0,transform=new DOMMatrix([1,0,0,1,0,delta]).multiply(matrix),path=new Path2D();path.addPath(pathFor(item),transform.multiply(new DOMMatrix(item.matrix)));
  const[x,y,w,h]=item.bounds,[px,baseY]=point(x,y),py=baseY+delta,part={path,rule:item.fillRule||'nonzero',floating:!!item.floating,bounds:[px,py,w*scale,h*scale]};
  const face=faces[item.key]??={path:new Path2D(),parts:[],symbols:[],modelFace:true,normal:item.normal||'#999999',sourceLabels:!!spec.layered,layeredMaterial:!!item.layeredMaterial,preserveColorInk:!!item.preserveColorInk};face.path.addPath(path);face.parts.push(part);
 }
 for(const[key,f]of Object.entries(faces)){
  const bounds=parts=>{const x=Math.min(...parts.map(p=>p.bounds[0])),y=Math.min(...parts.map(p=>p.bounds[1])),right=Math.max(...parts.map(p=>p.bounds[0]+p.bounds[2])),bottom=Math.max(...parts.map(p=>p.bounds[1]+p.bounds[3]));return[x,y,right-x,bottom-y];};
  const box=bounds(f.parts);f.center=[box[0]+box[2]/2,box[1]+box[3]/2];f.radius=Math.min(box[2],box[3])/2;f.floatParts=f.parts.filter(p=>p.floating);if(f.floatParts.length)f.floatBounds=bounds(f.floatParts);
  const ix=Math.floor(box[0]),iy=Math.floor(box[1]),width=Math.max(1,Math.ceil(box[0]+box[2])-ix),height=Math.max(1,Math.ceil(box[1]+box[3])-iy),ink=canvas(width,height),ic=ink.getContext('2d');
  ic.drawImage(full,ix,iy+300,width,height,0,0,width,height);const pixels=ic.getImageData(0,0,width,height),clip=canvas(width,height),cg=clip.getContext('2d');cg.translate(-ix,-iy);cg.fillStyle='#ffffff';for(const p of f.parts)cg.fill(p.path,p.rule);const mask=cg.getImageData(0,0,width,height).data,hist=new Uint32Array(32);
  const luma=i=>pixels.data[i]*.2126+pixels.data[i+1]*.7152+pixels.data[i+2]*.0722;
  for(let i=0;i<pixels.data.length;i+=4)if(mask[i+3]>250&&pixels.data[i+3]>250)hist[Math.min(31,Math.floor(luma(i)/8))]++;
  let dominant=0;for(let i=1;i<32;i++)if(hist[i]>hist[dominant])dominant=i;const backdrop=dominant*8+4;
  if(f.layeredMaterial){
   const shade=canvas(width,height),colorInk=canvas(width,height),shadePixels=new ImageData(new Uint8ClampedArray(pixels.data),width,height),colorPixels=new ImageData(new Uint8ClampedArray(pixels.data),width,height);
   for(let i=0;i<pixels.data.length;i+=4){const level=luma(i),a=mask[i+3]*pixels.data[i+3]/255,v=Math.round(255*Math.max(.45,Math.min(1,level/Math.max(16,backdrop))));shadePixels.data[i]=shadePixels.data[i+1]=shadePixels.data[i+2]=v;shadePixels.data[i+3]=a;const chroma=Math.max(pixels.data[i],pixels.data[i+1],pixels.data[i+2])-Math.min(pixels.data[i],pixels.data[i+1],pixels.data[i+2]);colorPixels.data[i+3]=f.preserveColorInk&&chroma>40?a:0;}
   shade.getContext('2d').putImageData(shadePixels,0,0);colorInk.getContext('2d').putImageData(colorPixels,0,0);f.nativeShade=shade;f.nativeColorInk=colorInk;
  }
  for(let i=0;i<pixels.data.length;i+=4){const difference=Math.abs(luma(i)-backdrop),alpha=mask[i+3]&&pixels.data[i+3]?Math.max(0,Math.min(255,(difference-24)*5)):0;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=255;pixels.data[i+3]=alpha;}
  ic.putImageData(pixels,0,0);Object.assign(f,{nativeInk:ink,inkTint:canvas(width,height),inkX:ix,inkY:iy,inkColor:''});
 }
 const sticks=[],images={base,modelFloat:floating},rimCircles=[];
 for(const[item,index]of spec.sticks.map((s,i)=>[s,i])){
  const [x,y]=point(...item.center),r=item.capRadius*scale,rim=item.rimRadius*scale,key=index?'rightStick':'leftStick',cap=canvas(180,180),padding=90/86;
  if(item.capImage&&layerImages[item.capImage]){const [lx,ly,lw,lh]=item.layerBounds,factor=86/item.capRadius;cap.getContext('2d').drawImage(layerImages[item.capImage],90+(lx-item.center[0])*factor,90+(ly-item.center[1])*factor,lw*factor,lh*factor);if(layerImages[item.wellImage]){const [wx,wy]=point(lx,ly);bg.drawImage(layerImages[item.wellImage],wx,wy,lw*scale,lh*scale);}}
  else cap.getContext('2d').drawImage(full,x-r*padding,y+300-r*padding,r*padding*2,r*padding*2,0,0,180,180);images[key]=cap;
  const sx=Math.min(W-1,Math.max(0,Math.round(x+r+scale*1.5))),sy=Math.min(H-1,Math.max(0,Math.round(y))),pixel=bg.getImageData(sx,sy,1,1).data;
  if(!item.wellImage||!layerImages[item.wellImage]){bg.fillStyle=`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;bg.beginPath();bg.arc(x,y,r+scale*.6,0,Math.PI*2);bg.fill();}
  sticks.push([x,y,key,index?'RSB':'LSB',index*2,r,rim,...(Number.isFinite(item.travel)?[item.travel*scale]:[])]);rimCircles.push([x,y,rim]);
 }
 const staticMask=canvas(W,H),colorProtection=canvas(W,H),sc=staticMask.getContext('2d'),cc=colorProtection.getContext('2d');sc.fillStyle=cc.fillStyle='#ffffff';
 for(const shape of spec.protectedShapes||[]){const p=new Path2D();p.addPath(pathFor(shape),matrix.multiply(new DOMMatrix(shape.matrix)));sc.fill(p,shape.fillRule||'nonzero');if(shape.preserveColor)cc.fill(p,shape.fillRule||'nonzero');}
 let fixedArtwork=null;if((spec.protectedShapes||[]).some(s=>s.preserveColor)){fixedArtwork=canvas(W,H);const fc=fixedArtwork.getContext('2d');fc.drawImage(base,0,0);fc.globalCompositeOperation='destination-in';fc.drawImage(colorProtection,0,0);fc.globalCompositeOperation='source-over';}
 return{layered:!!spec.layered,floatArtwork:!!spec.floatArtwork,faces,faceKeys:Object.keys(faces),stickLayout:sticks,images,rimCircles,staticMask,colorProtection,fixedArtwork,scale};
}
