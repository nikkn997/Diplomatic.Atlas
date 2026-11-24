#!/usr/bin/env python3
"""Build a parallel Cloudflare Pages preview from the same tested source package."""
import datetime as dt
import hashlib
import json
import pathlib
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
for name in ('globe.js','studio.js','studio.css','live_intelligence.js'):
    shutil.copy2(ROOT/'deploy'/name,SITE/'src'/name)
for name in ('integrate_studio.py','search_visibility.py'):
    subprocess.run([sys.executable,str(ROOT/'deploy'/name),str(SITE)],check=True,cwd=ROOT)
page=SITE/'index.html'
html=page.read_text(encoding='utf-8')
assert '</body>' in html
# Supply a visible initial heading until the SPA replaces the body.
if '<h1' not in html.lower():
    html=html.replace('<body>','<body><main id="atlas-initial" style="padding:2rem"><h1>Diplomatic Atlas</h1><p>International relations research and education.</p><a href="./research-studio.html">Research Studio</a></main>',1)
html=html.replace('</body>','<script src="src/live_intelligence.js?v=20261124-live1"></script>\n</body>',1)
# Keep the already indexed GitHub URL canonical during the parallel-host test.
# No ownership tokens for the old host are included in this deployment.
page.write_text(html,encoding='utf-8')
release=SITE/'data/release.js'
release.write_text(release.read_text(encoding='utf-8').replace('v1.12','v1.13'),encoding='utf-8')
for name in ('globe.js','studio.js','app.js','live_intelligence.js'):
    subprocess.run(['node','--check',str(SITE/'src'/name)],check=True)
subprocess.run(['node',str(ROOT/'deploy/test_studio.cjs')],check=True,cwd=ROOT)
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
# The new host remains a test mirror until the owner chooses the canonical URL.
(PUBLIC/'robots.txt').write_text('User-agent: *\nAllow: /\n',encoding='utf-8')
(PUBLIC/'_headers').write_text('/*\n  X-Robots-Tag: noindex\n/refresh-status.json\n  Cache-Control: no-cache\n/data/*\n  Cache-Control: no-cache\n/service-worker.js\n  Cache-Control: no-cache\n',encoding='utf-8')
assert (PUBLIC/'src/globe.js').is_file()
print('Cloudflare preview build ready in public/. Original GitHub deployment unaffected.')
