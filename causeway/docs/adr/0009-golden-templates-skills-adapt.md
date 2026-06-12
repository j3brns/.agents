# ADR-0009: Golden templates; skills adapt, never author

- Status: accepted (2026-06-12) · Spec: §8 · Decision log: D9

## Context
Agent skills can generate IaC, pipeline config and tool definitions. Trusting generated
output is the original sin; verifying arbitrary generated programs is undecidable
(ADR-0006). Yet generation is too useful to ban.

## Decision
Three template planes (infra: Service Catalog→ISB blueprints + Terraform modules;
pipeline: CI/CD Catalog components; agent: agentcore scaffolds). Skills may
parameterise, compose and adapt catalogued templates; they may not introduce
un-catalogued resource types or pipeline jobs — enforced structurally by Layer-1 policy
assertions, not by trust. Every instance carries lineage:
{template_id, version, adaptation_diff_digest, adapting_skill@version}.
Novel patterns enter via a governed catalog-contribution path before consumption.

## Consequences
Generation can be wrong without being a compliance hole. The contribution path (E9)
must have an SLA or the catalog becomes the new wall.
