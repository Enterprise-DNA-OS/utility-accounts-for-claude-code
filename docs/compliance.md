# Record checks and their sources

Checked 17 October 2026. This build supports commercial account administration. It is not a retail billing, regulated supply-control or disconnection system. The operator retains responsibility for industry obligations. No automated action changes a supply.

| Rule | What the check finds | Basis |
|---|---|---|
| ACC-01 | Missing contact address or no accuracy review in 365 days | NZ Privacy Act 2020 principle 8: reasonable steps to ensure personal information is accurate before use. The 365-day cadence is a demo operator policy, not a statutory deadline. |
| RET-01 | The operator's retention review date has passed | NZ Privacy Act 2020 principle 9: do not retain personal information longer than needed for a lawful purpose. The date is set by the operator. The check never deletes records. |
| OPS-01 | A case has passed its recorded response due date | The team's service promise, not a legal deadline. |
| OPS-02 | Missing, estimated, stale or unusually high meter-register observations | Internal data-quality review. 35 days and each meter's daily limit are demo settings, not statutory limits. |

Sources: [NZ Privacy Commissioner, principle 8](https://www.privacy.org.nz/privacy-principles/8/) and [principle 9](https://www.privacy.org.nz/privacy-principles/9/).

## Operator policies

Configure notice_days from the signed agreement, never from a presumed universal energy rule. Agreement notice windows are computed from those fields. A recorded expired agreement is not evidence of a disconnected supply. Do not send a renewal offer from it.

Meter readings are cumulative registers. A replacement meter must have its own record; readings may not reverse previous values. Estimated intervals are provisional. Consumption quantities keep kWh and m3 separate and are not invoice quantities or tariffs. Case disputed amounts stay separated by currency and are not receivables balances.

Response due dates are entered by the operator. Cases cannot close without resolution text and a closure date. Move confirmation needs an external evidence reference and only records what another authorised process has confirmed. No medical dependency or residential disconnection workflow is implemented. A utility needing those functions keeps its approved operational systems.

## Scope and security

The privacy checks apply to NZ personal information where the Act applies. Australian teams must configure their own retention and accuracy policies following the rules applicable to them. Passing these checks does not certify compliance in either country.

Every domain table uses RLS with no public policies. Invoker views preserve caller privileges. The migration revokes API role grants if those roles exist. Use a private database owner connection for the supplied CLI. Shared roles, tenant isolation, backup retention and access reviews require deployment configuration. The audit log records before and after values and an operator label. A database owner can change it; it is not a tamper-proof regulatory archive. Audit records, exports and generated documents require the same retention and access controls as source records.
