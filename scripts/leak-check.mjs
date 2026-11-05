#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const N = 5;
const args = process.argv.slice(2);
const rootArg = args.indexOf('--root');
const ROOT = rootArg >= 0 ? resolve(args[rootArg + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const QUIET = args.includes('--quiet');
const SETS = join(ROOT, 'benchmarks', 'sets');

const tokenize = (text) => text.toLowerCase().normalize('NFC').match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];

const ngrams = (text) => {
	const words = tokenize(text);
	const grams = new Set();
	for (let i = 0; i + N <= words.length; i++) grams.add(words.slice(i, i + N).join(' '));
	return grams;
};

const walkMarkdown = (dir, recursive) => {
	if (!existsSync(dir)) return [];
	const found = [];
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		const stat = statSync(full);
		if (stat.isDirectory()) {
			if (recursive) found.push(...walkMarkdown(full, true));
		} else if (name.toLowerCase().endsWith('.md')) {
			found.push(full);
		}
	}
	return found;
};

const sha256 = (file) => createHash('sha256').update(readFileSync(file, 'utf8').replace(/\r\n/g, '\n'), 'utf8').digest('hex');

const failures = [];

const triggersPath = join(SETS, 'triggers.json');
if (!existsSync(triggersPath)) {
	failures.push(`missing ${relative(ROOT, triggersPath)}`);
} else {
	const heldout = JSON.parse(readFileSync(triggersPath, 'utf8')).heldout ?? [];
	const sources = [...walkMarkdown(join(ROOT, 'skills'), true), ...walkMarkdown(join(ROOT, 'agents'), false)];
	const sourceGrams = sources.map((file) => ({ file: relative(ROOT, file).replace(/\\/g, '/'), grams: ngrams(readFileSync(file, 'utf8')) }));
	let leaks = 0;
	let pairs = 0;
	for (const item of heldout) {
		let leaked = false;
		for (const gram of ngrams(item.prompt)) {
			for (const source of sourceGrams) {
				if (!source.grams.has(gram)) continue;
				pairs++;
				leaked = true;
				if (!QUIET) console.log(`LEAK ${item.id} <-> ${source.file}: "${gram}"`);
			}
		}
		if (leaked) leaks++;
	}
	console.log(`leak-check: ${heldout.length} held-out prompts vs ${sources.length} skill/agent files, L = ${leaks} (${pairs} shared n-grams)`);
	if (leaks > 0) failures.push(`L = ${leaks} (held-out prompts share ${N}-word n-grams with skill/agent text)`);
}

const manifestPath = join(SETS, 'MANIFEST.json');
if (!existsSync(manifestPath)) {
	failures.push(`missing ${relative(ROOT, manifestPath)}`);
} else {
	const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
	const files = manifest.files ?? {};
	if (Object.keys(files).length === 0) failures.push('MANIFEST lists no files');
	for (const [name, entry] of Object.entries(files)) {
		const file = join(SETS, name);
		if (!existsSync(file)) {
			failures.push(`MANIFEST: ${name} missing`);
			continue;
		}
		const actual = sha256(file);
		if (actual !== entry.sha256) failures.push(`MANIFEST: ${name} sha256 ${actual} != ${entry.sha256}`);
	}
	console.log(`manifest: ${Object.keys(files).length} files checked`);
}

if (failures.length > 0) {
	for (const failure of failures) console.error(`FAIL ${failure}`);
	process.exit(1);
}
console.log('OK');
