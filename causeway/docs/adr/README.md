# Architecture Decision Records

Immutable once accepted; changes happen by **superseding** with a new ADR that links
back. Each ADR cites the spec sections it governs and the decision-log entries
(D1–D18, [`../SPEC.md`](../SPEC.md) §0) it formalises. Interview provenance:
[`../ANSWERS.md`](../ANSWERS.md). Process: [`../REFINEMENT.md`](../REFINEMENT.md).

| ADR | Title | Decisions |
|---|---|---|
| [0001](0001-extend-isb-never-fork.md) | Extend ISB via API/events; never fork | — |
| [0002](0002-hybrid-promotion-unit.md) | Repo is the promotable truth; accounts graduate by rebuild | D1 |
| [0003](0003-four-stage-ladder.md) | Four stages: Explore→Incubate→Harden→Pre-prod | D4, D12 |
| [0004](0004-gitlab-control-plane.md) | Self-managed GitLab as control plane & tenancy boundary | D2, D3 |
| [0005](0005-oci-digest-evidence-carrier.md) | OCI digest as artefact identity from S1 | D5 |
| [0006](0006-verify-artifacts-never-programs.md) | Layered deterministic verification | D6 |
| [0007](0007-model-governance-ladder.md) | Model governance ladder | D7 |
| [0008](0008-harvest-then-nuke-bounded.md) | Harvest before nuke, bounded waits | D8, D13 |
| [0009](0009-golden-templates-skills-adapt.md) | Golden templates; skills adapt, never author | D9 |
| [0010](0010-gitlab-native-evidence.md) | GitLab-native evidence, manifest-linked | D10 |
| [0011](0011-ownership-boundary.md) | Govern in layers we own; SCP ladder is CCoE dependency | D11 |
| [0012](0012-verifier-as-component.md) | Verifier as catalog component, not service | D14 |
| [0013](0013-repo-at-lease-approval.md) | Repo at lease approval | D15 |
| [0014](0014-simplicity-contract.md) | Simplicity contract + "no simpler" floor | D16–D18 |
| [0015](0015-delegated-ou-scoped-scp-authority.md) | Target: delegated OU-scoped SCP authority (refines 0011) | D19 |
