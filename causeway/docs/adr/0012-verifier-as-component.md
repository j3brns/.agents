# ADR-0012: Evidence verifier is a catalog component + CLI, not a service

- Status: accepted (2026-06-12) · Spec: §4.1, §14.1 · Decision log: D14

## Context
Promotion gates need a deterministic checker of the evidence ledger (signatures,
digests, thresholds, lineage). A standing service offers a central audit log but is one
more thing to run, patch, and secure — violating the two-operated-things budget.

## Decision
The verifier ships in the catalog monorepo as a versioned component wrapping a small
CLI, runs inside the promotion pipeline, and records its verdict as a signed pipeline
artifact. Green verifier = MR approvable; humans intervene only on policy-defined
exceptions. Extract to a service only if external auditors require an API.

## Consequences
Nothing new to operate; verifier version is pinned by the release train, so verdicts
are reproducible against a known rule set. Verifier failure at an approved gate is one
of the four on-call alarms.
