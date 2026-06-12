# ADR-0008: Harvest before nuke, with bounded waits; records-only in v1

- Status: accepted (2026-06-12) · Spec: §4.4, §14.1 · Decision log: D8, D13

## Context
ISB cleanup destroys everything and archives nothing — knowledge dies on lease expiry.
But "cleanup waits for harvest to complete" is halting-problem-shaped: an arbitrary
pipeline may never finish, and an account must never be held hostage.

## Decision
On `CleanAccountRequest`: freeze the lease, run the harvest pipeline, then release the
hold on a completion signal **or a hard timeout, whichever comes first** — cleanup
always wins eventually. Harvest is idempotent and incremental (digest push, eval
baselines, experiment record stream out as they're produced) so a timeout means partial
loss, recorded as a fact, not total loss. v1 scope is records only; AgentCore Memory
export is deferred to v2 (trigger: first park-and-revive demand).

## Consequences
No unbounded waits anywhere in the control plane. RISK: whether stock ISB exposes any
pre-cleanup hold point is unverified — Spike S0-1. Fallback: harvest at the
duration-threshold alert (pre-expiry), accepting a small race window.
