# Move commercial account records from Salesforce Energy & Utilities Cloud

## Export the actual reports

Salesforce documents report exports as Details Only CSV. Select Export on the report, choose Details Only, CSV and UTF-8. You need report export permission. [Salesforce export help](https://help.salesforce.com/s/articleView?id=sf.reports_export.htm&language=en_US) and [official worked example](https://trailhead.salesforce.com/content/learn/projects/create-reports-and-dashboards-for-sales-and-marketing-managers/manage-reported-data), checked 17 October 2026.

There is no single Salesforce report layout shared by every utility. Select reports containing accounts, service points, agreements, meters, reading history, cases and move requests. Use stable record IDs and the related parent record ID in each report, not parent names. Export report detail rows, without grouping or totals. If a meter history lives in another system, export it from there and map its columns rather than pretending Salesforce contains it.

Place the files in a private directory with these names:

| File | Required core columns | Parent |
|---|---|---|
| accounts.csv | Account ID, Account Name, Account Owner, Retention Review On | None |
| service_points.csv | Service Point ID, Account ID, Service Point Name, Service Point Number, Address, Commodity, Region | Account ID |
| agreements.csv | Agreement ID, Service Point ID, Agreement Name, Start Date, End Date | Service Point ID |
| meters.csv | Meter ID, Service Point ID, Meter Name, Serial Number, Unit, Daily Limit | Service Point ID |
| readings.csv | Reading ID, Meter ID, Read Date, Register Value, Reading Type, Evidence | Meter ID |
| cases.csv | Case ID, Service Point ID, Subject, Category, Case Owner, Opened Date, Due Date | Service Point ID |
| moves.csv | Move ID, Service Point ID, Move Name, Move Date, Direction | Service Point ID |

The examples are authored fixtures demonstrating the documented CSV mechanism, not a downloaded customer export. `docs/cli.md` lists supported values. Use dates in YYYY-MM-DD, plain decimal numbers without currency symbols, and booleans true or false. Reports with other labels use `--mapping=path/to/mapping.json`: an object keyed by entity, with exported header to destination field mappings. The sample mapping demonstrates Organisation to name. Unknown columns are listed in the preview and ignored; review them before proceeding. Custom Salesforce statuses must be mapped to the documented destination values in a private copy of the export. Missing operational fields such as notice days and retention review dates must come from your agreements and policies, never a guess.

## Import in one command

On a fresh database run `npm run migrate`, without demo seed. Then:

```bash
npm run utility -- import salesforce /path/to/export-folder --dry-run --json
npm run utility -- import salesforce /path/to/export-folder --json
```

Add `--mapping=/path/to/mapping.json` if your headers differ. All files are applied in dependency order inside one transaction. The dry run executes the same validations and rolls back. Missing parents, duplicate IDs, conflicting readings and overlapping agreements stop the entire import. An unchanged repeated export adds nothing. A changed source row stops for explicit reconciliation instead of overwriting local work. Partial imports work when parent records already exist. Keep the original files privately.

## Reconcile before switching work

Compare counts against the source reports. Check several accounts with multiple sites, expiry dates, oldest reading dates, open cases and currency-separated disputed amounts. Run `/attention`, `/insights`, `/compliance`, and render an account review. Obtain the operator's acceptance before relying on imported records. A day is a practical setup target for clean reports, not a promise for unmapped or incomplete history.

Attachments, workflow automations, portal identities, billing calculations, tariff catalogues, live telemetry, external integrations and regulated supply processes are not imported. Historical account notes need explicit mapping into notes; they do not silently transfer. Keep original evidence accessible under your retention policy. Enterprise DNA can scope a custom connection or a team view around these records.

`npm run utility -- export` writes all base records and audit history to `exports/` as JSON, including internal IDs and original source IDs. It is an archival export, not a built-in disaster-recovery restore command. Use normal database backups as well.
