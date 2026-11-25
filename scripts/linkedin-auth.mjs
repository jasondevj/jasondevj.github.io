#!/usr/bin/env node
import { execFile, execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';

const PORT = Number(process.env.LINKEDIN_REDIRECT_PORT ?? 8787);
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES = ['openid', 'profile', 'w_member_social'];
const { LINKEDIN_CLIENT_ID: clientId, LINKEDIN_CLIENT_SECRET: clientSecret } = process.env;
const saveToGitHub = process.argv.includes('--save');

if (!clientId || !clientSecret) {
	console.error(
		[
			'Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET from your LinkedIn app (developer.linkedin.com → My apps → Auth).',
			`The app needs the "Share on LinkedIn" and "Sign In with LinkedIn using OpenID Connect" products, and ${REDIRECT_URI} as an authorized redirect URL.`,
			'',
			'  LINKEDIN_CLIENT_ID=... LINKEDIN_CLIENT_SECRET=... npm run linkedin:auth -- --save',
		].join('\n'),
	);
	process.exit(1);
}

const state = randomBytes(16).toString('hex');
const authorizeUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
authorizeUrl.search = new URLSearchParams({
	response_type: 'code',
	client_id: clientId,
	redirect_uri: REDIRECT_URI,
	state,
	scope: SCOPES.join(' '),
}).toString();

async function exchangeCode(code) {
	const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: REDIRECT_URI,
			client_id: clientId,
			client_secret: clientSecret,
		}),
	});
	if (!response.ok) throw new Error(`Token exchange failed: ${response.status} ${await response.text()}`);
	return response.json();
}

async function fetchMemberId(accessToken) {
	const response = await fetch('https://api.linkedin.com/v2/userinfo', {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!response.ok) throw new Error(`userinfo failed: ${response.status} ${await response.text()}`);
	const { sub, name } = await response.json();
	return { id: sub, name };
}

function setGitHubSecret(name, value) {
	execFileSync('gh', ['secret', 'set', name], { input: value, stdio: ['pipe', 'inherit', 'inherit'] });
}

const server = createServer(async (request, response) => {
	const url = new URL(request.url, REDIRECT_URI);
	if (url.pathname !== '/callback') {
		response.writeHead(404).end();
		return;
	}

	const finish = (status, message) => {
		response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(message);
		server.close();
	};

	if (url.searchParams.get('state') !== state) return finish(400, 'State mismatch. Start again.');
	if (url.searchParams.get('error')) return finish(400, `LinkedIn returned: ${url.searchParams.get('error_description')}`);

	try {
		const token = await exchangeCode(url.searchParams.get('code'));
		const member = await fetchMemberId(token.access_token);
		const authorUrn = `urn:li:person:${member.id}`;
		const expiresOn = new Date(Date.now() + token.expires_in * 1000).toISOString().slice(0, 10);

		if (saveToGitHub) {
			setGitHubSecret('LINKEDIN_ACCESS_TOKEN', token.access_token);
			setGitHubSecret('LINKEDIN_AUTHOR_URN', authorUrn);
			console.log(`\nSaved LINKEDIN_ACCESS_TOKEN and LINKEDIN_AUTHOR_URN as GitHub secrets for ${member.name}.`);
		} else {
			console.log(`\nAuthorized as ${member.name}.\n\nLINKEDIN_AUTHOR_URN=${authorUrn}\nLINKEDIN_ACCESS_TOKEN=${token.access_token}\n`);
			console.log('Re-run with --save to store both as GitHub repository secrets with the gh CLI.');
		}
		console.log(`The token expires on ${expiresOn}. LinkedIn does not issue refresh tokens to standard apps, so run this again before then.`);
		finish(200, 'Done. You can close this tab and return to the terminal.');
	} catch (error) {
		console.error(error);
		finish(500, 'Something went wrong. Check the terminal.');
	}
});

server.listen(PORT, () => {
	console.log(`Opening LinkedIn to authorize. If nothing opens, visit:\n\n${authorizeUrl}\n`);
	const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open';
	execFile(opener, [authorizeUrl.toString()], () => {});
});
