---
description: "Record a verified contact accuracy review"
---

# Record a verified contact accuracy review

Read CLAUDE.md. Use only records returned by the CLI. Do not infer a supply status from an account record.

Run `npm run utility -- review-account <reference> --email=<email> --json`. Resolve placeholders from the operator's request, never invent them. Use source IDs when a name matches more than one record.

Present the result in plain words with the record reference and dates. Say when the result is empty.

Read the affected record first. Confirm the operator supplied the outcome and evidence. Add `--actor=<operator>` to the command. Confirm-move records an outcome in another system; it never changes a supply, submits a switch or instructs a technician.
