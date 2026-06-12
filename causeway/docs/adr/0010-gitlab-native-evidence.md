# ADR-0010: GitLab-native evidence record, manifest-linked to AWS runtime evidence

- Status: accepted (2026-06-12) · Spec: §9 · Decision log: D10

## Context
Evidence needs one durable home. The platform team fully owns GitLab; AWS-side audit
tooling belongs to the CCoE. SLSA L3 on self-managed GitLab is still experimental
(public-Rekor caveat); L1 provenance is production-usable.

## Decision
GitLab is the system of record: job artifacts, release evidence at every stage
transition, runner-generated SLSA-L1 provenance, cosign signatures with platform KMS
keys. Runtime evidence native to AWS (traces, eval runs, CloudWatch GenAI metrics) is
referenced from the machine-written promotion manifest by ARN/URI + digest — never
copied. Hand-edited manifests are rejected by the verifier.

## Consequences
One audit surface; promotion executes where evidence lives. Revisit SLSA L3 when GA
for self-managed. ARN references require the AgentCore estate to retain runs per the
stage's retention policy.
