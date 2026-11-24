#!/usr/bin/env python3
"""Best-effort offline translation of attributed news snippets using Argos Translate.

No paid APIs. If a model is absent, preserve the English original and do not
pretend it is translated. Only short source-provided titles and snippets are
processed. Original article URLs, dates and source names are never modified.
"""
from __future__ import annotations
import argparse
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
TARGET_LANGS=('ru','fr','es','ar','zh')
MAX_ITEMS=36  # bounded CPU work in scheduled GitHub Actions

def available_translators(install_models=False):
    """Map target locale -> translation callable, using installed/downloadable models."""
    try:
        from argostranslate import package, translate
    except ImportError:
        print('Argos Translate unavailable: retaining original English for unconverted items.')
        return {}
    try:
        installed=translate.get_installed_languages()
        en=next((x for x in installed if x.code=='en'),None)
        def candidates():
            if not en:return {}
            result={}
            for lang in TARGET_LANGS:
                target=next((x for x in installed if x.code==lang),None)
                if target:
                    try:result[lang]=en.get_translation(target).translate
                    except Exception:pass
            return result
        ready=candidates()
        if install_models and len(ready)<len(TARGET_LANGS):
            try:
                package.update_package_index()
                available=package.get_available_packages()
                for lang in TARGET_LANGS:
                    if lang in ready:continue
                    option=next((p for p in available if p.from_code=='en' and p.to_code==lang),None)
                    if not option:
                        print(f'No English-to-{lang} Argos package available; using original.')
                        continue
                    try:
                        package.install_from_path(option.download())
                        installed=translate.get_installed_languages()
                        en=next((x for x in installed if x.code=='en'),None)
                        ready=candidates()
                        print(f'Installed Argos en→{lang}; ready={lang in ready}')
                    except Exception as exc:
                        print(f'Cannot install en→{lang} package: {type(exc).__name__}: {str(exc)[:100]}')
            except Exception as exc:
                print(f'Package index unavailable: {type(exc).__name__}: {str(exc)[:100]}')
        return ready
    except Exception as exc:
        print(f'Translation subsystem unavailable: {type(exc).__name__}: {str(exc)[:100]}')
        return {}

def translate_snapshot(payload, translators, max_items=MAX_ITEMS):
    """Update translations; existing hand-reviewed entries always take precedence."""
    count=0
    for item in sorted(payload.get('items',[]),key=lambda x:x.get('published',''),reverse=True)[:max_items]:
        if not isinstance(item,dict) or not isinstance(item.get('title'),str):continue
        title=item.get('title','')[:300]
        summary=item.get('summary','')[:450]
        if not title.strip():continue
        d=item.setdefault('translations',{})
        for lang,translator in translators.items():
            existing=d.get(lang)
            if isinstance(existing,dict) and existing.get('title') and existing.get('summary'):
                continue
            try:
                newtitle=translator(title).strip()
                newsummary=translator(summary).strip() if summary.strip() else ''
                # Guard against empty/garbled outputs without claiming translation.
                if len(newtitle)<5 or not newsummary or newtitle.lower()==title.lower():
                    continue
                if re.search(r'<[^>]{0,90}>',newtitle+newsummary):
                    continue
                d[lang]={'title':newtitle[:350],'summary':newsummary[:600],'method':'Argos Translate (machine translation; unofficial)'}
                count+=1
            except Exception as exc:
                print(f'Unable to translate {lang}: {type(exc).__name__}')
    return count

def write_json_and_js(path,payload):
    content=json.dumps(payload,ensure_ascii=False,indent=2)+'\n'
    path.write_text(content,encoding='utf-8')
    js=path.with_suffix('.js')
    js.write_text('window.ATLAS_LIVE_NEWS = '+json.dumps(payload,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+';\n',encoding='utf-8')

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--install-models',action='store_true',help='Download available free Argos model packages')
    parser.add_argument('--file',type=Path,default=ROOT/'data/liveNews.json')
    args=parser.parse_args()
    payload=json.loads(args.file.read_text(encoding='utf-8'))
    before=json.dumps(payload,sort_keys=True,ensure_ascii=False)
    engines=available_translators(install_models=args.install_models)
    n=translate_snapshot(payload,engines)
    if json.dumps(payload,sort_keys=True,ensure_ascii=False)!=before:
        write_json_and_js(args.file,payload)
    print(f'Translation records generated: {n}; languages with available models: {list(engines)}')
    return 0

if __name__=='__main__':
    raise SystemExit(main())
