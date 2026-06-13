# ADR-0024: Authority delegated to qualified crews; the two-person (launch-code) rule

- Status: accepted (2026-06-13) · Refines: ADR-0020, ADR-0021 · Spec: §2.5 · Decision log: D29

## Context
ADR-0020 routed `four-eyes-required` elevation to "security CODEOWNERS / BU budget owner"
— an out-of-band, shore-based approver. That re-imports the exact continuous-approval
committee the model exists to eliminate, and contradicts the promise of fast, permissive,
self-asserted access. The stakeholder correction: revert delegation to the **builders** —
qualified crews — and model the control on a nuclear submarine's launch codes: two
authorized actors concur, one may be an agent.

## Decision
Authority is **delegated to qualified crews**. A crew holds a **qualification** that
defines its risk/cost **envelope** per stage/class. When the adjudicator (ADR-0021)
returns `two-keys-required`, the control is the **two-person rule**:
- **Two authorized actors concur.** Both hold qualification ≥ the action's class; both are
  **inside the crew's delegated envelope**.
- **At most one key may be an agent** (never two — the human floor). An attesting agent
  (e.g. the adjudicator) may hold the second key when it has standing for the class.
- **At least one concurrence is independent of the author** (no self-approval; for the
  highest classes, both keys must be non-authors).
- **Out-of-band escalation is the exception**, firing only when the action **exceeds the
  crew's qualified envelope** — a class they don't hold, or cost beyond their authority
  (and the cost ceiling is itself structurally capped, ADR-0026).
A certificate (ADR-0022) issues only when the verifier passes **and** both concurrences
are present. S2→S3 always requires two keys, with policy able to require both human.

## Consequences
The second pair of eyes lives *in the boat*, not on shore — the "no continuous out-of-band
approvals" promise becomes real. Crews can be trusted with two-key authority precisely
because they operate inside a hard-walled box (OU/SCP ratchet ADR-0025; cost caps
ADR-0026). New machinery: qualification/standing model, concurrence as GitLab approval
rules keyed to qualification (not to a central group), agent-as-key-holder credentials.
Floor updated: the two-person rule and the ≤-one-agent-key invariant are now floor rows.
