(function(root){
 'use strict';
 const key='sao-guide-reward-level';
 const rules=Object.freeze({grace:5,base:0.75,minimum:0.01,partyLevelGap:10,partyLowLevelRate:.5,extraExpLevel:63,extraExpRate:.1,verifiedPlayerLevels:[57,58],verifiedMonsterLevels:[7,61]});
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
  return {participants:n};
 }
 function factors(value,monsterLevel,playerLevel){
  const o=options(value);if(!o)return null;
  const level=parse(playerLevel),knownMonster=Number.isInteger(monsterLevel)&&monsterLevel>=1;
  const lowLevelPenalty=o.participants===1?false:level===null||!knownMonster?null:monsterLevel-level>rules.partyLevelGap;
  const expReduction=level===null?null:level>=rules.extraExpLevel;
  return {...o,share:(1+.05*(o.participants-1))/o.participants,lowLevelPenalty,expReduction,low:lowLevelPenalty===null?null:lowLevelPenalty?rules.partyLowLevelRate:1,extra:expReduction===null?null:expReduction?rules.extraExpRate:1,verifiedParticipants:[1,2,5,6].includes(o.participants)};
 }
 function estimate(baseExp,monsterLevel,playerLevel,settings){
  const level=parse(playerLevel);
  if(level===null||!Number.isInteger(monsterLevel)||monsterLevel<1||!Number.isFinite(baseExp)||baseExp<0)return null;
  const gap=level-monsterLevel,steps=Math.max(0,gap-rules.grace),rawMultiplier=rules.base**steps,multiplier=Math.max(rules.minimum,rawMultiplier);
  const f=factors(settings,monsterLevel,level);if(!f)return null;
  return {value:Math.round(baseExp*multiplier*f.share*f.low*f.extra),multiplier,rawMultiplier,floorApplied:rawMultiplier<rules.minimum,steps,gap,...f,extended:level<57||level>58||monsterLevel<7||monsterLevel>61||gap>51||gap< -4};
 }
 function estimateCol(baseCol,monsterLevel,playerLevel,settings){const f=factors(settings,monsterLevel,playerLevel);return f&&f.low!==null&&Number.isFinite(baseCol)&&baseCol>=0?Math.round(baseCol*f.share*f.low):null}
 function colHtml(baseCol,monsterLevel,playerLevel,settings){const value=estimateCol(baseCol,monsterLevel,playerLevel,settings),f=factors(settings,monsterLevel,playerLevel);return value===null?'<span class="reward-estimate unavailable">—<small>'+(parse(playerLevel)===null?'先填角色等級':'怪物等級未知，無法判斷低等折減')+'</small></span>':'<span class="reward-col-estimate"><strong>'+value.toLocaleString('zh-TW')+'</strong>'+(f.lowLevelPenalty?'<small>低於此怪超過 10 級 · ×50%（邊界推估）</small>':'')+'</span>'}
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
  const note=(result.participants>1?result.participants+' 人分配推估'+(result.verifiedParticipants?'':' · 人數待驗證'):boss?'單人頭目推估':result.extended?'公式延伸推估':'單人公式推估')+(result.floorApplied?' · 等級差最低 1%':'')+(result.lowLevelPenalty?' · 低於此怪超過 10 級，×50%（邊界推估）':'')+(result.expReduction?' · Lv63 以上經驗 ×10%':'');
  return '<span class="reward-estimate"><strong>'+result.value.toLocaleString('zh-TW')+'</strong><small>'+note+'</small></span>';
 }
 function sortValue(monster,playerLevel,settings){return estimate(monster.exp,monster.levelHidden?null:monster.level,playerLevel,settings)?.value??-1}
 function areaScore(area,key,playerLevel,settings){
  let total=0,weighted=0;
  for(const m of area.monsters){
   const weight=m.spawnWeight??(area.monsters.length===1?1:null),value=key==='estimatedExp'?sortValue(m,playerLevel,settings):key==='estimatedCol'?estimateCol(m.col,m.levelHidden?null:m.level,playerLevel,settings):m[key];
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
  return options(saved)||options();
 }
 function formulaHtml(level,settings){
  const o=options(settings)||options(),parsed=parse(level),exampleLevel=parsed??58,f=factors(o,40,exampleLevel);
  const example=estimate(1000,40,exampleLevel,o),cash=estimateCol(1000,40,exampleLevel,o);
  const share=`［1 ＋ 5% ×（${o.participants} − 1）］÷ ${o.participants}`;
  return `<code>個人經驗 ＝ 四捨五入｛<br>基礎經驗 × 較大值［1%，75% ^ 較大值（0，你的等級 − 怪物等級 − 5）］<br>×［1 ＋ 5% ×（分配人數 − 1）］÷ 分配人數<br>× 低等隊員折減 × 額外經驗折減｝</code>
   <code>個人摳 ＝ 四捨五入｛<br>基礎摳 ×［1 ＋ 5% ×（分配人數 − 1）］÷ 分配人數 × 低等隊員折減｝</code>
   <ul class="reward-formula-definitions"><li>分配人數包含自己；單人填 1。人數加成與平均分配已直接寫進上面兩條公式。</li><li>「較大值」是取括號中較大的數；「^」是次方，例如 75% ^ 3 ＝ 75% × 75% × 75%。比怪物高 5 級以內不扣經驗，超過後每多 1 級再乘 75%，等級差部分最低保留 1%。</li><li><strong>低等隊員折減 ＝ 當分配人數 ≥ 2 且（怪物等級 − 你的等級）＞ 10 時為 50%，其餘為 100%。</strong>逐隻怪物判斷；單人不套用。等級差 10 的判斷邊界尚未驗證，目前先按「超過 10 級」推估。</li><li><strong>額外經驗折減 ＝ 你的等級 ≥ 63 時為 10%，Lv62 以下為 100%。</strong>單人、組隊都自動判斷；只影響經驗，不影響摳。</li></ul>
   <div class="reward-formula-example"><b>代入範例：你 Lv${exampleLevel}、${o.participants} 人分配</b><p>${parsed===null?'尚未填角色等級，暫以 Lv58 示範。':''}假設怪物 Lv40，基礎經驗 1,000、基礎摳 1,000（只示範算法，不是特定怪物的數值）。兩種折減依角色與這隻怪物的等級自動判斷。</p>
    <code>經驗 ＝ 四捨五入｛1,000 × 較大值［1%，75% ^ 較大值（0，${exampleLevel} − 40 − 5）］ × ${share} × ${f.low===1?'100%':'50%'} × ${f.extra===1?'100%':'10%'}｝＝ ${example.value.toLocaleString('zh-TW')}</code>
    <code>摳 ＝ 四捨五入｛1,000 × ${share} × ${f.low===1?'100%':'50%'}｝＝ ${cash.toLocaleString('zh-TW')}</code>
   </div>`;
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
   <p id="reward-level-status" class="reward-wide section-note" role="status" aria-live="polite"></p>
   <details class="reward-formula"><summary>每隻怪物的完整獎勵公式（推估）</summary><div id="reward-formula">${formulaHtml(parsed,o)}</div></details>
   <details><summary>人數倍率表與實測範圍</summary><div class="table-wrap"><table><thead><tr><th>分配人數（含自己）</th><th>每人倍率</th><th>驗證狀態</th></tr></thead><tbody>${Array.from({length:6},(_,i)=>i+1).map(n=>`<tr><td>${n} 人</td><td>${formatMultiplier(factors({participants:n}).share)}</td><td>${n===1?'單人基準':[2,5,6].includes(n)?'已有實測吻合':'公式推估，待確認'}</td></tr>`).join('')}</tbody></table></div>
    <p>依 2026.10.26 的單人與組隊紀錄核對。2、5、6 人分配已有對照；3、4 人仍需確認，不能把「有人稱三人、數值卻符合四人」的紀錄直接視為驗證。組隊實測以頭目為主，其他怪物套用同一公式屬延伸推估。</p>
    <p>單人等級差規則已對照 Lv57–58、Lv7–61 的怪物與頭目。依玩家確認，額外經驗折減目前按 Lv63 以上套用；低等隊員折減按玩家與每隻怪物的等級差推估，超過 10 級的邊界待驗證。過去兩人隊伍的低等樣本不再作為這個新判斷條件的驗證。離線、活動及其他特殊獎勵仍可能影響實得；等級隱藏或未填角色等級時，不推測組隊低等折減。不另假設最少獲得 1 點。</p></details></section>`;
 }
 function bind(callback,settings){
  let current=options(settings)||options();
  const input=document.getElementById('reward-player-level'),status=document.getElementById('reward-level-status'),participants=document.getElementById('reward-participants');
  function update(notify){
   const n=parse(input.value),invalid=input.value!==''&&n===null;
   current=options({participants:Number(participants.value)})||options();
   input.setAttribute('aria-invalid',String(invalid));
   const f=factors(current);
   status.textContent=invalid?'請輸入 1–120 的整數等級。':(n===null?'填入等級後可自動計算經驗與逐隻怪物的低等折減；單人摳可先換算。':'目前以角色 Lv'+n+' 計算。')+' 分配人數 '+current.participants+' 人，每人人數倍率 '+formatMultiplier(f.share)+(f.verifiedParticipants?'。':'（此人數待驗證）。')+(n!==null?(n>=rules.extraExpLevel?' Lv63 以上：經驗自動 ×10%，摳不變。':' Lv62 以下：不套用額外經驗折減。'):'')+(current.participants>1?' 低等折減依每隻怪物判斷，並於受影響的數值旁標示。':' 單人不套用低等隊員折減。');
   document.getElementById('reward-formula').innerHTML=formulaHtml(n,current);
   if(notify){
    if(!invalid)try{if(n===null)localStorage.removeItem(key);else localStorage.setItem(key,String(n))}catch{}
    try{localStorage.setItem(key+'-party',JSON.stringify(current))}catch{}
    callback(n,current);
   }
  }
  input.addEventListener('input',()=>update(true));
  participants.addEventListener('change',()=>update(true));
  update(false);
 }
 const api={rules,parse,comparison,badge,options,factors,estimate,estimateCol,colHtml,formatMultiplier,multiplierHtml,valueHtml,sortValue,areaScore,rankAreas,load,loadOptions,formulaHtml,panel,bind};
 root.RewardGuide=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
