const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname),out=path.resolve(root,'_site');
assert.equal(path.dirname(out),root,'Output must remain inside the repository');
const files=['index.html','site.css','site.js','data.js','speed-engine.js','drop-engine.js','favicon.svg','guide-data.json','任務素材掉落機率.csv','.nojekyll'];
for(const file of files)assert(fs.statSync(path.join(root,file)).isFile(),`Missing website file: ${file}`);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
for(const file of files)fs.copyFileSync(path.join(root,file),path.join(out,file));
console.log(`Prepared ${files.length} public website files in _site/`);
