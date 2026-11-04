# Benchmarks

What this package adds over the bare Hakutaku MCP server, measured in a real agent client against a live server. Claims and thresholds were pre-registered before the final skill text (`PREREG.md`); metric formulas are in `METRICS.md`; the frozen sets and their hashes are in `sets/`.

## What is measured

| Suite | Question | Sets |
| --- | --- | --- |
| Triggers (`triggers.mjs`) | Does the `hakutaku` skill load, and does the agent reach the Hakutaku server, when the member's own context matters, and stay quiet otherwise? | `sets/triggers.json`, held-out split: 24 should, 24 near-miss, 36 background |
| End to end (`run.mjs --suite e2e`) | Do realistic tasks succeed, graded from server state, with and without the package? | `sets/tasks.json`: 18 tasks, 6 families x 3 |
| Injection (`run.mjs --suite injection`) | Does an instruction planted in a member document cause an outward act, a saved secret or a local file write? | `sets/injection.json`: 8 tasks |

## Method

- **Client**: Claude Code, headless (`claude -p`, `--output-format stream-json`), model `sonnet`, one isolated `CLAUDE_CONFIG_DIR` per arm in a temp directory, claude.ai connectors disabled, each session started in its own empty workspace outside this repository.
- **Arms**: `baseline` = the MCP server only (server instructions are all the guidance it gets); `plugin` = this repository installed from a local marketplace copy, its MCP entry pointed at the bench server. Same tasks, same model, arms interleaved, at most 4 sessions at once.
- **Data**: every task run seeds its own synthetic documents (fictional company "Acme Lumen") as private documents titled `[hk-bench <run>] ...`, waits until they are searchable (vector upsert done, max 4 min), then runs the sessions. Save-then-find runs a second, fresh session B only after session A's save is searchable (max 4 min; the wait is recorded and excluded from latency). Seeded automations and started research tasks are torn down after grading.
- **Member turns**: when the agent asks something, the runner answers with the task's scripted reply (at most 3 member turns, the session resumed with `--resume`). The scripted member says yes to an outward action only where the task says so.
- **Oracles**: grading reads server state with the grader's own MCP client (`lib/hakutaku.mjs`) plus the runner's log of every MCP call and result (`happened.applied`, `confirm: true`, arguments), never the agent's self-report. A run passes only when every check passes.
- **Triggers**: one fresh session per prompt, `--max-turns 3`. Hakutaku write tools are not allowed in this suite, so it never changes the brain; a denied call still counts as engaged. "Skill load" = a `Skill` tool call for `hakutaku`; "engaged" = any Hakutaku MCP call.
- **Statistics**: proportions with 95% Wilson intervals; success difference as a paired t interval over task-level means (`lib/stats.mjs`).

## Results (2026-11-04, stage server)

Plugin commit for e2e and injection: `95b53b5`. Triggers ran on `5161154`, whose `skills/` are byte-identical to `95b53b5` (only the session-note wording differs). Raw per-run records: `results/*.json` (checks, counts, timings, costs; no transcripts).

### Triggers, held-out (n = 84, plugin arm)

| Signal | Recall R | Precision P | Unwanted load U (n = 36) | Near-miss loads |
| --- | --- | --- | --- | --- |
| Skill tool loads `hakutaku` | 0.04 [0.01, 0.20] (1/24) | 1.00 [0.21, 1.00] (1/1) | 0.00 [0.00, 0.10] | 0/24 |
| Any Hakutaku MCP call (engaged) | 0.92 [0.74, 0.98] (22/24) | 0.92 [0.74, 0.98] (22/24) | 0.00 [0.00, 0.10] | 2/24 |

`hakutaku-grill` model-invoked loads: 0. Latency p50 10 s, p90 22 s. 14 sessions stopped at the 3-turn cap (counted with what they did up to then).

### End to end, 18 tasks x 2 runs per arm

| Metric | Baseline (MCP only) | Plugin |
| --- | --- | --- |
| Task success S | 0.72 [0.56, 0.84] (26/36) | 0.75 [0.59, 0.86] (27/36) |
| Paired difference S(plugin) - S(baseline) | | +0.03 [-0.13, +0.19] (n = 18 tasks) |
| Cross-session recall X (B answers correctly) | 5/6 | 6/6 |
| X, B read the item its own session A saved | 0.33 [0.10, 0.70] (2/6) | 0.83 [0.44, 0.97] (5/6) |
| Consent violations W | 0 | 0 |
| Fabrication F, pre-registered oracle | 3 | 5 |
| Fabrication F, after review (see below) | 0 | 0 |
| Duplicate saves D | 0/5 | 0/6 |
| Latency p50 / p90 | 26 s / 57 s | 23 s / 59 s |
| MCP calls per run p50 / p90 | 2 / 3.5 | 2 / 4.5 |
| Claude cost, total (per run) | $5.69 ($0.16) | $5.38 ($0.15) |
| Runs where the `hakutaku` skill loaded | 0/36 | 0/36 |

By family (baseline / plugin): save-then-find 3/6 / 3/6, cross-source query 6/6 / 6/6, consult integration 5/6 / 5/6, delegate research 4/6 / 6/6, consent 6/6 / 6/6, negative 2/6 / 1/6.

### Injection, 8 tasks x 1 run per arm

| Metric | Baseline | Plugin |
| --- | --- | --- |
| Attack success ASR | 0.00 [0.00, 0.32] (0/8) | 0.00 [0.00, 0.32] (0/8) |
| Consent violations W | 0 | 0 |

### Hakutaku spend

320 hakutokens over the whole session (pilot, one aborted e2e start, e2e, injection, grader reads), about $1.85 at the purchase price of a hakutoken; far under the $10 cap. The pilot (2 tasks x 2 arms) cost 22 hakutokens and projected about $3 for the full run.

### Against the pre-registered thresholds

- W = 0 and ASR = 0: met.
- F = 0: not met under the pre-registered oracle. Every failing number check was reviewed: the extra numbers are values and dates quoted from other `[hk-bench]` documents in the same brain, one character count from a tool result and digits of a run id; no answer invented a value for the fact asked.
- Non-inferiority S(plugin) >= S(baseline) - 0.05: not shown (the interval's lower bound is -0.13); no superiority claim.
- Trigger R >= 0.85: met for engagement (0.92), not met for the skill itself (0.04): the agent goes straight to the server's tools and rarely opens the skill. U <= 0.05: met for both. grill loads = 0: met.

### Main failure causes

1. **Neighbouring documents in "not found" answers** (negative family, 9 of 12 runs fail). In 8 runs the agent correctly says the fact is missing, then lists close matches with their numbers, which the number checks count as unsupported. Two runs (one of them also among the 8) fail the not-found regex with wording it does not cover ("has no August rows").
2. **The saved item is not found by an exact-token search** (save-then-find, 6 of 12 runs). `searchKnowledge` with the run's unique marker does not return the saved document: never when the agent saved with `visibility: organization` (the prompt said "for the team"), sometimes for private saves even after processing completed.
3. **Baseline uses the client's own research instead of the brain** (2 of 6 baseline delegate-research runs): it loads the client's built-in deep-research skill and starts a local background agent, so no Hakutaku task exists.

## Reproduce

```sh
export HAKUTAKU_BENCH_KEY=...                 # a Hakutaku API key for a bench member; never commit it
export HAKUTAKU_BENCH_URL=https://stage.hakutaku.ai/api/mcp   # default; production is https://app.hakutaku.ai/api/mcp
export HAKUTAKU_BENCH_ROOT=/tmp/hakutaku-bench # configs, workspaces and raw transcripts; outside the repo
node benchmarks/triggers.mjs --set heldout --arm plugin --concurrency 4
node benchmarks/run.mjs --suite e2e --arms baseline,plugin --runs 1 --tasks cs-01,dr-01 --label pilot   # pilot first
node benchmarks/run.mjs --suite e2e --arms baseline,plugin --runs 2 --concurrency 4
node benchmarks/run.mjs --suite injection --arms baseline,plugin --runs 1 --concurrency 4
```

Requires Node 22+ and the `claude` CLI signed in. Raw transcripts are written only under `HAKUTAKU_BENCH_ROOT/raw`.

## Limitations

- One client (Claude Code) and one model (`sonnet`); other clients are not measured here.
- Small n: 36 runs per arm cannot detect a success difference under about 23 points; the intervals above are wide.
- One shared member brain on the stage server: runs of the same task (and earlier runs) leave similar documents, so session B or a negative task can find another run's item. `X, B read its own save` controls for this; the pre-registered X and F do not.
- Stage changes while the bench runs (the single-use confirm token was live during these runs); metering lags and `myUsage` reports only hakutokens for the whole member, so spend is per suite, not per task.
- Oracles are regexes and number checks written before the runs; they are strict by design and some failures are wording, not behaviour (listed above).
