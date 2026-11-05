# 0001: Publish to the MCP Registry as io.github.hakutakuAi/hakutaku

Date: 2026-11-04. Status: accepted.

## Context

The official MCP Registry names a server by a namespace its publisher proves: `io.github.<owner>/` through GitHub (a login, a token or GitHub Actions OIDC), or a reverse domain such as `ai.hakutaku/` through a DNS TXT record or a file at `https://hakutaku.ai/.well-known/mcp-registry-auth`. A remote URL belongs to one server name, so the choice is hard to undo.

## Decision

`io.github.hakutakuAi/hakutaku`, published by `.github/workflows/publish-registry.yml` with GitHub Actions OIDC on each `v*` tag.

## Why

- It needs no secret and no manual login: the repository's own workflow proves the namespace.
- The domain proof needs a DNS change or a production deploy of a key file, both outside this repository.

## Consequences

- Moving to `ai.hakutaku/hakutaku` later means publishing the new name, then marking this one `deprecated`; clients that pinned the old name keep working until it is removed.
- The `version` in `server.json` must equal the tag (the workflow checks it).
