---
description: "Import Salesforce Details Only report exports"
---

# Import Salesforce Details Only report exports

Read CLAUDE.md. Use only records returned by the CLI. Do not infer a supply status from an account record.

Run `npm run utility -- import salesforce <folder> --dry-run --json`. Resolve placeholders from the operator's request, never invent them. Use source IDs when a name matches more than one record.

Present the result in plain words with the record reference and dates. Say when the result is empty.

Read `docs/replace-salesforce-energy-utilities-cloud.md`. Inspect each report header. Use `--mapping=<file>` for custom report labels. Review ignored columns and changed-row errors. Run without `--dry-run` only after the operator has checked the preview. Compare imported counts, spot-check linked records and retain the original exports privately.
