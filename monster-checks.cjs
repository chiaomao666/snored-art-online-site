const assert=require('node:assert/strict'),M=require('./monster-data.js');
module.exports=function(D){
 const all=M.monsters,map=new Map(all.map(m=>[m.id,m])),items=M.items,equipment=new Map(D.equipment.map(x=>[x.id,x])),areas=[...D.areas,...D.secretAreas,...D.bossAreas];
 assert.equal(all.length,589);assert.equal(map.size,589);
 assert.deepEqual([...new Set(all.map(m=>m.floor))].sort((a,b)=>a-b),Array.from({length:40},(_,i)=>i+1));
 let dropCount=0,pools=0;
 for(const a of areas)for(const m of a.monsters){const x=map.get(m.id);assert(x);assert.equal(x.floor,a.floor);assert.equal(x.name,m.name);assert.equal(x.exp,m.exp);assert.equal(x.col,m.col);assert.deepEqual(x.stats,m.stats);assert(x.areaIds.includes(a.id));}
 for(const m of all){
  assert(['normal','rare','secret','boss','story'].includes(m.kind));assert(m.areaIds.length);
  assert.deepEqual(Object.keys(m).filter(k=>/^(kills|observedDrops|player|history)$/i.test(k)),[]);
  assert(M.dropTables[m.dropTable]);
  for(const d of [...m.drops,...M.dropTables[m.dropTable]]){dropCount++;assert(d.chance>0&&d.chance<=1);assert(items[d.itemId]);
   for(const id of d.pool||[d.itemId]){assert(items[id]);if(items[id].category==='equipment')assert(equipment.has(id));}
   if(d.pool){pools++;assert.equal(m.kind,'boss');assert.equal(d.chance,.08);assert.equal(d.pool.length,3);assert.equal(new Set(d.pool).size,3);assert.equal(d.repeat,true);}
  }
 }
 assert.equal(dropCount,22550);assert.equal(pools,40);
 const fixtures=[['f5-a',94,83,9,41,14],['f5-j',145,111,10,55,17],['f5-b',101,181,8,59,19],['f5-boss',4536,264,22,720,900],['f5-s',538,358,30,265,30]];
 for(const [id,hp,atk,def,exp,col]of fixtures){const m=map.get(id);assert.deepEqual([m.stats.maxHp,m.stats.atk,m.stats.def,m.exp,m.col],[hp,atk,def,exp,col]);}
 assert.equal(all.filter(m=>m.floor===5).length,15);
 assert.deepEqual(new Set(map.get('f5-boss').knownSkills),new Set(['爆裂新星','隕石墜','呼朋引伴']));
 assert.equal(all.filter(m=>m.knownSkills).length,40);
 for(const m of all.filter(m=>m.kind==='boss')){
  const b=m.bossGuide;assert(b);assert.equal(b.phases[0].below,1);assert(b.phases.length>=2);
  assert(['enrage','stack','regen','summon'].includes(b.pressure));
  for(const [i,p] of b.phases.entries()){
   assert(p.below>0&&p.below<=1);if(i)assert(p.below<b.phases[i-1].below);
   assert(p.skills.length>0);assert.equal(new Set(p.skills).size,p.skills.length);
   for(const id of p.skills){const skill=M.bossSkills[id];assert(skill);assert.equal(id,skill.id);assert(m.knownSkills.includes(skill.name));assert(skill.windupMs>=0);assert(skill.cooldownMs>0)}
  }
 }
 const boss5=map.get('f5-boss').bossGuide;
 assert.deepEqual(boss5.phases[0].skills,['b-meteor','b-nova']);
 assert.equal(boss5.phases[1].below,.4);assert(boss5.phases[1].skills.includes('b-summon'));
 assert.equal(M.bossSkills['b-nova'].all,true);assert.equal(M.bossSkills['b-nova'].windupMs,2600);assert.equal(M.bossSkills['b-meteor'].cooldownMs,26000);
 assert.deepEqual(map.get('f1-boss').bossGuide.phases[1].skills,['if-talwar']);
 assert.deepEqual(map.get('f1-boss').bossGuide.releaseVariant.phases[1].skills,['if-spin','if-fan']);
 const boss40=map.get('f40-boss').bossGuide;
 assert.deepEqual(boss40.phases.map(p=>p.below),[1,.75,.5,.25,.1]);
 assert(boss40.phases[1].skills.includes('b-share-f40'));assert(boss40.phases[1].skills.includes('b-rampage-f40'));
 assert(!boss40.phases[2].skills.includes('b-smash'),'Full phase lists must preserve removed moves');
 assert.equal(M.bossSkills['b-share-f40'].name,'末日壓頂');assert.equal(M.bossSkills['b-rampage-f40'].name,'魔王亂舞');
 assert.equal(all.filter(m=>m.kind!=='boss'&&m.bossGuide).length,0);
 for(const x of D.materials.filter(x=>x.kind==='drop'))assert(map.has(x.monsterId));
 const story=all.filter(m=>m.kind==='story');assert.equal(story.length,6);assert.equal(all.filter(m=>m.kind!=='story').length,583);
 const locations=new Map([...areas,...M.storyAreas].map(a=>[a.id,a]));for(const m of all){for(const id of m.areaIds){assert(locations.has(id));assert.equal(locations.get(id).floor,m.floor);}if(m.story){assert(m.story.chapterNumber>=0);assert(m.story.steps.length);assert(m.story.prerequisites.length);}}
 const nicholas=map.get('f35-nicholas');assert.equal(nicholas.stats.maxHp,182700);assert.equal(nicholas.level,52);assert.equal(nicholas.story.chapterNumber,39);assert.deepEqual(nicholas.story.steps,[3]);assert(nicholas.story.condition.includes('Lv50'));assert.equal(nicholas.exp,17650);assert.equal(nicholas.col,2360);assert.equal(nicholas.floor,35);assert.equal(M.dropTables[nicholas.dropTable].length,0);
 for(const id of ['f22-ug-toad','f22-ug-cray']){const m=map.get(id);assert.equal(m.floor,1);assert.equal(m.areaIds.length,6);assert.equal(m.story.chapterNumber,24);assert.deepEqual(m.story.steps,[5,6,7,8,9,10]);}
 assert(map.get('f22-reaper').levelHidden);assert.equal(map.get('f22-reaper').floor,1);assert.equal(map.get('f22-reaper').exp,0);assert.equal(map.get('f28-wolf').story.chapterNumber,31);assert(map.get('f28-wolf').story.condition.includes('Lv38'));assert.equal(map.get('f20-mantis').story.chapterNumber,22);
 const rates=all.flatMap(m=>[...m.drops,...M.dropTables[m.dropTable]].map(d=>d.chance));
 assert(Math.abs(Math.min(...rates)-.0000264)<1e-15);
 return {bossSkillGuides:40,bossSkillDefinitions:Object.keys(M.bossSkills).length,monsters:all.length,dropEntries:dropCount,pools,items:Object.keys(items).length};
};


