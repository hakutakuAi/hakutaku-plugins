// Minimal MCP (streamable HTTP, JSON-RPC) client the grader and the seeder use.
// The key comes from HAKUTAKU_BENCH_KEY and is never printed or written anywhere.

function benchKey() {
	const key = process.env.HAKUTAKU_BENCH_KEY
	if (!key) throw new Error('Set HAKUTAKU_BENCH_KEY to a Hakutaku API key for the benchmark member')
	return key
}

function parseBody(text) {
	if (!text) return {}
	const dataLines = text.split('\n').filter((line) => line.startsWith('data: '))
	if (dataLines.length) return JSON.parse(dataLines[dataLines.length - 1].slice(6))
	return JSON.parse(text)
}

function createClient(url) {
	let sessionId
	let nextId = 1
	let initializing

	async function post(body) {
		const headers = {
			'content-type': 'application/json',
			accept: 'application/json, text/event-stream',
			authorization: `Bearer ${benchKey()}`,
		}
		if (sessionId) headers['mcp-session-id'] = sessionId
		const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
		const sid = response.headers.get('mcp-session-id')
		if (sid) sessionId = sid
		const text = await response.text()
		if (!response.ok && !text) throw new Error(`MCP HTTP ${response.status}`)
		return parseBody(text)
	}

	async function initialize() {
		if (!initializing) {
			initializing = post({
				jsonrpc: '2.0',
				id: nextId++,
				method: 'initialize',
				params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'hakutaku-bench-grader', version: '1' } },
			}).then(() => post({ jsonrpc: '2.0', method: 'notifications/initialized' }).catch(() => null))
		}
		return initializing
	}

	async function listTools() {
		await initialize()
		const reply = await post({ jsonrpc: '2.0', id: nextId++, method: 'tools/list', params: {} })
		return reply.result?.tools ?? []
	}

	async function call(name, args = {}, { retries = 2 } = {}) {
		await initialize()
		const started = Date.now()
		for (let attempt = 0; ; attempt++) {
			try {
				const reply = await post({ jsonrpc: '2.0', id: nextId++, method: 'tools/call', params: { name, arguments: args } })
				if (reply.error) throw new Error(`${name}: ${reply.error.message}`)
				const text = (reply.result?.content ?? []).map((part) => part.text ?? '').join('\n')
				let json = null
				try {
					json = JSON.parse(text)
				} catch {}
				return { ms: Date.now() - started, isError: Boolean(reply.result?.isError), text, json }
			} catch (error) {
				if (attempt >= retries) throw error
				await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)))
			}
		}
	}

	return { call, listTools }
}

export { createClient }
