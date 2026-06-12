# ADR-0001: Extend Innovation Sandbox via API and events; never fork

- Status: accepted (2026-06-12) · Spec: §1.1, §4 · Decision log: (foundational)

## Context
ISB provides the account-pool lifecycle (leases, OUs, cleanup, quarantine) plus a REST
API and EventBridge events — but no graduation path, CI/CD hooks, or export. Forking
would let us add these directly, at the cost of owning a divergent solution forever.

## Decision
Consume ISB strictly through its REST API and EventBridge bus. The single sanctioned
exception is the SCP JSON, which ISB structures for customisation and which the CCoE
owns anyway. Missing capabilities (webhooks, harvest hold) are bridged externally or
contributed upstream — never patched in a private fork.

## Consequences
No fork debt; ISB upgrades remain cheap. We accept hard limits where ISB has no
extension point — the harvest hold (ADR-0008) is the known risk and is Spike S0-1.
