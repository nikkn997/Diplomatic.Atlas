# Diplomatic Atlas — v1.11

Independent student research platform for international relations: interactive world atlas, 2D/3D source-linked diplomatic events, UN General Assembly voting explorer, country comparison and a negotiation simulator.

## Publish the website (one ZIP)

1. Download **site-package.zip** from the latest ChatGPT release v1.11.
2. Open this repository → **Add file → Upload files**, upload exactly **site-package.zip** to the root of `main`, and commit. Do not unpack the ZIP or upload an earlier release.
3. Open **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
4. Open **Actions → Publish Diplomatic Atlas**. If the upload has not triggered it, choose **Run workflow**.
5. Once the workflow succeeds, the public site will be: https://nikkn997.github.io/Diplomatic.Atlas/

**The site is not published until the ZIP is present and a deployment succeeds.**

## Fully automated, source-linked updates

The configured workflow attempts to check these eight RSS feeds every **five minutes** (GitHub schedule delays/omissions are possible):

- UN News: https://news.un.org/feed/subscribe/en/news/all/rss.xml
- BBC World: https://feeds.bbci.co.uk/news/world/rss.xml
- UN Geneva press items: https://www.ungeneva.org/news-media/press-items-list/rss.xml
- UN Geneva meeting summaries: https://www.ungeneva.org/news-media/meeting-summaries-list/rss.xml
- WHO: https://www.who.int/rss-feeds/news-english.xml
- WTO: https://www.wto.org/library/rss/latest_news_e.xml
- IAEA: https://www.iaea.org/feeds/topnews
- Council of the EU: https://www.consilium.europa.eu/en/rss/pressreleases.ashx/

Photos: article-specific publisher images are preferred. When unavailable, the GitHub build downloads four CC-licensed, clearly labelled institutional archive photographs from Wikimedia Commons (not photographs of the story event). License and author details are recorded in PHOTO_CREDITS.md and on each card. Publisher-image availability must still be confirmed after deployment. Archived, source-attributed news is retained in `snapshot-cache/liveNews.json`. New items are kept when feeds subsequently omit them.

### Diplomatic Signals: automatic 2D / 3D map updates

The same news refresh checks official institutional headlines for a clearly specified city of **talks, summit, meeting, conference or negotiations**. Only headlines with a recognized city and source URL become map pins with approximate city-centre coordinates. They appear on both 2D and 3D after publication. **No diplomatic attendee or inter-country line is automatically invented from a headline.** Original sources and qualification are displayed. The retained file is `snapshot-cache/liveEvents.json`.

World Bank indicators are refreshed about every six hours. Free Argos Translate is attempted for new publisher headings when translation models can be obtained; otherwise the English original is labeled.

GitHub Pages is static hosting, not a continuously streaming real-time backend. Some feeds publish late or omit photographs. Publisher media may have reuse restrictions; show original links and attributions. GitHub Actions with standard GitHub-hosted runners is free for public repositories, subject to platform limitations.

## Methodology

All geopolitical references are educational, not government positions or claims about alignment. Diplomatic Atlas is independent and **not affiliated with the UN**.

## v1.11: distinct open-license photographs

The previous repeated-headquarters fallback is disabled. The site first uses the publisher-supplied image when available. For seven specific 2026 IMF/World Bank Annual Meetings and COP31 stories, a unique **related-forum photograph** from Wikimedia Commons (sourced from the European Commission audiovisual service or Asian Development Bank) is assigned with photographer, exact Commons file link and CC BY 4.0 credit. It is **not represented as the photograph of that particular press briefing**. Any remaining story without a valid photo is shown as an editorial text card. The GitHub build checks Commons image metadata/license and attempts to cache the distinct JPEGs in site/assets/newsroom/stories before deployment; network access must succeed. Details: PHOTO_CREDITS.md within the site package.

## Research Studio — ninth section

Open **https://nikkn997.github.io/Diplomatic.Atlas/#studio**.

Research Studio is a source-first independent research workspace with three interconnected parts:

- **Research Workshop:** five independent research questions; guided research methods; primary-source links where available; private notes; Markdown export. The prompts are **not** represented as published research.
- **Diplomatic Connections Explorer:** choose a country and explore the curated, source-linked event timeline and a visual network of explicitly recorded participation or host location. An edge is not an alliance, agreement, voting position, or claim of diplomatic alignment.
- **Portfolio Log:** record genuine milestones, publications and feedback with optional evidence URLs; export a Markdown evidence ledger. Entries are user-entered, **not independently verified**.

Notes and portfolio entries remain in the browser's local storage. They do not synchronize across devices or publish publicly. Use **Export Markdown** to back up valuable work. The interface uses the six official UN languages; source texts and some research questions retain their original English wording when not translated.

Source: `deploy/studio.js` and `deploy/studio.css`; installer `deploy/integrate_studio.py`; smoke test `deploy/test_studio.cjs`. The GitHub Pages workflow overlays the Studio files on top of the versioned website ZIP before deploying, so the user does not need to upload another ZIP.

The project is independent and AI-assisted; do not describe unsubmitted research prompts as completed author publications.


## Search visibility / indexing (owner action)

The GitHub Actions build now publishes:
- `https://nikkn997.github.io/Diplomatic.Atlas/sitemap.xml`
- `https://nikkn997.github.io/Diplomatic.Atlas/research-studio.html` — a crawlable, independent Research Studio page
- canonical URL, Open Graph and structured WebSite metadata on the home page
- versioned app/CSS assets to reduce stale Service Worker navigation

**Owner setup still required:** Create a **URL-prefix** property for `https://nikkn997.github.io/Diplomatic.Atlas/` in Google Search Console (https://search.google.com/search-console/welcome) and verify ownership using an HTML meta tag or verification file. Put the exact token/file into the site build, then submit `sitemap.xml` and request indexing. Repeat the corresponding verification and sitemap submission in Yandex Webmaster (https://webmaster.yandex.ru/). The code alone cannot register your account or guarantee ranking.

**Technical note:** The `#studio` SPA fragment cannot be reliably indexed as its own search URL. `research-studio.html` is the dedicated crawlable page. `/Diplomatic.Atlas/robots.txt` is a portable companion file but is **not** the origin-root `https://nikkn997.github.io/robots.txt`; project-level robots directives do not control crawling of the whole GitHub Pages host.

If the website still shows eight modules or "v1.11", reload `https://nikkn997.github.io/Diplomatic.Atlas/?v=112#studio` using a fresh tab or private window to bypass old cached JS. Do not delete user-local Research Studio drafts or Portfolio Log entries without exporting them first.
