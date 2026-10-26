const assert=require('node:assert/strict'),R=require('./reward-guide.js');
module.exports=function(){
 for(const value of [null,undefined,'',0,121,-1,1.5,'Lv50','NaN'])assert.equal(R.parse(value),null);
 for(const value of [1,50,120,'50'])assert.equal(R.parse(value),Number(value));
 assert.deepEqual(R.comparison(40,50),{gap:-10,text:'低你 10 級',kind:'lower'});
 assert.deepEqual(R.comparison(52,50),{gap:2,text:'高你 2 級',kind:'higher'});
 assert.deepEqual(R.comparison(50,50),{gap:0,text:'同等級',kind:'same'});
 assert.deepEqual(R.comparison(50,null),{gap:null,text:'—',kind:'unknown'});
 assert.deepEqual(R.comparison(null,50),{gap:null,text:'等級隱藏',kind:'unknown'});
 assert.equal(R.load(new URLSearchParams('playerLevel=50')),50);
 assert.equal(R.load(new URLSearchParams('playerLevel=0')),null);
 const fixtures=[
  [575,44,57,58],[575,44,58,43],
  [1341,46,57,239],[1341,46,58,179],
  [434,53,57,434],[555,54,57,555],
  [370,50,58,156],[689,51,58,388],
  [1404,59,57,1404],[1404,59,58,1404],
  [774,61,57,774],[774,61,58,774],
  [390,7,58,4],[450,8,58,5],[582,10,58,6],[4038,50,58,1704],
 ];
 for(const [base,monster,player,expected] of fixtures)assert.equal(R.estimate(base,monster,player).value,expected);
 assert.equal(R.estimate(100,53,58).multiplier,1);
 assert.equal(R.estimate(100,52,58).multiplier,.75);
 assert.equal(R.estimate(100,51,58).multiplier,.5625);
 assert.equal(R.estimate(100,59,58).value,100);
 assert.equal(R.estimate(0,44,58).value,0);
 assert.notEqual(R.estimate(575,44,58).value,Math.round(58*.75),'Always calculate from the base XP, then round once');
 for(const [base,monster,player]of [[-1,44,58],[NaN,44,58],[Infinity,44,58],[100,null,58],[100,0,58],[100,44,null],[100,44,121]])assert.equal(R.estimate(base,monster,player),null);
 assert.equal(R.estimate(100,1,120).extended,true);
 assert.match(R.valueHtml(100,1,120),/公式延伸推估/);
 assert.match(R.valueHtml(100,44,58,true),/單人頭目推估/);
 assert.match(R.valueHtml(100,null,58),/等級未知/);
 assert.match(R.valueHtml(100,44,null),/先填角色等級/);
 assert.equal(R.formatMultiplier(.75),'75%');
 assert.equal(R.formatMultiplier(1),'100%');
 assert.match(R.formatMultiplier(1e-20),/小於/);
 assert.equal(R.sortValue({exp:99999,level:1,levelHidden:true},58),-1);
 assert.equal(R.sortValue({exp:0,level:44},58),0);
 assert.equal(R.estimate(1000,37,58).floorApplied,false);
 assert.equal(R.estimate(1000,37,58).steps,16);
 assert(R.estimate(1000,37,58).multiplier>.01);
 assert.equal(R.estimate(1000,36,58).floorApplied,true);
 assert.equal(R.estimate(1000,36,58).multiplier,.01);
 assert.equal(R.estimate(100,1,120).value,1);
 assert.match(R.valueHtml(390,7,58,true),/等級差最低 1%/);
 assert.equal(R.estimate(20,7,58).value,0,'The 1% multiplier floor does not establish a separate minimum of one XP');
 const regions=[{id:'a37',floor:37,maxEnemies:4,monsters:[{id:'m1',level:49,exp:590,col:90,spawnWeight:3},{id:'m2',level:50,exp:1144,col:73,spawnWeight:2}]},{id:'a38',floor:38,maxEnemies:4,monsters:[{id:'m3',level:50,exp:1144,col:73,spawnWeight:3},{id:'m4',level:51,exp:379,col:56,spawnWeight:2}]}];
 const original=JSON.stringify(regions);
 assert.equal(R.areaScore(regions[0],'estimatedExp',56),542.4);
 assert.equal(R.areaScore(regions[1],'estimatedExp',56),666.4);
 assert.deepEqual(R.rankAreas(regions,'estimatedExp',56).map(a=>a.floor),[38,37]);
 assert.deepEqual(R.rankAreas(regions,'exp',56).map(a=>R.areaScore(a,'exp',56)),[838,811.6]);
 assert.deepEqual(R.rankAreas(regions,'col',56).map(a=>a.floor),[37,38]);
 assert.deepEqual(R.rankAreas(regions,'estimatedExp',56).map(a=>a.monsters.length),[2,2]);
 assert.deepEqual(R.rankAreas(regions,'floor',56).map(a=>a.floor),[37,38]);
 assert.equal(JSON.stringify(regions),original,'Sorting must not mutate shared region or monster definitions');
 assert.equal(R.areaScore({monsters:[{exp:99999,levelHidden:true,level:1}]},'estimatedExp',56),null);
 assert.equal(R.areaScore(regions[0],'estimatedExp',null),null);
 assert.equal(R.areaScore({monsters:[{exp:10,level:1},{exp:20,level:1}]},'exp',56),null,'Missing multi-monster weights must not silently become equal weights');
 // Anonymous observed per-kill rewards: participants, level, extra reduction and low-level cases.
 const partyFixtures=[
  [1086,1230,17,58,2,false,false,6,646],
  [1086,1230,17,22,2,true,false,285,323],
  [1158,1320,18,58,2,false,false,6,693],
  [1158,1320,18,22,2,true,false,304,347],
  [1314,1440,20,58,2,false,false,7,756],
  [1314,1440,20,22,2,true,false,345,378],
  [4644,3810,56,58,5,false,false,1115,914],
  [4644,3810,56,62,5,false,false,836,914],
  [4644,3810,56,63,5,false,true,63,914],
  [4644,3810,56,58,6,false,false,968,794],
  [4644,3810,56,62,6,false,false,726,794],
  [4644,3810,56,63,6,false,true,54,794],
  [4644,3810,56,63,1,false,true,261,3810],
  [1404,86,59,63,1,false,true,140,86],
  [774,110,61,63,1,false,true,77,110]
 ];
 for(const [base,cash,monster,player,n,low,extra,xp,col] of partyFixtures){
  const o={participants:n,lowLevelPenalty:low,expReduction:extra};
  assert.equal(R.estimate(base,monster,player,o).value,xp);
  assert.equal(R.estimateCol(cash,o),col);
 }
 assert.equal(R.estimate(4644,56,62,{participants:3}).value,1277);
 assert.equal(R.estimateCol(3810,{participants:3}),1397);
 assert.equal(R.estimate(4644,56,62,{participants:4}).value,1001);
 assert.equal(R.estimateCol(3810,{participants:4}),1095);
 assert.equal(R.factors({participants:3}).verifiedParticipants,false);
 assert.equal(R.factors({participants:4}).verifiedParticipants,false);
 for(const n of [0,7,1.5,NaN]){assert.equal(R.estimate(100,1,1,{participants:n}),null);assert.equal(R.estimateCol(100,{participants:n}),null)}
 assert.equal(R.estimateCol(100,{participants:1,lowLevelPenalty:true}),100,'Solo cannot receive the party low-level penalty');
 assert.equal(R.estimateCol(100,{expReduction:true}),100,'Extra XP reduction must not affect cash');
 assert.equal(R.estimate(4644,56,63).value,2612,'Do not assume the unverified Lv63 threshold automatically');
 assert.equal(R.estimate(1000,37,58,{participants:6}).value,2,'Multiply all factors before rounding, not rounded solo XP');
 assert.equal(R.estimateCol(3810,{participants:6}),794,'Use exact fraction, not displayed percentage');
 assert.equal(R.estimateCol(100,{participants:2,lowLevelPenalty:true}),26);
 assert.equal(R.estimateCol(100,{participants:2}),53);
 assert.equal(R.estimateCol(-1),null);
 assert.equal(R.estimateCol(Infinity),null);
 assert.match(R.valueHtml(100,44,58,true,{participants:3}),/人數待驗證/);
 assert.match(R.panel(58,{participants:2}),/含自己/);
 assert.equal(R.areaScore(regions[0],'estimatedExp',56,{participants:6}),113);
 assert.equal(R.areaScore(regions[1],'estimatedCol',56,{participants:2}),34.4);
 return {observedPartyFixtures:partyFixtures.length,partyBoundaries:21,levelBoundaries:13,comparisons:5,queryLevels:2,observedXpFixtures:fixtures.length,formulaBoundaryChecks:6,minimumMultiplierChecks:8,invalidFormulaInputs:7,estimateDisplayChecks:8,floorSortChecks:11};
};
