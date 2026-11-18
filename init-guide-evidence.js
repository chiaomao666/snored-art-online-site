/* Public evidence extracted from init; never retain character identity or counts. */
(function(root){'use strict';
 const format='sao-init-guide-evidence-v1',storageKey='sao-guide:init-evidence:v1';
 const retired=new Set(['enh-weapon','enh-armor','enh-accessory']);
 const id=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(x)&&!Object.hasOwn(Object.prototype,x)&&x!=='prototype';
 const entries=x=>x&&typeof x==='object'&&!Array.isArray(x)?Object.entries(x):[];

 const publicFields=['items','hi','skills','skillNames','says','beasts','bosses','floorDrops','unique','hints','space','granny','fwb','storyTexts','params','recipes'];
 const privateKeys=new Set(['__proto__','prototype','constructor','token','password','authorization','account','player','inventory','equipment','gear','chat','log','ax']);
 const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
 const rewardKey=r=>JSON.stringify([r.level,r.snapshotLevel,r.exp,r.col,r.kind,r.source,r.partySize]);
 const rewardTime=r=>Number.isFinite(Date.parse(r.at))?Date.parse(r.at):-1;
 function rewardRows(rows){
  const map=new Map();for(const r of Array.isArray(rows)?rows:[]){if(!plain(r))continue;
   const kind=r.kind==='average'?'average':'kill',amount=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&(kind==='average'||Number.isSafeInteger(v))?v:null;
   const exp=amount(r.exp),col=amount(r.col);if(exp===null&&col===null)continue;
   const level=v=>Number.isInteger(v)&&v>=1&&v<=120?v:null;
   const row={level:level(r.level),exp,col,kind,source:['init','farm'].includes(r.source)?r.source:'historic',at:typeof r.at==='string'&&Number.isFinite(Date.parse(r.at))?new Date(r.at).toISOString():null,order:Number.isSafeInteger(r.order)&&r.order>=0?r.order:0};
   if(level(r.snapshotLevel)!==null)row.snapshotLevel=level(r.snapshotLevel);
   if(Number.isSafeInteger(r.kills)&&r.kills>0&&kind==='average')row.kills=r.kills;
   if(Number.isSafeInteger(r.partySize)&&r.partySize>=1&&r.partySize<=100)row.partySize=r.partySize;
   const key=rewardKey(row),old=map.get(key);if(!old||rewardTime(row)>rewardTime(old)||rewardTime(row)===rewardTime(old)&&row.order>=old.order)map.set(key,row);
  }return [...map.values()].sort((a,b)=>rewardTime(b)-rewardTime(a)||b.order-a.order||rewardKey(a).localeCompare(rewardKey(b)));
 }
 const rewardMap=value=>Object.fromEntries(entries(value).filter(([m])=>id(m)).map(([m,rows])=>[m,rewardRows(rows)]).filter(([,rows])=>rows.length).sort(([a],[b])=>a.localeCompare(b)));
 function rewardCount(value){return Object.values(normalize(value).data.observedRewards||{}).reduce((n,rows)=>n+rows.length,0)}
 function clean(x){if(x===null||typeof x==='string'||typeof x==='boolean')return x;if(typeof x==='number')return Number.isFinite(x)?x:null;if(Array.isArray(x))return x.filter(v=>!retired.has(v)&&!(plain(v)&&(retired.has(v.id)||retired.has(v.itemId)))).map(clean);if(plain(x))return Object.fromEntries(Object.entries(x).filter(([k])=>!privateKeys.has(k.toLowerCase())&&!retired.has(k)&&!(k.startsWith('i:')&&retired.has(k.slice(2)))).map(([k,v])=>[k,clean(v)]));return null}
 function deep(a,b){if(!plain(b))return clean(b);const out=plain(a)?clean(a):{};for(const [k,v]of entries(b))if(!privateKeys.has(k.toLowerCase()))out[k]=plain(v)?deep(out[k],v):clean(v);return out}
 function recipe(r){if(!plain(r?.in)||!Array.isArray(r.out)||Object.keys(r.in).some(k=>retired.has(k))||r.out.some(x=>retired.has(x?.id)))return null;const input=Object.fromEntries(entries(r.in).filter(([k,v])=>id(k)&&Number.isSafeInteger(v)&&v>0).sort(([a],[b])=>a.localeCompare(b)));if(!Object.keys(input).length||Object.keys(input).length!==Object.keys(r.in).length)return null;const out=r.out.filter(x=>Number.isSafeInteger(x?.n)&&x.n>0&&(!x.id||id(x.id))).map(x=>({...x.id?{id:x.id}:{},n:x.n}));return out.length===r.out.length&&out.length?{in:input,out}:null}
 function catalogue(value){const out={};if(!plain(value))return out;
  for(const field of publicFields){const v=value[field];if(v===undefined)continue;
   if(field==='recipes'){const rows=(Array.isArray(v)?v:[]).map(recipe).filter(Boolean);if(rows.length)out.recipes=[...new Map(rows.map(x=>[JSON.stringify(x),x])).values()];continue}
   if(['items','fwb','bosses','granny'].includes(field)){const rows=Array.isArray(v)?v:plain(v)?Object.values(v):[];const list=rows.filter(r=>plain(r)&&(field==='items'?id(r.id)&&!retired.has(r.id)&&typeof r.kind==='string':field==='fwb'?id(r.m)&&id(r.area?.id):field==='bosses'?Number.isInteger(r.floor)&&r.floor>0:id(r.itemId)&&!retired.has(r.itemId))).map(clean);if(list.length)out[field]=list;continue}
   if(field==='beasts'){const map={};for(const [k,r]of entries(v))if(id(k)&&plain(r)){const row=Object.fromEntries(entries(r).filter(([k,x])=>['hp','exp','col'].includes(k)?Number.isFinite(x)&&x>=0:['hit','pace'].includes(k)&&typeof x==='string'));if(Object.keys(row).length)map[k]=row}if(Object.keys(map).length)out.beasts=map;continue}
   if(field==='params'){const map=Object.fromEntries(entries(v).filter(([k,x])=>id(k)&&typeof x==='number'&&Number.isFinite(x)));if(Object.keys(map).length)out.params=map;continue}
   if(plain(v)&&Object.keys(v).length)out[field]=clean(v);
  }return out;
 }
 function mergePublic(a,b){const out={...a};for(const field of publicFields){if(b[field]===undefined)continue;const v=b[field];if(['items','fwb','bosses','granny','recipes'].includes(field)){const key=r=>field==='items'?r.id:field==='fwb'?r.m:field==='bosses'?String(r.floor):field==='granny'?r.itemId:JSON.stringify(r);const old=Array.isArray(a[field])?a[field]:plain(a[field])?Object.values(a[field]):[];const map=new Map(old.map(r=>[key(r),r]));for(const r of v)map.set(key(r),deep(map.get(key(r)),r));out[field]=field==='bosses'&&plain(a[field])?Object.fromEntries(map):[...map.values()]}else out[field]=deep(a[field],v)}return out}
 function catalogueDiff(a,b){const out={};for(const [k,v]of entries(a)){if(['items','fwb','bosses','granny','recipes'].includes(k)){const key=r=>k==='items'?r.id:k==='fwb'?r.m:k==='bosses'?String(r.floor):k==='granny'?r.itemId:JSON.stringify(r);const prev=new Map((Array.isArray(b[k])?b[k]:plain(b[k])?Object.values(b[k]):[]).map(r=>[key(r),r]));const list=v.filter(r=>JSON.stringify(r)!==JSON.stringify(prev.get(key(r))));if(list.length)out[k]=list;}else if(plain(v)){const map={};for(const [id_,row]of entries(v))if(JSON.stringify(row)!==JSON.stringify(b[k]?.[id_]))map[id_]=row;if(Object.keys(map).length)out[k]=map}else if(JSON.stringify(v)!==JSON.stringify(b[k]))out[k]=v}return out}
 function detailCounts(value){const c=normalize(value).data.catalogue||{};return{items:c.items?.length||0,recipes:c.recipes?.length||0,definitions:Object.entries(c).filter(([k])=>!['items','recipes'].includes(k)).reduce((n,[k,v])=>n+(Array.isArray(v)?v.length:Object.keys(v||{}).length),0)}}
 function extractMessage(message){if(!plain(message))return normalize(null);const c={};for(const k of publicFields)if(Object.hasOwn(message,k))c[k]=message[k];if(message.t==='storyText')c.storyTexts=message.texts;return normalize({data:{catalogue:c}})}
 function extractInit(message,context={}){const player=message?.state?.player??message?.player;if(!player)return normalize(null);return combine([extract(player,context),...([message,message.state,message.lore,message.state?.lore,message.guide].filter(plain).map(extractMessage))])}
 function normalize(value){
  const data=value?.data||{},drops=new Map(),skills=new Map(),hp=new Map();
  for(const row of Array.isArray(data.observedDrops)?data.observedDrops:[])if(id(row?.itemId)&&!retired.has(row.itemId)&&id(row?.monsterId))drops.set(row.monsterId+'|'+row.itemId,{itemId:row.itemId,monsterId:row.monsterId});
  for(const [monster,values]of entries(data.observedSkills))if(id(monster)&&Array.isArray(values)){const list=new Set(values.filter(id));if(list.size)skills.set(monster,[...list].sort())}
  for(const [monster,values]of entries(data.observedHp))if(id(monster)&&Array.isArray(values)){const list=new Set(values.filter(x=>Number.isSafeInteger(x)&&x>0));if(list.size)hp.set(monster,[...list].sort((a,b)=>a-b))}
  const c=catalogue(data.catalogue),rewards=rewardMap(data.observedRewards);return {format,data:{...(Object.keys(c).length?{catalogue:c}:{}),...(Object.keys(rewards).length?{observedRewards:rewards}:{}),observedDrops:[...drops.values()].sort((a,b)=>a.monsterId.localeCompare(b.monsterId)||a.itemId.localeCompare(b.itemId)),observedSkills:Object.fromEntries([...skills].sort(([a],[b])=>a.localeCompare(b))),observedHp:Object.fromEntries([...hp].sort(([a],[b])=>a.localeCompare(b)))}};
 }
 function combine(values){
  const data={observedDrops:[],observedSkills:{},observedHp:{},observedRewards:{}};
  for(const value of values){const x=normalize(value).data;if(x.catalogue)data.catalogue=mergePublic(data.catalogue||{},x.catalogue);data.observedDrops.push(...x.observedDrops);for(const key of ['observedSkills','observedHp','observedRewards'])for(const [monster,rows]of entries(x[key]))data[key][monster]=[...(data[key][monster]||[]),...rows]}
  return normalize({data});
 }
 function extract(player,context={}){
  const data={observedDrops:[],observedSkills:{},observedHp:{},observedRewards:{}};
  const drop=(itemId,monsterId)=>{if(id(itemId)&&id(monsterId))data.observedDrops.push({itemId,monsterId})};
  const move=(monster,skill)=>{if(id(monster)&&id(skill))(data.observedSkills[monster]??=[]).push(skill)};
  for(const [item,rows]of entries(player?.stats?.drops))for(const [monster,count]of entries(rows))if(Number.isSafeInteger(count)&&count>0)drop(item,monster);
  for(const [monster,list]of entries(player?.stats?.foeSkills))if(Array.isArray(list))for(const skill of list)move(monster,skill);
  const walk=value=>{if(!value||typeof value!=='object')return;if(id(value.monsterId)&&Number.isSafeInteger(value.maxHp)&&value.maxHp>0)(data.observedHp[value.monsterId]??=[]).push(value.maxHp);for(const child of Object.values(value))if(child&&typeof child==='object')walk(child)};
  walk(player?.enemies);
  for(const [order,log]of (Array.isArray(player?.log)?player.log:[]).entries()){
   const monster=log?.p?.m?.m;
   if(log?.key==='kill'&&id(monster))(data.observedRewards[monster]??=[]).push({exp:log.p.exp,col:log.p.col,level:null,snapshotLevel:player.level,kind:'kill',source:'init',at:context.at,order});
   if(['foeCharge','enemyAttack','foeSummon','foeBuff','wbCharge'].includes(log?.key))move(monster,typeof log.p.k==='string'?log.p.k:log.p.k?.k);
   if(log?.key==='bossReport'&&id(monster)&&typeof log.p.r==='string')try{const report=JSON.parse(log.p.r);for(const [,list]of entries(report?.loot))if(Array.isArray(list))for(const item of list)drop(item,monster)}catch{}
  }
  if(Array.isArray(player?.fuseBook)&&player.fuseBook.length)data.catalogue={recipes:player.fuseBook};
  return normalize({data});
 }
 function difference(value,existing={}){
  const x=normalize(value).data,b=normalize({data:existing}).data,pairs=new Set(b.observedDrops.map(r=>r.monsterId+'|'+r.itemId));
  const rewards={};for(const [m,rows]of entries(x.observedRewards)){const old=new Map((b.observedRewards?.[m]||[]).map(r=>[rewardKey(r),r]));rewards[m]=rows.filter(r=>{const prev=old.get(rewardKey(r));return !prev||rewardTime(r)>rewardTime(prev)||rewardTime(r)===rewardTime(prev)&&r.order>prev.order})}
  return normalize({data:{catalogue:catalogueDiff(x.catalogue||{},mergePublic(catalogue(existing),b.catalogue||{})),observedRewards:rewards,observedDrops:x.observedDrops.filter(r=>!pairs.has(r.monsterId+'|'+r.itemId)),observedSkills:Object.fromEntries(entries(x.observedSkills).map(([m,list])=>[m,list.filter(v=>!b.observedSkills[m]?.includes(v))])),observedHp:Object.fromEntries(entries(x.observedHp).map(([m,list])=>[m,list.filter(v=>!b.observedHp[m]?.includes(v))]))}});
 }
 function counts(value){const d=normalize(value).data;return{drops:d.observedDrops.length,skills:Object.values(d.observedSkills).reduce((n,a)=>n+a.length,0),hp:Object.values(d.observedHp).reduce((n,a)=>n+a.length,0)}}
 function merge(existing,value){const next=combine([{data:existing},value]).data;return mergePublic({...existing,...next},next.catalogue||{})}
 function apply(G,value){
  const D=G.catalog;D.serverGuide=merge(D.serverGuide||{},value);if(normalize(value).data.catalogue&&G.applyPublicGuide)G.applyPublicGuide(D.serverGuide);
  for(const m of D.monsters){const list=D.serverGuide.observedHp[m.id];if(!list?.length)continue;m.observedMaxHp=list.slice();if(m.legacyReference&&list.some(h=>h!==m.legacyReference.stats?.maxHp)){delete m.legacyReference;if(D.legacyMonsters)delete D.legacyMonsters[m.id]}}
  if(D.serverGuideCoverage){Object.assign(D.serverGuideCoverage,{dropSources:D.serverGuide.observedDrops.length,observedHp:Object.keys(D.serverGuide.observedHp).length,monsterSkills:Object.keys(D.serverGuide.observedSkills).length});if(D.legacyMonsters){D.serverGuideCoverage.legacyMonsters=Object.keys(D.legacyMonsters).length;D.serverGuideCoverage.legacyDropEntries=Object.values(D.legacyMonsters).reduce((n,m)=>n+(m.drops?.length||0),0)}}
  // Existing equipment views retain this Map by reference; add sources to it.
  root?.SAORefreshGuideCatalogue?.();
  const sources=root?.SAOCurrentSite?.sourceIndex;
  if(sources)for(const row of normalize(value).data.observedDrops){const list=sources.get(row.itemId)||[],key='observed:'+row.monsterId,monster=D.monsters.find(m=>m.id===row.monsterId),name=typeof monster?.name==='string'?monster.name:monster?.name?.zh;if(!list.some(x=>x.key===key))list.push({key,kind:D.floors.some(f=>f.bossId===row.monsterId)?'boss':'monster',page:'monsters',id:row.monsterId,label:(name&&name!=='...'?name:row.monsterId)+'掉落（機率未提供）'});sources.set(row.itemId,list)}
  return counts(value);
 }
 function read(){try{const value=JSON.parse(root.localStorage.getItem(storageKey)||'null');return value?.format===format?normalize(value):normalize(null)}catch{return normalize(null)}}
 function save(value){const next=combine([read(),value]);root.localStorage.setItem(storageKey,JSON.stringify(next));return next}
 function clear(){root.localStorage.removeItem(storageKey)}
 const api={format,normalize,combine,extract,extractInit,extractMessage,difference,counts,detailCounts,rewardCount,merge,apply,read,save,clear};
 if(typeof module==='object')module.exports=api;
 if(root){root.SAOInitGuide=api;if(root.SAOCurrent)apply(root.SAOCurrent,read())}
})(typeof window==='object'?window:null);
