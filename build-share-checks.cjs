const assert=require('node:assert/strict'),B=require('./build-engine.js');
module.exports=function(items){
 let cases=0;
 const roundtrip=input=>{const normalized=B.normalize(input,items),code=B.encodeShare(input,items),result=B.decodeShare(code,items);assert.deepEqual(result,normalized);assert.deepEqual(B.calculate(items,result),B.calculate(items,normalized));cases++;return code};
 const blank=roundtrip(B.empty());assert.equal(blank,'1.KAAAAACVGw');assert.ok(blank.length<20);
 let state=B.empty();state.level=58;state.storyChapter='s40';
 for(const [slot,name]of [['weapon','冰淇霖劍'],['offhand','死背巨人的頓'],['head','無名重虧'],['armor','巨鞋皇帝的鎧假'],['feet','疾風跑邪'],['accessory','黑毛的護身芙'],['ring2','壺之主的鱗芥']]){
  const item=items.find(x=>x.name===name);assert(item);state.slots[slot]={id:item.id,enh:Object.fromEntries(B.dirs(item).map((d,i)=>[d,[3,2,1][i]])),preset:'custom'};
 }
 const example=roundtrip(state),legacy=encodeURIComponent(JSON.stringify(B.normalize(state,items)));
 assert.ok(example.length<80);assert.ok(example.length<legacy.length*.15);
 assert.deepEqual(B.decodeShare(JSON.stringify(state),items),B.normalize(state,items));
 assert.equal(B.encodeShare(state,[...items].reverse()),example,'Item order must not affect durable share IDs');
 state.params={dualSpeed:.123456789,zekkenCrit:.035,battoAtk:2,smithAtk:0,smithBlock:.123,smithEnhEffect:.251};state.hitRate=.87321;roundtrip(state);
 for(const chapter of ['none',...B.storyChapters.map(c=>c.id)])roundtrip({...state,storyChapter:chapter});
 for(const weaponType of ['sword','rapier','katana','axe','mace']){
  const item=items.find(x=>x.weaponType===weaponType),s=B.empty();s.unique={sword:true,rapier:true,katana:true,axe:true,mace:true};s.slots.weapon={id:item.id,enh:{},preset:'balanced'};
  for(const preset of ['balanced',...B.dirs(item),'custom']){
   s.slots.weapon={id:item.id,enh:{[B.dirs(item)[0]]:B.maxPlus(item,B.smithEligible(item))},preset};roundtrip(s);
  }
 }
 // All catalog entries, including both ring slots; normalize validates legal offhand combinations.
 const sword=items.find(x=>x.weaponType==='sword');
 for(const item of items){
  const s=B.empty();s.unique.sword=true;s.unique.mace=true;s.level=120;
  const slot=item.weaponType?'weapon':item.shield?'offhand':item.slot==='accessory'?'ring2':item.slot;
  if(!B.slots.includes(slot))continue;
  if(slot==='offhand')s.slots.weapon.id=sword.id;
  s.slots[slot]={id:item.id,enh:{[B.dirs(item)[2]]:B.maxPlus(item,B.smithEligible(item))},preset:'custom'};roundtrip(s);
 }
 // Future item IDs outside the frozen dictionary use inline encoding rather than reassign existing IDs.
 const future={...sword,id:'future-test-劍'};const futureState=B.empty();futureState.slots.weapon.id=future.id;
 const futureCode=B.encodeShare(futureState,[future]);assert.equal(B.decodeShare(futureCode,[future]).slots.weapon.id,future.id);
 assert.throws(()=>B.decodeShare(futureCode,items));
 for(const bad of ['', '2.AAAAAA','1.A','1.***',example.slice(0,-3),example+'A','1.'+'A'.repeat(4097),'{}invalid'])assert.throws(()=>B.decodeShare(bad,items));
 const flipped=example.slice(0,-2)+(example.at(-2)==='A'?'B':'A')+example.at(-1);assert.throws(()=>B.decodeShare(flipped,items));
 const photo=B.decodeShare('1.Qy0f_wCIAQgQvQOBQLoDADd_UkCCAQA3ygIANGwAOGwAOHPd',items);
 photo.buffs=['war-cry','flurry','insight'];photo.slots.offhand.smithEnh={hard:0,thick:3,light:0};photo.slots.armor.enh={hard:3,thick:4,light:0};
 const extended=roundtrip(photo);assert(extended.startsWith('2.'));assert(extended.length<90);
 for(const b of B.buffDefinitions)roundtrip({...photo,buffs:[b.id]});
 const oldExtended=B.decodeShare('2.Qy0f_wCIAQgQvQOBQLoDADd_Q0CCAQA3ygIANGwAOGwAODEAAjAAQFk',items);assert(!('smithEnh' in oldExtended.slots.offhand));assert.deepEqual(oldExtended.buffs,photo.buffs);assert.deepEqual(oldExtended.slots.armor.enh,photo.slots.armor.enh);assert.equal(B.encodeShare(oldExtended,items),extended);roundtrip(oldExtended);
 const broken=extended.slice(0,-2)+(extended.at(-2)==='A'?'B':'A')+extended.at(-1);assert.throws(()=>B.decodeShare(broken,items));
 return {roundtripCases:cases,extendedStateRoundtrips:17,legacyCompatibility:2,corruptInputChecks:9,stableCatalogOrder:1,futureItemEscape:1,exampleCodeLength:example.length,legacyPayloadLength:legacy.length};
};
