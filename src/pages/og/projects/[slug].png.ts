import type { APIRoute, GetStaticPaths } from 'astro';
import { type OgCard, renderOgImage } from '../../../lib/og';
import { activeYears, getProjects } from '../../../lib/projects';

export const getStaticPaths = (async () => {
	const projects = await getProjects();
	return projects.map((project) => ({
		params: { slug: project.id },
		props: {
			title: project.data.name,
			stations: [{ lineId: 'sa', code: project.data.language, name: 'Open source' }],
			footer: `${project.data.role === 'author' ? 'Author' : 'Contributor'}, ${activeYears(project)}`,
		} satisfies OgCard,
	}));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
	const png = await renderOgImage(props as OgCard);
	return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
