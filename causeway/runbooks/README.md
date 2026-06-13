# Runbooks — agent operability protocol (ADR-0017)

These runbooks are written to be executed by a CLI agent (Kiro, Claude Code) as well as
a human. Every step carries an authority tag:

- **[agent-ok]** — an agent may execute unaided: the step is an idempotent read or a
  reversible action with a stated verification and bound.
- **[human-ack]** — an agent may *prepare* the call and present it, but a named human
  approves before execution (irreversible, destructive, or risk-accepting actions).
- **[ccoe]** — outside our authority entirely (ADR-0011/0015): the step is a handoff;
  agents draft the ticket, never act.

Rules binding on agents: every action step states its API call and its verification;
no step may loop or wait unbounded (ADR-0006/0008 — retries are counted, waits have
deadlines); if a verification fails twice, stop and escalate to a human rather than
improvise. Until the platform is deployed, all steps are dry-run: agents may rehearse
by emitting the exact calls they would make.
