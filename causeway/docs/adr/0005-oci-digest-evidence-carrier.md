# ADR-0005: OCI digest is the artefact identity from S1; direct code deploy only in S0

- Status: accepted (2026-06-12) · Spec: §5 · Decision log: D5

## Context
The agentcore CLI defaults to direct code deploy (fast, no packaging). But a zip deploy
has no portable, signable identity. The container's role in this stack is not developer
experience — it is the portability and evidence boundary between disposable accounts
and governed runtime.

## Decision
S0 permits direct code deploy (with an advisory image build on every push so packaging
never becomes a cliff). From S1 the digest-pinned OCI image (ARM64, pinned hardened
base) is the unit of deployment and attestation: built once in CI, cosign-signed with
platform KMS keys, SLSA-L1 provenance attached. Rebuilds across S2→S3 are forbidden —
the same digest redeploys. CI builds use kaniko/buildkit; no privileged docker-in-docker.

## Consequences
Content-addressed identity survives account recycling and carries the evidence chain
intact across the wall. Cost: container build time from S1 on; mitigated by caching.
