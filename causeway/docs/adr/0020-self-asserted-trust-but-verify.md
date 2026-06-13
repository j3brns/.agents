# ADR-0020: Self-asserted, trust-but-verify governance with adjudicated four-eyes

- Status: accepted (2026-06-13) · Refines: ADR-0006 (floor row), ADR-0014 · Spec: §2.5, §14.1 · Decision log: D25

## Context
The prior model implied a synchronous verifier gate at every promotion. Most changes
carry no real risk, so universal gating over-taxes the common case and pushes teams to
eject from governance. The stakeholder directive: "inner loop unless an agent adjudicates
risk or commercial and cost exposure" — move authority toward self-assertion, trust but
verify, two pairs of eyes only on elevation.

## Decision
**Self-assertion buys motion, not the stamp.** A stage transition is asserted by the
one-line `causeway.yml` change. An **adjudicator** (ADR-0021) classifies the change; the
outcome routes one of two ways:
- `self-assertable` → the promotion proceeds **provisionally**; the verifier runs
  **asynchronously**; on evidence failure the certificate is **revoked and the unit
  frozen** (trust-but-verify-with-revocation).
- `four-eyes-required` → the promotion **blocks** on both the routed second approval
  (risk → security CODEOWNERS; cost → BU budget owner) and the verifier, before a
  certificate issues. S2→S3 is always four-eyes.

**Floor reconciliation (replacement mechanism, not a weakening):** the floor property
"promotion = verified evidence, not opinion" is preserved because a *durable* certificate
(ADR-0022) still requires the verifier to pass. Self-assertion relocates *when* the block
falls (after, with revocation) for low-risk transitions only; it never removes the
evidence requirement. The floor row is refined accordingly, and two new floor rows are
added (self-assertion is provisional/revocable; the adjudicator is fail-safe/monotonic).

## Consequences
The inner loop runs at sandbox speed for the common case. Authority becomes
self-asserted-and-earned: the right to self-assert is granted by attestation history and
revoked by failure. New machinery to build (E10): the adjudicator, conditional approval
routing, certificate issue/revocation, async-verify-with-revocation. New failure mode:
a revoked provisional promotion must freeze cleanly — covered by the existing freeze API.
