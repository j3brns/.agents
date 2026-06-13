# ADR-0027: The cost cap is a lagging backstop; the real-time ceiling is preventive

- Status: accepted (2026-06-13) · Supersedes the "hard by construction" framing of ADR-0026 · Spec: §3.1 · Decision log: D32 · Spike: S0-5

## Context
Direct challenge: "do the cost caps really work?" Validated ISB behaviour says the honest
answer is *not as a real-time hard ceiling*, and ADR-0026's "hard by construction" wording
overstated it. Three facts: (1) ISB tracks spend via **Cost Explorer, which lags hours**, so
spend overshoots before any threshold fires; (2) **`FREEZE_ACCOUNT` does not stop running
resources**; (3) the real stop — Causeway-driven **terminate → AWS Nuke** — takes time to
delete resources, which keep billing during teardown. So the budget threshold is a
**detective, lagging** control, not a real-time cap.

## Decision
Reframe cost control as **defence in depth**, honestly labelled:
1. **Preventive ceiling (real-time, the actual hard limit).** You cannot overspend on what
   you cannot launch. The **SCP tier denies the expensive vectors up front** — costly
   instance families/sizes, expensive services, non-approved regions, concurrency — and for
   the **agentic token vector** (the dominant cost here), **Bedrock/AgentCore controls**:
   max output tokens, application-inference-profile budgets / provisioned-throughput caps,
   Gateway tool-call rate limits, Runtime session timeouts, Cedar call limits. These are
   preventive, real-time, and live in estates we own (SCP subtree + AgentCore).
2. **Lagging backstop (catch-all).** The ISB lease `maxSpend` + `budgetThresholds` →
   `FREEZE_ACCOUNT`, plus the Causeway control-project **terminate at the ceiling**, catches
   whatever the preventive controls didn't anticipate. It bounds total spend to
   **`maxSpend` + overshoot**, where `overshoot ≈ (cost-data latency + freeze→terminate→nuke
   duration) × burn rate`.
3. **Keep `maxSpend` small per stage** (S0 $50 / S1 $250 / S2 $500) so the *absolute*
   overshoot stays small regardless of burn rate.
"Bounded by construction" replaces "hard by construction": the budget alone is soft and
lagging; the *real-time* hardness comes from the preventive layer.

## Consequences
The **permission wall is reclassified as a primary cost control**, and AgentCore/Bedrock
token & rate caps become part of the stage bootstrap (E2), not an afterthought. New **Spike
S0-5** measures real overshoot (deliberately burn a small lease; record $ over `maxSpend` at
terminate) and the terminate-automation latency. The deck/PRFAQ cost claims are softened to
match. Pre-prod (S3) is unchanged: advisory + FinOps.
