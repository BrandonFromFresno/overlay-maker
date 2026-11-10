// Confirm the Windows archive contains the same visual packages that were tested.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),asar=require('@electron/asar'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),archive=path.resolve(process.argv[2]||path.join(root,'release/win-unpacked/resources/app.asar'));
const catalog=vm.runInNewContext(fs.readFileSync(path.join(root,'app/controller-catalog.js'),'utf8')+';CONTROLLER_CATALOG');
const required=new Set(['app/controller-catalog.js','app/controller-models.js','app/model-geometry.js','app/renderer.js','app/index.html']);
for(const model of catalog){if(model.id!=='G7ProCE')required.add('app/controller-data/'+model.id+'.js');for(const variant of model.variants)if(variant.thumbnail)required.add('app/'+variant.thumbnail);}
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
for(const name of required){const packaged=asar.extractFile(archive,name),source=fs.readFileSync(path.join(root,...name.split('/')));assert.equal(hash(packaged),hash(source),'Missing or stale packaged asset: '+name);}
console.log('PASS: packaged model catalog, renderer, '+(catalog.length-1)+' data packages and all source thumbnails match the tested files.');
