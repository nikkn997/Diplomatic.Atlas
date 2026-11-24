#!/usr/bin/env python3
"""Legacy GitHub Pages consumes the public Cloudflare snapshot with bundled fallback."""
import pathlib
import re
import sys

root=pathlib.Path(sys.argv[1])
host='https://diplomatic-atlas.pages.dev/'
index=root/'index.html'
html=index.read_text(encoding='utf-8')
anchor='<script src="data/indicators.js"></script>'
assert html.count(anchor)==1, 'Missing initial data script'
# A failed network script leaves the previously loaded local snapshots intact.
html=html.replace(anchor,anchor+'\n  <script src="'+host+'data/shared-live.js"></script>',1)
html=html.replace('20261124-live1','20261124-shared1')
index.write_text(html,encoding='utf-8')
for name in ('live.js','signals.js'):
    path=root/'src'/name
    code=path.read_text(encoding='utf-8')
    # Only known public, read-only snapshot fetches are redirected.
    code=re.sub(r"""(fetch\(\s*['"])(?:\./)?(data/(?:liveNews|liveEvents|indicators)\.json)""",lambda m:m.group(1)+host+m.group(2),code)
    path.write_text(code,encoding='utf-8')
sw=root/'service-worker.js'
s=sw.read_text(encoding='utf-8').replace('20261124-globe1','20261124-shared1')
sw.write_text(s,encoding='utf-8')
print('Legacy site now reads shared Cloudflare data; bundled snapshots remain as fallback.')
