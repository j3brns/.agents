> **SUPERSEDED by ADR-0029 (continuous harvest).** Harvest no longer needs a pre-cleanup
> hold; this is now the **non-blocking confirmation S0-1** (final-flush lead time). Kept for
> history. Not a buildable unit. See `docs/SPIKES.md` and `docs/adr/0029-continuous-harvest.md`.

# Spike S0-1 — the harvest hold: requirements

Governing ADR: ADR-0008. Claim under test (docs/SPIKES.md S0-1): *stock ISB can delay
account cleanup behind an external, deadline-bounded signal, without forking.*

## R1 — Observe the cleanup window
- WHEN a lease ends in a test ISB deployment, THE system SHALL capture the timeline
  from `CleanAccountRequest` emission to AWS Nuke start, with timestamps from
  EventBridge, Step Functions, and CodeBuild.
- THE experiment SHALL repeat this ≥3 times and record min/median gap.

## R2 — Attempt a supported hold
- THE experiment SHALL attempt, in order: (a) gating the cleanup state machine via an
  EventBridge rule/input transform, (b) identifying an upstream contribution point for
  a wait-state, (c) any AppConfig/cleanup-retry setting that yields an effective delay.
- IF a hold is achieved, THE experiment SHALL verify it is deadline-bounded: WHEN the
  hold deadline passes without a release signal, cleanup SHALL proceed unaided.
- THE experiment SHALL NOT modify ISB source in the deployed solution (ADR-0001).

## R3 — Verdict and fallback
- WHEN the experiment concludes, THE result row in docs/SPIKES.md SHALL be filled with
  pass/fail and the measured hold ceiling.
- IF failed, THE editor SHALL draft a superseding ADR moving harvest to the
  duration-threshold alert (pre-expiry) and quantifying the race window from R1 data.

## Acceptance
- Reproducible scripts/notes committed under this spec's directory; no fork; result row
  appended; ADR action taken or explicitly waived by the stakeholder.
