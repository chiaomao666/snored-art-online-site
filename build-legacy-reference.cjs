// Curated numeric facts only. New server values and observed instance HP take priority.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function same(a,b){if(a===b)return true;if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return false;const ak=Object.keys(a).sort(),bk=Object.keys(b).sort();return JSON.stringify(ak)===JSON.stringify(bk)&&ak.every(k=>same(a[k],b[k]));}
const knownName=x=>typeof x?.zh==='string'&&x.zh.trim()&&!['...','…','???'].includes(x.zh.trim());
function monsterConflict(current,old){
 if(!current)return 'missing';
 if(current.levelUnknown||current.worldBoss||old.levelUnknown)return 'dynamic';
 if(current.id!==old.id||current.level!==old.level||knownName(current.name)&&knownName(old.name)&&current.name.zh!==old.name.zh)return 'identity';
 for(const [key,value]of Object.entries(current.stats||{}))if(Number.isFinite(value)&&(!Number.isFinite(old.stats?.[key])||Math.abs(old.stats[key]-value)>1e-9))return 'stats';
 if(current.observedMaxHp?.some(value=>!Number.isFinite(old.stats?.maxHp)||Math.abs(value-old.stats.maxHp)>1e-9))return 'observedHp';
 for(const key of ['exp','col'])if(Number.isFinite(current[key])&&current[key]!==old[key])return key;
 return null;
}
function itemCompatible(current,old){
 if(!current||!old||current.id!==old.id)return false;
 for(const key of ['kind','slot','reqLevel','weaponType','armorType','gloveType','shield','speed','bonus','heal','healDurationMs','set','cosmeticOnly'])if(!same(current[key]??null,old[key]??null))return false;
 for(const key of ['rare','named','bound'])if(!!current[key]!==!!old[key])return false;
 if(knownName(current.name)&&knownName(old.name)&&current.name.zh!==old.name.zh)return false;
 return true;
}
function itemCheck(item){
 const stable=x=>x&&typeof x==='object'?Array.isArray(x)?x.map(stable):Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
 return JSON.stringify(stable(Object.fromEntries(['id','kind','slot','reqLevel','weaponType','armorType','gloveType','shield','speed','bonus','heal','healDurationMs','set','cosmeticOnly','rare','named','bound','nameZh'].map(k=>[k,k==='nameZh'?(typeof item.name?.zh==='string'&&!['...','…','???'].includes(item.name.zh)?item.name.zh:null):['rare','named','bound'].includes(k)?!!item[k]:item[k]??null]))));
}
function build(current,old){
 const monsters={},rejected={},itemChecks={},currentMobs=new Map(current.monsters.map(x=>[x.id,x])),items=new Map(current.items.map(x=>[x.id,x])),oldItems=new Map(old.items.map(x=>[x.id,x]));
 let dropEntries=0,skippedDrops=0;
 for(const row of old.monsters){
  const reason=monsterConflict(currentMobs.get(row.id),row);if(reason){(rejected[reason]??=[]).push(row.id);continue;}
  const stats=Object.fromEntries(Object.entries(row.stats||{}).filter(([key,value])=>['maxHp','atk','def','agi','crit'].includes(key)&&Number.isFinite(value)&&value>=0));
  const drops=[];
  for(const drop of row.drops||[]){if(!Number.isFinite(drop.chance)||drop.chance<=0||drop.chance>1||!itemCompatible(items.get(drop.itemId),oldItems.get(drop.itemId))){skippedDrops++;continue;}drops.push({itemId:drop.itemId,chance:drop.chance});itemChecks[drop.itemId]=itemCheck(items.get(drop.itemId));}
  dropEntries+=drops.length;monsters[row.id]={id:row.id,name:{zh:row.name.zh},level:row.level,stats,exp:row.exp,col:row.col,drops};
 }
 return {monsters,itemChecks,summary:{monsters:Object.keys(monsters).length,dropEntries,skippedDrops,rejected:Object.fromEntries(Object.entries(rejected).map(([key,ids])=>[key,ids.length]))}};
}
module.exports={build,monsterConflict,itemCompatible,itemCheck};
if(require.main===module){
 const source=process.argv[2];assert(source,'Pass a legacy catalogue file path.');
 const G=require('./current-runtime.js'),file=path.join(__dirname,'server-guide-data.json'),payload=JSON.parse(fs.readFileSync(file,'utf8'));
 require('./server-guide-overlay.js').apply(G,payload);
 payload.data.legacyFallback=build(G.catalog,JSON.parse(fs.readFileSync(source,'utf8')));
 fs.writeFileSync(file,JSON.stringify(payload)+'\n');console.log(JSON.stringify(payload.data.legacyFallback.summary));
}
