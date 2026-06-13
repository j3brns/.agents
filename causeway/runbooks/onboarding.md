# Runbook — onboarding (BUs, developers, managers)

How individual operators get started and served (D23, ADR-0018). Authority tags per
[README.md](README.md). The front door for everyone except platform admins is **GitLab +
the docs site** — the ISB web UI is platform/manager territory only.

## Role mapping (ISB Identity Center groups → Causeway personas)

| ISB role | Who holds it | Served where |
|---|---|---|
| Admin | Platform team only | ISB UI + these runbooks |
| Manager | BU lead (lease approvals for S1/S2 tiers) | ISB UI approval screen, deep-linked from the GitLab issue |
| User | Developer — **headless**: never visits the ISB UI | GitLab issue forms, MR widgets, docs site; SSO deep-link to the leased account arrives in the issue reply |

## BU onboarding (once per BU)

1. [human-ack] Create the BU top-level GitLab group; attach compliance framework
   (stage enforcement); enable the issue-form project; tag the runner fleet.
   Verify [agent-ok]: a test repo in the group cannot remove the compliance pipeline.
2. [ccoe] IdC group mapping: BU members → ISB User group; named leads → Manager group.
   Handoff artifact: group names + membership sync source.
3. [human-ack] Configure `costReportGroup` for the BU on the relevant lease templates
   (`PATCH /leaseTemplates/{id}`); set template visibility PUBLIC/PRIVATE per BU need.
4. [agent-ok] Verify end-to-end: synthetic "new experiment" issue → lease requested →
   repo created → issue reply contains repo + SSO links. Target: green within 1 hour.

## Developer onboarding (once per person)

1. Join the BU GitLab group (group owner action) and the IdC User group ([ccoe] sync).
2. Read the quickstart on the docs site. Local tooling: git + agentcore-cli; optional
   `causeway verify` for gate preview (ADR-0016). Nothing else to install; no AWS keys
   ever (OIDC only).
3. First experiment: file the issue form. Auto-approved S0 target: **sandbox in minutes**;
   Manager-approved tiers: under an hour during business hours.

## Manager onboarding (once per lead)

1. [ccoe] Add to IdC Manager group.
2. Brief (one page on the docs site): approvals arrive as GitLab issues deep-linking the
   ISB approval screen; what the lease tiers mean; budget/duration thresholds are
   enforced by ISB — approving is the only manual act. Decline = comment on the issue.

## Service & support

- Front door: the docs site (quickstart, stage guide, runbooks, spec, ADRs).
- Anything unanswered there: issue on the Causeway repo (templates: question /
  incident / refinement-proposal). Systemic answers flow back into the docs via the
  refinement loop — support tickets that recur are documentation bugs.
