#!/usr/bin/env python3
"""Update an attributed headline snapshot from eight trusted RSS feeds.
Publisher-supplied photos are links only; there is no scraping or rehosting of media.
The script uses Python stdlib; remote sources are untrusted data.
"""
from __future__ import annotations
import argparse
import datetime as dt
import email.utils
import html
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = Path(__file__).resolve().parent.parent
FEEDS = {
    "un": {"publisher": "UN News", "url": "https://news.un.org/feed/subscribe/en/news/all/rss.xml", "host": "news.un.org"},
    "bbc": {"publisher": "BBC News", "url": "https://feeds.bbci.co.uk/news/world/rss.xml", "host": "www.bbc.com"},
    "ungeneva": {"publisher": "UN Geneva", "url": "https://www.ungeneva.org/news-media/press-items-list/rss.xml", "host": "www.ungeneva.org"},
    "geneva_meetings": {"publisher": "UN Geneva Meetings", "url": "https://www.ungeneva.org/news-media/meeting-summaries-list/rss.xml", "host": "www.ungeneva.org"},
    "who": {"publisher": "World Health Organization", "url": "https://www.who.int/rss-feeds/news-english.xml", "host": "www.who.int"},
    "wto": {"publisher": "World Trade Organization", "url": "https://www.wto.org/library/rss/latest_news_e.xml", "host": "www.wto.org"},
    "iaea": {"publisher": "International Atomic Energy Agency", "url": "https://www.iaea.org/feeds/topnews", "host": "www.iaea.org"},
    "consilium": {"publisher": "Council of the European Union", "url": "https://www.consilium.europa.eu/en/rss/pressreleases.ashx/", "host": "www.consilium.europa.eu"},
}
ALLOWED_LINK_HOSTS = {
    "un": ("news.un.org",),
    "bbc": ("www.bbc.com", "www.bbc.co.uk", "feeds.bbci.co.uk"),
    "ungeneva": ("www.ungeneva.org", "ungeneva.org"),
    "geneva_meetings": ("www.ungeneva.org", "ungeneva.org"),
    "who": ("www.who.int", "who.int"),
    "wto": ("www.wto.org", "wto.org"),
    "iaea": ("www.iaea.org", "iaea.org"),
    "consilium": ("www.consilium.europa.eu", "consilium.europa.eu"),
}
# No arbitrary image hosts: only the known publisher domains or their image CDNs.
IMAGE_HOSTS = (
    "news.un.org", "www.un.org", "media.un.org", "static.un.org",
    "ichef.bbci.co.uk", "ichef.bbci.com", "www.bbc.com", "bbc.com",
    "www.ungeneva.org", "ungeneva.org", "media.ungeneva.org",
    "www.who.int", "who.int", "cdn.who.int",
    "www.wto.org", "wto.org", "www.iaea.org", "iaea.org",
    "www.consilium.europa.eu", "consilium.europa.eu",
    "www.worldbank.org", "worldbank.org", "mediacenter.imf.org", "www.imf.org", "imf.org",
    "www.unep.org", "unep.org",
)

ARCHIVE_LINK_HOSTS = {
    "worldbank": ("www.worldbank.org", "worldbank.org"),
    "imf": ("mediacenter.imf.org", "www.imf.org", "imf.org"),
    "unep": ("www.unep.org", "unep.org"),
}


def safe_archive_url(url, source):
    try:
        p = urllib.parse.urlsplit(url)
        return (p.scheme == "https" and not p.username and not p.password
                and p.hostname in ARCHIVE_LINK_HOSTS.get(source, ())
                and p.port in (None, 443))
    except (TypeError, ValueError):
        return False

UTC = dt.timezone.utc




def clean_text(value: str) -> str:
    value = html.unescape(re.sub(r"<[^>]+>", " ", value or ""))
    value = re.sub(r"\s+", " ", value).strip()
    return value


def first_text(item, names):
    for name in names:
        el = item.find(name)
        if el is not None and (el.text or '').strip():
            return el.text.strip()
    return ''


def safe_url(url, provider):
    url = url.strip()
    try:
        p = urllib.parse.urlsplit(url)
        if p.scheme != "https" or p.username or p.password or p.port not in (None, 443):
            return None
        if (p.hostname or "").lower() not in ALLOWED_LINK_HOSTS[provider]:
            return None
        return urllib.parse.urlunsplit((p.scheme, p.netloc, p.path, p.query, ""))
    except (ValueError, TypeError):
        return None


def safe_media_url(url):
    try:
        p=urllib.parse.urlsplit((url or "").strip())
        if p.scheme != "https" or p.username or p.password or p.port not in (None,443):
            return ""
        if (p.hostname or "").lower() not in IMAGE_HOSTS:
            return ""
        if any(word in p.path.lower() for word in ("/logo", "-logo", "_logo", "favicon", "placeholder", "sprite", "/icon-", "default-avatar")):
            return ""
        if not (p.path.lower().endswith((".jpg",".jpeg",".png",".webp",".avif")) or any(marker in p.path.lower() for marker in ("/image/", "/images/", "/sites/default/files/", "/media/", "/resources/")) or "ichef.bbci" in p.hostname):
            # Some provider image CDN paths omit file suffix; conservative default.
            return ""
        return urllib.parse.urlunsplit((p.scheme,p.netloc,p.path,p.query,""))
    except (ValueError,TypeError):
        return ""


def plain_summary(s):
    # RSS description can contain HTML; we display text only and limit length.
    s=html.unescape(re.sub(r"<[^>]*>"," ",s or ""))
    s=" ".join(s.split())
    return s[:280].rsplit(" ",1)[0] if len(s)>280 else s


def media_thumbnail(item):
    """Return only a publisher-authorized image URL from RSS media metadata.

    Prefer larger media:content images when width is supplied; never use audio/video
    enclosure URLs as an image. URLs are also restricted to known publisher hosts.
    """
    entries=[]
    tags=(
        "{http://search.yahoo.com/mrss/}content",
        "{http://search.yahoo.com/mrss/}thumbnail",
        "enclosure",
    )
    for tag in tags:
        for elem in item.iter(tag):
            kind=(elem.get('type') or '').lower()
            medium=(elem.get('medium') or '').lower()
            if (kind and not kind.startswith('image/')) or (medium and medium not in ('image','photo')):
                continue
            url=safe_media_url(elem.get('url',''))
            if not url:
                continue
            width=int(elem.get('width','0')) if (elem.get('width') or '0').isdigit() else 0
            if width and width < 280:  # RSS logos and 64px icons are not article photography.
                continue
            entries.append((min(width,2500),url))
    # Some RSS descriptions contain explicit thumbnail markup.
    description=item.findtext('description') or ''
    if description:
        class ImageInDescription(HTMLParser):
            def __init__(self):
                super().__init__();self.urls=[]
            def handle_starttag(self,tag,attrs):
                if tag.lower()!='img':return
                attributes=dict(attrs)
                url=safe_media_url(attributes.get('src',''))
                if url:self.urls.append(url)
        parser=ImageInDescription();parser.feed(description[:20000])
        entries.extend((0,url) for url in parser.urls[:2])
    if not entries:return ''
    return max(entries,key=lambda pair:pair[0])[1]


def atom_items(root):
    ns={"a":"http://www.w3.org/2005/Atom"}
    for entry in root.findall("a:entry",ns):
        item=ET.Element("item")
        ET.SubElement(item,"title").text=entry.findtext('a:title','',namespaces=ns)
        link=next((x.get('href','') for x in entry.findall('a:link',ns) if x.get('rel') in (None,'alternate')), '')
        ET.SubElement(item,'link').text=link
        date=entry.findtext('a:published','',namespaces=ns) or entry.findtext('a:updated','',namespaces=ns)
        if date:
            try:
                val=dt.datetime.fromisoformat(date.replace('Z','+00:00'))
                if val.tzinfo is None:val=val.replace(tzinfo=UTC)
                date=email.utils.format_datetime(val.astimezone(UTC))
            except ValueError:
                date=''
        ET.SubElement(item,'pubDate').text=date
        ET.SubElement(item,'description').text=entry.findtext('a:summary','',namespaces=ns)
        for link in entry.findall('a:link',ns):
            if link.get('rel')=='enclosure' and link.get('type','').startswith('image/'):
                x=ET.SubElement(item,'enclosure')
                x.set('url',link.get('href',''))
                x.set('type',link.get('type',''))
        yield item


def parse_feed(payload, source, now):
    # Avoid excessively large or nested XML and do not resolve external entities.
    if len(payload) > 2_000_000 or b"<!DOCTYPE" in payload.upper() or b"<!ENTITY" in payload.upper():
        raise ValueError("Feed exceeds limit or contains a DTD")
    root = ET.fromstring(payload)
    if root.tag == 'rss':
        raw_items=root.findall('./channel/item')
    elif root.tag == '{http://www.w3.org/2005/Atom}feed':
        raw_items=list(atom_items(root))
    else:
        raise ValueError('Expected RSS 2.0 or Atom 1.0 root')
    result = []
    for item in raw_items[:110]:
        title = html.unescape(" ".join((item.findtext("title") or "").split()))
        title = re.sub(r"<[^>]{0,250}>", "", title).strip()
        if len(title) < 12 or len(title) > 240:
            continue
        url = safe_url(item.findtext("link") or "", source)
        if not url:
            continue
        pub = item.findtext("pubDate")
        if not pub:
            continue
        try:
            when = email.utils.parsedate_to_datetime(pub)
            if when.tzinfo is None:
                when = when.replace(tzinfo=UTC)
            when = when.astimezone(UTC)
        except (ValueError, TypeError, IndexError):
            continue
        if not dt.timedelta(hours=-24) <= now - when <= dt.timedelta(days=62):
            continue
        summary = clean_text(first_text(item, ["description", "{http://purl.org/rss/1.0/modules/content/}encoded"]))
        if len(summary) > 260:
            summary = summary[:257].rstrip() + "..."
        image = media_thumbnail(item)
        result.append({
            "source": source,
            "publisher": FEEDS[source]["publisher"],
            "title": title,
            "url": url,
            "published": when.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "summary": summary,
            "image": image,
            "category": "news",
            "locationLabel": FEEDS[source]["publisher"],
            "flagCode": "",
            "imageCredit": FEEDS[source]["publisher"] if image else "",
            "imageType": "publisher RSS media" if image else "",
        })
    return result


class ArticleImageParser(HTMLParser):
    """Collect likely publisher-selected OG/Twitter images without running scripts."""
    def __init__(self):
        super().__init__()
        self.candidates = []

    def handle_starttag(self, tag, attrs):
        fields = dict(attrs)
        if tag.lower() == 'meta':
            prop = (fields.get('property') or fields.get('name') or '').lower()
            if prop in ('og:image', 'og:image:url', 'og:image:secure_url',
                        'twitter:image', 'twitter:image:src'):
                self.candidates.append(fields.get('content', ''))
        elif tag.lower() == 'link':
            if (fields.get('rel') or '').lower() == 'image_src':
                self.candidates.append(fields.get('href', ''))


def extract_publisher_image(article_url):
    """Read official publisher page metadata; no arbitrary page scraping or rehosting.

    Remote photos may still be denied by an image host. The UI then falls back to
    a clearly marked Wikimedia Commons archival context image, not a fabricated
    depiction of the reported event.
    """
    if not (any(safe_url(article_url, source) for source in FEEDS) or
            any(safe_archive_url(article_url, source) for source in ARCHIVE_LINK_HOSTS)):
        return ''
    try:
        req = urllib.request.Request(article_url, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; DiplomaticAtlasResearch/1.10; public-source metadata)',
            'Accept': 'text/html',
        })
        with urllib.request.urlopen(req, timeout=9) as response:
            if 'text/html' not in response.headers.get('Content-Type', 'text/html').lower():
                return ''
            page = response.read(700_000).decode('utf-8', 'replace')
            base = response.url
        parser = ArticleImageParser()
        parser.feed(page)
        for candidate in parser.candidates:
            resolved = urllib.parse.urljoin(base, html.unescape(candidate))
            image = safe_media_url(resolved)
            if image:
                return image
        return ''
    except (OSError, ValueError, UnicodeError, TimeoutError):
        return ''


def read_url(url):
    req = urllib.request.Request(url, headers={"User-Agent": "DiplomaticAtlasRSS/1.6 (+https://github.com/)", "Accept": "application/rss+xml,application/xml,text/xml"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read(2_000_001)


def generate(fixture_dir=None, output_dir=None, now=None):
    now = now or dt.datetime.now(UTC)
    entries = []
    ok = []
    output = Path(output_dir) if output_dir else ROOT / "data"
    previous = {}
    try:
        previous = json.loads((output / "liveNews.json").read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        pass
    for source, spec in FEEDS.items():
        try:
            if fixture_dir is not None:
                payload = (Path(fixture_dir) / (source + ".xml")).read_bytes()
            else:
                payload = read_url(spec["url"])
            stories = parse_feed(payload, source, now)
            if not stories:
                raise ValueError("Feed has no recent valid articles")
            ok.append(source)
            batch=stories[:50]
            entries.extend(batch)
            print(source, "accepted", len(stories))
        except Exception as exc:
            print(source, "failed:", exc, file=sys.stderr)
    if not ok:
        print("No feeds succeeded; previous snapshot stays unchanged.", file=sys.stderr)
        return False
    # For a new online publication, also enrich recent articles from the curated
    # 18-item archive, including World Bank, IMF and UNEP stories which are not
    # among the scheduled RSS feeds. These articles have exact publisher URLs.
    # Never rewrite the editorial title, translation or article date.
    if fixture_dir is None:
        archive_file = ROOT / 'data' / 'newsArchive.js'
        try:
            archive_text = archive_file.read_text(encoding='utf-8').strip().rstrip(';')
            archive_data = json.loads(archive_text.split('=', 1)[1])
            previous_by_url = {r.get('url',''):r for r in previous.get('items',[]) if isinstance(r,dict)}
            cutoff_archive = (now - dt.timedelta(days=62)).strftime('%Y-%m-%dT%H:%M:%SZ')
            known = {r['url'] for r in entries}
            for seed in archive_data.get('items',[]):
                if not isinstance(seed,dict) or not isinstance(seed.get('published'),str):
                    continue
                url=seed.get('url','')
                source=seed.get('source','')
                allowed=(safe_url(url,source) if source in FEEDS else None) or safe_archive_url(url,source)
                if not allowed or url in known or seed['published'] < cutoff_archive:
                    continue
                old=previous_by_url.get(url,{})
                # Preserve earlier validated image and timestamp for same URL.
                row={**seed,**{k:v for k,v in old.items() if k in ('image','imageCredit','imageType','imageCheckedAt','translations') and v}}
                entries.append(row)
                known.add(url)
        except (OSError,ValueError,TypeError,IndexError) as exc:
            print('Curated image-enrichment seed unavailable:',exc,file=sys.stderr)

    # Bounded concurrent OG enrichment applies across the complete freshest front page,
    # not only a few arbitrarily selected stories from each provider. This is best
    # effort: photos may be absent, hotlink-blocked, or subject to publisher licensing.
    if fixture_dir is None and entries:
        candidates=sorted(entries,key=lambda row:row['published'],reverse=True)
        candidates=[row for row in candidates if not row.get('image') and
                    (not row.get('imageCheckedAt') or
                     (now-dt.datetime.fromisoformat(row['imageCheckedAt'].replace('Z','+00:00'))) >= dt.timedelta(hours=18))][:28]
        with ThreadPoolExecutor(max_workers=6) as pool:
            futures={pool.submit(extract_publisher_image,row['url']):row for row in candidates}
            for future in as_completed(futures):
                row=futures[future]
                try:photo=future.result()
                except Exception:photo=''
                row['imageCheckedAt']=now.strftime('%Y-%m-%dT%H:%M:%SZ')
                if photo:
                    row['image']=photo
                    row['imageCredit']=row['publisher']
                    row['imageType']='publisher-selected page image'
    # Preserve the preceding verified 62-day archive when one feed publishes only
    # its newest items, or when an individual source is temporarily unavailable.
    cutoff = (now - dt.timedelta(days=62)).strftime("%Y-%m-%dT%H:%M:%SZ")
    previous_entries = [r for r in previous.get("items", []) if isinstance(r, dict) and r.get("published", "") >= cutoff and r.get("url")]
    old_by_url = {r['url'].lower():r for r in previous_entries}
    for row in entries:
        old = old_by_url.get(row['url'].lower())
        if old:
            # Do not lose a publisher image or prior human/Argos translation just
            # because the next RSS response omits an optional media field.
            for field in ('image','imageCredit','imageType','summary','translations','locationLabel','flagCode'):
                if not row.get(field) and old.get(field):
                    row[field] = old[field]
    seen = set()
    deduped = []
    for row in sorted(entries + previous_entries, key=lambda x: x["published"], reverse=True):
        key = row["url"].lower()
        if key not in seen:
            seen.add(key)
            deduped.append(row)
    data = {
        "updated_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "items": deduped[:200],
        "status": "success" if len(ok) == len(FEEDS) else "partial",
        "media_count": sum(bool(row.get("image")) for row in deduped[:200]),
        "sources": ok,
    }
    # Retain the last CONTENT update date when the feed headlines are unchanged.
    # This avoids needless commits and page rebuilds every five minutes.
    if previous and all(previous.get(k) == data[k] for k in ("items", "status", "media_count", "sources")):
        print("No changes in publisher feed items; keeping existing snapshot.")
        return True
    output.mkdir(parents=True, exist_ok=True)
    json_payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    (output / "liveNews.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output / "liveNews.js").write_text("window.ATLAS_LIVE_NEWS = " + json_payload.replace("<", "\\u003c") + ";\n", encoding="utf-8")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--fixtures", type=Path, help="Local fixtures for offline tests")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    sys.exit(0 if generate(args.fixtures, args.output) else 1)
