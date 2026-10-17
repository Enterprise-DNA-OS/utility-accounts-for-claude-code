# CLI reference

Run `npm run utility -- help`. Reads return aligned text by default and `--json` for automation. Records resolve by exact source ID, UUID, case-insensitive exact name, then UUID prefix or name substring. Ambiguity lists candidates and exits 1. Use exact identifiers for writes.

## Data fields

`add <entity> --file=record.json` accepts the fields in `scripts/lib/domain.mjs` entities. `source_id` is required and unique within an entity. Foreign-key fields accept a parent source ID, UUID or unambiguous name for manual additions. Imports require exact parent IDs. Metadata IDs, timestamps and audit events are database-generated and cannot be supplied by add.

| Entity | Required fields besides source_id | Optional/defaults |
|---|---|---|
| accounts | name, owner, retention_review_on | contact_email, reviewed_on, archived=false |
| service_points | account_id, name, identifier, address, commodity, region | status=active |
| agreements | point_id, name, start_on, end_on | notice_days=30, annual_kwh, status=active |
| meters | point_id, name, serial, unit, daily_limit | active=true |
| readings | meter_id, read_on, value, kind, evidence | None |
| cases | point_id, name, category, owner, opened_on, due_on | status=open, disputed_amount=0, currency=NZD, resolution, closed_on |
| moves | point_id, name, move_on, direction | status=pending, confirmation |
| notes | account_id, body, author | None |

Commodity: electricity, gas, water. Units: kWh or m3. Reading kind: actual or estimated. Agreement status: active, superseded, closed. Site status: active or closed. Case category: billing-query, meter-query, complaint, account-query. Case status: open, waiting, closed. Move direction: move-in or move-out. Move status: pending, confirmed, cancelled. Currency: NZD, AUD, USD. Dates must be real ISO calendar dates. Values must be finite decimal numbers, cumulative meter values cannot be negative or reverse history. Each physical register or replacement meter has a separate meter record.

## Example writes

```bash
npm run utility -- add accounts --file=imports/account.json --actor=Alex
npm run utility -- record-reading --file=imports/reading.json --actor=Alex
npm run utility -- resolve-case CASE-001 --resolution="Checked against the signed agreement" --actor=Alex
npm run utility -- review-account ACC-001 --email=operations@example.test --actor=Alex
npm run utility -- confirm-move MOVE-001 --evidence="External case reference 123" --actor=Alex
npm run utility -- log ACC-001 --text="Owner confirmed the contact details" --actor=Alex
```

For drafts use draft-weekly-review, draft-renewal AGR-001 or draft-case-response CASE-001. Files are written to drafts and never sent. Export writes an archive under exports. OUTPUT_DIR redirects generated artefacts for tests and demos. Only import accepts --dry-run.

The fixed internal cadence values are documented in compliance.md. Use /customise to change them in a new migration and update the tests. Do not directly edit an applied migration. This CLI intentionally has no generic delete, supply switch, email sender, payment or arbitrary query command.
