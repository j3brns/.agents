# Architecture Decision Records

Immutable once accepted; changes happen by **superseding** with a new ADR that links
back. Each ADR cites the spec sections it governs and the decision-log entries
(D1–D18, [`../SPEC.md`](../SPEC.md) §0) it formalises. Interview provenance:
[`../ANSWERS.md`](../ANSWERS.md). Process: [`../REFINEMENT.md`](../REFINEMENT.md).


**Not all ADRs carry equal weight — and the index says so.** Honest tiers: **Foundational** (reversing means redesign), **Core** (significant, real trade-off), **Tactical** (a defensible but modest operational/UX choice — logged for traceability, not architecturally deep), **Process** (how the project runs, not the architecture). Two are partially superseded (0008 mechanism→0029; 0026 framing→0027) and kept for history. Roughly 10 Foundational, 12 Core, 5 Tactical, 1 Process, 1 superseded-pair.

| ADR | Title | Decisions | Significance |
|---|---|---|---|
| [0001](0001-extend-isb-never-fork.md) | Extend ISB via API/events; never fork | — Foundational |
| [0002](0002-hybrid-promotion-unit.md) | Repo is the promotable truth; accounts graduate by rebuild | D1 Foundational |
| [0003](0003-four-stage-ladder.md) | Four stages: Explore→Incubate→Harden→Pre-prod | D4, D12 Foundational |
| [0004](0004-gitlab-control-plane.md) | Self-managed GitLab as control plane & tenancy boundary | D2, D3 Core |
| [0005](0005-oci-digest-evidence-carrier.md) | OCI digest as artefact identity from S1 | D5 Core |
| [0006](0006-verify-artifacts-never-programs.md) | Layered deterministic verification | D6 Foundational |
| [0007](0007-model-governance-ladder.md) | Model governance ladder | D7 Core |
| [0008](0008-harvest-then-nuke-bounded.md) | Harvest before nuke, bounded waits | D8, D13 Core · mechanism→0029 |
| [0009](0009-golden-templates-skills-adapt.md) | Golden templates; skills adapt, never author | D9 Core |
| [0010](0010-gitlab-native-evidence.md) | GitLab-native evidence, manifest-linked | D10 Core |
| [0011](0011-ownership-boundary.md) | Govern in layers we own; SCP ladder is CCoE dependency | D11 Foundational |
| [0012](0012-verifier-as-component.md) | Verifier as catalog component, not service | D14 Tactical |
| [0013](0013-repo-at-lease-approval.md) | Repo at lease approval | D15 Tactical |
| [0014](0014-simplicity-contract.md) | Simplicity contract + "no simpler" floor | D16–D18 Foundational |
| [0015](0015-delegated-ou-scoped-scp-authority.md) | Target: delegated OU-scoped SCP authority (refines 0011) | D19 Core |
| [0016](0016-wrap-dont-fork-mint-centrally.md) | Wrap, don't fork; preview left, mint centrally | D20, D21 Core |
| [0017](0017-agent-operable-runbooks.md) | Agent-operatable runbooks behind a human-ack boundary | D22 Tactical |
| [0018](0018-operator-onboarding.md) | Operator onboarding: headless ISB User, GitLab front door | D23 Tactical |
| [0019](0019-docs-as-code-pages.md) | Docs-as-code to GitLab Pages; wiki rejected | D24 Tactical |
| [0020](0020-self-asserted-trust-but-verify.md) | Self-asserted, trust-but-verify; four-eyes on adjudicated elevation | D25 Foundational |
| [0021](0021-risk-cost-adjudicator.md) | Risk & cost adjudicator: fail-safe, monotonic skill | D26 Core |
| [0022](0022-attestation-certificates.md) | Attestation certificates: signed, published, revocable | D27 Core |
| [0023](0023-gitlab-centric-tool-neutral-data.md) | GitLab-centric binding over tool-neutral data | D28 Foundational |
| [0024](0024-delegated-crews-two-person-rule.md) | Delegated crews; two-person (launch-code) rule, ≤ one agent key | D29 Foundational |
| [0025](0025-progressive-conformance-ou-ratchet.md) | Conformance is structural: the progressive OU/SCP ratchet | D30 Foundational |
| [0026](0026-cost-caps-hard-sandbox-advisory-preprod.md) | Cost caps: hard in sandbox, advisory + FinOps in pre-prod | D31 Core · framing→0027 |
| [0027](0027-cost-caps-lagging-backstop-preventive-ceiling.md) | Cost cap = lagging backstop; real-time ceiling is preventive (supersedes 0026 framing) | D32 Core |
| [0028](0028-design-on-known-behaviour-spikes-confirm.md) | Design on known behaviour; spikes confirm/calibrate, not discover | D33 Process |
| [0029](0029-continuous-harvest.md) | Continuous harvest — no pre-cleanup hold dependency | D34 Core |