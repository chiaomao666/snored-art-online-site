(function(root){
 'use strict';
 const slots=['weapon','offhand','head','armor','feet','neck','accessory','ring2'];
 const names={weapon:'主手',offhand:'副手',head:'頭部',armor:'身體',feet:'鞋子',neck:'項鍊',accessory:'戒指一',ring2:'戒指二'};
 const directionsInfo={sharp:['鋒利','攻擊'],quick:['快速','武器攻速'],acc:['準確','爆擊率'],hard:['堅固','防禦'],thick:['厚實','HP'],light:['輕盈','敏捷'],vital:['活力','HP'],swift:['迅捷','敏捷'],fatal:['致命','爆擊傷害']};
 const hpPoints=[[1,200],[40,6500],[48,7700],[70,9900],[78,11255],[96,14300],[120,17800]];
 const storyChapters=[{"id":"prologue","number":0,"name":"被困者","title":"序章　被困者","perks":{}},{"id":"ch1","number":1,"name":"森林的秘藥","title":"第1章　森林的秘藥","perks":{}},{"id":"ch2","number":2,"name":"攻略會議","title":"第2章　攻略會議","perks":{}},{"id":"ch3","number":3,"name":"體術","title":"第3章　體術","perks":{"atk":0.02}},{"id":"ch4","number":4,"name":"鐵匠的秘密","title":"第4章　鐵匠的秘密","perks":{}},{"id":"elf1","number":5,"name":"驚靈戰爭（一）","title":"第5章　驚靈戰爭（一）","perks":{}},{"id":"canal","number":6,"name":"水都的船","title":"第6章　水都的船","perks":{}},{"id":"elf2","number":7,"name":"驚靈戰爭（二）","title":"第7章　驚靈戰爭（二）","perks":{}},{"id":"ruins","number":8,"name":"遺跡的旗子","title":"第8章　遺跡的旗子","perks":{}},{"id":"puzzle","number":9,"name":"無厘頭的謎題","title":"第9章　無厘頭的謎題","perks":{}},{"id":"casino","number":10,"name":"賭城的競技場","title":"第10章　賭城的競技場","perks":{}},{"id":"elf3","number":11,"name":"驚靈戰爭（三）","title":"第11章　驚靈戰爭（三）","perks":{}},{"id":"samurai","number":12,"name":"武士城的試煉","title":"第12章　武士城的試煉","perks":{}},{"id":"kuro1","number":13,"name":"月夜黑毛團","title":"第13章　月夜黑毛團","perks":{}},{"id":"s12","number":14,"name":"泥裡的仙人","title":"第14章　泥裡的仙人","perks":{}},{"id":"s13","number":15,"name":"餓霸的蛋","title":"第15章　餓霸的蛋","perks":{}},{"id":"s14","number":16,"name":"坑道裡的勇者們","title":"第16章　坑道裡的勇者們","perks":{}},{"id":"s15","number":17,"name":"鍋爐爺的火","title":"第17章　鍋爐爺的火","perks":{}},{"id":"s16","number":18,"name":"蜃樓","title":"第18章　蜃樓","perks":{}},{"id":"s17","number":19,"name":"沙中的足跡","title":"第19章　沙中的足跡","perks":{}},{"id":"s18","number":20,"name":"橋下的女孩","title":"第20章　橋下的女孩","perks":{}},{"id":"s19","number":21,"name":"長毛象拔蚌","title":"第21章　長毛象拔蚌","perks":{}},{"id":"s20","number":22,"name":"越級","title":"第22章　越級","perks":{}},{"id":"s21","number":23,"name":"封印的火","title":"第23章　封印的火","perks":{}},{"id":"yui","number":24,"name":"朝露的女孩","title":"第24章　朝露的女孩","perks":{"hp":0.05}},{"id":"lake","number":25,"name":"湖之主","title":"第25章　湖之主","perks":{"regen":0.05}},{"id":"s23","number":26,"name":"無名的騎士","title":"第26章　無名的騎士","perks":{}},{"id":"s24","number":27,"name":"屍蘭的僕人","title":"第27章　屍蘭的僕人","perks":{}},{"id":"quarter","number":28,"name":"四分之一","title":"第28章　四分之一","perks":{}},{"id":"s26","number":29,"name":"血萌","title":"第29章　血萌","perks":{}},{"id":"kuro2","number":30,"name":"黑毛團的記憶","title":"第30章　黑毛團的記憶","perks":{}},{"id":"s28","number":31,"name":"黑狼","title":"第31章　黑狼","perks":{}},{"id":"s29","number":32,"name":"笑著的人","title":"第32章　笑著的人","perks":{}},{"id":"s30","number":33,"name":"龍谷","title":"第33章　龍谷","perks":{}},{"id":"s31","number":34,"name":"霧中的信","title":"第34章　霧中的信","perks":{}},{"id":"s32","number":35,"name":"水晶的心","title":"第35章　水晶的心","perks":{}},{"id":"s33","number":36,"name":"風的信差","title":"第36章　風的信差","perks":{}},{"id":"s34","number":37,"name":"停下的鐘","title":"第37章　停下的鐘","perks":{}},{"id":"silica","number":38,"name":"迷兔森林","title":"第38章　迷兔森林","perks":{}},{"id":"nicholas","number":39,"name":"叛教者","title":"第39章　叛教者","perks":{}},{"id":"s36","number":40,"name":"深夜的歌","title":"第40章　深夜的歌","perks":{}},{"id":"s37","number":41,"name":"沉船","title":"第41章　沉船","perks":{}},{"id":"s38","number":42,"name":"古堡的晚宴","title":"第42章　古堡的晚宴","perks":{}},{"id":"s39","number":43,"name":"腳動不了的騎士","title":"第43章　腳動不了的騎士","perks":{}},{"id":"s40","number":44,"name":"希望之歌","title":"第44章　希望之歌","perks":{}}];
 function storyPerks(chapter){const out={atk:0,hp:0,regen:0},index=storyChapters.findIndex(c=>c.id===chapter);if(index<0)return out;for(const c of storyChapters.slice(0,index+1))for(const [k,v]of Object.entries(c.perks))out[k]=(out[k]||0)+v;return out}
 const defaults={dualSpeed:.05,zekkenCrit:.05,battoAtk:0,smithAtk:.05,smithBlock:.08,smithEnhEffect:.25};
 const number=(x,fallback=0,min=0,max=1e6)=>Number.isFinite(Number(x))?Math.min(max,Math.max(min,Number(x))):fallback;
 const integer=(x,fallback=0,min=0,max=1e6)=>Math.floor(number(x,fallback,min,max));
 const dirs=item=>item.weaponType?['sharp','quick','acc']:['neck','accessory','ring2'].includes(item.slot)?['vital','swift','fatal']:['hard','thick','light'];
 const smithEligible=item=>!!item&&(item.weaponType==='mace'||item.shield);
 const maxPlus=(item,smith=false)=>({'一般':4,'精良':6,'稀有':8,'專名':10}[item.quality]??4)+(smith&&smithEligible(item)?3:0);
 function hp(level){let i=hpPoints.findIndex(p=>p[0]>=level);if(i<=0)return hpPoints[i<0?hpPoints.length-1:0][1];let [l,a]=hpPoints[i-1],[h,b]=hpPoints[i];return a+(b-a)*(level-l)/(h-l)}
 function baseStats(level){level=integer(level,40,1,120);let scale=1+.007857*Math.pow(level-1,1.5),defScale=hp(level)/((90+22*(level-1))*scale);return {maxHp:Math.round(hp(level)),atk:Math.round((10+2.6*(level-1))*scale),def:Math.round((4+1.3*(level-1))*scale*defScale),agi:10+level-1,crit:.05,critDmg:0,evade:0,block:0}}
 function enhance(item,gear={},smithEffect=.25){
  const bonus={...item.bonus},level=item.reqLevel||1,enh=gear.enh||{},valid=dirs(item);
  const count=k=>valid.includes(k)?integer(enh[k],0,0,13)*(gear.smith&&smithEligible(item)?1+number(smithEffect,.25,0,2):1):0;
  const scale=(base,n)=>Math.max(Math.round(n),Math.round((base||0)*.12*n));
  const agiStep=Math.max(2,Math.round(2+level*.08)),hpStep=Math.max(10,Math.round(baseStats(level).maxHp*.03));
  for(const k of valid){const n=count(k);if(!n)continue;
   if(k==='sharp')bonus.atk=(bonus.atk||0)+scale(bonus.atk,n);
   if(k==='acc')bonus.crit=(bonus.crit||0)+.03*n;
   if(k==='hard')bonus.def=(bonus.def||0)+scale(bonus.def,n);
   if(k==='thick')bonus.maxHp=(bonus.maxHp||0)+Math.round(Math.max(Math.round((item.bonus.maxHp||0)*.12),hpStep)*n);
   if(k==='light'||k==='swift')bonus.agi=(bonus.agi||0)+Math.round(agiStep*n);
   if(k==='vital')bonus.maxHp=(bonus.maxHp||0)+Math.round(hpStep*n);
   if(k==='fatal')bonus.critDmg=(bonus.critDmg||0)+.08*n;
  }
  return {...item,bonus,plus:valid.reduce((sum,k)=>sum+integer(enh[k],0,0,13),0),...(count('quick')?{speed:Math.round((item.speed??100)+4*count('quick'))}:{})};
 }
 function empty(){return {version:3,level:40,storyChapter:'none',slots:Object.fromEntries(slots.map(s=>[s,{id:'',enh:{},smith:false,preset:'balanced'}])),unique:{},perks:{atk:0,hp:0,regen:0},params:{...defaults},hitRate:.95}}
 function offhandAllowed(item,main,unique={}){if(!item||!main)return false;if(main.weaponType==='axe'||main.weaponType==='katana'&&unique.katana)return false;return item.shield||main.weaponType==='sword'&&unique.sword&&item.weaponType==='sword'}
 function normalize(input,items){
  const s=empty(),map=new Map(items.map(x=>[x.id,x]));input=input&&typeof input==='object'?input:{};
  s.level=integer(input.level,40,1,120);s.hitRate=number(input.hitRate,.95,0,.95);
  for(const style of ['sword','rapier','katana','axe','mace'])s.unique[style]=input.unique?.[style]===true;
  if((input.version??1)<3&&Object.values(input.slots||{}).some(g=>g?.smith===true&&smithEligible(map.get(g.id))))s.unique.mace=true;
  s.storyChapter=storyChapters.some(c=>c.id===input.storyChapter)?input.storyChapter:'none';s.perks=storyPerks(s.storyChapter);
  for(const k of Object.keys(defaults))s.params[k]=number(input.params?.[k],defaults[k],0,2);
  for(const slot of slots){const g=input.slots?.[slot],item=map.get(g?.id);if(!item)continue;
   if(slot==='weapon'&&!item.weaponType||slot==='offhand'&&!(item.shield||item.weaponType==='sword')||!['weapon','offhand'].includes(slot)&&item.slot!==(slot==='ring2'?'accessory':slot))continue;
   const smith=s.unique.mace&&smithEligible(item),enh={},allowed=dirs(item);let left=maxPlus(item,smith);
   for(const k of allowed){enh[k]=integer(g.enh?.[k],0,0,left);left-=enh[k]}
   s.slots[slot]={id:item.id,enh,smith,preset:['balanced','custom',...allowed].includes(g.preset)?g.preset:'balanced'};
  }
  if(s.slots.offhand.id&&!offhandAllowed(map.get(s.slots.offhand.id),map.get(s.slots.weapon.id),s.unique))s.slots.offhand={id:'',enh:{},smith:false,preset:'balanced'};
  return s;
 }
 function calculate(items,input){
  const state=normalize(input,items),map=new Map(items.map(x=>[x.id,x])),base=baseStats(state.level),stats={...base},gear={},equipmentBonus={maxHp:0,atk:0,def:0,agi:0,crit:0,critDmg:0,evade:0,block:0},warnings=[];
  for(const slot of slots){let item=map.get(state.slots[slot].id);if(!item)continue;item=enhance(item,state.slots[slot],state.params.smithEnhEffect);gear[slot]=item;
   if(item.reqLevel>state.level)warnings.push(`${names[slot]}「${item.name}」需求 Lv${item.reqLevel}，目前角色 Lv${state.level}；此配裝暫時無法在遊戲中使用。`);
   const factor=slot==='offhand'&&!item.shield?.6:1;
   for(const key of Object.keys(equipmentBonus)){let value=(item.bonus[key]||0)*factor;if(['atk','def','maxHp','agi'].includes(key))value=Math.round(value);stats[key]+=value;equipmentBonus[key]+=value}
  }
  stats.evade=Math.min(.28,Math.max(0,stats.evade));
  const main=gear.weapon,off=gear.offhand,style=main?.weaponType,active=state.unique[style]?style:null,passives=[];
  let multiplier=(main?.speed??100)/100;if(off?.slow&&style!=='mace')multiplier*=1-off.slow;
  if(active==='sword'&&off?.weaponType==='sword'){multiplier*=1+state.params.dualSpeed;passives.push(`二刀流：攻速 +${state.params.dualSpeed*100}%`)}
  if(active==='rapier'){stats.crit+=state.params.zekkenCrit;passives.push(`絕健：爆擊率 +${state.params.zekkenCrit*100}%`)}
  if(active==='katana'){stats.atk=Math.round(stats.atk*(1+state.params.battoAtk));passives.push(`拔刀術：攻擊 +${state.params.battoAtk*100}%`)}
  if(active==='mace'){stats.atk=Math.round(stats.atk*(1+state.params.smithAtk));stats.block+=state.params.smithBlock;passives.push(`匠魂：攻擊 +${state.params.smithAtk*100}%、格擋 +${state.params.smithBlock*100}%`)}
  if(state.perks.atk)stats.atk=Math.round(stats.atk*(1+state.perks.atk));if(state.perks.hp)stats.maxHp=Math.round(stats.maxHp*(1+state.perks.hp));
  const effective=stats.agi<=0?stats.agi:250*Math.tanh(stats.agi/250),interval=Math.max(400,Math.round(2200*(100/(100+effective*1.5))/multiplier));
  return {state,base,gear,equipmentBonus,stats:{...stats,critDamage:1.6+stats.critDmg,attackSpeed:Math.round(200000/interval),interval,weaponSpeed:main?.speed??100,regen:60*baseStats(state.level).maxHp/11255*(1+state.perks.regen),hitRate:state.hitRate,moveSpeed:100},multiplier,warnings,passives};
 }
 const api={storyChapters,storyPerks,slots,names,directionsInfo,defaults,dirs,smithEligible,maxPlus,baseStats,enhance,empty,normalize,calculate,offhandAllowed};root.BuildGuide=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
