# ADR-0011: Govern in the layers we own; the org/SCP ladder is a CCoE dependency

- Status: accepted (2026-06-12) · Spec: §2.3 · Decision log: D11

## Context
The platform team owns GitLab administration and the Bedrock/AgentCore estate. It does
not own AWS Organizations, SCPs, or org networking — the CCoE does, including the ISB
deployment's AccountPool stack.

## Decision
Progressive governance binds primarily through layers under platform control: GitLab
compliance pipelines, protected environments, runner isolation; AgentCore Cedar
policies, Gateway allowlists, Bedrock model-access, AgentCore Identity. Per-stage SCP
tiers are a declared dependency, delivered as reviewed contributions to the CCoE's SCP
JSON. The design degrades gracefully: with stock ISB SCPs only, stages still bind via
pipeline + Cedar + model policy; we lose only infra-API breadth control (residual
exposure documented per stage).

## Consequences
No governance mechanism depends on authority we don't have. S3 account vending stays
the CCoE's job (AFT/LZA pattern). "Just ask for org admin" is rejected as a dependency
dressed as a simplification.
