const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const {parseDocument,parseFile}=require('./account-init-import.js');
const player=(name,level=20)=>({name,level,hp:100,exp:123,col:400,areaId:'f1-town',clearedFloors:[1]});
const message=(name)=>({t:'init',state:{player:player(name)},unknown:{unchanged:true}});
function record(value,at,binary=false){const text=JSON.stringify(value),bytes=Buffer.from(text);return{record:'message',at,byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),payload:binary?{kind:'binary',base64:bytes.toString('base64')}:{kind:'text',text}}}
function file(records,{count=records.length,end=true}={}){return new File([JSON.stringify({record:'manifest',format:'sao-ws-init-v1',integrity:{messages:count}})+'\r\n'+records.map(r=>JSON.stringify(r)).join('\r\n')+(end?'\r\n'+JSON.stringify({record:'end',integrity:{messages:count}}):'')],'SAO攻略init_fixture.jsonl')}
(async()=>{
 assert.equal((await parseDocument(message('raw'))).snapshots[0].player.name,'raw');
 for(const legacy of [{player:player('old')},{state:{player:player('old')}},{format:'farm',records:[]},{t:'auth'},{t:'patch',state:{player:player('wrong')}}])await assert.rejects(()=>parseDocument(legacy),/只支援遊戲 init/);
 const a=record(message('甲'),'2026-11-17T10:00:00Z'),b=record(message('乙'),'2026-11-17T09:00:00Z',true);
 let result=await parseFile(file([a,b]));assert.equal(result.selectedIndex,0);assert.deepEqual(result.snapshots.map(x=>x.player.name),['甲','乙']);
 result=await parseDocument({format:'sao-ws-init-v1',records:[a,b],integrity:{messages:2}});assert.equal(result.selectedIndex,0);
 result=await parseFile(new File([JSON.stringify(message('pretty'),null,2)],'init.json'));assert.equal(result.snapshots[0].player.name,'pretty');
 await assert.rejects(()=>parseFile(file([a],{count:2})),/筆數不符/);await assert.rejects(()=>parseFile(file([a],{end:false})),/缺少檔頭或結尾/);
 await assert.rejects(()=>parseFile(file([{...a,payload:{kind:'text',text:a.payload.text+' '}}])),/長度不符/);
 await assert.rejects(()=>parseFile(file([{...a,sha256:'0'.repeat(64)}])),/雜湊不符/);
 await assert.rejects(()=>parseFile(file([{...b,payload:{kind:'binary',base64:'not valid'}}])),/編碼無效/);
 await assert.rejects(()=>parseFile(file([record({t:'lore',player:player('wrong')},null)])),/只支援遊戲 init/);
 await assert.rejects(()=>parseFile(file([record({t:'init',state:{}},null)])),/沒有完整/);
 await assert.rejects(()=>parseFile(new File(['{broken}'],'init.json')),/有效 JSON/);
 await assert.rejects(()=>parseFile(new File(['{broken}\n'],'init.jsonl')),/第 1 行/);
 const many=Array.from({length:120},(_,i)=>record({...message('large-'+i),padding:'甲'.repeat(1000)},null));assert.equal((await parseFile(file(many))).snapshots.length,120,'streamed UTF-8 JSONL chunk boundaries');
 const h=record({player:player('HTTP角色'),unknown:{intact:true}},'2026-11-17T11:00:00Z',true);Object.assign(h,{record:'http-snapshot',source:'game-state-full',path:'/api/state/full',method:'GET',status:200});
 result=await parseDocument({format:'sao-init-capture-v2',records:[a,h],integrity:{messages:2}});assert.equal(result.snapshots[1].player.name,'HTTP角色');
 const v2=new File([JSON.stringify({record:'manifest',format:'sao-init-capture-v2',integrity:{messages:1}})+'\n'+JSON.stringify(h)+'\n'+JSON.stringify({record:'end',integrity:{messages:1}})],'http.jsonl');assert.equal((await parseFile(v2)).snapshots[0].player.name,'HTTP角色');
 await assert.rejects(()=>parseDocument({format:'sao-ws-init-v1',records:[h]}),/來源/);await assert.rejects(()=>parseDocument({format:'sao-init-capture-v2',records:[{...h,path:'/api/other'}]}),/來源/);await assert.rejects(()=>parseDocument({format:'sao-init-capture-v2',records:[{...h,status:401}]}),/來源/);
 const lore=record({t:'lore',items:[{id:'guide-item',kind:'equipment',slot:'armor',name:{zh:'圖鑑裝備'},bonus:{def:5}}],futureDefinition:{allFields:true}},null);Object.assign(lore,{record:'guide-message',source:'game-websocket',messageType:'lore'});const complete={format:'sao-guide-contribution-v2',records:[a,h],guideRecords:[lore],integrity:{messages:2,guideMessages:1}};result=await parseDocument(complete);assert.equal(result.snapshots.length,2);assert.equal(result.evidence.data.catalogue.items[0].id,'guide-item');assert.equal(result.contribution.guideRecords[0].payload.text,lore.payload.text);await assert.rejects(()=>parseDocument({...complete,guideRecords:[{...lore,sha256:'0'.repeat(64)}]}),/雜湊不符/);assert.equal((await parseDocument({format:'sao-init-guide-evidence-v1',data:{observedDrops:[],observedSkills:{},observedHp:{}}})).snapshots.length,0);
 console.log('Passed init-only imports: raw/pretty JSON, tool text/binary JSONL, multiple characters/latest selection, streamed Unicode, legacy/auth/patch rejection, truncation/count/length/hash validation.');
})().catch(e=>{console.error(e);process.exitCode=1});
