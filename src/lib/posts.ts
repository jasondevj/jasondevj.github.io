import { type CollectionEntry, getCollection } from 'astro:content';
import { FALLBACK_LINE_ID, LINES, type Line } from '../data/lines';

export type Post = CollectionEntry<'blog'>;

const WORDS_PER_MINUTE = 230;

export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function postUrl(post: Post): string {
	return `/blog/${post.id}/`;
}

export function hasFullText(post: Post): boolean {
	return (post.body ?? '').trim().length > 0;
}

export function readingMinutes(post: Post): number {
	const words = (post.body ?? '').trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function tagSlug(tag: string): string {
	return tag
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/[\s_]+/g, '-');
}

export function collectTags(posts: Post[]): { name: string; slug: string; count: number }[] {
	const tagsBySlug = new Map<string, { name: string; slug: string; count: number }>();
	for (const post of posts) {
		for (const name of post.data.tags) {
			const slug = tagSlug(name);
			const existing = tagsBySlug.get(slug);
			if (existing) existing.count += 1;
			else tagsBySlug.set(slug, { name, slug, count: 1 });
		}
	}
	return [...tagsBySlug.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function groupByYear(posts: Post[]): [number, Post[]][] {
	const byYear = new Map<number, Post[]>();
	for (const post of posts) {
		const year = post.data.pubDate.getFullYear();
		byYear.set(year, [...(byYear.get(year) ?? []), post]);
	}
	return [...byYear.entries()].sort(([a], [b]) => b - a);
}

export interface Station {
	line: Line;
	number: number;
	code: string;
}

export interface Stop {
	post: Post;
	stations: Station[];
}

export function linesFor(post: Post): Line[] {
	const explicit = post.data.lines;
	if (explicit && explicit.length > 0) return LINES.filter((line) => (explicit as string[]).includes(line.id));
	const tags = new Set(post.data.tags.map(tagSlug));
	const matched = LINES.filter((line) => line.tags.some((tag) => tags.has(tag)));
	return matched.length > 0 ? matched : LINES.filter((line) => line.id === FALLBACK_LINE_ID);
}

export function buildStops(postsNewestFirst: Post[]): Stop[] {
	const counters = new Map<string, number>();
	const oldestFirst = [...postsNewestFirst].reverse().map((post) => ({
		post,
		stations: linesFor(post).map((line) => {
			const number = (counters.get(line.id) ?? 0) + 1;
			counters.set(line.id, number);
			return { line, number, code: `${line.code}${number}` };
		}),
	}));
	return oldestFirst.reverse();
}

export function activeLines(stops: Stop[]): Line[] {
	const used = new Set(stops.flatMap(({ stations }) => stations.map(({ line }) => line.id)));
	return LINES.filter((line) => used.has(line.id));
}

export function lineById(id: string): Line | undefined {
	return LINES.find((line) => line.id === id);
}
