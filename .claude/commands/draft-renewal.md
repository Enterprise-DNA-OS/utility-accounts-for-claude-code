---
description: "Draft an agreement review brief"
---

# Draft an agreement review brief

Read CLAUDE.md. Use only records returned by the CLI. Do not infer a supply status from an account record.

Run `npm run utility -- draft-renewal <agreement> --json`. Resolve placeholders from the operator's request, never invent them. Use source IDs when a name matches more than one record.

Present the result in plain words with the record reference and dates. Say when the result is empty.

Open the returned file in `drafts/` and verify every statement against the records. Keep it labelled DRAFT. Never send, quote a new tariff, promise a resolution or assert that supply was changed.
