# jasondevj.com

Personal site and blog of Jason Jebanesan. Built with [Astro](https://astro.build), deployed to GitHub Pages by GitHub Actions, and cross-posted to LinkedIn and Medium automatically.

```sh
npm install
npm run dev        # http://localhost:4321 (drafts are visible here)
npm run build      # production build into dist/
npm run check      # type-check
```

## Writing a post

```sh
npm run new -- "Why simple agents win"
```

That creates `src/content/blog/why-simple-agents-win.md` as a draft. Write in Markdown (or `.mdx`), preview with `npm run dev`, then set `draft: false` and push to `main`. The post goes live and is shared to LinkedIn and Medium.

| Frontmatter | Required | Notes |
| --- | --- | --- |
| `title` | yes | Up to 110 characters. Used for the page title, the social card and the LinkedIn post. |
| `description` | yes | One or two sentences, up to 200 characters. This is the Google snippet. |
| `pubDate` | yes | `2026-12-01` |
| `updatedDate` | | Shown on the post, and used for `dateModified` and sitemap `lastmod`. |
| `tags` | | `[ai, agents]`. Each tag gets a page under `/tags/` and becomes a LinkedIn hashtag. |
| `lines` | | `[ae, sa]`. Pins the post to specific lines. Usually you can leave this out: lines are picked from the tags (see `src/data/lines.ts`), and posts that match no line go on the Notes line. |
| `draft` | | `true` keeps it out of production. It is still visible in `npm run dev`. |
| `heroImage` / `heroAlt` | | A path relative to the post, e.g. `./cover.jpg`. It is optimised automatically. |
| `linkedinText` | | Custom text for the LinkedIn post. `#hashtags` work. Defaults to title + description + tags. |
| `syndicate` | | `false` stops automatic cross-posting for this post. |
| `originalUrl` / `originalSource` | | Where the piece was first published, e.g. a LinkedIn article. The post shows a "First published on LinkedIn" link. If the post has no body yet, its page shows a "Read it on LinkedIn" panel and is hidden from search engines until you add the text. |

Each post gets its own social card image at `/og/<slug>.png`, plus JSON-LD (`BlogPosting`, `BreadcrumbList`), Open Graph and Twitter tags, a canonical URL, and entries in the sitemap, RSS and `llms.txt`.

### Bringing the LinkedIn articles home

The three LinkedIn articles have pages on this site, but their bodies are empty because LinkedIn doesn't allow the text to be fetched automatically. To finish one, paste the article text (as Markdown) under its frontmatter in `src/content/blog/`. The page then switches to the full article, starts appearing in search results, and keeps a "First published on LinkedIn" link. Keep `syndicate: false` so it isn't posted to LinkedIn a second time.

The easiest way to get the text is LinkedIn's data export: **Settings → Data privacy → Get a copy of your data → Articles**. It sends each article as an HTML file.

## How the writing map works

Each topic is a coloured line, defined in `src/data/lines.ts`: AE (AI engineering), SA (Systems), HS (People) and NT (Notes). A post becomes a station on every line whose tags it shares. Stations are numbered in order along each line, so AE3 is the third post on the AI engineering line. Posts on more than one line are drawn as interchanges. A line's rail starts at the first post on that topic. To add a line, add an entry to `src/data/lines.ts`, add its colour as `--line-<id>` plus a `.line-<id>` class (tint and text colour) in `src/styles/global.css`, and add it to the colour maps in `src/lib/og.ts`.

## Talk slides

Slides live as static Slidev builds under `public/talks/<name>/`, so they can be linked and embedded in posts (see `src/components/post/SlidesEmbed.astro`). To update the "Stop Tuning Your RAG" deck after editing it in its Slidev project, build a copy with hash routing and the site path as its base, then replace the folder:

```sh
# in a copy of the Slidev project, add `routerMode: hash` to the slides.md headmatter first
npx slidev build --base /talks/stop-tuning-your-rag/ --out dist
rm -rf public/talks/stop-tuning-your-rag && cp -R dist public/talks/stop-tuning-your-rag
rm -f public/talks/stop-tuning-your-rag/_redirects public/talks/stop-tuning-your-rag/404.html
```

Link to the folder URL (for example `/talks/stop-tuning-your-rag/`). GitHub Pages serves its `index.html`, and a small rule in `astro.config.mjs` does the same in `npm run dev`.

## Editing the profile

- `src/site.config.ts`: name, role, sectors, description, social links (add the Medium URL here), Google verification code
- `src/pages/about.astro`: bio, timeline, talks, principles
- `src/content/projects/*.md`: one file per project. The frontmatter holds the facts (repo, language, years, stars, licence, author or contributor, featured), and the body becomes the project page. `featured: true` puts it on the home page.
- `src/styles/global.css`: design tokens (colours, line colours, type scale)

## One-time setup

### GitHub Pages

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.** Do this before the first push, or the old branch-based build will publish the raw source.
2. The custom domain `jasondevj.com` and **Enforce HTTPS** are already configured, and DNS already points at GitHub. `public/CNAME` keeps the domain set.

### Search engines

1. [Google Search Console](https://search.google.com/search-console): add `jasondevj.com` as a Domain property (DNS TXT), or as a URL-prefix property using the meta tag. For the meta tag, put the code in `googleSiteVerification` in `src/site.config.ts`.
2. Submit `https://jasondevj.com/sitemap-index.xml`.
3. Optionally, do the same in [Bing Webmaster Tools](https://www.bing.com/webmasters), which can import from Search Console.

### Cross-posting

The `syndicate` job in `.github/workflows/deploy.yml` runs after every deploy. It finds posts that are new in that push, or that changed from `draft: true` to published, and then:

- **LinkedIn:** creates a post on your profile with a link card (title, description, social image) that points back to the site.
- **Medium:** creates a story with the full content and `canonicalUrl` set to this site, so Google treats the site as the original. It is created as a **draft** by default, so you can review it and press publish.

If a channel isn't configured, the run summary gives a one-click manual link instead (LinkedIn share, Medium import). To avoid a flood of posts after a migration, nothing is shared automatically when more than 3 posts go live in one push. To share a specific post later, use **Actions → Deploy → Run workflow** with its slug.

#### LinkedIn

1. Create an app at [developer.linkedin.com](https://developer.linkedin.com/). LinkedIn requires the app to be linked to a LinkedIn Page, so create a small page for your site if you don't have one.
2. Under **Products**, add **Share on LinkedIn** and **Sign In with LinkedIn using OpenID Connect**.
3. Under **Auth**, add `http://localhost:8787/callback` as an authorized redirect URL.
4. Run the helper. It opens LinkedIn, then saves the token and your member URN as repository secrets using the `gh` CLI:

   ```sh
   LINKEDIN_CLIENT_ID=... LINKEDIN_CLIENT_SECRET=... npm run linkedin:auth -- --save
   ```

LinkedIn access tokens last **60 days**, and standard apps don't get refresh tokens. Run the helper again before the token expires. It prints the expiry date.

#### Medium

Medium no longer issues new API integration tokens. If you already have one (Medium settings → Security and apps → Integration tokens), save it:

```sh
gh secret set MEDIUM_TOKEN
```

Without a token, use [Medium's import tool](https://medium.com/p/import) with the post URL. It copies the post and sets the canonical link for you. The run summary links to it.

#### Optional settings (Settings → Secrets and variables → Actions → Variables)

| Variable | Default | Purpose |
| --- | --- | --- |
| `MEDIUM_PUBLISH_STATUS` | `draft` | Set to `public` to publish to Medium straight away. |
| `SYNDICATE_DRY_RUN` | unset | Set to `true` to log what would be posted without posting. |
| `LINKEDIN_API_VERSION` | `202610` | LinkedIn's monthly API version (`YYYYMM`). Each version is retired after about a year, so bump this if LinkedIn starts rejecting the version. |

To approve each cross-post by hand, add a required reviewer to the `syndication` environment (Settings → Environments).

Test locally without posting anything:

```sh
npm run build && npm run syndicate -- --slug <post-slug> --dry-run
```
