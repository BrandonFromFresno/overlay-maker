const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.STUDIO_URL||'http://127.0.0.1:8793');await page.waitForFunction(()=>rendererReady&&!rendererLoading);
 const report=await page.evaluate(async()=>{
  const checks=[],read=c=>c.getContext('2d').getImageData(0,0,1672,1241).data,difference=(a,b)=>{let count=0;for(let i=0;i<a.length;i+=4)if(Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]),Math.abs(a[i+3]-b[i+3]))>8)count++;return count;};
  for(const model of CONTROLLER_CATALOG.filter(m=>m.id!==DEFAULT_VISUAL_MODEL))for(const variant of model.variants){
   const p=validate({...defaultOverlayProject(model.id),nativeSkin:variant.id,animationMode:'still'}),c=document.createElement('canvas');c.width=1672;c.height=1241;
   const painter=await createOverlayRenderer(c,await controllerAssetsFor(p),{});painter.draw(p,{},1000);const neutral=read(c),hash=c.toDataURL(),unchanged=[];
   for(const key of variant.controls.filter(k=>!['LSB','RSB'].includes(k))){painter.draw(p,{[key]:['LT','RT'].includes(key)?1:true},1000);if(difference(neutral,read(c))<3)unchanged.push(key);}
   const states=[{axes:[1,1,-1,-1],LSB:true,RSB:true},{axes:[-1,-1,1,1],A:true,B:true,LB:true,RB:true,LT:.25,RT:.75},{DPad_Up:true,DPad_Right:true},{LT:1,RT:1}];
   const motion=states.map(state=>{painter.draw(p,state,1000);return difference(neutral,read(c));});
   const depths=[0,.25,.5,.75,1].map(value=>{painter.draw(p,{LT:value,RT:value},1000);return c.toDataURL();});if(new Set(depths).size!==5)throw Error(model.id+'/'+variant.id+' trigger depth');
   if(variant.id===model.defaultVariant){
    const im=new Image();im.src=controllerSkinRecord(p).cover;await im.decode();const geometry=buildModelGeometry(controllerSkinRecord(p),im);
    painter.draw({...p,baseColor:'#7048aa'}, {},1000);const tinted=read(c);
    for(const [control,f] of Object.entries(geometry.faces))for(const part of f.parts){const [x,y,w,h]=part.bounds,px=Math.round(x+w/2),py=Math.round(y+h/2+300);if(px<0||px>=1672||py<0||py>=1241)continue;const i=(py*1672+px)*4;if(c.getContext('2d').isPointInPath(part.path,px,py-300,part.rule)&&neutral[i+3]>250&&difference(neutral.slice(i,i+4),tinted.slice(i,i+4)))throw Error(model.id+'/'+variant.id+' shell tint leaked into '+control+' at '+px+','+py);}
    if(model.id==='T3ProXBox'){const ink=geometry.faces.A.nativeInk.getContext('2d').getImageData(0,0,geometry.faces.A.nativeInk.width,geometry.faces.A.nativeInk.height).data;let visible=0;for(let i=3;i<ink.length;i+=4)if(ink[i]>200)visible++;if(visible<200)throw Error('White face legends must survive recoloring');}
    for(let angle=0;angle<16;angle++){
     const x=Math.cos(angle*Math.PI/8),y=Math.sin(angle*Math.PI/8);painter.draw(p,{axes:[x,y,x,y],LSB:true,RSB:true},1000);const moved=read(c);
     for(const [cx,cy,,,,cap,rim]of geometry.stickLayout){
      if(rim<cap+3)continue;const px=Math.round(cx-x*(rim-1)),py=Math.round(cy+300-y*(rim-1)),i=(py*1672+px)*4;
      if(difference(neutral.slice(i,i+4),moved.slice(i,i+4))>0)throw Error(model.id+'/'+variant.id+' stationary rim changed at '+angle);
     }
    }
   }
   painter.draw(p,{},1000);
   checks.push({model:model.id,variant:variant.id,unchanged,motion,neutral:c.toDataURL()===hash,spatial:controllerSkinRecord(p).modelGeometry.spatialRemap});
   if(variant.id===model.defaultVariant){window.modelReview??={};modelReview[model.id]=c.toDataURL();}
  }
  return checks;
 });
 fs.writeFileSync(path.join(process.env.OVERLAY_TEST_OUTPUT||'/tmp','models-report.json'),JSON.stringify(report,null,2));for(const [model,data]of Object.entries(await page.evaluate(()=>window.modelReview||{})))fs.writeFileSync(path.join(process.env.OVERLAY_TEST_OUTPUT||'/tmp','model-'+model+'.png'),Buffer.from(data.split(',')[1],'base64'));assert.equal(report.length,await page.evaluate(()=>CONTROLLER_CATALOG.filter(m=>m.id!==DEFAULT_VISUAL_MODEL).reduce((n,m)=>n+m.variants.length,0)));assert(await page.evaluate(()=>controllerVariant('T3ProXBox','White').controls.includes('Home')),'Supplied center Home artwork must remain interactive');for(const r of report){assert.deepEqual(r.unchanged,[],r.model+'/'+r.variant+' input paths');if(r.model==='LayerPS1'){assert.equal(r.motion[0],0,'PS1 must not invent sticks');assert(r.motion.slice(1).every(n=>n>20),r.model+'/'+r.variant+' compound states');}else assert(r.motion.every(n=>n>20),r.model+'/'+r.variant+' compound/motion states');assert(r.neutral,r.model+'/'+r.variant+' releases return exactly neutral');}
 // Applying a different visual model never alters the physical controller selector.
 await page.selectOption('#visualModelChoice','T3Lite');await page.waitForFunction(()=>rendererReady&&!rendererLoading&&previewProject().visualModel==='T3Lite');
 assert.equal(await page.evaluate(()=>visualModelOf(project)),'G7ProCE');await page.click('#startEditing');assert.equal(await page.evaluate(()=>project.visualModel),'T3Lite');
 const result=await page.evaluate(async()=>{
  const original={...project},device=$('controllerDevice').value;project.name='Universal customer';project.buttonColors={A:{pressed:'#00ff00'}};sync();persist();
  const valid=validate(JSON.parse(JSON.stringify(project))),exports=overlayHTML(true),canvas=document.createElement('canvas');canvas.width=1672;canvas.height=1241;const r=await createOverlayRenderer(canvas,await controllerAssetsFor(project),{});
  const standard={mapping:'standard',connected:true,axes:[.5,-.5,-1,1],buttons:Array.from({length:17},(_,i)=>({pressed:i===0||i===12||i===15,value:i===6?.5:i===7?.75:i===0||i===12||i===15?1:0}))};
  const brands=['Xbox Wireless Controller','DualSense Wireless Controller','Generic USB Gamepad'].map(id=>{const s=readStandardGamepad({...standard,id});r.draw(project,s,1000);return {state:s,image:canvas.toDataURL()};});
  return {valid,device,sameDevice:device===$('controllerDevice').value,brands,exports};
 });
 assert(result.sameDevice);assert.equal(result.valid.visualModel,'T3Lite');assert.equal(result.brands[0].state.A,true);assert.equal(result.brands[0].state.LT,.5);assert.equal(result.brands[0].state.RT,.75);assert(result.brands.every(b=>b.image===result.brands[0].image));
 // Finished HTML uses only its embedded chosen artwork; no controller packs/editor are needed.
 const output=path.join(process.env.OVERLAY_TEST_OUTPUT||'/tmp','models-customer.html');fs.writeFileSync(output,result.exports);
 const customer=await browser.newPage();const requests=[];customer.on('pageerror',e=>errors.push(e.message));customer.on('request',r=>{if(!r.url().startsWith('data:'))requests.push(r.url());});await customer.setContent(result.exports);await customer.waitForTimeout(1200);
 assert.equal(requests.length,0);assert(await customer.locator('canvas').evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0)));
 await page.reload();await page.waitForFunction(()=>rendererReady&&!rendererLoading);assert.equal(await page.evaluate(()=>project.visualModel),'T3Lite');assert.equal(await page.evaluate(()=>project.name),'Universal customer');
 await page.click('#startEditing');await page.click('#useDefaultOverlay');assert.equal(await page.evaluate(()=>project.visualModel),'T3Lite');assert.equal(await page.evaluate(()=>Object.keys(project.buttonColors).length),0);await page.click('#undo');assert.equal(await page.evaluate(()=>project.buttonColors.A.pressed),'#00ff00');
 const directory=process.env.OVERLAY_TEST_OUTPUT||'/tmp';fs.writeFileSync(path.join(directory,'models-report.json'),JSON.stringify(report,null,2));

 const recovery=await browser.newPage();recovery.on('pageerror',e=>errors.push(e.message));await recovery.addInitScript(()=>{window.forwarded=[];window.testPads=[{id:'Any standard gamepad',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},(_,i)=>({pressed:i===0,value:i===0?1:0}))}];Object.defineProperty(navigator,'getGamepads',{value:()=>testPads});window.desktop={input:s=>forwarded.push(s),onError:()=>{}};});
 await recovery.goto(process.env.STUDIO_URL||'http://127.0.0.1:8793');await recovery.waitForFunction(()=>rendererReady&&!rendererLoading);
 await recovery.route('**/controller-data/C2.js',r=>r.abort());await recovery.selectOption('#visualModelChoice','C2');await recovery.waitForFunction(()=>!rendererLoading&&!rendererReady);assert(await recovery.locator('#retryLoad').isVisible());assert.equal(await recovery.evaluate(()=>visualModelOf(project)),'G7ProCE');
 await recovery.click('#continueEditing');await recovery.waitForFunction(()=>rendererReady&&!rendererLoading);assert.equal(await recovery.evaluate(()=>visualModelOf(project)),'G7ProCE');await recovery.click('#returnToEditor');await recovery.unroute('**/controller-data/C2.js');await recovery.selectOption('#visualModelChoice','C2');await recovery.waitForFunction(()=>rendererReady&&!rendererLoading&&previewProject().visualModel==='C2');
 let releaseArtwork;await recovery.route('**/controller-data/C3.js',async r=>{await new Promise(resolve=>releaseArtwork=resolve);await r.continue();});await recovery.selectOption('#visualModelChoice','C3');await recovery.waitForFunction(()=>rendererLoading);await recovery.waitForTimeout(350);assert.equal(await recovery.evaluate(()=>forwarded.at(-1).A),true);
 await recovery.evaluate(()=>{testPads=[];selectedVisualModel='T3Lite';buildStarterChoices();chooseStarter('White');});await recovery.waitForFunction(()=>Object.keys(forwarded.at(-1)).length===0);releaseArtwork();await recovery.waitForFunction(()=>rendererReady&&!rendererLoading&&previewProject().visualModel==='T3Lite');assert.equal(await recovery.evaluate(()=>rendererAssetKey),'T3Lite/White');assert.equal(await recovery.evaluate(()=>visualModelOf(project)),'G7ProCE');
 assert.deepEqual(errors,[]);console.log('PASS: all additional artwork variants, every exposed control, compound inputs, stick travel, exact neutral return, brand-independent standard mapping, isolated selection, saved-model restoration, model-preserving reset/undo and self-contained customer HTML.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
