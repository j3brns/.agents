# ADR-0026: Cost caps — hard and ISB-enforced in the sandbox, advisory + FinOps in pre-prod

- Status: accepted (2026-06-13) · Refines: ADR-0008 · Spec: §3.1 · Decision log: D31

## Context
Delegating two-key authority to crews (ADR-0024) is only safe if the financial blast radius
is bounded by construction — otherwise self-assertion plus a mistake is an unbounded bill.
The stakeholder: "cost caps are vital — for the ISB side"; and "advisory for the pre-prod
side, FinOps process applies".

## Decision
**Sandbox (S0–S2, ISB leases): hard, non-negotiable — ISB-tracked, Causeway-terminated.**
Validated ISB behaviour: `maxSpend` is tracked via Cost Explorer and `budgetThresholds` take
exactly two native actions — **`ALERT`** or **`FREEZE_ACCOUNT`**; there is **no native
terminate-at-threshold**, and **`FREEZE_ACCOUNT` does not stop already-running spend**. So
the hard cap is composed: **ISB budget tracking + `FREEZE_ACCOUNT` (native) + a Causeway
control-project `POST /leases/{id}/terminate` at the configured ceiling** (→ harvest → nuke,
ADR-0008), which actually stops spend. Two designed-around consequences: (a) because freeze
≠ spend-stop, the **ceiling action must be terminate, owned by the control project**; (b)
because Cost Explorer lags, thresholds must leave **headroom** below the true ceiling.
Together these bound a self-asserting crew's blast radius by construction. The adjudicator
governs within-cap *trajectory* (routing increases to crew two-key concurrence); the hard
ceiling is structural and not self-assertable. The sandbox cost cap is a floor item.
Attribution matters: claiming "ISB-enforced terminate" would be false — it is Causeway's.

**Pre-prod (S3, governed account): advisory + FinOps.** Once the workload leaves the pool it
is not disposable; a hard freeze would be a self-inflicted outage. Cost governance reverts to
the **organization's existing FinOps process** (budgets, anomaly detection, showback/
chargeback, commitment management); Causeway contributes *advisory* cost evidence on the
certificate, not a kill switch.

## Consequences
Hard-cap the experiments; FinOps-govern the workload. The cost regime changes exactly at the
pool boundary, matching disposability. Requires the lease-template ceiling action to be
`terminate` (not just freeze) and threshold headroom tuned to Cost Explorer latency — both
captured as lease-template configuration, candidates for a calibration spike.
