# Tech — stack and constraints

- **Substrate**: Innovation Sandbox on AWS — consumed ONLY via REST API + EventBridge
  events (ADR-0001). Never fork (exception: CCoE-owned SCP JSON).
- **Agents**: Amazon Bedrock AgentCore; current Node `agentcore-cli` (NOT the legacy
  Python starter toolkit); `agentcore/` directory is the promotable artefact; AI-DLC
  methodology (awslabs/aidlc-workflows).
- **Pipelines**: GitLab self-managed; CI/CD Catalog components only (no legacy
  include:template); compliance pipelines enforce stage tiers; OIDC to AWS — no stored
  keys, ever.
- **Artefacts**: digest-pinned OCI (ARM64) from S1; cosign + KMS; SLSA-L1 provenance;
  kaniko/buildkit (no privileged DinD).
- **Verification**: OPA/conftest + cdk-nag on IaC plans; Cedar policy unit tests;
  record/replay cassettes; AgentCore evaluators with pinned models, N trials,
  thresholds. Verify artifacts, never programs; no unbounded waits.
- **Versions move fast**: verify ISB/agentcore-cli/GitLab capabilities against current
  sources before relying on them; route unverified claims to docs/SPIKES.md.
