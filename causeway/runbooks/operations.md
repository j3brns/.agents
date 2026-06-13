# Runbook — operations (install, upgrade, rollback, alarms)

> **Persona — who runs this:** the platform **on-call engineer** (human) drives; the
> **ops agent** (Codex/Kiro/Claude) executes `[agent-ok]` steps unaided; the **CCoE engineer**
> owns `[ccoe]` handoffs. If you are a developer or BU lead, this runbook is not yours.

The whole of day-2. Authority tags per [README.md](README.md) (ADR-0017). If an
operational task isn't in these runbooks, it shouldn't exist yet (ADR-0014).

## Install (once)

1. [ccoe] ISB deployed (AccountPool stack in org mgmt account; IDC stack; hub stacks).
   Handoff artifact: API endpoint + EventBridge bus ARN + Identity Center group names.
2. [human-ack] Create `causeway-control` project; configure EventBridge **API
   Destination** → GitLab trigger token for the four routes (LeaseApproved,
   duration-threshold, CleanAccountRequest, drift/cleanup-failure).
   Verify [agent-ok]: fire a test event; expect one control pipeline per route.
3. [human-ack] Seed `causeway-catalog`; cut **release 1** (publishes components,
   renders bootstraps, registers blueprints via `POST /blueprints`).
   Verify [agent-ok]: `GET /blueprints` lists every stage bootstrap at release-1 versions.
4. [human-ack] Create per-BU groups + compliance frameworks + runner fleets; create the
   platform KMS signing key.
5. [agent-ok] Smoke test = Spike S0-2 pipeline end-to-end; expect green within 30 min.

## Upgrade

1. [human-ack] Cut catalog release **N** (one MR merge on the catalog).
2. [agent-ok] Verify: components published at N; `GET /blueprints` shows N; bot MRs
   opened on consumer repos (count == repos with `release: N-1`).
3. [agent-ok] Watch the four alarms for one business day (bounded watch, then report).
   Never hotfix a consumer repo directly.

## Rollback

1. [human-ack] Cut release **N−1'** (re-tag of N−1; re-registers prior blueprints,
   opens downgrade MRs).
2. [agent-ok] Verify as upgrade step 2. Manifests record which release verified them,
   so audit is unbroken.

## The four alarms (the entire on-call surface)

| Alarm | Source | First response |
|---|---|---|
| Harvest timeout | control project (bounded wait expired) | [agent-ok] see [harvest-failure.md](harvest-failure.md) |
| Account quarantined | ISB cleanup-failure/drift events | [agent-ok] `POST /accounts/{id}/retryCleanup` once; verify next cleanup event ≤ retry window; if quarantined again → [ccoe] ticket. Never hand-clean a pool account |
| Drift detected | ISB `AccountDriftDetected` | [agent-ok] confirm no control-project OU action in window; let ISB quarantine; [ccoe] CloudTrail actor investigation |
| Verifier failure at an approved gate | promotion pipeline | [human-ack] integrity incident, not flake: ledger and verdict disagree — freeze the promotion ([agent-ok] to prepare diff of manifest vs artifacts) |

Budget/duration enforcement, freezes-on-threshold, and emails are **ISB's job** — do
not page on them, do not re-implement them.
