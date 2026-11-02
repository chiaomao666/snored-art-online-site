(function(root){
 'use strict';
 const kinds={normal:'一般怪物',rare:'稀有怪物',secret:'秘境怪物',boss:'頭目',story:'主線專屬怪物'};
 function create(D,M,extra){
  const areas=new Map([...D.areas,...D.secretAreas,...D.bossAreas,...M.storyAreas].map(a=>[a.id,a]));
  const index=new Map(D.equipment.map(e=>[e.id,{monster:[],boss:[],shop:[],quest:[],search:''}]));
  for(const m of M.monsters)for(const d of [...m.drops,...M.dropTables[m.dropTable]])for(const id of d.pool??[d.itemId]){
   const e=index.get(id);if(!e)continue;
   e[m.kind==='boss'?'boss':'monster'].push({id:m.id,name:m.name,kind:m.kind,floor:m.floor,level:m.level,levelHidden:!!m.levelHidden,areas:m.areaIds.map(id=>({id,name:areas.get(id).name,story:M.storyAreas.some(a=>a.id===id)})),chance:d.chance,poolSize:d.pool?.length??0,repeat:!!d.repeat});
  }
  for(const a of extra.shops)for(const id of a.itemIds){const e=index.get(id);if(e)e.shop.push({id:a.id,name:a.name,floor:a.floor});}
  for(const q of extra.quests){const e=index.get(q.itemId);if(e)e.quest.push(q);}
  for(const e of index.values()){
   for(const key of ['monster','boss','shop','quest'])e[key].sort((a,b)=>a.floor-b.floor||(a.level??0)-(b.level??0)||String(a.id??a.questId).localeCompare(String(b.id??b.questId)));
   e.search=[...e.monster,...e.boss].flatMap(m=>[m.name,kinds[m.kind],...m.areas.map(a=>a.name)]).concat(e.shop.map(a=>a.name),e.quest.map(q=>q.title)).join(' ').toLocaleLowerCase();
  }
  return index;
 }
 function floorText(rows){
  const values=[...new Set(rows.map(x=>x.floor))].sort((a,b)=>a-b),ranges=[];
  for(let i=0;i<values.length;i++){let end=i;while(values[end+1]===values[end]+1)end++;ranges.push(values[i]===values[end]?String(values[i]):values[i]+'–'+values[end]);i=end;}
  return values.length?'第 '+ranges.join('、')+' 層':'';
 }
 function matches(entry,kind){if(kind==='all')return true;if(kind==='unknown')return !entry||!['monster','boss','shop','quest'].some(k=>entry[k].length);return !!entry?.[kind]?.length;}
 const api={create,floorText,matches,kinds};root.EquipmentSources=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
