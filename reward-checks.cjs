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
 assert.match(R.valueHtml(100,44,58,true),/頭目僅供公式參考/);
 assert.match(R.valueHtml(100,null,58),/等級未知/);
 assert.match(R.valueHtml(100,44,null),/先填角色等級/);
 assert.equal(R.formatMultiplier(.75),'75%');
 assert.equal(R.formatMultiplier(1),'100%');
 assert.match(R.formatMultiplier(1e-20),/小於/);
 assert.equal(R.sortValue({exp:99999,level:1,levelHidden:true},58),-1);
 assert.equal(R.sortValue({exp:0,level:44},58),0);
 return {levelBoundaries:13,comparisons:5,queryLevels:2,observedXpFixtures:fixtures.length,formulaBoundaryChecks:6,invalidFormulaInputs:7,estimateDisplayChecks:8};
};
