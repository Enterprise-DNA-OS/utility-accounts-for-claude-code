---
description: "Change fields, workflow rules or documents in plain language"
---

# Change fields, workflow rules or documents in plain language

Read CLAUDE.md. Use only records returned by the CLI. Do not infer a supply status from an account record.

Translate the request into a bounded change. Read the current migration, CLI, import mapping, tests and affected document specs. Describe what will change, including existing records.

Add the next numbered migration under `supabase/migrations/`, never edit an applied migration. Use reversible additions where possible. Keep UUID keys, updated_at triggers, audit events, RLS and invoker views. Add the field to the CLI allowlist and export/import mapping if required. Add a meaningful regression test for the changed behaviour.

Run `npm test` before applying to working data. Make a private export first, then `npm run migrate`. Run the affected command, regenerate any document and show the result. Never change supply, delete history, or connect a live service without explicit operator authority.
