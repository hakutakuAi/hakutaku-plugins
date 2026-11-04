# Where Hakutaku is listed, and how to list it

Copy for every form: [listing.md](listing.md). Status of each target: [STATUS.md](STATUS.md).

## Self-serve (done from this repository)

- **Claude Code marketplace**: this repository is the marketplace (`.claude-plugin/marketplace.json`).
- **Codex / ChatGPT desktop marketplace**: `codex plugin marketplace add hakutakuAi/hakutaku-plugins` (`.agents/plugins/marketplace.json`, root `plugin.json` + `mcp.json`).
- **Gemini CLI extensions gallery**: crawled daily from public repositories with the `gemini-cli-extension` topic and `gemini-extension.json` at the root, on a tagged release.
- **Official MCP Registry**: `.github/workflows/publish-registry.yml` on each `v*` tag (GitHub OIDC, name `io.github.hakutakuAi/hakutaku`). Directories that read the registry (PulseMCP once it reopens, the GitHub MCP registry behind VS Code) pick it up from there.

## Needs a person signed in

Each step names who must do it. None of these may be done by an agent.

### Anthropic: Claude connectors directory and plugin directory
Requirements (claude.com/docs/connectors/building/submission, review-criteria): paid Claude plan; every tool with `title` and `readOnlyHint` or `destructiveHint`; OAuth; privacy policy; support contact; icon; a reviewer test account with a populated brain.
1. Create a demo Hakutaku account on production with sample documents, a meeting, two tables and one connected app; no MFA. Keep its credentials in the team's password manager.
2. Sign in at claude.ai/directory/manage (Pro/Max/Team/Enterprise), **Submit new > MCP connector**: URL, listing.md fields, icon, test credentials, the seven acknowledgements.
3. Same portal, **Submit new > Plugin**: repository `hakutakuAi/hakutaku-plugins` (public, README, LICENSE present).
Prerequisite: the dashboard PRs that add tool titles and annotations and the confirm token are live on production.

### OpenAI: ChatGPT app directory and Codex plugin directory (one submission)
Requirements (developers.openai.com/plugins/deploy/submission): org Owner or Apps Management Write; individual or business verification; https website, support, privacy and terms URLs; square icon; demo account without MFA; exactly 5 positive and 3 negative test cases ([openai-test-cases.md](openai-test-cases.md)); a demo video URL; domain verification. Plugins with hooks are not accepted: submit the server ("With MCP") and the skills zip without `hooks/`.
1. Sign in at platform.openai.com/plugins as an Owner, complete verification if asked.
2. Upload: "With MCP", URL `https://app.hakutaku.ai/api/mcp`, listing.md fields, icon, demo account, test cases, a 1-2 minute screen recording of the five positive cases.
3. Resolve automated findings, submit for review; after approval press **Publish**.

### Cursor
- Community directory: sign in at cursor.directory/plugins/new with GitHub, paste `https://github.com/hakutakuAi/hakutaku-plugins`, submit.
- Official marketplace: cursor.com/marketplace/publish (manual review, open-source repository).

### Glama
Sign in at glama.ai/mcp/servers, **Add MCP Server**, repository URL. `glama.json` at the root names the maintainer so the listing can be claimed.

### mcp.so
mcp.so/submit?type=server: repository URL, name, type "Remote Server". Free path only; skip the paid "premium" option.

### Not available
- Smithery: closed its publishing and accounts on 2026-10-31.
- PulseMCP: not accepting submissions; it will import from the official registry.
- awesome-mcp-servers: lists self-run servers; its remote-server sibling requires a Glama listing first, then a pull request.
