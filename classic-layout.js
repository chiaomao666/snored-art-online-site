/* Preserve the original layout for tools that use the current calculation engine. */
window.SAOClassicLayout={
 gearControls(g,item){const G=window.SAOCurrent,dirs=G.enhanceDirections(item),cap=G.maxEnhance(item),sum=dirs.reduce((s,k)=>s+(g.enh?.[k]||0),0),labels=window.BuildGuide.directionsInfo;
 return `<p class="section-note build-enhance-limit"><strong>目前最高可規劃 +${cap}</strong></p><div class="build-enhance-controls"><label>強化次數<select data-classic-plus ${g.bonus?'disabled':''}>${Array.from({length:cap+1},(_,i)=>`<option value="${i}" ${i===sum?'selected':''}>+${i}</option>`).join('')}</select></label><label>強化重點<select data-classic-preset ${g.bonus?'disabled':''}><option value="balanced" ${!g.preset||g.preset==='balanced'?'selected':''}>平均分配</option>${dirs.map(k=>`<option value="${k}" ${g.preset===k?'selected':''}>全部${labels[k]?.[1]||k}</option>`).join('')}<option value="custom" ${g.preset==='custom'?'selected':''}>自訂分配</option></select></label></div>`;
 },
 apply(root,page){
  if(page==='build'&&!root.querySelector('.build-layout')){
   const controls=root.querySelector('.v2-build-controls'),gear=root.querySelector('#b-gear'),summary=root.querySelector('#build-summary');
   if(controls&&gear&&summary){
    controls.className='build-character panel';const fields=controls.querySelector('.v2-filters');if(fields){fields.className='build-toolbar';const role=fields.querySelector('#b-role')?.closest('label');if(role){const recommend=document.createElement('section');recommend.className='panel build-recommend-panel';recommend.innerHTML='<h2>推薦配裝</h2><p class="section-note">依角色等級與隊伍定位選擇新版有售基底裝備，可再自行調整。</p><div class="build-recommend-controls"></div>';const row=recommend.lastElementChild;row.append(role);const button=root.querySelector('#b-recommend');button.textContent='產生推薦配裝';row.append(button);controls.after(recommend);}}
    const save=root.querySelector('#build-message');if(save){save.id='build-message';save.className='section-note';controls.append(save);}
    const extra=[root.querySelector('#b-export'),root.querySelector('#b-import')?.closest('label')];for(const el of extra)if(el)el.hidden=true;
    const layout=document.createElement('div');layout.className='build-layout';const left=document.createElement('section');left.setAttribute('aria-label','裝備與強化設定');left.innerHTML='<div class="section-title"><div><h2>裝備與強化</h2><p>每件裝備下方以原始數值 ＋ 強化增加值顯示；綠色為強化增加值。</p></div></div>';
    layout.append(left);const aside=document.createElement('aside');aside.className='panel build-overview';aside.setAttribute('aria-label','配裝能力總覽');aside.innerHTML='<div class="build-overview-heading"><span class="eyebrow">YOUR BUILD</span><h2>能力總覽</h2><p>新版常駐能力試算</p></div>';layout.append(aside);gear.before(layout);left.append(gear);aside.append(summary);
    for(const [id,title]of [['b-talents','天賦與獨特技能'],['b-buffs','暫時增益與額外能力']]){const body=root.querySelector('#'+id);if(!body)continue;const details=document.createElement('details');details.className='panel build-character';const label=document.createElement('summary');label.textContent=title;details.append(label);body.before(details);details.append(body);body.hidden=false;layout.before(details);}
    root.querySelector('.v2-tabs')?.remove();root.querySelector('.eyebrow').textContent='TOOL / EQUIPMENT BUILDER';
   }
  }
  // Summary tiles are rendered with the same dt/dd template as the original builder.
  for(const grid of root.querySelectorAll('#build-summary .v2-metrics')){const dl=document.createElement('dl');dl.className='build-summary-grid';for(const child of grid.children){const div=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=child.querySelector('span')?.textContent||'';dd.textContent=child.querySelector('strong')?.textContent||'';div.append(dt,dd);dl.append(div);}grid.replaceWith(dl);}
  const aliases={'v2-note':'notice','v2-filters':'filters','v2-pagination':'filters','v2-geargrid':'build-slot-grid','v2-gearcard':'build-slot-card','v2-statline':'build-gear-stats','v2-base':'build-stat-base','v2-plus':'build-stat-enhancement','v2-enh':'build-direction-grid','v2-manualstats':'two-fields','v2-checkgrid':'build-buff-options','v2-nodegrid':'entry-grid','v2-node':'panel','v2-branch':'skill-effects','v2-checks':'build-unique-options','v2-queststeps':'timeline','v2-chips':'tag-row','v2-actions':'tag-row','v2-cards':'about-grid','v2-metrics':'stat-grid'};
  for(const [from,to]of Object.entries(aliases))for(const el of root.querySelectorAll('.'+from))el.classList.add(to);
  for(const el of root.querySelectorAll('.v2-metrics>div')){el.classList.add('stat');el.classList.remove('panel');}
  for(const el of root.querySelectorAll('.v2-gearcard')){
   el.classList.remove('panel');const title=el.querySelector(':scope>h2');if(title){const h=document.createElement('h3');h.textContent=title.textContent;const heading=document.createElement('div');heading.className='build-slot-heading';heading.append(h);title.replaceWith(heading);}
   const search=el.querySelector('[data-gear-search]');if(search)search.classList.add('build-item-search');
   const details=el.querySelector('details'),stats=el.querySelector('.v2-statline');if(details){details.classList.add('build-allocation');if(stats&&stats.previousElementSibling!==details)details.after(stats);}
  }
  for(const el of root.querySelectorAll('.v2-statline'))if(!el.classList.contains('build-gear-stats'))el.classList.add('build-gear-stats');
  if(page==='account'&&!root.querySelector('.account-layout')){const panels=[...root.querySelectorAll(':scope>.panel')];if(panels.length>=2){const wrap=document.createElement('div');wrap.className='account-layout';panels[0].before(wrap);panels[0].classList.add('account-login');panels[1].classList.add('account-how');wrap.append(panels[0],panels[1]);}}
 }
};
