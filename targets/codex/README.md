# OpenAI Codex

Sources: [Codex MCP](https://developers.openai.com/codex/mcp), [Codex skills](https://developers.openai.com/codex/skills), [Codex plugins](https://developers.openai.com/codex/plugins/build).

## Plugin (skills + server)

```bash
codex plugin marketplace add hakutakuAi/hakutaku-plugins
```

Then install `hakutaku` from the plugin list and sign in when asked. The plugin carries the `hakutaku` skill (implicit), `hakutaku-grill` (explicit only: type `$hakutaku-grill`) and the server.

## Server only

```bash
codex mcp add hakutaku --url https://app.hakutaku.ai/api/mcp
codex mcp login hakutaku
```

or paste [config.toml](config.toml) into `~/.codex/config.toml`. To use an API key instead of signing in, keep it in the `HAKUTAKU_API_KEY` environment variable and use the commented block.

Skills alone: copy `skills/hakutaku` and `skills/hakutaku-grill` to `~/.agents/skills/`.

## Note for every session

Append [AGENTS.md](AGENTS.md) to `~/.codex/AGENTS.md` (one block between `hakutaku:start` and `hakutaku:end`; replace it when it changes). Skip this if the server's usage note is already there.
