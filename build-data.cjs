const fs=require('node:fs'),path=require('node:path');
const root=__dirname;
const data=JSON.parse(fs.readFileSync(path.join(root,'guide-data.json'),'utf8'));
fs.writeFileSync(path.join(root,'data.js'),'window.SAO_GUIDE = '+JSON.stringify(data)+';\n');
console.log('Updated browser data.');
