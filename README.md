# Utility Accounts for Claude Code

Commercial utility account operations in a database you own. Built by Enterprise DNA. Free under the MIT licence. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Clone it, run the demo, import your reports. | Your fields, agreement rules, report mappings and team views. | Installed, connected and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=salesforce-energy-utilities-cloud&utm_medium=readme) | [Talk to Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=salesforce-energy-utilities-cloud&utm_medium=readme) |

## What it does

A commercial service team reviews agreement dates, investigates meter readings, follows up cases and confirms move records. This system links those records by account and service point. Ask which renewals also have unresolved cases, which sites have estimated readings and billing questions, and who owns the overdue responses.

Salesforce Energy & Utilities Cloud Service Core lists US$250 per user/month billed annually. Twenty-five seats model US$75,000 a year before implementation. That is a list-price calculation, not a verified customer invoice. [Official pricing](https://www.salesforce.com/ap/energy-utilities/cloud/pricing/), checked 17 October 2026. See [research](docs/research.md) for selection evidence and limits.

This base covers commercial account record work. It does not replace a utility billing engine, calculate tariffs, move money, control meters, decide disconnections or perform regulated supply switching. It needs no third-party connection to run. Read the [scope](docs/why-no-front-end.md) before choosing it.

## Quick start

```bash
git clone https://github.com/Enterprise-DNA-OS/utility-accounts-for-claude-code.git
cd utility-accounts-for-claude-code
npm install
npm test
npm run demo
```

The demo creates and removes a temporary database. For a persistent fictional portfolio run `npm run migrate` then `npm run seed`. Open the folder in your coding agent and ask `/weekly-review`. To start with real records run migrate without seed, then use `/import`.

Node 20.11 or later. No database install is needed: PGlite runs the same database engine locally. Set DATABASE_URL to your private Postgres database for shared operator use. The supplied adapter verifies TLS for remote connections. Do not expose the database through a public API. Configure roles and backups before multi-user operation.

## Commands

| Job | Command |
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

Every read supports `--json`. See [CLI formats](docs/cli.md). Additions and outcomes are audited with an operator label. Repeating the demo seed does not duplicate records.

## Ten questions answered from your records

See `/insights` for the tested answers to all ten. These combine records beyond a single standard list; no claim is made that Salesforce cannot be configured to answer them.

1. Which expiring agreements also have unresolved service cases?
2. Which sites combine estimated readings with billing questions?
3. Which account owners have the most overdue responses?
4. Which active service points have no agreement covering today?
5. Which meters exceed their site limit on the latest interval?
6. Which upcoming moves still have open cases?
7. Which multi-site accounts need a contact accuracy review?
8. What disputed amounts remain open, separated by currency?
9. Which meters have no actual reading within the last 35 days?
10. Which account retention reviews are overdue alongside open cases?

## Your first hour: ten things to ask for

1. Show me the agreements whose notice window has opened.
2. Which of those sites also has an unresolved case?
3. Show me every estimated or stale reading.
4. Explain the Freezer main usage jump from the actual register history.
5. Who owns the overdue response on the Workshop complaint?
6. Draft a fact pack for that case without promising a resolution.
7. Which move requests need confirmation this week?
8. Put our business name and logo on the account review.
9. Import our Details Only reports as a dry run and show ignored columns.
10. Add our agreement review owner field and include it in the renewal brief.

## Views and paperwork

`npm run view` renders this week, agreement dates and reading review as read-only branded HTML. `npm run docs` renders an account review per account, a case fact pack per case and a renewal brief per active agreement. Edit `brand.json` for name, colours and logo. Print the HTML to PDF if needed. The files remain private until an authorised person shares them.

`/draft-weekly-review`, `/draft-renewal` and `/draft-case-response` create editable drafts with current facts. Nothing sends. `/customise` changes fields or rules through a migration; `/new-view` adds a read-only review page.

## Bring your history

[Switch guide](docs/replace-salesforce-energy-utilities-cloud.md). Export Details Only reports, map custom labels, then run `npm run utility -- import salesforce <folder> --dry-run`. After reviewing counts, repeat without the dry-run flag. One command imports all supported files in dependency order. Unchanged reruns add nothing; changed rows stop rather than overwriting operator work. The examples show the required report columns, not a universal Salesforce template.

## Checks and boundaries

[Compliance](docs/compliance.md) cites NZ accuracy and retention principles and separates them from internal service policies. A 35-day reading alert is an operator threshold, not law. Checks prompt a human review; they do not certify compliance. No supply-control or residential medical-dependency process is implemented.

Every domain table has RLS, no public policies and restricted grants. Views use caller permissions. One business uses one private database. The database owner is trusted; audit history is not a tamper-proof regulatory archive. Secure drafts, exports and backups like the source data.

## Verification

`npm test` creates a temporary database, migrates and seeds twice, runs every read, checks all ten insights, exercises mutations, validates ambiguous matches, rejects reversed readings and overlapping agreements, tests import rollback and repeat behaviour, verifies RLS and renders all documents and views. `npm run demo` runs three real reviews and renders output in temporary storage. CI runs the suite on Linux and Windows with Node 20 and 22. CI execution status is separate from local test results.

## Licence

MIT. Copyright 2026 Enterprise DNA. Salesforce is a trademark of Salesforce, Inc. This independent project is not affiliated with or endorsed by Salesforce.
