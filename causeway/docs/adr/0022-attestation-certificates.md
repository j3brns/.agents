# ADR-0022: Attestation certificates are signed, published, and revocable

- Status: accepted (2026-06-13) · Refines: ADR-0010, ADR-0019 · Spec: §9.3 · Decision log: D27

## Context
The verifier produced a verdict but no durable, human-readable artefact. "How is the
progression through attestation certified, and is it output to docs?" had no good answer —
standing was buried in pipeline logs, invisible to a CISO or auditor.

## Decision
Each stage transition issues a **certificate**: a signed (cosign/KMS) record naming the
unit, stage, artefact digest, evidence-block digest, adjudicator decision, human
approvers, the verifying catalog release, and a `status` (valid|revoked). A certificate
issues only when the verifier passes (and routed approvals are present for
`four-eyes-required`). Certificates are **published to the docs site** (Pages, ADR-0019)
as a per-unit "stamped passport" rendering S0→current, readable without pipeline access.
Revocation (on async-verify failure, ADR-0020) flips `status` and re-publishes;
certificate history is append-only.

## Consequences
The certificate is the certification — the durable form of "evidence, not opinion". Audit
and stakeholder visibility come for free from the docs build. The certificate schema is
tool-neutral (ADR-0023). Cost: the certificate issue/revoke/publish path is part of E10.
