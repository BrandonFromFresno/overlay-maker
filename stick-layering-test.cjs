const {enterStudio}=require('./test-helpers.cjs');
const {chromium}=require('@playwright/test'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.STUDIO_URL||'http://127.0.0.1:8773');await page.waitForFunction(()=>rendererReady);await enterStudio(page);
 const result=await page.evaluate(async()=>{
  const canvas=document.createElement('canvas');canvas.width=1672;canvas.height=1241;const painter=await createOverlayRenderer(canvas,ASSET_DATA),g=canvas.getContext('2d',{willReadFrequently:true});
  const p={...defaults,text:'',breathing:false,glow:0,effect:'none',animationMode:'still',buttonColors:{LSB:{rest:'#4695d8',pressed:'#e93380'},RSB:{rest:'#59b673',pressed:'#cf459a'}}};
  const expected=document.createElement('canvas');expected.width=1672;expected.height=1241;const eg=expected.getContext('2d',{willReadFrequently:true});
  const draw=state=>{painter.draw(p,state,1200);return g.getImageData(0,0,1672,1241).data;},neutral=draw({});let lostCapPixels=0,movedRimPixels=0,aboveRimSamples=0;
  const differs=(a,b,i,tolerance=0)=>[0,1,2,3].some(n=>Math.abs(a[i+n]-b[i+n])>tolerance);
  for(const [cx,cy,key,offset] of [[456,590,'LSB',0],[1033,823,'RSB',2]])for(const clicked of [false,true]){
   draw({[key]:clicked});const cap=document.createElement('canvas');cap.width=cap.height=180;cap.getContext('2d').drawImage(canvas,cx-90,cy-90,180,180,0,0,180,180);
   for(let step=0;step<16;step++){
    const angle=step*Math.PI/8,dx=Math.cos(angle)*38,dy=Math.sin(angle)*38,axes=[0,0,0,0];axes[offset]=Math.cos(angle);axes[offset+1]=Math.sin(angle);
    const actual=draw({axes,[key]:clicked});eg.clearRect(0,0,1672,1241);eg.drawImage(cap,cx+dx-90,cy+dy-90,180,180);const reference=eg.getImageData(0,0,1672,1241).data;
    for(let y=cy-128;y<=cy+128;y++)for(let x=cx-128;x<=cx+128;x++){
     const socketDistance=Math.hypot(x+.5-cx,y+.5-cy),capDistance=Math.hypot(x+.5-cx-dx,y+.5-cy-dy),i=(y*1672+x)*4;
     // The cap's opaque perimeter must retain its texture/color as it crosses the rim.
     if(capDistance>=65&&capDistance<=80&&socketDistance>=108){aboveRimSamples++;if(differs(actual,reference,i,2))lostCapPixels++;}
     // A fixed rim can be occluded by the cap, but every uncovered rim pixel stays still.
     if(socketDistance>=107&&socketDistance<=126&&capDistance>=89&&differs(actual,neutral,i))movedRimPixels++;
    }
   }
  }
  const release=draw({}).every((v,i)=>v===neutral[i]);return {lostCapPixels,movedRimPixels,aboveRimSamples,release};
 });
 assert(result.aboveRimSamples>1000);assert.equal(result.lostCapPixels,0,'Cap clipped beneath the stationary rim');assert.equal(result.movedRimPixels,0,'Uncovered rim pixels moved');assert(result.release,'Stick did not return to the original neutral image');assert.deepEqual(errors,[]);
 console.log('PASS: both textured caps remain above fixed rims across 16 directions, resting/pressed colors, uncovered rim stability and exact neutral restoration.');
 }finally{await browser.close();}})().catch(error=>{console.error(error);process.exit(1)});
