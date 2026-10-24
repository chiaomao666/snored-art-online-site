(function(root){'use strict';
 const count=v=>Math.max(0,Number(v)||0);
 function skillProgress(xp){let level=1,into=count(xp);while(level<10){const need=Math.round(250*1.55**(level-1));if(into<need)return {level,into,need};into-=need;level++}return {level:10,into,need:0}}
 function equipment(player,items,B){const map=new Map(items.map(x=>[x.id,x]));return B.slots.map(slot=>{const ref=player.equipment?.[slot],g=typeof ref==='string'&&ref.startsWith('g:')?player.gear?.[ref.slice(2)]:null,base=map.get(g?.base||ref);if(!ref)return {slot,empty:true};if(!base)return {slot,unknown:true,plus:g?.plus||0};const x={...base,bonus:{...base.bonus}},n=k=>count(g?.enh?.[k])+.25*count(g?.smith?.[k]),step=Math.max(2,Math.round(2+(base.reqLevel||1)*.08)),hpStep=Math.max(10,Math.round(B.baseStats(base.reqLevel||1).maxHp*.03)),scale=(v,k)=>Math.max(Math.round(n(k)),Math.round((v||0)*.12*n(k)));
 if(n('sharp'))x.bonus.atk=(x.bonus.atk||0)+scale(x.bonus.atk,'sharp');if(n('acc'))x.bonus.crit=(x.bonus.crit||0)+.03*n('acc');if(n('quick'))x.speed=Math.round((x.speed??100)+4*n('quick'));
 if(n('hard'))x.bonus.def=(x.bonus.def||0)+scale(x.bonus.def,'hard');if(n('thick'))x.bonus.maxHp=(x.bonus.maxHp||0)+Math.round(Math.max(Math.round((base.bonus.maxHp||0)*.12),hpStep)*n('thick'));
 for(const k of ['light','swift'])if(n(k))x.bonus.agi=(x.bonus.agi||0)+Math.round(step*n(k));if(n('vital'))x.bonus.maxHp=(x.bonus.maxHp||0)+Math.round(hpStep*n('vital'));if(n('fatal'))x.bonus.critDmg=(x.bonus.critDmg||0)+.08*n('fatal');
 return {slot,item:x,plus:count(g?.plus),enh:g?.enh||{},smith:g?.smith||{}};})}
 const api={skillProgress,equipment};root.AccountModel=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
