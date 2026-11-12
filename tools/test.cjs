const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),appRoot=path.join(root,'app');
const available=fs.readdirSync(root).filter(file=>file==='smoke.cjs'||file.endsWith('-test.cjs')).sort();
const requested=process.argv.slice(2).filter(arg=>arg!=='--'),suites=requested.length?requested:available;
if(suites.some(file=>!available.includes(file)))throw Error('Choose existing test filenames: '+available.join(', '));
const output=process.env.OVERLAY_TEST_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'overlay-checks-'));fs.mkdirSync(output,{recursive:true});
const server=http.createServer(async(req,res)=>{
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(appRoot,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(appRoot+path.sep)){res.writeHead(403);res.end();return;}
  const data=await fs.promises.readFile(file);const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404);res.end();}
});
(async()=>{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const env={...process.env,STUDIO_URL:`http://127.0.0.1:${server.address().port}`,OVERLAY_TEST_OUTPUT:output,CHROMIUM_PATH:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':require('@playwright/test').chromium.executablePath())};
 const failed=[];async function run(file){console.log(`\nRunning ${file}`);const code=await new Promise(resolve=>{const child=spawn(process.execPath,[file],{cwd:root,env,stdio:'inherit'});child.on('error',error=>{console.error(error.message);resolve(1);});child.on('exit',code=>resolve(code??1));});if(code!==0)failed.push(file);}
 try{
  // Native suites share a fixed loopback port; browser suites use isolated contexts.
  const native=new Set(['bridge-test.cjs','setup-bridge-test.cjs','release-native-test.cjs','github-delivery-test.cjs','customer-preview-test.cjs']);for(const file of suites.filter(file=>native.has(file)))await run(file);
  const queue=suites.filter(file=>!native.has(file));async function worker(){while(queue.length)await run(queue.shift());}await Promise.all([worker(),worker()]);
  console.log(`\n${suites.length-failed.length}/${suites.length} suites passed. Test artifacts: ${output}`);if(failed.length){console.error('Failed: '+failed.join(', '));process.exitCode=1;}
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.closeAllConnections();server.close();process.exitCode=1;});
