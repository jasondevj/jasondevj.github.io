#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { parse as parseYaml } from 'yaml';

const BLOG_DIR = 'src/content/blog';
const SITE_URL = (process.env.SITE_URL ?? 'https://jasondevj.com').replace(/\/$/, '');
const DIST_DIR = process.env.DIST_DIR ?? 'dist';
const MAX_POSTS = Number(process.env.SYNDICATE_MAX_POSTS ?? 3);
const LINKEDIN_API_VERSION = process.env.LINKEDIN_API_VERSION || '202610';
const MEDIUM_PUBLISH_STATUS = process.env.MEDIUM_PUBLISH_STATUS || 'draft';

const { values: args } = parseArgs({
	options: {
		since: { type: 'string' },
		slug: { type: 'string', multiple: true, default: [] },
		'dry-run': { type: 'boolean', default: false },
		only: { type: 'string' },
	},
});
const dryRun = args['dry-run'] || process.env.SYNDICATE_DRY_RUN === 'true';
const targets = new Set((args.only ?? 'linkedin,medium').split(',').map((target) => target.trim()));

function parseFrontmatter(source) {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	return match ? (parseYaml(match[1]) ?? {}) : null;
}

function slugFor(file, data) {
	return data.slug ?? file.replace(/\.mdx?$/, '');
}

function isPublishable(data) {
	return data && data.draft !== true && data.syndicate !== false && !data.originalUrl;
}

function readPost(file) {
	const data = parseFrontmatter(readFileSync(join(BLOG_DIR, file), 'utf8'));
	return data ? { file, slug: slugFor(file, data), data } : null;
}

function git(...gitArgs) {
	return execFileSync('git', gitArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function newlyPublishedSince(sinceSha) {
	if (!sinceSha || /^0+$/.test(sinceSha)) {
		console.log('No previous commit to compare against; nothing is treated as new.');
		return [];
	}
	try {
		git('cat-file', '-e', `${sinceSha}^{commit}`);
	} catch {
		console.log(`Commit ${sinceSha} is not available; nothing is treated as new.`);
		return [];
	}

	const changedFiles = git('diff', '--name-only', '--diff-filter=AMR', sinceSha, 'HEAD', '--', BLOG_DIR)
		.split('\n')
		.filter((path) => /\.mdx?$/.test(path));

	return changedFiles
		.map((path) => {
			const post = readPost(path.slice(BLOG_DIR.length + 1));
			if (!post || !isPublishable(post.data)) return null;
			let previous = null;
			try {
				previous = parseFrontmatter(git('show', `${sinceSha}:${path}`));
			} catch {}
			const wasPublished = previous && previous.draft !== true;
			return wasPublished ? null : post;
		})
		.filter(Boolean);
}

function postsBySlug(slugs) {
	const all = readdirSync(BLOG_DIR)
		.filter((file) => /\.mdx?$/.test(file))
		.map(readPost)
		.filter(Boolean);
	return slugs.map((slug) => {
		const post = all.find((candidate) => candidate.slug === slug);
		if (!post) throw new Error(`No post with slug "${slug}" in ${BLOG_DIR}`);
		if (!isPublishable(post.data)) throw new Error(`Post "${slug}" is a draft, was first published elsewhere, or has syndicate: false`);
		return post;
	});
}

const LITTLE_TEXT_RESERVED = /[\\|{}@[\]()<>#*_~]/g;

function toLinkedInCommentary(text) {
	return text
		.split(/(#[\p{L}\p{N}_]+)/u)
		.map((part) =>
			part.startsWith('#') && part.length > 1
				? `{hashtag|\\#|${part.slice(1)}}`
				: part.replace(LITTLE_TEXT_RESERVED, (char) => `\\${char}`),
		)
		.join('');
}

function hashtag(tag) {
	const words = String(tag).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
	return `#${words.map((word) => (word.length <= 3 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1))).join('')}`;
}

function defaultLinkedInText(post) {
	const tags = (post.data.tags ?? []).slice(0, 5).map(hashtag).join(' ');
	return [post.data.title, post.data.description, 'New on my blog, full post at the link below.', tags]
		.filter(Boolean)
		.join('\n\n');
}

async function linkedinRequest(path, body) {
	const response = await fetch(`https://api.linkedin.com/rest/${path}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
			'LinkedIn-Version': LINKEDIN_API_VERSION,
			'X-Restli-Protocol-Version': '2.0.0',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	if (!response.ok) throw new Error(`LinkedIn ${path} failed: ${response.status} ${await response.text()}`);
	return response;
}

async function uploadLinkedInThumbnail(post, author) {
	const imagePath = join(DIST_DIR, 'og', `${post.slug}.png`);
	if (!existsSync(imagePath)) return undefined;
	const init = await linkedinRequest('images?action=initializeUpload', { initializeUploadRequest: { owner: author } });
	const { value } = await init.json();
	const upload = await fetch(value.uploadUrl, {
		method: 'PUT',
		headers: { Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}` },
		body: readFileSync(imagePath),
	});
	if (!upload.ok) throw new Error(`LinkedIn image upload failed: ${upload.status}`);
	return value.image;
}

async function shareOnLinkedIn(post, url) {
	const author = process.env.LINKEDIN_AUTHOR_URN;
	const commentary = toLinkedInCommentary(post.data.linkedinText ?? defaultLinkedInText(post));
	if (dryRun) {
		console.log(`[dry-run] LinkedIn post as ${author ?? '<author>'}:\n${commentary}\n`);
		return { status: 'dry-run' };
	}

	let thumbnail;
	try {
		thumbnail = await uploadLinkedInThumbnail(post, author);
	} catch (error) {
		console.warn(`Thumbnail upload skipped: ${error.message}`);
	}

	const response = await linkedinRequest('posts', {
		author,
		commentary,
		visibility: 'PUBLIC',
		distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
		content: {
			article: {
				source: url,
				title: post.data.title,
				description: post.data.description,
				...(thumbnail ? { thumbnail } : {}),
			},
		},
		lifecycleState: 'PUBLISHED',
		isReshareDisabledByAuthor: false,
	});
	const postUrn = response.headers.get('x-restli-id');
	return { status: 'posted', link: postUrn ? `https://www.linkedin.com/feed/update/${postUrn}/` : undefined };
}

function extractArticleHtml(slug) {
	const pagePath = join(DIST_DIR, 'blog', slug, 'index.html');
	if (!existsSync(pagePath)) throw new Error(`Built page not found at ${pagePath}. Run the build first.`);
	const html = readFileSync(pagePath, 'utf8');
	const match = html.match(/<div id="post-body"[^>]*>([\s\S]*?)<\/div>\s*<div id="post-body-end"/);
	if (!match) throw new Error(`Could not find the post body in ${pagePath}`);
	return match[1]
		.replace(/<\/?span\b[^>]*>/g, '')
		.replace(/<([a-z][a-z0-9]*)\b([^>]*)>/gi, (_, tag, attributes) => {
			const kept = [...attributes.matchAll(/\s(href|src|alt|title)="([^"]*)"/g)].map(([, name, value]) => {
				const absolute = (name === 'href' || name === 'src') && /^\/(?!\/)/.test(value) ? `${SITE_URL}${value}` : value;
				return ` ${name}="${absolute}"`;
			});
			return `<${tag}${kept.join('')}>`;
		});
}

function escapeHtml(text) {
	return String(text).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
}

async function mediumRequest(path, init = {}) {
	const response = await fetch(`https://api.medium.com/v1/${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${process.env.MEDIUM_TOKEN}`,
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...init.headers,
		},
	});
	if (!response.ok) throw new Error(`Medium ${path} failed: ${response.status} ${await response.text()}`);
	return (await response.json()).data;
}

async function publishToMedium(post, url) {
	const content = [
		`<h1>${escapeHtml(post.data.title)}</h1>`,
		`<p><em>${escapeHtml(post.data.description)}</em></p>`,
		extractArticleHtml(post.slug),
		`<hr><p><em>Originally published at <a href="${url}">${new URL(SITE_URL).host}</a>.</em></p>`,
	].join('\n');

	if (dryRun) {
		console.log(`[dry-run] Medium ${MEDIUM_PUBLISH_STATUS} post, canonical ${url}:\n${content.slice(0, 1200)}\n`);
		return { status: 'dry-run' };
	}

	const me = await mediumRequest('me');
	const created = await mediumRequest(`users/${me.id}/posts`, {
		method: 'POST',
		body: JSON.stringify({
			title: post.data.title,
			contentFormat: 'html',
			content,
			canonicalUrl: url,
			tags: (post.data.tags ?? []).slice(0, 5),
			publishStatus: MEDIUM_PUBLISH_STATUS,
			notifyFollowers: MEDIUM_PUBLISH_STATUS === 'public',
		}),
	});
	return { status: MEDIUM_PUBLISH_STATUS, link: created.url };
}

async function waitUntilLive(url, attempts = 24) {
	for (let attempt = 1; attempt <= attempts; attempt++) {
		const response = await fetch(url, { method: 'HEAD' }).catch(() => null);
		if (response?.ok) return;
		await new Promise((resolve) => setTimeout(resolve, 5000));
	}
	throw new Error(`${url} is not reachable yet, so it was not shared`);
}

function summarize(lines) {
	const output = lines.join('\n');
	console.log(output);
	if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${output}\n`);
}

async function run(channel, enabled, missingSecretHint, action) {
	if (!targets.has(channel)) return { status: 'skipped' };
	if (!enabled && !dryRun) return { status: 'not configured', hint: missingSecretHint };
	try {
		return await action();
	} catch (error) {
		console.error(error);
		process.exitCode = 1;
		return { status: 'failed', hint: error.message.slice(0, 200) };
	}
}

const posts = args.slug.length > 0 ? postsBySlug(args.slug) : newlyPublishedSince(args.since ?? process.env.SYNDICATE_SINCE);

if (posts.length === 0) {
	summarize(['### Cross-posting', '', 'No newly published posts in this push.']);
	process.exit(0);
}

if (posts.length > MAX_POSTS && args.slug.length === 0) {
	summarize([
		'### Cross-posting skipped',
		'',
		`${posts.length} posts were published at once (limit ${MAX_POSTS}), so nothing was shared automatically.`,
		'Share them one at a time from **Actions → Deploy → Run workflow** with the post slug.',
	]);
	process.exit(0);
}

const report = ['### Cross-posting', '', '| Post | LinkedIn | Medium |', '| --- | --- | --- |'];

for (const post of posts) {
	const url = `${SITE_URL}/blog/${post.slug}/`;
	if (!dryRun) {
		try {
			await waitUntilLive(url);
		} catch (error) {
			console.error(error.message);
			process.exitCode = 1;
			report.push(`| [${post.data.title}](${url}) | not live | not live |`);
			continue;
		}
	}
	const linkedin = await run(
		'linkedin',
		process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_AUTHOR_URN,
		`[share manually](https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)})`,
		() => shareOnLinkedIn(post, url),
	);
	const medium = await run(
		'medium',
		process.env.MEDIUM_TOKEN,
		`[import manually](https://medium.com/p/import) with \`${url}\``,
		() => publishToMedium(post, url),
	);
	const cell = ({ status, link, hint }) => [link ? `[${status}](${link})` : status, hint].filter(Boolean).join(': ');
	report.push(`| [${post.data.title}](${url}) | ${cell(linkedin)} | ${cell(medium)} |`);
}

summarize(report);
