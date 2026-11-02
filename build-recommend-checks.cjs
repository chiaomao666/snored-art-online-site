const assert=require('node:assert/strict'),B=require('./build-engine.js'),R=require('./build-recommend.js');
module.exports=function(items){
 const byId=new Map(items.map(x=>[x.id,x]));let scenarios=0;
 for(const level of [1,10,26,40,52,68])for(const role of ['tank','support','damage'])for(const enhance of ['none','max']){
  const input=B.empty();input.level=level;input.storyChapter=level>=40?'lake':'none';input.unique={sword:level>=40,rapier:level>=40,katana:level>=40,mace:level>=40,axe:level>=40};
  input.hitRate=.91;input.params.smithEnhEffect=.3;
  const before=JSON.stringify(input),r=R.recommend(items,input,{role,enhance});assert.equal(JSON.stringify(input),before,'recommendation cannot mutate the current build before it is applied');
  assert.equal(r.state.level,level);assert.equal(r.state.storyChapter,input.storyChapter);assert.equal(r.state.hitRate,.91);assert.equal(r.state.params.smithEnhEffect,.3);assert.deepEqual(r.state.buffs,[]);
  for(const [slot,g]of Object.entries(r.state.slots)){
   if(!g.id)continue;const item=byId.get(g.id);assert.ok(item);assert(item.reqLevel<=level,`${role} ${level}: ${item.name}`);
   const total=Object.values(g.enh).reduce((n,v)=>n+v,0);assert.equal(total,enhance==='none'?0:B.maxPlus(item,g.smith));assert(Object.values(g.enh).every(v=>Number.isInteger(v)&&v>=0));
   assert.equal(g.smith,!!(input.unique.mace&&B.smithEligible(item)));
   if(slot==='offhand')assert(B.offhandAllowed(item,byId.get(r.state.slots.weapon.id),r.state.unique));
  }
  const actual=B.calculate(items,r.state);assert.deepEqual(actual.stats,r.result.stats);assert.equal(actual.warnings.length,0);assert.equal(r.score,R.score(actual.stats,role));
  const reopened=B.decodeShare(B.encodeShare(r.state,items),items);assert.deepEqual(B.calculate(items,reopened).stats,actual.stats,'recommended gear and allocations survive a shared link');
  if(role==='support'){assert.equal(actual.gear.weapon.weaponType,'rapier');assert.deepEqual(r.teamSkills.map(x=>x.name),level>=32?['疾風之哥','看破紅塵']:level>=10?['疾風之哥']:[]);}
  scenarios++;
 }
 const s=B.empty();s.level=68;s.unique={sword:true,rapier:true,katana:true,axe:true,mace:true};s.params.battoAtk=.15;
 const tank=R.recommend(items,s,{role:'tank'}),support=R.recommend(items,s,{role:'support'}),damage=R.recommend(items,s,{role:'damage'});
 assert(tank.result.gear.offhand.shield);assert(support.result.gear.offhand.shield);assert.equal(tank.result.gear.weapon.weaponType,'mace');
 assert(tank.result.stats.def>damage.result.stats.def);assert(tank.result.stats.maxHp>damage.result.stats.maxHp);assert(damage.metrics.normalDps>tank.metrics.normalDps);
 assert.deepEqual(R.recommend(items,s,{role:'damage'}).state,damage.state,'same settings produce the same recommendation');
 assert.throws(()=>R.recommend(items,s,{role:'__proto__'}));assert.throws(()=>R.recommend(items,s,{enhance:'invented'}));
 assert.throws(()=>R.recommend([],s,{role:'support'}),/目前等級沒有/);
 return {levelRoleAndEnhancementScenarios:scenarios,legalEquipmentAndUniqueChecks:true,shareRoundtrips:scenarios,roleSeparation:true,noMutationOrAutomaticBuffs:true};
};
