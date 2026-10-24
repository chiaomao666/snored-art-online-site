const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname),out=path.resolve(root,'_site');
assert.equal(path.dirname(out),root,'Output must remain inside the repository');
const files=['index.html','site.css','site.js','data.js','speed-engine.js','drop-engine.js','build-engine.js','build-ui.js','monster-data.js','monsters-ui.js','reward-guide.js','favicon.svg','guide-data.json','任務素材掉落機率.csv','.nojekyll'];
for(const file of files)assert(fs.statSync(path.join(root,file)).isFile(),`Missing website file: ${file}`);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
for(const file of files)fs.copyFileSync(path.join(root,file),path.join(out,file));
const html=fs.readFileSync(path.join(out,'index.html'),'utf8');
const versioned=html.replace(/(href|src)="([^"#?:]+\.(?:js|css))"/g,(_,attribute,file)=>{
    assert(files.includes(file),`Unexpected public asset: ${file}`);
    const version=crypto.createHash('sha256').update(fs.readFileSync(path.join(out,file))).digest('hex').slice(0,12);
    return `${attribute}="${file}?v=${version}"`;
});
fs.writeFileSync(path.join(out,'index.html'),versioned);
console.log(`Prepared ${files.length} public website files in _site/`);
