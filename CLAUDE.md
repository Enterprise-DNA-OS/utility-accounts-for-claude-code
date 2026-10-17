# Utility Accounts for Claude Code

For a commercial utility account service team. The database holds service locations, agreements, meter-register observations, cases, move requests and notes. All demo businesses and identifiers are fictional.

## Working rules

Read the current records before answering. Use the command below for every recurring job. Never invent an identifier, meter reading, agreement, response or approval. Ambiguous names require choosing from the candidates. Include the operator's name through `--actor` when recording changes.

This is a private operator database, one business per database. Use the database owner connection locally or a reviewed server operator role. Do not expose credentials or records through a browser API. Review rendered files before sharing them. Export before schema changes.

Drafts stay in `drafts/`. Nothing sends. No payments, billing calculation, tariff advice, live meter control, supply switching or disconnection actions exist. Confirming a move records external evidence only. Compliance findings prompt human review and do not certify compliance. Never delete data without explicit operator authority.

## Routing

| Request | Command |
|---|---|
| Review the commercial account register | `/accounts` |
| Review service locations and identifiers | `/service-points` |
| Review all agreement dates | `/agreements` |
| Review notice windows and expired agreements | `/renewals-due` |
| Review cumulative register history and interval usage | `/meter-reads` |
| Review missing, old, estimated and high readings | `/reading-exceptions` |
| Review open responses by owner and due date | `/case-queue` |
| Review move requests needing confirmation | `/move-desk` |
| Review the combined exceptions list | `/attention` |
| Review accuracy, retention and internal service exceptions | `/compliance` |
| Write the Monday utility service review | `/weekly-review` |
| Answer ten cross-record questions | `/insights` |
| Read an account with its service points, cases and notes | `/account` |
| Add a verified account, service point, agreement, meter, case or move | `/add` |
| Record a cumulative meter reading with its evidence | `/record-reading` |
| Record a case resolution | `/resolve-case` |
| Record a verified contact accuracy review | `/review-account` |
| Record an externally confirmed move request | `/confirm-move` |
| Log an account note | `/log` |
| Draft the weekly service review | `/draft-weekly-review` |
| Draft an agreement review brief | `/draft-renewal` |
| Draft a case response fact pack | `/draft-case-response` |
| Import Salesforce Details Only report exports | `/import` |
| Export all records and audit history to JSON | `/export` |
| Review the latest hundred recorded changes | `/history` |
| Render three read-only branded review pages | `/view` |
| Render account, case and renewal paperwork | `/documents` |
| Change fields, workflow rules or documents in plain language | `/customise` |
| Add a read-only page from a question | `/new-view` |

## Files

`scripts/utility.mjs` is the CLI. `scripts/lib/domain.mjs` holds the domain queries and mutations. `scripts/lib/import.mjs` is the CSV importer. `supabase/migrations/` contains plain database migrations. `DATABASE_URL` selects shared Postgres; without it PGlite uses `.data/db`. `views.json` and `documents.json` define branded output. `docs/cli.md` documents record formats. All runtimes use `.claude/commands/`.

Built by Enterprise DNA. Installation and ongoing operation: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=salesforce-energy-utilities-cloud
