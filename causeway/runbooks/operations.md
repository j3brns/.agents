# Runbook — operations (install, upgrade, rollback, alarms)

The whole of day-2. If an operational task isn't on this page or in the other two
runbooks, it shouldn't exist yet (ADR-0014: two operated things, four alarms).

## Install (once)

1. CCoE deploys ISB (AccountPool stack in the org management account; IDC stack in the
   Identity Center account; hub stacks); platform team receives API endpoint + event bus.
2. Create `causeway-control` project; configure EventBridge **API Destination** →
   GitLab pipeline-trigger token for the four routes (LeaseApproved, duration-threshold,
   CleanAccountRequest, drift/cleanup-failure).
3. Seed `causeway-catalog`; cut **release 1** — this publishes components, renders
   bootstraps to StackSets, and registers them as ISB blueprints automatically.
4. Create per-BU top-level groups; attach compliance frameworks (stage enforcement);
   register stage-scoped runner fleets; create KMS signing key in the platform estate.
5. Verify with Spike S0-2's end-to-end pipeline as the smoke test.

## Upgrade

Cut catalog release **N**. The release pipeline publishes components, re-registers
blueprints, and opens bot MRs bumping `release: N` in consumer repos' `causeway.yml`.
Watch the four alarms for one business day. Never hotfix a consumer repo directly.

## Rollback

Re-pin: cut release **N−1'** (a re-tag of N−1), which re-registers prior blueprints and
opens downgrade MRs. Manifests record which release verified them, so audit is unbroken.

## The four alarms (the entire on-call surface)

| Alarm | Source | First response |
|---|---|---|
| Harvest timeout | control project (bounded wait expired) | see [harvest-failure.md](harvest-failure.md) |
| Account quarantined | ISB `AccountCleanupFailed`/drift→quarantine | ISB UI → Retry cleanup; if persistent, CCoE ticket — never hand-clean a pool account |
| Drift detected | ISB `AccountDriftDetected` | confirm no manual OU move; let ISB quarantine; investigate actor via CloudTrail (CCoE) |
| Verifier failure at an approved gate | promotion pipeline | treat as integrity incident, not flake: the evidence ledger and the verdict disagree — freeze the promotion, diff manifest vs artifacts |

Budget/duration enforcement, freezes, and emails are **ISB's job** — do not page on
them, do not re-implement them.
