(function(root){
 'use strict';
 const B=root.BuildGuide||(typeof require==='function'?require('./build-engine.js'):null);
 const roles={tank:{name:'坦克',description:'平衡 HP 與防禦，兼顧格擋、迴避與維持輸出的能力。'},support:{name:'輔助',description:'以細劍的團隊攻速與爆擊增益為定位，裝備兼顧存活與出手速度。'},damage:{name:'輸出',description:'綜合攻擊、爆擊與實際普攻間隔，比較普攻期望輸出。'}};
 const keys=['maxHp','atk','def','agi','crit','critDmg','evade','block'],whole=new Set(['maxHp','atk','def','agi']);
 const emptyBonus=()=>Object.fromEntries(keys.map(k=>[k,0]));
 const clamp=(x,top=1)=>Math.max(0,Math.min(top,x));
 function metrics(stats){return {normalDps:Math.max(0,stats.atk)*stats.hitRate*(1+clamp(stats.crit,.9)*Math.max(0,stats.critDamage-1))*1000/stats.interval,hp:stats.maxHp,def:stats.def,interval:stats.interval};}
 function score(stats,role){
  if(!Number.isFinite(stats.maxHp)||stats.maxHp<=0||stats.atk<0||!Number.isFinite(stats.interval)||stats.interval<=0)return -Infinity;
  const d=metrics(stats).normalDps,life=Math.log(stats.maxHp),def=Math.log(1+Math.max(0,stats.def)),avoid=.2*clamp(stats.block)+.2*clamp(stats.evade),attack=Math.log(1+d);
  return role==='tank'?.48*life+.46*def+.06*attack+avoid:role==='support'?.45*life+.35*def+.2*Math.log(1000/stats.interval)+avoid:attack;
 }
 function allocations(item,smith,mode){
  const dirs=B.dirs(item),n=mode==='none'?0:B.maxPlus(item,smith),out=[];
  for(let a=0;a<=n;a++)for(let b=0;b<=n-a;b++)out.push(Object.fromEntries(dirs.map((key,i)=>[key,[a,b,n-a-b][i]])));
  return out;
 }
 function recommend(items,input,{role='damage',enhance='max'}={}){
  if(!Object.hasOwn(roles,role))throw Error('請選擇坦克、輔助或輸出。');
  if(!['none','max'].includes(enhance))throw Error('強化規劃無效。');
  const initial=B.normalize(input,items),base=B.baseStats(initial.level),eligible=items.filter(item=>Number.isInteger(item.reqLevel)&&item.reqLevel<=initial.level);
  const neutral={item:null,gear:{id:'',enh:{},smith:false,preset:'balanced'},bonus:emptyBonus()};
  const cache=new Map();
  function variants(item,offhand=false){
   const key=item.id+(offhand?':off':':full');if(cache.has(key))return cache.get(key);
   const smith=initial.unique.mace&&B.smithEligible(item),factor=offhand&&!item.shield?.6:1;
   const rows=allocations(item,smith,enhance).map(enh=>{
    const gear={id:item.id,enh,smith,preset:'custom'},out=B.enhance(item,gear,initial.params.smithEnhEffect),bonus={};
    for(const k of keys){const value=(out.bonus[k]||0)*factor;bonus[k]=whole.has(k)?Math.round(value):value;}
    return {item:out,gear,bonus};
   });cache.set(key,rows);return rows;
  }
  const styles=role==='support'?['rapier']:['sword','rapier','katana','axe','mace'];
  let winner=null,evaluations=0;
  for(const style of styles){
   const mains=eligible.filter(x=>x.weaponType===style).flatMap(x=>variants(x));if(!mains.length)continue;
   const state={...initial,slots:{...initial.slots},buffs:initial.buffs.filter(id=>B.buffDefinitions.some(b=>b.id===id&&(b.party||b.style===style)))};
   const chosen=Object.fromEntries(B.slots.map(slot=>[slot,neutral])),sum=emptyBonus();
   chosen.weapon=mains[0];for(const k of keys)sum[k]+=chosen.weapon.bonus[k];
   const pools={weapon:mains};
   for(const slot of B.slots.filter(s=>s!=='weapon')){
    const rows=eligible.filter(item=>slot==='offhand'?B.offhandAllowed(item,chosen.weapon.item,state.unique):item.slot===(slot==='ring2'?'accessory':slot));
    pools[slot]=[neutral,...rows.flatMap(item=>variants(item,slot==='offhand'))];
   }
   const evaluate=()=>{evaluations++;return B.finishStats(state,base,{weapon:chosen.weapon.item,offhand:chosen.offhand.item},sum).stats;};
   let bestScore=score(evaluate(),role);
   // Improve one slot at a time, then revisit it after other slots changed.
   // This covers every legal item and full-success direction distribution in
   // each pass. It is a recommendation, not an exhaustive global optimum.
   for(let pass=0;pass<3;pass++){
    let changed=false;
    for(const slot of B.slots){
     const old=chosen[slot];let pick=old,pickScore=bestScore,pickLife=-Infinity;
     for(const k of keys)sum[k]-=old.bonus[k];
     for(const row of pools[slot]){
      chosen[slot]=row;for(const k of keys)sum[k]+=row.bonus[k];
      const stats=evaluate(),value=score(stats,role),life=stats.maxHp+stats.def;
      if(value>pickScore+1e-10||Math.abs(value-pickScore)<=1e-10&&life>pickLife){pick=row;pickScore=value;pickLife=life;}
      for(const k of keys)sum[k]-=row.bonus[k];
     }
     chosen[slot]=pick;for(const k of keys)sum[k]+=pick.bonus[k];
     if(pick!==old)changed=true;bestScore=pickScore;
    }
    if(!changed)break;
   }
   for(const slot of B.slots)state.slots[slot]={...chosen[slot].gear,enh:{...chosen[slot].gear.enh}};
   const result=B.calculate(items,state),value=score(result.stats,role);
   if(!winner||value>winner.score+1e-10)winner={state:result.state,result,score:value};
  }
  if(!winner)throw Error('目前等級沒有可用的推薦武器。');
  const style=winner.result.gear.weapon.weaponType;
  const teamSkills=B.buffDefinitions.filter(b=>b.party&&b.style===style&&b.reqLevel<=initial.level).map(b=>({name:b.name,reqLevel:b.reqLevel,effect:{...b.effect}}));
  return {...winner,role,roleName:roles[role].name,description:roles[role].description,enhance,metrics:metrics(winner.result.stats),teamSkills,evaluations};
 }
 const api={roles,metrics,score,recommend};root.BuildRecommend=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
