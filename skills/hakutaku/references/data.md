# Numbers from the member's own data

For questions answered by rows: a spreadsheet or CSV they uploaded, a table inside a knowledge file, or records from a connected app (CRM deals, invoices, ads spend, tickets).

## Path

1. **Find the tables.** `listTables` lists what can be queried across uploads, knowledge files and connected-app data, with each table's columns. If it is not in the tool list, find it with `getToolDetails` (`query: "list tables"`) and call it through `runTool`. A file attached to the current message is a table too.
2. **Ask by code, over every row.** `queryTable` answers a question in plain words by running code on the whole table, never on a sample: filters, group-bys, totals, top-N, dates. For two sources (spend in one, deals in another), name both and the key that joins them (an id, an email, a campaign name, a month) in one question.
3. **Totals only:** `sumTable` adds up a column of one file.
4. **Answer with the number and where it came from**: the table names, the filter, the period, how many rows were used. Rows that did not match the join key are a finding: report how many.

## Rules

- Never compute a figure in your head from passages or a preview: run the query.
- Never invent a number. If no table holds it, say which table would and how the member can add it (upload the file, or connect the app as a document source).
- Check the column names `listTables` returned before asking; say which column you used for an ambiguous one (`amount` vs `amount_brl`).
- A number from the graph (`searchOntology`) and a number from a table can differ: report both with their dates and sources.
- Save the result only when the member wants it kept: `ingestDocument` with the question, the method, the number and the sources.
