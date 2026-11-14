"""Build independent Xelu diagram templates; original reference files stay untouched.
Requires Pillow, NumPy and SciPy. Run from any directory. No vendor runtime.
"""
from pathlib import Path
import base64, hashlib, io, json
from PIL import Image
import numpy as np
from scipy import ndimage
from raster_paths import mask_path
ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'app/reference-assets/xelu'
MODELS=[
 ('XeluDualSense','DualSense','PS5/PS5_Diagram',dict(A=(1153,532),B=(1256,446),X=(1052,448),Y=(1156,358),Share=(410,313),Options=(1047,313)),[(520,652,75,105),(938,652,75,105)],[(304,385),(311,506),(245,446),(370,446)],[(319,107),(1140,107),(306,184),(1152,184)],'ps5'),
 ('XeluDualShock4','DualShock 4','Others/PS4/PS4_Diagram',dict(A=(1139,491),B=(1232,404),X=(1045,404),Y=(1139,317),Share=(462,277),Options=(997,277)),[(522,612,75,105),(936,612,75,105)],[(320,344),(320,464),(258,404),(383,404)],[(333,108),(1124,108),(327,154),(1131,154)],'ps4'),
 ('XeluXboxSeries','Xbox Series','Xbox Series/XboxSeriesX_Diagram',dict(A=(1088,493),B=(1186,402),X=(995,409),Y=(1093,318),Share=(630,411),Options=(831,411)),[(375,438,75,105),(914,638,75,105)],[(550,553),(550,680),(482,620),(619,620)],[(348,84),(1112,84),(395,125),(1066,125)],'series'),
 ('XeluXboxOne','Xbox One','Others/Xbox One/XboxOne_Diagram',dict(A=(1088,493),B=(1186,402),X=(995,409),Y=(1093,318),Share=(630,411),Options=(831,411)),[(375,438,75,105),(914,638,75,105)],None,[(338,91),(1123,91),(395,125),(1066,125)],'one'),
 ('XeluLuna','Amazon Luna','Others/Amazon Luna/Luna_Diagram',dict(A=(1074,472),B=(1167,385),X=(985,392),Y=(1079,305),Share=(613,336),Options=(855,336)),[(371,391,79,111),(912,614,79,111)],None,[(387,59),(1073,59),(354,152),(1108,152)],'luna'),
]
def png(im):
 b=io.BytesIO();im.save(b,format='PNG',optimize=True);return b.getvalue()
def url(im):return 'data:image/png;base64,'+base64.b64encode(png(im)).decode()
def path_for(mask):
 return mask_path(mask,1.452)
def shape(mask,key=None):
 ys,xs=np.nonzero(mask)
 if not len(xs):raise ValueError('Empty control '+str(key))
 item={'tag':'path','attrs':{'d':path_for(mask)},'matrix':[1,0,0,1,0,0],'bounds':[float(xs.min()/1.452),float(ys.min()/1.452),float((xs.max()-xs.min()+1)/1.452),float((ys.max()-ys.min()+1)/1.452)],'fillRule':'evenodd'}
 if key:item.update(key=key,normal='#e7edf2',floating=False)
 return item
catalog_path=ROOT/'app/controller-catalog.js'
catalog=json.loads(catalog_path.read_text().split('const CONTROLLER_CATALOG=')[1].rstrip().rstrip(';'))
catalog=[m for m in catalog if not m['id'].startswith('Xelu')]
provenance=[]
for ident,name,stem,seeds,sticks,dpad,shoulders,kind in MODELS:
 simple=Image.open(SOURCE/(stem+'_Simple.png')).convert('RGBA');a=np.array(simple)[:,:,3]
 barriers=ndimage.binary_dilation(a>60,iterations=1)
 labels,_=ndimage.label(~barriers)
 def region(x,y):
  label=labels[y,x]
  if label==0:raise ValueError(f'{name}: seed on boundary {x},{y}')
  mask=labels==label
  if mask.sum()>50000:raise ValueError(f'{name}: seed escaped control {x},{y}')
  return mask
 controls=[shape(region(*seed),key) for key,seed in seeds.items()]
 for key,seed in zip(['LT','RT','LB','RB'],shoulders):controls.append(shape(region(*seed),key))
 if dpad:
  for key,seed in zip(['DPad_Up','DPad_Down','DPad_Left','DPad_Right'],dpad):controls.append(shape(region(*seed),key))
 else:
  cx,cy=(550,615) if kind=='one' else (543,594)
  # Split the exact enclosed cross into four nonoverlapping directional sectors.
  mask=region(cx,cy);yy,xx=np.indices(mask.shape);dx,dy=xx-cx,yy-cy
  sectors=[(dy<0)&(abs(dy)>=abs(dx)),(dy>=0)&(abs(dy)>=abs(dx)),(dx<0)&(abs(dx)>abs(dy)),(dx>=0)&(abs(dx)>abs(dy))]
  for key,sector in zip(['DPad_Up','DPad_Down','DPad_Left','DPad_Right'],sectors):controls.append(shape(mask&sector,key))
 packages={};variants=[]
 for variant,suffix in [('Labeled',''),('Clean','_Simple')]:
  file=SOURCE/(stem+suffix+'.png');original=Image.open(file).convert('RGBA');alpha=np.array(original)[:,:,3]
  outline=alpha>60;filled=ndimage.binary_fill_holes(ndimage.binary_dilation(outline,iterations=1))
  # Neutral backing makes line drawings opaque, tintable controller silhouettes.
  bg=np.zeros((*filled.shape,4),dtype=np.uint8);bg[ndimage.binary_erosion(filled,iterations=3)]=[231,237,242,255]
  image=Image.fromarray(bg);ink=Image.new('RGBA',original.size,(38,51,60,0));ink.putalpha(original.getchannel('A'));image.alpha_composite(ink)
  parts=list(controls)
  full_labels,_=ndimage.label(~ndimage.binary_dilation(alpha>60,iterations=1))
  if variant=='Labeled':
   yy,xx=np.indices(filled.shape)
   if kind in ('series','one'):
    parts.append(shape((xx-730)**2+(yy-274)**2<53**2,'Home'))
   elif kind=='luna':parts.append(shape((xx-730)**2+(yy-328)**2<65**2,'Home'))
   elif kind=='ps4':parts.append(shape((xx-729)**2+(yy-570)**2<33**2,'Home'))
   else:
    x,y,w,h=(686,560,94,58) if kind=='ps5' else (689,535,80,69)
    mask=np.zeros_like(filled);mask[y:y+h,x:x+w]=outline[y:y+h,x:x+w]
    parts.append(shape(mask,'Home'))
   if kind=='series':parts.append(shape(full_labels==full_labels[467,730],'Capture'))
  cover=Image.new('RGBA',(1000,720));scaled=image.resize((1000,round(image.height/1.452)),Image.Resampling.LANCZOS);cover.alpha_composite(scaled)
  ys,xs=np.nonzero(filled)
  bounds=[float(xs.min()/1.452),float(ys.min()/1.452),float((xs.max()-xs.min()+1)/1.452),float((ys.max()-ys.min()+1)/1.452)]
  protected=[]
  spec={'bodyBounds':bounds,'controls':parts,'sticks':[{'center':[x/1.452,y/1.452],'capRadius':r/1.452,'rimRadius':rim/1.452} for x,y,r,rim in sticks],'protectedShapes':protected,'floatArtwork':True,'spatialRemap':'canonical-positions'}
  relative=file.relative_to(SOURCE).as_posix();digest=hashlib.sha256(file.read_bytes()).hexdigest()
  packages[variant]={'name':variant+' outline','width':1000,'height':720,'cover':url(cover),'modelGeometry':spec,'source':{'collection':'Xelu CC0','folder':str(file.parent.relative_to(SOURCE)),'file':relative,'sha256':digest}}
  thumbdir=ROOT/'app/controller-thumbnails'/ident;thumbdir.mkdir(parents=True,exist_ok=True)
  thumb=cover.copy();thumb.thumbnail((400,288));thumb.save(thumbdir/(variant+'.png'))
  variants.append({'id':variant,'name':variant+' outline','thumbnail':f'controller-thumbnails/{ident}/{variant}.png','controls':sorted(set(p['key'] for p in parts)|{'LSB','RSB'})})
  provenance.append({'model':ident,'variant':variant,'file':relative,'sha256':digest})
 (ROOT/'app/controller-data'/f'{ident}.js').write_text('// Xelu CC0 diagram artwork, independent measured visual layout. No hardware adapter.\nCONTROLLER_PACKS['+json.dumps(ident)+']='+json.dumps(packages,separators=(',',':'))+';\n')
 catalog.append({'id':ident,'name':name+' · Xelu outline','collection':'Xelu','defaultVariant':'Labeled','variants':variants})
catalog_path.write_text('// Visual templates are independent of the connected input device.\nconst CONTROLLER_CATALOG='+json.dumps(catalog,separators=(',',':'))+';\n')
(ROOT/'docs/xelu-template-provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
print('Built five independent models, ten labeled/clean templates; preserved all original reference assets.')
