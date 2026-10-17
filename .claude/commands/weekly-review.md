---
description: "Write the Monday utility service review"
---

# Write the Monday utility service review

Read CLAUDE.md. Use only records returned by the CLI. Do not infer a supply status from an account record.

Run `npm run utility -- weekly-review --json`. Resolve placeholders from the operator's request, never invent them. Use source IDs when a name matches more than one record.

Present the result in plain words with the record reference and dates. Say when the result is empty.

Build the review from attention, renewals-due, case-queue and move-desk, all included in the result. Group decisions by owner. Separate expired agreements, upcoming notice windows, reading investigations and overdue responses. Finish with facts still needed, without sending anything.
