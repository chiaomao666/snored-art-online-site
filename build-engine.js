(function(root){
 'use strict';
 const slots=['weapon','offhand','head','armor','feet','neck','accessory','ring2'];
 const names={weapon:'主手',offhand:'副手',head:'頭部',armor:'身體',feet:'鞋子',neck:'項鍊',accessory:'戒指一',ring2:'戒指二'};
 const directionsInfo={sharp:['鋒利','攻擊'],quick:['快速','武器攻速'],acc:['準確','爆擊率'],hard:['堅固','防禦'],thick:['厚實','HP'],light:['輕盈','敏捷'],vital:['活力','HP'],swift:['迅捷','敏捷'],fatal:['致命','爆擊傷害']};
 const hpPoints=[[1,200],[40,6500],[48,7700],[70,9900],[78,11255],[96,14300],[120,17800]];
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
 function empty(){return {version:1,level:40,slots:Object.fromEntries(slots.map(s=>[s,{id:'',enh:{},smith:false,preset:'balanced'}])),unique:{},perks:{atk:0,hp:0,regen:0},params:{...defaults},hitRate:.95}}
 function offhandAllowed(item,main,unique={}){if(!item||!main)return false;if(main.weaponType==='axe'||main.weaponType==='katana'&&unique.katana)return false;return item.shield||main.weaponType==='sword'&&unique.sword&&item.weaponType==='sword'}
 function normalize(input,items){
  const s=empty(),map=new Map(items.map(x=>[x.id,x]));input=input&&typeof input==='object'?input:{};
  s.level=integer(input.level,40,1,120);s.hitRate=number(input.hitRate,.95,0,.95);
  for(const style of ['sword','rapier','katana','axe','mace'])s.unique[style]=input.unique?.[style]===true;
  for(const k of Object.keys(s.perks))s.perks[k]=number(input.perks?.[k],0,0,2);
  for(const k of Object.keys(defaults))s.params[k]=number(input.params?.[k],defaults[k],0,2);
  for(const slot of slots){const g=input.slots?.[slot],item=map.get(g?.id);if(!item)continue;
   if(slot==='weapon'&&!item.weaponType||slot==='offhand'&&!(item.shield||item.weaponType==='sword')||!['weapon','offhand'].includes(slot)&&item.slot!==(slot==='ring2'?'accessory':slot))continue;
   const smith=g.smith===true&&smithEligible(item),enh={},allowed=dirs(item);let left=maxPlus(item,smith);
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
 const api={slots,names,directionsInfo,defaults,dirs,smithEligible,maxPlus,baseStats,enhance,empty,normalize,calculate,offhandAllowed};root.BuildGuide=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
