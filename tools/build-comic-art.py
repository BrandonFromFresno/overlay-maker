# Rebuild original vector compositions and SVG masters from the OFL Bangers font.
# Source: https://github.com/google/fonts/tree/main/ofl/bangers
import json,re
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import sys
if len(sys.argv)!=2:raise SystemExit('Usage: python tools/build-comic-art.py /path/to/Bangers-Regular.ttf (fontTools required)')
f=TTFont(sys.argv[1]);g=f.getGlyphSet();c=f.getBestCmap()
def lettering(word):
 advance=0;records=[];bounds=[]
 for ch in word:
  glyph=g[c[ord(ch)]];pen=BoundsPen(g);glyph.draw(pen);bounds.append((advance+pen.bounds[0],pen.bounds[1],advance+pen.bounds[2],pen.bounds[3]));records.append((glyph,advance));advance+=glyph.width+18
 xmin=min(v[0] for v in bounds);xmax=max(v[2] for v in bounds);ymin=min(v[1] for v in bounds);ymax=max(v[3] for v in bounds)
 sx=605/(xmax-xmin);sy=202/(ymax-ymin);pen=SVGPathPen(g)
 for glyph,x in records:glyph.draw(TransformPen(pen,(sx,0,0,-sy,(x-xmin)*sx-302.5,101+ymin*sy)))
 return re.sub(r'-?\d+\.\d+',lambda m:str(round(float(m[0]),2)),pen.getCommands())
def shape(d,fill,stroke='#090d16',width=7,**kw):return dict(d=d,fill=fill,stroke=stroke,width=width,**kw)
B='M-350 45 L-290-15 L-334-88 Q-259-62-217-86 L-224-178 Q-152-111-105-137 L-56-194 L-9-128 Q42-119 96-174 L113-102 Q191-100 246-152 L238-70 L353-93 L305-16 L362 25 L290 54 L320 123 L216 98 L202 181 L137 129 Q66 112 39 177 L-17 129 L-83 186 L-112 116 L-239 149 L-221 83Z'
Z='M-359 75 L-290 12 L-340-28 L-247-59 L-257-147 L-172-99 L-138-185 L-75-114 L-12-184 L18-123 L118-174 L108-102 L230-139 L211-64 L349-88 L301-15 L365 16 L279 53 L316 116 L217 91 L190 173 L127 124 L47 185 L11 119 L-77 176 L-93 108 L-218 149 L-205 72Z'
P='M-370 45 L-281-12 L-350-75 L-232-64 L-242-163 L-146-119 L-106-205 L-61-122 L11-186 L27-117 L158-185 L137-105 L273-153 L234-59 L365-73 L295-10 L379 36 L283 65 L326 145 L214 105 L187 199 L112 129 L30 187 L-8 119 L-117 191 L-124 113 L-257 166 L-238 77Z'
cloud='M-294 65 C-362 43-348-31-299-45 C-327-102-265-146-210-113 C-193-178-112-177-78-136 C-40-187 37-170 57-135 C108-179 182-143 182-102 C246-133 309-95 292-39 C361-21 350 44 300 60 C324 113 266 153 215 126 C182 180 112 174 80 138 C26 182-40 165-65 132 C-124 177-188 156-201 116 C-255 151-313 126-294 65Z'
boom='M-330 32 L-242-10 L-280-98 L-185-61 L-165-167 L-89-96 L-37-190 L13-101 L105-163 L96-71 L236-127 L207-34 L339-45 L267 31 L337 96 L223 89 L219 168 L126 116 L70 183 L24 121 L-71 176 L-94 105 L-214 151 L-199 71Z'
assets={}
for name,path in [('bang',B),('zap',Z),('boom',boom),('pow',P)]:
 layers=[]
 if name=='boom':layers.append(dict(role='cloud',shapes=[shape(cloud,'#fff',width=9),shape('M-314 59 Q-267 114-205 91 Q-168 146-103 115 Q-52 155 9 123 Q61 154 111 126 Q195 160 226 112 Q275 137 303 77 Q286 151 218 128 Q183 180 112 174 L80 138 Q26 182-40 165 L-65 132 Q-124 177-188 156 L-201 116 Q-273 151-314 59Z','#abe9eb',stroke='none',width=0)]))
 fill={'bang':'#ff6329','zap':'#ffe51b','boom':'#ff2717','pow':'#00cbd3'}[name]
 layers.append(dict(role='burst',shapes=[shape(path,'#090d16',dx=11,dy=14),shape(path,fill,width=8)]))
 inner={'bang':'M-294 35 L-241-6 L-268-63 L-188-57 L-178-121 L-111-82 L-58-139 L-17-82 L87-132 L76-62 L204-107 L184-40 L302-56 L256 5 L300 31 L242 51 L258 98 L178 76 L165 133 L112 91 L41 133 L3 87 L-76 141 L-94 87 L-197 109 L-191 65Z',
 'zap':'M-292 53 L-233 1 L-278-22 L-196-38 L-208-98 L-137-63 L-112-129 L-61-76 L-13-126 L13-76 L72-112 L67-64 L171-100 L157-43 L284-60 L246-8 L296 15 L225 41 L258 81 L171 69 L153 123 L104 85 L40 134 L8 85 L-52 127 L-68 77 L-166 105 L-164 51Z',
 'pow':'M-293 37 L-229-6 L-279-45 L-188-43 L-196-112 L-131-81 L-103-142 L-63-81 L-12-134 L4-78 L103-133 L93-70 L205-109 L180-35 L285-49 L236-1 L301 31 L224 53 L256 107 L178 80 L150 143 L97 90 L34 135 L-2 85 L-81 139 L-94 80 L-196 117 L-185 53Z'}
 if name!='boom':layers.append(dict(role='core',shapes=[shape(inner[name],'#ff241a',width=5)]))
 # Separate directional facets, pulled outward during the secondary motion.
 accents=[shape('M-291-93 L-320-133 L-257-105Z','#ffe51b',width=4),shape('M267-109 L315-151 L300-100Z','#fff',width=4),shape('M284 105 L341 137 L293 132Z','#ffe51b',width=4),shape('M-188 146 L-218 185 L-200 138Z','#fff',width=4)]
 if name=='boom':accents=[shape('M-213-91 L-244-144 L-178-112Z','#00cbd3',width=5),shape('M229-58 L292-107 L263-29Z','#00cbd3',width=5),shape('M-195 94 L-246 144 L-222 66Z','#00cbd3',width=5),shape('M194 110 L253 159 L216 79Z','#00cbd3',width=5)]
 layers.append(dict(role='accent',shapes=accents))
 d=lettering(name.upper()+'!');ink='#00bdc8' if name=='zap' else '#ff1c13' if name=='boom' else '#fff018'
 layers.append(dict(role='type',shapes=[shape(d,'#090d16',width=19,dx=16,dy=21),shape(d,'#090d16',width=19),shape(d,ink,stroke='#ffe816' if name=='boom' else '#ff4c1c',width=10),shape(d,ink,stroke='none',width=0)]))
 # Fine clipped upper face highlight: intentional cel-shaded type, never blurs into counters.
 layers.append(dict(role='shine',shapes=[shape(d,'#ffffff',stroke='none',width=0,opacity=.23,clip=[-340,-110,680,50])]))
 assets[name]=dict(word=name.upper()+'!',tilt={'bang':-.075,'zap':-.11,'boom':-.055,'pow':-.09}[name],layers=layers)
Path('app/comic-art.js').write_text('// Original layered comic compositions. Letter outlines: Bangers (SIL OFL); see fonts/licenses/bangers-OFL.txt.\n// Coordinates use an 800 x 450 design space; masters are 1920 x 1080 with true alpha.\nfunction createComicArtwork(){return '+json.dumps(assets,separators=(',',':'))+';}\n')
# Static masters use the exact same authored shapes as the runtime.
for name,a in assets.items():
 out=['<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 800 450"><title>'+a['word']+' — original Comic Gunfire FX</title><g transform="translate(400 225)">']
 for layer in a['layers']:
  out.append('<g id="'+layer['role']+'">')
  for i,s in enumerate(layer['shapes']):
   clip=''
   if 'clip' in s:
    x,y,w,h=s['clip'];id=layer['role']+str(i);out.append(f'<defs><clipPath id="{id}"><rect x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath></defs>');clip=f' clip-path="url(#{id})"'
   out.append(f'<path d="{s["d"]}" fill="{s["fill"]}" stroke="{s["stroke"]}" stroke-width="{s["width"]}" stroke-linejoin="round" transform="translate({s.get("dx",0)} {s.get("dy",0)})" opacity="{s.get("opacity",1)}"{clip}/>')
  out.append('</g>')
 out.append('</g></svg>');Path('app/comic-assets/'+name+'.svg').write_text(''.join(out))
