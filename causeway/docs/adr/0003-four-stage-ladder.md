# ADR-0003: Four stages — Explore, Incubate, Harden, Pre-prod

- Status: accepted (2026-06-12) · Spec: §3 · Decision log: D4, D12

## Context
The governance ramp needs discrete, explainable steps. Three stages smear hardening into
incubation or pre-prod; a continuous risk score is unauditable and unexplainable to a
CISO; more than four multiplies ceremony without adding a distinct purpose per stage.

## Decision
Four stages: S0 Explore (falsify the idea), S1 Incubate (make it real), S2 Harden (make
it attestable), S3 Pre-prod (make it operable). Each stage is a tuple of lease-template
tier, bootstrap blueprint, pipeline tier, model policy, and exit evidence. Stage state
is data in the promotion manifest, mirrored to ISB lease tier and GitLab compliance label.

## Consequences
S2 exists solely to absorb the prototype→attestable transition — the wall itself.
Stage transitions are auditable events. Cost: one more gate than the minimum.
