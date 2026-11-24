#!/usr/bin/env python3
"""Source-constrained RSS-to-map adapter.

Only converts an official UN Geneva article to an event pin when its TITLE
explicitly states a recognised conference/meeting/talks location. No inferred
participants, alliances, country-level vote claims, or lines are generated.
The place is labelled as title-derived, not independently geocoded/verified.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import re
import sys
from pathlib import Path
import update_news

ROOT=Path(__file__).resolve().parent.parent
UTC=dt.timezone.utc
# Curated finite dictionary with city centres; no coordinates guessed at runtime.
PLACES={
    'Geneva':(46.204,6.144,'CHE'),'New York':(40.758,-73.985,'USA'),
    'Abu Dhabi':(24.454,54.377,'ARE'),'Antalya':(36.897,30.714,'TUR'),
    'Paris':(48.856,2.352,'FRA'),'Vienna':(48.208,16.373,'AUT'),
    'Istanbul':(41.008,28.978,'TUR'),'Nairobi':(-1.286,36.817,'KEN'),
    'Doha':(25.285,51.531,'QAT'),'Brussels':(50.850,4.352,'BEL'),
    'Rome':(41.903,12.496,'ITA'),'London':(51.507,-.128,'GBR'),
    'Washington':(38.907,-77.037,'USA'),'Bangkok':(13.756,100.502,'THA'),
    'Seoul':(37.566,126.978,'KOR'),'Baku':(40.409,49.868,'AZE'),
    'Copenhagen':(55.676,12.568,'DNK'),'Madrid':(40.417,-3.703,'ESP'),
    'The Hague':(52.071,4.300,'NLD'),'Addis Ababa':(9.030,38.740,'ETH'),
    'Dubai':(25.204,55.270,'ARE'),'Berlin':(52.520,13.405,'DEU'),
    'Tokyo':(35.676,139.650,'JPN'),'Kigali':(-1.944,30.062,'RWA'),
    'Lisbon':(38.722,-9.139,'PRT'),'Helsinki':(60.169,24.938,'FIN'),
}
# Meeting explicitly named with city near "in/at" or "City talks/summit".
MEET=r'(?:talks?|summit|conference|meetings?|negotiations?|forum|roundtable|dialogue|delegations?)'
CITY='|'.join(map(re.escape,sorted(PLACES,key=len,reverse=True)))
VENUE=re.compile(rf'{MEET}.{{0,70}}?\b(?:in|at)\s+(?P<city>{CITY})\b',re.I)
INVERSE=re.compile(rf'\b(?P<city>{CITY})\s+{MEET}',re.I)

def event_from_story(article):
    title=article.get('title','')
    match=VENUE.search(title) or INVERSE.search(title)
    if not match:return None
    city=next((k for k in PLACES if k.casefold()==match.group('city').casefold()),None)
    if not city:return None
    lat,lon,country=PLACES[city]
    publisher=article.get('publisher','UN')
    url=article.get('url','')
    official=('un','ungeneva','geneva_meetings','who','wto','iaea','consilium')
    if not any(update_news.safe_url(url, source) for source in official):return None
    date=article.get('published','')[:10]
    if not re.fullmatch(r'\d{4}-\d\d-\d\d',date):return None
    short=title.lower()
    category='negotiation' if any(x in short for x in ('talk','negotiat','dialogue')) else 'multilateral'
    eid='feed-'+hashlib.sha256(url.encode()).hexdigest()[:14]
    return dict(
        id=eid,date=date,category=category,city=city,country=country,
        lat=lat,lon=lon,participants=[],
        title={'en':title[:240]},
        description={'en':(article.get('summary') or 'Official publisher headline; open the source for details.')[:300]},
        publisher=publisher,source=url,automated=True,
        locationBasis='City explicitly mentioned in an official publisher headline; approximate city-centre pin, not a verified venue or attendance.',
    )

def generate(fixture_dir=None,output_dir=None,now=None,from_news_snapshot=False):
    now=now or dt.datetime.now(UTC)
    existing_path=Path(output_dir or ROOT/'data')/'liveEvents.json'
    previous=[];old_snapshot={}
    if existing_path.exists():
        try:
            old_snapshot=json.loads(existing_path.read_text(encoding='utf-8'))
            previous=old_snapshot.get('items',[])
        except (ValueError,OSError,TypeError):previous=[]
    items={x['id']:x for x in previous if isinstance(x,dict) and x.get('id')}
    success=[]
    providers=('un','ungeneva','geneva_meetings','who','wto','iaea','consilium')
    snapshot_entries=[];available_sources=set()
    if from_news_snapshot and fixture_dir is None:
        try:
            snapshot_path=Path(output_dir or ROOT/'data')/'liveNews.json'
            source_snapshot=json.loads(snapshot_path.read_text(encoding='utf-8'))
            snapshot_entries=source_snapshot.get('items',[])
            available_sources=set(source_snapshot.get('sources',[]))
        except (OSError,ValueError,TypeError):pass
    for provider in providers:
        try:
            if from_news_snapshot and fixture_dir is None:
                if provider not in available_sources: raise ValueError('Publisher source unavailable on this refresh')
                articles=[r for r in snapshot_entries if r.get('source')==provider]
            else:
                if fixture_dir is not None:payload=(Path(fixture_dir)/(provider+'.xml')).read_bytes()
                else:payload=update_news.read_url(update_news.FEEDS[provider]['url'])
                articles=update_news.parse_feed(payload,provider,now)
            success.append(provider)
            for article in articles:
                event=event_from_story(article)
                if event:items[event['id']]=event
        except Exception as exc:print(f'{provider} failed: {exc}',file=sys.stderr)
    if not success:return False
    # Retain latest 90 days only, no forthcoming hypothetical events.
    cutoff=(now-dt.timedelta(days=90)).date().isoformat()
    out=sorted((e for e in items.values() if cutoff<=e.get('date','')<=now.date().isoformat()),key=lambda e:e['date'],reverse=True)[:80]
    data={'updated_at':now.strftime('%Y-%m-%dT%H:%M:%SZ'),'status':'success' if len(success)==len(providers) else 'partial',
          'sources':success,'items':out,'method':'Meeting city extracted from official publisher headline only; no inferred participants, attendance or agreements.'}
    if old_snapshot and all(old_snapshot.get(k)==data[k] for k in ('items','status','sources','method')):
        print('No new sourced venue pins; retaining previous snapshot.')
        return True
    directory=Path(output_dir or ROOT/'data');directory.mkdir(parents=True,exist_ok=True)
    (directory/'liveEvents.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (directory/'liveEvents.js').write_text('window.ATLAS_LIVE_EVENTS='+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+';\n',encoding='utf-8')
    print('Updated sourced event pins:',len(out),'from',','.join(success))
    return True

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--fixtures',type=Path);parser.add_argument('--output',type=Path)
    parser.add_argument('--from-news-snapshot',action='store_true')
    args=parser.parse_args();sys.exit(0 if generate(args.fixtures,args.output,from_news_snapshot=args.from_news_snapshot) else 1)
