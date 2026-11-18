/* Public catalogue views only. Does not handle accounts or communicate with the game. */
(()=>{'use strict';
 const D=window.SAOCurrent.catalog,esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const text=x=>typeof x==='string'?x:x?.zh||'',nf=x=>Number(x).toLocaleString('zh-TW');
 function recipes(main){
  if(main.querySelector('[data-fuse-recipes]'))return;
  const rows=D.serverGuide?.recipes||[];if(!rows.length)return;
  const names=new Map(D.items.map(x=>[x.id,text(x.name)])),item=(id,n)=>`<a href="#equipment?id=${encodeURIComponent(id)}">${esc(names.get(id)||id)}</a> ×${nf(n)}`;
  main.insertAdjacentHTML('beforeend',`<section class="panel" data-fuse-recipes><h2>茸配配方簿</h2><p>只列已成功煉成的配方，材料數量依表內填入。</p><div class="table-wrap"><table><thead><tr><th>材料</th><th>產物</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${Object.entries(r.in).map(([id,n])=>item(id,n)).join(' ＋ ')}</td><td>${r.out.map(x=>x.id?item(x.id,x.n):`隨機千石 ×${nf(x.n)}`).join('、')}</td></tr>`).join('')}</tbody></table></div></section>`);
 }
 function enhance(){
  const [page,query]=(location.hash.slice(1)||'home').split('?');
  if(page==='floors'){
   const results=document.getElementById('floor-reward-results');
   if(results&&!document.querySelector('[data-miasma-exp-note]')&&D.serverGuide?.mechanics?.miasmaExperience){
    const note=document.createElement('p');note.className='muted';note.dataset.miasmaExpNote='';
    note.innerHTML='秘境瘴氣經驗倍率＝1＋5% × 層數，摳不變。0～2 層已實測，3 層以上沿用推估；實得紀錄已含當下加成，請勿重複計算。<a href="#systems">查看規則與範例 →</a>';
    results.before(note);
   }
   return;
  }
  if(page==='systems'){
   const main=document.getElementById('main-content');recipes(main);if(main.querySelector('[data-current-mechanics]'))return;
   const caps=D.serverGuide?.mechanics?.softCaps;
   if(caps){
    const names={dmgTaken:'減傷',ailRes:'異常抗性',cdr:'冷卻縮減',armorPen:'穿透',evade:'迴避'};
    const table=[...main.querySelectorAll('table')].find(t=>t.querySelector('thead')?.textContent.includes('基本上限'));
    if(table){table.dataset.softCaps='';table.querySelector('thead').innerHTML='<tr><th>項目</th><th>遞減起點</th><th>逐漸逼近的極限</th></tr>';table.querySelector('tbody').innerHTML=Object.entries(caps).filter(([k,v])=>names[k]&&Array.isArray(v)&&v.length===2&&v.every(Number.isFinite)).map(([k,[from,to]])=>`<tr><td>${names[k]}</td><td>${from*100}%</td><td>${to*100}%</td></tr>`).join('')+['斬擊抗性','突刺抗性','打擊抗性','龍族抗性'].map(name=>`<tr><td>${name}</td><td colspan="2">基本上限 70%</td></tr>`).join('');}
   }
   const rows=D.serverGuide?.mechanics?.rules||[];if(rows.length)main.querySelector('.page-intro')?.insertAdjacentHTML('afterend',`<div class="v2-cards" data-current-mechanics>${rows.map(x=>`<section class="panel"><h2>${esc(x.title)}</h2>${x.lines.map(line=>`<p>${esc(line)}</p>`).join('')}</section>`).join('')}</div>`);
   return;
  }
  if(page!=='quests')return;
  const main=document.getElementById('main-content'),params=new URLSearchParams(query||'');
  const chapter=D.chapters.find(x=>x.id===params.get('id'));
  if(chapter){
   const names=new Map(D.items.map(x=>[x.id,text(x.name)]));
   const choice=reward=>reward?.choose?.length?`<span data-reward-choice> · 擇一：${reward.choose.map(id=>`<a href="#equipment?id=${encodeURIComponent(id)}">${esc(names.get(id)||id)}</a>`).join('、')}</span>`:'';
   if(!main.querySelector('[data-reward-choice]')){
    for(const [i,step]of (chapter.steps||[]).entries()){const node=main.querySelectorAll('.v2-queststeps li')[i]?.querySelector('small');if(node)node.insertAdjacentHTML('beforeend',choice(step.reward));}
    main.querySelector('h3')?.nextElementSibling?.insertAdjacentHTML('beforeend',choice(chapter.reward));
   }
   return;
  }
  if(params.get('type')!=='points'){
   if(!params.get('id')&&!main.querySelector('[data-point-shop-link]'))main.querySelector('.page-intro')?.insertAdjacentHTML('afterend','<p data-point-shop-link><a class="button secondary" href="#quests?type=points">點數商店 →</a></p>');
   return;
  }
  document.title='點數商店｜SAO 攻略資料庫';document.getElementById('breadcrumb').textContent='點數商店';
  main.innerHTML=`<div class="page-intro"><div><div class="eyebrow">DATABASE / POINT SHOP</div><h1>點數商店</h1><p>查看商品用途與所需點數。</p></div></div><p><a class="button secondary" href="#quests">← 商店與任務</a></p><section class="panel"><div class="table-wrap"><table><thead><tr><th>商品</th><th>用途</th><th>點數</th></tr></thead><tbody>${(D.serverGuide?.pointShop||[]).map(x=>`<tr><td>${esc(text(x.name)||'未公開商品')}</td><td>${esc(text(x.desc)||'—')}</td><td>${x.priceRule==='doubles'?'每次購買後加倍':Number.isFinite(x.price)?nf(x.price):'—'}</td></tr>`).join('')}</tbody></table></div></section>`;
 }
 window.addEventListener('hashchange',enhance);enhance();
})();
