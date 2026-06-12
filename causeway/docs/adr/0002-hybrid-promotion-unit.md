# ADR-0002: The repo is the promotable truth; accounts graduate by rebuild

- Status: accepted (2026-06-12) · Spec: §2.1, §3 · Decision log: D1

## Context
Something must carry an experiment across the wall. Candidates: promote the AWS account
(move it between OUs), promote the repo (rebuild everywhere), or both. ISB recycles
accounts deliberately stateless, and its only account exit is a blunt `eject`.

## Decision
Hybrid: the GitLab repo (agent artefact bundle + IaC + evidence) is the unit of
promotion. Within the sandbox estate the account "graduates" logically via lease-tier
transitions (S0→S1→S2). Entry to S3 is a rebuild from the attested repo into a
CCoE-vended governed account.

## Consequences
Consistent with ISB's accounts-hold-no-state design and the AFT/LZA pattern. Requires
everything of value to be codified — which is the discipline we want anyway. Drift
between repo and account is detected and recorded, not silently tolerated.
