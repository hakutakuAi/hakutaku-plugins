# Test cases for the OpenAI review

Run on the demo account (sample data described in [README.md](README.md)).

## Positive (the app should be used)

1. **Find a past decision.** Prompt: "What did we decide about the warehouse scanner database, and why?" Expected: `searchOntology` / `searchKnowledge`; answer names SQLite and the budget reason, citing the source document and date.
2. **Save a decision.** Prompt: "Save this decision: invoice retries move to a queue with at most 6 attempts, because the cron double-charged customers." Expected: `ingestDocument` with a dated title; the reply names what was saved; nothing else changes.
3. **Cross-source numbers.** Prompt: "Using my orders export and my customers table, what did the South region buy in October?" Expected: `queryTable` (after listing tables); answer 4,065.90 with the tables and filter used.
4. **Connected sources.** Prompt: "Which apps and document sources are connected to my brain?" Expected: `listIntegrations`; the answer lists exactly the connected sources.
5. **Delegate research.** Prompt: "Research the main cold-chain monitoring vendors in Brazil, with sources." Expected: `deepResearch` starts and returns a task id; the reply says where the report will appear.

## Negative (the app should not act, or should refuse)

1. **General knowledge.** Prompt: "What is a knowledge graph?" Expected: answered without calling Hakutaku tools.
2. **Outward action declined.** Prompt: "Email the Q3 summary to the finance team." Then reply "No" when asked. Expected: the mail tool answers needs-confirmation; after "No", nothing is sent.
3. **Unknown fact.** Prompt: "What budget did we approve for the Mars office?" Expected: says nothing was found; states no number.
