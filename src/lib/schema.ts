import { SITE, sameAsProfiles } from '../site.config';
import type { Post } from './posts';
import type { Project } from './projects';

const absolute = (path: string) => new URL(path, SITE.url).toString();

export const PERSON_ID = absolute('/#person');
const WEBSITE_ID = absolute('/#website');

export function personSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': PERSON_ID,
		name: SITE.name,
		url: SITE.url,
		image: absolute('/og/site.png'),
		jobTitle: SITE.role,
		address: { '@type': 'PostalAddress', addressLocality: SITE.location },
		knowsAbout: ['Software engineering', 'Software architecture', 'Low-level programming', 'AI engineering', 'AI agents', 'System design', 'Java', 'Distributed systems'],
		sameAs: sameAsProfiles,
	};
}

export function websiteSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		url: SITE.url,
		name: SITE.name,
		description: SITE.description,
		inLanguage: SITE.lang,
		publisher: { '@id': PERSON_ID },
	};
}

export function profilePageSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		url: absolute('/about/'),
		name: `About ${SITE.name}`,
		mainEntity: personSchema(),
	};
}

export function blogPostingSchema(post: Post, imagePath: string) {
	const url = absolute(`/blog/${post.id}/`);
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		'@id': `${url}#article`,
		mainEntityOfPage: { '@type': 'WebPage', '@id': url },
		url,
		headline: post.data.title,
		description: post.data.description,
		image: [absolute(imagePath)],
		datePublished: post.data.pubDate.toISOString(),
		dateModified: (post.data.updatedDate ?? post.data.pubDate).toISOString(),
		keywords: post.data.tags.join(', '),
		inLanguage: SITE.lang,
		wordCount: (post.body ?? '').split(/\s+/).filter(Boolean).length,
		author: { '@type': 'Person', '@id': PERSON_ID, name: SITE.name, url: SITE.url },
		publisher: { '@type': 'Person', '@id': PERSON_ID, name: SITE.name },
		isPartOf: { '@id': WEBSITE_ID },
		...(post.data.originalUrl ? { sameAs: post.data.originalUrl } : {}),
	};
}

export function videoObjectSchema(video: {
	name: string;
	description: string;
	youtubeId: string;
	uploaded: string;
	seconds: number;
	thumbnailPath: string;
}) {
	const { name, description, youtubeId, uploaded, seconds, thumbnailPath } = video;
	return {
		'@context': 'https://schema.org',
		'@type': 'VideoObject',
		name,
		description,
		thumbnailUrl: [absolute(thumbnailPath)],
		uploadDate: uploaded,
		duration: `PT${Math.floor(seconds / 60)}M${seconds % 60}S`,
		embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
		url: `https://www.youtube.com/watch?v=${youtubeId}`,
	};
}

export function softwareSourceCodeSchema(project: Project) {
	const { name, summary, repo, language, license, started, role } = project.data;
	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareSourceCode',
		name,
		description: summary,
		url: absolute(`/projects/${project.id}/`),
		codeRepository: repo,
		programmingLanguage: language,
		dateCreated: `${started}`,
		...(license ? { license: `https://spdx.org/licenses/${license}.html` } : {}),
		[role === 'author' ? 'author' : 'contributor']: { '@id': PERSON_ID, name: SITE.name },
	};
}

export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: crumbs.map((crumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.name,
			item: absolute(crumb.path),
		})),
	};
}
