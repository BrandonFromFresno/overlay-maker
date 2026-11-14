const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
(async()=>{
 const manifest=JSON.parse(fs.readFileSync('docs/xelu-template-provenance.json','utf8'));assert.equal(manifest.length,10);
 for(const r of manifest)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join('app/reference-assets/xelu',r.file))).digest('hex'),r.sha256);
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.STUDIO_URL||'http://127.0.0.1:8793');await page.waitForFunction(()=>rendererReady&&!rendererLoading);
 const report=await page.evaluate(async()=>{
  const records=[],read=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  const diff=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(Math.max(...[0,1,2,3].map(k=>Math.abs(a[i+k]-b[i+k])))>8)n++;return n;};
  for(const model of CONTROLLER_CATALOG.filter(m=>m.collection==='Xelu'))for(const v of model.variants){
   const p=validate({...defaultOverlayProject(model.id),nativeSkin:v.id,animationMode:'still'}),c=document.createElement('canvas');c.width=1672;c.height=1241;
   const assets=await controllerAssetsFor(p),r=await createOverlayRenderer(c,assets,{});r.draw(p,{},1000);const neutral=read(c),hash=c.toDataURL();
   const im=new Image();im.src=controllerSkinRecord(p).cover;await im.decode();const geometry=buildModelGeometry(controllerSkinRecord(p),im);
   const counts={};
   for(const key of v.controls){r.draw(p,{[key]:['LT','RT'].includes(key)?1:true},1000);const after=read(c);counts[key]=diff(neutral,after);if(!['LSB','RSB'].includes(key))for(let i=3;i<after.length;i+=4)if(neutral[i]===0&&after[i]>20)throw Error(model.id+'/'+v.id+' highlight escaped silhouette: '+key);}
   r.draw({...p,baseColor:'#8257c1'},{},1000);const shell=read(c);if(diff(neutral,shell)<1000)throw Error('Shell color unavailable');
   const f=geometry.faces.A,mask=document.createElement('canvas');mask.width=1672;mask.height=1241;const mg=mask.getContext('2d');mg.translate(0,300);mg.fill(f.path);const alpha=read(mask);
   for(let i=0;i<shell.length;i+=4)if(alpha[i+3]>250&&diff(neutral.slice(i,i+4),shell.slice(i,i+4)))throw Error(model.id+' shell color changed face button');
   r.draw({...p,buttonColors:{A:{rest:'#19b782',pressed:'#fd6633'}}},{A:true},1000);if(diff(neutral,read(c))<100)throw Error('Per-input color missing');
   const material={...p,shellPattern:'hex',effect:'neon',effectIntensity:.6,textureId:'grain',textureOpacity:.5,holoEnabled:true,abstractEnabled:true};r.draw(material,{},1200);if(diff(neutral,read(c))<500)throw Error('Shell customization missing');
   const art=document.createElement('canvas');art.width=art.height=32;art.getContext('2d').fillRect(0,0,32,32);await r.setLogo(art.toDataURL());const [bx,by,bw,bh]=controllerSkinRecord(p).modelGeometry.bodyBounds,scale=geometry.scale,sy=({XeluDualSense:348,XeluDualShock4:312,XeluLuna:680}[model.id]||550)/1.452,artX=(1672-bw*scale)/2-bx*scale+730/1.452*scale,artY=(941-bh*scale)/2-by*scale+sy*scale;r.draw({...p,mode:'logo',logo:art.toDataURL(),x:artX,y:artY,size:100},{},1000);if(diff(neutral,read(c))<20)throw Error(model.id+'/'+v.id+' customer artwork missing');
   const themed=validate(buildPresetProject(p,PRESET_DATA[0],{wordmark:false}));if(themed.visualModel!==model.id||themed.nativeSkin!==v.id)throw Error('Preset replaced model');r.draw(themed,{A:true,RT:.5,axes:[1,-1,-1,1]},1400);
   r.draw(p,{},1000);records.push({model:model.id,variant:v.id,counts,neutral:c.toDataURL()===hash});
  }
  return records;
 });
 assert.equal(report.length,10);for(const r of report){assert(r.neutral,r.model+' exact neutral');for(const [key,n]of Object.entries(r.counts))assert(n>3,r.model+'/'+r.variant+' '+key);}
 // The actual gallery keeps saved work isolated until Use is pressed.
 for(const model of ['XeluDualSense','XeluDualShock4','XeluXboxSeries','XeluXboxOne','XeluLuna']){
  const original=await page.evaluate(()=>JSON.stringify(project));await page.selectOption('#visualModelChoice',model);await page.waitForFunction(id=>rendererReady&&!rendererLoading&&previewProject().visualModel===id,model);assert.equal(await page.evaluate(()=>JSON.stringify(project)),original);
  if(model==='XeluDualSense'){await page.click('[data-starter="Clean"]');await page.waitForFunction(()=>rendererReady&&!rendererLoading&&previewProject().nativeSkin==='Clean');}
  for(const width of [320,768,1024,1440]){await page.setViewportSize({width,height:1000});assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Gallery overflow');}await page.setViewportSize({width:1440,height:1000});
  await page.click('#startEditing');assert.equal(await page.evaluate(()=>project.visualModel),model);
  const html=await page.evaluate(()=>overlayHTML(true)),customer=await browser.newPage(),requests=[];customer.on('request',req=>{if(!req.url().startsWith('data:'))requests.push(req.url());});customer.on('pageerror',e=>errors.push(e.message));
  await customer.setContent(html);await customer.waitForFunction(()=>window.overlayStatus?.state==='waiting-for-controller');assert.deepEqual(requests,[]);assert(await customer.locator('canvas').evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0)));await customer.close();
  await page.click('#returnToEditor');
 }
 await page.evaluate(()=>persist());await page.reload();await page.waitForFunction(()=>rendererReady&&!rendererLoading);assert.equal(await page.evaluate(()=>project.visualModel),'XeluLuna');
 await page.click('#startEditing');await page.evaluate(()=>{checkpoint();project={...project,baseColor:'#aa1122'};sync();persist();});await page.click('#useDefaultOverlay');assert.equal(await page.evaluate(()=>project.visualModel),'XeluLuna');assert.equal(await page.evaluate(()=>project.baseColor),'#ffffff');await page.click('#undo');assert.equal(await page.evaluate(()=>project.baseColor),'#aa1122');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(process.env.OVERLAY_TEST_OUTPUT||'/tmp','xelu-templates-report.json'),JSON.stringify(report,null,2));console.log('PASS: ten Xelu variants; original source hashes; all exposed inputs; contained highlights; separate shell/button colors; materials, artwork and anime presets; isolated gallery selection; responsive layouts; self-contained customer output for all five models; saved restoration and reset/Undo.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
