import site from './site_old.js';
import M from './mobile.js';
import {A,B} from './pcinject.js';
const MOB=/Android|iPhone|iPod|Mobile|Opera Mini|IEMobile|webOS|BlackBerry/i;
export default{async fetch(req,env,ctx){
 const u=new URL(req.url),ua=req.headers.get('user-agent')||'',acc=req.headers.get('accept')||'';
 const pc=u.searchParams.get('ansicht')==='pc';
 if(!pc&&MOB.test(ua)&&req.method==='GET'&&acc.includes('text/html'))
  return new Response(M,{headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-cache','vary':'User-Agent'}});
 const r=await site.fetch(req,env,ctx);
 if(u.pathname==='/'&&(r.headers.get('content-type')||'').includes('text/html')){
  let t=await r.text();t=t.replace(/<\/body>(?![\s\S]*<\/body>)/,B+'</body>');
  const h=new Headers(r.headers);h.set('cache-control','no-cache');h.set('vary','User-Agent');h.delete('content-length');
  return new Response(t,{status:r.status,headers:h});}
 return r;
}};
