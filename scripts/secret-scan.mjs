#!/usr/bin/env node
// Fails when a tracked file holds something that must never be public: API keys and tokens, signed storage URLs,
// e-mail addresses outside example domains, or record ids in benchmark results.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const RULES = [
	{ name: 'Hakutaku API key', pattern: /hkt_[A-Za-z0-9]{16,}/ },
	{ name: 'Anthropic key', pattern: /sk-ant-[A-Za-z0-9_-]{16,}/ },
	{ name: 'OpenAI key', pattern: /sk-(proj-)?[A-Za-z0-9]{32,}/ },
	{ name: 'GitHub token', pattern: /\b(ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{20,}/ },
	{ name: 'AWS key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
	{ name: 'signed storage URL', pattern: /X-Amz-(Security-Token|Signature)=/ },
	{ name: 'bearer token', pattern: /Bearer\s+[A-Za-z0-9._-]{24,}/ },
	{ name: 'e-mail outside example domains', pattern: /\b[\w.+-]+@(?!example\.(com|org|net)\b|hakutaku\.ai\b|[\w-]+\.example\b)[\w-]+\.[\w.]+\b/ },
]
const RESULT_RULES = [{ name: 'record id in a benchmark result', pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i }]

const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' })
	.split('\n')
	.filter((file) => file && !/\.(png|jpg|ico)$/.test(file))
let found = 0
for (const file of files) {
	let text
	try {
		text = readFileSync(file, 'utf8')
	} catch {
		continue
	}
	const rules = file.startsWith('benchmarks/results/') ? [...RULES, ...RESULT_RULES] : RULES
	text.split('\n').forEach((line, index) => {
		for (const rule of rules) {
			if (!rule.pattern.test(line)) continue
			if (file === 'scripts/secret-scan.mjs') continue
			found += 1
			console.error(`${file}:${index + 1}: ${rule.name}`)
		}
	})
}
if (found) {
	console.error(`${found} finding(s): remove them before committing`)
	process.exit(1)
}
console.log(`ok: ${files.length} files scanned, nothing secret`)
