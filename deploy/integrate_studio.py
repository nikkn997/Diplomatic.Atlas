#!/usr/bin/env python3
"""Idempotent Research Studio installer for the checked v1.11 site package.
Never edits or invents research source data. Fails visibly if upstream markup changed.
"""
import pathlib
import re
import sys

root=pathlib.Path(sys.argv[1]).resolve() if len(sys.argv)>1 else pathlib.Path('site').resolve()
app=root/'src/app.js'
html=root/'index.html'
sw=root/'service-worker.js'

def insert_once(path,original,replacement,check):
    text=path.read_text(encoding='utf-8')
    if check in text:
        return
    if original not in text:
        raise RuntimeError(f'Expected original fragment missing from {path.name}: {original[:100]}')
    path.write_text(text.replace(original,replacement,1),encoding='utf-8')

insert_once(app,"research:'research',signals:'signals'","research:'research',studio:'studio',signals:'signals'","studio:'studio'")
insert_once(app,"['research','navResearch','08']]","['research','navResearch','08'],['studio','navStudio','09']]","['studio','navStudio','09']")
insert_once(app,"case'research':screen.innerHTML=renderResearch();initResearch();break;","case'research':screen.innerHTML=renderResearch();initResearch();break;case'studio':screen.innerHTML=window.AtlasStudio.render({state});window.AtlasStudio.init({state});break;","case'studio':screen.innerHTML")
insert_once(app,"research:'navResearch'})","research:'navResearch',studio:'navStudio'})","studio:'navStudio'")
insert_once(html,'  <link rel="stylesheet" href="src/styles.css">','  <link rel="stylesheet" href="src/styles.css">\n  <link rel="stylesheet" href="src/studio.css">','href="src/studio.css"')
insert_once(html,'  <script src="src/app.js"></script>','  <script src="src/studio.js"></script>\n  <script src="src/app.js"></script>','src="src/studio.js"')
page=html.read_text(encoding='utf-8')
page=re.sub(r'<title>Diplomatic Atlas — Release [^<]+</title>','<title>Diplomatic Atlas — Research Studio</title>',page,count=1)
html.write_text(page,encoding='utf-8')
text=sw.read_text(encoding='utf-8')
text=re.sub(r"const CACHE='diplomatic-atlas-static-v[^']+';", "const CACHE='diplomatic-atlas-static-research-studio-1';",text,count=1)
if "'./src/studio.js'" not in text:
    if "'./src/styles.css'" not in text:
        raise RuntimeError("Could not find CSS in service worker static cache")
    text=text.replace("'./src/styles.css'","'./src/studio.js','./src/studio.css','./src/styles.css'",1)
sw.write_text(text,encoding='utf-8')
if "studio:'studio'" not in app.read_text(encoding='utf-8'):
    raise RuntimeError('Research Studio route was not installed')
if not (root/'src/studio.js').is_file() or not (root/'src/studio.css').is_file():
    raise RuntimeError('Research Studio source assets missing')
print('Research Studio installed (route #studio, localized menu, styles, cache).')
