(function(root){
 'use strict';
 const key='sao-guide-reward-level';
 const rules=Object.freeze({grace:5,base:0.75,minimum:0.01,verifiedPlayerLevels:[57,58],verifiedMonsterLevels:[7,61]});
 function parse(value){if(value==null||String(value).trim()==='')return null;const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=120?n:null}
 function comparison(monsterLevel,playerLevel){
  if(!Number.isInteger(monsterLevel))return {gap:null,text:'等級隱藏',kind:'unknown'};
  if(parse(playerLevel)==null)return {gap:null,text:'—',kind:'unknown'};
  const gap=monsterLevel-Number(playerLevel);
  return {gap,text:gap>0?'高你 '+gap+' 級':gap<0?'低你 '+(-gap)+' 級':'同等級',kind:gap>0?'higher':gap<0?'lower':'same'};
 }
 function badge(monsterLevel,playerLevel){const c=comparison(monsterLevel,playerLevel);return '<span class="reward-gap '+c.kind+'">'+c.text+'</span>'}
 function options(value={}){
  const n=Number(value?.participants??1);
  if(!Number.isInteger(n)||n<1||n>6)return null;
  return {participants:n,lowLevelPenalty:n>1&&value.lowLevelPenalty===true,expReduction:value.expReduction===true};
 }
 function factors(value){
  const o=options(value);if(!o)return null;
  const share=(1+.05*(o.participants-1))/o.participants,low=o.lowLevelPenalty?.5:1;
  return {...o,share,low,extra:o.expReduction?.1:1,verifiedParticipants:[1,2,5,6].includes(o.participants)};
 }
 function estimate(baseExp,monsterLevel,playerLevel,settings){
  const level=parse(playerLevel);
  if(level===null||!Number.isInteger(monsterLevel)||monsterLevel<1||!Number.isFinite(baseExp)||baseExp<0)return null;
  const gap=level-monsterLevel,steps=Math.max(0,gap-rules.grace),rawMultiplier=rules.base**steps,multiplier=Math.max(rules.minimum,rawMultiplier);
  const f=factors(settings);if(!f)return null;
  return {value:Math.round(baseExp*multiplier*f.share*f.low*f.extra),multiplier,rawMultiplier,floorApplied:rawMultiplier<rules.minimum,steps,gap,...f,extended:level<57||level>58||monsterLevel<7||monsterLevel>61||gap>51||gap< -4};
 }
 function estimateCol(baseCol,settings){const f=factors(settings);return f&&Number.isFinite(baseCol)&&baseCol>=0?Math.round(baseCol*f.share*f.low):null}
 function colHtml(baseCol,settings){const value=estimateCol(baseCol,settings);return value===null?'—':'<span class="reward-col-estimate"><strong>'+value.toLocaleString('zh-TW')+'</strong></span>'}
 function formatMultiplier(multiplier){
  const percent=multiplier*100;
  if(percent>0&&percent<0.000001)return '小於 0.000001%';
  return percent.toLocaleString('zh-TW',{maximumFractionDigits:6})+'%';
 }
 function multiplierHtml(baseExp,monsterLevel,playerLevel){
  const result=estimate(baseExp,monsterLevel,playerLevel);
  return result?'<span class="reward-multiplier '+(result.steps?'reduced':'full')+'">'+formatMultiplier(result.multiplier)+'</span>':'<span class="reward-gap unknown">—</span>';
 }
 function valueHtml(baseExp,monsterLevel,playerLevel,boss=false,settings){
  const result=estimate(baseExp,monsterLevel,playerLevel,settings);
  if(!result)return '<span class="reward-estimate unavailable">—<small>'+(parse(playerLevel)===null?'先填角色等級':'等級未知，無法計算')+'</small></span>';
  const note=(result.participants>1?result.participants+' 人分配推估'+(result.verifiedParticipants?'':' · 人數待驗證'):boss?'單人頭目推估':result.extended?'公式延伸推估':'單人公式推估')+(result.floorApplied?' · 等級差最低 1%':'')+(result.lowLevelPenalty?' · 低等折減 50%':'')+(result.expReduction?' · 額外經驗 ×10%':'');
  return '<span class="reward-estimate"><strong>'+result.value.toLocaleString('zh-TW')+'</strong><small>'+note+'</small></span>';
 }
 function sortValue(monster,playerLevel,settings){return estimate(monster.exp,monster.levelHidden?null:monster.level,playerLevel,settings)?.value??-1}
 function areaScore(area,key,playerLevel,settings){
  let total=0,weighted=0;
  for(const m of area.monsters){
   const weight=m.spawnWeight??(area.monsters.length===1?1:null),value=key==='estimatedExp'?sortValue(m,playerLevel,settings):key==='estimatedCol'?estimateCol(m.col,settings):m[key];
   if(!Number.isFinite(weight)||weight<0||!Number.isFinite(value)||value<0)return null;
   total+=weight;weighted+=weight*value;
  }
  return total>0?weighted/total:null;
 }
 function rankAreas(areas,key,playerLevel,settings){
  const metric=['exp','estimatedExp','col','estimatedCol'].includes(key),rows=[...areas];
  return rows.sort(key==='population'?(a,b)=>(b.maxEnemies??-1)-(a.maxEnemies??-1)||a.floor-b.floor:metric?(a,b)=>(areaScore(b,key,playerLevel,settings)??-1)-(areaScore(a,key,playerLevel,settings)??-1)||a.floor-b.floor:(a,b)=>a.floor-b.floor);
 }
 function load(params){const q=params?.get('playerLevel');if(q!==null&&q!==undefined)return parse(q);try{return parse(localStorage.getItem(key))}catch{return null}}
 function loadOptions(params){
  let saved={};try{saved=JSON.parse(localStorage.getItem(key+'-party')||'{}')}catch{}
  if(params?.has('participants'))saved.participants=Number(params.get('participants'));
  for(const name of ['lowLevelPenalty','expReduction'])if(params?.has(name))saved[name]=params.get(name)==='1';
  return options(saved)||options();
 }
 function panel(level,settings){
  const parsed=parse(level),o=options(settings)||options();
  return `<section class="panel reward-level-panel" aria-label="經驗與組隊獎勵試算">
   <div class="reward-panel-intro"><h2>經驗與摳試算</h2><p>輸入等級與實際分配人數，換算<strong>你每隻可獲得的經驗與摳</strong>。保留基礎數值，方便對照。</p></div>
   <div class="reward-controls">
    <label class="field">你的角色等級（選填）<input id="reward-player-level" aria-label="查詢角色等級" aria-describedby="reward-level-status" type="number" min="1" max="120" step="1" value="${parsed??''}" placeholder="例如 58"></label>
    <label class="field">實際分配人數（含自己）<select id="reward-participants" aria-describedby="reward-party-help">${Array.from({length:6},(_,i)=>i+1).map(n=>`<option value="${n}" ${n===o.participants?'selected':''}>${n===1?'1 人（單人）':n+' 人'}${[3,4].includes(n)?' · 倍率待驗證':''}</option>`).join('')}</select></label>
   </div>
   <p id="reward-party-help" class="reward-wide">填本次實際參與獎勵分配的人數，包含自己；不直接使用隊伍總人數、同區人數或畫面中的攻擊人數。未參戰的隊員不要直接算入。</p>
   <fieldset class="reward-adjustments"><legend>個人額外折減（符合時才勾選）</legend>
    <label><input id="reward-low-level" type="checkbox" ${o.lowLevelPenalty?'checked':''} ${o.participants===1?'disabled':''}>低等隊員折減：經驗與摳 ×50%<small>已在相差 36 級的兩人隊伍驗證；檔案參數為等級差 10，確切邊界與多人套用規則仍待確認，因此不自動判定。</small></label>
    <label><input id="reward-exp-reduction" type="checkbox" ${o.expReduction?'checked':''}>額外經驗折減：經驗 ×10%，摳不變<small>Lv63 的單人／組隊紀錄符合此折減；是否一律從 Lv63 觸發尚待確認，僅在你的實得也符合時勾選。</small></label>
   </fieldset>
   <p id="reward-level-status" class="reward-wide section-note" role="status" aria-live="polite"></p>
   <div class="reward-formula"><b>每位玩家的獎勵推估</b><code>人數倍率 ＝［1 ＋ 5% ×（人數 − 1）］÷ 人數</code><p>個人經驗 ＝ 基礎經驗 × 等級差倍率 × 人數倍率 × 已勾選的個人折減。<br>個人摳 ＝ 基礎摳 × 人數倍率 × 低等隊員折減（有勾選才套用）。<strong>全部乘完後才四捨五入</strong>；不使用表格顯示時已截短的百分比計算。</p>
    <p>等級差倍率：比怪物高 5 級以內為 100%；超過後每多 1 級再乘 75%，<strong>最低 1%</strong>。這是等級差倍率下限；套用組隊與額外折減後，最終倍率可能低於 1%。</p></div>
   <details><summary>人數倍率表與實測範圍</summary><div class="table-wrap"><table><thead><tr><th>分配人數（含自己）</th><th>每人倍率</th><th>驗證狀態</th></tr></thead><tbody>${Array.from({length:6},(_,i)=>i+1).map(n=>`<tr><td>${n} 人</td><td>${formatMultiplier(factors({participants:n}).share)}</td><td>${n===1?'單人基準':[2,5,6].includes(n)?'已有實測吻合':'公式推估，待確認'}</td></tr>`).join('')}</tbody></table></div>
    <p>依 2026.10.26 的單人與組隊紀錄核對。2、5、6 人分配已有對照；3、4 人仍需確認，不能把「有人稱三人、數值卻符合四人」的紀錄直接視為驗證。組隊實測以頭目為主，其他怪物套用同一公式屬延伸推估。</p>
    <p>單人等級差規則已對照 Lv57–58、Lv7–61 的怪物與頭目。高等額外折減的觸發門檻、低等隊員的邊界、離線、活動及其他特殊獎勵仍可能影響實得。等級隱藏的怪物不換算經驗；不另假設最少獲得 1 點。</p></details></section>`;
 }
 function bind(callback,settings){
  let current=options(settings)||options();
  const input=document.getElementById('reward-player-level'),status=document.getElementById('reward-level-status'),participants=document.getElementById('reward-participants'),low=document.getElementById('reward-low-level'),extra=document.getElementById('reward-exp-reduction');
  function update(notify){
   const n=parse(input.value),invalid=input.value!==''&&n===null;
   current=options({participants:Number(participants.value),lowLevelPenalty:low.checked,expReduction:extra.checked})||options();
   low.disabled=current.participants===1;if(low.disabled)low.checked=false;
   input.setAttribute('aria-invalid',String(invalid));
   const f=factors(current);
   status.textContent=invalid?'請輸入 1–120 的整數等級。':(n===null?'填入等級後可計算經驗；摳可先依人數換算。':'目前以角色 Lv'+n+' 計算。')+' 分配人數 '+current.participants+' 人，每人人數倍率 '+formatMultiplier(f.share)+(f.verifiedParticipants?'。':'（此人數待驗證）。')+(current.lowLevelPenalty?' 已套用低等折減 50%。':'')+(current.expReduction?' 已套用額外經驗 ×10%。':'');
   if(notify){
    if(!invalid)try{if(n===null)localStorage.removeItem(key);else localStorage.setItem(key,String(n))}catch{}
    try{localStorage.setItem(key+'-party',JSON.stringify(current))}catch{}
    callback(n,current);
   }
  }
  input.addEventListener('input',()=>update(true));
  for(const control of [participants,low,extra])control.addEventListener('change',()=>update(true));
  update(false);
 }
 const api={rules,parse,comparison,badge,options,factors,estimate,estimateCol,colHtml,formatMultiplier,multiplierHtml,valueHtml,sortValue,areaScore,rankAreas,load,loadOptions,panel,bind};
 root.RewardGuide=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
