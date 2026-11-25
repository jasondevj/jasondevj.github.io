import type { APIRoute, GetStaticPaths } from 'astro';
import { LINES } from '../../data/lines';
import { type OgCard, renderOgImage } from '../../lib/og';
import { buildStops, getPosts, hasFullText, readingMinutes } from '../../lib/posts';

const dateLabel = (date: Date) =>
	date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const getStaticPaths = (async () => {
	const network = buildStops(await getPosts());
	const site: OgCard = {
		title: 'I write about technology and the things I build\u00a0with\u00a0it.',
		stations: LINES.filter(({ id }) => id !== 'nt').map(({ id, code, name }) => ({ lineId: id, code, name })),
		footer: 'jasondevj.com',
	};
	return [
		{ params: { slug: 'site' }, props: site },
		...network.map(({ post, stations }) => ({
			params: { slug: post.id },
			props: {
				title: post.data.title,
				stations: stations.map(({ line, code }) => ({ lineId: line.id, code, name: line.name })),
				footer: hasFullText(post)
					? `${dateLabel(post.data.pubDate)}, ${readingMinutes(post)} min read`
					: `${dateLabel(post.data.pubDate)}, first published on ${post.data.originalSource ?? 'another site'}`,
			} satisfies OgCard,
		})),
	];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
	const png = await renderOgImage(props as OgCard);
	return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
