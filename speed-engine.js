(function(root){
  'use strict';
  const styles={sword:'單手劍',rapier:'細劍',katana:'太刀',axe:'雙手斧',mace:'單手槌'};
  const base={sword:100,rapier:125,katana:88,axe:72,mace:80};
  const configs=[
    ['sword','empty','空副手',1,''],['sword','light','輕頓・減速 5%',.95,''],['sword','shield','一般盾・減速 10%',.9,''],['sword','dual','單手劍・二刀流',1.05,'需解鎖二刀流；被動依 +5% 參考值'],
    ['rapier','empty','空副手',1,''],['rapier','light','輕頓・減速 5%',.95,''],['rapier','shield','一般盾・減速 10%',.9,''],
    ['katana','empty','空副手',1,'拔刀術前後皆可'],['katana','light','輕頓・減速 5%',.95,'僅未學會拔刀術時可裝'],['katana','shield','一般盾・減速 10%',.9,'僅未學會拔刀術時可裝'],
    ['axe','empty','無副手・雙手持握',1,'不能裝盾或副手武器'],['mace','all','空副手／兩種盾',1,'單手槌忽略盾牌減速，三種搭配攻速相同']
  ].map(([style,off,label,factor,note])=>({style,off,label,factor,note}));
  function interval(agi,multiplier){
    const effective=agi<=0?agi:250*Math.tanh(agi/250);
    return Math.max(400,Math.round(2200*(100/(100+effective*1.5))/multiplier));
  }
  function speed(agi,multiplier){return Math.round(200000/interval(agi,multiplier))}
  function limit(multiplier){return Math.round(200000/Math.max(400,Math.round(2200/4.75/multiplier)))}
  function minimum(multiplier){
    if(!(multiplier>0)||limit(multiplier)<500)return null;
    let lo=0,hi=1;
    while(speed(hi,multiplier)<500&&hi<1e6)hi*=2;
    while(lo<hi){let mid=Math.floor((lo+hi)/2);if(speed(mid,multiplier)===500)hi=mid;else lo=mid+1;}
    return lo;
  }
  function buff(style,mastery=1){return style==='rapier'?1+.12+Math.round(.30*(1+.30*mastery)*100)/100:1}
  function factor(config,dual=.05){return config.off==='dual'?1+dual:config.factor}
  function result(style,w,offFactor=1,mastery=1){
    const normal=w/100*offFactor,boosted=normal*buff(style,mastery);
    return {normal:minimum(normal),boosted:minimum(boosted),normalLimit:limit(normal),boostedLimit:limit(boosted),normalFactor:normal,boostedFactor:boosted};
  }
  function minimumWeapon(f=1,b=1){let w=1;while(minimum(w/100*f*b)===null)w++;return w}
  const api={styles,base,configs,interval,speed,limit,minimum,buff,factor,result,minimumWeapon};
  root.SpeedGuide=api;
  if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
