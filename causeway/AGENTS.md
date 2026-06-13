# AGENTS.md — operating contract for CLI agents

For Kiro, Claude Code, and any other agent working in this repo. Kiro users: the
`.kiro/steering/` files mirror this contract; `.kiro/specs/` holds the
requirements/design/tasks packages for buildable units.

## What this repo is

The **specification and decision record** for Causeway — the extension of Innovation
Sandbox on AWS into a graduated innovation stage (sandbox → pre-prod) for AgentCore
workloads, with GitLab as the evidence-generating outer loop. There is **no production
code here yet**; the deliverables are documents with hard consistency invariants, plus
spike implementations when tasked.

## Map

- `docs/SPEC.md` — normative spec (current: v0.6). §0 decision log D1–D21 is load-bearing.
- `docs/adr/` — 16 immutable ADRs. **Never edit an accepted ADR**; supersede with a new one.
- `docs/ANSWERS.md` — interview record; append-only.
- `docs/REFINEMENT.md` — the refinement loop. **If asked to "refine", "iterate", or
  "take this through a loop", follow that document exactly** (FRAME → INTERVIEW →
  RECORD → DELTA → EVIDENCE → GATE).
- `docs/SPIKES.md` — Spike 0; append results, never rewrite claims.
- `docs/ARCHITECTURE.md`, `runbooks/` — regenerate when the spec changes (a spec delta
  whose downstream artifacts don't move is incomplete).
- `.kiro/specs/<unit>/` — requirements.md (EARS), design.md, tasks.md per buildable unit.

## Hard rules

1. **Traceability invariant** (REFINEMENT.md): answer → Dnn → ADR → spec section →
   downstream artifact, unbroken both ways. Run this check before proposing a merge.
2. ADRs immutable; ANSWERS.md append-only; SPEC version bumps exactly once per
   refinement MR with §15 updated.
3. The "no simpler" floor (SPEC §14.1) may only be weakened by a superseding ADR that
   names a replacement mechanism.
4. Never invent capabilities for ISB, agentcore-cli, or GitLab — verify against current
   docs/source first; both move fast. Mark unverified claims as assumptions and route
   them to SPIKES.md.
5. Decisions belong to the stakeholder. When a choice is load-bearing and undecided,
   ask (2–4 options, recommended default first); delegation is a valid, logged answer.
6. No unbounded waits in anything you design; gates verify finite artifacts, never
   programs (ADR-0006, ADR-0008).
7. Conventions: UK English in prose; Mermaid for diagrams; one MR per refinement
   iteration; commit messages state the iteration (e.g. "refine: v0.5 — resolve O1").

## Common tasks

- **Run a refinement iteration**: REFINEMENT.md, end to end. Output: one MR.
- **Execute a spike**: take the claim from SPIKES.md verbatim; build the minimal
  experiment; append the result row; supersede ADRs if the claim broke.
- **Add a buildable unit**: create `.kiro/specs/<unit>/` with EARS requirements that
  cite ADRs, a design that cites SPEC sections, and tasks with verifiable done-criteria.
