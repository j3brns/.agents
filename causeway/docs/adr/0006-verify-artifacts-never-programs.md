# ADR-0006: Layered deterministic verification — verify artifacts, never programs

- Status: accepted (2026-06-12) · Spec: §6, §14.1 · Decision log: D6 (+ halting analysis)

## Context
Agent behaviour is stochastic and "verify what the agent/skill generated" is, in
general, undecidable (Rice's theorem). Gates must nevertheless produce reproducible
verdicts: same inputs → same verdict.

## Decision
Three layers, each judging a finite artifact against decidable predicates:
1. **Contracts & policy** (S1+ blocking): tool/MCP schema checks; Cedar policy unit
   tests; OPA/conftest + cdk-nag over rendered IaC plans → signed policy-assertion-report.
2. **Record/replay** (S1+ blocking): OTel-captured cassettes replayed with the model
   stubbed — harness logic tested bit-exact.
3. **Thresholded live evals** (S2/S3 gates): AgentCore evaluators, pinned model and
   params, N trials vs fixed thresholds and the unit's own recorded baseline.
No gate ever claims to verify program correctness in general; every control-plane wait
is deadline-bounded.

## Consequences
Verdicts are auditable and replayable. Eval flakiness is managed by trials+thresholds
and baseline-relative gates. Cassette refreshes are reviewed changes.
