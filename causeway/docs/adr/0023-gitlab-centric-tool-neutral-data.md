# ADR-0023: GitLab-centric binding over tool-neutral data

- Status: accepted (2026-06-13) · Spec: §2.5, §9.3, §10 · Decision log: D28

## Context
Causeway is heavily GitLab-centric — control plane, evidence, tenancy, approval routing,
Pages, catalog. Reasonable challenge: is that lock-in, and does it conflate the model with
the tool?

## Decision
GitLab-centricity is a deliberate bet: owning the whole outer loop in one system is what
makes the developer surface a single file (ADR-0014). We do **not** pay a portability
abstraction tax in v1 (no multi-VCS adapter layer nobody has asked for). Instead we draw a
**seam**: the *data* — promotion manifests, attestation certificates, adjudicator verdicts,
evidence items — is tool-neutral and schema-versioned; GitLab approval rules, CODEOWNERS,
Pages, and the CI/CD Catalog are the current *binding* of that data to a tool. The concept
can be re-bound to another platform later by re-implementing the bindings against the same
schemas; the spec, ADRs, certificates, and evidence survive unchanged.

## Consequences
No lock-in at the level that matters (the evidence and decisions are portable); full
exploitation of GitLab at the level that doesn't (the plumbing). The line to hold: keep
tool-specific assumptions out of the schemas. A future "port to platform X" is a bindings
project, not a redesign.
