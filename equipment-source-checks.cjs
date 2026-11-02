const assert=require('node:assert/strict'),M=require('./monster-data.js'),extra=require('./equipment-source-data.js'),S=require('./equipment-sources.js');
module.exports=function(D){
 const index=S.create(D,M,extra),counts={};assert.equal(index.size,466);
 for(const kind of ['monster','boss','shop','quest'])counts[kind]=[...index.values()].filter(e=>S.matches(e,kind)).length;
 assert.deepEqual(counts,{monster:221,boss:121,shop:98,quest:124});assert.equal([...index.values()].filter(e=>S.matches(e,'unknown')).length,0);
 let verifiedDrops=0;
 for(const m of M.monsters)for(const drop of [...m.drops,...M.dropTables[m.dropTable]])for(const id of drop.pool??[drop.itemId]){
  if(!index.has(id))continue;const row=index.get(id)[m.kind==='boss'?'boss':'monster'].find(x=>x.id===m.id);assert(row);assert.equal(row.chance,drop.chance);assert.equal(row.poolSize,drop.pool?.length??0);assert.deepEqual(row.areas.map(a=>a.id),m.areaIds);verifiedDrops++;
 }
 for(const [id,amount,floors]of [['neck-t20',28,[23,24]],['neck-t25',70,[25,26,27,28,29]],['neck-t30',70,[30,31,32,33,34]],['neck-t35',66,[35,36,37,38,39]],['neck-t40',14,[40]]]){
  const e=index.get(id);assert.equal(e.monster.length,amount);assert.deepEqual([...new Set(e.monster.map(m=>m.floor))],floors);assert.equal(e.shop.length,0);assert.equal(e.quest.length,0);assert(e.monster.some(m=>m.chance===.002));assert(e.monster.some(m=>m.kind==='secret'));
 }
 const yui=index.get('yui-necklace');assert.equal(yui.monster.length,0);assert.equal(yui.shop.length,0);assert.equal(yui.quest.length,1);assert.equal(yui.quest[0].questId,'yui');assert.equal(yui.quest[0].step,3);assert.match(yui.quest[0].title,/第24章/);
 assert(index.get('weapon-t1').monster.length);assert(index.get('weapon-t1').shop.some(a=>a.floor===1));assert(index.get('fine-weapon-t1').monster.length);assert.equal(index.get('fine-weapon-t1').shop.length,0);
 const choice=index.get('anneal-blade').quest[0];assert.equal(choice.questId,'ch1');assert.equal(choice.choiceCount,5);assert.equal(choice.step,null);
 assert.equal(index.get('boss-f40').boss[0].poolSize,3);assert.equal(index.get('boss-f40').boss[0].chance,.08);assert.equal(index.get('coat-of-midnight').boss[0].poolSize,0);assert.equal(index.get('coat-of-midnight').boss[0].chance,1);
 assert.equal(S.floorText([{floor:1},{floor:3},{floor:4},{floor:6},{floor:3}]),'第 1、3–4、6 層');assert.equal(S.floorText([]),'');
 assert(!S.matches(index.get('neck-t20'),'shop'));assert(S.matches(index.get('neck-t20'),'monster'));assert(S.matches(null,'unknown'));assert(!S.matches(null,'monster'));assert(index.get('neck-t20').search.includes('優靈騎士'));
 return {equipment:index.size,counts,verifiedDrops,unconfirmed:0,necklaceFixtures:6};
};
