---
description: "Add a verified account, service point, agreement, meter, case or move"
---

# Add a verified account, service point, agreement, meter, case or move

Read CLAUDE.md. Use only records returned by the CLI. Do not infer a supply status from an account record.

Run `npm run utility -- add <entity> --file=<record.json> --json`. Resolve placeholders from the operator's request, never invent them. Use source IDs when a name matches more than one record.

Present the result in plain words with the record reference and dates. Say when the result is empty.

Use `docs/cli.md` for the accepted fields. Write the confirmed record to a temporary JSON file under `imports/`. Run a read first. Keep original source identifiers. Include `--actor=<operator>` and show the changed record after writing. Do not invent a meter value, agreement date or evidence reference.
