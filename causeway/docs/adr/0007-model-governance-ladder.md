# ADR-0007: Model governance — any → pin-on-first-baseline → allowlist → pinned+attested

- Status: accepted (2026-06-12) · Spec: §7 · Decision log: D7

## Context
Model choice must be free where exploration happens and attested where it matters.
Enforcement must live in layers the platform team owns (Bedrock model access, AgentCore
Cedar, pipeline checks of agentcore.json) — not SCPs we don't control.

## Decision
S0: any non-deny-listed Bedrock model; lease budget is the governor; model+params pin
automatically the moment the first eval baseline is recorded. S1: pinned; changes force
baseline re-record. S2: org allowlist; params and Guardrails config join the manifest.
S3: exact model+params+guardrails attested; any change re-runs the S2 eval gate. The
same ladder shape applies to tools (Gateway targets/Cedar) and memory (retention/PII).

## Consequences
Evidence stays comparable across a unit's lifetime. Quota/cross-region concerns are a
platform service at S3. Tenant-scoped allowlists are a cheap v2 (Spec §10).
