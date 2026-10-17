---
description: "Review move requests needing confirmation"
---

# Review move requests needing confirmation

Read CLAUDE.md. Use only records returned by the CLI. Do not infer a supply status from an account record.

Run `npm run utility -- move-desk --json`. Resolve placeholders from the operator's request, never invent them. Use source IDs when a name matches more than one record.

Present the result in plain words with the record reference and dates. Say when the result is empty.
