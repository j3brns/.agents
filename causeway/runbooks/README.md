# Runbooks — agent operability protocol (ADR-0017)

These runbooks are written to be executed by a CLI agent (Kiro, Claude Code) as well as
a human. Every step carries an authority tag:

- **[agent-ok]** — an agent may execute unaided: the step is an idempotent read or a
  reversible action with a stated verification and bound.
- **[human-ack]** — an agent may *prepare* the call and present it, but a named human
  approves before execution (irreversible, destructive, or risk-accepting actions).
- **[ccoe]** — outside our authority entirely (ADR-0011/0015): the step is a handoff;
  agents draft the ticket, never act.

## Personas (the named actors behind the tags)

Every runbook states its persona(s) at the top; every step's tag maps to one:

- **Ops agent** — the CLI agent (Codex/Kiro/Claude) that executes `[agent-ok]` steps.
- **Platform on-call engineer** — the human who approves/decides `[human-ack]` steps and owns the four alarms.
- **CCoE engineer** — the separate cloud-platform team that owns `[ccoe]` handoffs (org, SCPs, account vending).
- **BU lead / Manager** and **Developer** — appear in `onboarding.md` only (lease approvals; headless sandbox use).

*Why personas, not just tags:* a tag says *what kind of actor* may act; a persona says *who
you are when you open this page*. Naming the persona stops an operator from running a step
that isn't theirs, and tells the ops agent exactly which human to escalate to.

Rules binding on agents: every action step states its API call and its verification;
no step may loop or wait unbounded (ADR-0006/0008 — retries are counted, waits have
deadlines); if a verification fails twice, stop and escalate to a human rather than
improvise. Until the platform is deployed, all steps are dry-run: agents may rehearse
by emitting the exact calls they would make.
