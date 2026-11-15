(function(root){
'use strict';
function apply(G,payload){
 const D=G.catalog,s=payload.data;
 // New public equipment definitions stay outside the retained game registry.
 // For calculations, use an existing item of the same equipment type with
 // the public item's explicit final bonus, through the site's custom-stat API.
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
 for(const row of s.items||[]){
  if(row.kind!=='equipment'||typeof row.id!=='string'||!G.slotKeys.includes(row.slot))continue;
  const existing=D.items.find(x=>x.id===row.id);
  if(existing)Object.assign(existing,row);else{D.items.push(row);G.publicEquipment.set(row.id,row);}
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
  const target=id.startsWith('q:')?D.sideQuests.find(x=>x.id===id.slice(2)):D.chapters.find(x=>x.id===id);
  if(target)for(const [path,value]of Object.entries(fields))if(setText(target,path,value))stories++;
 }
 for(const [id,row]of Object.entries(s.beasts||{})){const m=mobs.get(id);if(!m)continue;let changed=false;
  if(Number.isFinite(row.hp)){m.stats={...(m.stats||{}),maxHp:row.hp};changed=true;}
  for(const key of ['exp','col'])if(Number.isFinite(row[key])){m[key]=row[key];changed=true;}
  for(const key of ['hit','pace'])if(typeof row[key]==='string')m[key]=row[key];
  if(changed){m.dataStatus='partial';beasts++;}
 }
 for(const [id,values]of Object.entries(s.observedHp||{})){
  const m=mobs.get(id);if(m&&Array.isArray(values))m.observedMaxHp=values.filter(x=>Number.isFinite(x)&&x>0);
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
 D.serverGuide=s;D.serverGuideAsset=payload.asset;
 if(G.applyParameters)G.applyParameters(s.params||{});
 const report={names,storyFields:stories,beasts,bosses:Object.keys(s.bosses).length,floorDrops:Object.keys(s.floorDrops).length,observedHp:Object.keys(s.observedHp||{}).length,dropSources:(s.observedDrops||[]).length,monsterSkills:Object.keys(s.observedSkills||{}).length,worldBosses:(s.fwb||[]).length,items:(s.items||[]).length};
 D.serverGuideCoverage=report;return report;
}
if(typeof module==='object')module.exports={apply};
if(root?.SAOCurrent&&root.SAOServerGuide)apply(root.SAOCurrent,root.SAOServerGuide);
})(typeof window==='object'?window:null);
