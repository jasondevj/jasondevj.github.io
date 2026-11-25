import { type CollectionEntry, getCollection } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

export async function getProjects(): Promise<Project[]> {
	const projects = await getCollection('projects');
	return projects.sort(
		(a, b) =>
			Number(b.data.featured) - Number(a.data.featured) ||
			b.data.lastActive - a.data.lastActive ||
			b.data.stars - a.data.stars,
	);
}

export function activeYears({ data }: Project): string {
	return data.started === data.lastActive ? `${data.started}` : `${data.started} to ${data.lastActive}`;
}

export function cloneCommand({ data }: Project): string {
	return `git clone ${data.repo}.git`;
}
