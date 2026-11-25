import type { APIRoute } from 'astro';
import { SITE } from '../site.config';

export const GET: APIRoute = () =>
	Response.json({
		name: SITE.title,
		short_name: SITE.name,
		description: SITE.description,
		start_url: '/',
		display: 'standalone',
		background_color: SITE.themeColor,
		theme_color: SITE.themeColor,
		icons: [
			{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
			{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
		],
	});
