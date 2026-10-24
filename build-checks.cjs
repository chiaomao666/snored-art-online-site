const assert=require('node:assert/strict'),B=require('./build-engine.js');
module.exports=function(items){
 const close=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} != ${b}`);
 assert.deepEqual(B.baseStats(40),{maxHp:6500,atk:325,def:375,agi:49,crit:.05,critDmg:0,evade:0,block:0});
 const weapon={id:'test-sword',name:'測試劍',slot:'weapon',weaponType:'sword',speed:100,reqLevel:40,quality:'專名',bonus:{atk:100,crit:.1}};
 const shield={id:'test-shield',name:'測試盾',slot:'offhand',shield:true,slow:.1,reqLevel:1,quality:'專名',bonus:{def:50}};
 const ring={id:'test-ring',name:'測試戒指',slot:'accessory',reqLevel:1,quality:'一般',bonus:{agi:10,critDmg:.2}};
 const armor={id:'test-armor',name:'測試防具',slot:'armor',reqLevel:40,quality:'一般',bonus:{maxHp:1000,agi:-10}};
 let x=B.enhance(weapon,{enh:{sharp:7}});assert.equal(x.bonus.atk,184);
 x=B.enhance(weapon,{enh:{quick:7}});assert.equal(x.speed,128);assert.equal(x.bonus.atk,100);
 x=B.enhance(weapon,{enh:{acc:7}});close(x.bonus.crit,.31);
 x=B.enhance(armor,{enh:{thick:2,light:2}});assert.equal(x.bonus.maxHp,1390);assert.equal(x.bonus.agi,0);
 x=B.enhance(shield,{enh:{hard:4},smith:true});assert.equal(x.bonus.def,80);assert.equal(B.maxPlus(shield,true),13);
 let state=B.empty();state.slots.weapon.id=weapon.id;state.slots.offhand.id=shield.id;state.slots.accessory.id=ring.id;state.slots.ring2.id=ring.id;
 let result=B.calculate([weapon,shield,ring],state);assert.equal(result.stats.agi,69);close(result.stats.critDamage,2);assert.equal(result.stats.def,425);close(result.multiplier,.9);
 state.unique.sword=true;state.slots.offhand.id=weapon.id;result=B.calculate([weapon,shield,ring],state);assert.equal(result.stats.atk,485);close(result.stats.crit,.21);close(result.multiplier,1.05);
 state.unique.sword=false;result=B.calculate([weapon,shield,ring],state);assert.equal(result.state.slots.offhand.id,'');
 const katana={...weapon,id:'test-katana',weaponType:'katana'},axe={...weapon,id:'test-axe',weaponType:'axe'},mace={...weapon,id:'test-mace',weaponType:'mace'};
 assert(B.offhandAllowed(shield,katana,{}));assert(!B.offhandAllowed(shield,katana,{katana:true}));assert(!B.offhandAllowed(shield,axe,{}));
 state=B.empty();state.slots.weapon.id=mace.id;state.slots.offhand.id=shield.id;state.unique.mace=true;result=B.calculate([mace,shield],state);close(result.multiplier,1);assert.equal(result.stats.atk,446);close(result.stats.block,.08);
 state=B.empty();state.level=1;state.slots.weapon.id=weapon.id;state.slots.weapon.enh={sharp:999,quick:999,acc:-10};result=B.calculate([weapon],state);assert.equal(result.gear.weapon.plus,10);assert.equal(result.warnings.length,1);
 let cases=0;for(const item of items){for(const direction of B.dirs(item)){const out=B.enhance(item,{enh:{[direction]:B.maxPlus(item)}});assert(Object.values(out.bonus).every(Number.isFinite));assert(out.speed==null||out.speed>0);cases++}}
 return {formulaFixtures:15,equipmentDirections:cases};
};
