---
description: "Review accuracy, retention and internal service exceptions"
---

# Review accuracy, retention and internal service exceptions

Read CLAUDE.md. Use only records returned by the CLI. Do not infer a supply status from an account record.

Run `npm run utility -- compliance --json`. Resolve placeholders from the operator's request, never invent them. Use source IDs when a name matches more than one record.

Present the result in plain words with the record reference and dates. Say when the result is empty.

Read `docs/compliance.md`. Report rule ID, source and finding. A finding is a review prompt, not proof of a breach. The annual contact review, 35-day reading window and case response dates are operator policies. Do not authorise disconnections or claim regulatory certification.
