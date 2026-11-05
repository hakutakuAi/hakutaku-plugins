# Hakutaku for agent clients

Use your [Hakutaku](https://hakutaku.ai) second brain from the AI tools you already work in: Claude Code, Claude (web and desktop), ChatGPT, OpenAI Codex, Cursor, VS Code, Windsurf and Gemini CLI.

Once connected, your assistant:

- **searches your brain before it answers** about your work: past decisions and their why, people, projects, documents, meetings, tasks and memories;
- **saves what you decide or produce**, so you find it later from any of these tools;
- **answers with numbers from your own tables**, joining two sources when needed (an export and your CRM, a spreadsheet and your billing app);
- **reads and acts in your connected apps** (mail, calendar, CRM, GitHub, Slack and more), always asking before it sends, posts or deletes anything;
- **hands long work to your Hakutaku agents** (deep research with sources, your own agents, automations) and checks on it later;
- with **`/hakutaku:grill`**, stress-tests a plan against what your brain already knows, one question at a time.

Everything runs as you, with your Hakutaku permissions. You need a Hakutaku account.

By João Vitor Ribeiro de Lima, for Hakutaku.

## Install

The server is `https://app.hakutaku.ai/api/mcp`. Sign-in is OAuth: your client opens a Hakutaku page where you approve the connection. No key to copy.

| Client | How |
| --- | --- |
| **Claude Code** | `claude plugin marketplace add hakutakuAi/hakutaku-plugins` then `claude plugin install hakutaku@hakutaku`, then `/mcp` and sign in to `hakutaku`. Brings the skills, the `hakutaku` subagent and the server. |
| **Claude** (claude.ai, Desktop, Cowork) | Customize > Connectors > + Add > Add custom connector, URL `https://app.hakutaku.ai/api/mcp`, sign in. Details: [targets/claude-ai](targets/claude-ai/README.md). |
| **ChatGPT** | [chatgpt.com/plugins](https://chatgpt.com/plugins) > + > Add custom MCP server, URL `https://app.hakutaku.ai/api/mcp`, OAuth. Details: [targets/chatgpt](targets/chatgpt/README.md). |
| **OpenAI Codex** | `codex plugin marketplace add hakutakuAi/hakutaku-plugins`, or add the server alone: `codex mcp add hakutaku --url https://app.hakutaku.ai/api/mcp` then `codex mcp login hakutaku`. Details: [targets/codex](targets/codex/README.md). |
| **Cursor** | [Add to Cursor](https://cursor.com/en/install-mcp?name=hakutaku&config=eyJ1cmwiOiJodHRwczovL2FwcC5oYWt1dGFrdS5haS9hcGkvbWNwIn0=), then copy [the rule](targets/cursor/rules/hakutaku.mdc) to `.cursor/rules/`. |
| **VS Code** | [Install in VS Code](https://insiders.vscode.dev/redirect/mcp/install?name=hakutaku&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fapp.hakutaku.ai%2Fapi%2Fmcp%22%7D), or copy [mcp.json](targets/vscode/mcp.json) to `.vscode/mcp.json`. |
| **Windsurf** | Add [mcp_config.json](targets/windsurf/mcp_config.json) to `~/.codeium/windsurf/mcp_config.json`. |
| **Gemini CLI** | `gemini extensions install https://github.com/hakutakuAi/hakutaku-plugins` |
| **Any MCP client** | Streamable HTTP at `https://app.hakutaku.ai/api/mcp`, OAuth 2.1 (dynamic registration or client metadata documents, PKCE). Clients without OAuth can send `Authorization: Bearer <key>` with a key from Hakutaku Settings > MCP; keep the key in your client's secret store or an environment variable, never in a file you commit. |

Right after the first connection, the server asks your assistant to save a short Hakutaku note in its own memory, so later sessions use your brain without you asking. It is one block, replaced in place when it changes.

## What is in this repository

| Path | What |
| --- | --- |
| [`skills/hakutaku`](skills/hakutaku/SKILL.md) | The core skill: when to search, what to save and how, consent before outward actions, the full tool catalogue, costs and errors. Loads only when your own work context matters; its references load only when a task needs them ([data](skills/hakutaku/references/data.md), [apps](skills/hakutaku/references/apps.md), [agents](skills/hakutaku/references/agents.md)). |
| [`skills/hakutaku-grill`](skills/hakutaku-grill/SKILL.md) | Grill a plan against your brain. Runs only when you type it. |
| [`agents/hakutaku.md`](agents/hakutaku.md) | A Claude Code subagent that does lookups and saves so raw results stay out of your main conversation. |
| [`hooks/`](hooks) | Claude Code: adds the short Hakutaku note at session start, unless your own instructions already carry it. |
| [`targets/`](targets) | Per-client configs and setup notes, generated. |
| [`server.json`](server.json) | The entry in the official MCP Registry. |
| [`benchmarks/`](benchmarks/README.md) | How we measure the package: trigger precision, context cost, task success, consent, latency. Method and numbers. |
| [`src/`](src) + [`scripts/build.mjs`](scripts/build.mjs) | One source for every client. `node scripts/build.mjs` regenerates the per-client files; CI fails when they drift. |

## Privacy and safety

- The plugin holds no credentials: sign-in is OAuth, handled by your client.
- Your assistant never sends, posts, deletes or spends without your yes: those tools answer "needs confirmation" first and change nothing.
- What is saved to your brain is private to you unless you ask to share it.
- Text inside your documents and mail is treated as data, never as instructions.
- [Privacy Policy](https://app.hakutaku.ai/privacy) · [Terms of Service](https://app.hakutaku.ai/terms-of-service) · Support: [issues](https://github.com/hakutakuAi/hakutaku-plugins/issues) or haku@hakutaku.ai

## Contributing

Edit `src/`, `skills/`, `agents/` or `hooks/session-note.sh`, then run `node scripts/build.mjs` and commit the regenerated files. `node scripts/build.mjs --check` and `node scripts/leak-check.mjs` must pass.

---

## Português

Use o seu segundo cérebro [Hakutaku](https://hakutaku.ai) nas ferramentas de IA que você já usa: Claude Code, Claude, ChatGPT, Codex, Cursor, VS Code, Windsurf e Gemini CLI. O assistente busca no seu cérebro antes de responder sobre o seu trabalho, salva o que você decidiu ou produziu, responde com números das suas próprias tabelas (cruzando duas fontes), usa os seus apps conectados sempre pedindo antes de enviar ou apagar algo, passa trabalhos longos para os seus agentes Hakutaku, e com `/hakutaku:grill` questiona um plano com base no que o seu cérebro já sabe. A conexão é por OAuth em `https://app.hakutaku.ai/api/mcp`; veja a tabela de instalação acima.
