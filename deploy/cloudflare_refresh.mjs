const FEEDS={"un":{"publisher":"UN News","url":"https://news.un.org/feed/subscribe/en/news/all/rss.xml"},"bbc":{"publisher":"BBC News","url":"https://feeds.bbci.co.uk/news/world/rss.xml"},"ungeneva":{"publisher":"UN Geneva","url":"https://www.ungeneva.org/news-media/press-items-list/rss.xml"},"geneva_meetings":{"publisher":"UN Geneva Meetings","url":"https://www.ungeneva.org/news-media/meeting-summaries-list/rss.xml"},"who":{"publisher":"World Health Organization","url":"https://www.who.int/rss-feeds/news-english.xml"},"wto":{"publisher":"World Trade Organization","url":"https://www.wto.org/library/rss/latest_news_e.xml"},"iaea":{"publisher":"International Atomic Energy Agency","url":"https://www.iaea.org/feeds/topnews"},"consilium":{"publisher":"Council of the European Union","url":"https://www.consilium.europa.eu/en/rss/pressreleases.ashx/"}};
const HOSTS={"un":["news.un.org"],"bbc":["www.bbc.com","www.bbc.co.uk","feeds.bbci.co.uk"],"ungeneva":["www.ungeneva.org","ungeneva.org"],"geneva_meetings":["www.ungeneva.org","ungeneva.org"],"who":["www.who.int","who.int"],"wto":["www.wto.org","wto.org"],"iaea":["www.iaea.org","iaea.org"],"consilium":["www.consilium.europa.eu","consilium.europa.eu"]};
const IMAGES=new Set(["news.un.org","www.un.org","media.un.org","static.un.org","ichef.bbci.co.uk","ichef.bbci.com","www.bbc.com","bbc.com","www.ungeneva.org","ungeneva.org","media.ungeneva.org","www.who.int","who.int","cdn.who.int","www.wto.org","wto.org","www.iaea.org","iaea.org","www.consilium.europa.eu","consilium.europa.eu","www.worldbank.org","worldbank.org","mediacenter.imf.org","www.imf.org","imf.org","www.unep.org","unep.org"]);
const PLACES={"Geneva":[46.204,6.144,"CHE"],"New York":[40.758,-73.985,"USA"],"Abu Dhabi":[24.454,54.377,"ARE"],"Antalya":[36.897,30.714,"TUR"],"Paris":[48.856,2.352,"FRA"],"Vienna":[48.208,16.373,"AUT"],"Istanbul":[41.008,28.978,"TUR"],"Nairobi":[-1.286,36.817,"KEN"],"Doha":[25.285,51.531,"QAT"],"Brussels":[50.85,4.352,"BEL"],"Rome":[41.903,12.496,"ITA"],"London":[51.507,-0.128,"GBR"],"Washington":[38.907,-77.037,"USA"],"Bangkok":[13.756,100.502,"THA"],"Seoul":[37.566,126.978,"KOR"],"Baku":[40.409,49.868,"AZE"],"Copenhagen":[55.676,12.568,"DNK"],"Madrid":[40.417,-3.703,"ESP"],"The Hague":[52.071,4.3,"NLD"],"Addis Ababa":[9.03,38.74,"ETH"],"Dubai":[25.204,55.27,"ARE"],"Berlin":[52.52,13.405,"DEU"],"Tokyo":[35.676,139.65,"JPN"],"Kigali":[-1.944,30.062,"RWA"],"Lisbon":[38.722,-9.139,"PRT"],"Helsinki":[60.169,24.938,"FIN"]};

const OFFICIAL=Object.keys(FEEDS).filter(k=>k!=='bbc');
const CITY=Object.keys(PLACES).sort((a,b)=>b.length-a.length).join('|');
const MEET='(?:talks?|summit|conference|meetings?|negotiations?|forum|roundtable|dialogue|delegations?)';
const VENUE=new RegExp(MEET+'.{0,70}?\\b(?:in|at)\\s+('+CITY+')\\b','i');
const INVERSE=new RegExp('\\b('+CITY+')\\s+'+MEET,'i');
const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
function decode(s){return String(s||'').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,k)=>{if(k[0]!=='#')return entities[k.toLowerCase()]||' ';const n=k[1].toLowerCase()==='x'?parseInt(k.slice(2),16):parseInt(k.slice(1),10);return n>0&&n<=0x10ffff&&!(n>=0xd800&&n<=0xdfff)?String.fromCodePoint(n):' ';});}
function plain(s){return decode(String(s||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1')).replace(/<[^>]{0,1000}>/g,' ').replace(/\s+/g,' ').trim();}
function tag(s,n){return (s.match(new RegExp('<'+n+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+n+'\\s*>','i'))||[])[1]||'';}
function attr(s,n){const m=s.match(new RegExp('\\b'+n+'\\s*=\\s*(?:"([^"]*)"|\\x27([^\\x27]*)\\x27)','i'));return m?decode(m[1]??m[2]):'';}
function safe(value,hosts){try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||!hosts.has(u.hostname))return '';u.hash='';return u.toString();}catch{return '';}}
function iso(t){return new Date(t).toISOString().replace(/\.\d{3}Z$/,'Z');}
export function parseFeed(xml,key,now=Date.now()){
 if(xml.length>2000000||/<!DOCTYPE|<!ENTITY/i.test(xml)||!/<(?:rss|feed)\b/i.test(xml))throw Error('Unsupported feed');
 const result=[];const allowed=new Set(HOSTS[key]);const publisher=FEEDS[key].publisher;
 for(const m of xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1\s*>/gi)){
  if(result.length>=40)break;const item=m[2];
  const title=plain(tag(item,'title'));
  const link=plain(tag(item,'link'))||Array.from(item.matchAll(/<link\b[^>]*>/gi)).map(x=>x[0]).filter(x=>!attr(x,'rel')||attr(x,'rel')==='alternate').map(x=>attr(x,'href')).find(Boolean)||'';
  const url=safe(link,allowed);
  const rawDate=plain(tag(item,'pubDate')||tag(item,'published')||tag(item,'dc:date')||tag(item,'dcterms:issued')||tag(item,'date'));const t=Date.parse(rawDate);const timePrecision=/\d{1,2}:\d{2}/.test(rawDate)&&!(/T00:00:00(?:Z|[+-]00:00)$/.test(rawDate))?'time':'date';
  if(!url||title.length<12||title.length>240||!Number.isFinite(t)||t>now+86400000||t<now-62*86400000)continue;
  const description=plain(tag(item,'description')||tag(item,'summary')||tag(item,'content:encoded'));
  const summary=description.length>260?description.slice(0,257)+'...':description;
  let image='',width=0;
  for(const entry of item.matchAll(/<(?:media:thumbnail|media:content|enclosure)\b[^>]*>/gi)){
    const a=entry[0],type=attr(a,'type'),medium=attr(a,'medium'),w=Number(attr(a,'width'))||0;
    if((type&&!type.startsWith('image/'))||(medium&&!['image','photo'].includes(medium))||(w&&w<280))continue;
    const link=safe(attr(a,'url'),IMAGES);
    if(!link||/\/logo|[-_]logo|favicon|placeholder|sprite|\/icon-|default-avatar/i.test(link))continue;
    if(!/\.(jpg|jpeg|png|webp|avif)(\?|$)|\/image[s]?\/|\/sites\/default\/files\/|\/media\/|\/resources\/|ichef\.bbci/i.test(link))continue;
    if(!image||w>width){image=link;width=w;}
  }
  result.push({source:key,publisher,title,url,published:iso(t),timePrecision,summary,image,category:'news',locationLabel:publisher,flagCode:'',imageCredit:image?publisher:'',imageType:image?'publisher RSS media':''});
 }
 return result;
}
function mergeNews(previous,rows,ok,now){
 const cutoff=iso(now-62*86400000);
 const map=new Map((previous.items||[]).filter(x=>x.url&&x.published>=cutoff).map(x=>[x.url.toLowerCase(),x]));
 for(const row of rows){const key=row.url.toLowerCase();const old=map.get(key)||{};const merged={...old,...row};for(const f of ['image','imageCredit','imageType','summary','translations','locationLabel','flagCode'])if(!row[f]&&old[f])merged[f]=old[f];map.set(key,merged);}
 const items=Array.from(map.values()).sort((a,b)=>b.published.localeCompare(a.published)).slice(0,200);
 const status=ok.length===Object.keys(FEEDS).length?'success':ok.length?'partial':'error';
 const data={items,status,sources:ok,media_count:items.filter(x=>x.image).length};
 const changed=JSON.stringify(items)!==JSON.stringify(previous.items)||status!==previous.status||JSON.stringify(ok)!==JSON.stringify(previous.sources);
 return {...previous,...data,updated_at:changed&&ok.length?iso(now):previous.updated_at};
}
export async function eventFromStory(a){
 if(!OFFICIAL.includes(a.source)||!safe(a.url,new Set(HOSTS[a.source])))return null;
 const match=VENUE.exec(a.title)||INVERSE.exec(a.title);if(!match)return null;
 const city=Object.keys(PLACES).find(k=>k.toLowerCase()===match[1].toLowerCase());if(!city)return null;
 const [lat,lon,country]=PLACES[city];const date=a.published.slice(0,10);if(!/^\d{4}-\d\d-\d\d$/.test(date))return null;
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(a.url));
 const id='feed-'+Array.from(new Uint8Array(digest).slice(0,7),b=>b.toString(16).padStart(2,'0')).join('');
 const title={en:a.title},description={en:(a.summary||'Official publisher headline; open the source for details.').slice(0,300)};
 for(const [lang,tr] of Object.entries(a.translations||{})){if(tr.title)title[lang]=tr.title;if(tr.summary)description[lang]=tr.summary;}
 return {id,date,category:/talk|negotiat|dialogue/i.test(a.title)?'negotiation':'multilateral',city,country,lat,lon,participants:[],title,description,publisher:a.publisher,source:a.url,automated:true,locationBasis:'City explicitly mentioned in an official publisher headline; approximate city-centre pin, not a verified venue or attendance.'};
}
async function updateEvents(previous,news,ok,now){
 const found=await Promise.all(news.items.filter(x=>OFFICIAL.includes(x.source)&&ok.includes(x.source)).map(eventFromStory));
 const map=new Map((previous.items||[]).map(x=>[x.id,x]));for(const e of found)if(e)map.set(e.id,e);
 const today=iso(now).slice(0,10),cutoff=iso(now-90*86400000).slice(0,10);
 const items=Array.from(map.values()).filter(x=>x.date>=cutoff&&x.date<=today).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,80);
 const sources=OFFICIAL.filter(x=>ok.includes(x));const status=sources.length===OFFICIAL.length?'success':sources.length?'partial':'error';
 return {...previous,items,sources,status,updated_at:sources.length&&(JSON.stringify(items)!==JSON.stringify(previous.items)||status!==previous.status)?iso(now):previous.updated_at};
}
async function refresh(env){
 const now=Date.now();const previous=await env.ATLAS_LIVE.get('snapshot','json');
 if(!previous||!previous.liveNews||!previous.liveEvents)throw Error('Seed snapshot unavailable');
 const settled=await Promise.allSettled(Object.entries(FEEDS).map(async([key,f])=>{
   const r=await fetch(f.url,{headers:{Accept:'application/rss+xml,application/atom+xml,application/xml,text/xml','User-Agent':'DiplomaticAtlasResearch/1.13'},signal:AbortSignal.timeout(18000)});
   if(!r.ok||Number(r.headers.get('content-length')||0)>2000000)throw Error(key+' HTTP '+r.status);
   const text=await r.text();
   return {key,items:parseFeed(text,key,now)};
 }));
 const ok=[],rows=[],diagnostics={};for(const [i,r] of settled.entries()){const key=Object.keys(FEEDS)[i];if(r.status==='fulfilled'){const count=r.value.items.length;diagnostics[key]={status:count?'ok':'empty',count};if(count)ok.push(key);rows.push(...r.value.items);}else diagnostics[key]={status:'error',count:0,reason:String(r.reason).slice(0,160)};}
 // Existing snapshots from the original research pipeline supply translations and indicators.
 // They are optional and never overwrite newer RSS records.
 let base=previous;
 try{
   const r=await fetch('https://raw.githubusercontent.com/nikkn997/Diplomatic.Atlas/main/snapshot-cache/liveNews.json',{cf:{cacheTtl:300},signal:AbortSignal.timeout(12000)});
   if(r.ok){const extra=await r.json();if(Array.isArray(extra.items)){
     const lookup=new Map(extra.items.map(x=>[x.url.toLowerCase(),x]));
     const items=previous.liveNews.items.map(x=>{const y=lookup.get(x.url.toLowerCase());return y?{...y,...x,translations:{...y.translations,...x.translations},image:x.image||y.image||''}:x;});
     const known=new Set(items.map(x=>x.url.toLowerCase()));for(const row of extra.items)if(row.url&&!known.has(row.url.toLowerCase()))items.push(row);
     base={...previous,liveNews:{...previous.liveNews,items}};
   }}
 }catch{}
 const liveNews=mergeNews(base.liveNews,rows,ok,now);
 const liveEvents=await updateEvents(previous.liveEvents,liveNews,ok,now);
 let indicators=previous.indicators;
 if(!previous.indicator_checked_at||now-Date.parse(previous.indicator_checked_at)>=6*3600000){
  try{const r=await fetch('https://raw.githubusercontent.com/nikkn997/Diplomatic.Atlas/main/snapshot-cache/indicators.json',{cf:{cacheTtl:300},signal:AbortSignal.timeout(12000)});if(r.ok){const d=await r.json();if(d.countries&&d.source&&d.updated_at&&d.updated_at>=indicators.updated_at)indicators=d;}}catch{}
  base={...base,indicator_checked_at:iso(now)};
 }
 const next={...base,liveNews:{...liveNews,diagnostics},liveEvents,indicators,checked_at:iso(now),failed_sources:Object.keys(FEEDS).filter(k=>!ok.includes(k))};
 await env.ATLAS_LIVE.put('snapshot',JSON.stringify(next));
 console.log(JSON.stringify({checked_at:next.checked_at,successful:ok,failed:next.failed_sources,news:liveNews.items.length,events:liveEvents.items.length}));
}
export default {
 async scheduled(controller,env,ctx){ctx.waitUntil(refresh(env));},
 async fetch(){return new Response('Not found',{status:404});}
};
