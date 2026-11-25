import type { APIRoute } from 'astro';
import { getPosts, postUrl } from '../lib/posts';
import { getProjects } from '../lib/projects';
import { SITE, sameAsProfiles } from '../site.config';

export const GET: APIRoute = async ({ site }) => {
	const posts = (await getPosts()).filter((post) => !post.data.draft);
	const projects = await getProjects();
	const absolute = (path: string) => new URL(path, site).toString();
	const lines = [
		`# ${SITE.name}`,
		'',
		`> ${SITE.description}`,
		'',
		`${SITE.name} is a ${SITE.role.toLowerCase()} in ${SITE.location}, with more than 15 years across ${SITE.sectors.join(', ').toLowerCase()}.`,
		'',
		'## Pages',
		'',
		`- [About](${absolute('/about/')}): background, speaking and contact`,
		`- [Writing](${absolute('/blog/')}): all essays and notes`,
		`- [Projects](${absolute('/projects/')}): open-source work`,
		'',
		'## Writing',
		'',
		...posts.map((post) => `- [${post.data.title}](${absolute(postUrl(post))}): ${post.data.description}`),
		'',
		'## Projects',
		'',
		...projects.map(({ id, data }) => `- [${data.name}](${absolute(`/projects/${id}/`)}): ${data.summary}`),
		'',
		'## Elsewhere',
		'',
		...sameAsProfiles.map((url) => `- ${url}`),
		'',
	];
	return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
