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
 return {levelBoundaries:13,comparisons:5,queryLevels:2};
};
