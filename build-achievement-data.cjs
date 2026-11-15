const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname,d=JSON.parse(fs.readFileSync(path.join(root,'achievement-catalog.json'),'utf8'));
assert.equal(d.total,d.entries.length);assert.equal(new Set(d.entries.map(x=>x.id)).size,d.total);
for(const [cat,count]of Object.entries(d.counts))assert.equal(d.entries.filter(x=>x.cat===cat).length,count);
assert.equal(d.hidden,d.entries.filter(x=>x.hidden).length);
for(const x of d.entries){for(const k of ['done','current','player','token','password','account','hp','col','inventory'])assert(!Object.hasOwn(x,k),'Private field in catalogue: '+k);assert(typeof x.name==='string'&&typeof x.desc==='string');}
fs.writeFileSync(path.join(root,'achievement-data.js'),'window.SAO_ACHIEVEMENTS = '+JSON.stringify(d)+';\n');
const manifestPath=path.join(root,'current-manifest.json'),m=JSON.parse(fs.readFileSync(manifestPath,'utf8'));m.counts.achievements=d.total;m.counts.hiddenAchievements=d.hidden;m.serverValues=m.serverValues.filter(x=>x!=='achievement catalogue, tiers and bonuses');if(!m.serverValues.includes('raw achievement bonus precision and hidden conditions'))m.serverValues.push('raw achievement bonus precision and hidden conditions');fs.writeFileSync(manifestPath,JSON.stringify(m,null,2)+'\n');
console.log(`Built ${d.total} achievement records (${d.hidden} hidden).`);
