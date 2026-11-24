// Same-origin proxy for C compilation via Wandbox. No API key required.
// The code runs on Wandbox, not within Netlify. External service availability is not guaranteed.
const upstream = 'https://wandbox.org/api';
let compilerCache;
function json(status, obj) {
  return { statusCode:status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}, body:JSON.stringify(obj) };
}
async function upstreamJson(url, options={}, timeout=12000) {
  const ctl=new AbortController();
  const timer=setTimeout(()=>ctl.abort(),timeout);
  try {
    const resp=await fetch(url,{...options,signal:ctl.signal});
    if(!resp.ok)throw new Error('上游 HTTP '+resp.status);
    return await resp.json();
  } finally { clearTimeout(timer); }
}
async function chooseCompiler(){
  if(compilerCache)return compilerCache;
  try{
    const all=await upstreamJson(upstream+'/list.json',{},10000);
    const cs=all.filter(c=>c.language==='C');
    const selected=cs.find(c=>c.name==='gcc-head-c')||cs.find(c=>/^gcc/i.test(c.name))||cs[0];
    if(!selected)throw new Error('上游无 C 编译器');
    compilerCache=selected.name;
    return selected.name;
  } catch(e) { return 'gcc-head-c'; }
}
export async function handler(event){
  if(event.httpMethod!=='POST')return json(405,{error:'仅支持 POST 请求'});
  let input;
  try{input=JSON.parse(event.body||'{}');}catch(e){return json(400,{error:'JSON 格式错误'});}
  const code=input.code;
  if(typeof code!=='string'||!code.trim())return json(400,{error:'缺少 C 源代码'});
  if(code.length>100000)return json(413,{error:'源码超过 100 KB 限制'});
  try {
    const compiler=await chooseCompiler();
    const result=await upstreamJson(upstream+'/compile.json',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({compiler,code,stdin:'','compiler-option-raw':'-std=c11 -O0'})
    },30000);
    return json(200,result);
  } catch(e){
    return json(502,{error:'Wandbox 上游编译服务不可用：'+(e.name==='AbortError'?'请求超时':e.message)});
  }
}
