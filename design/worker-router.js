import site from './site_old.js';
import M from './mobile.js';
export default{async fetch(req,env,ctx){
 const u=new URL(req.url),acc=req.headers.get('accept')||'';
 const alt=u.searchParams.get('ansicht')==='alt';
 if(!alt&&u.pathname==='/'&&req.method==='GET'&&acc.includes('text/html'))
  return new Response(M,{headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-cache'}});
 return site.fetch(req,env,ctx);
}};
