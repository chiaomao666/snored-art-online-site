const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const G=require('./current-runtime.js'),D=G.catalog;
assert.equal(D.items.length,10341);assert.equal(D.items.filter(x=>x.kind==='equipment').length,3041);
assert.equal(D.monsters.length,990);assert.equal(D.floors.length,75);assert.equal(D.areas.length,593);
assert(D.monsters.every(m=>m.dataStatus==='pending'&&m.exp===null&&m.drops===null));
assert.equal(D.skills.length,48);assert.equal(D.buffs.length,24);assert.equal(D.skillPaths.length,96);assert.equal(D.talents.length,32);assert.equal(D.talentNodes.length,408);
assert.equal(D.achievementTitles.length,45);assert.equal(new Set(D.achievementTitles.map(x=>x.titleId)).size,45);assert.equal(D.achievementTitles.filter(x=>x.name.zh!=='...'&&x.desc.zh!=='...').length,37);
const achievementCatalog=JSON.parse(fs.readFileSync(path.join(__dirname,'achievement-catalog.json'),'utf8'));assert.equal(achievementCatalog.total,479);assert.equal(achievementCatalog.hidden,9);assert.deepEqual(achievementCatalog.counts,{collect:146,hunt:228,boss:81,fun:24});assert.equal(new Set(achievementCatalog.entries.map(x=>x.id)).size,479);assert(achievementCatalog.entries.filter(x=>!x.hidden).every(x=>x.name&&x.desc&&x.rewardText));for(const x of achievementCatalog.entries)for(const k of ['done','current','player','token','password','account'])assert(!Object.hasOwn(x,k));
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
for(const f of ['current-runtime.js','current-site.js','build-engine.js','classic-templates.js','classic-layout.js','public-guide-additions.js','achievement-data.js'])new vm.Script(fs.readFileSync(path.join(__dirname,f),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'current-manifest.json')));assert.equal(manifest.counts.talentNodes,D.talentNodes.length);

const server=require('./server-guide-data.json');assert.equal(server.format,'sao-public-guide-v1');assert.equal(achievementCatalog.precision,'server-json');assert.equal(achievementCatalog.entries.find(x=>x.id==='set-t1').value,.00051);assert.equal(achievementCatalog.entries.find(x=>x.id==='armory-t1').parts.length,7);
const coverage=require('./server-guide-overlay.js').apply(G,server);assert.equal(coverage.beasts,87);assert.equal(coverage.bosses,11);assert.equal(coverage.floorDrops,15);assert.equal(D.monsters.find(x=>x.id==='f4-c').stats.maxHp,70);assert.equal(D.monsters.find(x=>x.id==='f4-c').stats.atk,undefined);assert.equal(D.monsters.find(x=>x.id==='f1-boar').exp,null);assert.equal(D.items.find(x=>x.id==='story-plank').name.zh,'咬爛的船板');assert.equal(G.getParameters().talentRefundCol,20);assert.equal(D.serverTitles.elfFriend.name.zh,'驚靈之友');
for(const f of ['server-guide-data.js','server-guide-overlay.js'])new vm.Script(fs.readFileSync(path.join(__dirname,f),'utf8'));
assert.equal(D.items.length,10386);assert.equal(D.items.filter(x=>x.kind==='equipment').length,3089);assert.equal(D.monsters.length,997);assert.equal(D.areas.length,600);
assert.equal(coverage.observedHp,203);assert.equal(coverage.dropSources,6348);assert.equal(coverage.monsterSkills,415);
assert.equal(coverage.legacyMonsters,301);assert.equal(coverage.legacyDropEntries,6350);assert.equal(D.monsters.find(x=>x.id==='f1-boar').legacyReference,undefined);assert.deepEqual(D.monsters.find(x=>x.id==='f1-boar').observedMaxHp,server.data.observedHp['f1-boar']);assert.equal(D.monsters.find(x=>x.id==='f4-c').legacyReference,undefined);assert.equal(D.monsters.find(x=>x.id==='f8-a').legacyReference,undefined);assert.equal(D.monsters.find(x=>x.id==='wb-jack').legacyReference,undefined);
assert.equal(new Set(server.data.observedDrops.map(x=>x.itemId+'|'+x.monsterId)).size,6348);
// A drop ID alone is evidence of a source, not an equipment definition.
assert.deepEqual(server.data.unresolvedItemIds,['named-ichigo','named-ricesickle']);
for(const row of server.data.observedDrops){assert(D.items.some(x=>x.id===row.itemId)||server.data.unresolvedItemIds.includes(row.itemId),row.itemId);assert(D.monsters.some(x=>x.id===row.monsterId),row.monsterId);assert.deepEqual(Object.keys(row).sort(),['itemId','monsterId']);}
for(const [id,skills]of Object.entries(server.data.observedSkills)){assert(D.monsters.some(x=>x.id===id));for(const skill of skills)assert(server.data.skills[skill]||server.data.unresolvedSkillIds.includes(skill),skill);}
assert.deepEqual(D.monsters.find(x=>x.id==='f8-a').observedMaxHp,[178]);assert.equal(D.monsters.find(x=>x.id==='f8-a').stats,null);assert.equal(D.monsters.find(x=>x.id==='f8-a').exp,server.data.beasts['f8-a'].exp);assert.equal(D.monsters.find(x=>x.id==='f9-r').exp,null);
assert.equal(D.monsters.find(x=>x.id==='fwb-f10').worldBoss,true);assert.equal(D.areas.find(x=>x.id==='f10-wb').worldBossId,'fwb-f10');assert(D.areas.find(x=>x.id==='f10-wilds').links.includes('f10-wb'));
const aiBase=G.calculate({level:20}),aiGear=G.calculate({level:20,slots:{armor:{id:'ai-gpt'}}});assert.equal(aiGear.stats.def-aiBase.stats.def,11);assert.equal(aiGear.stats.maxHp-aiBase.stats.maxHp,59);
const aiHands=G.calculate({level:20,slots:{hands:{id:'ai-cursor'}}}),aiRing=G.calculate({level:20,slots:{accessory:{id:'ai-midjourney'}}});assert.equal(aiHands.stats.agi-aiBase.stats.agi,2);assert.equal(aiRing.stats.agi-aiBase.stats.agi,2);assert(Math.abs(aiRing.stats.crit-aiBase.stats.crit-.025)<1e-10);
const again=require('./server-guide-overlay.js').apply(G,server);assert.equal(again.dropSources,6348);assert.equal(D.items.length,10386);assert.equal(D.monsters.length,997);assert.equal(D.areas.length,600);
assert.equal(server.asset,'main-DiT5cq2I.js');
assert.equal(achievementCatalog.entries.find(x=>x.id==='bossgear-f1').parts[0].bases.length,4);
assert.equal(D.monsters.find(x=>x.id==='f10-a').exp,85);
assert.equal(D.items.find(x=>x.id==='named-potlid').fxRange.heal,'1.5%～2.5%');
assert.equal(server.data.catalogueChanges.items.length,0);
assert.equal(D.items.find(x=>x.id==='spice-atk').price,300);
assert(D.chapters.find(x=>x.id==='samurai').reward.choose.includes('samurai-scythe'));
assert.equal(G.regionCapacity(D.areas.find(x=>x.id==='f10-secret')),5);
assert(!Object.hasOwn(D.areas.find(x=>x.id==='f10-secret'),'maxEnemies'));
for(const ch of D.chapters.filter(x=>x.floor>=31&&x.id!=='truth'))assert([...ch.steps.map(x=>x.reward),ch.reward].reduce((n,r)=>n+(r?.items||[]).filter(x=>x.itemId==='enh-gem').reduce((n,x)=>n+x.qty,0),0)<=25);
console.log(JSON.stringify({status:'passed',catalogue:'75 floors / 3041 base equipment / 990 base monsters',experienceLevels:120,skills:48,branches:96,talentNodes:408,calculations:'base, dual hand, actual gear stats, buffs, attack speed, talent connectivity'}));

assert.deepEqual(server.data.mechanics.softCaps,{dmgTaken:[.5,.8],ailRes:[.75,.95],cdr:[.6,.9],armorPen:[.9,1],evade:[.28,.6]});
for(const id of ['named-fleuret','coat-of-midnight','named-lion','ai-llama'])assert(D.items.some(x=>x.id===id&&x.kind==='equipment'));
assert.equal(D.monsters.find(x=>x.id==='f10-c').exp,218);
assert.equal(D.monsters.find(x=>x.id==='f10-d').stats.maxHp,701);

assert(D.monsters.find(x=>x.id==='fwb-f15').worldBoss);assert.equal(D.areas.find(x=>x.id==='f15-wb').worldBossId,'fwb-f15');assert(D.areas.find(x=>x.id==='f15-wilds').links.includes('f15-wb'));
assert.equal(D.monsters.find(x=>x.id==='f15-e').stats.maxHp,478);assert.equal(D.monsters.find(x=>x.id==='f15-d').exp,635);
assert.equal(server.data.skills['fwb15-quake'].name.zh,'翻身地震');assert.equal(D.items.find(x=>x.id==='named-parasol').fxRange.block,'8%～15%');

assert.equal(D.monsters.find(x=>x.id==='fwb-f20').name.zh,'熔岩不倒嗡');assert.equal(D.areas.find(x=>x.id==='f20-wb').worldBossId,'fwb-f20');assert(D.areas.find(x=>x.id==='f20-depths').links.includes('f20-wb'));assert.equal(server.data.skills['b-share-f19'].name.zh,'長毛壓頂');

assert(server.data.observedDrops.some(x=>x.monsterId==='f17-c'&&x.itemId==='mg-f17-dagger'));assert.equal(D.monsters.find(x=>x.id==='f17-c').exp,662);
assert.deepEqual(D.monsters.find(x=>x.id==='f20-c').observedMaxHp,[2534]);assert.equal(D.monsters.find(x=>x.id==='f20-c').stats.maxHp,2534);assert.equal(D.monsters.find(x=>x.id==='f20-c').legacyReference,undefined);
for(const [monsterId,itemId]of [['f14-boss','set-blackfur-ear'],['f15-s','ore-2'],['f15-t','set-secret2-head'],['f15-boss','boss-f15-b'],['f20-c','weapon-t20'],['f20-d','mace-t25']])assert(server.data.observedDrops.some(x=>x.monsterId===monsterId&&x.itemId===itemId));

assert.equal(D.items.find(x=>x.id==='side-egg').price,30);assert(D.items.some(x=>x.id==='spice-boss'));assert(D.items.some(x=>x.id==='meal-bread-1'));for(const id of ['gash','flurry','holy-square','star-splash','nova-ascension'])assert.equal(D.skills.find(x=>x.id===id).chase,true);

for(const [monsterId,itemId]of [["f1-boar","mg-f1-rapier"],["f1-kobold-trooper","ai-gpt"],["f1-kobold-sentinel","craft-add"],["f4-r","crystal-teleport"],["f7-r","sharp-gloves-hp-t5"]])assert(server.data.observedDrops.some(x=>x.monsterId===monsterId&&x.itemId===itemId));

for(const [base,label]of [["ai-gpt","吉皮提鎧甲"],["named-parasol","阿嬤的花傘"]])assert.equal(G.nativeGear({gear:{fixture:{base,plus:0}}},"g:fixture").name.zh,label);
for(const [base,label]of [['named-cane','阿嬤的枴杖'],['named-higan','彼岸'],['named-pajamas','阿嬤的睡衣']])assert.equal(G.nativeGear({gear:{fixture:{base,plus:0}}},'g:fixture').name.zh,label);
assert.deepEqual(server.data.unresolvedSkillIds,[]);
assert.equal(D.monsters.find(x=>x.id==='fwb-f25').name.zh,'世界輸之根');assert.equal(D.areas.find(x=>x.id==='f25-wb').worldBossId,'fwb-f25');assert(D.areas.find(x=>x.id==='f25-depths').links.includes('f25-wb'));
assert.deepEqual(D.monsters.find(x=>x.id==='f25-c').observedMaxHp,[3001]);assert.equal(D.monsters.find(x=>x.id==='f25-c').legacyReference,undefined);

for(const [base,label]of [['named-concern','阿嬤的關心'],['named-headless','無首之盔'],['named-bicycle','阿嬤的腳踏車'],['named-fruitknife','阿嬤的水果刀'],['named-goldaxe','湖中女神的金斧'],['named-grandmahands','阿嬤的手'],['named-zakum','炎魔石盔']])assert.equal(G.nativeGear({gear:{fixture:{base,plus:0}}},'g:fixture').name.zh,label);
assert.equal(server.data.recipes.length,5);for(const recipe of [{in:{'craft-add':1,'craft-remove':1},out:[{id:'craft-change',n:1}]},{in:{'craft-change':4,'craft-reroll':30,'craft-tier':10},out:[{id:'omen-keep',n:1}]},{in:{'craft-remove':5,'craft-tier':10,'craft-value':20},out:[{id:'omen-weakest',n:1}]},{in:{'craft-remove':3,'forge-temper':1},out:[{id:'craft-fracture',n:1}]}])assert(server.data.recipes.some(row=>JSON.stringify(row)===JSON.stringify(recipe)));
assert(server.data.floorDrops['24'].items.includes('side-garlic'));assert(server.data.floorDrops['25'].items.includes('forge-temper'));

const materialApi=require('./material-catalogue.js'),materialIndex=materialApi.buildIndex(D),materialRows=new Map(materialIndex.rows.map(x=>[x.id,x]));
assert.equal(materialIndex.rows.length,1066);assert.equal(materialRows.get('craft-add').category,'stone');assert.equal(materialRows.get('essence-str').category,'essence');assert.equal(materialRows.get('ore-1').category,'ore');assert.equal(materialRows.get('side-egg').category,'food');
assert(!materialRows.has('meal-bread-1'));assert(!materialRows.has('pot-atk-1-1'));assert(!materialRows.has('named-cane'));
assert(materialRows.get('craft-change').sources.some(x=>x.kind==='recipe'&&x.label.includes('添石 ×1')&&x.label.includes('走石 ×1')));assert(materialRows.get('craft-add').usage.some(x=>x.kind==='recipe'));
assert(materialRows.get('mat-f25-c').sources.some(x=>x.key==='material:f25-c'&&x.href==='#monsters?id=f25-c'&&x.floor===25));assert.equal(materialRows.get('mat-f75-a').known,false);assert.equal(materialRows.get('mat-f75-a').name,'mat-f75-a');
assert(materialRows.get('craft-add').sources.some(x=>x.key==='observed:f25-c'));const collectionGoal=D.chapters.flatMap(x=>(x.steps||[]).filter(s=>s.goal?.kind==='collect'&&s.goal.from).map(s=>s.goal))[0];assert(materialRows.get(collectionGoal.itemId).sources.some(x=>x.id===collectionGoal.from&&x.key.startsWith('quest-target:')));
new vm.Script(fs.readFileSync(path.join(__dirname,'material-catalogue.js'),'utf8'));
console.log('Passed material catalogue: 1,066 materials and quest items, distinct categories, actual sources/confirmed recipes, quest targets, explicit unknown names and prepared-food exclusion.');

for(const id of ['enh-weapon','enh-armor','enh-accessory']){assert(!D.items.some(x=>x.id===id));assert(!materialRows.has(id));assert(!Object.hasOwn(server.data.legacyFallback.itemChecks,id));assert(Object.values(server.data.legacyFallback.monsters).every(m=>m.drops.every(d=>d.itemId!==id)));}
for(const id of ['enh-gem','enh-dark','crystal-heal','crystal-teleport'])assert(D.items.some(x=>x.id===id));

assert.equal(D.monsters.find(x=>x.id==='f19-d').exp,2336);assert.equal(D.monsters.find(x=>x.id==='f19-d').col,72);assert.equal(D.items.find(x=>x.id==='named-souvenir').name.zh,'伴手禮木劍');
assert.equal(achievementCatalog.entries.find(x=>x.id==='fun-five21').desc,'五張以上的牌湊到剛好 21 點。');assert.equal(achievementCatalog.entries.find(x=>x.id==='fun-broke').hidden,false);
const miasmaExp=server.data.mechanics.miasmaExperience;
assert.equal(miasmaExp.perStack,.05);assert.equal(miasmaExp.stacking,'additive');assert.deepEqual(miasmaExp.verifiedStacks,[0,1,2]);assert.equal(miasmaExp.extrapolateHigher,true);assert.equal(miasmaExp.cap,3);assert.equal(miasmaExp.colMultiplier,1);
for(const row of miasmaExp.examples)for(let stack=0;stack<=2;stack++)assert.equal(row.expByStack[stack],Math.round(row.expByStack[0]*(1+.05*stack)));
assert(server.data.mechanics.rules.find(x=>x.id==='miasma-experience').lines.some(x=>x.includes('傳染不增加經驗')));

assert.equal(D.monsters.find(x=>x.id==='fwb-f30').name.zh,'龍姆');assert.equal(D.areas.find(x=>x.id==='f30-wb').worldBossId,'fwb-f30');assert(D.areas.find(x=>x.id==='f30-depths').links.includes('f30-wb'));
assert.equal(achievementCatalog.entries.find(x=>x.id==='series-ai').value,.05);assert.equal(achievementCatalog.entries.find(x=>x.id==='series-granny').value,.03);assert.equal(achievementCatalog.entries.find(x=>x.id==='series-ai').target,14);assert.equal(achievementCatalog.entries.find(x=>x.id==='series-granny').target,12);

for(const [id,name,target]of [["fun-death10","生命之悲的熟面孔",10],["fun-death50","茅廁晶彥的熟客",50],["fun-chars20","轉生專業戶",20],["fun-nemesis","冤家路窄",3]]){const row=achievementCatalog.entries.find(x=>x.id===id);assert.equal(row.name,name);assert.equal(row.titleName,name);assert.equal(row.target,target);assert.equal(row.hidden,false);assert.equal(row.stat,null);assert.equal(row.value,null);}
assert.equal(achievementCatalog.entries.find(x=>x.id==='fun-death200').hidden,true);

assert.equal(D.monsters.find(x=>x.id==='f30-s').exp,24870);assert.equal(D.monsters.find(x=>x.id==='f30-t').col,132);assert.equal(D.items.find(x=>x.id==='named-shadowstitch').fxRange.mul,'1.1～1.2');assert(materialRows.get('omen-keep').sources.some(x=>x.kind==='recipe'&&x.label.includes('×30')));

const sweep=achievementCatalog.entries.find(x=>x.id==='fun-sweep');assert.equal(sweep.name,'通殺');assert.equal(sweep.desc,'當莊家時，三個人以上的一局全部都贏。');assert.equal(sweep.hidden,false);assert.equal(sweep.titleName,'通殺');assert.equal(sweep.rewardText,'稱號「通殺」');assert.equal(sweep.stat,null);assert.equal(sweep.value,null);

assert.equal(D.monsters.find(x=>x.id==='fwb-f35').name.zh,'雪怪叔叔');assert.equal(D.areas.find(x=>x.id==='f35-wb').worldBossId,'fwb-f35');assert(D.areas.find(x=>x.id==='f35-outskirts').links.includes('f35-wb'));for(const [id,name]of [['named-thunder','擂神之錘'],['named-crescent','收割者的月芽'],['named-heart','氓國將的心臟']])assert.equal(D.items.find(x=>x.id===id).name.zh,name);assert(materialRows.get('craft-fracture').sources.some(x=>x.kind==='recipe'&&x.label.includes('走石 ×3')));

// Public catalogue supplement captured 2026-11-21; personal snapshots stay local.
assert.equal(G.getParameters().maxOnline,1500);assert.equal(server.data.catalogue.storyTexts.s31.title.zh,'第三十八章　霧中的信');assert.equal(server.data.catalogue.hints['granny-envelope'].zh,'皺巴巴的紅包，阿嬤說拿去買糖吃。存了這麼多，回起司之鎮給阿嬤看看。');assert(server.data.observedHp['f35-s'].includes(7411));

assert.equal(G.getParameters().skillXpRate,.33);assert.equal(G.getParameters().maxOnlineVip,2500);assert(server.data.observedHp['f35-t'].includes(3935));assert.equal(D.items.find(x=>x.id==='named-galeboots').name.zh,'急瘋之靴');assert.equal(D.items.find(x=>x.id==='named-musashi').bonus.def,102);assert(server.data.recipes.some(x=>JSON.stringify(x.in)===JSON.stringify({'craft-add':4,'ore-4':5})&&x.out.some(y=>y.id==='craft-add3'&&y.n===1)));assert(server.data.observedDrops.some(x=>x.itemId==='ai-perplexity'&&x.monsterId==='f35-t'));

// Full init and attached public guide frames collected 2026-11-23 (Taipei).
for(const [id,name]of [['ai-perplexity','普萊希提鐮刀'],['named-starshield','紅藍星盾'],['named-abus','阿不思的皮衣'],['named-thermos','經濟艙保溫瓶'],['named-unseen','無形之盾']])assert.equal(D.items.find(x=>x.id===id).name.zh,name);
assert.equal(D.items.find(x=>x.id==='ai-perplexity').bonus.atk,12);assert.equal(D.items.find(x=>x.id==='named-starshield').reqLevel,51);assert.equal(D.items.find(x=>x.id==='named-thermos').weaponType,'mace');

const baccaratRun=achievementCatalog.entries.find(x=>x.id==='fun-bc-run8');assert.equal(baccaratRun.name,'一路長紅');assert.equal(baccaratRun.desc,'比嘉樂連續贏了八局。');assert.equal(baccaratRun.target,8);assert.equal(baccaratRun.titleName,'一路長紅');assert.equal(baccaratRun.rewardText,'稱號「一路長紅」');assert.equal(baccaratRun.hidden,false);assert.equal(baccaratRun.stat,null);assert.equal(baccaratRun.value,null);

// New public data from the 2026-11-27 HAR and current client rules.
assert.equal(D.monsters.find(x=>x.id==='fwb-f45').name.zh,'菇菇山主');
assert.equal(D.areas.find(x=>x.id==='f45-wb').worldBossId,'fwb-f45');
assert.equal(server.data.unresolvedSkillIds.length,0);
assert.equal(G.getParameters().raidMaxPlayers,48);
assert.equal(G.getParameters().firstClearGate,1);
assert.equal(server.data.mechanics.miasmaExperience.cap,3);
assert.equal(server.data.mechanics.miasmaExperience.contagionAddsExperience,false);
for(const id of ['fun-bc-tie10','fun-bc-pairs','fun-bc-both'])assert.equal(achievementCatalog.entries.find(x=>x.id===id).hidden,false);
