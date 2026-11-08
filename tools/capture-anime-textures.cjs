const {chromium}=require('@playwright/test'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto(process.env.STUDIO_URL||'http://127.0.0.1:8769');await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Ready.'));const data=await page.evaluate(async()=>{
 const sheet=document.createElement('canvas');sheet.width=1500;sheet.height=1150;const g=sheet.getContext('2d');g.fillStyle='#111216';g.fillRect(0,0,1500,1150);
 const canvas=document.createElement('canvas');canvas.width=1672;canvas.height=1241;const painter=await createOverlayRenderer(canvas,ASSET_DATA,FONT_DATA);
 for(const [i,id] of ['grand-line','soul-reaper','golden-wind','hunter','defense-force','off-duty'].entries()){
  const preset=PRESET_DATA.find(p=>p.id===id),p=buildPresetProject({...defaults},preset);painter.draw({...p,textureId:'concrete',textureBlend:'multiply',textureOpacity:.18,breathing:false},{},1200,true);
  const x=i%3*500,y=Math.floor(i/3)*575;g.drawImage(canvas,x,y,500,371);g.fillStyle='#f4f4f7';g.font='700 21px Arial';g.fillText(preset.name,x+24,y+402);g.fillStyle='#b8b8c3';g.font='14px Arial';g.fillText(preset.inspiration,x+24,y+428);
  g.drawImage(canvas,770,450,130,130,x+24,y+450,100,100);g.drawImage(canvas,1080,440,310,310,x+140,y+450,100,100);g.fillStyle='#c2c2ca';g.font='13px Arial';g.fillText('Home',x+260,y+478);g.fillText(preset.homeStyle.split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join(' '),x+260,y+501);g.fillText('ABXY',x+260,y+531);
 }
 return sheet.toDataURL();
});fs.writeFileSync('docs/anime-theme-preview.png',Buffer.from(data.split(',')[1],'base64'));await page.evaluate(()=>{applyAnimePreset(PRESET_DATA.find(p=>p.id==='grand-line'));project.breathing=false;project.textureId='concrete';project.textureBlend='multiply';project.textureOpacity=.4;selectInspector('textures');sync();});await page.screenshot({path:'docs/texture-editor-preview.png'});}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
