import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPosts, hasFullText, postUrl } from '../lib/posts';
import { SITE } from '../site.config';

export const GET: APIRoute = async ({ site }) => {
	const posts = (await getPosts()).filter((post) => !post.data.draft);
	const feedUrl = new URL('/rss.xml', site).toString();
	return rss({
		title: `${SITE.name} — Writing`,
		description: SITE.description,
		site: site!,
		xmlns: { atom: 'http://www.w3.org/2005/Atom' },
		customData: `<language>${SITE.lang}</language><atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>`,
		trailingSlash: true,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: postUrl(post),
			categories: post.data.tags,
			content: hasFullText(post) ? post.rendered?.html : undefined,
		})),
	});
};
