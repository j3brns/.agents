# ADR-0029: Continuous harvest — no pre-cleanup hold dependency

- Status: accepted (2026-06-13) · Refines/supersedes the hold-dependency of ADR-0008 · Spec: §4.4 · Decision log: D34

## Context
ADR-0008 made harvest a batch *before* cleanup, requiring an unverified ISB cleanup-hold
(the old Spike S0-1, the design's biggest risk). But we own the pipeline that produces the
artefacts, and the evidence model already pushes them to GitLab as they're made.

## Decision
Harvest **continuously during the lease**: each push/build streams the image digest, eval
baselines, lineage, evidence and experiment-record deltas to GitLab (already happening for
the evidence model, §9). At ISB's **validated `durationThresholds` pre-expiry event** the
control project does a **deadline-bounded final flush** and marks park/kill/revive. At
`CleanAccountRequest`/cleanup nothing critical remains to hold for, so **the cleanup-hold
dependency is removed**. If threshold lead time is short, only the last delta is at risk —
a small, recorded gap, never the whole experiment.

## Consequences
Removes the design's biggest external unknown (old S0-1 → a non-blocking confirmation that
the threshold event gives enough lead). More robust (no big-bang failure mode). The
bounded-wait/halting discipline still holds (final flush is deadline-bounded). ADR-0008's
"harvest then nuke, bounded" intent is preserved; only the *mechanism* changes from batch
to continuous.
