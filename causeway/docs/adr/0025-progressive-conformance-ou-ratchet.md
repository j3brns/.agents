# ADR-0025: Conformance is structural — the progressive OU ratchet

- Status: accepted (2026-06-13) · Refines: ADR-0003, ADR-0015 · Spec: §3.1 · Decision log: D30 · Spike: S0-4

## Context
Stages were enforced primarily in the pipeline (detective) with SCPs framed as a "target".
But an agentic workload holds AWS credentials and can act directly; detective controls
gate paths through our tooling, not the account. AWS already offers the right primitive —
OUs with SCPs — and the delegated AccountPool subtree (ADR-0015) is exactly the authority
to use it. The stakeholder challenge: why aren't accounts moving through progressive OUs
with increasing conformance?

## Decision
Stages are **additive conformance SCP tiers** (`S0 ⊂ S1 ⊂ S2`). Validated ISB behaviour
constrains the realisation: ISB's seven OUs are **lifecycle** OUs, ISB **drift-detection
quarantines** an account found in an unexpected OU, and `WriteProtectionScp` is absent on
`Active` (so a leased account can write). Therefore the tier is **NOT** expressed by moving
the account into sibling `Causeway/Sn` OUs (that would trip drift→quarantine); it is
realised as **account-level SCPs attached to the member account while it stays in ISB's
`Active` OU** — additive on top of the four pool-wide SCPs, binding every principal
including a credentialed agent. Promotion S_n→S_{n+1} **attaches the next, stricter tier**,
**authorized by the attestation certificate** (evidence unlocks the click). Properties:
**monotonic within a lease** (only tightens; loosening is explicit and logged);
**per-lease, detached on recycle** (ISB CleanUp returns the account to `Available`; next
lease starts at S0); **S3 is not a click** — it leaves the pool into a CCoE-vended account
(ADR-0002). Clean split: **pipeline produces evidence → certificate authorizes → SCP tier
enforces.** Primary enforcement; pipeline-only is the graceful-degradation fallback.
Fallback ladder for realisation: account-level SCP stack (primary) → true stage-OUs *only
if* the CCoE extends ISB's expected-OU/drift config to treat them as `Active`-equivalent →
pipeline-only.

## Consequences
Conformance becomes preventive and AWS-native; the certificate, the SCP authority, and the
stage ladder unify into one mechanism. Real integration risk, isolated to **Spike S0-4**:
can a delegated actor move pool accounts through stage-OUs (or attach account-level SCP
stacks) without tripping ISB drift→quarantine, and does CleanUp reset placement? Fallback
ladder: stage-OU move → account-level SCP stack → pipeline-only. ADR-0015 is refined: the
OU ratchet is promoted from "target" to the enforcement mechanism.
