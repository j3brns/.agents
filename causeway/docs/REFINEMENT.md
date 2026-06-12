# The refinement loop

How this spec evolves — runnable by a human, or by a CLI agent (Kiro, Claude Code, or
similar) following [`../AGENTS.md`](../AGENTS.md). The loop is the same machine that
produced v0.1→v0.4; this document makes it repeatable.

## The loop

```
   ┌─► 1. FRAME ──► 2. INTERVIEW ──► 3. RECORD ──► 4. DELTA ──► 5. EVIDENCE ──► 6. GATE ─┐
   └──────────────────────────────────────────────────────────────────────────────────────┘
```

1. **FRAME** — collect the question set for this iteration from: open questions in
   [`ANSWERS.md`](ANSWERS.md) §Open, risks in [`SPEC.md`](SPEC.md) §12, spike results in
   [`SPIKES.md`](SPIKES.md), and anything new the stakeholder raises. Each question must
   be *decision-shaped*: 2–4 mutually exclusive options, a recommended default, and the
   consequence of each. Questions without a recommended default are not ready to ask.
2. **INTERVIEW** — put the round to the stakeholder as fast multiple-choice (agents: use
   your ask-user mechanism; humans: an MR discussion). Delegation ("you decide") is a
   valid answer and is logged as such.
3. **RECORD** — append the round to [`ANSWERS.md`](ANSWERS.md). Every *load-bearing*
   answer becomes a decision-log row (Dnn) in [`SPEC.md`](SPEC.md) §0 **and** a new ADR.
   ADRs are immutable: changing a past decision means a new ADR with
   `Supersedes: ADR-00xx`, never an edit.
4. **DELTA** — apply the decisions to [`SPEC.md`](SPEC.md) as a single MR: bump the
   version (v0.N+1), update the iteration record (§15), and regenerate downstream
   artifacts in the same MR ([`ARCHITECTURE.md`](ARCHITECTURE.md) diagrams,
   [`../runbooks/`](../runbooks/), [`../.kiro/`](../.kiro/) packages, README claims).
   A spec change whose downstream artifacts don't move is presumed incomplete.
5. **EVIDENCE** — assumptions stated in ADRs or the spec get converted to facts by
   spikes ([`SPIKES.md`](SPIKES.md)): each spike has a falsifiable claim, a deadline,
   and a fallback design. Spike results are appended to SPIKES.md and linked from the
   ADR they confirm or break (a broken assumption ⇒ superseding ADR, go to step 3).
6. **GATE** — before merge, run the traceability check (below). Then loop, or stop when
   the open-question list is empty and all Spike-0 claims are facts — that state is
   **v1.0: roadmap-committable**.

## Traceability invariant (the gate)

Every one of these chains must be unbroken, in both directions:

```
ANSWERS.md round → Dnn row (SPEC §0) → ADR-00nn → SPEC section(s) → downstream artifact
```

Checks an agent (or reviewer) performs:
- every Dnn in SPEC §0 cites at least one ADR via `docs/adr/README.md`; every ADR cites
  its Dnn(s) and spec sections; every ADR is reachable from the index
- SPEC version bumped exactly once per refinement MR; §15 iteration record updated
- no edits to previously accepted ADR files (git diff must show only additions under
  `docs/adr/`)
- no hand edits to machine-written artifacts (promotion-manifest examples are
  illustrative; real ones are generated)
- the "no simpler" floor (SPEC §14.1): any MR that weakens a floor row must contain a
  replacement mechanism and a superseding ADR

## Cadence and roles

- **Stakeholder** (platform owner): answers rounds, owns delegated-decision overrides.
- **Editor** (human or CLI agent): runs FRAME→GATE; one MR per iteration.
- **Reviewers**: platform team for spec deltas; CCoE flagged on anything touching
  ADR-0011's boundary (SCPs, OUs, account vending).
- Iterations are event-driven (a spike result, a new risk, a stakeholder directive),
  not calendar-driven. AI-DLC framing: one refinement iteration ≈ one bolt.
