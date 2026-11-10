const {enterStudio}=require('./test-helpers.cjs');
const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.requestAnimationFrame=fn=>{window.nextFrame=fn;return 1;};window.sent=[];window.desktop={input:s=>sent.push(s),onError:()=>{}};window.pads=[];navigator.getGamepads=()=>pads;});
const url=process.env.STUDIO_URL||'http://127.0.0.1:8773';await page.goto(url);await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Ready.'),null,{polling:100});await enterStudio(page);
const result=await page.evaluate(async()=>{
const c=document.createElement('canvas');c.width=1672;c.height=1241;const g=c.getContext('2d',{willReadFrequently:true});const r=await createOverlayRenderer(c,ASSET_DATA);
const p={...defaults,text:'',breathing:false,glow:0,effect:'none',themeStyle:'none',buttonStyle:'none',homeStyle:'none',shellPattern:'none',textureId:'none',animationMode:'still',pressed:'#ee2299'};
const draw=state=>{r.draw(p,state,1200);return g.getImageData(0,0,c.width,c.height).data;},neutral=draw({});
const changed=(a,b,x,y)=>{const i=(y*1672+x)*4;return [0,1,2,3].some(n=>a[i+n]!==b[i+n]);};
const keys=['A','B','X','Y','Home','Share','Options','Capture','M','LB','RB','DPad_Up','DPad_Down','DPad_Left','DPad_Right','LSB','RSB'];const counts={},leakByKey={};let leaks=0;
for(const key of keys){
 const active=draw({[key]:true}),mask=document.createElement('canvas');mask.width=1672;mask.height=1241;const m=mask.getContext('2d');m.translate(0,300);m.fillStyle=m.strokeStyle='#fff';m.lineWidth=4;
 if(key==='LSB'||key==='RSB'){m.beginPath();m.arc(key==='LSB'?456:1033,key==='LSB'?290:523,88,0,Math.PI*2);m.fill();}
 else if(key==='LB'||key==='RB')m.fillRect(key==='LB'?308:1030,0,334,125);
 else{const svg=new DOMParser().parseFromString(atob(ASSET_DATA[key].split(',')[1]),'image/svg+xml'),shape=svg.querySelector('clipPath > *');const path=new Path2D();if(shape.tagName==='circle')path.arc(+shape.getAttribute('cx'),+shape.getAttribute('cy'),+shape.getAttribute('r'),0,Math.PI*2);else path.addPath(new Path2D(shape.getAttribute('d')));m.fill(path);m.stroke(path);}
 const allowed=m.getImageData(0,0,1672,1241).data;let count=0;
 for(let i=0;i<active.length;i+=4)if([0,1,2,3].some(n=>active[i+n]!==neutral[i+n])){count++;if(!allowed[i+3]){leaks++;leakByKey[key]=(leakByKey[key]||0)+1;}if((key==='LB'||key==='RB')&&!neutral[i+3]){leaks++;leakByKey[key]=(leakByKey[key]||0)+1;}}
 counts[key]=count;if(draw({}).some((v,i)=>v!==neutral[i]))throw Error('Stuck release: '+key);
}
// All four diagonals light both directions; unrelated pixels remain untouched.
let diagonals=0;
for(const vertical of ['DPad_Up','DPad_Down'])for(const horizontal of ['DPad_Left','DPad_Right']){
 const a=draw({[vertical]:true}),b=draw({[horizontal]:true}),both=draw({[vertical]:true,[horizontal]:true});let aa=0,bb=0;
 for(let i=0;i<a.length;i+=4){const ca=[0,1,2].some(n=>a[i+n]!==neutral[i+n]),cb=[0,1,2].some(n=>b[i+n]!==neutral[i+n]);if(ca&&!cb){aa++;if([0,1,2,3].some(n=>a[i+n]!==both[i+n]))throw Error('Lost diagonal vertical');}if(cb&&!ca){bb++;if([0,1,2,3].some(n=>b[i+n]!==both[i+n]))throw Error('Lost diagonal horizontal');}}
 if(aa>100&&bb>100)diagonals++;
}
// Full sweeps and clicks: uncovered rim pixels stay fixed while caps overlap them.
let rimLeaks=0;
for(let step=0;step<16;step++){const angle=step*Math.PI/8,axes=[Math.cos(angle),Math.sin(angle),-Math.cos(angle),-Math.sin(angle)];const a=draw({axes,LSB:true,RSB:true});
 for(const [cx,cy,offset] of [[456,590,0],[1033,823,2]])for(let y=cy-128;y<=cy+128;y++)for(let x=cx-128;x<=cx+128;x++){const d=Math.hypot(x-cx,y-cy);if(d>=107&&d<=126&&Math.hypot(x-cx-axes[offset]*38,y-cy-axes[offset+1]*38)>=89&&changed(a,neutral,x,y))rimLeaks++;}
}
const diagonal=draw({axes:[1,1,-1,-1]}),unit=draw({axes:[Math.SQRT1_2,Math.SQRT1_2,-Math.SQRT1_2,-Math.SQRT1_2]});const radial=diagonal.every((v,i)=>v===unit[i]);
const invalid=draw({axes:[NaN,Infinity,'1',null],A:'false',LT:NaN,RT:-1});const invalidNeutral=invalid.every((v,i)=>v===neutral[i]);
const clipped=draw({axes:[2,0,0,-3],LT:4,RT:5}),valid=draw({axes:[1,0,0,-1],LT:1,RT:1});const clamped=clipped.every((v,i)=>v===valid[i]);
let triggerLeaks=0,triggerEdges=[];
for(const [key,asset,x] of [['LT','lt',365],['RT','rt',1090]]){
 const image=new Image();image.src=ASSET_DATA[asset];await image.decode();const mask=document.createElement('canvas');mask.width=185;mask.height=200;mask.getContext('2d').drawImage(image,0,0,185,200);const alpha=mask.getContext('2d').getImageData(0,0,185,200).data;
 // Preserve the rendered silhouette's exact alpha, including antialiased edge pixels.
 for(const pressure of [.001,.25,.5,.75,1]){const active=draw({[key]:pressure});for(let yy=0;yy<200;yy++)for(let xx=0;xx<185;xx++){const i=((38+yy)*1672+x+xx)*4;if(active[i+3]!==neutral[i+3]||(!alpha[(yy*185+xx)*4+3]&&!neutral[i+3]&&changed(active,neutral,x+xx,38+yy))){triggerLeaks++;triggerEdges.push({key,pressure,x:xx,y:yy,neutral:Array.from(neutral.slice(i,i+4)),active:Array.from(active.slice(i,i+4))});}}}
}
let depth=[];for(const pressure of [0,.001,.25,.5,.75,1]){draw({LT:pressure,RT:pressure});depth.push(Array.from(g.getImageData(450,100,1,1).data));}
const all=Object.fromEntries(keys.map(k=>[k,true]));all.axes=[1,0,0,-1];all.LT=.5;all.RT=1;draw(all);const released=draw({}).every((v,i)=>v===neutral[i]);
r.draw(p,{axes:[1,0,0,-1],LSB:true,RSB:true,LT:.5,RT:1,A:true,DPad_Up:true,DPad_Right:true},1200);document.body.append(c);c.id='input-proof';
const mapping=Array.from({length:17},(_,index)=>{const buttons=Array.from({length:17},()=>({pressed:false,value:0}));buttons[index]={pressed:true,value:1};return readStandardGamepad({buttons,axes:[0,0,0,0]});});
return {counts,leaks,leakByKey,diagonals,rimLeaks,radial,invalidNeutral,clamped,triggerLeaks,triggerEdges,depth,released,mapping,disconnected:readStandardGamepad({connected:false,axes:[1,1],buttons:[{pressed:true}]})};
});

for(const [key,count] of Object.entries(result.counts))assert(count>100,key+' did not light');assert.equal(result.leaks,0,'Highlight escaped control: '+JSON.stringify(result.leakByKey));assert.equal(result.triggerLeaks,0,'Trigger highlight escaped silhouette '+JSON.stringify(result.triggerEdges));assert.equal(result.diagonals,4);assert.equal(result.rimLeaks,0,'Stationary stick rim moved');for(const key of ['radial','invalidNeutral','clamped','released'])assert(result[key],key);
for(let i=1;i<result.depth.length;i++)assert(result.depth[i][1]<=result.depth[i-1][1],'Trigger depth must approach pressed color continuously');assert(Math.abs(result.depth[1][1]-result.depth[0][1])<=1,'Trigger jumped at first pressure');
const standard=['A','B','X','Y','LB','RB','LT','RT','Share','Options','LSB','RSB','DPad_Up','DPad_Down','DPad_Left','DPad_Right','Home'];standard.forEach((key,i)=>assert(result.mapping[i][key],key+' mapping'));assert.equal(result.disconnected.A,false);assert.deepEqual(result.disconnected.axes,[0,0,0,0]);
if(process.env.INPUT_SCREENSHOT)await page.locator('#input-proof').screenshot({path:process.env.INPUT_SCREENSHOT});
// Changed inputs forward on consecutive display frames, with no extra 30 ms gate.
const bridge=await page.evaluate(()=>{const pad={index:0,id:'Test gamepad',mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};pads=[pad];nextFrame(1000);pad.buttons[0].pressed=true;nextFrame(1016);pad.buttons[0].pressed=false;nextFrame(1032);pads=[];nextFrame(1048);const count=sent.length;nextFrame(1064);return {states:sent.slice(-4),idleCount:sent.length-count};});assert.equal(bridge.states[1].A,true);assert.equal(bridge.states[2].A,false);assert.deepEqual(bridge.states[3],{});assert.equal(bridge.idleCount,0);
// Run the actual generated HTML and inject SSE events/disconnects without native hardware.
const html=await page.evaluate(()=>overlayHTML());await page.route(url+'/input-export.html',route=>route.fulfill({contentType:'text/html',body:html}));await page.addInitScript(()=>{window.EventSource=class{constructor(){window.events=this;}};});await page.goto(url+'/input-export.html');await page.waitForFunction(()=>window.nextFrame&&window.events,null,{polling:100});

const exportCheck=await page.evaluate(()=>{const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');nextFrame(1200);const rest=canvas.toDataURL();events.onmessage({data:JSON.stringify({Home:true,axes:[1,0,0,-1],LT:1})});nextFrame(1200);const pressed=canvas.toDataURL();events.onerror();nextFrame(1200);const released=rest===canvas.toDataURL();events.onmessage({data:JSON.stringify({A:true,RT:1})});nextFrame(1200);const reconnected=rest!==canvas.toDataURL();const now=Date.now,staleTime=now()+1001;Date.now=()=>staleTime;nextFrame(1200);Date.now=now;return {active:rest!==pressed,released,reconnected,stale:rest===canvas.toDataURL()};});assert(Object.values(exportCheck).every(Boolean),'Export disconnect/reconnect/stale release');assert.deepEqual(errors,[]);
console.log('PASS: 17 control highlights, four diagonals, 16 stick angles and clicks, stationary rims, radial limits, trigger depth, simultaneous inputs, neutral/release, standard mapping, next-frame forwarding, standalone OBS input and disconnect.');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exit(1);});
