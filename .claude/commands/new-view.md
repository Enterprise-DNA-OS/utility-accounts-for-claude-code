---
description: "Add a read-only page from a question"
---

# Add a read-only page from a question

Read CLAUDE.md. Use only records returned by the CLI. Do not infer a supply status from an account record.

Write a read-only query answering the operator's question. Test it against their records. Add an entry to `views.json`, following the existing sections. A new database view uses a new migration with `security_invoker=true` and restricted grants. Run `npm run view -- <name>`, inspect the rendered file and compare its totals with the source query. No forms or mutation controls.
