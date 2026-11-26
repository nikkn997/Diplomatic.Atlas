// Cloudflare Pages: only the four public live data endpoints use KV.
// Static research pages and every other asset retain the original Pages behavior.
const dataPaths=new Map([
 ['/data/liveNews.json',['liveNews',null]],['/data/liveNews.js',['liveNews','ATLAS_LIVE_NEWS']],
 ['/data/liveEvents.json',['liveEvents',null]],['/data/liveEvents.js',['liveEvents','ATLAS_LIVE_EVENTS']],
 ['/data/indicators.json',['indicators',null]],['/data/indicators.js',['indicators','ATLAS_INDICATORS']]
]);
function response(body,type,head){return new Response(head?null:body,{headers:{'content-type':type,'cache-control':'no-store','x-robots-tag':'noindex','x-content-type-options':'nosniff','access-control-allow-origin':'*'}});}
export default {
 async fetch(request,env){
  const url=new URL(request.url),head=request.method==='HEAD';
  if(url.pathname==='/research-studio.html'&&(request.method==='GET'||head))return new Response(head?null:'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, follow"><title>Diplomatic Atlas</title></head><body><main><h1>Diplomatic Atlas</h1><p>This section is temporarily unavailable.</p><p><a href="/">Return to Diplomatic Atlas</a></p></main></body></html>',{status:410,headers:{'content-type':'text/html; charset=utf-8','x-robots-tag':'noindex, follow','cache-control':'no-store'}});
  if((request.method!=='GET'&&!head)||(!dataPaths.has(url.pathname)&&url.pathname!=='/refresh-status.json'&&url.pathname!=='/data/shared-live.js'&&url.pathname!=='/data/research-live.json'))return env.ASSETS.fetch(request);
  try{
   const state=await env.ATLAS_LIVE.get('snapshot','json');
   if(!state)throw new Error('KV snapshot unavailable');
   if(url.pathname==='/data/research-live.json')return response(JSON.stringify(state.research||{}),'application/json; charset=utf-8',head);
   if(url.pathname==='/data/shared-live.js'){
    const globals={liveNews:'ATLAS_LIVE_NEWS',liveEvents:'ATLAS_LIVE_EVENTS',indicators:'ATLAS_INDICATORS'};
    const script=Object.entries(globals).filter(([key])=>state[key]).map(([key,name])=>'window.'+name+' = '+JSON.stringify(state[key]).replace(/</g,'\\u003c')+';\n').join('');
    return response(script,'application/javascript; charset=utf-8',head);
   }
   if(url.pathname==='/refresh-status.json'){
    const staticUrl=new URL('/refresh-status.json',request.url);
    const baseResponse=await env.ASSETS.fetch(new Request(staticUrl));
    const base=baseResponse.ok?await baseResponse.json():{};
    const sources={};
    for(const name of ['liveNews','liveEvents','indicators']){
      const data=state[name];if(data)sources[name]={updated_at:data.updated_at||null,status:data.status||null,count:Array.isArray(data.items)?data.items.length:Object.keys(data.countries||{}).length};
      else if(base.sources?.[name])sources[name]=base.sources[name];
    }
    const material=JSON.stringify([base.fingerprint,...Object.entries(state.research||{}).map(([k,v])=>[k,v.updated_at,v.status,v.items?.length]),...Object.entries(sources).map(([k,v])=>[k,v.updated_at,v.count,v.status])]);
    const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(material));
    const fingerprint=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');
    return response(JSON.stringify({...base,trigger:'cloudflare-cron',fingerprint,sources,checked_at:state.checked_at||null,failed_sources:state.failed_sources||[],research:Object.fromEntries(Object.entries(state.research||{}).map(([k,v])=>[k,{status:v.status,checked_at:v.checked_at,count:v.items?.length||0}]))}), 'application/json; charset=utf-8',head);
   }
   const [key,globalName]=dataPaths.get(url.pathname),data=state[key];if(!data)throw new Error('Missing data');
   const json=JSON.stringify(data);
   return globalName?response('window.'+globalName+' = '+json.replace(/</g,'\\u003c')+';\n','application/javascript; charset=utf-8',head):response(json,'application/json; charset=utf-8',head);
  }catch(err){console.warn('Live data fallback',String(err));return env.ASSETS.fetch(request);}
 }
};
