#!/usr/bin/env node
// Generates every per-client file from src/ and skills/. `--check` fails when a committed file differs from what
// the sources produce, so CI catches a hand edit or a forgotten rebuild.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHECK = process.argv.includes('--check')
const meta = JSON.parse(readFileSync(join(ROOT, 'src/meta.json'), 'utf8'))
const note = readFileSync(join(ROOT, 'src/note.md'), 'utf8').trim()
const skillNames = readdirSync(join(ROOT, 'skills'), { withFileTypes: true })
	.filter((entry) => entry.isDirectory() && existsSync(join(ROOT, 'skills', entry.name, 'SKILL.md')))
	.map((entry) => entry.name)
	.sort()

const json = (value) => `${JSON.stringify(value, null, '\t')}\n`
const outputs = new Map()
const emit = (path, text) => outputs.set(path, text.endsWith('\n') ? text : `${text}\n`)

const NOTE_START = '<!-- hakutaku:start -->'
const NOTE_END = '<!-- hakutaku:end -->'
const noteBlock = `${NOTE_START}\n${note}\n${NOTE_END}`

const remoteServer = { type: 'http', url: meta.mcpUrl }
const author = { name: meta.author.name, url: meta.author.url }

function frontmatter(path) {
	const text = readFileSync(join(ROOT, path), 'utf8')
	const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
	if (!match) throw new Error(`${path}: no frontmatter`)
	const fields = {}
	for (const line of match[1].split(/\r?\n/)) {
		const pair = line.match(/^([a-z-]+):\s*(.*)$/)
		if (pair) fields[pair[1]] = pair[2].replace(/^"(.*)"$/, '$1')
	}
	return fields
}

function claudeCode() {
	emit(
		'.claude-plugin/plugin.json',
		json({
			name: meta.name,
			displayName: meta.displayName,
			version: meta.version,
			description: meta.description,
			author,
			homepage: meta.homepage,
			repository: meta.repository,
			license: meta.license,
			keywords: meta.keywords,
			icon: './assets/icon.png',
			documentationUrl: `${meta.repository}#readme`,
			supportUrl: meta.supportUrl,
			privacyPolicyUrl: meta.privacyPolicyUrl,
			termsOfServiceUrl: meta.termsOfServiceUrl,
		}),
	)
	emit(
		'.claude-plugin/marketplace.json',
		json({
			name: meta.name,
			owner: { name: meta.author.name, url: meta.author.url },
			description: `${meta.displayName} plugins: ${meta.description}`,
			plugins: [
				{
					name: meta.name,
					source: './',
					description: meta.description,
					version: meta.version,
					author,
					category: 'productivity',
					keywords: meta.keywords,
				},
			],
		}),
	)
	emit('.mcp.json', json({ mcpServers: { [meta.mcpServerName]: remoteServer } }))
	emit('hooks/session-note.md', note)
}

function codex() {
	emit(
		'targets/codex/config.toml',
		[
			'# Add to ~/.codex/config.toml, then run: codex mcp login hakutaku',
			`[mcp_servers.${meta.mcpServerName}]`,
			`url = "${meta.mcpUrl}"`,
			'',
			'# API-key alternative (no browser sign-in): create a key in Hakutaku Settings > MCP,',
			`# put it in the ${meta.apiKeyEnvVar} environment variable, and use this instead of the block above.`,
			`# [mcp_servers.${meta.mcpServerName}]`,
			`# url = "${meta.mcpUrl}"`,
			`# bearer_token_env_var = "${meta.apiKeyEnvVar}"`,
		].join('\n'),
	)
	emit('targets/codex/AGENTS.md', `${noteBlock}\n`)
	emit(
		'plugin.json',
		json({
			$schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
			name: meta.name,
			version: meta.version,
			description: meta.description,
			author,
			homepage: meta.homepage,
			repository: meta.repository,
			license: meta.license,
			keywords: meta.keywords,
		}),
	)
	emit(
		'mcp.json',
		json({
			$schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
			mcpServers: { [meta.mcpServerName]: { type: 'streamable-http', url: meta.mcpUrl } },
		}),
	)
	emit(
		'.agents/plugins/marketplace.json',
		json({
			name: meta.name,
			plugins: [
				{
					name: meta.name,
					source: { source: 'local', path: './' },
					policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
					category: 'Productivity',
				},
			],
		}),
	)
	for (const name of skillNames) {
		const fields = frontmatter(`skills/${name}/SKILL.md`)
		const userInvoked = fields['disable-model-invocation'] === 'true'
		const lines = [
			'interface:',
			`  display_name: "${meta.skills[name].displayName}"`,
			`  short_description: "${meta.skills[name].shortDescription}"`,
			'dependencies:',
			'  tools:',
			'    - type: "mcp"',
			`      value: "${meta.mcpServerName}"`,
			'      transport: "streamable_http"',
			`      url: "${meta.mcpUrl}"`,
		]
		if (userInvoked) lines.push('policy:', '  allow_implicit_invocation: false')
		emit(`skills/${name}/agents/openai.yaml`, lines.join('\n'))
	}
}

function gemini() {
	emit(
		'gemini-extension.json',
		json({
			name: meta.name,
			version: meta.version,
			description: meta.description,
			contextFileName: 'GEMINI.md',
			mcpServers: { [meta.mcpServerName]: { httpUrl: meta.mcpUrl } },
		}),
	)
	emit('GEMINI.md', `${note}\n\nSkills in this extension: ${skillNames.map((n) => `\`${n}\``).join(', ')}.`)
}

function editors() {
	const cursorConfig = { url: meta.mcpUrl }
	emit('targets/cursor/mcp.json', json({ mcpServers: { [meta.mcpServerName]: cursorConfig } }))
	const cursorLink = `cursor://anysphere.cursor-deeplink/mcp/install?name=${meta.mcpServerName}&config=${Buffer.from(
		JSON.stringify(cursorConfig),
	).toString('base64')}`
	emit(
		'targets/cursor/rules/hakutaku.mdc',
		['---', 'description: Hakutaku second brain: when to search it and what to save', 'alwaysApply: true', '---', '', note].join(
			'\n',
		),
	)
	emit('targets/vscode/mcp.json', json({ servers: { [meta.mcpServerName]: remoteServer } }))
	const vscodeLink = `vscode:mcp/install?${encodeURIComponent(JSON.stringify({ name: meta.mcpServerName, ...remoteServer }))}`
	emit('targets/windsurf/mcp_config.json', json({ mcpServers: { [meta.mcpServerName]: { serverUrl: meta.mcpUrl } } }))
	const cursorWebLink = `https://cursor.com/en/install-mcp?name=${meta.mcpServerName}&config=${Buffer.from(JSON.stringify(cursorConfig)).toString('base64')}`
	const vscodeWebLink = `https://insiders.vscode.dev/redirect/mcp/install?name=${meta.mcpServerName}&config=${encodeURIComponent(JSON.stringify(remoteServer))}`
	emit('targets/install-links.json', json({ cursor: cursorLink, cursorWeb: cursorWebLink, vscode: vscodeLink, vscodeWeb: vscodeWebLink }))
	const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')
	for (const link of [cursorWebLink, vscodeWebLink])
		if (!readme.includes(link)) throw new Error(`README.md is missing the current install link ${link}`)
}

function registry() {
	emit(
		'server.json',
		json({
			$schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
			name: meta.registryName,
			title: meta.displayName,
			description: meta.registryDescription,
			version: meta.version,
			websiteUrl: meta.homepage,
			repository: { url: meta.repository, source: 'github' },
			remotes: [{ type: 'streamable-http', url: meta.mcpUrl }],
		}),
	)
}

function checkLimits() {
	if (meta.registryDescription.length > 100) throw new Error('registryDescription is over 100 characters')
	for (const name of skillNames) {
		const fields = frontmatter(`skills/${name}/SKILL.md`)
		if (fields.name !== name) throw new Error(`skills/${name}: frontmatter name is "${fields.name}"`)
		if (!fields.description || fields.description.length > 1024)
			throw new Error(`skills/${name}: description missing or over 1024 characters`)
		const lines = readFileSync(join(ROOT, 'skills', name, 'SKILL.md'), 'utf8').split('\n').length
		if (lines > 500) throw new Error(`skills/${name}: SKILL.md has ${lines} lines (limit 500)`)
	}
}

checkLimits()
claudeCode()
codex()
gemini()
editors()
registry()

let stale = 0
for (const [path, text] of outputs) {
	const full = join(ROOT, path)
	const current = existsSync(full) ? readFileSync(full, 'utf8').replace(/\r\n/g, '\n') : null
	if (current === text) continue
	if (CHECK) {
		stale += 1
		console.error(`stale: ${path}`)
		continue
	}
	mkdirSync(dirname(full), { recursive: true })
	writeFileSync(full, text)
	console.log(`wrote ${path}`)
}
if (CHECK && stale) {
	console.error(`${stale} generated file(s) out of date: run node scripts/build.mjs`)
	process.exit(1)
}
if (CHECK) console.log(`ok: ${outputs.size} generated files match their sources`)
