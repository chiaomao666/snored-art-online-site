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
 console.log('Passed init-only imports: raw/pretty JSON, tool text/binary JSONL, multiple characters/latest selection, streamed Unicode, legacy/auth/patch rejection, truncation/count/length/hash validation.');
})().catch(e=>{console.error(e);process.exitCode=1});
