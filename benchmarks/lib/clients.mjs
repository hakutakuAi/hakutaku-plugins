// Builds isolated client configurations for a benchmark arm and runs one headless turn in them.
// The key comes from HAKUTAKU_BENCH_KEY and is only ever written into the temporary config, never printed.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'

const REPO = resolve(import.meta.dirname, '../..')

function benchKey() {
	const key = process.env.HAKUTAKU_BENCH_KEY
	if (!key) throw new Error('Set HAKUTAKU_BENCH_KEY to a Hakutaku API key for the benchmark member')
	return key
}

function serverConfig(url) {
	return { type: 'http', url, headers: { Authorization: `Bearer ${benchKey()}` } }
}

// arm "baseline": the MCP server only. arm "plugin": this repository installed from its marketplace, with the
// plugin's server pointed at the benchmark URL (the shipped plugin uses OAuth, which a headless run cannot click).
async function prepareClaude({ root, arm, url }) {
	const dir = join(root, `claude-${arm}`)
	rmSync(dir, { recursive: true, force: true })
	mkdirSync(dir, { recursive: true })
	const credentials = join(homedir(), '.claude', '.credentials.json')
	if (existsSync(credentials)) cpSync(credentials, join(dir, '.credentials.json'))
	const config = { hasCompletedOnboarding: true, theme: 'dark', mcpServers: {} }
	if (arm === 'baseline') config.mcpServers.hakutaku = serverConfig(url)
	writeFileSync(join(dir, '.claude.json'), JSON.stringify(config))
	if (arm === 'plugin') {
		const copy = join(root, 'marketplace-copy')
		rmSync(copy, { recursive: true, force: true })
		cpSync(REPO, copy, {
			recursive: true,
			filter: (path) => !/[\\/](\.git|node_modules|benchmarks)([\\/]|$)/.test(path),
		})
		writeFileSync(join(copy, '.mcp.json'), JSON.stringify({ mcpServers: { hakutaku: serverConfig(url) } }))
		await run('claude', ['plugin', 'marketplace', 'add', copy], { CLAUDE_CONFIG_DIR: dir })
		await run('claude', ['plugin', 'install', 'hakutaku@hakutaku'], { CLAUDE_CONFIG_DIR: dir })
	}
	return dir
}

function run(command, args, env, cwd) {
	return new Promise((resolveRun) => {
		const child = spawn(command, args, { env: { ...process.env, ...env }, cwd })
		let out = ''
		let err = ''
		child.stdout.on('data', (chunk) => (out += chunk))
		child.stderr.on('data', (chunk) => (err += chunk))
		child.on('close', (code) => resolveRun({ code, out, err }))
	})
}

async function claudeTurn({ configDir, cwd, prompt, model = 'sonnet', maxTurns = 20, resume }) {
	const args = [
		'-p',
		prompt,
		'--model',
		model,
		'--output-format',
		'stream-json',
		'--verbose',
		'--max-turns',
		String(maxTurns),
		'--allowedTools',
		'mcp__hakutaku__*',
		'mcp__plugin_hakutaku_hakutaku__*',
		'Skill',
		'Agent',
		'Read',
	]
	if (resume) args.push('--resume', resume)
	const started = Date.now()
	const { code, out } = await run('claude', args, { CLAUDE_CONFIG_DIR: configDir, ENABLE_CLAUDEAI_MCP_SERVERS: 'false' }, cwd)
	return { code, ms: Date.now() - started, events: parseStream(out) }
}

function parseStream(text) {
	return text
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			try {
				return JSON.parse(line)
			} catch {
				return null
			}
		})
		.filter(Boolean)
}

function summarize(events) {
	const init = events.find((event) => event.type === 'system' && event.subtype === 'init')
	const result = events.find((event) => event.type === 'result')
	const calls = []
	const outputs = new Map()
	for (const event of events) {
		const content = event.message?.content
		if (!Array.isArray(content)) continue
		for (const part of content) {
			if (part.type === 'tool_use') calls.push({ id: part.id, name: part.name, input: part.input })
			if (part.type === 'tool_result') outputs.set(part.tool_use_id, part.content)
		}
	}
	for (const call of calls) call.output = outputs.get(call.id)
	return {
		sessionId: init?.session_id ?? result?.session_id,
		skillsListed: init?.skills ?? [],
		calls,
		answer: result?.result ?? '',
		costUsd: result?.total_cost_usd ?? 0,
		ms: result?.duration_ms ?? 0,
		usage: result?.usage ?? {},
	}
}

export { prepareClaude, claudeTurn, summarize, run, REPO }
