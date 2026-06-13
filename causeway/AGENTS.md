# AGENTS.md — operating contract for CLI agents

For **Codex**, Kiro, Claude Code, and any other agent working in this repo. This file is
the canonical agent contract (Codex reads `AGENTS.md` natively). **New here? Start with
[`HANDOVER.md`](HANDOVER.md)** for current state, build order, and first tasks. Kiro users: the
`.kiro/steering/` files mirror this contract; `.kiro/specs/` holds the
requirements/design/tasks packages for buildable units.

## What this repo is

The **specification and decision record** for Causeway — the extension of Innovation
Sandbox on AWS into a graduated innovation stage (sandbox → pre-prod) for AgentCore
workloads, with GitLab as the evidence-generating outer loop. There is **no production
code here yet**; the deliverables are documents with hard consistency invariants, plus
spike implementations when tasked.

## Map

- `HANDOVER.md` — **start here**: current state, build order, first tasks, self-check.
- `scripts/check.sh` — repo consistency check (ADR count/index/versions/decisions). Run before committing.
- `docs/SPEC.md` — normative spec (current: v0.13). §0 decision log D1–D34 is load-bearing.
- `docs/adr/` — 29 immutable ADRs. **Never edit an accepted ADR**; supersede with a new one.
- `docs/ANSWERS.md` — interview record; append-only.
- `docs/REFINEMENT.md` — the refinement loop. **If asked to "refine", "iterate", or
  "take this through a loop", follow that document exactly** (FRAME → INTERVIEW →
  RECORD → DELTA → EVIDENCE → GATE).
- `docs/DEFINITION-OF-DONE.md` — acceptance criteria per epic (the "finished" gate).
- `docs/SKILLS.md` — skill contracts + required tests · `docs/TESTING.md` — test strategy.
- `docs/SPIKES.md` — confirmations/calibrations; append results, never rewrite claims.
- `docs/ARCHITECTURE.md`, `runbooks/` — regenerate when the spec changes (a spec delta
  whose downstream artifacts don't move is incomplete).
- `.kiro/specs/<unit>/` — requirements.md (EARS), design.md, tasks.md per buildable unit.

## Hard rules — and why each exists

A rule without a reason can't be applied at the edges. Each rule carries its **why** so you
can reason about cases it doesn't literally cover, instead of either ignoring it or obeying
it blindly.

1. **Traceability invariant** — answer → Dnn (SPEC §0) → ADR → spec section → downstream
   artifact, unbroken both ways; run `scripts/check.sh` and the REFINEMENT gate before any
   commit. *Why: the whole value of this repo is that one source of truth maps cleanly onto
   every artifact. A broken link means a reader can't tell what's true, and the next agent
   inherits a guess instead of a fact.*
2. **ADRs are immutable — supersede, never edit. ANSWERS.md is append-only. SPEC version
   bumps once per refinement iteration (§15 updated).** *Why: decisions are a historical
   record. Editing one rewrites history and hides why we changed course; superseding keeps
   both the old reasoning and the correction, so a settled trade-off isn't re-litigated.*
3. **The "no simpler" floor (SPEC §14.1) is weakened only by a superseding ADR that names a
   replacement mechanism.** *Why: each floor item carries a property the system exists to
   provide; "simplifying" one usually deletes that property silently. Demanding a
   replacement makes the cost explicit and refusable.*
4. **Never invent capabilities for ISB, agentcore-cli, or GitLab. Design from validated
   behaviour (§4.5 coherence map); a spike only *confirms* a narrow unknown or *calibrates*
   a magnitude — it never blocks the build, and must state its designed answer + fallback
   (ADR-0028). Unverified → mark as assumption, route to SPIKES.md.** *Why: these move fast,
   and a wrong assumption propagates into every dependent decision. The coherence map exists
   so the design rests on facts, not hopes — and so spikes stop being a place to defer
   design.*
5. **Decisions belong to the stakeholder.** Load-bearing + undecided → ask (2–4 options,
   recommended first; delegation is a valid, logged answer). *Why: an agent guessing a
   load-bearing call produces confident, unowned architecture the stakeholder never chose —
   and that is the most expensive kind to unwind later.*
6. **No unbounded waits; gates verify finite artifacts, never programs (ADR-0006/0008).**
   *Why: "wait until done" and "verify the generated code is correct" are halting-problem-
   shaped — unsound as stated. Deadlines and decidable predicates are the only honest forms.*
7. **Durable methods only; ad-hoc scripts go in `.scratch/` (gitignored).** Anything that
   lands in `scripts/` is named, owned, and maintained; throwaways never enter the tracked
   tree. *Why: a one-off script left in the repo becomes unowned cruft — the next agent
   fears to delete it and may mistake it for a dependency. `.scratch/` lets you experiment
   freely without polluting the durable surface. Prefer ephemeral inline commands over
   committing a script you won't maintain.*
8. **No patches, shims, or wrappers that create tech debt — this service is not in
   production.** There is no deployed system to stay compatible with and no data to migrate,
   so a "temporary" workaround has all the cost and none of the excuse. Fix the root, change
   the design, or supersede the ADR. *Why: tech debt is a loan against a future that isn't
   constrained yet. Taking it pre-production is pure loss — you pay interest to protect
   nothing. (Note: wrapping an external dependency at its boundary — ISB, the CLI — is the
   opposite and is required; see ADR-0001/0016. The ban is on internal hacks-around-our-own-
   design.)*
9. **No sprawl — one home per thing.** Decisions in ADRs, the record in ANSWERS, methods in
   `scripts/`, the contract here. Never create a second place for the same truth. *Why: two
   copies drift, and the moment they disagree the traceability invariant is broken and
   readers must guess which is real.*
10. **This file is a curated resource — edit it deliberately, keep it tight, keep the
    why-cases.** *Why: it's the contract every agent loads first. Casual additions erode its
    authority and grow its length until people stop reading it — and then the rules stop
    working at all.*
11. **Commit discipline: defer every commit until all affected docs are updated *and* read
    through for flow and correctness.** A change and its documentation land together,
    reviewed as one. *Why: a commit that updates spec/code before the docs catch up makes
    the repo briefly lie about itself. Batching the doc update with a flow read-through keeps
    the record always-true and readable — not merely structurally consistent.*
12. **Conventions:** UK English in prose; Mermaid for doc diagrams, inline SVG for the deck;
    one logical change per commit; commit subjects state the iteration (e.g.
    `refine: v0.14 — resolve O1`); never push to another branch without permission; no PR
    unless asked. *Why: consistency is what lets a reader skim; every surprise costs attention.*

## Common tasks

- **Run a refinement iteration**: REFINEMENT.md, end to end. Output: one MR.
- **Execute a spike**: take the claim from SPIKES.md verbatim; build the minimal
  experiment; append the result row; supersede ADRs if the claim broke.
- **Add a buildable unit**: create `.kiro/specs/<unit>/` with EARS requirements that
  cite ADRs, a design that cites SPEC sections, and tasks with verifiable done-criteria.
