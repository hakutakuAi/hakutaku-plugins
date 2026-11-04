# Trigger eval, heldout set, 2026-11-04

Client claude-code (headless claude -p, --max-turns 3), model sonnet, arm plugin, n = 84. 95% Wilson intervals.

| Signal | Recall R | Precision P | Unwanted load U (background) | Near-miss loads |
| --- | --- | --- | --- | --- |
| Skill tool loads `hakutaku` | 0.04 [0.01, 0.20] (1/24) | 1.00 [0.21, 1.00] (1/1) | 0.00 [0.00, 0.10] (0/36) | 0.00 [0.00, 0.14] (0/24) |
| Skill or `hakutaku` subagent | 0.04 [0.01, 0.20] (1/24) | 1.00 [0.21, 1.00] (1/1) | 0.00 [0.00, 0.10] (0/36) | 0.00 [0.00, 0.14] (0/24) |
| Any Hakutaku MCP call (engaged) | 0.92 [0.74, 0.98] (22/24) | 0.92 [0.74, 0.98] (22/24) | 0.00 [0.00, 0.10] (0/36) | 0.08 [0.02, 0.26] (2/24) |

grill model-invoked loads: 0. Errors: 14. Latency p50 10.267 s, p90 21.619 s. Claude cost $6.4202.
