# Diplomatic Atlas

Independent international-relations research website with interactive country atlas, sourced diplomatic events, UN voting records, country comparisons, a negotiation simulator and a multilingual world briefing.

## Publish v1.8 (one file)

1. Download the **site-package.zip** supplied in ChatGPT (v1.8).
2. In this repo: **Add file → Upload files**, drag **site-package.zip** into the root, choose the `main` branch and commit.
3. Open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Open **Actions → Publish Diplomatic Atlas**, use **Run workflow** if needed.
5. After successful deployment, the site should be at: https://nikkn997.github.io/Diplomatic.Atlas/

Do not upload a nested project folder or rename the ZIP; the workflow checks for `site-package.zip` exactly.

## Automated updates and language support

The scheduled workflow (about every six hours, subject to GitHub scheduling and upstream availability) fetches publisher RSS updates, confirmed geographic event pins and World Bank indicators. Images are displayed only when supplied by publishers and available for use; not every story provides an image.

The news section has a curated translated archive in all six UN languages. For newer English-language news, the workflow attempts **free offline Argos Translate models** for Russian, French, Spanish, Arabic and Chinese. When translation is unavailable, an explicit English-original label appears. Translations are unofficial and original source links are preserved.

Capitals use CLDR-based exonyms and curated conventional translations. This is not a live political-position dataset.

The project has no affiliation with the United Nations.
