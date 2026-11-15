(function(root){
'use strict';
function apply(G,payload){
 const D=G.catalog,s=payload.data,items=new Map(D.items.map(x=>[x.id,x])),mobs=new Map(D.monsters.map(x=>[x.id,x])),areas=new Map(D.areas.map(x=>[x.id,x]));
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
 D.serverGuide=s;D.serverGuideAsset=payload.asset;
 if(G.applyParameters)G.applyParameters(s.params||{});
 const report={names,storyFields:stories,beasts,bosses:Object.keys(s.bosses).length,floorDrops:Object.keys(s.floorDrops).length};
 D.serverGuideCoverage=report;return report;
}
if(typeof module==='object')module.exports={apply};
if(root?.SAOCurrent&&root.SAOServerGuide)apply(root.SAOCurrent,root.SAOServerGuide);
})(typeof window==='object'?window:null);
