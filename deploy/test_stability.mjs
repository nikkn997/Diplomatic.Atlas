import assert from 'node:assert/strict';
import {marcRows,parseFeed} from './cloudflare_refresh.mjs';
const xml='<marc:collection><marc:record><marc:controlfield tag="001"> 123 </marc:controlfield><marc:datafield tag="245"><marc:subfield code="a">Test resolution</marc:subfield></marc:datafield><marc:datafield tag="191"><marc:subfield code="a">A/RES/81/1</marc:subfield></marc:datafield></marc:record></marc:collection>';
assert.equal(marcRows(xml)[0].symbol,'A/RES/81/1');
assert.equal(marcRows(xml.replace('A/RES/81/1','Other document')).length,0);
const rss='<rss><channel><item><title>Sample published news headline</title><link>https://news.un.org/en/story/test</link><pubDate>Thu, 26 Nov 2026 12:00:00 GMT</pubDate></item></channel></rss>';
assert.equal(parseFeed(rss,'un',Date.parse('2026-11-26T13:00:00Z')).length,1);
assert.throws(()=>parseFeed('<html>challenge</html>','un'));
console.log('Stability: namespace-aware voting metadata, RSS source validation and rejection of non-feed responses: OK');
