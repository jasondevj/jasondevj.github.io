import type { APIRoute } from 'astro';
import { renderMarkPng } from '../lib/og';

export const GET: APIRoute = async () =>
	new Response(new Uint8Array(await renderMarkPng(512)), { headers: { 'Content-Type': 'image/png' } });
