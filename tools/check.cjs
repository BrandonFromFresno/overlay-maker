const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function scripts(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(entry=>{const file=path.join(folder,entry.name);return entry.isDirectory()?scripts(file):/\.(?:c?js)$/.test(file)?[file]:[];});}
const files=[...fs.readdirSync(root).filter(file=>file.endsWith('.cjs')).map(file=>path.join(root,file)),...scripts(path.join(root,'app')),...scripts(__dirname)];
for(const file of files)execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
console.log(`PASS: syntax checked ${files.length} JavaScript files.`);
