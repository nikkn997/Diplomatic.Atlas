/* Diplomatic Atlas: targeted localizations and non-destructive freshness monitor. */
(function(){
'use strict';
const languages=['en','ru','fr','es','ar','zh'];
const rows=[["ATLAS / RESEARCH DESK · 09","АТЛАС / ИССЛЕДОВАНИЯ · 09","ATLAS / RECHERCHE · 09","ATLAS / INVESTIGACIÓN · 09","الأطلس / الأبحاث · 09","图集 / 研究 · 09"],["UN Forum on Business and Human Rights opens in Geneva","В Женеве открывается Форум ООН по вопросам предпринимательской деятельности и прав человека","Ouverture du Forum de l’ONU sur les entreprises et les droits de l’homme à Genève","Se inaugura en Ginebra el Foro de la ONU sobre las Empresas y los Derechos Humanos","افتتاح منتدى الأمم المتحدة المعني بالأعمال التجارية وحقوق الإنسان في جنيف","联合国商业与人权论坛在日内瓦开幕"],["COP31 climate conference closes in Antalya","В Анталье завершается климатическая конференция COP31","Clôture de la conférence climatique COP31 à Antalya","Clausura de la conferencia climática COP31 en Antalya","اختتام مؤتمر المناخ COP31 في أنطاليا","COP31气候大会在安塔利亚闭幕"],["Convention on Certain Conventional Weapons: 7th Review Conference","Конвенция о конкретных видах обычного оружия: седьмая обзорная конференция","Convention sur certaines armes classiques : septième conférence d’examen","Convención sobre Ciertas Armas Convencionales: séptima Conferencia de Examen","اتفاقية أسلحة تقليدية معينة: المؤتمر الاستعراضي السابع","《特定常规武器公约》：第七次审议大会"],["United Nations","Организация Объединённых Наций","Nations Unies","Naciones Unidas","الأمم المتحدة","联合国"],["Statistics","Статистика","Statistiques","Estadísticas","الإحصاءات","统计"],["International Law","Международное право","Droit international","Derecho internacional","القانون الدولي","国际法"],["Education & Culture","Образование и культура","Éducation et culture","Educación y cultura","التعليم والثقافة","教育与文化"],["Research Method","Методология исследований","Méthodologie de recherche","Métodos de investigación","منهجية البحث","研究方法"],["UN Journalism","Журналистика ООН","Journalisme de l’ONU","Periodismo de la ONU","صحافة الأمم المتحدة","联合国新闻"],["Independent Journalism","Независимая журналистика","Journalisme indépendant","Periodismo independiente","الصحافة المستقلة","独立新闻"],["UN Digital Library","Цифровая библиотека ООН","Bibliothèque numérique de l’ONU","Biblioteca Digital de la ONU","مكتبة الأمم المتحدة الرقمية","联合国数字图书馆"],["UNGA Voting Dataset (2026)","Набор данных голосований Генассамблеи ООН (2026)","Données de vote de l’Assemblée générale de l’ONU (2026)","Datos de votación de la Asamblea General de la ONU (2026)","بيانات تصويت الجمعية العامة للأمم المتحدة (2026)","联合国大会投票数据集（2026年）"],["United Nations Treaty Collection","Собрание договоров ООН","Collection des traités des Nations Unies","Colección de Tratados de las Naciones Unidas","مجموعة معاهدات الأمم المتحدة","联合国条约汇编"],["World Bank Open Data","Открытые данные Всемирного банка","Données ouvertes de la Banque mondiale","Datos abiertos del Banco Mundial","البيانات المفتوحة للبنك الدولي","世界银行开放数据"],["International Court of Justice","Международный суд ООН","Cour internationale de Justice","Corte Internacional de Justicia","محكمة العدل الدولية","国际法院"],["UNESCO Country Profiles","Страновые профили ЮНЕСКО","Profils de pays de l’UNESCO","Perfiles de países de la UNESCO","الملفات القطرية لليونسكو","联合国教科文组织国家概况"],["Geneva","Женева","Genève","Ginebra","جنيف","日内瓦"],["Antalya","Анталья","Antalya","Antalya","أنطاليا","安塔利亚"],["Abu Dhabi","Абу-Даби","Abou Dhabi","Abu Dabi","أبو ظبي","阿布扎比"],["Primary records","Первоисточники","Documents primaires","Registros primarios","السجلات الأصلية","原始记录"],["Methodology","Методология","Méthodologie","Metodología","المنهجية","方法说明"]];
const labels={"en":["Data snapshot","Updated data available","Refresh","Sources partly available","Source unavailable","News","Events","Country data","Status unavailable"],"ru":["Состояние данных","Доступны новые данные","Обновить","Источники доступны частично","Источник недоступен","Новости","События","Данные стран","Статус недоступен"],"fr":["État des données","Nouvelles données disponibles","Actualiser","Sources partiellement disponibles","Source indisponible","Actualités","Événements","Données des pays","État indisponible"],"es":["Estado de los datos","Hay datos nuevos","Actualizar","Fuentes parcialmente disponibles","Fuente no disponible","Noticias","Eventos","Datos de países","Estado no disponible"],"ar":["حالة البيانات","بيانات جديدة متاحة","تحديث","المصادر متاحة جزئياً","المصدر غير متاح","الأخبار","الأحداث","بيانات البلدان","الحالة غير متاحة"],"zh":["数据状态","有新数据","刷新","部分来源可用","来源不可用","新闻","事件","国家数据","状态不可用"]};
const dictionary=new Map(rows.map(row=>[row[0].toLocaleLowerCase('en'),row]));
function translate(value,lang){
 const i=languages.indexOf(lang);
 if(i<1)return value;
 const row=dictionary.get(value.trim().toLocaleLowerCase('en'));
 if(row)return row[i];
 const numbered=value.match(/^(\d{1,3}\s*[/·]\s*)(.+)$/);
 if(numbered){const item=dictionary.get(numbered[2].trim().toLocaleLowerCase('en'));if(item)return numbered[1]+item[i];}
 const dated=value.match(/^(\d{4}-\d{2}-\d{2}\s*[·/]\s*)(.+)$/);
 if(dated){const city=dictionary.get(dated[2].trim().toLocaleLowerCase('en'));if(city)return dated[1]+city[i];}
 return value;
}
window.AtlasLiveUI={translate};
if(typeof document==='undefined')return;
const knownNodes=new WeakMap();
let timer=0, baseline='',latest=null,available=false,lastInteraction=Date.now(),busy=false;
function language(){
 const html=document.documentElement.lang.toLowerCase().split('-')[0];
 for(const el of document.querySelectorAll('select')){
   if(languages.includes(el.value)&&Array.from(el.options).filter(x=>languages.includes(x.value)).length>=5)return el.value;
 }
 return languages.includes(html)?html:'en';
}
function localize(root,l){
 const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 for(let n=walk.nextNode();n;n=walk.nextNode()){
  const parent=n.parentElement;if(!parent||parent.closest('textarea,input,script,style,code,pre,[contenteditable],#atlas-freshness'))continue;
  const previous=knownNodes.get(n);
  const original=previous&&n.nodeValue===previous.rendered?previous.original:n.nodeValue;
  const trimmed=original.trim();
  if(!trimmed)continue;
  const next=translate(trimmed,l);
  const rendered=original.replace(trimmed,()=>next);
  if(rendered!==n.nodeValue)n.nodeValue=rendered;
  if(rendered!==original||previous)knownNodes.set(n,{original,rendered});
 }
}
function statusText(data,l){
 if(!data||!data.sources)return labels[l][8];
 return ['liveNews','liveEvents','indicators'].map((key,i)=>{
  const s=data.sources[key];if(!s)return '';
  const date=new Date(s.updated_at||'');
  const time=Number.isNaN(date.getTime())?'—':date.toLocaleString(l,{dateStyle:'short',timeStyle:'short'});
  const note=s.status==='partial'?' · '+labels[l][3]:s.status==='error'?' · '+labels[l][4]:'';
  return labels[l][5+i]+': '+time+note;
 }).filter(Boolean).join('  |  ');
}
function render(){
 const root=document.querySelector('#screen');if(!root)return;
 const l=language();localize(root,l);
 let bar=document.querySelector('#atlas-freshness');
 if(!bar||!root.contains(bar)){
  bar=document.createElement('aside');bar.id='atlas-freshness';bar.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 20px;border-top:1px solid #d5d5c8;font:12px/1.6 system-ui,sans-serif;color:#526b66;background:#f1f1e8';
  const text=document.createElement('span');text.dataset.status='';bar.append(text);
  const button=document.createElement('button');button.type='button';button.style.cssText='font:inherit;padding:5px 10px;color:inherit;border:1px solid #b8c5b8;background:#fffdfa;cursor:pointer';button.addEventListener('click',()=>location.reload());bar.append(button);root.append(bar);
 }
 const text=bar.querySelector('[data-status]'),button=bar.querySelector('button');
 const value=labels[l][0]+': '+statusText(latest,l)+(available?' · '+labels[l][1]:'');
 if(text.textContent!==value)text.textContent=value;
 if(button.textContent!==labels[l][2])button.textContent=labels[l][2];
 button.hidden=!available;
}
function schedule(){if(!timer)timer=setTimeout(()=>{timer=0;render();},50);}
function safeIdleRefresh(){
 // Never reload research notes, portfolio, negotiation exercises, or an unknown route.
 const route=location.hash.replace(/^#/,'').split(/[/?]/)[0];
 if(!['news','briefing','signals','overview','observatory','atlas','compare','votes'].includes(route))return;
 if(!available||document.visibilityState!=='visible'||Date.now()-lastInteraction<120000)return;
 if(document.activeElement?.matches('input,textarea,select,[contenteditable]'))return;
 if(window.getSelection()?.toString())return;
 location.reload();
}
async function poll(){
 if(busy)return;busy=true;
 try{
  const response=await fetch('./refresh-status.json?check='+Date.now(),{cache:'no-store',credentials:'same-origin'});
  if(!response.ok)throw new Error('HTTP '+response.status);
  const data=await response.json();
  if(typeof data.fingerprint!=='string'||!data.sources)throw new Error('Invalid refresh status');
  if(!baseline)baseline=data.fingerprint;
  latest=data;available=baseline!==data.fingerprint;
 }catch(error){ /* retain last verified source timestamps */ }
 finally{busy=false;schedule();safeIdleRefresh();}
}
function start(){
 const root=document.querySelector('#screen');if(root)new MutationObserver(schedule).observe(root,{subtree:true,childList:true,characterData:true});
 for(const event of ['pointerdown','keydown','wheel','touchstart','change'])document.addEventListener(event,()=>{lastInteraction=Date.now();if(event==='change')schedule();},{passive:true});
 window.addEventListener('hashchange',()=>{lastInteraction=Date.now();schedule();});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')poll();});
 schedule();poll();setInterval(poll,60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
