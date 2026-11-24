import site from './site_old.js';
import M from './mobile.js';
const MOB=/Android|iPhone|iPod|Mobile|Opera Mini|IEMobile|webOS|BlackBerry/i;
export default{async fetch(req,env,ctx){
 const u=new URL(req.url),ua=req.headers.get('user-agent')||'',acc=req.headers.get('accept')||'';
 const pc=u.searchParams.get('ansicht')==='pc';
 if(!pc&&MOB.test(ua)&&req.method==='GET'&&acc.includes('text/html'))
  return new Response(M,{headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-cache','vary':'User-Agent'}});
 return site.fetch(req,env,ctx);
}};
