# ADR-0017: Runbooks are agent-operatable behind a human-ack authority boundary

- Status: accepted (2026-06-13) · Spec: runbooks/ · Decision log: D22

## Context
Runbooks written as human prose can be read by CLI agents (Kiro steering, AGENTS.md)
but not safely executed: steps mixed judgment with action, referenced UIs instead of
API verbs, and carried no statement of what an agent may do unaided.

## Decision
Every runbook step carries an authority tag — **[agent-ok]** (idempotent reads and
reversible actions with stated verification and bounds: freeze/unfreeze, retryCleanup
once, evidence assembly, bounded watches), **[human-ack]** (irreversible, destructive,
or risk-accepting: terminate, release cuts, integrity incidents — agent prepares, human
approves), **[ccoe]** (outside our authority: agent drafts the handoff, never acts).
Action steps name their API call and verification; no unbounded loops or waits; two
failed verifications = stop and escalate. Until deployment, agents rehearse in dry-run
by emitting exact calls.

## Consequences
The same documents serve humans and agents; agent autonomy is bounded by the same
preventive-vs-detective logic as the platform itself (reversible = autonomous,
irreversible = gated). The tag taxonomy must survive future runbooks — it's part of
the operability contract, not styling.
