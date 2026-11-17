/* Local-only init import. Never logs, persists or transmits imported contents. */
(function(root){'use strict';
 const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 const utf8=new TextEncoder();
 function character(message){
  if(!isObject(message)||message.t!=='init')throw Error('只支援遊戲 init 或工具包匯出的 init 檔；舊角色快照與掛機收益檔已不支援。');
  const p=message.state?.player;
  if(!isObject(p)||typeof p.name!=='string'||!Number.isInteger(p.level)||p.level<1)throw Error('這則 init 沒有完整的角色名稱與等級。');
  return p;
 }
 function binary(base64){
  if(typeof base64!=='string'||base64.length%4!==0||/[^A-Za-z0-9+/=]/.test(base64)||/=/.test(base64.slice(0,-2))||(/=$/.test(base64.slice(0,-1))&&!/==$/.test(base64)))throw Error('init 二進位編碼無效。');
  return Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
 }
 async function frame(record){
  let data,text;
  if(record.payload?.kind==='text'&&typeof record.payload.text==='string'){text=record.payload.text;data=utf8.encode(text)}
  else if(record.payload?.kind==='binary'){data=binary(record.payload.base64);try{text=new TextDecoder('utf-8',{fatal:true}).decode(data)}catch{throw Error('init 二進位內容不是有效 UTF-8。')}}
  else throw Error('init 檔沒有完整的原始訊息。');
  if(record.byteLength!==undefined&&record.byteLength!==data.byteLength)throw Error('init 原文長度不符，檔案可能不完整。');
  if(record.sha256){
   if(typeof record.sha256!=='string'||! /^[a-f0-9]{64}$/i.test(record.sha256))throw Error('init 雜湊格式無效。');
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),x=>x.toString(16).padStart(2,'0')).join('');
   if(digest!==record.sha256.toLowerCase())throw Error('init 原文雜湊不符，檔案可能已損壞。');
  }
  let message;try{message=JSON.parse(text)}catch{throw Error('init 原文不是有效 JSON。')}
  return {player:character(message),at:typeof record.at==='string'?record.at:null};
 }
 function finish(rows,expected){
  if(!rows.length)throw Error('檔案內沒有可匯入的 init 角色資料。');
  if(expected!==undefined&&(!Number.isSafeInteger(expected)||expected!==rows.length))throw Error('init 筆數不符，檔案可能不完整。');
  let latest=0;
  for(let i=1;i<rows.length;i++){
   const a=Date.parse(rows[latest].at),b=Date.parse(rows[i].at);
   if(!Number.isFinite(a)||!Number.isFinite(b)||b>=a)latest=i;
  }
  return {snapshots:rows,selectedIndex:latest};
 }
 async function parseDocument(value){
  if(value?.t==='init')return finish([{player:character(value),at:null}]);
  if(value?.format==='sao-ws-init-v1'&&Array.isArray(value.records)){
   const rows=[];for(const record of value.records){if(record?.record!=='message')throw Error('init 快照包含不支援的紀錄。');rows.push(await frame(record))}
   return finish(rows,value.integrity?.messages);
  }
  character(value); // Gives a specific rejection for legacy snapshots.
 }
 async function* lines(file){
  const reader=file.stream().getReader(),decoder=new TextDecoder('utf-8',{fatal:true});let buffer='';
  try{while(true){const {done,value}=await reader.read();buffer+=done?decoder.decode():decoder.decode(value,{stream:true});let end;while((end=buffer.indexOf('\n'))!==-1){yield buffer.slice(0,end).replace(/\r$/,'');buffer=buffer.slice(end+1)}if(done){if(buffer)yield buffer;break}}}
  finally{reader.releaseLock()}
 }
 async function parseJsonl(file){
  const rows=[];let header=null,end=null,lineNumber=0;
  for await(const raw of lines(file)){
   lineNumber++;const text=raw.replace(/^\uFEFF/,'').trim();if(!text)continue;
   let record;try{record=JSON.parse(text)}catch{throw Error('第 '+lineNumber+' 行不是有效 JSON；init 檔可能尚未下載完整。')}
   if(end)throw Error('init 結尾標記後還有資料。');
   if(!header){if(record.record!=='manifest'||record.format!=='sao-ws-init-v1')throw Error('請選擇工具包「下載完整 init」匯出的檔案。');header=record;continue}
   if(record.record==='message')rows.push(await frame(record));
   else if(record.record==='end')end=record;
   else throw Error('第 '+lineNumber+' 行不是 init 訊息紀錄。');
  }
  if(!header||!end)throw Error('init 檔缺少檔頭或結尾，請重新下載完整檔案。');
  const result=finish(rows,header.integrity?.messages);finish(rows,end.integrity?.messages);return result;
 }
 async function parseFile(file){
  if(/\.jsonl$/i.test(file.name||''))return parseJsonl(file);
  let value;try{value=JSON.parse((await file.text()).replace(/^\uFEFF/,''))}catch{throw Error('檔案不是有效 JSON；工具包匯出檔請保留 .jsonl 副檔名。')}
  return parseDocument(value);
 }
 const api={parseDocument,parseFile};
 if(typeof module==='object')module.exports=api;
 if(!root?.document)return;
 root.SAOInitImport=api;
 const document=root.document,esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const nf=x=>Number.isFinite(Number(x))?Number(x).toLocaleString('zh-TW',{maximumFractionDigits:2}):'—';
 const slots={weapon:'主手',offhand:'副手',head:'頭部',armor:'身體',hands:'手套',feet:'鞋子',neck:'項鍊',ear:'耳環一',ear2:'耳環二',accessory:'戒指一',ring2:'戒指二',cape:'披風'};
 const name=x=>typeof x==='string'?x:x?.zh||'';
 function show(p,target){
  const G=root.SAOCurrent,D=G.catalog,area=D.areas.find(x=>x.id===p.areaId),cleared=Array.isArray(p.clearedFloors)?p.clearedFloors.filter(Number.isInteger):[];
  const statNames=new Map(D.stats.map(x=>[x.id,x])),statSummary=bonus=>Object.entries(bonus||{}).map(([id,n])=>{
   const label=name(statNames.get(id)?.name)||({maxHp:'HP',speed:'武器攻速'}[id]||id),pct=statNames.get(id)?.unit==='pct'||['critDmg','taken','evade','block','dmgTaken'].includes(id);
   return esc(label)+' '+(Number(n)>0?'+':'')+nf(pct?Number(n)*100:n)+(pct?'%':'');
  }).join(' · ')||'—';
  const rows=G.slotKeys.map(slot=>{
   const id=p.equipment?.[slot];if(typeof id!=='string'||!id)return '';
   let item;try{item=G.nativeGear(p,id)}catch{}
   return '<tr><td>'+esc(slots[slot]||slot)+'</td><td>'+(item?'<a href="#equipment?id='+encodeURIComponent(item.id)+'">'+esc(name(item.name)||item.id)+'</a>':esc(id))+'</td><td>'+(item?statSummary(item.bonus):'物品資料尚未取得')+'</td></tr>';
  }).join('');
  target.innerHTML='<section class="panel"><h2>'+esc(p.name)+' · Lv'+esc(p.level)+'</h2><p>HP '+nf(p.hp||0)+' · 本級經驗 '+nf(p.exp||0)+'／'+nf(G.experience(p.level))+' · 摳 '+nf(p.col||0)+'</p><p>目前位置 <a href="#floors?id='+encodeURIComponent(p.areaId||'')+'">'+esc(name(area?.name)||p.areaId||'未知')+'</a> · 最高已通關 '+Math.max(0,...cleared)+' 層</p></section><section class="panel"><h2>裝備快照</h2>'+(rows?'<div class="table-wrap"><table><thead><tr><th>部位</th><th>裝備</th><th>實際性能</th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<p>這則 init 沒有已裝備物品。</p>')+'</section>';
 }
 function mount(){
  if(location.hash.slice(1).split('?')[0]!=='account')return;
  const old=document.getElementById('account-import');if(!old||old.hasAttribute('data-init-only'))return;
  // Replace the legacy input node entirely, removing its old-format handler.
  const input=old.cloneNode(false);input.value='';input.dataset.initOnly='';input.accept='.json,.jsonl,application/json,application/x-ndjson';input.setAttribute('aria-label','選擇 init JSON 或 JSONL 檔案');old.replaceWith(input);
  const section=input.closest('section');section.querySelector('h2').textContent='匯入 init 角色資料';section.querySelector('p').textContent='僅支援遊戲 init JSON 或工具包匯出的完整 init JSONL。檔案只在目前瀏覽器解析，不會上傳。';
  const intro=document.querySelector('#main-content .page-intro p');if(intro)intro.textContent='查詢角色資料，或匯入遊戲 init 檔案。';
  const status=document.createElement('p');status.id='account-import-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');section.append(status);
  const choose=document.createElement('label');choose.className='field';choose.hidden=true;choose.append(document.createTextNode('選擇 init 快照 '));const select=document.createElement('select');select.id='account-init-select';choose.append(select);section.append(choose);
  let snapshots=[];
  const active=()=>input.isConnected&&document.getElementById('account-import')===input;
  select.onchange=()=>{if(active())show(snapshots[Number(select.value)].player,document.getElementById('account-result'))};
  input.onchange=async()=>{
   const file=input.files?.[0];if(!file)return;
   input.disabled=true;status.textContent='正在讀取並核對 init…';choose.hidden=true;select.replaceChildren();snapshots=[];document.getElementById('account-result').replaceChildren();
   try{
    const result=await parseFile(file);if(!active())return;snapshots=result.snapshots;
    snapshots.forEach((x,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=x.player.name+' · Lv'+x.player.level+(x.at?' · '+(Number.isFinite(Date.parse(x.at))?new Date(x.at).toLocaleString():x.at):'')+' · 第 '+(i+1)+' 則';select.append(option)});
    select.value=String(result.selectedIndex);choose.hidden=snapshots.length<2;
    show(snapshots[result.selectedIndex].player,document.getElementById('account-result'));
    status.textContent='已匯入 '+snapshots.length+' 則 init，顯示'+(snapshots.length>1?'最新一則；可切換快照，各則角色資料分開顯示。':'此則角色資料。');
   }catch(e){if(active())status.textContent='讀取失敗：'+e.message}
   finally{if(active())input.disabled=false}
  };
 }
 root.addEventListener('hashchange',mount);new MutationObserver(mount).observe(document.getElementById('main-content'),{childList:true,subtree:true});mount();
})(typeof window==='object'?window:null);
