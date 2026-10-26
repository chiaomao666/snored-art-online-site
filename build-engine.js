(function(root){
 'use strict';
 const slots=['weapon','offhand','head','armor','feet','neck','accessory','ring2'];
 const names={weapon:'主手',offhand:'副手',head:'頭部',armor:'身體',feet:'鞋子',neck:'項鍊',accessory:'戒指一',ring2:'戒指二'};
 const directionsInfo={sharp:['鋒利','攻擊'],quick:['快速','武器攻速'],acc:['準確','爆擊率'],hard:['堅固','防禦'],thick:['厚實','HP'],light:['輕盈','敏捷'],vital:['活力','HP'],swift:['迅捷','敏捷'],fatal:['致命','爆擊傷害']};
 const hpPoints=[[1,200],[40,6500],[48,7700],[70,9900],[78,11255],[96,14300],[120,17800]];
 const storyChapters=[{"id":"prologue","number":0,"name":"被困者","title":"序章　被困者","perks":{}},{"id":"ch1","number":1,"name":"森林的秘藥","title":"第1章　森林的秘藥","perks":{}},{"id":"ch2","number":2,"name":"攻略會議","title":"第2章　攻略會議","perks":{}},{"id":"ch3","number":3,"name":"體術","title":"第3章　體術","perks":{"atk":0.02}},{"id":"ch4","number":4,"name":"鐵匠的秘密","title":"第4章　鐵匠的秘密","perks":{}},{"id":"elf1","number":5,"name":"驚靈戰爭（一）","title":"第5章　驚靈戰爭（一）","perks":{}},{"id":"canal","number":6,"name":"水都的船","title":"第6章　水都的船","perks":{}},{"id":"elf2","number":7,"name":"驚靈戰爭（二）","title":"第7章　驚靈戰爭（二）","perks":{}},{"id":"ruins","number":8,"name":"遺跡的旗子","title":"第8章　遺跡的旗子","perks":{}},{"id":"puzzle","number":9,"name":"無厘頭的謎題","title":"第9章　無厘頭的謎題","perks":{}},{"id":"casino","number":10,"name":"賭城的競技場","title":"第10章　賭城的競技場","perks":{}},{"id":"elf3","number":11,"name":"驚靈戰爭（三）","title":"第11章　驚靈戰爭（三）","perks":{}},{"id":"samurai","number":12,"name":"武士城的試煉","title":"第12章　武士城的試煉","perks":{}},{"id":"kuro1","number":13,"name":"月夜黑毛團","title":"第13章　月夜黑毛團","perks":{}},{"id":"s12","number":14,"name":"泥裡的仙人","title":"第14章　泥裡的仙人","perks":{}},{"id":"s13","number":15,"name":"餓霸的蛋","title":"第15章　餓霸的蛋","perks":{}},{"id":"s14","number":16,"name":"坑道裡的勇者們","title":"第16章　坑道裡的勇者們","perks":{}},{"id":"s15","number":17,"name":"鍋爐爺的火","title":"第17章　鍋爐爺的火","perks":{}},{"id":"s16","number":18,"name":"蜃樓","title":"第18章　蜃樓","perks":{}},{"id":"s17","number":19,"name":"沙中的足跡","title":"第19章　沙中的足跡","perks":{}},{"id":"s18","number":20,"name":"橋下的女孩","title":"第20章　橋下的女孩","perks":{}},{"id":"s19","number":21,"name":"長毛象拔蚌","title":"第21章　長毛象拔蚌","perks":{}},{"id":"s20","number":22,"name":"越級","title":"第22章　越級","perks":{}},{"id":"s21","number":23,"name":"封印的火","title":"第23章　封印的火","perks":{}},{"id":"yui","number":24,"name":"朝露的女孩","title":"第24章　朝露的女孩","perks":{"hp":0.05}},{"id":"lake","number":25,"name":"湖之主","title":"第25章　湖之主","perks":{"regen":0.05}},{"id":"s23","number":26,"name":"無名的騎士","title":"第26章　無名的騎士","perks":{}},{"id":"s24","number":27,"name":"屍蘭的僕人","title":"第27章　屍蘭的僕人","perks":{}},{"id":"quarter","number":28,"name":"四分之一","title":"第28章　四分之一","perks":{}},{"id":"s26","number":29,"name":"血萌","title":"第29章　血萌","perks":{}},{"id":"kuro2","number":30,"name":"黑毛團的記憶","title":"第30章　黑毛團的記憶","perks":{}},{"id":"s28","number":31,"name":"黑狼","title":"第31章　黑狼","perks":{}},{"id":"s29","number":32,"name":"笑著的人","title":"第32章　笑著的人","perks":{}},{"id":"s30","number":33,"name":"龍谷","title":"第33章　龍谷","perks":{}},{"id":"s31","number":34,"name":"霧中的信","title":"第34章　霧中的信","perks":{}},{"id":"s32","number":35,"name":"水晶的心","title":"第35章　水晶的心","perks":{}},{"id":"s33","number":36,"name":"風的信差","title":"第36章　風的信差","perks":{}},{"id":"s34","number":37,"name":"停下的鐘","title":"第37章　停下的鐘","perks":{}},{"id":"silica","number":38,"name":"迷兔森林","title":"第38章　迷兔森林","perks":{}},{"id":"nicholas","number":39,"name":"叛教者","title":"第39章　叛教者","perks":{}},{"id":"s36","number":40,"name":"深夜的歌","title":"第40章　深夜的歌","perks":{}},{"id":"s37","number":41,"name":"沉船","title":"第41章　沉船","perks":{}},{"id":"s38","number":42,"name":"古堡的晚宴","title":"第42章　古堡的晚宴","perks":{}},{"id":"s39","number":43,"name":"腳動不了的騎士","title":"第43章　腳動不了的騎士","perks":{}},{"id":"s40","number":44,"name":"希望之歌","title":"第44章　希望之歌","perks":{}}];
 function storyPerks(chapter){const out={atk:0,hp:0,regen:0},index=storyChapters.findIndex(c=>c.id===chapter);if(index<0)return out;for(const c of storyChapters.slice(0,index+1))for(const [k,v]of Object.entries(c.perks))out[k]=(out[k]||0)+v;return out}
 // Share format 2 uses the following buff order: append only; never reorder existing entries.
 const buffDefinitions=[{"id":"war-cry","style":"sword","party":true,"reqLevel":10,"effect":{"atk":0.12},"name":"鬼叫"},{"id":"focus","style":"sword","party":false,"reqLevel":15,"effect":{"crit":0.15,"critDmg":0.4},"name":"瞪神"},{"id":"rally","style":"sword","party":true,"reqLevel":32,"effect":{"atk":0.06,"taken":0.06},"name":"揪團"},{"id":"gale-song","style":"rapier","party":true,"reqLevel":10,"effect":{"speed":0.12},"name":"疾風之哥"},{"id":"flurry","style":"rapier","party":false,"reqLevel":15,"effect":{"speed":0.3},"name":"疾刺"},{"id":"insight","style":"rapier","party":true,"reqLevel":32,"effect":{"crit":0.06,"critDmg":0.15},"name":"看破紅塵"},{"id":"cheer","style":"katana","party":true,"reqLevel":10,"effect":{"crit":0.08},"name":"打鼓舞"},{"id":"iai","style":"katana","party":false,"reqLevel":15,"effect":{"atk":0.3},"name":"蓄刀待發"},{"id":"kiai","style":"katana","party":true,"reqLevel":32,"effect":{"critDmg":0.25},"name":"起鬨"},{"id":"daunt","style":"axe","party":true,"reqLevel":10,"effect":{"taken":0.1},"name":"嚇嚇叫"},{"id":"berserk","style":"axe","party":false,"reqLevel":15,"effect":{"atk":0.4,"def":-0.2},"name":"亂砍一通"},{"id":"warpath","style":"axe","party":true,"reqLevel":32,"effect":{"atk":0.08,"crit":0.04},"name":"血脈噴張"},{"id":"guard-oath","style":"mace","party":true,"reqLevel":10,"effect":{"taken":0.12},"name":"發誓不跑"},{"id":"stone-skin","style":"mace","party":false,"reqLevel":15,"effect":{"def":0.3,"taken":0.15,"atk":0.15},"name":"臉皮厚"},{"id":"bulwark","style":"mace","party":true,"reqLevel":32,"effect":{"def":0.2},"name":"鐵壁之陣痛"}];
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
  const count=k=>{if(!valid.includes(k))return 0;const n=integer(enh[k],0,0,13),smith=gear.smith&&smithEligible(item)?gear.smithEnh?integer(gear.smithEnh[k],0,0,n):n:0;return n+smith*number(smithEffect,.25,0,2)};
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
 function empty(){return {version:3,level:40,storyChapter:'none',slots:Object.fromEntries(slots.map(s=>[s,{id:'',enh:{},smith:false,preset:'balanced'}])),unique:{},buffs:[],perks:{atk:0,hp:0,regen:0},params:{...defaults},hitRate:.95}}
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
   s.slots[slot]={id:item.id,enh,smith,...(smith&&g.smithEnh&&typeof g.smithEnh==='object'?{smithEnh:Object.fromEntries(allowed.map(k=>[k,integer(g.smithEnh[k],0,0,enh[k])]))}:{}),preset:['balanced','custom',...allowed].includes(g.preset)?g.preset:'balanced'};
  }
  if(s.slots.offhand.id&&!offhandAllowed(map.get(s.slots.offhand.id),map.get(s.slots.weapon.id),s.unique))s.slots.offhand={id:'',enh:{},smith:false,preset:'balanced'};
  const style=map.get(s.slots.weapon.id)?.weaponType;
  s.buffs=buffDefinitions.filter(b=>Array.isArray(input.buffs)&&input.buffs.includes(b.id)&&(b.party||b.style===style)).map(b=>b.id);
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
  const activeBuffs=buffDefinitions.filter(b=>state.buffs.includes(b.id)).map(b=>{const enhanced=!b.party&&state.unique[b.style];return {...b,enhanced,effect:Object.fromEntries(Object.entries(b.effect).map(([k,v])=>[k,v>0?Math.round(v*(enhanced?1.3:1)*100)/100:v]))}}),buffEffects={};
  for(const b of activeBuffs){for(const [k,v]of Object.entries(b.effect))buffEffects[k]=(buffEffects[k]||0)+v;if(!b.party&&state.level<b.reqLevel)warnings.push(`自身增益「${b.name}」需求 Lv${b.reqLevel}，目前僅供未來配裝規劃。`)}
  if(buffEffects.atk)stats.atk=Math.round(stats.atk*(1+buffEffects.atk));if(buffEffects.def)stats.def=Math.round(stats.def*(1+buffEffects.def));stats.crit+=buffEffects.crit||0;stats.critDmg+=buffEffects.critDmg||0;multiplier*=1+(buffEffects.speed||0);
  const effective=stats.agi<=0?stats.agi:250*Math.tanh(stats.agi/250),interval=Math.max(400,Math.round(2200*(100/(100+effective*1.5))/multiplier));
  return {state,base,gear,equipmentBonus,activeBuffs,buffEffects,stats:{...stats,critDamage:1.6+stats.critDmg,attackSpeed:Math.round(200000/interval),interval,weaponSpeed:main?.speed??100,regenBase:60*baseStats(state.level).maxHp/11255,regen:60*baseStats(state.level).maxHp/11255*(1+state.perks.regen),hitRate:state.hitRate,moveSpeed:100},multiplier,warnings,passives};
 }
 // Share format 1: these dictionaries are frozen. Never reorder/remove entries;
 // new item IDs use the inline-ID escape, so data-file reordering cannot break old links.
 const shareItems=["acc-t1","acc-t10","acc-t15","acc-t20","acc-t25","acc-t30","acc-t35","acc-t40","acc-t5","anneal-blade","armor-t1","armor-t10","armor-t15","armor-t20","armor-t25","armor-t30","armor-t35","armor-t40","armor-t5","axe-t1","axe-t10","axe-t15","axe-t20","axe-t25","axe-t30","axe-t35","axe-t40","axe-t5","bloom-axe","bloom-katana","bloom-mace","bloom-rapier","boss-f1","boss-f1-b","boss-f1-c","boss-f10","boss-f10-b","boss-f10-c","boss-f11","boss-f11-b","boss-f11-c","boss-f12","boss-f12-b","boss-f12-c","boss-f13","boss-f13-b","boss-f13-c","boss-f14","boss-f14-b","boss-f14-c","boss-f15","boss-f15-b","boss-f15-c","boss-f16","boss-f16-b","boss-f16-c","boss-f17","boss-f17-b","boss-f17-c","boss-f18","boss-f18-b","boss-f18-c","boss-f19","boss-f19-b","boss-f19-c","boss-f2","boss-f2-b","boss-f2-c","boss-f20","boss-f20-b","boss-f20-c","boss-f21","boss-f21-b","boss-f21-c","boss-f22","boss-f22-b","boss-f22-c","boss-f23","boss-f23-b","boss-f23-c","boss-f24","boss-f24-b","boss-f24-c","boss-f25","boss-f25-b","boss-f25-c","boss-f26","boss-f26-b","boss-f26-c","boss-f27","boss-f27-b","boss-f27-c","boss-f28","boss-f28-b","boss-f28-c","boss-f29","boss-f29-b","boss-f29-c","boss-f3","boss-f3-b","boss-f3-c","boss-f30","boss-f30-b","boss-f30-c","boss-f31","boss-f31-b","boss-f31-c","boss-f32","boss-f32-b","boss-f32-c","boss-f33","boss-f33-b","boss-f33-c","boss-f34","boss-f34-b","boss-f34-c","boss-f35","boss-f35-b","boss-f35-c","boss-f36","boss-f36-b","boss-f36-c","boss-f37","boss-f37-b","boss-f37-c","boss-f38","boss-f38-b","boss-f38-c","boss-f39","boss-f39-b","boss-f39-c","boss-f4","boss-f4-b","boss-f4-c","boss-f40","boss-f40-b","boss-f40-c","boss-f5","boss-f5-b","boss-f5-c","boss-f6","boss-f6-b","boss-f6-c","boss-f7","boss-f7-b","boss-f7-c","boss-f8","boss-f8-b","boss-f8-c","boss-f9","boss-f9-b","boss-f9-c","coat-of-midnight","elf-moon-armor","elf-moon-ring","elf-moon-shield","elf-night-armor","elf-night-ring","elf-night-shield","elf-vine-armor","elf-vine-ring","elf-vine-shield","feet-t1","feet-t10","feet-t15","feet-t20","feet-t25","feet-t30","feet-t35","feet-t40","feet-t5","fine-acc-t1","fine-acc-t10","fine-acc-t15","fine-acc-t20","fine-acc-t25","fine-acc-t30","fine-acc-t35","fine-acc-t40","fine-acc-t5","fine-armor-t1","fine-armor-t10","fine-armor-t15","fine-armor-t20","fine-armor-t25","fine-armor-t30","fine-armor-t35","fine-armor-t40","fine-armor-t5","fine-axe-t1","fine-axe-t10","fine-axe-t15","fine-axe-t20","fine-axe-t25","fine-axe-t30","fine-axe-t35","fine-axe-t40","fine-axe-t5","fine-feet-t1","fine-feet-t10","fine-feet-t15","fine-feet-t20","fine-feet-t25","fine-feet-t30","fine-feet-t35","fine-feet-t40","fine-feet-t5","fine-head-t1","fine-head-t10","fine-head-t15","fine-head-t20","fine-head-t25","fine-head-t30","fine-head-t35","fine-head-t40","fine-head-t5","fine-katana-t1","fine-katana-t10","fine-katana-t15","fine-katana-t20","fine-katana-t25","fine-katana-t30","fine-katana-t35","fine-katana-t40","fine-katana-t5","fine-light-t1","fine-light-t10","fine-light-t15","fine-light-t20","fine-light-t25","fine-light-t30","fine-light-t35","fine-light-t40","fine-light-t5","fine-mace-t1","fine-mace-t10","fine-mace-t15","fine-mace-t20","fine-mace-t25","fine-mace-t30","fine-mace-t35","fine-mace-t40","fine-mace-t5","fine-mid-t1","fine-mid-t10","fine-mid-t15","fine-mid-t20","fine-mid-t25","fine-mid-t30","fine-mid-t35","fine-mid-t40","fine-mid-t5","fine-rapier-t1","fine-rapier-t10","fine-rapier-t15","fine-rapier-t20","fine-rapier-t25","fine-rapier-t30","fine-rapier-t35","fine-rapier-t40","fine-rapier-t5","fine-shield-t1","fine-shield-t10","fine-shield-t15","fine-shield-t20","fine-shield-t25","fine-shield-t30","fine-shield-t35","fine-shield-t40","fine-shield-t5","fine-weapon-t1","fine-weapon-t10","fine-weapon-t15","fine-weapon-t20","fine-weapon-t25","fine-weapon-t30","fine-weapon-t35","fine-weapon-t40","fine-weapon-t5","head-t1","head-t10","head-t15","head-t20","head-t25","head-t30","head-t35","head-t40","head-t5","katana-t1","katana-t10","katana-t15","katana-t20","katana-t25","katana-t30","katana-t35","katana-t40","katana-t5","kuro-ring","light-t1","light-t10","light-t15","light-t20","light-t25","light-t30","light-t35","light-t40","light-t5","mace-t1","mace-t10","mace-t15","mace-t20","mace-t25","mace-t30","mace-t35","mace-t40","mace-t5","mid-t1","mid-t10","mid-t15","mid-t20","mid-t25","mid-t30","mid-t35","mid-t40","mid-t5","neck-t20","neck-t25","neck-t30","neck-t35","neck-t40","pinya-ring","rapier-t1","rapier-t10","rapier-t15","rapier-t20","rapier-t25","rapier-t30","rapier-t35","rapier-t40","rapier-t5","samurai-axe","samurai-katana","samurai-mace","samurai-rapier","samurai-sword","sb-canal-atk","sb-canal-bal","sb-canal-def","sb-casino-axe","sb-casino-katana","sb-casino-mace","sb-casino-rapier","sb-casino-sword","sb-puzzle-atk","sb-puzzle-bal","sb-puzzle-def","sb-ruins-atk","sb-ruins-bal","sb-ruins-def","sb-s12-atk","sb-s12-bal","sb-s12-def","sb-s13-atk","sb-s13-bal","sb-s13-def","sb-s14-axe","sb-s14-katana","sb-s14-mace","sb-s14-rapier","sb-s14-sword","sb-s16-axe","sb-s16-katana","sb-s16-mace","sb-s16-rapier","sb-s16-sword","sb-s17-atk","sb-s17-bal","sb-s17-def","sb-s18-atk","sb-s18-bal","sb-s18-def","sb-s19-atk","sb-s19-bal","sb-s19-def","sb-s21-atk","sb-s21-bal","sb-s21-def","sb-s23-atk","sb-s23-bal","sb-s23-def","sb-s24-atk","sb-s24-bal","sb-s24-def","sb-s26-atk","sb-s26-bal","sb-s26-def","sb-s28-atk","sb-s28-bal","sb-s28-def","sb-s29-atk","sb-s29-bal","sb-s29-def","sb-s31-atk","sb-s31-bal","sb-s31-def","sb-s32-axe","sb-s32-katana","sb-s32-mace","sb-s32-rapier","sb-s32-sword","sb-s33-atk","sb-s33-bal","sb-s33-def","sb-s34-atk","sb-s34-bal","sb-s34-def","sb-s36-atk","sb-s36-bal","sb-s36-def","sb-s37-atk","sb-s37-bal","sb-s37-def","sb-s38-axe","sb-s38-katana","sb-s38-mace","sb-s38-rapier","sb-s38-sword","sb-s39-atk","sb-s39-bal","sb-s39-def","sg-quarter-axe","sg-quarter-katana","sg-quarter-mace","sg-quarter-rapier","sg-quarter-sword","sg-s15-atk","sg-s15-bal","sg-s15-def","sg-s20-atk","sg-s20-bal","sg-s20-def","sg-s30-atk","sg-s30-bal","sg-s30-def","sg-s40-atk","sg-s40-bal","sg-s40-def","shield-t1","shield-t10","shield-t15","shield-t20","shield-t25","shield-t30","shield-t35","shield-t40","shield-t5","weapon-t1","weapon-t10","weapon-t15","weapon-t20","weapon-t25","weapon-t30","weapon-t35","weapon-t40","weapon-t5","yui-necklace"];
 const shareChapters=["none","prologue","ch1","ch2","ch3","ch4","elf1","canal","elf2","ruins","puzzle","casino","elf3","samurai","kuro1","s12","s13","s14","s15","s16","s17","s18","s19","s20","s21","yui","lake","s23","s24","quarter","s26","kuro2","s28","s29","s30","s31","s32","s33","s34","silica","nicholas","s36","s37","s38","s39","s40"];
 const shareStyles=['sword','rapier','katana','axe','mace'];
 const shareParams=['dualSpeed','zekkenCrit','battoAtk','smithAtk','smithBlock','smithEnhEffect','hitRate'];
 const shareDefaults={dualSpeed:.05,zekkenCrit:.05,battoAtk:0,smithAtk:.05,smithBlock:.08,smithEnhEffect:.25,hitRate:.95};
 const shareAlphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
 function shareChecksum(bytes){let crc=65535;for(const byte of bytes){crc^=byte<<8;for(let i=0;i<8;i++)crc=(crc&32768?(crc<<1)^4129:crc<<1)&65535}return crc}
 function shareBase64(bytes){let out='';for(let i=0;i<bytes.length;i+=3){const a=bytes[i],b=bytes[i+1],c=bytes[i+2];out+=shareAlphabet[a>>2]+shareAlphabet[((a&3)<<4)|((b??0)>>4)];if(b!==undefined)out+=shareAlphabet[((b&15)<<2)|((c??0)>>6)];if(c!==undefined)out+=shareAlphabet[c&63]}return out}
 function shareBytes(value){
  if(!/^[A-Za-z0-9_-]+$/.test(value)||value.length%4===1||value.length>4096)throw Error('無效的配裝連結');
  const out=[];let acc=0,bits=0;
  for(const c of value){acc=(acc<<6)|shareAlphabet.indexOf(c);bits+=6;if(bits>=8){bits-=8;out.push((acc>>bits)&255);acc&=(1<<bits)-1}}
  if(acc!==0)throw Error('無效的配裝連結');return out;
 }
 function encodeShare(input,items){
  const s=normalize(input,items),map=new Map(items.map(x=>[x.id,x])),bytes=[];
  const byte=n=>bytes.push(n&255),uint=n=>{do{const part=n&127;n=Math.floor(n/128);byte(part|(n?128:0))}while(n)};
  const mask=slots.reduce((n,k,i)=>n|(s.slots[k].id?1<<i:0),0);
  const changed=shareParams.reduce((n,k,i)=>n|((k==='hitRate'?s.hitRate:s.params[k])!==shareDefaults[k]?1<<i:0),0);
  byte(s.level);byte(shareChapters.indexOf(s.storyChapter));byte(shareStyles.reduce((n,k,i)=>n|(s.unique[k]?1<<i:0),0));byte(mask);byte(changed);
  for(const [i,slot]of slots.entries())if(mask&(1<<i)){
   const gear=s.slots[slot],item=map.get(gear.id),index=shareItems.indexOf(gear.id);
   uint(index+1);
   if(index<0){const id=new TextEncoder().encode(gear.id);uint(id.length);for(const b of id)byte(b)}
   const ds=dirs(item),presets=['balanced',...ds,'custom'];
   const allocation=ds.reduce((n,k,j)=>n|((gear.enh[k]||0)<<(j*4)),0)|(presets.indexOf(gear.preset)<<12);
   byte(allocation);byte(allocation>>8);
  }
  for(const [i,k]of shareParams.entries())if(changed&(1<<i)){
   const buffer=new ArrayBuffer(8),view=new DataView(buffer);view.setFloat64(0,k==='hitRate'?s.hitRate:s.params[k],true);for(const b of new Uint8Array(buffer))byte(b);
  }
  const historyMask=slots.reduce((n,k,i)=>n|(s.slots[k].smithEnh?1<<i:0),0),extended=s.buffs.length||historyMask;
  if(extended){const buffs=buffDefinitions.reduce((n,b,i)=>n|(s.buffs.includes(b.id)?1<<i:0),0);byte(buffs);byte(buffs>>8);byte(historyMask);for(const [i,slot]of slots.entries())if(historyMask&(1<<i)){const g=s.slots[slot],ds=dirs(map.get(g.id)),packed=ds.reduce((n,k,j)=>n|((g.smithEnh[k]||0)<<(j*4)),0);byte(packed);byte(packed>>8)}}
  const crc=shareChecksum(bytes);byte(crc);byte(crc>>8);return (extended?'2.':'1.')+shareBase64(bytes);
 }
 function decodeShare(value,items){
  if(typeof value!=='string'||value.length>50000)throw Error('無效的配裝連結');
  if(value.trimStart().startsWith('{'))return normalize(JSON.parse(value),items);
  if(!/^[12]\./.test(value))throw Error('不支援的配裝連結版本');
  const format=Number(value[0]);
  const bytes=shareBytes(value.slice(2)),end=bytes.length-2;let pos=0;
  if(end<5||shareChecksum(bytes.slice(0,end))!==(bytes[end]|bytes[end+1]<<8))throw Error('配裝連結不完整或已損壞');
  const byte=()=>{if(pos>=end)throw Error('配裝連結不完整');return bytes[pos++]};
  const uint=()=>{let n=0;for(let i=0;i<4;i++){const b=byte();n+=(b&127)*2**(7*i);if(!(b&128))return n}throw Error('無效的配裝編碼')};
  const s=empty(),map=new Map(items.map(x=>[x.id,x]));
  for(const k of shareParams)if(k==='hitRate')s.hitRate=shareDefaults[k];else s.params[k]=shareDefaults[k];
  s.level=byte();const chapter=byte(),styles=byte(),mask=byte(),changed=byte();
  if(s.level<1||s.level>120||chapter>=shareChapters.length||styles>31||changed>127)throw Error('無效的配裝設定');
  s.storyChapter=shareChapters[chapter];for(const [i,k]of shareStyles.entries())s.unique[k]=!!(styles&(1<<i));
  for(const [i,slot]of slots.entries())if(mask&(1<<i)){
   const index=uint();let id;
   if(index===0){const length=uint();if(length>512||pos+length>end)throw Error('無效的裝備代碼');id=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(bytes.slice(pos,pos+length)));pos+=length}
   else id=shareItems[index-1];
   const item=map.get(id);if(!item)throw Error('分享配裝的裝備尚未收錄');
   const ds=dirs(item),allocation=byte()|(byte()<<8),preset=allocation>>12;
   if(preset>4)throw Error('無效的強化分配');
   const enh=Object.fromEntries(ds.map((k,j)=>[k,(allocation>>(j*4))&15]));
   if(Object.values(enh).some(n=>n>13)||Object.values(enh).reduce((a,b)=>a+b,0)>maxPlus(item,s.unique.mace&&smithEligible(item)))throw Error('強化次數超過上限');
   s.slots[slot]={id,enh,preset:['balanced',...ds,'custom'][preset]};
  }
  for(const [i,k]of shareParams.entries())if(changed&(1<<i)){
   const buffer=new ArrayBuffer(8),view=new DataView(buffer);for(let j=0;j<8;j++)view.setUint8(j,byte());const n=view.getFloat64(0,true);
   if(!Number.isFinite(n)||n<0||n>(k==='hitRate'?.95:2))throw Error('無效的配裝參數');
   if(k==='hitRate')s.hitRate=n;else s.params[k]=n;
  }
  if(format===2){const mask=byte()|(byte()<<8),history=byte();if(mask>=(1<<buffDefinitions.length))throw Error('無效的增益設定');s.buffs=buffDefinitions.filter((b,i)=>mask&(1<<i)).map(b=>b.id);for(const [i,slot]of slots.entries())if(history&(1<<i)){const g=s.slots[slot],item=map.get(g.id);if(!item||!s.unique.mace||!smithEligible(item))throw Error('無效的匠魂紀錄');const packed=byte()|(byte()<<8);if(packed>4095)throw Error('無效的匠魂次數');g.smithEnh=Object.fromEntries(dirs(item).map((k,j)=>{const n=(packed>>(j*4))&15;if(n>(g.enh[k]||0))throw Error('匠魂次數超過強化次數');return [k,n]}))}}
  if(pos!==end)throw Error('配裝連結包含多餘資料');return normalize(s,items);
 }
 const api={buffDefinitions,encodeShare,decodeShare,storyChapters,storyPerks,slots,names,directionsInfo,defaults,dirs,smithEligible,maxPlus,baseStats,enhance,empty,normalize,calculate,offhandAllowed};root.BuildGuide=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
