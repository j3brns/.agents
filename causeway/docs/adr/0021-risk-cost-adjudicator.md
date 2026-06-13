# ADR-0021: The risk & cost adjudicator is a fail-safe, monotonic skill

- Status: accepted (2026-06-13) · Spec: §2.5 · Skill: .kiro/specs/risk-cost-adjudicator/ · Decision log: D26

## Context
Self-assertion (ADR-0020) is only safe if something trustworthy decides which transitions
may self-assert and which need four-eyes. That "something" is an agent — but an agent that
rations ceremony must not itself become the hole through which risk passes.

## Decision
A catalog skill (reusing the verifier plumbing, ADR-0012) classifies each change on two
axes — **risk** (IAM/permission, off-catalog resource types, network/egress, data class,
non-allowlisted model, blast radius) and **commercial/cost** (spend projection vs. budget
trajectory, licensing, egress cost, quota). Two-tier, with a hard safety property:
- **Trip-wire layer** — versioned OPA/conftest policy packs over the rendered plan and
  manifest diff; deterministic; unit-tested; authoritative.
- **Reasoning layer** — a pinned-model evaluator that may *add* escalations with
  rationale but is structurally barred from clearing a fired trip-wire.
- **Final verdict = OR of both layers.** Ambiguous/incomplete input ⇒ `four-eyes-required`
  (fail safe). S2→S3 ⇒ `four-eyes-required` unconditionally.
The verdict, reasons, pack version, and inputs digest are recorded as an evidence item and
rendered on the certificate — the adjudicator is itself audited. Binding verdict mints on
a platform runner; `causeway verify --adjudicate` previews locally (ADR-0016).

## Consequences
Ceremony is rationed deterministically where it can be and conservatively where it can't.
The reasoning layer can improve recall without ever lowering the safety floor. Trip-wire
packs ride the catalog release train; tuning them is a reviewed, versioned change.
