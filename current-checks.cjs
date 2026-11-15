const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const G=require('./current-runtime.js'),D=G.catalog;
assert.equal(D.items.length,4728);assert.equal(D.items.filter(x=>x.kind==='equipment').length,3007);
assert.equal(D.monsters.length,990);assert.equal(D.floors.length,75);assert.equal(D.areas.length,593);
assert(D.monsters.every(m=>m.dataStatus==='pending'&&m.exp===null&&m.drops===null));
assert.equal(D.skills.length,48);assert.equal(D.buffs.length,24);assert.equal(D.skillPaths.length,96);assert.equal(D.talents.length,32);assert.equal(D.talentNodes.length,408);
assert.equal(D.achievementTitles.length,35);assert.equal(new Set(D.achievementTitles.map(x=>x.titleId)).size,35);assert.equal(D.achievementTitles.filter(x=>x.name.zh!=='...'&&x.desc.zh!=='...').length,31);
const achievementCatalog=JSON.parse(fs.readFileSync(path.join(__dirname,'achievement-catalog.json'),'utf8'));assert.equal(achievementCatalog.total,469);assert.equal(achievementCatalog.hidden,17);assert.deepEqual(achievementCatalog.counts,{collect:144,hunt:228,boss:77,fun:20});assert.equal(new Set(achievementCatalog.entries.map(x=>x.id)).size,469);assert(achievementCatalog.entries.filter(x=>!x.hidden).every(x=>x.name&&x.desc&&x.rewardText));for(const x of achievementCatalog.entries)for(const k of ['done','current','player','token','password','account'])assert(!Object.hasOwn(x,k));
for(const key of ['items','monsters','areas','skills','buffs','talents'])assert.equal(new Set(D[key].map(x=>x.id)).size,D[key].length,key+' IDs');
for(const style of D.styles){assert.equal(D.skills.filter(x=>x.style===style.style).length,6);assert.equal(D.buffs.filter(x=>x.style===style.style).length,3);}
for(const s of D.skills){assert.equal(D.skillPaths.filter(p=>p.skill===s.id).length,2);for(const lv of [1,5,10]){const x=G.skillStats(s,lv);assert(x.multiplier>0&&x.hits>0&&x.cooldownMs>0);}}
for(const f of D.floors){assert(D.monsters.some(x=>x.id===f.bossId));assert(D.areas.some(x=>x.id===f.townId));for(const id of f.areaIds)assert(D.areas.some(x=>x.id===id));}
for(const area of D.areas){for(const s of area.spawns||[])assert(D.monsters.some(x=>x.id===s.monsterId),s.monsterId);for(const s of area.shop||[])assert(D.items.some(x=>x.id===s.itemId),s.itemId);}
// Golden requirements and independent formula check across the full character level range.
assert.deepEqual([1,5,10,25,70,75].map(l=>G.experience(l)),[67,1579,3911,391587,19021582622,57635403074]);
function expected(l){const f=n=>.006*n**1.5*(1+(n/50)**2);return Math.max(10,Math.round((l<=5?f(l)*3:Math.max(f(l),f(5)*3))*370*Math.round(10*1.2**Math.max(0,l-1))*(1+.7*Math.min(1,Math.max(0,(l-10)/25)))));}
for(let l=1;l<=120;l++){assert.equal(G.experience(l),expected(l));assert(Number.isSafeInteger(G.totalExperience(l,0)));if(l<120)assert.equal(G.totalExperience(l+1,0)-G.totalExperience(l,0),G.experience(l));}
const base=G.calculate({level:70});assert.equal(base.stats.maxHp,9900);assert.equal(base.stats.atk,1042);assert.equal(base.interval,2000);assert.equal(base.attackSpeed,100);
for(const style of D.styles){const weapon=style.main+'-t1',p=G.calculate({level:70,style:style.style,slots:{weapon:{id:weapon},offhand:{id:'shield-t1'}},talents:{}});assert(Number.isFinite(p.stats.atk));}
const x=G.calculate({level:70,style:'sword',slots:{weapon:{id:'weapon-t40'},offhand:{id:'weapon-t40'}},dualWield:true});
assert.equal(x.stats.atk,x.stats.atkOff);assert.equal(x.stats.atk,base.stats.atk+278); // The new client separates hands; it does not add 60% of the offhand attack.
assert.equal(x.stats.critDmg,.8); // Non-attack equipment bonuses use the new client's full contribution.
const custom=G.calculate({level:70,slots:{weapon:{id:'weapon-t1',bonus:{atk:100,str:20}}}});assert.equal(custom.stats.atk,base.stats.atk+100+Math.round(base.base.atk*.002*20));
const buffed=G.calculate({level:70,buffs:['war-cry']});assert.equal(buffed.stats.atk,Math.round(base.stats.atk*1.12));
for(const agi of [-100,0,1,250,1000])for(const spd of [-.9,0,.1,1,4]){const speed=1+G.softSpeed(spd+.006*agi);assert(speed>0);assert.equal(G.interval({speed}),Math.max(100,Math.round(2000/speed)));}
const p=G.createPlayer({level:10,style:'sword',slots:{weapon:{id:'weapon-t1'}},talents:{}});assert.equal(G.validateTree(p,'sword',{'sk:vertical':1}),null);assert(G.validateTree(p,'sword',{'sk:knife-fan':1})===null);assert(G.validateTree(p,'sword',{'sword-7-resBlunt':1}));
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');for(const match of html.matchAll(/(?:src|href)="([^"#?:]+\.(?:js|css|svg))"/g))assert(fs.existsSync(path.join(__dirname,match[1])));
assert(!html.includes('src="data.js"'));assert(!html.includes('src="reward-guide.js"'));assert(!html.includes('src="site.js"'));
for(const f of ['current-runtime.js','current-site.js','build-engine.js','classic-templates.js','classic-layout.js','achievement-data.js'])new vm.Script(fs.readFileSync(path.join(__dirname,f),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'current-manifest.json')));assert.equal(manifest.counts.talentNodes,D.talentNodes.length);

const server=require('./server-guide-data.json');assert.equal(server.format,'sao-public-guide-v1');assert.equal(achievementCatalog.precision,'server-json');assert.equal(achievementCatalog.entries.find(x=>x.id==='set-t1').value,.00051);assert.equal(achievementCatalog.entries.find(x=>x.id==='armory-t1').parts.length,7);
const coverage=require('./server-guide-overlay.js').apply(G,server);assert.equal(coverage.beasts,20);assert.equal(coverage.bosses,9);assert.equal(coverage.floorDrops,2);assert.equal(D.monsters.find(x=>x.id==='f4-c').stats.maxHp,70);assert.equal(D.monsters.find(x=>x.id==='f4-c').stats.atk,undefined);assert.equal(D.monsters.find(x=>x.id==='f1-boar').exp,null);assert.equal(D.items.find(x=>x.id==='story-plank').name.zh,'咬爛的船板');assert.equal(G.getParameters().talentRefundCol,20);assert.equal(D.serverTitles.elfFriend.name.zh,'驚靈之友');
for(const f of ['server-guide-data.js','server-guide-overlay.js'])new vm.Script(fs.readFileSync(path.join(__dirname,f),'utf8'));
console.log(JSON.stringify({status:'passed',catalogue:'75 floors / 3007 equipment / 990 monsters',experienceLevels:120,skills:48,branches:96,talentNodes:408,calculations:'base, dual hand, actual gear stats, buffs, attack speed, talent connectivity'}));
