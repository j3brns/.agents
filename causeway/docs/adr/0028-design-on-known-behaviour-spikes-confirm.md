# ADR-0028: Design on known behaviour; spikes confirm or calibrate, not discover

- Status: accepted (2026-06-13) · Spec: §4.4, §4.5, SPIKES.md · Decision log: D33

## Context
Critique: too much that is designable from *known/validated* behaviour was being deferred
to spikes — using "we'll spike it" as a way to defer design. The §4.5 coherence map already
gives a solid validated-behaviour base; most "risks" were really design decisions in
disguise.

## Decision
For any open question, **design the answer first from validated behaviour** (ISB source/
OpenAPI per §4.5, AgentCore/GitLab docs, or our own design properties). A spike is justified
**only** for (a) a genuinely unknown *external* behaviour, or (b) a *magnitude to calibrate*
— and every spike must state the **designed answer it is confirming** plus the fallback.
Spikes are **confirmations/calibrations, never design-blockers**; the roadmap proceeds on
designed answers while confirmations run in parallel. Reclassified register (SPIKES.md):
- **Designed now (known behaviour):** continuous harvest removes the cleanup-hold dependency
  (ADR-0029); the account-level SCP ratchet is orthogonal to ISB's OU-based drift, so it is
  the designed primary; preventive cost controls (SCP service/instance denials + AgentCore
  token/rate caps) are designed now (ADR-0027); verifier reproducibility is our own design
  property (pin versions, hash inputs) — a build-acceptance test, not an external unknown.
- **Confirm (narrow external unknown):** ISB API auth path for an automation principal;
  that ISB drift does not also watch account-level SCP attachments (expected: it doesn't).
- **Calibrate (magnitude):** real cost overshoot at the S0 budget.

## Consequences
Fewer load-bearing unknowns; the design states its answers with their known-behaviour
justification. AGENTS rule 4 still binds — design confidently where behaviour is validated,
mark the genuinely-unknown narrowly, never invent.
