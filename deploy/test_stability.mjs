import assert from 'node:assert/strict';
import {marcRows,parseFeed,indicoRows} from './cloudflare_refresh.mjs';
const xml='<marc:collection><marc:record><marc:controlfield tag="001"> 123 </marc:controlfield><marc:datafield tag="245"><marc:subfield code="a">Test resolution</marc:subfield></marc:datafield><marc:datafield tag="191"><marc:subfield code="a">A/RES/81/1</marc:subfield></marc:datafield></marc:record></marc:collection>';
assert.equal(marcRows(xml)[0].symbol,'A/RES/81/1');
assert.equal(marcRows(xml.replace('A/RES/81/1','Other document')).length,0);
const rss='<rss><channel><item><title>Sample published news headline</title><link>https://news.un.org/en/story/test</link><pubDate>Thu, 26 Nov 2026 12:00:00 GMT</pubDate></item></channel></rss>';
assert.equal(parseFeed(rss,'un',Date.parse('2026-11-26T13:00:00Z')).length,1);
assert.throws(()=>parseFeed('<html>challenge</html>','un'));
console.log('Stability: namespace-aware voting metadata, RSS source validation and rejection of non-feed responses: OK');

const picture='https://global.unitednations.entermediadb.net/assets/mediadb/services/module/asset/downloads/preset/Collections/test.jpg/image560x340cropped.jpg';
assert.equal(parseFeed(rss.replace('</item>','<enclosure url="'+picture+'" type="image/jpeg"/></item>'),'un',Date.parse('2026-11-26T13:00:00Z'))[0].image,picture);
const conference='<tr class="event"><td class="time"><span title="Ongoing from 26 Nov 2026, 08:00 until 27 Nov 2026, 18:00.">ongoing</span></td><td class="title"><a class="js-mathjax" href="/event/123/">Test conference</a><span class="location-info right"><span class="text">Palais des Nations, Geneva, Switzerland</span></span></td></tr>';
assert.equal(indicoRows(conference,'2026-11-26',Date.parse('2026-11-26T12:00:00Z'))[0].city,'Geneva');
console.log('UN publisher previews and scheduled conference location tests: OK');
