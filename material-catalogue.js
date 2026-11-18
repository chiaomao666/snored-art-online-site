/* Material catalogue: public definitions, confirmed sources and known recipes. */
(function(root){'use strict';
 const categories={enhance:'強化材料',stone:'魔石',essence:'千石',omen:'預告籤',ore:'礦石',forge:'斷造材料',food:'料理食材',monster:'怪物素材',quest:'任務物品',misc:'其他素材'};
 const text=x=>typeof x==='string'?x:x?.zh||'',complete=x=>!!text(x)&&!/(?:\.{3}|…|[?？]{3})/.test(text(x));
 const label=x=>complete(x?.name)?text(x.name):x?.id||'未取得名稱';
 const included=x=>x.kind==='quest'||x.kind==='material'&&!/^(?:meal|pot)-/.test(x.id);
 function category(x){if(x.kind==='quest')return'quest';const p=x.id.split('-')[0];return({enh:'enhance',craft:'stone',essence:'essence',omen:'omen',ore:'ore',forge:'forge',food:'food',spice:'food',side:'food',bread:'food',mat:'monster'})[p]||'misc'}
 function buildIndex(D,inherited=new Map()){
  const items=new Map(D.items.map(x=>[x.id,x])),mobs=new Map(D.monsters.map(x=>[x.id,x])),areas=new Map(D.areas.map(x=>[x.id,x])),refs=new Map(),uses=new Map();
  function add(id,r){if(!items.has(id))return;const rows=refs.get(id)||[],key=r.key||[r.kind,r.href,r.label].join('|');if(!rows.some(x=>x.key===key))rows.push({...r,key});refs.set(id,rows)}
  const link=(page,id)=>'#'+page+(id?'?id='+encodeURIComponent(id):'');
  for(const [id,rows]of inherited)for(const r of rows)add(id,r);
  for(const m of D.monsters)for(const d of m.drops||[])add(d.itemId,{key:'monster:'+m.id,kind:m.bossView?'boss':'monster',id:m.id,href:link('monsters',m.id),label:label(m)+'掉落'});
  for(const r of D.serverGuide?.observedDrops||[])add(r.itemId,{key:'observed:'+r.monsterId,kind:'monster',id:r.monsterId,href:link('monsters',r.monsterId),label:(mobs.has(r.monsterId)?label(mobs.get(r.monsterId)):r.monsterId)+'掉落（已確認）'});
  for(const [floor,pool]of Object.entries(D.serverGuide?.floorDrops||{}))for(const id of pool.items||[])add(id,{key:'floorDrop:'+floor,kind:'monster',floor:+floor,href:'#floors?floor='+floor,label:'第 '+floor+' 層共通掉落池'});
  for(const a of D.areas)for(const s of a.shop||[])add(s.itemId,{key:'shop:'+a.id,kind:'shop',id:a.id,floor:a.floor,href:link('floors',a.id),label:'第 '+a.floor+' 層 · '+label(a)+'商店'});
  for(const s of D.serverGuide?.granny||[])add(s.itemId,{key:'granny:'+s.itemId,kind:'shop',floor:1,href:'#quests?floor=1',label:'阿嬤商店'});
  const space=D.serverGuide?.space;if(space)for(const s of space.entries||[])add(s.itemId,{key:'space:'+s.itemId,kind:'shop',floor:space.floor,href:'#quests?floor='+space.floor,label:'第 '+space.floor+' 層起商店'});
  for(const s of D.serverGuide?.pointShop||[])add(s.id,{key:'point:'+s.id,kind:'points',href:'#quests?type=points',label:'點數商店'});
  function use(id,r){const rows=uses.get(id)||[];if(!rows.some(x=>x.key===r.key))rows.push(r);uses.set(id,rows)}
  for(const ch of D.chapters){
   const title=complete(ch.title)?text(ch.title):ch.id;
   for(const [i,step]of (ch.steps||[]).entries())if(step.goal?.kind==='collect'){
    use(step.goal.itemId,{key:'goal:'+ch.id+':'+i,kind:'quest',floor:ch.floor,href:link('quests',ch.id),label:title+' · 第 '+(i+1)+' 步需要 '+(step.goal.qty||1)+' 件'});
    if(mobs.has(step.goal.from))add(step.goal.itemId,{key:'quest-target:'+ch.id+':'+i,kind:'monster',id:step.goal.from,floor:ch.floor,href:link('monsters',step.goal.from),label:'任務指定怪物：'+label(mobs.get(step.goal.from))+'（'+title+'）'});
   }
   for(const reward of [ch.reward,...(ch.steps||[]).map(x=>x.reward)]){for(const r of reward?.items||[])add(r.itemId,{key:'quest:'+ch.id,kind:'quest',floor:ch.floor,href:link('quests',ch.id),label:title+'任務獎勵'});for(const id of reward?.choose||[])add(id,{key:'choice:'+ch.id,kind:'quest',floor:ch.floor,href:link('quests',ch.id),label:title+'獎勵（擇一）'})}
  }
  for(const q of D.sideQuests){for(const r of q.reward?.items||[])add(r.itemId,{key:'side:'+q.id,kind:'quest',floor:q.floor,href:link('quests',q.id),label:'第 '+q.floor+' 層支線獎勵'});if(q.type==='collect')use(q.target,{key:'side:'+q.id,kind:'quest',floor:q.floor,href:link('quests',q.id),label:'第 '+q.floor+' 層支線收集 '+(q.qty||1)+' 件'})}
  for(const [i,r]of (D.serverGuide?.recipes||[]).entries()){
   const input=Object.entries(r.in).map(([id,n])=>label(items.get(id)||{id})+' ×'+n).join(' ＋ '),output=r.out.map(x=>(x.id?label(items.get(x.id)||{id:x.id}):'隨機千石')+' ×'+x.n).join('、');
   for(const x of r.out)if(x.id)add(x.id,{key:'recipe:'+i,kind:'recipe',href:'#systems',label:'茸配：'+input+' → '+output});
   for(const [id]of Object.entries(r.in))use(id,{key:'recipe:'+i,kind:'recipe',href:'#systems',label:'茸配：'+input+' → '+output});
  }
  for(const m of Object.values(D.legacyMonsters||{}))for(const d of m.drops||[])add(d.itemId,{key:'legacy:'+m.id,kind:'legacy',id:m.id,href:link('monsters',m.id),label:label(m)+'掉落（舊版參考）'});
  // The game creates mat-<monster id> definitions from that monster's material.
  for(const x of D.items.filter(included))if(x.id.startsWith('mat-')){const id=x.id.slice(4),m=mobs.get(id);if(m&&!(refs.get(x.id)||[]).some(r=>r.id===id&&r.kind!=='legacy'))add(x.id,{key:'material:'+id,kind:'monster',id,href:link('monsters',id),label:'素材對應怪物：'+label(m)})}
  const rank=r=>r.key.startsWith('observed:')?0:r.kind==='recipe'?1:r.kind==='shop'||r.kind==='points'?2:r.kind==='quest'?3:r.kind==='legacy'?5:4;
  const rows=D.items.filter(included).map(item=>{
   const sources=(refs.get(item.id)||[]).map(r=>{const floor=r.floor??mobs.get(r.id)?.floor??areas.get(r.id)?.floor??Number(/^f(\d+)-/.exec(r.id||'')?.[1]);return {...r,floor:Number.isInteger(floor)&&floor>0?floor:null}}).sort((a,b)=>rank(a)-rank(b)||a.label.localeCompare(b.label,'zh-Hant',{numeric:true}));
   const usage=uses.get(item.id)||[],description=complete(item.desc)?text(item.desc):'',cat=category(item),name=label(item);
   return {item,id:item.id,name,known:complete(item.name),category:cat,description,sources,usage,floors:[...new Set([...sources,...usage].map(r=>r.floor).filter(Number.isInteger))],search:[name,item.id,description,categories[cat],...sources.map(r=>r.label),...usage.map(r=>r.label)].join(' ').toLowerCase()};
  });return{rows,categories,items};
 }
 function create(c){
  const {D,main,esc,nf}=c,$=id=>main.querySelector('#'+id),nameOf=id=>label(D.items.find(x=>x.id===id)||{id}),materialLink=id=>'#materials?item='+encodeURIComponent(id);
  const tabs=quest=>'<div class="tag-row material-catalogue-tabs"><a class="button '+(quest?'secondary':'')+'" href="#materials"'+(!quest?' aria-current="page"':'')+'>素材圖鑑</a><a class="button '+(quest?'':'secondary')+'" href="#materials?view=quests"'+(quest?' aria-current="page"':'')+'>任務素材（獨特）</a></div>';
  function sourceLink(r){let href=r.href;if(!href&&r.page)href='#'+r.page+(r.id?'?id='+encodeURIComponent(r.id):'');return /^#(?:monsters|floors|quests|systems|materials|equipment)(?:\?|$)/.test(href||'')?'<a href="'+esc(href)+'">'+esc(r.label)+'</a>':esc(r.label)}
  function sourceList(rows,short=false){if(!rows.length)return'<span class="subtle">來源尚未取得</span>';const shown=short?rows.slice(0,2):rows,rest=short?rows.slice(2):[];return shown.map(r=>'<div'+(r.kind==='legacy'?' class="legacy-value"':'')+'>'+sourceLink(r)+'</div>').join('')+(rest.length?'<details class="material-more-sources"><summary>另有 '+rest.length+' 個來源</summary>'+rest.map(r=>'<div'+(r.kind==='legacy'?' class="legacy-value"':'')+'>'+sourceLink(r)+'</div>').join('')+'</details>':'')}
  function open(id){const model=buildIndex(D,c.sources),row=model.rows.find(x=>x.id===id);if(!row)return;
   const related=(D.serverGuide?.recipes||[]).filter(r=>Object.hasOwn(r.in,id)||r.out.some(x=>x.id===id));
   const ingredient=(id,n)=>'<a href="'+materialLink(id)+'">'+esc(nameOf(id))+'</a> ×'+nf(n);
   c.detail(row.known?row.name:'名稱未取得（'+row.id+'）','<div class="tag-row">'+c.tag(categories[row.category],'blue')+'</div><p>'+esc(row.description||'說明尚未取得')+'</p><p class="section-note">素材代碼：'+esc(row.id)+(Number.isFinite(row.item.price)?' · 標示價值 '+nf(row.item.price)+' 摳':'')+'</p><section><h3>取得來源</h3>'+sourceList(row.sources)+'</section>'+(row.usage.length?'<section><h3>已知用途</h3>'+row.usage.map(r=>'<p>'+sourceLink(r)+'</p>').join('')+'</section>':'')+(related.length?'<section><h3>已確認茸配配方</h3><div class="table-wrap"><table><thead><tr><th>材料</th><th>產物</th></tr></thead><tbody>'+related.map(r=>'<tr><td>'+Object.entries(r.in).map(([id,n])=>ingredient(id,n)).join(' ＋ ')+'</td><td>'+r.out.map(x=>x.id?ingredient(x.id,x.n):'隨機千石 ×'+nf(x.n)).join('、')+'</td></tr>').join('')+'</tbody></table></div></section>':''));
  }
  main.addEventListener('click',e=>{const a=e.target.closest('[data-material-open]');if(a){e.preventDefault();open(a.dataset.materialOpen)}});
  function render(params){
   const model=buildIndex(D,c.sources),order=Object.keys(categories);let page=1;const size=50;
   document.title='素材圖鑑｜SAO 攻略資料庫';document.getElementById('breadcrumb').textContent='素材圖鑑';
   main.innerHTML='<div class="page-intro"><div><div class="eyebrow">DATABASE / MATERIAL ENCYCLOPEDIA</div><h1>素材圖鑑</h1><p>查怪物素材、礦石、魔石、千石、預告籤、食材與任務物品的用途及取得來源。</p></div></div>'+tabs(false)+'<p class="section-note">已確認掉落、素材對應怪物與舊版參考分開標示；未公開名稱顯示素材代碼。標示價值供參考，買賣價格以遊戲商店為準。</p><div class="filters"><input id="mat-q" type="search" aria-label="搜尋素材、用途或怪物" placeholder="搜尋素材、用途、怪物或代碼…"><select id="mat-category" aria-label="素材分類"><option value="all">全部素材分類</option>'+Object.entries(categories).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('')+'</select><select id="mat-source" aria-label="取得來源"><option value="all">全部取得來源</option><option value="monster">怪物／樓層來源</option><option value="shop">商店／點數商店</option><option value="quest">任務獎勵</option><option value="recipe">茸配製作</option><option value="legacy">舊版參考</option><option value="unknown">來源未取得</option></select><select id="mat-floor" aria-label="素材來源樓層"><option value="all">全部樓層</option>'+D.floors.map(x=>'<option value="'+x.floor+'">第 '+x.floor+' 層</option>').join('')+'</select><select id="mat-sort" aria-label="素材排序"><option value="category">依分類／名稱</option><option value="name">依名稱</option><option value="value-desc">標示價值由高到低</option><option value="value-asc">標示價值由低到高</option></select><button class="button secondary small" id="mat-reset">重設篩選</button><span class="count" id="mat-count"></span></div><div class="table-wrap material-catalogue-wrap" role="region" aria-label="素材圖鑑表格，可左右捲動" tabindex="0"><table class="gear-table material-catalogue-table"><thead><tr><th scope="col">素材名稱</th><th scope="col">分類</th><th scope="col">用途／說明</th><th scope="col">標示價值（摳）</th><th scope="col">取得來源</th></tr></thead><tbody id="mat-results"></tbody></table></div><div class="filters"><button class="button secondary" id="mat-prev">上一頁</button><span id="mat-page" class="subtle"></span><button class="button secondary" id="mat-next">下一頁</button></div>';
   $('mat-q').closest('.filters').classList.add('material-catalogue-filters');
   const selected=params.get('item');$('mat-q').value=params.get('q')||selected||'';for(const [id,key]of [['mat-category','category'],['mat-source','source'],['mat-floor','floor']])if([...$(id).options].some(x=>x.value===params.get(key)))$(id).value=params.get(key);
   function update(){const q=$('mat-q').value.trim().toLowerCase(),cat=$('mat-category').value,source=$('mat-source').value,floor=$('mat-floor').value,sort=$('mat-sort').value;
    const rows=model.rows.filter(r=>(cat==='all'||r.category===cat)&&(!q||r.search.includes(q))&&(floor==='all'||r.floors.includes(+floor))&&(source==='all'||(source==='unknown'?!r.sources.length:r.sources.some(s=>source==='shop'?['shop','points'].includes(s.kind):source==='monster'?['monster','boss'].includes(s.kind):s.kind===source)))).sort((a,b)=>{
     if(a.known!==b.known)return Number(b.known)-Number(a.known);if(sort.startsWith('value-'))return ((a.item.price||0)-(b.item.price||0))*(sort==='value-desc'?-1:1)||a.name.localeCompare(b.name,'zh-Hant',{numeric:true});return(sort==='category'?order.indexOf(a.category)-order.indexOf(b.category):0)||a.name.localeCompare(b.name,'zh-Hant',{numeric:true});
    });const pages=Math.max(1,Math.ceil(rows.length/size));page=Math.min(page,pages);
    $('mat-results').innerHTML=rows.length?rows.slice((page-1)*size,page*size).map(r=>'<tr data-material-row="'+esc(r.id)+'"><td class="gear-name"><a href="'+materialLink(r.id)+'" data-material-open="'+esc(r.id)+'">'+esc(r.known?r.name:'名稱未取得')+'</a><small class="v2-sub">'+esc(r.id)+'</small></td><td>'+esc(categories[r.category])+'</td><td class="material-description">'+esc(r.description||'說明尚未取得')+(r.usage.length?'<small class="v2-sub">'+r.usage.length+' 項已知任務／配方用途</small>':'')+'</td><td class="nowrap">'+(Number.isFinite(r.item.price)?nf(r.item.price):'—')+'</td><td class="gear-source">'+sourceList(r.sources,true)+'</td></tr>').join(''):'<tr><td colspan="5">沒有符合的素材，請調整搜尋或篩選。</td></tr>';
    $('mat-count').textContent=nf(rows.length)+' / '+nf(model.rows.length)+' 項素材';$('mat-page').textContent='第 '+page+' / '+pages+' 頁';$('mat-prev').disabled=page===1;$('mat-next').disabled=page===pages;
   }
   for(const id of ['mat-q','mat-category','mat-source','mat-floor','mat-sort'])$(id).addEventListener(id==='mat-q'?'input':'change',()=>{page=1;update()});$('mat-prev').onclick=()=>{page=Math.max(1,page-1);update()};$('mat-next').onclick=()=>{page++;update()};$('mat-reset').onclick=()=>{$('mat-q').value='';for(const id of ['mat-category','mat-source','mat-floor'])$(id).value='all';$('mat-sort').value='category';page=1;update()};update();if(selected)open(selected);
  }
  return{render,tabs};
 }
 const api={categories,included,category,buildIndex,create};if(typeof module==='object')module.exports=api;if(root)root.SAOMaterialCatalogue=api;
})(typeof window==='object'?window:null);
