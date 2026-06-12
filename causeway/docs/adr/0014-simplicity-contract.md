# ADR-0014: The simplicity contract — one file, two operated things, and a "no simpler" floor

- Status: accepted (2026-06-12) · Spec: §2.4, §4.1, §14 · Decision log: D16, D17, D18

## Context
Platform adoption dies from surface area: developers won't learn a second system;
operators drown in services. But simplification has a failure mode of its own —
optimising away the mechanisms that carry the guarantees.

## Decision
Developer surface: exactly one editable file (causeway.yml) and three interactions
(start via issue form; build via push; promote via one-line stage MR). Operator
surface: exactly two operated things — the trigger-driven control project (no service,
no database; ISB and GitLab are the systems of record) and the catalog monorepo on a
single release train (upgrade = cut release N; rollback = re-pin N−1); four on-call
alarms. A codified floor (Spec §14.1) lists the irreducibles — stages, verifier, digest
pinning, lineage, harvest-before-nuke, pinned-model evals, the CCoE boundary, bounded
waits / artifact-not-program verification — each with the tempting simplification and
why it fails.

## Consequences
Backlog items that would create a third operated thing or a second developer file are
rejected by construction. Simplification proposals touching the floor need a
replacement mechanism, not a deletion.
