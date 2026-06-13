# ADR-0018: Operator onboarding — headless ISB User, GitLab as the only front door

- Status: accepted (2026-06-13) · Spec: §2.4, runbooks/onboarding.md · Decision log: D23

## Context
The spec defined machinery but not how individual operators are started and served. ISB
ships three Identity Center roles (Admin/Manager/User) and its own web UI; uncurated,
every persona would face two systems.

## Decision
Role mapping: ISB **Admin** is platform-team-only. ISB **Manager** is the BU lead,
served by the ISB approval screen but always *via* a deep link from the GitLab issue.
ISB **User** is the developer and is **headless** — the control project owns the lease
relationship; the developer receives an SSO deep-link in the issue reply and never
visits the ISB UI. Onboarding cadence: per-BU once (GitLab group + compliance framework
+ IdC mapping + runner fleet + chargeback), per-developer once (two group memberships +
quickstart; no AWS keys, no tooling beyond git/agentcore-cli/optional causeway verify),
per-experiment via the issue form. Targets: minutes-to-sandbox for auto-approved S0;
<1 hour with Manager approval; recurring support tickets are treated as documentation
bugs and fixed via the refinement loop.

## Consequences
One front door per persona preserves the one-file/three-interactions contract (ADR-0014).
The Manager's ISB-UI dependency is accepted at launch (its supported approval path) with
an API-driven approval from the issue as a v2 story. IdC membership sync stays a CCoE
handoff (ADR-0011).
