#!/usr/bin/env python3
"""Build a parallel Cloudflare Pages preview from the same tested source package."""
import datetime as dt
import hashlib
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET
import zipfile

ROOT=pathlib.Path(__file__).resolve().parent.parent
SITE=ROOT/'site'
PUBLIC=ROOT/'public'
SITE.mkdir(exist_ok=True)
with zipfile.ZipFile(ROOT/'site-package.zip') as z:
    for member in z.infolist():
        name=pathlib.PurePosixPath(member.filename)
        if name.is_absolute() or '..' in name.parts or chr(92) in member.filename:
            raise RuntimeError('Unsafe ZIP path: '+member.filename)
        if member.is_dir():
            continue
        target=SITE.joinpath(*name.parts)
        target.parent.mkdir(parents=True,exist_ok=True)
        with z.open(member) as src,target.open('wb') as out:
            shutil.copyfileobj(src,out)
for name in ('globe.js','studio.js','studio.css','live_intelligence.js','live.js','atlas_extra.js','atlas_extra.css'):
    shutil.copy2(ROOT/'deploy'/name,SITE/'src'/name)
for name in ('integrate_studio.py','search_visibility.py'):
    subprocess.run([sys.executable,str(ROOT/'deploy'/name),str(SITE)],check=True,cwd=ROOT)
subprocess.run(['node',str(ROOT/'deploy/test_studio.cjs')],check=True,cwd=ROOT)
app=SITE/'src/app.js'
apptext=app.read_text(encoding='utf-8')
apptext=apptext.replace("studio:'studio',signals:","studio:'studio',about:'about',signals:")
apptext=apptext.replace("switch(state.route){","switch(state.route){case'about':break;")
apptext=apptext.replace("studio:'navStudio'})","studio:'navStudio',about:'about'})")
apptext=apptext.replace(",['studio','navStudio','09']",'')
apptext=apptext.replace("studio:'studio',","studio:'home',")
apptext=apptext.replace("case'studio':screen.innerHTML=window.AtlasStudio.render({state});window.AtlasStudio.init({state});break;",'')
start=apptext.index('<section class="tool-section">')
end=apptext.index('</section>',start)+len('</section>')
tools=apptext[start:end].replace('<section class="tool-section">','<section class="tool-section da-home-modules" id="da-home-modules">',1)
tools=tools.replace('</div></section>',"${sectionCard('about',8,'about','aboutText','research')}</div></section>",1)
apptext=apptext[:start]+apptext[end:]
anchor=apptext.index('<div class="metrics">',apptext.index('function renderHome()'))
apptext=apptext[:anchor]+tools+apptext[anchor:]
apptext=apptext.replace('<a class="btn outline" href="#sim">','<button type="button" class="btn outline" data-da-explore>').replace("${esc(t('simulate'))} <span>↗</span></a>","${esc(t('modulesTitle'))} <span>↓</span></button>",1)
apptext=apptext.replace("<a href=\"#research\">${esc(t('readmore'))}","<a href=\"#about\">${esc(t('readmore'))}")
assert "['studio','navStudio','09']" not in apptext
assert 'da-home-modules' in apptext
assert "studio:'home'" in apptext
assert all("sectionCard('"+route+"'" in apptext for route in ('atlas','signals','news','compare','votes','sim','research','about'))
app.write_text(apptext,encoding='utf-8')
page=SITE/'index.html'
html=page.read_text(encoding='utf-8')
assert '</body>' in html
# Supply a visible initial heading until the SPA replaces the body.
if '<h1' not in html.lower():
    html=html.replace('<body>','<body><main id="atlas-initial" style="padding:2rem"><h1>Diplomatic Atlas</h1><p>International relations research and education.</p><a href="./#research">Research Library</a></main>',1)
html=html.replace('src/live.js"','src/live.js?v=20261125-home18"')
html=html.replace('</head>','<link rel="stylesheet" href="src/atlas_extra.css?v=20261125-18">\n</head>')
html=html.replace('</body>','<script src="src/atlas_extra.js?v=20261125-18"></script>\n</body>')
html=html.replace('</body>','<script src="src/live_intelligence.js?v=20261125-home18"></script>\n</body>',1)
# Only the selected production project is eligible for indexing.
primary = os.environ.get('ATLAS_PRIMARY_HOST') == '1'
canonical = 'https://diplomatic-atlas.pages.dev/'
old = 'https://nikkn997.github.io/Diplomatic.Atlas/'
if primary:
    html = html.replace(old, canonical)
    for name in ('research-studio.html','sitemap.xml'):
        path = SITE/name
        path.write_text(path.read_text(encoding='utf-8').replace(old,canonical),encoding='utf-8')
html=re.sub(r'src/app\.js(?:\?v=[^" ]+)?(?=")','src/app.js?v=20261125-18',html)
# SEO: public project name and current scope, independent of hidden Studio.
description='Diplomatic Atlas is an independent international relations platform with a world atlas, diplomatic events, UN voting records, country data and research tools.'
html=html.replace('Diplomatic Atlas: independent international relations research with a world atlas, UN voting records, diplomatic events and a Research Studio.',description)
html=html.replace('<a href="./research-studio.html">Read about Research Studio</a>.','<a href="./#research">Explore the research library</a>.')
html=html.replace('<a href="./research-studio.html">Explore Research Studio</a>','<a href="./#research">Explore the research library</a>')
html=re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)',lambda m: m.group(1)+json.dumps({**json.loads(m.group(2)),'name':'Diplomatic Atlas','alternateName':'DiplomaticAtlas','description':description},ensure_ascii=False)+m.group(3),html,count=1,flags=re.S)
assert 'and a Research Studio.' not in html
assert 'DiplomaticAtlas' in html
page.write_text(html,encoding='utf-8')
(SITE/'research-studio.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=./"><title>Diplomatic Atlas</title></head><body><a href="./">Diplomatic Atlas</a></body></html>',encoding='utf-8')
xml=ET.parse(SITE/'sitemap.xml')
ns='{http://www.sitemaps.org/schemas/sitemap/0.9}'
ET.register_namespace('',ns[1:-1])
for node in list(xml.getroot()):
    if (node.findtext(ns+'loc') or '').endswith('/research-studio.html'): xml.getroot().remove(node)
xml.write(SITE/'sitemap.xml',encoding='utf-8',xml_declaration=True)
# Live metadata must be network-first, including when an earlier service worker is installed.
sw=SITE/'service-worker.js'
swtext=re.sub(r"const CACHE='[^']+';", "const CACHE='diplomatic-atlas-static-home18';",sw.read_text(encoding='utf-8'))
swtext=swtext.replace('if(dynamic||freshAssets||event.request.mode',"if(dynamic||freshAssets||url.pathname.endsWith('/refresh-status.json')||url.pathname.endsWith('/live_intelligence.js')||event.request.mode")
swtext=swtext.replace("if(dynamic||freshAssets||", "if(dynamic||freshAssets||url.pathname.endsWith('/data/research-live.json')||url.pathname.includes('/src/atlas_extra.')||")
sw.write_text(swtext,encoding='utf-8')
release=SITE/'data/release.js'
release.write_text(release.read_text(encoding='utf-8').replace('v1.12','v1.18').replace('v1.13','v1.18'),encoding='utf-8')
for name in ('globe.js','studio.js','app.js','live_intelligence.js','live.js','atlas_extra.js'):
    subprocess.run(['node','--check',str(SITE/'src'/name)],check=True)
ET.parse(SITE/'sitemap.xml')
for name in ('liveNews','liveEvents','indicators'):
    for ext in ('js','json'):
        f=ROOT/'snapshot-cache'/f'{name}.{ext}'
        if f.is_file() and f.stat().st_size:
            shutil.copy2(f,SITE/'data'/f.name)
# Fetch the same licensed photo assets used in the current build, where available.
try:
    subprocess.run([sys.executable,'scripts/build_story_photos.py'],cwd=SITE,check=True,timeout=150)
except (subprocess.SubprocessError,OSError) as e:
    print('Photo refresh unavailable; using bundled assets:',e)
status={'schema':1,'trigger':'cloudflare-build','built_at':dt.datetime.now(dt.timezone.utc).isoformat(),'sources':{}}
digest=hashlib.sha256()
for name in ('index.html','service-worker.js','src/app.js','src/globe.js','src/studio.js','src/live_intelligence.js','data/liveNews.json','data/liveEvents.json','data/indicators.json'):
    digest.update(name.encode()+b'\0'+(SITE/name).read_bytes()+b'\0')
status['fingerprint']=digest.hexdigest()
for name in ('liveNews','liveEvents','indicators'):
    data=json.loads((SITE/'data'/f'{name}.json').read_text())
    status['sources'][name]={'updated_at':data.get('updated_at'),'status':data.get('status'),'count':len(data.get('items',data.get('countries',{})))}
(SITE/'refresh-status.json').write_text(json.dumps(status,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
PUBLIC.mkdir(exist_ok=True)
for name in ('index.html','manifest.webmanifest','service-worker.js','research-studio.html','refresh-status.json'):
    shutil.copy2(SITE/name,PUBLIC/name)
for name in ('assets','data','src'):
    shutil.copytree(SITE/name,PUBLIC/name,dirs_exist_ok=True)
if (SITE/'PHOTO_CREDITS.md').is_file():
    shutil.copy2(SITE/'PHOTO_CREDITS.md',PUBLIC/'PHOTO_CREDITS.md')
# Advanced-mode Pages worker handles only live data, preserving all other static assets.
worker=ROOT/'deploy/cloudflare_pages_worker.mjs'
subprocess.run(['node','--check',str(worker)],check=True)
shutil.copy2(worker,PUBLIC/'_worker.js')
routes=['/research-studio.html','/data/research-live.json','/data/shared-live.js','/refresh-status.json','/data/liveNews.json','/data/liveNews.js','/data/liveEvents.json','/data/liveEvents.js','/data/indicators.json','/data/indicators.js']
(PUBLIC/'_routes.json').write_text(json.dumps({'version':1,'include':routes,'exclude':[]}),encoding='utf-8')
# Keep alternative hosts non-indexable. Publish only the chosen site's sitemap.
if primary:
    shutil.copy2(SITE/'sitemap.xml',PUBLIC/'sitemap.xml')
    (PUBLIC/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+canonical+'sitemap.xml\n',encoding='utf-8')
    verification=ROOT/'deploy'/'verification-cloudflare'
    if verification.is_dir():
        for path in verification.glob('*.html'):
            if path.name.startswith(('google','yandex_','BingSiteAuth')):
                shutil.copy2(path,PUBLIC/path.name)
    assert 'rel="canonical" href="'+canonical+'"' in (PUBLIC/'index.html').read_text(encoding='utf-8')
    assert all(loc.text.startswith(canonical) for loc in ET.parse(PUBLIC/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'))
else:
    (PUBLIC/'robots.txt').write_text('User-agent: *\nAllow: /\n',encoding='utf-8')
headers='' if primary else '/*\n  X-Robots-Tag: noindex\n'
headers+='/refresh-status.json\n  Cache-Control: no-cache\n  X-Robots-Tag: noindex\n/data/*\n  Cache-Control: no-cache\n  X-Robots-Tag: noindex\n/service-worker.js\n  Cache-Control: no-cache\n'
(PUBLIC/'_headers').write_text(headers,encoding='utf-8')
assert (PUBLIC/'src/globe.js').is_file()
print('Cloudflare preview build ready in public/. Live endpoints use Cloudflare KV; original GitHub deployment unaffected.')
