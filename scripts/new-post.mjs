#!/usr/bin/env node
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
	console.error('Usage: npm run new -- "Title of the post"');
	process.exit(1);
}

const slug = title
	.toLowerCase()
	.normalize('NFKD')
	.replace(/[^\w\s-]/g, '')
	.trim()
	.replace(/[\s_]+/g, '-')
	.replace(/-+/g, '-');
const path = join('src/content/blog', `${slug}.md`);

if (existsSync(path)) {
	console.error(`${path} already exists.`);
	process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
	path,
	`---
title: ${JSON.stringify(title)}
description: ""
pubDate: ${today}
tags: []
draft: true
---

Start writing here.
`,
);

console.log(`Created ${path}\nPreview it with "npm run dev", then set draft: false and push to publish.`);
