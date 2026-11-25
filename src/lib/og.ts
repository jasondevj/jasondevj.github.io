import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { SITE } from '../site.config';

type Child = Node | string;
interface Node {
	type: string;
	props: { style?: Record<string, unknown>; children?: Child | Child[] };
}

const h = (style: Record<string, unknown>, children?: Child | Child[]): Node => ({
	type: 'div',
	props: { style: { display: 'flex', boxSizing: 'border-box', ...style }, children },
});

const font = (path: string) => readFileSync(resolve('node_modules', path));

let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
const loadFonts = () =>
	(fonts ??= [
		{ name: 'Display', data: font('@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff'), weight: 800, style: 'normal' },
		{ name: 'Sans', data: font('@fontsource/figtree/files/figtree-latin-500-normal.woff'), weight: 500, style: 'normal' },
		{ name: 'Sans', data: font('@fontsource/figtree/files/figtree-latin-600-normal.woff'), weight: 600, style: 'normal' },
	]);

export const LINE_COLORS: Record<string, string> = { ae: '#00b371', sa: '#2f6bff', hs: '#ff5470', nt: '#ffb21e' };
const LINE_TINTS: Record<string, string> = { ae: '#e3f8ef', sa: '#e7eeff', hs: '#ffe8ec', nt: '#fff3d9' };
const LINE_INKS: Record<string, string> = { ae: '#00704a', sa: '#1f4fd1', hs: '#c81e45', nt: '#8f5c00' };
const INK = '#171a26';
const QUIET = '#6b7285';
const RAIL_ORDER = ['ae', 'sa', 'hs'];

export type OgStation = { lineId: string; code: string; name: string };
export type OgCard = { title: string; stations: OgStation[]; footer: string };

const titleSize = (title: string) => (title.length <= 40 ? 84 : title.length <= 70 ? 70 : 58);

function railsWithStop(lineIds: string[], height: number, stopY: number): Node {
	const pitch = 38;
	const rail = 16;
	const columns = lineIds.map((id) => RAIL_ORDER.indexOf(id)).filter((index) => index >= 0);
	const from = Math.min(...columns);
	const to = Math.max(...columns);
	const stopSize = 40;

	const rails = RAIL_ORDER.map((id, index) =>
		h({ position: 'absolute', left: index * pitch + (pitch - rail) / 2, top: -20, width: rail, height: height + 40, borderRadius: rail / 2, background: LINE_COLORS[id] }),
	);
	const stop =
		columns.length === 0
			? []
			: [
					h({
						position: 'absolute',
						left: from * pitch + pitch / 2 - stopSize / 2,
						top: stopY - stopSize / 2,
						width: (to - from) * pitch + stopSize,
						height: stopSize,
						borderRadius: stopSize / 2,
						background: '#ffffff',
						border: `7px solid ${columns.length > 1 ? INK : LINE_COLORS[RAIL_ORDER[from]]}`,
					}),
				];
	return h({ position: 'relative', width: RAIL_ORDER.length * pitch, height }, [...rails, ...stop]);
}

export async function renderOgImage({ title, stations, footer }: OgCard): Promise<Buffer> {
	const tree = h({ width: '100%', height: '100%', background: '#ffffff', color: INK, fontFamily: 'Sans' }, [
		h({ paddingLeft: 64 }, railsWithStop(stations.map(({ lineId }) => lineId), 630, 300)),
		h({ flex: 1, flexDirection: 'column', justifyContent: 'space-between', padding: '64px 80px 60px 64px' }, [
			h(
				{ gap: 14, alignItems: 'center' },
				stations.map(({ lineId, code, name }) =>
					h({ alignItems: 'center', gap: 12, marginRight: 18 }, [
						h(
							{
								alignItems: 'center',
								justifyContent: 'center',
								height: 40,
								padding: '0 16px',
								borderRadius: 20,
								background: LINE_TINTS[lineId] ?? '#f7f8fb',
								color: LINE_INKS[lineId] ?? INK,
								fontSize: 24,
								fontWeight: 600,
							},
							code,
						),
						h({ fontSize: 26, fontWeight: 600, color: LINE_INKS[lineId] ?? INK }, name),
					]),
				),
			),
			h({ fontFamily: 'Display', fontSize: titleSize(title), fontWeight: 800, lineHeight: 1.02, letterSpacing: -2.5 }, title),
			h({ justifyContent: 'space-between', alignItems: 'center', fontSize: 26, color: QUIET }, [
				h({ color: INK, fontWeight: 600 }, SITE.name),
				h({}, footer),
			]),
		]),
	]);

	const svg = await satori(tree as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: loadFonts() });
	return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}

export async function renderMarkPng(size: number): Promise<Buffer> {
	const unit = size / 24;
	const rail = (x: number, color: string) =>
		h({ position: 'absolute', left: x * unit, top: 1 * unit, width: 4 * unit, height: 22 * unit, borderRadius: 2 * unit, background: color });
	const tree = h({ position: 'relative', width: size, height: size, background: '#ffffff' }, [
		h({ position: 'absolute', left: 0, top: 0, width: size, height: size, transform: 'scale(0.8)' }, [
			rail(4, LINE_COLORS.ae),
			rail(10, LINE_COLORS.sa),
			rail(16, LINE_COLORS.hs),
			h({
				position: 'absolute',
				left: 2.5 * unit,
				top: 8.25 * unit,
				width: 19 * unit,
				height: 7.5 * unit,
				borderRadius: 3.75 * unit,
				background: '#ffffff',
				border: `${2 * unit}px solid ${INK}`,
			}),
		]),
	]);
	const svg = await satori(tree as Parameters<typeof satori>[0], { width: size, height: size, fonts: loadFonts() });
	return sharp(Buffer.from(svg)).png().toBuffer();
}
