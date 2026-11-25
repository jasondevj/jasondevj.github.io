import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string().max(110),
			description: z.string().max(200),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			tags: z.array(z.string()).default([]),
			lines: z.array(z.enum(['ae', 'sa', 'hs', 'nt'])).optional(),
			draft: z.boolean().default(false),
			featured: z.boolean().default(false),
			heroImage: image().optional(),
			heroAlt: z.string().optional(),
			originalUrl: z.url().optional(),
			originalSource: z.string().optional(),
			syndicate: z.boolean().default(true),
			linkedinText: z.string().max(2800).optional(),
		}),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
	schema: z.object({
		name: z.string(),
		summary: z.string().max(200),
		repo: z.url(),
		language: z.string(),
		started: z.number().int(),
		lastActive: z.number().int(),
		stars: z.number().int().default(0),
		license: z.string().optional(),
		role: z.enum(['author', 'contributor']).default('author'),
		featured: z.boolean().default(false),
		highlights: z
			.array(z.object({ title: z.string(), text: z.string() }))
			.max(3)
			.default([]),
	}),
});

export const collections = { blog, projects };
