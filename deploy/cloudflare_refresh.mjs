const FEEDS={"un":{"publisher":"UN News","url":"https://news.un.org/feed/subscribe/en/news/all/rss.xml"},"bbc":{"publisher":"BBC News","url":"https://feeds.bbci.co.uk/news/world/rss.xml"},"ungeneva":{"publisher":"UN Geneva","url":"https://www.ungeneva.org/news-media/press-releases-list/rss.xml"},"geneva_meetings":{"publisher":"UN Geneva Meetings","url":"https://www.ungeneva.org/news-media/meeting-summaries-list/rss.xml"},"who":{"publisher":"World Health Organization","url":"https://www.who.int/rss-feeds/news-english.xml"},"wto":{"publisher":"World Trade Organization","url":"https://www.wto.org/library/rss/latest_news_e.xml"},"iaea":{"publisher":"International Atomic Energy Agency","url":"https://www.iaea.org/feeds/topnews"},"consilium":{"publisher":"Council of the European Union","url":"https://www.consilium.europa.eu/en/rss/pressreleases.ashx/"}};
const HOSTS={"un":["news.un.org"],"bbc":["www.bbc.com","www.bbc.co.uk","feeds.bbci.co.uk"],"ungeneva":["www.ungeneva.org","ungeneva.org"],"geneva_meetings":["www.ungeneva.org","ungeneva.org"],"who":["www.who.int","who.int"],"wto":["www.wto.org","wto.org"],"iaea":["www.iaea.org","iaea.org"],"consilium":["www.consilium.europa.eu","consilium.europa.eu"]};
const IMAGES=new Set(["global.unitednations.entermediadb.net","news.un.org","www.un.org","media.un.org","static.un.org","ichef.bbci.co.uk","ichef.bbci.com","www.bbc.com","bbc.com","www.ungeneva.org","ungeneva.org","media.ungeneva.org","www.who.int","who.int","cdn.who.int","www.wto.org","wto.org","www.iaea.org","iaea.org","www.consilium.europa.eu","consilium.europa.eu","www.worldbank.org","worldbank.org","mediacenter.imf.org","www.imf.org","imf.org","www.unep.org","unep.org"]);
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
  let url='';try{url=safe(new URL(link,FEEDS[key].url).href,allowed);}catch{}
  const rawDate=plain(tag(item,'pubDate')||tag(item,'published')||tag(item,'dc:date')||tag(item,'dcterms:issued')||tag(item,'date'));const t=Date.parse(rawDate);const timePrecision=/\d{1,2}:\d{2}/.test(rawDate)&&!(/T00:00:00(?:Z|[+-]00:00)$/.test(rawDate))?'time':'date';
  if(!url||!link||title.length<12||title.length>240||!Number.isFinite(t)||t>now+86400000||t<now-62*86400000)continue;
  const description=plain(tag(item,'description')||tag(item,'summary')||tag(item,'content:encoded'));
  const summary=description.length>260?description.slice(0,257)+'...':description;
  let image='',width=0;
  for(const entry of item.matchAll(/<(?:media:thumbnail|media:content|enclosure)\b[^>]*>/gi)){
    const a=entry[0],type=attr(a,'type'),medium=attr(a,'medium'),w=Number(attr(a,'width'))||0;
    if((type&&!type.startsWith('image/'))||(medium&&!['image','photo'].includes(medium))||(w&&w<280))continue;
    let link='';try{link=safe(new URL(attr(a,'url'),url).href,IMAGES);}catch{}
    if(!link||/\/logo|[-_]logo|favicon|placeholder|sprite|\/icon-|default-avatar/i.test(link))continue;
    if(!/\.(jpg|jpeg|png|webp|avif)(\?|$)|\/image[s]?\/|\/sites\/default\/files\/|\/media\/|\/resources\/|ichef\.bbci/i.test(link))continue;
    if(link.includes('global.unitednations.entermediadb.net')&&(key!=='un'||!new URL(link).pathname.startsWith('/assets/mediadb/services/module/asset/downloads/preset/')))continue;
    if(!image||w>width){image=link;width=w;}
  }
  if(!image){const html=decode(tag(item,'description')||tag(item,'content:encoded')||tag(item,'summary'));for(const match of html.matchAll(/<img\b[^>]*>/gi)){const src=attr(match[0],'src');if(!src)continue;let candidate='';try{candidate=safe(new URL(src,url).href,IMAGES);}catch{}if(candidate&&!/logo|favicon|placeholder|sprite|icon-|default-avatar|pixel|tracking/i.test(candidate)&&/\.(jpg|jpeg|png|webp|avif)(\?|$)|\/image[s]?\/|\/media\//i.test(candidate)){image=candidate;break;}}}
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


const RESEARCH_URLS={calendar:'https://www.un.org/calendar/en/date',votes:'https://digitallibrary.un.org/search?c=Voting%20Data&of=xm&rg=30&ln=en&sf=year&so=d',treaties:'https://treaties.un.org/'};
async function getResearch(url){const r=await fetch(url,{headers:{'User-Agent':'DiplomaticAtlasResearch/1.18','Accept':'application/xml,text/xml,text/html,application/json'},signal:AbortSignal.timeout(18000)});if(!r.ok)throw Error('HTTP '+r.status);const s=await r.text();if(/AwsWafIntegration|challenge-container|window\.gokuProps/i.test(s))throw Error('Official source returned bot challenge');if(s.length>2500000)throw Error('Response too large');return s;}
function anchors(html,base){const out=[];for(const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){try{const u=new URL(attr(m[1],'href'),base),t=plain(m[2]);if(u.protocol==='https:'&&u.hostname===new URL(base).hostname&&t.length>3)out.push({url:u.href,title:t.slice(0,250)});}catch{}}return out;}
function fullDate(s){s=String(s).trim();if(!/^(?:\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})$/.test(s))return '';const t=Date.parse(s+' 00:00:00 GMT');return Number.isFinite(t)?iso(t).slice(0,10):'';}

export function indicoRows(html,day,now){const out=[];
for(const match of html.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi)){
 if(!attr(match[1],'class').split(/\s+/).includes('event'))continue;
 const row=match[2],a=[...row.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].find(x=>/^\/event\/\d+\/?$/.test(attr(x[1],'href')));
 if(!a)continue;const title=plain(a[2]);if(!title||title.length>400||!/conference|forum|summit|session|dialogue|meeting|symposium|regional course|workshop|consultation|review|seminar|exchange/i.test(title)||/registration form|media nomination|test event|internal meeting|UNIS meeting/i.test(title))continue;
 const cell=(row.match(/<td\b[^>]*class=["']time["'][^>]*>([\s\S]*?)<\/td>/i)||[])[1]||'';
 const stamp=plain(attr((cell.match(/<span\b[^>]*>/i)||[])[0]||'','title'));
 const dates=[...stamp.matchAll(/\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b/g)].map(x=>fullDate(x[0])).filter(Boolean);
 let date=day,end=day,dateBasis='listed day';
 if(dates.length>=2){date=dates[0];end=dates[1];dateBasis='published date range';}
 else if(!/^\d{1,2}:\d{2}$/.test(plain(cell)))continue;
 if(end<iso(now).slice(0,10)||end<date)continue;
 const loc=(row.match(/<span\b[^>]*class=["']location-info[^"']*["'][^>]*>([\s\S]*?)<\/span>\s*<\/span>/i)||[])[1]||'';
 const venue=plain(loc).slice(0,250);
 const city=Object.keys(PLACES).find(c=>new RegExp('(?:^|[, (])'+c+'(?:$|[, )])','i').test(venue))||'';
 if(!city)continue;
 out.push({title:title.slice(0,250),city,date,end,dateBasis,venue,url:'https://indico.un.org'+attr(a[1],'href'),provisional:true});
}
return out;}
async function indicoCalendar(now){const dates=[0,1,2,3,4,5,6].map(i=>iso(now+i*86400000).slice(0,10));
const checks=[],map=new Map();
for(const day of dates){const url='https://indico.un.org/category/200/overview?date='+day+'&detail=event&openonly=false&period=day';try{const html=await getResearch(url),items=indicoRows(html,day,now);checks.push({url,count:items.length});for(const x of items){const old=map.get(x.url);if(!old||x.dateBasis==='published date range')map.set(x.url,x);else if(old.dateBasis==='listed day'&&x.date>old.end)map.set(x.url,{...old,end:x.date});}}catch(e){checks.push({url,count:0,error:String(e).slice(0,120)});}}
return {items:[...map.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(0,60),checks};}

function calendarRows(html,base,now){const out=[];for(const m of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){const cells=[...m[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>plain(x[1]));if(cells.length<4)continue;const dates=cells.map(fullDate);const i=dates.findIndex(Boolean);if(i<2||!dates[i+1])continue;const date=dates[i],end=dates[i+1],title=cells[i-2],city=cells[i-1];if(end<date||end<iso(now).slice(0,10)||!title||!city)continue;out.push({title:title.slice(0,250),city:city.slice(0,100),date,end,url:base,provisional:/to be confirmed|tentative|provisional/i.test(title)});}return out;}
export function marcRows(xml){xml=xml.replace(/<(\/?)[A-Za-z][\w.-]*:(?=(?:record|controlfield|datafield|subfield)\b)/g,'<$1');const out=[];for(const m of xml.matchAll(/<(?:\w+:)?record\b[^>]*>([\s\S]*?)<\/(?:\w+:)?record>/gi)){const rec=m[1],id=([...rec.matchAll(/<controlfield\b([^>]*)>([\s\S]*?)<\/controlfield>/gi)].find(x=>attr(x[1],'tag')==='001')?.[2]||'').trim();if(!/^\d+$/.test(id))continue;const fields={};for(const f of rec.matchAll(/<datafield\b([^>]*)>([\s\S]*?)<\/datafield>/gi)){const k=attr(f[1],'tag');const values=[...f[2].matchAll(/<subfield\b([^>]*)>([\s\S]*?)<\/subfield>/gi)].map(x=>({code:attr(x[1],'code'),value:plain(x[2])}));(fields[k]||=[]).push(values);}
const get=(k,c)=>(fields[k]||[]).flat().find(x=>x.code===c)?.value||'';
const title=get('245','a')||get('245','b');const symbol=[...(fields['191']||[]),...(fields['791']||[]),...(fields['089']||[]),...(fields['035']||[])].flat().map(x=>x.value).find(v=>/^(?:A|S)\/RES\//i.test(v))||'';const date=get('269','a')||get('260','c')||get('992','a');
if(!title||!(/^(?:A|S)\/RES\//.test(symbol)||/voting\s*data|\bVOT\b/i.test(JSON.stringify(fields['980']||[]))))continue;
out.push({title:title.slice(0,250),symbol,date:fullDate(date)||(/^\d{4}-\d{2}-\d{2}$/.test(date)?date:''),url:'https://digitallibrary.un.org/record/'+id});}return out;}
function voteHtml(html,base){const out=[];for(const m of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){const row=m[1],body=plain(row),symbol=(body.match(/\b(?:A|S)\/RES\/[\w()/-]+/)||[])[0],date=(body.match(/\b\d{4}-\d{2}-\d{2}\b/)||[])[0]||'';if(!symbol||!/Voting Data|RECORDED|ADOPTED WITHOUT VOTE/i.test(body))continue;const links=anchors(row,base).filter(x=>/\/record\/\d+/.test(x.url));const ref=links.find(x=>/Detailed record/i.test(x.title))||links[0];if(!ref)continue;let title=links.find(x=>x.title.length>20&&!/Detailed record|Similar records/i.test(x.title))?.title||body.split(/RECORDED|ADOPTED WITHOUT VOTE|Yes:|Voting Data/i)[0].trim().slice(0,250);if(!title)continue;const counts=body.match(/Yes:\s*(\d+)\s*No:\s*(\d+)\s*Abstentions:\s*(\d+)/i);out.push({title,symbol,date,url:ref.url,...(counts?{yes:Number(counts[1]),no:Number(counts[2]),abstain:Number(counts[3])}:{})});}return out;}
function researchRows(html,key,now,base=RESEARCH_URLS[key]){if(key==='calendar')return calendarRows(html,base,now);if(key==='votes')return [...marcRows(html),...voteHtml(html,base)];return anchors(html,base).filter(x=>/^(?:CN\.\d+\.\d{4}|C\.N\.\d+\.\d{4}|[IA]-\d{4,})\b/i.test(x.title));}
const RESEARCH_ALTERNATES={
 calendar:['https://www.un.org/calendar/en/date?order=uw_calendar_conference_to_date&organ=All&sort=desc','https://www.un.org/calendar/en/date?order=uw_search_aggregated_title&organ=All&page=1&sort=desc','https://www.un.org/calendar/en/date?order=uw_calendar_conference_to_date&sort=desc','https://www.un.org/calendar/en/date?page=1','https://www.un.org/calendar/en/date?page=2','https://www.un.org/calendar/en/venue'],
 votes:['https://digitallibrary.un.org/search?c=Voting%20Data&of=xm&rg=30&ln=en','https://digitallibrary.un.org/search?c=Voting%20Data&ln=en&rg=30','https://digitallibrary.un.org/collection/Voting%20Data?ln=en'],
 treaties:[]
};
async function researchUpdate(previous,now){const next={...previous};await Promise.all(Object.keys(RESEARCH_URLS).map(async k=>{const old=previous[k]||{},interval=k==='treaties'?86400000:3600000;if(old.parser_version===6&&old.checked_at&&now-Date.parse(old.checked_at)<(old.status==='success'?interval:900000))return;
const urls=[RESEARCH_URLS[k],...RESEARCH_ALTERNATES[k]],checks=[];let rows=[];
if(k==='calendar'){const result=await indicoCalendar(now);rows=result.items;checks.push(...result.checks);if(rows.length){next[k]={items:rows,checks,checked_at:iso(now),updated_at:iso(now),status:checks.some(c=>c.error)?'partial':'success',source:'https://indico.un.org/category/200/',parser_version:6};return;}}
for(const u of urls){try{const html=await getResearch(u),items=researchRows(html,k,now,u);checks.push({url:u,count:items.length,shape:{length:html.length,tables:(html.match(/<tr\b/gi)||[]).length,records:(html.match(/<record\b/gi)||[]).length,title:plain(tag(html,'title')).slice(0,100)}});rows.push(...items);if(k!=='calendar'&&items.length)break;}catch(e){checks.push({url:u,count:0,error:String(e).slice(0,120)});}}
rows=[...new Map(rows.map(x=>[k==='calendar'?x.title+'|'+x.date:x.url,x])).values()];if(k==='calendar')rows.sort((a,b)=>a.date.localeCompare(b.date));if(k==='votes')rows.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
const common={checked_at:iso(now),source:RESEARCH_URLS[k],checks,parser_version:6};
next[k]=rows.length?{...common,items:rows.slice(0,60),updated_at:iso(now),status:'success'}:{...old,...common,items:old.items||[],status:'error',reason:'No validated records from official endpoints'};
}));return next;}
async function refreshIndicators(previous,now){const codes={population:'SP.POP.TOTL',gdp:'NY.GDP.MKTP.CD',gdpPerCapita:'NY.GDP.PCAP.CD',lifeExpectancy:'SP.DYN.LE00.IN',inflation:'FP.CPI.TOTL.ZG',unemployment:'SL.UEM.TOTL.ZS'};const countries=JSON.parse(JSON.stringify(previous.countries||{}));const results=await Promise.allSettled(Object.entries(codes).map(async ([key,id])=>{const r=await fetch('https://api.worldbank.org/v2/country/all/indicator/'+id+'?format=json&mrnev=1&per_page=400',{signal:AbortSignal.timeout(18000)});if(!r.ok)throw Error('HTTP '+r.status);const data=await r.json();if(!Array.isArray(data[1])||Number(data[0]?.pages)>1)throw Error('Invalid response');let count=0;for(const x of data[1]){const code=x.countryiso3code,year=String(x.date||'');if(!countries[code]||x.indicator?.id!==id||!Number.isFinite(x.value)||!/^\d{4}$/.test(year))continue;const old=countries[code][key];if(!old||Number(old.year)<=Number(year))countries[code][key]={value:x.value,year};count++;}if(!count)throw Error('No values');return key;}));const ok=results.filter(x=>x.status==='fulfilled').length;return {...previous,countries,indicators:{...previous.indicators,...codes},checked_at:iso(now),updated_at:ok?iso(now):previous.updated_at,status:ok===6?'success':ok?'partial':'error',source:'https://api.worldbank.org/v2/',diagnostics:Object.fromEntries(Object.keys(codes).map((k,i)=>[k,results[i].status]))};}

async function refresh(env){
 const now=Date.now();const previous=await env.ATLAS_LIVE.get('snapshot','json');
 if(!previous||!previous.liveNews||!previous.liveEvents)throw Error('Seed snapshot unavailable');
 const settled=await Promise.allSettled(Object.entries(FEEDS).map(async([key,f])=>{
   const r=await fetch(f.url,{headers:{Accept:'application/rss+xml,application/atom+xml,application/xml,text/xml','User-Agent':'DiplomaticAtlasResearch/1.13'},signal:AbortSignal.timeout(18000)});
   if(!r.ok||Number(r.headers.get('content-length')||0)>2000000)throw Error(key+' HTTP '+r.status);
   const text=await r.text();
   const items=parseFeed(text,key,now);return {key,items,entries:(text.match(/<(?:\w+:)?(?:item|entry)\b/gi)||[]).length};
 }));
 const ok=[],rows=[],diagnostics={};for(const [i,r] of settled.entries()){const key=Object.keys(FEEDS)[i];if(r.status==='fulfilled'){const count=r.value.items.length;diagnostics[key]={status:count?'ok':'empty',count,entries:r.value.entries};if(count)ok.push(key);rows.push(...r.value.items);}else diagnostics[key]={status:'error',count:0,reason:String(r.reason).slice(0,160)};}
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
 let liveEvents=await updateEvents(previous.liveEvents,liveNews,ok,now);
 let indicators=previous.indicators;
 if(!previous.indicators?.checked_at||now-Date.parse(previous.indicators.checked_at)>=86400000){indicators=await refreshIndicators(previous.indicators,now);}
 const research=await researchUpdate(previous.research||{},now);
 // Only explicit official calendar venues; these are scheduled dates, not proof of attendance.
 const calendar=(research.calendar?.items||[]).filter(x=>x.end>=iso(now).slice(0,10)), calendarPins=[];
 for(const x of calendar){const city=Object.keys(PLACES).find(c=>x.city===c||x.city.startsWith(c+', '));if(!city||!x.date||!x.end)continue;const [lat,lon,country]=PLACES[city];const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x.title+'|'+x.date+'|'+city));const id='calendar-'+Array.from(new Uint8Array(hash).slice(0,7),b=>b.toString(16).padStart(2,'0')).join('');calendarPins.push({id,date:x.date,category:'multilateral',city,country,lat,lon,participants:[],title:{en:x.title},description:{en:'Scheduled in the official UN calendar; subject to change. Attendance and outcome are not confirmed.',ru:'Запланировано в официальном календаре ООН; возможны изменения. Участие и итоги не подтверждены.',fr:'Prévu au calendrier officiel de l’ONU; susceptible de modification. Participation et résultats non confirmés.',es:'Previsto en el calendario oficial de la ONU; sujeto a cambios. Participación y resultados no confirmados.',ar:'مدرج في التقويم الرسمي للأمم المتحدة؛ قابل للتغيير. المشاركة والنتائج غير مؤكدة.',zh:'列入联合国官方日程，可能调整；出席情况和结果尚未确认。'},publisher:x.url.startsWith('https://indico.un.org/')?'Indico.UN':'UN Calendar',source:x.url,automated:true,scheduled:true,locationBasis:'Official scheduled city; approximate city centre, not a verified venue.'});}
 const historical=liveEvents.items.filter(e=>!e.scheduled);const allPins=[...calendarPins,...historical].slice(0,80);liveEvents={...liveEvents,items:allPins,updated_at:JSON.stringify(allPins)!==JSON.stringify(previous.liveEvents.items)?iso(now):liveEvents.updated_at};

 const next={...base,liveNews:{...liveNews,diagnostics},liveEvents,indicators,research,checked_at:iso(now),failed_sources:Object.keys(FEEDS).filter(k=>!ok.includes(k))};
 await env.ATLAS_LIVE.put('snapshot',JSON.stringify(next));
 console.log(JSON.stringify({checked_at:next.checked_at,successful:ok,failed:next.failed_sources,news:liveNews.items.length,events:liveEvents.items.length}));
}
export default {
 async scheduled(controller,env,ctx){ctx.waitUntil(refresh(env));},
 async fetch(){return new Response('Not found',{status:404});}
};
