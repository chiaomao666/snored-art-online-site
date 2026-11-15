const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const p=path.join(__dirname,'server-guide-data.json'),data=JSON.parse(fs.readFileSync(p,'utf8'));
assert.equal(data.format,'sao-public-guide-v1');assert(data.asset&&data.data);
const banned=new Set(['token','password','authorization','account','inventory','player','chat','log','done','current','completed','earned','__proto__','prototype','constructor']);
function check(x){if(!x||typeof x!=='object')return;for(const [key,value]of Object.entries(x)){assert(!banned.has(key.toLowerCase()),'Private field: '+key);check(value);}}
check(data);fs.writeFileSync(path.join(__dirname,'server-guide-data.js'),'window.SAOServerGuide = '+JSON.stringify(data)+';\n');
const mp=path.join(__dirname,'current-manifest.json'),manifest=JSON.parse(fs.readFileSync(mp,'utf8'));manifest.serverAsset=data.asset;manifest.counts.serverMonsterRecords=Object.keys(data.data.beasts).length;manifest.counts.serverMonsterHp=Object.values(data.data.beasts).filter(x=>Number.isFinite(x.hp)).length;manifest.counts.bossGuides=Object.keys(data.data.bosses).length;manifest.counts.floorDropPools=Object.keys(data.data.floorDrops).length;fs.writeFileSync(mp,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({bosses:Object.keys(data.data.bosses).length,beasts:Object.keys(data.data.beasts).length,floorDrops:Object.keys(data.data.floorDrops).length}));
