export const SITE = {
	url: 'https://jasondevj.com',
	name: 'Jason Jebanesan',
	shortName: 'Jason',
	title: 'Jason Jebanesan — Technology Architect & Writer',
	description:
		'Jason Jebanesan is a technology architect in Singapore, writing about technology and engineering, from low-level programming to large systems and AI.',
	role: 'Technology Architect',
	sectors: ['Telco', 'Banking', 'Healthcare'],
	location: 'Singapore',
	locale: 'en_SG',
	lang: 'en',
	googleSiteVerification: '',
	themeColor: '#ffffff',
	keywords: [
		'Jason Jebanesan',
		'software engineering',
		'software architecture',
		'low-level programming',
		'AI engineering',
		'AI agents',
		'system design',
		'Java',
		'developer experience',
		'Singapore',
	],
} as const;

export const SOCIAL = {
	linkedin: 'https://www.linkedin.com/in/jason-jebanesan/',
	github: 'https://github.com/jasondevj',
	medium: '',
	x: '',
} as const;

export const NAV = [
	{ href: '/blog/', label: 'Writing' },
	{ href: '/projects/', label: 'Projects' },
	{ href: '/about/', label: 'About' },
] as const;

export const sameAsProfiles = Object.values(SOCIAL).filter((url) => url.length > 0);
