"""Trace alpha masks into closed paths, including holes, without changing geometry."""
import numpy as np

def mask_path(mask, coordinate_scale=1):
 # Trace pixel-cell boundaries, retaining holes and original enclosed silhouettes.
 edges={}
 for y,x in np.argwhere(mask):
  for a,b,test in [((x,y),(x+1,y),y==0 or not mask[y-1,x]),((x+1,y),(x+1,y+1),x==mask.shape[1]-1 or not mask[y,x+1]),((x+1,y+1),(x,y+1),y==mask.shape[0]-1 or not mask[y+1,x]),((x,y+1),(x,y),x==0 or not mask[y,x-1])]:
   if test:edges.setdefault(a,[]).append(b)
 paths=[]
 while edges:
  first=next(iter(edges));p=[first];a=first
  while True:
   b=edges[a].pop()
   if not edges[a]:del edges[a]
   if b==first:break
   p.append(b);a=b
  keep=[]
  for i,b in enumerate(p):
   a=p[i-1];c=p[(i+1)%len(p)]
   if (b[0]-a[0])*(c[1]-b[1])!=(b[1]-a[1])*(c[0]-b[0]):keep.append(b)
  if len(keep)>2:paths.append('M'+'L'.join(f'{x/coordinate_scale:.3f},{y/coordinate_scale:.3f}' for x,y in keep)+'Z')
 return ''.join(paths)
