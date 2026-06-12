# Product — Causeway

Causeway turns the enterprise innovation sandbox (Innovation Sandbox on AWS) into stage
S0 of the SDLC for agentic workloads on Amazon Bedrock AgentCore. Work matures through
four stages — Explore, Incubate, Harden, Pre-prod — by accumulating signed,
deterministic evidence in GitLab pipelines; promotion is a one-line merge request
approved by a verifier verdict. Accounts stay disposable; the work survives.

Users: BU developers (surface: one file, `causeway.yml`, three interactions) and the
platform team (surface: two operated things — control project + catalog monorepo —
four alarms). Non-goals v1: production stage, non-AgentCore runtimes, account vending,
bespoke eval frameworks. Authority boundary: we own GitLab + the AgentCore estate; the
AWS org/SCP layer is the CCoE's (ADR-0011).
