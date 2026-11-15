/* Public catalogue views only. Does not handle accounts or communicate with the game. */
(()=>{'use strict';
 const D=window.SAOCurrent.catalog,esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const text=x=>typeof x==='string'?x:x?.zh||'',nf=x=>Number(x).toLocaleString('zh-TW');
 function enhance(){
  const [page,query]=(location.hash.slice(1)||'home').split('?');if(page!=='quests')return;
  const main=document.getElementById('main-content'),params=new URLSearchParams(query||'');
  if(params.get('type')!=='points'){
   if(!params.get('id')&&!main.querySelector('[data-point-shop-link]'))main.querySelector('.page-intro')?.insertAdjacentHTML('afterend','<p data-point-shop-link><a class="button secondary" href="#quests?type=points">點數商店 →</a></p>');
   return;
  }
  document.title='點數商店｜SAO 攻略資料庫';document.getElementById('breadcrumb').textContent='點數商店';
  main.innerHTML=`<div class="page-intro"><div><div class="eyebrow">DATABASE / POINT SHOP</div><h1>點數商店</h1><p>查看商品用途與所需點數。</p></div></div><p><a class="button secondary" href="#quests">← 商店與任務</a></p><section class="panel"><div class="table-wrap"><table><thead><tr><th>商品</th><th>用途</th><th>點數</th></tr></thead><tbody>${(D.serverGuide?.pointShop||[]).map(x=>`<tr><td>${esc(text(x.name)||'未公開商品')}</td><td>${esc(text(x.desc)||'—')}</td><td>${Number.isFinite(x.price)?nf(x.price):'—'}</td></tr>`).join('')}</tbody></table></div></section>`;
 }
 window.addEventListener('hashchange',enhance);enhance();
})();
