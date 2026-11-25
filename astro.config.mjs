// @ts-check
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { parse as parseYaml } from 'yaml';

const SITE_URL = 'https://jasondevj.com';
const BLOG_DIR = './src/content/blog';

/** @param {unknown} tag */
const tagSlug = (tag) =>
	String(tag)
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/[\s_]+/g, '-');

function readPostIndex() {
	const lastModified = new Map();
	const withoutText = new Set();
	const tagCounts = new Map();
	for (const file of readdirSync(BLOG_DIR)) {
		if (!/\.mdx?$/.test(file)) continue;
		const source = readFileSync(`${BLOG_DIR}/${file}`, 'utf8');
		const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
		if (!frontmatter) continue;
		const data = parseYaml(frontmatter[1]) ?? {};
		const url = `${SITE_URL}/blog/${data.slug ?? file.replace(/\.mdx?$/, '')}/`;
		const date = data.updatedDate ?? data.pubDate;
		if (date) lastModified.set(url, new Date(date).toISOString());
		if (source.slice(frontmatter[0].length).trim().length === 0) withoutText.add(url);
		if (data.draft !== true) {
			for (const tag of data.tags ?? []) {
				const tagUrl = `${SITE_URL}/tags/${tagSlug(tag)}/`;
				tagCounts.set(tagUrl, (tagCounts.get(tagUrl) ?? 0) + 1);
			}
		}
	}
	const thinTags = new Set([...tagCounts].filter(([, count]) => count < 2).map(([tagUrl]) => tagUrl));
	return { lastModified, excluded: new Set([...withoutText, ...thinTags]) };
}

const { lastModified: lastModifiedByUrl, excluded: noindexUrls } = readPostIndex();

// Astro's dev server routes folder URLs through its page router, so static folders in public/ (like the Slidev decks
// under /talks/) would 404 locally even though GitHub Pages serves their index.html.
/** @returns {import('vite').Plugin} */
function servePublicFolderIndex() {
	return {
		name: 'serve-public-folder-index',
		enforce: 'pre',
		configureServer(server) {
			server.middlewares.use((req, _res, next) => {
				const [path, query = ''] = (req.url ?? '').split('?');
				if (path.endsWith('/') && existsSync(`./public${path}index.html`)) {
					req.url = `${path}index.html${query ? `?${query}` : ''}`;
				}
				next();
			});
		},
	};
}

export default defineConfig({
	site: SITE_URL,
	trailingSlash: 'always',
	devToolbar: { enabled: false },
	vite: { plugins: [servePublicFolderIndex()] },
	prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => !page.includes('/404') && !noindexUrls.has(page),
			serialize(item) {
				const lastmod = lastModifiedByUrl.get(item.url);
				return lastmod ? { ...item, lastmod } : item;
			},
		}),
	],
	markdown: {
		shikiConfig: {
			theme: 'github-light',
			wrap: false,
		},
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Bricolage Grotesque',
			cssVariable: '--font-display',
			fallbacks: ['system-ui', 'sans-serif'],
			options: {
				variants: [
					{
						src: ['@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2'],
						weight: '200 800',
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'Figtree',
			cssVariable: '--font-sans',
			fallbacks: ['system-ui', 'sans-serif'],
			options: {
				variants: [
					{ src: ['@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2'], weight: '300 900', style: 'normal', display: 'swap' },
					{ src: ['@fontsource-variable/figtree/files/figtree-latin-wght-italic.woff2'], weight: '300 900', style: 'italic', display: 'swap' },
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			fallbacks: ['ui-monospace', 'monospace'],
			options: {
				variants: [
					{
						src: ['@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
