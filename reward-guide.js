(function(root){
 'use strict';
 const key='sao-guide-reward-level';
 const rules=Object.freeze({grace:5,base:0.75,verifiedPlayerLevels:[57,58],verifiedMonsterLevels:[44,61]});
 function parse(value){if(value==null||String(value).trim()==='')return null;const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=120?n:null}
 function comparison(monsterLevel,playerLevel){
  if(!Number.isInteger(monsterLevel))return {gap:null,text:'等級隱藏',kind:'unknown'};
  if(parse(playerLevel)==null)return {gap:null,text:'—',kind:'unknown'};
  const gap=monsterLevel-Number(playerLevel);
  return {gap,text:gap>0?'高你 '+gap+' 級':gap<0?'低你 '+(-gap)+' 級':'同等級',kind:gap>0?'higher':gap<0?'lower':'same'};
 }
 function badge(monsterLevel,playerLevel){const c=comparison(monsterLevel,playerLevel);return '<span class="reward-gap '+c.kind+'">'+c.text+'</span>'}
 function estimate(baseExp,monsterLevel,playerLevel){
  const level=parse(playerLevel);
  if(level===null||!Number.isInteger(monsterLevel)||monsterLevel<1||!Number.isFinite(baseExp)||baseExp<0)return null;
  const gap=level-monsterLevel,steps=Math.max(0,gap-rules.grace),multiplier=rules.base**steps;
  return {value:Math.round(baseExp*multiplier),multiplier,steps,gap,extended:level<57||level>58||monsterLevel<44||monsterLevel>61||gap>14||gap< -4};
 }
 function formatMultiplier(multiplier){
  const percent=multiplier*100;
  if(percent>0&&percent<0.000001)return '小於 0.000001%';
  return percent.toLocaleString('zh-TW',{maximumFractionDigits:6})+'%';
 }
 function multiplierHtml(baseExp,monsterLevel,playerLevel){
  const result=estimate(baseExp,monsterLevel,playerLevel);
  return result?'<span class="reward-multiplier '+(result.steps?'reduced':'full')+'">'+formatMultiplier(result.multiplier)+'</span>':'<span class="reward-gap unknown">—</span>';
 }
 function valueHtml(baseExp,monsterLevel,playerLevel,boss=false){
  const result=estimate(baseExp,monsterLevel,playerLevel);
  if(!result)return '<span class="reward-estimate unavailable">—<small>'+(parse(playerLevel)===null?'先填角色等級':'等級未知，無法計算')+'</small></span>';
  const note=boss?'頭目僅供公式參考':result.extended?'公式延伸推估':'單人公式推估';
  return '<span class="reward-estimate"><strong>'+result.value.toLocaleString('zh-TW')+'</strong><small>'+note+'</small></span>';
 }
 function sortValue(monster,playerLevel){return estimate(monster.exp,monster.levelHidden?null:monster.level,playerLevel)?.value??-1}
 function load(params){const q=params?.get('playerLevel');if(q!==null&&q!==undefined)return parse(q);try{return parse(localStorage.getItem(key))}catch{return null}}
 function panel(level){
  const parsed=parse(level);
  return '<section class="panel reward-level-panel" aria-label="經驗與等級差">'+
   '<div><h2>輸入等級，換算單人經驗</h2><p>保留怪物的基礎經驗，另外列出<strong>等級差倍率與單人經驗推估</strong>，方便比較掛機目標。摳不套用這個經驗倍率。</p></div>'+
   '<label class="field">你的角色等級（選填）<input id="reward-player-level" aria-label="查詢角色等級" aria-describedby="reward-level-status" type="number" min="1" max="120" step="1" value="'+(parsed??'')+'" placeholder="例如 58">'+
   '<span id="reward-level-status" class="section-note" role="status" aria-live="polite">'+(parsed===null?'填入後，樓層情報與怪物圖鑑會共用此等級。':'目前以角色 Lv'+parsed+' 計算單人推估。')+'</span></label>'+
   '<div class="reward-formula"><b>單人推估公式</b><code>經驗 ＝ 基礎經驗 × 0.75ⁿ，最後四捨五入</code>'+
   '<p>n 是「你比怪物高的級數 − 5」，小於 0 時用 0。也就是高出 5 級以內不扣經驗；超過後，每多 1 級，經驗再乘 75%。請從基礎經驗計算，最後才取整。</p></div>'+
   '<details><summary>實測依據與適用範圍</summary><p>依 2026.10.26 核對的單人紀錄，角色 Lv57–58 對 8 種 Lv44–61 怪物的每隻經驗均吻合；例：Lv57 打 Lv44 罪猿為 58 經驗，Lv58 為 43。預設參數 lowExpGrace=5、lowExpBase=0.75 亦與此規則一致。</p>'+
   '<p>其他等級與情境屬公式延伸推估。組隊分配、離線、活動、頭目與特殊獎勵、高等怪可能的經驗上限、極大等級差的衰減下限尚未套用；不保證等於每次實得。等級隱藏的怪物不換算。</p></details></section>';
 }
 function bind(callback){
  const input=document.getElementById('reward-player-level'),status=document.getElementById('reward-level-status');
  input.addEventListener('input',()=>{
   const n=parse(input.value),invalid=input.value!==''&&n===null;
   input.setAttribute('aria-invalid',String(invalid));
   status.textContent=invalid?'請輸入 1–120 的整數等級。':n===null?'填入後，樓層情報與怪物圖鑑會共用此等級。':'目前以角色 Lv'+n+' 計算單人推估。';
   if(!invalid)try{if(n===null)localStorage.removeItem(key);else localStorage.setItem(key,String(n))}catch{}
   callback(n);
  });
 }
 const api={rules,parse,comparison,badge,estimate,formatMultiplier,multiplierHtml,valueHtml,sortValue,load,panel,bind};
 root.RewardGuide=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
