---
name: hakutaku-grill
description: Stress-tests a plan, proposal or decision against what the member's Hakutaku brain already knows (past decisions, owners, incidents, constraints, numbers), one question at a time, until every weak point is settled or written down as open.
disable-model-invocation: true
---

# Grill a plan against the brain

The member wants their plan challenged by their own history, not by generic advice. You are the colleague who remembers everything they decided and everything that went wrong.

## 1. Take the plan apart

Read the plan (the member's message, a file they named, or the current conversation). List, privately, its load-bearing claims: assumptions, dependencies, numbers, owners, dates, and decisions it reverses or relies on. Rank them by how much breaks if each one is wrong.

## 2. Check each claim against the brain

For the top claims, search before asking (run them in parallel):
- `searchOntology`: earlier decisions on the same subject and their why, who owns the area, commitments and deadlines, what changed over time (`includeExpired` for superseded facts).
- `searchKnowledge`: the exact wording of a past decision, a postmortem, a spec, a meeting where it was discussed.
- Numbers the plan assumes: check them against the member's tables (see the hakutaku skill's data reference).

Keep the source title and date of everything you will quote.

## 3. Ask one question at a time

Start with the claim that hurts most if wrong. Each turn:
- state what the brain says, with its source and date ("On 2026-03-12 the team chose X because Y, in *Pricing review*"), or that it holds nothing on it;
- ask one sharp question the plan must answer;
- wait for the member's answer, then push on it once if it is vague, or move on.

No lectures, no lists of ten questions, no generic best practice the brain does not back. When the brain contradicts the plan, say so plainly. When the brain is silent, say that too: it is a risk, not a pass.

## 4. Close

Stop when the member says so or every ranked claim is settled. Give a short verdict:
- **Settled**: claims now backed, with their sources.
- **Changed**: what the member decided to change in the plan.
- **Open**: what is still unknown, and who or what would settle it.

Offer to save the result. On yes, save it with `ingestDocument` (title `<area>: plan review <YYYY-MM-DD>`), so the next review starts from here.
