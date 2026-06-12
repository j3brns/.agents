# ADR-0013: Repo created at lease approval — born with the outer loop attached

- Status: accepted (2026-06-12) · Spec: §2.4, §4.1 · Decision log: D15

## Context
Lazy repo creation lowers day-zero friction but produces untracked experiments that
cannot harvest, accumulate evidence, or graduate — re-erecting the wall one lease at a
time.

## Decision
On `LeaseApproved`, the control project immediately creates the repo from the stage
template (generated single-include .gitlab-ci.yml, causeway.yml, agentcore scaffold,
AI-DLC steering) and replies on the originating issue with repo + account SSO links.
The S0 pipeline tier is almost entirely advisory, so eager creation costs the developer
nothing.

## Consequences
Every experiment is harvestable and promotable from minute one. Abandoned repos are
cheap; the harvest pipeline closes them out with an experiment record at lease expiry.
