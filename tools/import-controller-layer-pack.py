"""Import the supplied layered controller pack without executing its HTML/JS.
Original archive files remain unchanged; only measured metadata and PNGs are used.
"""
from pathlib import Path
import base64,hashlib,json
from PIL import Image
import numpy as np
ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'app/reference-assets/controller-layer-pack'
from raster_paths import mask_path
path_for=mask_path
manifest=json.loads((SOURCE/'manifest.json').read_text())
GROUPS=[('LayerPS1','PlayStation original', [('ps1-black','Black'),('ps1-white','White')]),('LayerPS2','PlayStation 2',[('ps2-black','Black'),('ps2-white','White')]),('LayerPS3','PlayStation 3',[('ps3-black','Black'),('ps3-white','White')]),('LayerXbox360','Xbox 360',[('xbox360-black','Black'),('xbox360-white','White')]),('LayerXboxElite','Xbox Elite artwork',[('xbox-elite-1','Elite1'),('xbox-elite-2','Elite2')])]
KEYS={'north':'Y','south':'A','west':'X','east':'B','select':'Share','start':'Options','home':'Home','lb':'LB','rb':'RB','lt':'LT','rt':'RT','up':'DPad_Up','down':'DPad_Down','left':'DPad_Left','right':'DPad_Right','analog':'M','profile':'M'}
def image_url(p):return 'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode()
def shape(mask,key,offset,normal,preserve=False):
 ys,xs=np.nonzero(mask);x,y=offset
 return {'key':key,'tag':'path','attrs':{'d':path_for(mask)},'matrix':[1,0,0,1,x,y],'bounds':[int(xs.min()+x),int(ys.min()+y),int(xs.max()-xs.min()+1),int(ys.max()-ys.min()+1)],'fillRule':'evenodd','floating':key in ('LT','RT'),'normal':normal,'layeredMaterial':True,'preserveColorInk':preserve}
catalog_path=ROOT/'app/controller-catalog.js';catalog=json.loads(catalog_path.read_text().split('const CONTROLLER_CATALOG=')[1].rstrip().rstrip(';'));catalog=[m for m in catalog if not m['id'].startswith('Layer')]
audit=[]
for model,name,variants in GROUPS:
 pack={};items=[]
 for skin,variant in variants:
  record=manifest[skin];folder=SOURCE/'assets'/skin;controls=[];sticks=[];layers={};labels={'Home':'PS / Home','Share':'Select','Options':'Start'} if skin.startswith('ps') else {}
  for native,layer in record['layers'].items():
   p=folder/layer['file'];im=Image.open(p).convert('RGBA');assert im.size==(layer['width'],layer['height'])
   assert 0<=layer['x']<record['width'] and 0<=layer['y']<record['height']
   assert layer['x']+im.width<=record['width'] and layer['y']+im.height<=record['height']
   rgba=np.array(im);mask=rgba[:,:,3]>=128;pixel=rgba[mask][:,:3];med=np.median(pixel,axis=0).astype(int);normal='#'+''.join(f'{c:02x}' for c in med)
   if native in ('ls','rs'):
    pivot=layer['pivot'];key=native+'Cap';well=native+'Well';layers[key]=image_url(p);layers[well]=image_url(folder/layer['well']);ys,xs=np.nonzero(mask)
    r=max(xs.max()-xs.min()+1,ys.max()-ys.min()+1)/2
    sticks.append({'center':pivot,'capRadius':r,'rimRadius':{'LayerPS2':90,'LayerPS3':90,'LayerXbox360':88,'LayerXboxElite':69}[model],'travel':layer['travel'],'capImage':key,'wellImage':well,'layerBounds':[layer['x'],layer['y'],im.width,im.height]})
   elif native=='dpad':
    yy,xx=np.indices(mask.shape);cx=(mask.shape[1]-1)/2;cy=(mask.shape[0]-1)/2;dx,dy=xx-cx,yy-cy
    for direction,sector in [('Up',(dy<0)&(abs(dy)>=abs(dx))),('Down',(dy>=0)&(abs(dy)>=abs(dx))),('Left',(dx<0)&(abs(dx)>abs(dy))),('Right',(dx>=0)&(abs(dx)>abs(dy)))]:
     controls.append(shape(mask&sector,'DPad_'+direction,(layer['x'],layer['y']),normal))
   else:
    key=KEYS[native];controls.append(shape(mask,key,(layer['x'],layer['y']),normal,key in ('A','B','X','Y','Home')))
    if native in ('analog','profile'):labels[key]=native.title()+' (preview only)'
  original=folder/record['original'];source_image=Image.open(original);assert source_image.size==(record['width'],record['height'])
  y=min(record['layers'][key]['y'] for key in ('lb','rb'))
  geometry={'sourceWidth':record['width'],'sourceHeight':record['height'],'bodyBounds':[0,y,record['width'],record['height']-y],'controls':controls,'sticks':sticks,'protectedShapes':[],'floatArtwork':True,'layered':True,'spatialRemap':'canonical-positions'}
  title=variant if variant in ('Black','White') else 'Elite '+variant[-1]+' source design'
  pack[variant]={'name':title,'width':record['width'],'height':record['height'],'cover':image_url(original),'modelLayers':layers,'modelGeometry':geometry,'source':{'folder':'controller-layer-pack/assets/'+skin,'originalSHA256':hashlib.sha256(original.read_bytes()).hexdigest(),'manifestSHA256':hashlib.sha256((SOURCE/'manifest.json').read_bytes()).hexdigest()}}
  thumb=source_image.convert('RGBA');thumb.thumbnail((400,350));thumbdir=ROOT/'app/controller-thumbnails'/model;thumbdir.mkdir(parents=True,exist_ok=True);thumb.save(thumbdir/(variant+'.png'))
  available=set(c['key'] for c in controls)
  if sticks:available|={'LSB','RSB'}
  items.append({'id':variant,'name':title,'thumbnail':f'controller-thumbnails/{model}/{variant}.png','controls':sorted(available),'labels':labels})
  audit.append({'model':model,'variant':variant,'sourceSkin':skin,'controls':len(controls),'sticks':len(sticks),'source':pack[variant]['source']})
 (ROOT/'app/controller-data'/f'{model}.js').write_text('// User-supplied Controller Layer Pack: original PNG artwork and measured alpha shapes.\nCONTROLLER_PACKS['+json.dumps(model)+']='+json.dumps(pack,separators=(',',':'))+';\n')
 catalog.append({'id':model,'name':name+' · Layer pack','collection':'Controller Layer Pack','defaultVariant':items[0]['id'],'variants':items})
catalog_path.write_text('// Visual templates are independent of the connected input device.\nconst CONTROLLER_CATALOG='+json.dumps(catalog,separators=(',',':'))+';\n')
(ROOT/'docs/controller-layer-pack-audit.json').write_text(json.dumps(audit,indent=2)+'\n')
print('Imported 5 additional families / 10 variants; original PNGs, cap/socket layers and manifest offsets retained.')
