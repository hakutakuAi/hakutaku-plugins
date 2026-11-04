#!/usr/bin/env node
// One rule, one layer: fails when a sentence of eight or more words appears in two guidance layers (the note every
// client gets, the core skill and its references, the grill skill, the subagent), so they never drift apart.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const LAYERS = {
	note: ['src/note.md'],
	skill: ['skills/hakutaku/SKILL.md', ...readdirSync('skills/hakutaku/references').map((f) => join('skills/hakutaku/references', f))],
	grill: ['skills/hakutaku-grill/SKILL.md'],
	agent: ['agents/hakutaku.md'],
}
const MIN_WORDS = 8

function shingles(text) {
	const words = text
		.replace(/^---[\s\S]*?---/, '')
		.toLowerCase()
		.replace(/[`*_|>#()[\]]/g, ' ')
		.split(/\s+/)
		.filter(Boolean)
	const set = new Set()
	for (let i = 0; i + MIN_WORDS <= words.length; i += 1) set.add(words.slice(i, i + MIN_WORDS).join(' '))
	return set
}

const byLayer = Object.fromEntries(
	Object.entries(LAYERS).map(([layer, files]) => [layer, shingles(files.map((f) => readFileSync(f, 'utf8')).join('\n'))]),
)
const names = Object.keys(byLayer)
let duplicates = 0
for (let a = 0; a < names.length; a += 1)
	for (let b = a + 1; b < names.length; b += 1)
		for (const shingle of byLayer[names[a]])
			if (byLayer[names[b]].has(shingle)) {
				duplicates += 1
				console.error(`${names[a]} and ${names[b]} both say: "${shingle}"`)
			}
if (duplicates) {
	console.error(`${duplicates} duplicated run(s) of ${MIN_WORDS}+ words across layers`)
	process.exit(1)
}
console.log('ok: every guidance rule lives in one layer')
