# ADR-0004: Self-managed GitLab is the control plane and the tenancy boundary

- Status: accepted (2026-06-12) · Spec: §2.3, §6.4, §10 · Decision log: D2, D3

## Context
The platform team owns GitLab instance administration end-to-end; it does not own the
AWS org. BUs need isolation, chargeback, and policy without per-BU AWS infrastructure.

## Decision
Enterprise self-managed GitLab carries: per-BU top-level groups (the only tenancy
boundary in v1), compliance-pipeline enforcement of stage tiers, stage-scoped runner
fleets, OIDC federation to per-stage AWS roles (no stored keys), the CI/CD Catalog, the
registries, and the evidence record. The AWS account pool stays shared; `costReportGroup`
maps chargeback.

## Consequences
Tenancy is cheap and reversible. AWS-side pool partitioning is deferred behind explicit
triggers (data-residency or regulator demand — Spec §10). Everything hinges on GitLab
availability; it is already a tier-1 system for the org.
