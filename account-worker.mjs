// Cloudflare Worker. No database, credential storage, gameplay commands or logs.
const GAME='https://dev-sao.potato-proxy.com';
const ALLOWED_ORIGIN='https://chiaomao666.github.io';
const budgets=new Map();
const publicError=(message,status=400)=>Object.assign(new Error(message),{status});
const integer=(v,max=1e12)=>Math.max(0,Math.min(max,Math.floor(Number(v)||0)));
const text=(v,n=120)=>typeof v==='string'?v.slice(0,n):'';
const numericMap=(x,max=2000)=>Object.fromEntries(Object.entries(x&&typeof x==='object'?x:{}).slice(0,max).filter(([k,v])=>k.length<=120&&typeof v==='number'&&Number.isFinite(v)).map(([k,v])=>[k,v]));
const strings=(x,max=1000)=>Array.isArray(x)?x.slice(0,max).filter(v=>typeof v==='string').map(v=>v.slice(0,120)):[];
export function projectPlayer(p){
 if(!p||typeof p.name!=='string')throw publicError('遊戲未回傳有效的角色資料。',502);
 const equipment=Object.fromEntries(Object.entries(p.equipment||{}).filter(([k,v])=>['weapon','offhand','head','armor','feet','neck','accessory','accessory2','ring2'].includes(k)&&typeof v==='string').map(([k,v])=>[k,text(v)]));
 const refs=new Set([...Object.values(equipment),...Object.keys(p.inventory||{})]);
 const gear=Object.fromEntries(Object.entries(p.gear||{}).filter(([id])=>refs.has('g:'+id)).slice(0,2000).map(([id,g])=>[id,{base:text(g.base),plus:integer(g.plus,100),enh:numericMap(g.enh,12),smith:numericMap(g.smith,12),tries:integer(g.tries,100)}]));
 return {name:text(p.name),level:integer(p.level,10000),hp:integer(p.hp),exp:integer(p.exp),col:integer(p.col),areaId:text(p.areaId),dead:!!p.dead,equipment,gear,inventory:numericMap(p.inventory),learnedSkills:strings(p.learnedSkills),skillSlots:strings(p.skillSlots,20),buffSlots:strings(p.buffSlots,20),skillXp:numericMap(p.skillXp),clearedFloors:Array.isArray(p.clearedFloors)?p.clearedFloors.slice(0,200).filter(v=>Number.isInteger(v)):[],questsDone:strings(p.questsDone),unlocks:{dualWield:!!p.unlocks?.dualWield,unique:strings(p.unlocks?.unique,10)},story:p.story?{ch:text(p.story.ch),step:integer(p.story.step,1000),n:integer(p.story.n)}:null};
}
async function limitedBody(request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw publicError('請使用 JSON 格式。',415);
 if(Number(request.headers.get('content-length')||0)>4096)throw publicError('輸入內容過長。',413);
 const reader=request.body?.getReader();if(!reader)throw publicError('請填寫遊戲帳號與密碼。');let bytes=0,chunks=[];
 for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>4096){await reader.cancel();throw publicError('輸入內容過長。',413)}chunks.push(value)}
 const raw=new Uint8Array(bytes);let at=0;for(const c of chunks){raw.set(c,at);at+=c.length}try{return JSON.parse(new TextDecoder().decode(raw))}catch{throw publicError('輸入格式錯誤。')}
}
function throttle(ip){const now=Date.now();for(const [key,v]of budgets)if(v.until<now)budgets.delete(key);const v=budgets.get(ip);if(v&&v.count>=5)throw publicError('查詢太頻繁，請稍候一分鐘再試。',429);if(budgets.size>5000)throw publicError('查詢服務忙碌中，請稍後再試。',503);budgets.set(ip,v?{...v,count:v.count+1}:{count:1,until:now+60000})}
async function gameJson(route,options,fetcher){
 const r=await fetcher(GAME+route,{...options,redirect:'manual',signal:AbortSignal.timeout(12000)});if(r.status>=300&&r.status<400)throw publicError('遊戲服務轉址，已停止傳送登入資料。',502);let data;try{data=await r.json()}catch{throw publicError('遊戲服務暫時無法回應，請稍後再試。',502)}
 if(!r.ok){const code=data.error||data.code;const messages={wrongLogin:'帳號或密碼錯誤。',needName:'找不到可查詢的帳號，請先到遊戲建立角色。',banned:'此帳號目前無法登入。',maintenance:'遊戲維護中，請稍後再試。',rateLimit:'登入太頻繁，請稍後再試。'};throw publicError(messages[code]||(r.status===401?'帳號或密碼錯誤。':'遊戲暫時無法完成查詢，請稍後再試。'),r.status===429?429:r.status>=500?502:400)}return data;
}
export async function readSnapshot(token,fetcher=fetch){
 const r=await fetcher(GAME+'/api/ws',{headers:{Upgrade:'websocket'},redirect:'manual',signal:AbortSignal.timeout(12000)}),ws=r.webSocket;
 if(!ws)throw publicError('無法連接角色資料服務，請稍後再試。',502);
 ws.accept();
 return new Promise((resolve,reject)=>{
  let done=false;const finish=(err,value)=>{if(done)return;done=true;clearTimeout(timer);try{ws.close(1000,'Snapshot complete')}catch{};err?reject(err):resolve(value)};
  const timer=setTimeout(()=>finish(publicError('角色資料讀取逾時，請稍後再查。',504)),18000);
  ws.addEventListener('message',e=>{let m;try{m=JSON.parse(e.data)}catch{return}if(m.t==='init'){try{finish(null,projectPlayer(m.state?.player))}catch(err){finish(err)}}else if(['kicked','replaced'].includes(m.t))finish(publicError('登入已被其他連線取代，請重新查詢。',409))});
  ws.addEventListener('error',()=>finish(publicError('角色連線中斷，請稍後再查。',502)));
  ws.addEventListener('close',()=>finish(publicError('未能取得角色資料；遊戲可能維護中或角色狀態暫時無法讀取。',502)));
  try{ws.send(JSON.stringify({t:'auth',token}))}catch{finish(publicError('角色連線建立失敗。',502))}
 });
}
export async function handle(request,fetcher=fetch){
 const url=new URL(request.url),origin=request.headers.get('Origin');
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private','Pragma':'no-cache','Vary':'Origin','X-Content-Type-Options':'nosniff'};
 if(origin===ALLOWED_ORIGIN)headers['Access-Control-Allow-Origin']=origin;
 const reply=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
 if(url.pathname==='/health'&&request.method==='GET')return reply({ok:true,service:'sao-account-query',version:2});
 if(origin!==ALLOWED_ORIGIN)return reply({error:'此查詢服務僅供攻略站使用。'},403);
 if(url.pathname!=='/query'||url.search)return reply({error:'找不到此功能。'},404);
 if(request.method==='OPTIONS'){headers['Access-Control-Allow-Methods']='POST, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type';headers['Access-Control-Max-Age']='600';return new Response(null,{status:204,headers})}
 if(request.method!=='POST')return reply({error:'請使用查詢表單。'},405);
 try{
  const body=await limitedBody(request);if(!body||typeof body!=='object'||Array.isArray(body))throw publicError('輸入格式錯誤。');const account=typeof body.account==='string'?body.account.trim():'',password=typeof body.password==='string'?body.password:'';
  if(!account||account.length>64||!password||password.length>64||body.acknowledged!==true)throw publicError('請填寫遊戲帳號、密碼，並確認登入中斷提醒。');
  throttle(request.headers.get('CF-Connecting-IP')||'unknown');
  const auth=await gameJson('/api/link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({account,password})},fetcher);
  if(!auth.token)throw publicError('登入未完成，請先回遊戲確認帳號狀態。',502);
  if(auth.mustChange)throw publicError('遊戲要求更新帳號或密碼，請先回遊戲完成；本次登入可能已中斷原遊戲。',409);
  const me=await gameJson('/api/me',{headers:{Authorization:'Bearer '+auth.token}},fetcher);
  const characters=(Array.isArray(me.characters)?me.characters:[]).slice(0,100).map(c=>({name:text(c.name),floor:integer(c.floor,200),dead:!!c.dead}));
  const player=auth.dead||!characters.some(c=>!c.dead)?null:await readSnapshot(auth.token,fetcher);
  return reply({queriedAt:new Date().toISOString(),characters,player});
 }catch(e){return reply({error:e.status?e.message:'查詢暫時失敗，請稍後再試；若已登入成功，原遊戲連線可能已中斷。'},e.status||502)}
}
export default {fetch:request=>handle(request)};
