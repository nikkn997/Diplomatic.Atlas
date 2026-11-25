/* Auto-refreshed sourced headline digest with bundled archive and scheduled updates. */
(function(){'use strict';
const locales={
 en:{title:'World Briefing',lead:'Publisher-linked headlines, curated archive items and scheduled updates in one newsroom.',badge:'PUBLISHER FEED · SCHEDULED SNAPSHOT',all:'All publishers',search:'Search headlines, places or publishers',updated:'Last successful retrieval',notReady:'No scheduled refresh has been published yet. The sourced archive below is still available.',stale:'This feed is older than 72 hours; check the publisher for current reporting.',empty:'No matching headlines',view:'Read at publisher',status:'Original publisher content is preserved; translations are unofficial. Headlines never automatically create diplomatic map links.',refresh:'Check for an updated snapshot',more:'Explore sourced events on the map',local:'Offline mode: bundled archive + saved snapshot. Automatic refreshes begin after website deployment.',now:'Update status',date:'Published',publisher:'Publisher',total:'headlines',archiveReady:'Bundled source archive loaded',period:'Period',allTime:'All dates',day:'24 hours',week:'7 days',month2:'60 days',savedOnly:'Saved only',recent:'Most recent',oldest:'Oldest',sourceDesk:'Source-linked newsroom',archive:'Documented historical cases',archiveNote:'Verified event archive, separate from publisher headlines.',viewArchive:'Explore event',save:'Save headline',unsave:'Remove saved headline',showMore:'Load more headlines',timeWarning:'Dates are publication times from the publisher, not necessarily the date of the underlying event.',sourceStatus:'Feed status',partial:'Some scheduled sources did not update',full:'Scheduled sources updated',next:'After deployment, the site can publish new headlines automatically about every five minutes when the hosting workflow runs. This is a newsroom snapshot, not a live wire.',summaryFallback:'Open the original source for full context.',location:'Location',category:'Desk'},
 ru:{title:'Мировая повестка',lead:'Заголовки с указанием источников, архив редакции и автообновление в одной ленте.',badge:'ЛЕНТА ИСТОЧНИКОВ · ПЛАНОВЫЙ СНИМОК',all:'Все источники',search:'Поиск по заголовкам, местам и источникам',updated:'Последняя успешная загрузка',notReady:'Автоматическое обновление ещё не публиковалось. Ниже всё равно доступен подготовленный архив.',stale:'Данные старше 72 часов; актуальность лучше сверять у первоисточника.',empty:'Подходящие заголовки не найдены',view:'Читать у источника',status:'Переводы неофициальные. Оригинальная публикация доступна по ссылке; заголовки не создают автоматических геосвязей.',refresh:'Проверить новую подборку',more:'События с источниками на карте',local:'Локальный режим: встроенный архив и сохранённый снимок. Автообновление заработает после публикации сайта.',now:'Статус обновления',date:'Опубликовано',publisher:'Источник',total:'заголовков',archiveReady:'Встроенный архив источников загружен',period:'Период',allTime:'Все даты',day:'24 часа',week:'7 дней',month2:'60 дней',savedOnly:'Только сохранённые',recent:'Сначала новые',oldest:'Сначала старые',sourceDesk:'Новостная лента с источниками',archive:'Исторические события с документами',archiveNote:'Проверенный архив событий отдельно от заголовков редакций.',viewArchive:'Открыть событие',save:'Сохранить заголовок',unsave:'Убрать заголовок',showMore:'Показать больше',timeWarning:'Дата означает момент публикации у источника, а не обязательно дату самого события.',sourceStatus:'Состояние ленты',partial:'Часть плановых источников не обновилась',full:'Плановые источники обновились',next:'После публикации сайт сможет автоматически выкладывать новые заголовки примерно каждые 5 минут при выполнении задания GitHub. Это снимок новостной ленты, а не прямой эфир.',summaryFallback:'Полный контекст — в оригинальном материале.',location:'Место',category:'Рубрика'}
};
const extendedLocales={
 fr:{title:'Actualité mondiale',lead:'Actualités sourcées, archives et mises à jour planifiées dans une même rédaction.',badge:'FLUX DES ÉDITEURS · INSTANTANÉ PROGRAMMÉ',all:'Toutes les sources',search:'Rechercher un titre, un lieu ou une source',updated:'Dernière récupération réussie',notReady:'Aucune mise à jour programmée publiée. Les archives restent accessibles.',stale:'Données de plus de 72 heures : consultez l’éditeur.',empty:'Aucun résultat',view:'Lire chez l’éditeur',status:'Traductions non officielles. Les titres ne prouvent pas de liens diplomatiques.',refresh:'Rechercher une mise à jour',more:'Événements vérifiés sur la carte',local:'Mode hors ligne : archives enregistrées. Les mises à jour démarrent après publication.',now:'État des mises à jour',date:'Publié',publisher:'Éditeur',total:'titres',archiveReady:'Archives intégrées chargées',period:'Période',allTime:'Toutes les dates',day:'24 heures',week:'7 jours',month2:'60 jours',savedOnly:'Enregistrés',recent:'Plus récents',oldest:'Plus anciens',sourceDesk:'Rédaction liée aux sources',archive:'Événements historiques documentés',archiveNote:'Les événements vérifiés sont distincts des titres de presse.',viewArchive:'Voir l’événement',save:'Enregistrer',unsave:'Retirer des favoris',showMore:'Afficher plus',timeWarning:'La date de publication n’est pas toujours celle de l’événement.',sourceStatus:'État du flux',partial:'Certaines sources ne se sont pas mises à jour',full:'Sources mises à jour',next:'Après publication, des titres peuvent être mis à jour automatiquement environ toutes les cinq minutes après vérification. Ce n’est pas un fil en direct.',summaryFallback:'Consultez la source pour le contexte complet.',location:'Lieu',category:'Rubrique',original:'Original en anglais',unofficial:'Traduction non officielle',sourceCard:'Visuel du site, pas une photo de l’événement',imageCredit:'Image fournie par la source'},
 es:{title:'Panorama mundial',lead:'Noticias con fuentes, archivo seleccionado y actualizaciones programadas.',badge:'FUENTES · CAPTURA PROGRAMADA',all:'Todas las fuentes',search:'Buscar noticias, lugares o fuentes',updated:'Última actualización correcta',notReady:'Todavía no hay una actualización automática publicada. El archivo sigue disponible.',stale:'Datos de más de 72 horas; consulta el medio.',empty:'No hay resultados',view:'Leer en el medio',status:'Traducciones no oficiales. Los titulares no implican vínculos diplomáticos.',refresh:'Comprobar actualizaciones',more:'Eventos documentados en el mapa',local:'Modo sin conexión: archivo guardado. Las actualizaciones empiezan tras publicar el sitio.',now:'Estado de actualización',date:'Publicado',publisher:'Fuente',total:'titulares',archiveReady:'Archivo integrado cargado',period:'Período',allTime:'Todas las fechas',day:'24 horas',week:'7 días',month2:'60 días',savedOnly:'Guardados',recent:'Más recientes',oldest:'Más antiguos',sourceDesk:'Noticias con fuentes',archive:'Eventos históricos documentados',archiveNote:'Archivo de eventos separado de los titulares.',viewArchive:'Ver evento',save:'Guardar',unsave:'Quitar de guardados',showMore:'Mostrar más',timeWarning:'La fecha de publicación no siempre coincide con la del evento.',sourceStatus:'Estado de las fuentes',partial:'No se actualizaron todas las fuentes',full:'Fuentes actualizadas',next:'Tras publicar el sitio, los titulares pueden actualizarse automáticamente aproximadamente cada cinco minutos tras comprobar las fuentes. No es una transmisión en directo.',summaryFallback:'Consulta la fuente original para más información.',location:'Lugar',category:'Sección',original:'Original en inglés',unofficial:'Traducción no oficial',sourceCard:'Imagen decorativa, no fotografía del evento',imageCredit:'Imagen del editor'},
 ar:{title:'موجز العالم',lead:'أخبار موثقة بالمصادر وأرشيف مختار وتحديثات مجدولة.',badge:'تحديثات الناشرين · لقطة مجدولة',all:'جميع المصادر',search:'ابحث في الأخبار والأماكن والمصادر',updated:'آخر جلب ناجح',notReady:'لم يُنشر تحديث آلي بعد، والأرشيف متاح.',stale:'البيانات أقدم من 72 ساعة؛ تحقق من الناشر.',empty:'لا توجد نتائج',view:'اقرأ لدى الناشر',status:'الترجمات غير رسمية، والعناوين لا تثبت علاقات دبلوماسية.',refresh:'التحقق من تحديث جديد',more:'أحداث موثقة على الخريطة',local:'وضع دون اتصال: الأرشيف محفوظ، والتحديث الآلي يبدأ بعد النشر.',now:'حالة التحديث',date:'نُشر في',publisher:'الناشر',total:'عنواناً',archiveReady:'تم تحميل الأرشيف',period:'الفترة',allTime:'كل التواريخ',day:'24 ساعة',week:'7 أيام',month2:'60 يوماً',savedOnly:'المحفوظ فقط',recent:'الأحدث أولاً',oldest:'الأقدم أولاً',sourceDesk:'غرفة أخبار موثقة بالمصادر',archive:'أحداث تاريخية موثقة',archiveNote:'الأحداث الموثقة منفصلة عن عناوين الصحف.',viewArchive:'عرض الحدث',save:'حفظ',unsave:'إزالة من المحفوظ',showMore:'عرض المزيد',timeWarning:'تاريخ النشر ليس بالضرورة تاريخ الحدث.',sourceStatus:'حالة الأخبار',partial:'تعذر تحديث بعض المصادر',full:'تم تحديث المصادر',next:'بعد النشر، يمكن تحديث العناوين تلقائياً كل خمس دقائق تقريباً عند تنفيذ التحديث المجدول. هذه ليست تغطية مباشرة.',summaryFallback:'افتح المصدر للاطلاع على التفاصيل.',location:'الموقع',category:'القسم',original:'النص الأصلي بالإنجليزية',unofficial:'ترجمة غير رسمية',sourceCard:'صورة توضيحية، ليست صورة الحدث',imageCredit:'صورة من الناشر'},
 zh:{title:'全球简报',lead:'汇集有来源的新闻标题、精选档案和定时更新。',badge:'新闻来源 · 定时快照',all:'全部来源',search:'搜索标题、地点或来源',updated:'上次成功获取',notReady:'尚未发布自动更新，仍可查看已有档案。',stale:'数据已超过72小时，请查看原始媒体。',empty:'没有匹配结果',view:'前往原始报道',status:'译文非官方译本；标题不代表已证实的外交联系。',refresh:'检查更新',more:'查看地图上的来源事件',local:'离线模式：保留已有档案，发布后可自动更新。',now:'更新状态',date:'发布日期',publisher:'来源',total:'条标题',archiveReady:'已加载内置档案',period:'时间范围',allTime:'全部日期',day:'24小时',week:'7天',month2:'60天',savedOnly:'仅收藏',recent:'最新优先',oldest:'最早优先',sourceDesk:'有来源的新闻中心',archive:'有文献记录的历史事件',archiveNote:'核实事件档案与媒体标题分开显示。',viewArchive:'查看事件',save:'收藏',unsave:'取消收藏',showMore:'加载更多',timeWarning:'发布日期不一定是事件发生日期。',sourceStatus:'新闻源状态',partial:'部分来源未更新',full:'来源已更新',next:'网站发布后，标题大约在计划任务执行时大约每五分钟检查更新。这不是实时新闻流。',summaryFallback:'请查看原始报道了解更多。',location:'地点',category:'栏目',original:'英文原文',unofficial:'非官方翻译',sourceCard:'装饰性封面，非现场照片',imageCredit:'来源提供的图片'}
};
Object.assign(locales,extendedLocales);
Object.assign(locales.en,{original:'Original English',unofficial:'Unofficial translation',sourceCard:'Source card · not an event photograph',imageCredit:'Publisher-supplied image'});
Object.assign(locales.ru,{original:'Оригинал на английском',unofficial:'Неофициальный перевод',sourceCard:'Иллюстрация раздела, не фото события',imageCredit:'Изображение от источника'});
const deskLabels={
 en:{climate:'Climate',health:'Health',economy:'Economy',news:'News',multilateral:'Multilateral',reference:'Reference'},
 ru:{climate:'Климат',health:'Здравоохранение',economy:'Экономика',news:'Новости',multilateral:'Многосторонние отношения',reference:'Справка'},
 fr:{climate:'Climat',health:'Santé',economy:'Économie',news:'Actualités',multilateral:'Multilatéral',reference:'Référence'},
 es:{climate:'Clima',health:'Salud',economy:'Economía',news:'Noticias',multilateral:'Multilateral',reference:'Referencia'},
 ar:{climate:'المناخ',health:'الصحة',economy:'الاقتصاد',news:'أخبار',multilateral:'متعدد الأطراف',reference:'مرجع'},
 zh:{climate:'气候',health:'卫生',economy:'经济',news:'新闻',multilateral:'多边事务',reference:'参考'}
};
const publisherTranslations={
 ru:{un:'Новости ООН',bbc:'BBC World',ungeneva:'Отделение ООН в Женеве',geneva_meetings:'Заседания ООН в Женеве',who:'Всемирная организация здравоохранения',unep:'Программа ООН по окружающей среде',worldbank:'Всемирный банк',imf:'Международный валютный фонд',wto:'Всемирная торговая организация',iaea:'МАГАТЭ',consilium:'Совет Европейского союза'},
 fr:{un:'Actualités de l’ONU',bbc:'BBC World',ungeneva:'ONU Genève',geneva_meetings:'Réunions de l’ONU à Genève',who:'Organisation mondiale de la Santé',unep:'Programme des Nations unies pour l’environnement',worldbank:'Banque mondiale',imf:'Fonds monétaire international',wto:'Organisation mondiale du commerce',iaea:'Agence internationale de l’énergie atomique',consilium:'Conseil de l’Union européenne'},
 es:{un:'Noticias ONU',bbc:'BBC Mundo',ungeneva:'ONU Ginebra',geneva_meetings:'Reuniones de la ONU en Ginebra',who:'Organización Mundial de la Salud',unep:'Programa de las Naciones Unidas para el Medio Ambiente',worldbank:'Banco Mundial',imf:'Fondo Monetario Internacional',wto:'Organización Mundial del Comercio',iaea:'Organismo Internacional de Energía Atómica',consilium:'Consejo de la Unión Europea'},
 ar:{un:'أخبار الأمم المتحدة',bbc:'بي بي سي',ungeneva:'الأمم المتحدة في جنيف',geneva_meetings:'اجتماعات الأمم المتحدة في جنيف',who:'منظمة الصحة العالمية',unep:'برنامج الأمم المتحدة للبيئة',worldbank:'البنك الدولي',imf:'صندوق النقد الدولي',wto:'منظمة التجارة العالمية',iaea:'الوكالة الدولية للطاقة الذرية',consilium:'مجلس الاتحاد الأوروبي'},
 zh:{un:'联合国新闻',bbc:'英国广播公司',ungeneva:'联合国日内瓦办事处',geneva_meetings:'联合国日内瓦会议',who:'世界卫生组织',unep:'联合国环境规划署',worldbank:'世界银行',imf:'国际货币基金组织',wto:'世界贸易组织',iaea:'国际原子能机构',consilium:'欧盟理事会'}
};
const localizedPublisher=(item,lang)=>(publisherTranslations[lang]||{})[item.source]||item.publisher;
const locationTranslations={
 ru:{'Antalya, Türkiye':'Анталья, Турция','Baku, Azerbaijan':'Баку, Азербайджан','Bangkok, Thailand':'Бангкок, Таиланд','Geneva, Switzerland':'Женева, Швейцария','Manila, Philippines':'Манила, Филиппины','Nairobi, Kenya':'Найроби, Кения','New York, United States':'Нью-Йорк, США','Seoul, Republic of Korea':'Сеул, Республика Корея','Washington, United States':'Вашингтон, США'},
 fr:{'Antalya, Türkiye':'Antalya, Turquie','Baku, Azerbaijan':'Bakou, Azerbaïdjan','Bangkok, Thailand':'Bangkok, Thaïlande','Geneva, Switzerland':'Genève, Suisse','Manila, Philippines':'Manille, Philippines','Nairobi, Kenya':'Nairobi, Kenya','New York, United States':'New York, États-Unis','Seoul, Republic of Korea':'Séoul, Corée du Sud','Washington, United States':'Washington, États-Unis'},
 es:{'Antalya, Türkiye':'Antalya, Turquía','Baku, Azerbaijan':'Bakú, Azerbaiyán','Bangkok, Thailand':'Bangkok, Tailandia','Geneva, Switzerland':'Ginebra, Suiza','Manila, Philippines':'Manila, Filipinas','Nairobi, Kenya':'Nairobi, Kenia','New York, United States':'Nueva York, Estados Unidos','Seoul, Republic of Korea':'Seúl, Corea del Sur','Washington, United States':'Washington, Estados Unidos'},
 ar:{'Antalya, Türkiye':'أنطاليا، تركيا','Baku, Azerbaijan':'باكو، أذربيجان','Bangkok, Thailand':'بانكوك، تايلاند','Geneva, Switzerland':'جنيف، سويسرا','Manila, Philippines':'مانيلا، الفلبين','Nairobi, Kenya':'نيروبي، كينيا','New York, United States':'نيويورك، الولايات المتحدة','Seoul, Republic of Korea':'سيول، كوريا الجنوبية','Washington, United States':'واشنطن، الولايات المتحدة'},
 zh:{'Antalya, Türkiye':'安塔利亚，土耳其','Baku, Azerbaijan':'巴库，阿塞拜疆','Bangkok, Thailand':'曼谷，泰国','Geneva, Switzerland':'日内瓦，瑞士','Manila, Philippines':'马尼拉，菲律宾','Nairobi, Kenya':'内罗毕，肯尼亚','New York, United States':'纽约，美国','Seoul, Republic of Korea':'首尔，韩国','Washington, United States':'华盛顿，美国'}
};
const localizedLocation=(label,lang)=>(locationTranslations[lang]||{})[label]||label;
const translated=(item,lang)=>{
 if(lang==='en')return {title:item.title,summary:item.summary,translated:true};
 const corpus=window.ATLAS_NEWS_TRANSLATIONS?.[item.url]?.[lang];
 const value=item.translations?.[lang]||corpus;
 return {title:value?.title||item.title,summary:value?.summary||item.summary,translated:!!(value?.title&&value?.summary)};
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=(lang,key)=>((locales[lang]||locales.en)[key]||locales.en[key]||key);
const DEFAULT_IMAGE='assets/images/world-overview.webp';
const countries=(window.ATLAS_COUNTRIES||[]);
const byCode=new Map(countries.map(c=>[c.code,c]));
const localFlagPath=code=>`assets/flags/${encodeURIComponent(code)}.png`;
const flagImagePath=code=>{const c=byCode.get(code);const iso2=(c&&c.iso2)||'';return /^[A-Z]{2}$/.test(iso2)?`https://flagcdn.com/w1280/${iso2.toLowerCase()}.png`:localFlagPath(code)};
const badgeFlagPath=code=>{const c=byCode.get(code);const iso2=(c&&c.iso2)||'';return /^[A-Z]{2}$/.test(iso2)?`https://flagcdn.com/w160/${iso2.toLowerCase()}.png`:localFlagPath(code)};
const sourceArt={who:'assets/images/atlas-earth.webp',unep:'assets/images/world-overview.webp',worldbank:'assets/images/world-overview.webp',imf:'assets/images/atlas-earth.webp',un:'assets/images/world-overview.webp',bbc:'assets/images/world-overview.webp',ungeneva:'assets/images/atlas-earth.webp',geneva_meetings:'assets/images/atlas-earth.webp',wto:'assets/images/world-overview.webp',iaea:'assets/images/atlas-earth.webp',consilium:'assets/images/world-overview.webp'};
const countryNameToCode=new Map();
for(const c of countries){countryNameToCode.set(String(c.name||'').toLowerCase(),c.code);for(const name of Object.values(c.names||{})){countryNameToCode.set(String(name||'').toLowerCase(),c.code)}}
for(const [alias,code] of Object.entries({'united states':'USA','united states of america':'USA','republic of korea':'KOR','south korea':'KOR','north korea':'PRK','türkiye':'TUR','turkiye':'TUR','russia':'RUS','russian federation':'RUS','ivory coast':'CIV',"cote d'ivoire":'CIV','palestine':'PSE','kosovo':'XKX','bolivia':'BOL','lao pdr':'LAO','laos':'LAO'})){countryNameToCode.set(alias,code)}
function resolveFlagCode(item){
 const direct=(item.flagCode||'').trim();
 if(direct&&byCode.has(direct))return direct;
 const label=String(item.locationLabel||'').trim();
 if(!label)return '';
 const parts=label.split(',').map(v=>v.trim()).filter(Boolean);
 const probes=[parts.at(-1),parts[0],label].filter(Boolean);
 for(const part of probes){const code=countryNameToCode.get(part.toLowerCase());if(code)return code}
 return '';
}
let filter='all',query='',period='month2',sort='new',savedOnly=false,visibleLimit=9;
let snapshot=window.ATLAS_LIVE_NEWS||{updated_at:null,items:[]};
const archive=window.ATLAS_NEWS_ARCHIVE||{updated_at:null,items:[]};
let saved=new Set();try{saved=new Set(JSON.parse(localStorage.getItem('atlas.news.saved')||'[]'))}catch{}
const validDate=v=>/^\d{4}-\d{2}-\d{2}T/.test(v||'')&&!isNaN(new Date(v).getTime());
function safeStory(item){try{const url=new URL(item.url);return url.protocol==='https:'&&typeof item.title==='string'&&item.title.length>=4&&item.title.length<=260&&validDate(item.published||'')}catch{return false}}
function normalize(items,origin){return (items||[]).filter(safeStory).map(item=>({
  publisher:item.publisher||item.source||'Source',
  source:item.source||'ref',
  origin,
  title:item.title,
  url:item.url,
  published:item.published,
  summary:item.summary||'',
  image:item.image||'',
  imageCredit:item.imageCredit||item.publisher||'',
  locationLabel:item.locationLabel||'',
  category:item.category||'reference',
  flagCode:item.flagCode||'',
  translations:item.translations||{},
})).filter(item=>item.title&&item.url&&item.published)}
function mergedItems(){
 const map=new Map();
 for(const item of [...normalize(archive.items,'archive'),...normalize(snapshot.items,'live')]){
  const prev=map.get(item.url);
  map.set(item.url,prev?{...prev,...item,image:item.image||prev.image,summary:item.summary||prev.summary,translations:{...(prev.translations||{}),...(item.translations||{})}}:item);
 }
 return [...map.values()];
}
function sourceList(items,lang){const out=[];const seen=new Set();for(const item of items){if(seen.has(item.source))continue;seen.add(item.source);out.push({source:item.source,label:localizedPublisher(item,lang)});}return out}
function filterItems(items){const now=Date.now();
 return items.filter(item=>{
  if(filter!=='all'&&item.source!==filter)return false;
  if(savedOnly&&!saved.has(item.url))return false;
  const hay=`${item.title} ${item.publisher} ${item.locationLabel||''} ${item.summary||''}`.toLowerCase();
  if(query&&!hay.includes(query.toLowerCase()))return false;
  const published=new Date(item.published).getTime();
  if(period==='day'&&now-published>86400000)return false;
  if(period==='week'&&now-published>604800000)return false;
  if(period==='month2'&&now-published>5184000000)return false;
  return true;
 }).sort((a,b)=>sort==='old'?a.published.localeCompare(b.published):b.published.localeCompare(a.published));
}
const STORY_PHOTOS=window.ATLAS_STORY_PHOTOS||{};
const captionsRelated={
 en:'Related forum photo — NOT this specific news event',
 ru:'Фото с того же форума — НЕ с этого конкретного события',
 fr:'Photo du même forum — PAS de cet événement précis',
 es:'Foto del foro relacionado — NO de este evento específico',
 ar:'صورة من المنتدى ذي الصلة — ليست من هذا الحدث المحدد',
 zh:'相关论坛照片 — 并非本条新闻的具体事件'
};
function commonsAlternate(photo){
 if(!photo||!photo.fileTitle||!photo.fileTitle.startsWith('File:'))return '';
 return 'https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(photo.fileTitle.slice(5).replace(/ /g,'_'))+'?width=1100';
}
function chooseStoryPhoto(item,used){
 const specific=(typeof item.image==='string'&&/^https:\/\//.test(item.image))?item.image:'';
 if(specific&&!used.has(specific)){
  used.add(specific);return {src:specific,alt:'',source:item.url,credit:item.imageCredit||item.publisher,type:'publisher',fallback:STORY_PHOTOS[item.url]||null};
 }
 const photo=STORY_PHOTOS[item.url];
 if(photo&&!used.has(photo.fileTitle)){
  used.add(photo.fileTitle);
  return {src:photo.local,alt:commonsAlternate(photo),source:photo.page,credit:photo.credit+' · '+photo.license,type:'related',photo};
 }
 return null;
}
function storyCard(item,l,lang,lead=false,used=new Set()){
 const photo=chooseStoryPhoto(item,used);
 const copy=translated(item,lang),summary=copy.summary||l.summaryFallback;
 const badge=lang==='en'?'':`<span class="news-translation-badge">${esc(l[copy.translated?'unofficial':'original'])}</span>`;
 const publisher=localizedPublisher(item,lang);
 const flagCode=resolveFlagCode(item);
 const flagBadge=flagCode?`<img class="newsroom-flag-badge flat" src="${esc(badgeFlagPath(flagCode))}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${esc(localFlagPath(flagCode))}'">`:'';
 const categoryText=(deskLabels[lang]||deskLabels.en)[item.category]||item.category||'news';
 const location=localizedLocation(item.locationLabel,lang);
 const caption=photo?.type==='related'?(captionsRelated[lang]||captionsRelated.en):({en:'Photograph supplied by publisher',ru:'Фотография издателя',fr:'Photographie fournie par l’éditeur',es:'Fotografía proporcionada por el editor',ar:'صورة من الناشر',zh:'来源出版方的照片'}[lang]||'Publisher photograph');
 const related=photo?.photo||photo?.fallback;
 const failUrl=photo?.type==='related'?photo.alt:(related?related.local:'');
 const failUrl2=photo?.type==='publisher'&&related?commonsAlternate(related):'';
 const photoMarkup=photo?`<div class="newsroom-article-cover ${photo.type==='related'?'newsroom-related-photo':'newsroom-event-photo'}">
    <img class="newsroom-photo" src="${esc(photo.src)}" alt="" loading="${lead?'eager':'lazy'}" decoding="async" referrerpolicy="no-referrer"
      onerror="atlasNewsImageError(this,'${esc(failUrl)}','${esc(failUrl2)}','${esc(captionsRelated[lang]||captionsRelated.en)}','${esc(related?related.credit+' · '+related.license:'')}','${esc(related?related.page:'')}')">
    <div class="newsroom-cover-overlay"></div>
    <div class="newsroom-cover-top"><span class="newsroom-source-tag">${esc(publisher)}</span>${flagBadge}</div>
    <div class="newsroom-cover-bottom"><div class="newsroom-photo-caption"><span class="newsroom-photo-kind">${esc(caption)}</span><a href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer">${esc(photo.credit)} ↗</a></div></div>
  </div>`:'';
 return `<article class="newsroom-article ${lead?'newsroom-lead-article':''} ${photo?'has-photo':'no-photo'} ${photo?.type==='related'?'related-photo':''}">
  ${photoMarkup}<div class="newsroom-article-body">
   <div class="newsroom-article-meta"><span>${esc(publisher)}</span><time datetime="${esc(item.published)}">${esc(item.published.slice(0,10))}</time></div>
   ${badge}<h3 lang="${copy.translated?esc(lang):'en'}"><a href="${esc(item.url)}" rel="noopener noreferrer" target="_blank">${esc(copy.title)}</a></h3>
   <p class="newsroom-article-summary">${esc(summary)}</p>
   <div class="newsroom-article-extra">${item.locationLabel?`<span><b>${esc(l.location)}:</b> ${esc(location)}</span>`:''}<span><b>${esc(l.category)}:</b> ${esc(categoryText)}</span></div>
   <div class="newsroom-article-bottom"><a href="${esc(item.url)}" rel="noopener noreferrer" target="_blank">${esc(l.view)} ↗</a><button type="button" data-save-news="${esc(item.url)}" title="${esc(l[saved.has(item.url)?'unsave':'save'])}" aria-pressed="${saved.has(item.url)}" aria-label="${esc(l[saved.has(item.url)?'unsave':'save'])}">${saved.has(item.url)?'★':'☆'}</button></div>
  </div>
 </article>`;
}
// A failed image is never replaced with the same institutional photo repeated
// across multiple articles; the card becomes a compact editorial text card.
window.atlasNewsImageError=function(img,backupUrl,finalUrl,relatedCaption,relatedCredit,relatedPage){
 const cover=img.closest('.newsroom-article-cover');const article=img.closest('.newsroom-article');
 if(!cover||!article)return;
 if(!img.dataset.fallbackStage&&backupUrl){
  img.dataset.fallbackStage='1';img.src=backupUrl;
  if(relatedCredit){
   const caption=cover.querySelector('.newsroom-photo-kind');if(caption)caption.textContent=relatedCaption;
   const credit=cover.querySelector('.newsroom-photo-caption a');if(credit){credit.textContent=relatedCredit+' ↗';credit.href=relatedPage;}
  }
  return;
 }
 if(img.dataset.fallbackStage==='1'&&finalUrl){img.dataset.fallbackStage='2';img.src=finalUrl;return;}
 img.style.display='none';article.classList.remove('has-photo');article.classList.add('photo-failed');
};

function render({state}){
 const l={...locales.en,...(locales[state.lang]||{})};
 const rows=mergedItems();
 const publishers=sourceList(rows,state.lang);
 const filtered=filterItems(rows);
 const first=filtered[0];
 const visible=filtered.slice(1,visibleLimit+1);
 const usedPhotoUrls=new Set();
 const date=snapshot.updated_at?new Date(snapshot.updated_at):null;const valid=date&&!isNaN(date.getTime());const age=valid?(Date.now()-date.getTime())/3600000:null;
 const statusText=snapshot.status==='partial'?l.partial:(snapshot.status==='seeded'||snapshot.status==='awaiting_first_run'||!(snapshot.items||[]).length)?l.archiveReady:l.full;
 const archiveEvents=(window.ATLAS_EVENTS||[]).slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);
 return `<section class="news-page newsroom-v11"><div class="news-head"><p class="eyebrow">RESEARCH / WORLD BRIEFING</p><h1>${esc(l.title)}<span class="accent">.</span></h1><p>${esc(l.lead)}</p><div class="news-caption"><span class="live-pulse"></span>${esc(l.badge)}</div></div>
 <div class="newsroom-status-bar"><div><span>${esc(l.updated)}</span><strong>${valid&&snapshot.status!=='seeded'?esc(date.toLocaleString(state.lang,{dateStyle:'medium',timeStyle:'short'})):'—'}</strong></div><div><span>${esc(l.sourceStatus)}</span><strong>${esc(statusText)}</strong></div><div><span>${esc(l.now)}</span><strong>${rows.length} ${esc(l.total)} · ${publishers.length} publishers</strong></div><button class="btn pale" id="news-reload" type="button">↻ ${esc(l.refresh)}</button></div>
 ${age!==null&&age>72?`<p class="news-warning" role="status">${esc(l.stale)}</p>`:''}${location.protocol==='file:'?`<p class="news-notice">${esc(l.local)}</p>`:''}
 <section class="newsroom-main"><div class="newsroom-editorial"><p class="eyebrow">${esc(l.sourceDesk.toUpperCase())}</p><h2>${esc(l.sourceDesk)}</h2><p>${esc(l.next)}</p><div class="newsroom-wordmark"><span>DA</span><div><strong>WORLD</strong><small>BRIEFING · SOURCE LINKED</small></div></div></div><div class="newsroom-feed-top">${first?storyCard(first,l,state.lang,true,usedPhotoUrls):`<div class="newsroom-empty"><h2>${esc(l.notReady)}</h2><a href="#signals" class="btn gold">${esc(l.more)} ↗</a></div>`}</div></section>
 <div class="newsroom-controls"><div class="news-tabs" role="group" aria-label="${esc(l.publisher)}"><button data-news-source="all" class="${filter==='all'?'selected':''}">${esc(l.all)}</button>${publishers.map(p=>`<button data-news-source="${esc(p.source)}" class="${filter===p.source?'selected':''}">${esc(p.label)}</button>`).join('')}</div><div class="newsroom-toolbar"><input id="news-search" type="search" value="${esc(query)}" placeholder="${esc(l.search)}" aria-label="${esc(l.search)}"><div class="newsroom-time-tabs" role="group" aria-label="${esc(l.period)}">${[['all','allTime'],['day','day'],['week','week'],['month2','month2']].map(([v,k])=>`<button type="button" data-news-period="${v}" class="${period===v?'active':''}">${esc(l[k])}</button>`).join('')}</div><button type="button" id="news-saved-only" class="${savedOnly?'active':''}">${esc(l.savedOnly)} (${saved.size})</button><select id="news-sort" aria-label="${esc(l.recent)}"><option value="new" ${sort==='new'?'selected':''}>${esc(l.recent)}</option><option value="old" ${sort==='old'?'selected':''}>${esc(l.oldest)}</option></select></div></div>
 ${filtered.length?`<div class="newsroom-card-list">${visible.map(item=>storyCard(item,l,state.lang,false,usedPhotoUrls)).join('')}</div>${filtered.length>visibleLimit?`<div class="newsroom-more"><button class="btn pale" id="news-more" type="button">${esc(l.showMore)} ↓</button></div>`:''}`:`<p class="news-empty">${esc(l.empty)}</p>`}
 <div class="newsroom-divider"><p class="eyebrow">${esc(l.archiveNote.toUpperCase())}</p><h2>${esc(l.archive)}</h2><p>${esc(l.archiveNote)}</p></div><div class="newsroom-archive">${archiveEvents.map(e=>`<a href="#signals/${esc(e.id)}" class="newsroom-archive-card"><time>${esc(e.date)}</time><h3>${esc((e.title&&((e.title[state.lang])||e.title.en))||e.id)}</h3><span>${esc(e.city)} · ${esc(l.viewArchive)} ↗</span></a>`).join('')}</div><p class="data-disclaimer">${esc(l.timeWarning)} ${esc(l.status)}</p></section>`;
}
function init(ctx){
 const rerender=()=>{const screen=document.getElementById('screen');if(!screen)return;screen.innerHTML=render(ctx);init(ctx)};
 document.querySelectorAll('[data-news-source]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.newsSource;visibleLimit=9;rerender()}));
 document.querySelectorAll('[data-news-period]').forEach(b=>b.addEventListener('click',()=>{period=b.dataset.newsPeriod;visibleLimit=9;rerender()}));
 document.getElementById('news-search')?.addEventListener('input',e=>{query=e.target.value;visibleLimit=9;const pos=e.target.selectionStart;rerender();const next=document.getElementById('news-search');next?.focus();next?.setSelectionRange(pos,pos)});
 document.getElementById('news-saved-only')?.addEventListener('click',()=>{savedOnly=!savedOnly;visibleLimit=9;rerender()});
 document.getElementById('news-sort')?.addEventListener('change',e=>{sort=e.target.value;rerender()});
 document.getElementById('news-more')?.addEventListener('click',()=>{visibleLimit+=9;rerender()});
 document.querySelectorAll('[data-save-news]').forEach(b=>b.addEventListener('click',()=>{const url=b.dataset.saveNews;if(saved.has(url))saved.delete(url);else saved.add(url);try{localStorage.setItem('atlas.news.saved',JSON.stringify([...saved].slice(-120)))}catch{}rerender()}));
 document.getElementById('news-reload')?.addEventListener('click',async()=>{if(location.protocol==='file:'){rerender();return}const btn=document.getElementById('news-reload');btn.disabled=true;try{const response=await fetch('data/liveNews.json?ts='+Date.now(),{cache:'no-store'});if(!response.ok)throw Error('Feed unavailable');const fresh=await response.json();snapshot=(fresh&&Array.isArray(fresh.items))?fresh:snapshot;rerender()}catch(e){btn.disabled=false;btn.title=e.message}})
}
// A page left open checks for newer published static snapshots every 10 minutes.
// This is polling GitHub Pages, not a continuously streaming live news feed.
if(location.protocol==='https:' || location.hostname==='localhost'){
  setInterval(async()=>{
    if(document.visibilityState==='hidden')return;
    try{
      const resp=await fetch('data/liveNews.json?watch='+Date.now(),{cache:'no-store'});
      if(!resp.ok)return;
      const data=await resp.json();
      if(data&&Array.isArray(data.items)&&data.updated_at&&data.updated_at!==snapshot.updated_at){
        snapshot=data;
        if(location.hash.startsWith('#news')){
          const screen=document.getElementById('screen');
          if(screen){window.dispatchEvent(new HashChangeEvent('hashchange'))}
        }
      }
    }catch{}
  },60*1000);
}
window.AtlasLive={render,init};
})();
