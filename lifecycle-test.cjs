const {enterStudio}=require('./test-helpers.cjs');
const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const context=await browser.newContext();await context.addInitScript(()=>{
  window.pads=[];window.sent=[];window.padError=false;window.pendingFrames=new Map();let id=0;
  requestAnimationFrame=fn=>{pendingFrames.set(++id,fn);return id;};cancelAnimationFrame=id=>pendingFrames.delete(id);
  window.stepFrame=time=>{const frames=[...pendingFrames.values()];pendingFrames.clear();frames.forEach(fn=>fn(time));};
  Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>{if(padError)throw new DOMException('Blocked','SecurityError');return pads;}});
  window.desktop={input:s=>sent.push(s),onError:()=>{}};
  window.pad=(index,id,key)=>({index,id,mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},(_,i)=>({pressed:i===key,value:i===key?1:0}))});
  window.deviceEvent=(type,gamepad)=>{const event=new Event(type);Object.defineProperty(event,'gamepad',{value:gamepad});dispatchEvent(event);};
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));const url=process.env.STUDIO_URL||'http://127.0.0.1:8773';const ready=async p=>{await p.waitForFunction(()=>rendererReady&&!rendererLoading,null,{polling:100});await enterStudio(p);};
 await page.goto(url);await ready(page);assert(await page.locator('#retryLoad').isHidden());assert.equal(await page.locator('main').getAttribute('aria-busy'),'false');
 assert((await page.locator('#connectionHint').textContent()).includes('Connect'));assert.deepEqual(await page.evaluate(()=>sent.at(-1)),{});
 // Stable status text must not generate a stream of duplicate live-region mutations.
 await page.evaluate(()=>{window.feedbackMutations=0;new MutationObserver(records=>feedbackMutations+=records.filter(r=>r.type==='childList').length).observe(document.querySelector('#connectionHint'),{childList:true,subtree:true});new MutationObserver(records=>feedbackMutations+=records.filter(r=>r.type==='childList').length).observe(document.querySelector('#controllerStatus'),{childList:true,subtree:true});for(let i=0;i<10;i++)stepFrame(1000+i*16);});
 assert.equal(await page.evaluate(()=>feedbackMutations),0);
 // Auto keeps its active controller when a different slot connects or the list reorders.
 await page.evaluate(()=>{project.animationMode='still';pads=[pad(1,'Controller B',0)];stepFrame(1300);});assert.equal(await page.evaluate(()=>sent.at(-1).A),true);
 await page.evaluate(()=>{pads=[pad(0,'Controller A',1),...pads];deviceEvent('gamepadconnected',pads[0]);});assert.equal(await page.evaluate(()=>sent.at(-1).A),true);
 await page.locator('#controllerDevice').selectOption('0|Controller A');assert.equal(await page.evaluate(()=>sent.at(-1).B),true);assert.equal(await page.evaluate(()=>sent.at(-1).A),false);
 assert.equal(await page.evaluate(()=>localStorage.getItem('overlay-input-device')),'0|Controller A');
 // A disconnect event clears input even when getGamepads briefly returns the old object.
 await page.evaluate(()=>deviceEvent('gamepaddisconnected',pads[0]));assert.deepEqual(await page.evaluate(()=>sent.at(-1)),{});
 const neutral=await page.locator('#canvas').evaluate(c=>c.toDataURL());await page.evaluate(()=>stepFrame(1350));assert.deepEqual(await page.evaluate(()=>sent.at(-1)),{});assert.equal(await page.locator('#canvas').evaluate(c=>c.toDataURL()),neutral);
 await page.evaluate(()=>deviceEvent('gamepadconnected',pads[0]));assert.equal(await page.evaluate(()=>sent.at(-1).B),true);assert.notEqual(await page.locator('#canvas').evaluate(c=>c.toDataURL()),neutral);
 // Losing the selected device never falls through to another held controller.
 await page.evaluate(()=>{pads=pads.slice(1);stepFrame(1400);});assert.deepEqual(await page.evaluate(()=>sent.at(-1)),{});assert((await page.locator('#connectionHint').textContent()).includes('disconnected'));
 await page.evaluate(()=>{pads=[pad(0,'Controller A',1),...pads];stepFrame(1450);});assert.equal(await page.evaluate(()=>sent.at(-1).B),true);
 // Browser permission/API errors release inputs and recover without stopping the frame loop.
 await page.evaluate(()=>{padError=true;stepFrame(1500);});assert.deepEqual(await page.evaluate(()=>sent.at(-1)),{});assert((await page.locator('#connectionHint').textContent()).includes('access is unavailable'));
 await page.evaluate(()=>{padError=false;stepFrame(1550);});assert.equal(await page.evaluate(()=>sent.at(-1).B),true);assert.equal(await page.evaluate(()=>pendingFrames.size),1);
 // Pagehide saves pending edits, releases hardware state and pauses. Resume does not duplicate loops.
 const saved=await page.evaluate(()=>{change('text','REPEATED USE');change('baseColor','#8f4351');dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));return JSON.stringify(project);});
 assert.equal(await page.evaluate(()=>localStorage.getItem('overlay-studio-v1')),saved);assert.deepEqual(await page.evaluate(()=>sent.at(-1)),{});assert.equal(await page.evaluate(()=>pendingFrames.size),0);
 await page.evaluate(()=>{dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});assert.equal(await page.evaluate(()=>sent.at(-1).B),true);assert.equal(await page.evaluate(()=>pendingFrames.size),1);
 await page.reload();await ready(page);assert.equal(await page.evaluate(()=>JSON.stringify(project)),saved);assert.equal(await page.locator('#controllerDevice').inputValue(),'0|Controller A');assert.deepEqual(await page.evaluate(()=>sent.at(-1)),{});assert.equal(await page.evaluate(()=>mode),'live');
 await page.evaluate(()=>{pads=[pad(0,'Controller A',2)];deviceEvent('gamepadconnected',pads[0]);});assert.equal(await page.evaluate(()=>sent.at(-1).X),true);
 await page.evaluate(()=>{pads[0].connected=false;stepFrame(1900);});assert.deepEqual(await page.evaluate(()=>sent.at(-1)),{});assert.equal(await page.evaluate(()=>JSON.stringify(project)),saved);
 // A different browser slot requires an explicit selection rather than guessing identity.
 await page.evaluate(()=>{pads=[pad(2,'Controller A',3)];stepFrame(1950);});assert.deepEqual(await page.evaluate(()=>sent.at(-1)),{});await page.locator('#controllerDevice').selectOption('2|Controller A');assert.equal(await page.evaluate(()=>sent.at(-1).Y),true);assert.equal(await page.evaluate(()=>JSON.stringify(project)),saved);
 // Initial renderer failure offers an inline retry and preserves the restored design.
 const retry=await context.newPage();retry.on('pageerror',e=>errors.push(e.message));await retry.route('**/renderer.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:await response.text()+`\nconst originalFactory=createOverlayRenderer;createOverlayRenderer=async function(canvas,...args){if(canvas.id==='canvas'){window.attempts=(window.attempts||0)+1;if(window.attempts===1){const family=Object.keys(args[1])[0];args[1]={...args[1],[family]:{...args[1][family],source:'data:font/woff2;base64,AAAA'}};}}return originalFactory(canvas,...args);};`});});
 await retry.goto(url);await retry.waitForFunction(()=>!rendererLoading&&document.querySelector('#retryLoad').hidden===false,null,{polling:100});assert(await retry.locator('main').evaluate(e=>e.inert));assert.equal(await retry.evaluate(()=>JSON.stringify(project)),saved);
 await retry.evaluate(()=>{loadOverlayRenderer();loadOverlayRenderer();});await ready(retry);assert.equal(await retry.evaluate(()=>attempts),2);assert.equal(await retry.evaluate(()=>JSON.stringify(project)),saved);assert(!(await retry.locator('main').evaluate(e=>e.inert)));assert(await retry.locator('#previewLoading').isHidden());
 // Unreadable embedded artwork does not prevent use or repeatedly announce the same failure.
 const broken=await context.newPage();broken.on('pageerror',e=>errors.push(e.message));await broken.addInitScript(()=>{const saved=JSON.parse(localStorage.getItem('overlay-studio-v1'));saved.logo='data:image/png;base64,AAAA';saved.mode='logo';localStorage.setItem('overlay-studio-v1',JSON.stringify(saved));});await broken.goto(url);await ready(broken);assert.equal(await broken.locator('#status').getAttribute('data-kind'),'warning');assert.equal(await broken.evaluate(()=>project.logo),'data:image/png;base64,AAAA');
 await broken.evaluate(async()=>{window.announcements=0;new MutationObserver(records=>announcements+=records.length).observe(document.querySelector('#status'),{childList:true});for(let i=0;i<3;i++){sync();await logoPending.catch(()=>{});}});assert.equal(await broken.evaluate(()=>announcements),0);
 // Corrupt or unavailable local storage never silently replaces the saved data during loading.
 const corrupt=await context.newPage();corrupt.on('pageerror',e=>errors.push(e.message));await corrupt.addInitScript(()=>localStorage.setItem('overlay-studio-v1','{broken'));await corrupt.goto(url);await ready(corrupt);assert((await corrupt.locator('#status').textContent()).includes('could not be restored'));assert.equal(await corrupt.evaluate(()=>localStorage.getItem('overlay-studio-v1')),'{broken');assert.equal(await corrupt.locator('#status').getAttribute('data-kind'),'warning');
 const blocked=await context.newPage();blocked.on('pageerror',e=>errors.push(e.message));await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new DOMException('Blocked','SecurityError');};Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError');};});await blocked.goto(url);await ready(blocked);assert((await blocked.locator('#autosave').textContent()).includes('unavailable'));assert.equal(await blocked.locator('#status').getAttribute('data-kind'),'warning');await blocked.evaluate(()=>{change('text','OFFLINE EDIT');persist();});assert.equal(await blocked.evaluate(()=>project.text),'OFFLINE EDIT');assert(!(await blocked.locator('main').evaluate(e=>e.inert)));
 assert.deepEqual(errors,[]);console.log('PASS: quiet missing-device feedback, stable Auto selection, explicit switching, stale disconnect events, reconnect, access-error recovery, pagehide neutral/save, single-loop resume, refresh restoration, preserved device choice, loading retry and nonrepeating artwork warnings.');
 }finally{await browser.close();}})().catch(error=>{console.error(error);process.exit(1)});
