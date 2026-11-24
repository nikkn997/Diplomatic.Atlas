// Cloudflare Pages: only the four public live data endpoints use KV.
// Static research pages and every other asset retain the original Pages behavior.
const dataPaths=new Map([
 ['/data/liveNews.json',['liveNews',null]],['/data/liveNews.js',['liveNews','ATLAS_LIVE_NEWS']],
 ['/data/liveEvents.json',['liveEvents',null]],['/data/liveEvents.js',['liveEvents','ATLAS_LIVE_EVENTS']],
 ['/data/indicators.json',['indicators',null]],['/data/indicators.js',['indicators','ATLAS_INDICATORS']]
]);
function response(body,type,head){return new Response(head?null:body,{headers:{'content-type':type,'cache-control':'no-store','x-robots-tag':'noindex','x-content-type-options':'nosniff'}});}
export default {
 async fetch(request,env){
  const url=new URL(request.url),head=request.method==='HEAD';
  if((request.method!=='GET'&&!head)||(!dataPaths.has(url.pathname)&&url.pathname!=='/refresh-status.json'))return env.ASSETS.fetch(request);
  try{
   const state=await env.ATLAS_LIVE.get('snapshot','json');
   if(!state)throw new Error('KV snapshot unavailable');
   if(url.pathname==='/refresh-status.json'){
    const staticUrl=new URL('/refresh-status.json',request.url);
    const baseResponse=await env.ASSETS.fetch(new Request(staticUrl));
    const base=baseResponse.ok?await baseResponse.json():{};
    const sources={};
    for(const name of ['liveNews','liveEvents','indicators']){
      const data=state[name];if(data)sources[name]={updated_at:data.updated_at||null,status:data.status||null,count:Array.isArray(data.items)?data.items.length:Object.keys(data.countries||{}).length};
      else if(base.sources?.[name])sources[name]=base.sources[name];
    }
    const material=JSON.stringify([base.fingerprint,...Object.entries(sources).map(([k,v])=>[k,v.updated_at,v.count,v.status])]);
    const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(material));
    const fingerprint=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');
    return response(JSON.stringify({...base,trigger:'cloudflare-cron',fingerprint,sources,checked_at:state.checked_at||null,failed_sources:state.failed_sources||[]}), 'application/json; charset=utf-8',head);
   }
   const [key,globalName]=dataPaths.get(url.pathname),data=state[key];if(!data)throw new Error('Missing data');
   const json=JSON.stringify(data);
   return globalName?response('window.'+globalName+' = '+json.replace(/</g,'\\u003c')+';\n','application/javascript; charset=utf-8',head):response(json,'application/json; charset=utf-8',head);
  }catch(err){console.warn('Live data fallback',String(err));return env.ASSETS.fetch(request);}
 }
};
