/* Public evidence extracted from init; never retain character identity or counts. */
(function(root){'use strict';
 const format='sao-init-guide-evidence-v1',storageKey='sao-guide:init-evidence:v1';
 const id=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(x)&&!Object.hasOwn(Object.prototype,x)&&x!=='prototype';
 const entries=x=>x&&typeof x==='object'&&!Array.isArray(x)?Object.entries(x):[];
 function normalize(value){
  const data=value?.data||{},drops=new Map(),skills=new Map(),hp=new Map();
  for(const row of Array.isArray(data.observedDrops)?data.observedDrops:[])if(id(row?.itemId)&&id(row?.monsterId))drops.set(row.monsterId+'|'+row.itemId,{itemId:row.itemId,monsterId:row.monsterId});
  for(const [monster,values]of entries(data.observedSkills))if(id(monster)&&Array.isArray(values)){const list=new Set(values.filter(id));if(list.size)skills.set(monster,[...list].sort())}
  for(const [monster,values]of entries(data.observedHp))if(id(monster)&&Array.isArray(values)){const list=new Set(values.filter(x=>Number.isSafeInteger(x)&&x>0));if(list.size)hp.set(monster,[...list].sort((a,b)=>a-b))}
  return {format,data:{observedDrops:[...drops.values()].sort((a,b)=>a.monsterId.localeCompare(b.monsterId)||a.itemId.localeCompare(b.itemId)),observedSkills:Object.fromEntries([...skills].sort(([a],[b])=>a.localeCompare(b))),observedHp:Object.fromEntries([...hp].sort(([a],[b])=>a.localeCompare(b)))}};
 }
 function combine(values){
  const data={observedDrops:[],observedSkills:{},observedHp:{}};
  for(const value of values){const x=normalize(value).data;data.observedDrops.push(...x.observedDrops);for(const key of ['observedSkills','observedHp'])for(const [monster,rows]of entries(x[key]))data[key][monster]=[...(data[key][monster]||[]),...rows]}
  return normalize({data});
 }
 function extract(player){
  const data={observedDrops:[],observedSkills:{},observedHp:{}};
  const drop=(itemId,monsterId)=>{if(id(itemId)&&id(monsterId))data.observedDrops.push({itemId,monsterId})};
  const move=(monster,skill)=>{if(id(monster)&&id(skill))(data.observedSkills[monster]??=[]).push(skill)};
  for(const [item,rows]of entries(player?.stats?.drops))for(const [monster,count]of entries(rows))if(Number.isSafeInteger(count)&&count>0)drop(item,monster);
  for(const [monster,list]of entries(player?.stats?.foeSkills))if(Array.isArray(list))for(const skill of list)move(monster,skill);
  const walk=value=>{if(!value||typeof value!=='object')return;if(id(value.monsterId)&&Number.isSafeInteger(value.maxHp)&&value.maxHp>0)(data.observedHp[value.monsterId]??=[]).push(value.maxHp);for(const child of Object.values(value))if(child&&typeof child==='object')walk(child)};
  walk(player?.enemies);
  for(const log of Array.isArray(player?.log)?player.log:[]){
   const monster=log?.p?.m?.m;
   if(['foeCharge','enemyAttack','foeSummon','foeBuff','wbCharge'].includes(log?.key))move(monster,typeof log.p.k==='string'?log.p.k:log.p.k?.k);
   if(log?.key==='bossReport'&&id(monster)&&typeof log.p.r==='string')try{const report=JSON.parse(log.p.r);for(const [,list]of entries(report?.loot))if(Array.isArray(list))for(const item of list)drop(item,monster)}catch{}
  }
  return normalize({data});
 }
 function difference(value,existing={}){
  const x=normalize(value).data,b=normalize({data:existing}).data,pairs=new Set(b.observedDrops.map(r=>r.monsterId+'|'+r.itemId));
  return normalize({data:{observedDrops:x.observedDrops.filter(r=>!pairs.has(r.monsterId+'|'+r.itemId)),observedSkills:Object.fromEntries(entries(x.observedSkills).map(([m,list])=>[m,list.filter(v=>!b.observedSkills[m]?.includes(v))])),observedHp:Object.fromEntries(entries(x.observedHp).map(([m,list])=>[m,list.filter(v=>!b.observedHp[m]?.includes(v))]))}});
 }
 function counts(value){const d=normalize(value).data;return{drops:d.observedDrops.length,skills:Object.values(d.observedSkills).reduce((n,a)=>n+a.length,0),hp:Object.values(d.observedHp).reduce((n,a)=>n+a.length,0)}}
 function merge(existing,value){const next=combine([{data:existing},value]).data;return{...existing,...next}}
 function apply(G,value){
  const D=G.catalog;D.serverGuide=merge(D.serverGuide||{},value);
  for(const m of D.monsters){const list=D.serverGuide.observedHp[m.id];if(!list?.length)continue;m.observedMaxHp=list.slice();if(m.legacyReference&&list.some(h=>h!==m.legacyReference.stats?.maxHp)){delete m.legacyReference;if(D.legacyMonsters)delete D.legacyMonsters[m.id]}}
  if(D.serverGuideCoverage){Object.assign(D.serverGuideCoverage,{dropSources:D.serverGuide.observedDrops.length,observedHp:Object.keys(D.serverGuide.observedHp).length,monsterSkills:Object.keys(D.serverGuide.observedSkills).length});if(D.legacyMonsters){D.serverGuideCoverage.legacyMonsters=Object.keys(D.legacyMonsters).length;D.serverGuideCoverage.legacyDropEntries=Object.values(D.legacyMonsters).reduce((n,m)=>n+(m.drops?.length||0),0)}}
  // Existing equipment views retain this Map by reference; add sources to it.
  const sources=root?.SAOCurrentSite?.sourceIndex;
  if(sources)for(const row of normalize(value).data.observedDrops){const list=sources.get(row.itemId)||[],key='observed:'+row.monsterId,monster=D.monsters.find(m=>m.id===row.monsterId),name=typeof monster?.name==='string'?monster.name:monster?.name?.zh;if(!list.some(x=>x.key===key))list.push({key,kind:D.floors.some(f=>f.bossId===row.monsterId)?'boss':'monster',page:'monsters',id:row.monsterId,label:(name&&name!=='...'?name:row.monsterId)+'掉落（機率未提供）'});sources.set(row.itemId,list)}
  return counts(value);
 }
 function read(){try{const value=JSON.parse(root.localStorage.getItem(storageKey)||'null');return value?.format===format?normalize(value):normalize(null)}catch{return normalize(null)}}
 function save(value){const next=combine([read(),value]);root.localStorage.setItem(storageKey,JSON.stringify(next));return next}
 function clear(){root.localStorage.removeItem(storageKey)}
 const api={format,normalize,combine,extract,difference,counts,merge,apply,read,save,clear};
 if(typeof module==='object')module.exports=api;
 if(root){root.SAOInitGuide=api;if(root.SAOCurrent)apply(root.SAOCurrent,read())}
})(typeof window==='object'?window:null);
