# ADR-0015: Target posture — delegated SCP authority over the sandbox OU subtree

- Status: accepted (2026-06-13) · Refines: ADR-0011 · Spec: §2.3 · Decision log: D19

## Context
ADR-0011 binds governance to layers the platform team owns (GitLab, Cedar, model
policy), treating SCPs as a CCoE dependency. That makes S1–S2 enforcement detective
(pipeline failures, drift alarms) or path-scoped (Cedar governs tool calls via Gateway
only). But agentic workloads hold AWS credentials and call APIs directly; developers
have consoles. Only an SCP binds every principal in the account preventively. The
stakeholder directive: be opinionated — name the target.

## Decision
The target end-state for v1.0 is **preventive stage enforcement inside the sandbox
estate**, achieved via **delegated SCP administration scoped to the ISB AccountPool OU
subtree** (AWS Organizations delegated admin with resource-scoped delegation policy):
- Negotiation with the CCoE starts immediately; authority must land **before the first
  unit enters S2**.
- With it, S2's IaC-only rule becomes a deny-unless-`aws:PrincipalArn`-is-the-pipeline-
  OIDC-role condition; S1 gains infra-API breadth tiers. SCP changes ship from the
  catalog release train like any other policy pack — reviewed, versioned, attested.
- **Whole-org SCP ownership is refused permanently** (org blast radius; the SCP/Nuke
  allowlist coupling; accountability for a regulated surface that is rightly the
  CCoE's). ADR-0011's reasoning stands outside the pool subtree.
- **Fallback if delegation is declined**: detective posture persists, and every S2
  entry requires a named risk-acceptance sign-off — converting our silent residual risk
  into the CCoE's recurring, visible decision.

## Consequences
One political negotiation becomes the platform's critical-path dependency and is
started now, while spikes run. The SCP/Nuke coupling means our OU-scoped SCP changes
must pass a "Nuke can still clean it" policy test in CI (added to the catalog's
policy-pack suite). ADR-0011 is refined, not reversed: govern in layers we own — and
*extend what we own* to the narrowest scope that makes enforcement preventive.
