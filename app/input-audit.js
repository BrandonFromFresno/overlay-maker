// Observed hardware signals, not a claim that the operator visually approved the artwork.
function createInputAudit(){
 const buttons=['A','B','X','Y','LB','RB','Share','Options','LSB','RSB','DPad_Up','DPad_Down','DPad_Left','DPad_Right'];
 let device='',items=[],started=false,unsupported=[];
 const item=(id,label,kind)=>({id,label,kind,held:false,done:false,seen:new Set()});
 function start(pad){if(!pad||pad.mapping!=='standard')throw Error('Connect a controller in PC / XInput mode first.');device=String(pad.index??0)+'|'+pad.id;started=true;items=buttons.map(id=>item(id,id.replace('DPad_','D-pad '),'button'));unsupported=[];
  if(pad.buttons.length>16)items.push({...item('Home','Home (optional, if exposed)','button'),optional:true});else unsupported.push('Home is not exposed by this device.');
  for(const id of ['LT','RT'])items.push(item(id,id+' depth and release','trigger'));
  items.push(item('LS','Left stick: full travel and neutral','stick'),item('RS','Right stick: full travel and neutral','stick'));
  for(const v of ['Up','Down'])for(const h of ['Left','Right'])items.push(item(v+h,'D-pad '+v.toLowerCase()+' + '+h.toLowerCase(),'diagonal'));
 }
 function observe(pad,state){
  if(!started||!pad||String(pad.index??0)+'|'+pad.id!==device)return;
  const s=normalizeOverlayInput(state);
  for(const entry of items){if(entry.done)continue;
   if(entry.kind==='button'){if(s[entry.id])entry.held=true;else if(entry.held)entry.done=true;}
   if(entry.kind==='trigger'){const v=s[entry.id];if(v>=.95)entry.seen.add('full');if(v>.1&&v<.9)entry.seen.add('partial');if(v<=.02&&entry.seen.size===2)entry.done=true;}
   if(entry.kind==='stick'){
    const offset=entry.id==='LS'?0:2,x=s.axes[offset],y=s.axes[offset+1],length=Math.hypot(x,y);
    if(Math.abs(x)>.85&&Math.abs(y)<.3)entry.seen.add(x>0?'right':'left');if(Math.abs(y)>.85&&Math.abs(x)<.3)entry.seen.add(y>0?'down':'up');
    if(Math.abs(x)>.5&&Math.abs(y)>.5&&length>.85)entry.seen.add((x>0?'right':'left')+(y>0?'down':'up'));
    if(length<.12&&entry.seen.size===8)entry.done=true;
   }
   if(entry.kind==='diagonal'){const [v,h]=entry.id.match(/(Up|Down)(Left|Right)/).slice(1);const a=s['DPad_'+v],b=s['DPad_'+h];if(a&&b)entry.held=true;else if(!a&&!b&&entry.held)entry.done=true;}
  }
 }
 function result(){return {started,device,total:items.filter(e=>!e.optional).length,complete:items.filter(e=>e.done&&!e.optional).length,items:items.map(({id,label,done,optional})=>({id,label,done,optional:!!optional})),unsupported};}
 return {start,observe,result};
}
