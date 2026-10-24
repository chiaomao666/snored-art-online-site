const assert=require('node:assert/strict'),M=require('./monster-data.js');
module.exports=function(D){
 const all=M.monsters,map=new Map(all.map(m=>[m.id,m])),items=M.items,equipment=new Map(D.equipment.map(x=>[x.id,x])),areas=[...D.areas,...D.secretAreas,...D.bossAreas];
 assert.equal(all.length,583);assert.equal(map.size,583);
 assert.deepEqual([...new Set(all.map(m=>m.floor))].sort((a,b)=>a-b),Array.from({length:40},(_,i)=>i+1));
 let dropCount=0,pools=0;
 for(const a of areas)for(const m of a.monsters){const x=map.get(m.id);assert(x);assert.equal(x.floor,a.floor);assert.equal(x.name,m.name);assert.equal(x.exp,m.exp);assert.equal(x.col,m.col);assert.deepEqual(x.stats,m.stats);assert(x.areaIds.includes(a.id));}
 for(const m of all){
  assert(['normal','rare','secret','boss'].includes(m.kind));assert(m.areaIds.length);
  assert.deepEqual(Object.keys(m).filter(k=>/^(kills|observedDrops|player|history)$/i.test(k)),[]);
  assert(M.dropTables[m.dropTable]);
  for(const d of [...m.drops,...M.dropTables[m.dropTable]]){dropCount++;assert(d.chance>0&&d.chance<=1);assert(items[d.itemId]);
   for(const id of d.pool||[d.itemId]){assert(items[id]);if(items[id].category==='equipment')assert(equipment.has(id));}
   if(d.pool){pools++;assert.equal(m.kind,'boss');assert.equal(d.chance,.08);assert.equal(d.pool.length,3);assert.equal(new Set(d.pool).size,3);assert.equal(d.repeat,true);}
  }
 }
 assert.equal(dropCount,22468);assert.equal(pools,40);
 const fixtures=[['f5-a',94,83,9,41,14],['f5-j',145,111,10,55,17],['f5-b',101,181,8,59,19],['f5-boss',4536,264,22,720,900],['f5-s',538,358,30,265,30]];
 for(const [id,hp,atk,def,exp,col]of fixtures){const m=map.get(id);assert.deepEqual([m.stats.maxHp,m.stats.atk,m.stats.def,m.exp,m.col],[hp,atk,def,exp,col]);}
 assert.equal(all.filter(m=>m.floor===5).length,15);
 assert.deepEqual(map.get('f5-boss').knownSkills,['爆裂新星','隕石墜','呼朋引伴']);
 assert.equal(all.filter(m=>m.knownSkills).length,1);
 for(const x of D.materials.filter(x=>x.kind==='drop'))assert(map.has(x.monsterId));
 const rates=all.flatMap(m=>[...m.drops,...M.dropTables[m.dropTable]].map(d=>d.chance));
 assert(Math.abs(Math.min(...rates)-.0000264)<1e-15);
 return {monsters:all.length,dropEntries:dropCount,pools,items:Object.keys(items).length};
};


