(function(root){
'use strict';
function apply(G,payload){
 const D=G.catalog,s=payload.data;
 const retired=new Set(['enh-weapon','enh-armor','enh-accessory',...(s.retiredItemIds||[])]);
 D.items=D.items.filter(x=>!retired.has(x.id));G.retiredItemIds=retired;
 // New public equipment definitions stay outside the retained game registry.
 // For calculations, use an existing item of the same equipment type with
 // the public item's explicit final bonus, through the site's custom-stat API.
 if(!G.publicEquipment&&G.registerGuideItems)G.publicEquipment=new Map();
 if(!G.publicEquipment){
  const definitions=new Map(),originalCalculate=G.calculate,originalCreate=G.createPlayer;
  const registered=D.items.slice();
  function compatible(config={}){
   let result=config;
   for(const [slot,entry]of Object.entries(config.slots||{})){
    const item=definitions.get(entry?.id);if(!item)continue;
    const base=registered.find(x=>x.kind==='equipment'&&x.slot===item.slot&&x.armorType===item.armorType&&x.gloveType===item.gloveType&&x.weaponType===item.weaponType&&!!x.shield===!!item.shield);
    if(!base)continue;
    if(result===config)result={...config,slots:{...config.slots}};
    result.slots[slot]={...entry,id:base.id,bonus:entry.bonus||G.gear(item,entry).bonus};
   }
   return result;
  }
  G.calculate=config=>originalCalculate(compatible(config));G.createPlayer=config=>originalCreate(compatible(config));
  G.publicEquipment=definitions;
 }
 // Generated chapters may reuse reward objects across different steps.
 // Make each occurrence independent before applying per-chapter amounts.
 if(s.catalogueChanges?.patches?.some(x=>x.collection==='chapters'))D.chapters=JSON.parse(JSON.stringify(D.chapters));
 for(const change of s.catalogueChanges?.patches||[]){
  if(!['items','areas','chapters','sideQuests','skills','talents','buffs'].includes(change.collection))continue;
  const target=D[change.collection].find(x=>x.id===change.id);if(!target)continue;
  for(const op of change.ops||[]){
   const keys=op?.[0];if(!Array.isArray(keys)||!keys.length||keys.some(k=>['__proto__','prototype','constructor'].includes(k)))continue;
   let ref=target;for(const key of keys.slice(0,-1)){if(!ref||typeof ref!=='object'){ref=null;break;}ref=ref[key];}
   if(!ref||typeof ref!=='object')continue;
   const key=keys.at(-1);if(op.length>1)ref[key]=JSON.parse(JSON.stringify(op[1]));else delete ref[key];
  }
 }
 const activeItems=[...s.catalogueChanges?.items||[],...s.items||[]].filter(x=>!retired.has(x.id));
 G.registerGuideItems?.(activeItems);
 for(const row of activeItems){
  if(typeof row.id!=='string'||typeof row.kind!=='string'||row.kind==='equipment'&&!G.slotKeys.includes(row.slot))continue;
  const existing=D.items.find(x=>x.id===row.id);
  if(existing)Object.assign(existing,row);else{D.items.push(row);if(row.kind==='equipment')G.publicEquipment.set(row.id,row);}
 }
 const items=new Map(D.items.map(x=>[x.id,x])),mobs=new Map(D.monsters.map(x=>[x.id,x])),areas=new Map(D.areas.map(x=>[x.id,x]));
 const valid=x=>x&&typeof x==='object'&&typeof x.zh==='string',blocked=new Set(['__proto__','prototype','constructor']);
 let names=0,stories=0,beasts=0;
 function setText(target,path,value){if(!valid(value))return false;const keys=path.split('.');if(keys.some(k=>blocked.has(k)))return false;let ref=target;for(const key of keys.slice(0,-1)){if(!ref||typeof ref!=='object'||!Object.hasOwn(ref,key))return false;ref=ref[key];}const key=keys.at(-1);if(!ref||!Object.hasOwn(ref,key)||!valid(ref[key]))return false;Object.assign(ref[key],value);return true;}
 if(G.applyGuideTranslations)G.applyGuideTranslations(s.hi);
 D.serverTitles={};
 for(const [ref,fields]of Object.entries(s.hi.e||{})){const colon=ref.indexOf(':'),type=ref.slice(0,colon),id=ref.slice(colon+1);if(type==='t'){D.serverTitles[id]={name:s.hi.t[fields.n],desc:s.hi.t[fields.d]};continue;}const target=({i:items,m:mobs,a:areas})[type]?.get(id);if(!target)continue;for(const [path,hash]of Object.entries(fields))if(setText(target,path,s.hi.t[hash]))names++;}
 for(const [id,fields]of Object.entries(s.storyTexts||{})){
  if(id==='#series'){D.seriesNames=fields;continue;}
  const target=id.startsWith('q:')?D.sideQuests.find(x=>x.id===id.slice(2)):D.chapters.find(x=>x.id===id)||Object.values(D.uniqueQuests||{}).find(x=>x.id===id);
  if(target)for(const [path,value]of Object.entries(fields))if(setText(target,path,value))stories++;
 }
 for(const [id,row]of Object.entries(s.beasts||{})){const m=mobs.get(id);if(!m)continue;let changed=false;
  if(Number.isFinite(row.hp)){m.stats={...(m.stats||{}),maxHp:row.hp};changed=true;}
  for(const key of ['exp','col'])if(Number.isFinite(row[key])){m[key]=row[key];changed=true;}
  for(const key of ['hit','pace'])if(typeof row[key]==='string')m[key]=row[key];
  if(changed){m.dataStatus='partial';beasts++;}
 }
 for(const row of s.fwb||[]){
  if(typeof row.m!=='string'||typeof row.area?.id!=='string')continue;
  let m=mobs.get(row.m);
  if(!m){m={id:row.m,name:row.name,level:null,levelUnknown:true,bossView:true,worldBoss:true,stats:null,exp:null,col:null,drops:null,dataStatus:'partial'};D.monsters.push(m);mobs.set(m.id,m);}
  m.worldBoss=true;m.name=row.name;
  const area={...row.area,event:'wb',worldBossId:row.m,links:[row.from]};
  const existing=areas.get(area.id);if(existing)Object.assign(existing,area);else{D.areas.push(area);areas.set(area.id,area);}
  const from=areas.get(row.from);if(from){from.links??=[];if(!from.links.includes(area.id))from.links.push(area.id);}
 }
 const jack=areas.get('f1-wb');if(jack)jack.worldBossId='wb-jack';
 G.regionCapacity=(area,{autoHunt=true,hunters=1}={})=>{
  if(!area?.spawns?.length)return null;
  const floor=area.spawnFloor??area.floor,kind=area.id.replace(/^f\d+-/,''),rate=s.mechanics?.partyEnemyRate??.5;
  let count=floor<5?3:Math.min(10,Math.max(3,4+Math.floor((floor-10)/10)));
  if(floor>=5)count+=['field','outskirts','path'].includes(kind)?-1:['depths','wilds','secret'].includes(kind)?1:0;
  if(area.maxEnemies)count=Math.min(count,area.maxEnemies);if(!autoHunt)count=Math.ceil(count/2);
  return Math.round(Math.max(1,count)*(1+rate*(Math.max(1,hunters)-1)));
 };
 // Additional world bosses must exist before attaching observed HP to them.
 for(const [id,values]of Object.entries(s.observedHp||{})){
  const m=mobs.get(id);if(m&&Array.isArray(values))m.observedMaxHp=values.filter(x=>Number.isFinite(x)&&x>0);
 }
 D.legacyMonsters=Object.create(null);
 const legacy=s.legacyFallback;
 const stable=x=>x&&typeof x==='object'?Array.isArray(x)?x.map(stable):Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
 const itemCheck=item=>JSON.stringify(stable(Object.fromEntries(['id','kind','slot','reqLevel','weaponType','armorType','gloveType','shield','speed','bonus','heal','healDurationMs','set','cosmeticOnly','rare','named','bound','nameZh'].map(k=>[k,k==='nameZh'?(typeof item.name?.zh==='string'&&!['...','…','???'].includes(item.name.zh)?item.name.zh:null):['rare','named','bound'].includes(k)?!!item[k]:item[k]??null]))));
 const compatibleLegacyItems=new Set(Object.entries(legacy?.itemChecks||{}).filter(([id,signature])=>items.has(id)&&itemCheck(items.get(id))===signature).map(([id])=>id));
 for(const m of D.monsters)delete m.legacyReference;
 for(const [id,row]of Object.entries(legacy?.monsters||{})){
  const m=mobs.get(id);if(!m||m.levelUnknown||m.worldBoss||m.level!==row.level||valid(m.name)&&m.name.zh!=='...'&&m.name.zh!==row.name?.zh)continue;
  const conflict=Object.entries(m.stats||{}).some(([k,v])=>Number.isFinite(v)&&(!Number.isFinite(row.stats?.[k])||Math.abs(v-row.stats[k])>1e-9))
   ||m.observedMaxHp?.some(v=>!Number.isFinite(row.stats?.maxHp)||Math.abs(v-row.stats.maxHp)>1e-9)
   ||['exp','col'].some(k=>Number.isFinite(m[k])&&m[k]!==row[k]);
  if(conflict)continue;
  const drops=(row.drops||[]).filter(drop=>compatibleLegacyItems.has(drop.itemId)&&Number.isFinite(drop.chance)&&drop.chance>0&&drop.chance<=1);
  m.legacyReference={...row,drops};D.legacyMonsters[id]=m.legacyReference;
 }
 G.applyGuideLore?.({hi:s.hi,skills:s.skills,skillNames:s.skillNames,says:s.says,beasts:s.beasts,bosses:Array.isArray(s.bosses)?s.bosses:Object.values(s.bosses||{}),floorDrops:s.floorDrops,unique:s.unique,hints:s.hints,space:s.space,granny:s.granny,fwb:s.fwb});
 if(s.storyTexts)G.applyGuideStoryTexts?.({texts:s.storyTexts,full:[]});
 D.serverGuide=s;D.serverGuideAsset=payload.asset;G.applyPublicGuide=data=>apply(G,{asset:D.serverGuideAsset,data});
 if(G.applyParameters)G.applyParameters(s.params||{});
 const report={names,storyFields:stories,beasts,bosses:Object.keys(s.bosses).length,floorDrops:Object.keys(s.floorDrops).length,observedHp:Object.keys(s.observedHp||{}).length,dropSources:(s.observedDrops||[]).length,monsterSkills:Object.keys(s.observedSkills||{}).length,worldBosses:(s.fwb||[]).length,items:(s.items||[]).length,legacyMonsters:Object.keys(D.legacyMonsters).length,legacyDropEntries:Object.values(D.legacyMonsters).reduce((n,m)=>n+m.drops.length,0)};
 D.serverGuideCoverage=report;return report;
}
if(typeof module==='object')module.exports={apply};
if(root?.SAOCurrent&&root.SAOServerGuide)apply(root.SAOCurrent,root.SAOServerGuide);
})(typeof window==='object'?window:null);
