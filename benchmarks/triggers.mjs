// Trigger evaluation: does the plugin's skill load (and does the agent reach the Hakutaku server) on each prompt?
// node benchmarks/triggers.mjs --set heldout|train --arm plugin [--concurrency 4] [--limit N]
// Each prompt runs as a fresh headless session (max 3 turns, sonnet). Hakutaku write tools are not allowed,
// so a run never changes the member's brain; a denied call still counts as "engaged".
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { claudeTurn, prepareClaude, repoCommit, summarize } from './lib/clients.mjs'
import { percentile, round, wilson } from './lib/stats.mjs'

const HERE = import.meta.dirname
const args = Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean).map((pair) => pair.trim().split(/\s+/)))
const SET = args.set ?? 'heldout'
const ARM = args.arm ?? 'plugin'
const CONCURRENCY = Number(args.concurrency ?? 4)
const URL_ = process.env.HAKUTAKU_BENCH_URL ?? 'https://stage.hakutaku.ai/api/mcp'
const ROOT = resolve(process.env.HAKUTAKU_BENCH_ROOT ?? join(tmpdir(), 'hakutaku-bench'))
const DATE = new Date().toISOString().slice(0, 10)
const READ_TOOLS = [
	'searchKnowledge',
	'listKnowledgeFiles',
	'readKnowledgeFile',
	'myPermissions',
	'searchOntology',
	'listActionItems',
	'getIngestStatus',
	'listAutomations',
	'listIntegrations',
	'myProfile',
	'listWorkspaceFiles',
	'readWorkspaceFile',
	'findAppTools',
	'listAgents',
	'readAgentTasks',
	'readRoutineNotes',
	'readAgentFolder',
	'search_context',
	'get_relationships',
	'getToolDetails',
]
const ALLOWED = ['Skill', 'Agent', 'Read', 'ToolSearch', ...READ_TOOLS.flatMap((name) => [`mcp__hakutaku__${name}`, `mcp__plugin_hakutaku_hakutaku__${name}`])]

const prompts = JSON.parse(readFileSync(join(HERE, 'sets/triggers.json'), 'utf8'))[SET].slice(0, Number(args.limit ?? Infinity))

function skillOf(call) {
	return String(call.input?.skill ?? call.input?.command ?? call.input?.name ?? '')
}

async function runPrompt(item, configDir) {
	const workspace = join(ROOT, 'work', `triggers-${SET}-${DATE}`, item.id)
	mkdirSync(workspace, { recursive: true })
	const turn = await claudeTurn({ configDir, cwd: workspace, prompt: item.prompt, maxTurns: 3, allowedTools: ALLOWED, timeoutMs: 300000 })
	const summary = summarize(turn.events)
	const skills = summary.calls.filter((call) => call.name === 'Skill').map(skillOf)
	const agents = summary.calls.filter((call) => call.name === 'Agent').map((call) => String(call.input?.subagent_type ?? ''))
	const mcp = summary.calls.filter((call) => /^mcp__(plugin_hakutaku_)?hakutaku__/.test(call.name)).map((call) => call.name.replace(/^mcp__(plugin_hakutaku_)?hakutaku__/, ''))
	const record = {
		id: item.id,
		kind: item.kind,
		expect: item.expect,
		skillLoaded: skills.some((name) => /^(hakutaku:)?hakutaku$/.test(name)),
		grillLoaded: skills.some((name) => /^(hakutaku:)?hakutaku-grill$/.test(name)),
		agentUsed: agents.some((name) => /^(hakutaku:)?hakutaku$/.test(name)),
		engaged: mcp.length > 0,
		mcpTools: mcp,
		ms: summary.ms || turn.ms,
		costUsd: round(summary.costUsd),
		inputTokens: (summary.usage.input_tokens ?? 0) + (summary.usage.cache_read_input_tokens ?? 0) + (summary.usage.cache_creation_input_tokens ?? 0),
		outputTokens: summary.usage.output_tokens ?? 0,
		error: summary.isError || turn.timedOut,
	}
	mkdirSync(join(ROOT, 'raw', `triggers-${SET}-${DATE}`), { recursive: true })
	writeFileSync(join(ROOT, 'raw', `triggers-${SET}-${DATE}`, `${item.id}.json`), JSON.stringify({ record, prompt: item.prompt, calls: summary.calls.map(({ output, ...rest }) => rest), answer: summary.answer }, null, 1))
	console.log(`${item.id} skill=${record.skillLoaded ? 1 : 0} agent=${record.agentUsed ? 1 : 0} engaged=${record.engaged ? 1 : 0} grill=${record.grillLoaded ? 1 : 0} ${Math.round(record.ms / 1000)}s`)
	return record
}

function rates(records, loaded) {
	const should = records.filter((record) => record.kind === 'should')
	const nonShould = records.filter((record) => record.kind !== 'should')
	const background = records.filter((record) => record.kind === 'background')
	const nearMiss = records.filter((record) => record.kind === 'near-miss')
	const hitsShould = should.filter(loaded).length
	const allLoads = records.filter(loaded).length
	return {
		R: wilson(hitsShould, should.length),
		P: wilson(hitsShould, allLoads),
		U: wilson(background.filter(loaded).length, background.length),
		nearMissLoads: wilson(nearMiss.filter(loaded).length, nearMiss.length),
		falseLoads: nonShould.filter(loaded).map((record) => record.id),
		missedShould: should.filter((record) => !loaded(record)).map((record) => record.id),
	}
}

async function main() {
	const repo = await repoCommit()
	const configDir = await prepareClaude({ root: join(ROOT, 'cfg-triggers'), arm: ARM, url: URL_ })
	const records = []
	let next = 0
	await Promise.all(
		Array.from({ length: CONCURRENCY }, async () => {
			while (next < prompts.length) {
				const item = prompts[next++]
				records.push(await runPrompt(item, configDir).catch((error) => ({ id: item.id, kind: item.kind, expect: item.expect, error: String(error.message) })))
			}
		}),
	)
	records.sort((a, b) => a.id.localeCompare(b.id))
	const output = {
		set: SET,
		arm: ARM,
		repo,
		date: DATE,
		client: 'claude-code (headless claude -p, --max-turns 3)',
		model: 'sonnet',
		n: records.length,
		skillLoad: rates(records, (record) => record.skillLoaded),
		skillOrAgentLoad: rates(records, (record) => record.skillLoaded || record.agentUsed),
		engaged: rates(records, (record) => record.engaged),
		grillModelLoads: records.filter((record) => record.grillLoaded).length,
		errors: records.filter((record) => record.error).length,
		latencyS: { p50: percentile(records.map((record) => record.ms / 1000), 0.5), p90: percentile(records.map((record) => record.ms / 1000), 0.9) },
		claudeCostUsd: round(records.reduce((sum, record) => sum + (record.costUsd ?? 0), 0)),
		records,
	}
	mkdirSync(join(HERE, 'results'), { recursive: true })
	writeFileSync(join(HERE, 'results', `triggers-${SET}-${DATE}.json`), JSON.stringify(output, null, 1))
	writeFileSync(join(HERE, 'results', `triggers-${SET}-${DATE}.md`), markdown(output))
	console.log(markdown(output))
}

function fmt(rate) {
	return rate.p == null ? 'n/a' : `${rate.p.toFixed(2)} [${rate.lo.toFixed(2)}, ${rate.hi.toFixed(2)}] (${rate.k}/${rate.n})`
}

function markdown(output) {
	const row = (label, block) => `| ${label} | ${fmt(block.R)} | ${fmt(block.P)} | ${fmt(block.U)} | ${fmt(block.nearMissLoads)} |`
	return [
		`# Trigger eval, ${output.set} set, ${output.date}`,
		'',
		`Client ${output.client}, model ${output.model}, arm ${output.arm}, n = ${output.n}. 95% Wilson intervals.`,
		'',
		'| Signal | Recall R | Precision P | Unwanted load U (background) | Near-miss loads |',
		'| --- | --- | --- | --- | --- |',
		row('Skill tool loads `hakutaku`', output.skillLoad),
		row('Skill or `hakutaku` subagent', output.skillOrAgentLoad),
		row('Any Hakutaku MCP call (engaged)', output.engaged),
		'',
		`grill model-invoked loads: ${output.grillModelLoads}. Errors: ${output.errors}. Latency p50 ${output.latencyS.p50} s, p90 ${output.latencyS.p90} s. Claude cost $${output.claudeCostUsd}.`,
		'',
	].join('\n')
}

await main()
