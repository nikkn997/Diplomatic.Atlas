# Search-engine ownership verification

This folder is reserved for owner-provided ownership proof files.

## Google Search Console

1. Add the **URL-prefix** property `https://nikkn997.github.io/Diplomatic.Atlas/`.
2. Select **HTML file** and download the unmodified `google....html` file shown by Google.
3. Upload it inside this folder (not to the repository root). Preserve its exact name and contents.
4. A successful `Publish Diplomatic Atlas` GitHub Actions deployment copies `google*.html` from here to the GitHub Pages web root `https://nikkn997.github.io/Diplomatic.Atlas/`.
5. Open the exact verification file URL in a browser and confirm the expected text appears; only then click **Verify** in Search Console.
6. After verification submit `sitemap.xml` and inspect the home URL.

For Yandex: a `yandex_*.html` file can be deployed the same way, **if the Webmaster account supports verification of this GitHub Pages project URL**. Yandex Webmaster may require a site with its own domain instead.

Do not remove these files after successful verification: ownership may be rechecked. Do not store passwords, API keys or other secrets in this public directory.
