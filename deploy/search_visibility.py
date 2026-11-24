#!/usr/bin/env python3
"""SEO and cache migration for Diplomatic Atlas on GitHub Pages.

Safe static metadata, a distinct crawlable Research Studio landing page,
and cache-busted app assets. Search engine verification is user-owned.
"""
import datetime
import html
import json
import pathlib
import re
import sys
from xml.sax.saxutils import escape

SITE = "https://nikkn997.github.io/Diplomatic.Atlas/"
REV = "20261124-i18n3"
TITLE = "Diplomatic Atlas | International Relations Research Platform"
DESC = ("Diplomatic Atlas is an independent international relations research "
        "and education project with a world atlas, sourced diplomatic events, "
        "UN voting records, interactive simulations and a Research Studio.")


def replace_meta(page, attr, value, new_content):
    rx = re.compile(r'(<meta\s+' + re.escape(attr) +
                    r'="' + re.escape(value) + r'"\s+content=")[^"]*("\s*/?>)', re.I)
    updated, count = rx.subn(lambda m: m.group(1) + html.escape(new_content, quote=True) + m.group(2), page, count=1)
    if count != 1:
        raise RuntimeError("Missing meta: " + attr + "=" + value)
    return updated


def main(root):
    root = pathlib.Path(root)
    page_path = root / "index.html"
    page = page_path.read_text(encoding="utf-8")
    page, title_count = re.subn(r"<title>.*?</title>", "<title>" + html.escape(TITLE) + "</title>", page, count=1)
    if title_count != 1:
        raise RuntimeError("Main HTML title missing")

    page = replace_meta(page, "name", "description", DESC)
    page = replace_meta(page, "property", "og:title", TITLE)
    page = replace_meta(page, "property", "og:description", DESC)

    if 'name="robots"' not in page:
        extras = [
            '<link rel="canonical" href="' + SITE + '">',
            '<meta name="robots" content="index, follow, max-image-preview:large">',
            '<meta property="og:url" content="' + SITE + '">',
            '<meta property="og:site_name" content="Diplomatic Atlas">',
            '<meta property="og:image" content="' + SITE + 'assets/images/world-overview.webp">',
            '<meta name="twitter:card" content="summary_large_image">',
            '<meta name="twitter:title" content="' + html.escape(TITLE, quote=True) + '">',
            '<meta name="twitter:description" content="' + html.escape(DESC, quote=True) + '">',
            '<meta name="twitter:image" content="' + SITE + 'assets/images/world-overview.webp">',
            '<script type="application/ld+json">' +
            json.dumps({"@context":"https://schema.org","@type":"WebSite",
                        "name":"Diplomatic Atlas","url":SITE,"description":DESC,
                        "inLanguage":["en","ru","fr","es","ar","zh"]},
                       ensure_ascii=False).replace("</", "<\\/") + '</script>',
        ]
        page = page.replace("</head>", "  " + "\n  ".join(extras) + "\n</head>", 1)

    # Versioned asset URLs bypass the old service worker's cache-first lookup.
    # They are stable across frequent RSS-only refreshes, avoiding pointless asset downloads.
    for asset in ("src/app.js", "src/studio.js", "src/studio.css", "data/release.js"):
        page = page.replace('"' + asset + '"', '"' + asset + "?v=" + REV + '"')

    if "research-studio.html" not in page:
        page = page.replace(
            "<noscript>Diplomatic Atlas requires JavaScript for its interactive maps and educational tools.</noscript>",
            '<noscript>Diplomatic Atlas is an independent international relations research project. '
            'It includes an interactive world atlas, sourced diplomatic events, '
            'United Nations voting analysis and research exercises. '
            '<a href="./research-studio.html">Read about Research Studio</a>. '
            'Enable JavaScript for interactive features.</noscript>'
        )
    page_path.write_text(page, encoding="utf-8")

    release = root / "data/release.js"
    s = release.read_text(encoding="utf-8")
    if "v1.11" in s:
        release.write_text(s.replace("v1.11", "v1.12"), encoding="utf-8")

    swpath = root / "service-worker.js"
    sw = swpath.read_text(encoding="utf-8")
    sw, count = re.subn(r"const CACHE='[^']+';", "const CACHE='diplomatic-atlas-static-" + REV + "';", sw, count=1)
    if count != 1:
        raise RuntimeError("Service worker CACHE declaration missing")
    if "'./src/studio.js'" not in sw:
        sw = sw.replace("'./src/app.js'", "'./src/app.js','./src/studio.js','./src/studio.css'", 1)
    # Network-first for changed program files, retain offline fallback.
    sw = sw.replace(
        "if(dynamic||event.request.mode==='navigate'){",
        "const freshAssets=/\\/(?:src\\/(?:app|studio)\\.(?:js|css)|data\\/release\\.js)$/.test(url.pathname);\n"
        "  if(dynamic||freshAssets||event.request.mode==='navigate'){"
    )
    swpath.write_text(sw, encoding="utf-8")

    landing_url = SITE + "research-studio.html"
    research_html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Research Studio | Diplomatic Atlas — Independent International Relations Research</title>
<meta name="description" content="Explore the Research Studio within Diplomatic Atlas: independently verified international relations research questions, documented diplomatic event connections and a personal evidence portfolio.">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{landing_url}">
<meta property="og:type" content="website">
<meta property="og:title" content="Research Studio | Diplomatic Atlas">
<meta property="og:url" content="{landing_url}">
<meta property="og:description" content="Student-led research workspace for international relations, with sourced events and transparent methods.">
<meta property="og:image" content="{SITE}assets/images/world-overview.webp">
<link rel="icon" href="./assets/images/mark.svg" type="image/svg+xml">
<style>
:root{{color-scheme:light}}*{{box-sizing:border-box}}
body{{margin:0;background:#f5f2e9;color:#182f34;font:16px/1.7 system-ui,Arial,sans-serif}}
header,main,footer{{max-width:1100px;margin:auto;padding:28px 28px}}
header{{display:flex;justify-content:space-between;align-items:center;gap:15px;border-bottom:1px solid #d7d6c9}}
.brand{{letter-spacing:.14em;font-size:13px;font-weight:800;color:#17343a;text-decoration:none}}
a{{color:#805531}}a:focus-visible,button:focus-visible{{outline:2px solid #9d7446;outline-offset:4px}}
.hero{{padding:75px 0 55px}}h1,h2{{font-family:Georgia,serif;font-weight:normal;line-height:1.05}}h1{{font-size:clamp(48px,8vw,85px);margin:15px 0}}h2{{font-size:34px}}.overline{{text-transform:uppercase;letter-spacing:.2em;font-size:11px;font-weight:700;color:#a06a42}}p{{max-width:770px}}
.cta{{display:inline-block;background:#1a393f;color:white;text-decoration:none;padding:13px 24px;margin:20px 0;font-weight:700}}
.cards{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}}
article{{background:#fffefa;border:1px solid #d9d7ce;padding:25px}}
article h2{{font-size:28px}}footer{{border-top:1px solid #d7d6c9;font-size:13px;color:#60716b}}
@media(max-width:700px){{.cards{{grid-template-columns:1fr}}header,main,footer{{padding:20px}}}}
</style></head><body>
<header><a class="brand" href="./">DIPLOMATIC ATLAS</a><a href="./#studio">Open interactive Studio ↗</a></header>
<main><section class="hero"><p class="overline">RESEARCH / INDEPENDENT / STUDIO</p>
<h1>Research Studio<span style="color:#b57f54">.</span></h1>
<p>Diplomatic Atlas is an independent student-led international relations research and educational project.
Research Studio connects original-source exploration with a private workspace for building evidence-based research portfolios.</p>
<a class="cta" href="./#studio">Launch the interactive Research Studio ↗</a>
<p><small>The platform is independent and is not affiliated with the United Nations.</small></p></section>
<section class="cards" aria-label="Research Studio modules">
<article><p class="overline">01 / Research Workshop</p><h2>Research questions and primary sources</h2>
<p>Five starting research prompts cover recorded UN voting, historic negotiations, nuclear diplomacy, climate outcomes and international agreements.
Prompts are not completed, peer-reviewed or published research. Students verify claims using original records and save private working drafts.</p></article>
<article><p class="overline">02 / Diplomatic Connections</p><h2>Documented event participation</h2>
<p>Explore source-linked meetings and event locations by country. Connections indicate documented participation or host locations,
not alliances, support, agreements or inferred country positions.</p></article>
<article><p class="overline">03 / Portfolio Log</p><h2>Evidence of work</h2>
<p>Record real milestones, published work and feedback with optional links. Entries are supplied by the user, are not verified by the platform,
and remain only in that browser unless exported as Markdown.</p></article>
</section>
<section><h2>Research approach</h2>
<p>The platform prioritizes primary-source traceability, source dates, clear uncertainty and a separation between historical
records and present-day claims. It does not manufacture political rankings or infer votes from aggregate UN General Assembly totals.</p>
<p>Explore the <a href="./#atlas">World Atlas</a>, <a href="./#signals">Diplomatic Signals</a>,
<a href="./#votes">UN Voting Explorer</a> and <a href="./#studio">Research Studio</a>.</p></section></main>
<footer>© 2026 Diplomatic Atlas · Independent research and education · <a href="./">Back to homepage</a></footer>
</body></html>
"""
    (root / "research-studio.html").write_text(research_html, encoding="utf-8")
    lastmod = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for u in (SITE, landing_url):
        xml += '  <url><loc>' + escape(u) + '</loc><lastmod>' + lastmod + '</lastmod></url>\n'
    xml += '</urlset>\n'
    (root/"sitemap.xml").write_text(xml, encoding="utf-8")
    # This file is useful for a future custom domain, but robots directives on
    # a GitHub project path do NOT control the origin-level /robots.txt.
    (root/"robots.txt").write_text("User-agent: *\nAllow: /\nSitemap: " + SITE + "sitemap.xml\n", encoding="utf-8")
    assert "src/app.js?v=" + REV in page
    assert "src/studio.js?v=" + REV in page
    assert landing_url in xml
    assert 'rel="canonical"' in research_html
    print("SEO metadata, public landing page, sitemap, cache migration and studio version: OK")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python deploy/search_visibility.py SITE_DIR")
    main(sys.argv[1])
