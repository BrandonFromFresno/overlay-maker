// Run after starting the app's static server. Captures use the real exported painter and vector masters.
const {chromium}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path');
(async()=>{const out=process.env.OVERLAY_TEST_OUTPUT||path.resolve(__dirname,'../docs'),browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 fs.mkdirSync(out,{recursive:true});const page=await browser.newPage({viewport:{width:1200,height:676}});await page.goto(process.env.STUDIO_URL||'http://127.0.0.1:8793');await page.waitForFunction(()=>rendererReady&&!rendererLoading);
 const images=await page.evaluate(async()=>{
  cancelAnimationFrame(inputFrameId);inputPaused=true;
  const words=['bang','zap','boom','pow'],masters=document.createElement('canvas');masters.width=1200;masters.height=676;const mg=masters.getContext('2d');mg.fillStyle='#000';mg.fillRect(0,0,1200,676);
  for(const [i,word]of words.entries()){const image=new Image();image.src='comic-assets/'+word+'.svg';await image.decode();mg.drawImage(image,i%2*600,Math.floor(i/2)*338,600,338);}
  const phases=document.createElement('canvas');phases.width=1250;phases.height=800;const pg=phases.getContext('2d');pg.fillStyle='#000';pg.fillRect(0,0,1250,800);pg.font='13px sans-serif';
  const scene=document.createElement('canvas');scene.width=1672;scene.height=1241;const g=scene.getContext('2d'),layout={id:'review',body:null,floatImage:null,rt:[800,430,0,0],reserved:[]};
  for(const [row,word]of words.entries())for(const [col,age]of [0,40,90,180,280].entries()){
   g.clearRect(0,0,1672,1241);const painter=createComicGunfirePainter(g,()=>layout,()=>.5),p={...defaults,comicEnabled:true,comicSelection:word,comicRotation:0,comicSize:1.3,animationMode:'full'};painter.draw(p,{RT:1},0);g.clearRect(0,0,1672,1241);painter.draw(p,{RT:1},age);const f=painter.inspect().placement;
   pg.drawImage(scene,f.x-260,f.y-185,520,370,col*250,row*200,250,178);pg.fillStyle='#aab4c4';pg.fillText(age+' ms',col*250+12,row*200+194);
  }
  window.comicReviewFrame=(age)=>{const sheet=document.createElement('canvas');sheet.width=1000;sheet.height=684;const sg=sheet.getContext('2d');sg.fillStyle='#000';sg.fillRect(0,0,1000,560);for(const [i,word]of words.entries()){g.clearRect(0,0,1672,1241);const p={...defaults,comicEnabled:true,comicSelection:word,comicRotation:8,comicSize:1.3,animationMode:'full'},paint=createComicGunfirePainter(g,()=>layout,()=>.72);paint.draw(p,{RT:1},0);g.clearRect(0,0,1672,1241);paint.draw(p,{RT:1},age);const f=paint.inspect().placement;sg.drawImage(scene,f.x-270,f.y-185,540,370,i%2*500,Math.floor(i/2)*342,500,342);}return sheet.toDataURL();};
  const repeat=document.createElement('canvas');repeat.width=1500;repeat.height=500;const rg=repeat.getContext('2d');rg.fillStyle='#000';rg.fillRect(0,0,1500,500);rg.font='13px sans-serif';
  for(const [row,interval]of [160,75].entries()){
   const paint=createComicGunfirePainter(g,()=>layout,()=>.72),p={...defaults,comicEnabled:true,comicRepeat:true,comicInterval:interval,animationMode:'full'};let column=0;
   for(let t=0;t<=420;t+=10){g.clearRect(0,0,1672,1241);paint.draw(p,{RT:1},t);if([90,190,250,330,420].includes(t)){const f=paint.inspect().placement;rg.drawImage(scene,f.x-250,f.y-170,500,340,column*300,row*250,300,204);rg.fillStyle='#aab4c4';rg.fillText(interval+' ms repeat · '+t+' ms',column*300+10,row*250+235);column++;}}
  }
  return{masters:masters.toDataURL(),phases:phases.toDataURL(),repeat:repeat.toDataURL()};
 });
 for(const [key,data]of Object.entries(images))fs.writeFileSync(path.join(out,'comic-'+key+'-0.15.png'),Buffer.from(data.split(',')[1],'base64'));
 if(process.env.COMIC_FRAMES){fs.mkdirSync(process.env.COMIC_FRAMES,{recursive:true});for(let i=0;i<60;i++){const age=i*1000/60%1000,data=await page.evaluate(t=>comicReviewFrame(t),age);fs.writeFileSync(path.join(process.env.COMIC_FRAMES,String(i).padStart(3,'0')+'.png'),Buffer.from(data.split(',')[1],'base64'));}}
 console.log('Captured comic masters and five animation phases on #000000.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
