export interface Line {
	id: string;
	code: string;
	name: string;
	summary: string;
	tags: string[];
}

export const LINES: Line[] = [
	{
		id: 'ae',
		code: 'AE',
		name: 'AI engineering',
		summary: 'Agent workflows, RAG, MCP, and the guardrails that make AI-assisted code safe to ship.',
		tags: ['ai', 'agents', 'vibe-coding', 'rag', 'mcp', 'llm', 'genai'],
	},
	{
		id: 'sa',
		code: 'SA',
		name: 'Systems',
		summary: 'JVM performance, architecture, and the trade-offs behind software that stays up.',
		tags: ['architecture', 'java', 'jvm', 'jdk', 'performance', 'distributed-systems', 'system-design', 'netty', 'debugging', 'spring', 'vaadin', 'clojure', 'jboss', 'jms', 'sso', 'email', 'telco', 'sms', 'hibernate', 'jpa', 'database', 'testing'],
	},
	{
		id: 'hs',
		code: 'HS',
		name: 'People',
		summary: 'Hiring, developer experience, and how engineering culture shapes the people in it.',
		tags: ['engineering-culture', 'hiring', 'developer-experience', 'career', 'leadership', 'teams', 'product-thinking'],
	},
	{
		id: 'nt',
		code: 'NT',
		name: 'Notes',
		summary: 'Everything else: site notes and one-off thoughts.',
		tags: [],
	},
];

export const FALLBACK_LINE_ID = 'nt';
