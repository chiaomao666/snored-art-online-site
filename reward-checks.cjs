const assert=require('node:assert/strict'),R=require('./reward-guide.js');
module.exports=function(){
 const cleared40={highestClearedFloor:40},zero={highestClearedFloor:0};
 for(const value of [null,undefined,'',0,121,-1,1.5,'Lv50','NaN'])assert.equal(R.parse(value),null);
 for(const value of [1,50,120,'50'])assert.equal(R.parse(value),Number(value));
 for(const value of [null,undefined,'',-1,41,1.5,'bad'])assert.equal(R.parseProgress(value),null);
 for(const value of [0,'0',1,40])assert.equal(R.parseProgress(value),Number(value));
 assert.equal(R.progressLabel(0),'第1層（尚未通關）');
 assert.equal(R.progressLabel(1),'第2層（已通關第1層）');
 assert.equal(R.progressLabel(40),'第40層已通關');
 assert.deepEqual(R.comparison(40,50),{gap:-10,text:'低你 10 級',kind:'lower'});
 assert.equal(R.comparison(null,50).text,'等級隱藏');assert.equal(R.comparison(52,50).gap,2);
 assert.equal(R.load(new URLSearchParams('playerLevel=50')),50);
 assert.equal(R.load(new URLSearchParams('playerLevel=0')),null);
 assert.deepEqual(R.loadOptions(new URLSearchParams('participants=2&highestClearedFloor=0&expReduction=1')),{participants:2,highestClearedFloor:0});
 assert.equal(R.loadOptions(new URLSearchParams('highestClearedFloor=bad')).highestClearedFloor,null);
 assert.equal(R.options().highestClearedFloor,null,'Unknown progress must not become zero');
 assert.equal(R.estimate(442,23,26),null,'No progress, no assumed XP reduction');
 assert.match(R.valueHtml(442,23,26),/先選最高攻略進度/);
 assert.equal(R.estimateCol(44,23,26),44,'Progress does not affect cash');
 assert.match(R.multiplierHtml(442,23,26),/100%/,'Ordinary multiplier remains available');
 const fixtures=[
  [575,44,57,58],[575,44,58,43],[1341,46,57,239],[1341,46,58,179],
  [434,53,57,434],[555,54,57,555],[370,50,58,156],[689,51,58,388],
  [1404,59,57,1404],[1404,59,58,1404],[774,61,57,774],[774,61,58,774],
  [390,7,58,4],[450,8,58,5],[582,10,58,6],[4038,50,58,1704]
 ];
 for(const [base,mob,level,xp]of fixtures)assert.equal(R.estimate(base,mob,level,cleared40).value,xp);
 const thresholds=[[0,13],[1,14],[2,16],[3,17],[4,18],[11,27],[14,31],[24,43],[39,62],[40,63]];
 for(const [cleared,threshold]of thresholds){
  assert.equal(R.penaltyLevel(cleared),threshold);
  for(const level of [threshold-1,threshold,threshold+1]){
   const settings={highestClearedFloor:cleared};
   assert.equal(R.estimate(1000,level,level,settings).value,level>=threshold?100:1000);
   assert.equal(R.estimateCol(1000,level,level,settings),1000);
  }
 }
 // Anonymous pre/post-upgrade observations from the same account with no cleared floor.
 for(const [base,mob,before,after]of [[15,3,5,0],[47,4,20,1],[36,4,15,1]]){
  assert.equal(R.estimate(base,mob,12,zero).value,before);
  assert.equal(R.estimate(base,mob,13,zero).value,after);
 }
 assert.equal(R.estimate(47,4,13,zero).value,1,'Do not round the ordinary 14.871 XP before multiplying by 10%');
 // The old Lv26/frontline12 sample did not record actual clearedFloors and
 // is excluded from verified progress fixtures; do not force it into C=11.
 for(const [base,mob,level,cleared,xp]of [[442,23,26,14,442],[442,23,27,14,442],[299,23,25,14,299],[221,22,26,14,221],[27,4,27,14,0],[52,5,27,14,1],[1404,59,63,40,140],[774,61,63,40,77]])assert.equal(R.estimate(base,mob,level,{highestClearedFloor:cleared}).value,xp);
 // Anonymous observations across the newly measured progression boundaries.
 const newProgressFixtures=[
  [55,6,15,2,17],[55,6,16,2,1],[75,7,15,2,32],[75,7,16,2,2],
  [223,13,16,3,223],[223,13,17,3,22],[140,15,16,3,140],[140,15,17,3,14],
  [99,9,17,4,42],[99,9,18,4,3],[97,10,17,4,55],[97,10,18,4,4]
 ];
 for(const [base,mob,level,cleared,xp]of newProgressFixtures)assert.equal(R.estimate(base,mob,level,{highestClearedFloor:cleared}).value,xp);
 assert.equal(R.estimate(1404,59,62,{highestClearedFloor:0}).extra,.1,'Extra XP reduction can apply below Lv63');
 assert.equal(R.estimate(1404,59,62,cleared40).extra,1,'Same character level depends on actual progression');
 for(const [base,mob,level]of [[-1,44,58],[NaN,44,58],[Infinity,44,58],[100,null,58],[100,0,58],[100,44,null],[100,44,121]])assert.equal(R.estimate(base,mob,level,cleared40),null);
 assert.equal(R.estimate(100,53,58,cleared40).multiplier,1);
 assert.equal(R.estimate(100,52,58,cleared40).multiplier,.75);
 assert.equal(R.estimate(1000,37,58,cleared40).floorApplied,false);
 assert.equal(R.estimate(1000,36,58,cleared40).floorApplied,true);
 assert.equal(R.estimate(100,1,120,cleared40).value,0);
 assert.equal(R.estimate(20,7,58,cleared40).value,0);
 assert.equal(R.formatMultiplier(.75),'75%');assert.equal(R.formatMultiplier(1),'100%');
 assert.match(R.formatMultiplier(1e-20),/小於/);
 assert.match(R.valueHtml(100,null,58,false,cleared40),/等級未知/);
 assert.match(R.valueHtml(100,44,null,false,cleared40),/先填角色等級/);
 const partyFixtures=[[58,5,1115,914],[62,5,836,914],[63,5,63,914],[58,6,968,794],[62,6,726,794],[63,6,54,794],[63,1,261,3810]];
 for(const [level,n,xp,col]of partyFixtures){const settings={...cleared40,participants:n};assert.equal(R.estimate(4644,56,level,settings).value,xp);assert.equal(R.estimateCol(3810,56,level,settings),col)}
 assert.equal(R.estimate(1000,37,58,{...cleared40,participants:6}).value,2);
 assert.equal(R.estimateCol(3810,56,58,{participants:6}),794);
 for(const n of [0,7,1.5,NaN])assert.equal(R.estimate(100,1,1,{...cleared40,participants:n}),null);
 // Existing party rule stays provisional; progress selector cannot change cash or party settings.
 assert.equal(R.estimateCol(100,51,40,{participants:2}),26);
 assert.equal(R.estimateCol(100,50,40,{participants:2}),53);
 assert.equal(R.estimateCol(1000,null,40,{participants:2}),null);
 assert.equal(R.estimateCol(1000,null,null,{participants:1}),1000);
 assert.equal(R.estimateCol(-1),null);
 const regions=[{floor:37,monsters:[{level:49,exp:590,col:90,spawnWeight:3},{level:50,exp:1144,col:73,spawnWeight:2}]},{floor:38,monsters:[{level:50,exp:1144,col:73,spawnWeight:3},{level:51,exp:379,col:56,spawnWeight:2}]}];
 const snapshot=JSON.stringify(regions);
 assert.equal(R.areaScore(regions[0],'estimatedExp',56,cleared40),542.4);
 assert.equal(R.areaScore(regions[1],'estimatedExp',56,cleared40),666.4);
 assert.deepEqual(R.rankAreas(regions,'estimatedExp',56,cleared40).map(a=>a.floor),[38,37]);
 assert.equal(R.areaScore(regions[1],'estimatedExp',56,zero),66.8,'Rank by per-monster rounded XP under selected progress');
 assert.equal(R.areaScore(regions[1],'estimatedExp',56),null);
 assert.equal(R.areaScore({monsters:[{exp:99999,levelHidden:true,level:1}]},'estimatedExp',56,cleared40),null);
 assert.equal(R.areaScore({monsters:[{exp:10},{exp:20}]},'exp',56),null);
 assert.equal(JSON.stringify(regions),snapshot);
 const formula=R.formulaHtml(63,{...cleared40,participants:6});
 assert.match(formula,/13 ＋ 四捨五入（最高已通關樓層 × 1.25）/);
 assert.doesNotMatch(formula,/無條件捨去|固定 Lv63|候選公式/);assert.match(formula,/× 100% × 10%/);
 assert.match(formula,/75% \^ 較大值（0，你的等級 − 怪物等級 − 5）/);
 assert.match(R.formulaHtml(26),/請先選最高攻略進度/);
 assert.doesNotMatch(R.formulaHtml(26),/｝＝ 0/,'Missing progress must not produce false zero XP');
 const panel=R.panel(13,zero);
 assert.match(panel,/<select id="reward-progress"/);assert.match(panel,/<option value="0" selected>第1層（尚未通關）/);
 assert.doesNotMatch(panel,/type="checkbox"|details[^>]*open|折減依等級自動判斷/);
 assert.equal(R.formulaHtml(63,{...cleared40,expReduction:false}),R.formulaHtml(63,cleared40),'Legacy flags cannot override progress');
 return {observedXpFixtures:fixtures.length,observedPartyFixtures:partyFixtures.length,progressThresholds:thresholds.length,thresholdBoundaryCases:thresholds.length*3,zeroClearUpgradeObservations:6,progressObservations:9,unknownProgressChecks:5,weightedAreaSortChecks:6};
};
