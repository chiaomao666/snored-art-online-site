const assert=require('node:assert/strict'),M=require('./account-model.js'),B=require('./build-engine.js');
module.exports=function(){
 for(const [xp,level,into,need]of [[0,1,0,250],[249,1,249,250],[250,2,0,388],[638,3,0,601],[23019,9,8328,8329],[23020,10,0,0]])assert.deepEqual(M.skillProgress(xp),{level,into,need});
 const item={id:'fixture',name:'fixture',slot:'weapon',weaponType:'mace',quality:'稀有',reqLevel:30,speed:80,bonus:{atk:50,crit:.02}};
 const p={equipment:{weapon:'g:one',offhand:'unknown'},gear:{one:{base:item.id,plus:3,enh:{sharp:1,quick:1,acc:1},smith:{quick:1}}}};
 const rows=M.equipment(p,[item],B);assert.equal(rows.length,8);assert.equal(rows[0].item.speed,85);assert.equal(rows[0].item.bonus.atk,56);assert.equal(rows[0].item.bonus.crit,.05);assert(rows[1].unknown);assert(rows[2].empty);
 assert(!JSON.stringify(rows).includes('NaN'));
 return {skillXpBoundaries:6,partialSmithEnhancement:1,equipmentSlots:8};
};
