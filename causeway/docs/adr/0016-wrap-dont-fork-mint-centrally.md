# ADR-0016: Wrap, don't fork; preview left, mint centrally

- Status: accepted (2026-06-13) · Refines: ADR-0001, ADR-0012 · Spec: §2.3, §6 · Decision log: D20, D21

## Context
Two recurring challenges: (1) why not fork ISB to add the missing harvest hold,
webhooks, and stage fields directly; (2) why not shift the platform further left into
the developer's CLI (agentcore-cli) — leases, evidence, promotion from the terminal.

## Decision
**Fork rule (D20).** Causeway already wraps ISB: `causeway-control` is the single
facade and only caller of ISB write APIs — wrapping survives upstream upgrades, forking
converts every upstream release into merge debt against a security-critical,
Nuke-coupled cleanup engine that AWS currently maintains for us. A fork is permitted
only if three gates fail in sequence: Spike S0-1 finds no supported pre-cleanup hold,
AND an upstream contribution to aws-solutions is rejected, AND the pre-expiry-harvest
fallback's measured race window is unacceptable for v1.

**Left-shift rule (D21).** Verdicts preview anywhere; evidence mints only on platform
runners with platform keys. The verifier-as-CLI (ADR-0012), policy packs, and replay
runner are available in the inner loop as `causeway verify` — advisory, same binary and
rule versions as the gate, so developers see the gate's exact verdict pre-push. Nothing
minted client-side (signatures, provenance, eval verdicts) is ever admissible evidence:
laptops offer no key custody, no reproducible environment, no tamper resistance — and
agentcore-cli's weekly release cadence is pinnable on platform runners, not across a
laptop fleet. agentcore-cli itself is neither forked nor wrapped; we consume its
artefact (the `agentcore/` directory) and ship our preview as a separate thin catalog
CLI.

## Consequences
Gate surprise is eliminated without trusting clients. The three-gate fork test makes
"fork ISB" a falsifiable last resort rather than a standing temptation. Cost: the
preview CLI is one more catalog deliverable (it reuses the verifier; marginal).
