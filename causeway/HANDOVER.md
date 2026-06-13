# Handover — Causeway (for Codex / any incoming agent)

You are picking up **Causeway**: a specification + decision record for extending **AWS
Innovation Sandbox (ISB)** into a graduated, agentic-development-first path from sandbox to
pre-prod, with **GitLab** as the evidence-generating outer loop. **This spec is not ISB** —
it is the thin extension that consumes ISB via its API and events.

- **Git root**: `/home/user/.agents` · **this project**: `causeway/` (all doc paths are
  relative to `causeway/`). · **Branch**: `claude/great-bardeen-9b9lpl`. · **No PR open.**
- **State**: spec **v0.12**, **29 ADRs** (D1–D34). **No production code yet — by design.**
- **Canonical agent contract**: [`AGENTS.md`](AGENTS.md) (Codex reads this natively). Read
  it first; this file is the orientation layer on top of it.

## Read these, in order
1. [`AGENTS.md`](AGENTS.md) — operating rules (immutability, traceability, no-invent, design-on-known-behaviour).
2. [`docs/MENTAL-MODEL.md`](docs/MENTAL-MODEL.md) — the idea in one page.
3. [`docs/SPEC.md`](docs/SPEC.md) — normative spec. §0 decision log is load-bearing; §4.5 is the ISB coherence map.
4. [`docs/adr/README.md`](docs/adr/README.md) — the 29 decisions and why.
5. [`docs/REFINEMENT.md`](docs/REFINEMENT.md) — how the spec evolves (the loop).
6. [`docs/DEFINITION-OF-DONE.md`](docs/DEFINITION-OF-DONE.md) — acceptance per epic ("what must be true to finish").
7. [`docs/SKILLS.md`](docs/SKILLS.md) — skill contracts + required tests · [`docs/TESTING.md`](docs/TESTING.md) — test strategy.
8. [`docs/SPIKES.md`](docs/SPIKES.md) — confirmations/calibrations (they do **not** block the build).

## How work happens here — two modes

**Mode A — refine the spec.** Triggered by "refine / iterate / take this through a loop".
Follow [`docs/REFINEMENT.md`](docs/REFINEMENT.md) end to end (FRAME → INTERVIEW → RECORD →
DELTA → EVIDENCE → GATE). One MR per iteration; bump the SPEC version once; every
load-bearing answer becomes a decision-log row **and** a new immutable ADR; regenerate
downstream artifacts (architecture, runbooks, comms, deck) in the same change.

**Mode B — build.** The spec is ready to start implementing. Build order is
[`docs/SPEC.md` §11](docs/SPEC.md):
1. **E1 — the control project** (`causeway-control`): EventBridge→GitLab trigger routes;
   `causeway/lease` component (request/renew/freeze/terminate via the ISB API); sole
   manifest writer. Everything hangs off this.
2. **E3/E4 — the catalog + verifier**: `causeway/` CI components, policy packs, the
   evidence verifier CLI, certificate issue/revoke.
3. then E2 bootstraps, E5 templates, E6 model governance, E10 self-asserted governance, etc.

Buildable units are specced in [`.kiro/specs/`](.kiro/specs/) (requirements in EARS,
design citing SPEC sections, tasks with done-criteria). Live unit: **`risk-cost-adjudicator`**.

## The spikes posture (important)
Per **ADR-0028**, the design proceeds on **validated ISB behaviour**; spikes only
**confirm a narrow unknown or calibrate a magnitude** — none blocks the build. The biggest
former risk (a pre-cleanup harvest hold) was **designed away** by continuous harvest
(ADR-0029). Do not treat [`docs/SPIKES.md`](docs/SPIKES.md) as a gate; treat it as a
parallel confirmation list with fallbacks already designed.

## Open questions (defaults hold until a stakeholder decides) — [`docs/ANSWERS.md`](docs/ANSWERS.md)
- **O1** catalog-contribution arbitration → default: platform team only.
- **O2** permanent naming ("Causeway", stage names) → working titles stand.
- **O3** split `SPEC.md` (~800 lines) into linked section files → keep monolithic for now.
- **O4** who grants/revokes a crew's qualification envelope → platform grants; attestation
  history + adjudicator govern.

## Conventions
UK English in prose. Mermaid for diagrams in docs; inline SVG in the deck. One MR per
refinement iteration. Commit subjects state the iteration, e.g. `refine: v0.13 — resolve O1`.
Never push to another branch without explicit permission. Do **not** open a PR unless asked.

## Self-check before you commit
Run [`scripts/check.sh`](scripts/check.sh) — it verifies ADR count vs index, every ADR is
indexed, version-string consistency across SPEC/README/AGENTS, and decision-log contiguity.
It must exit 0. (It does not replace the human traceability review in REFINEMENT.md.)

## Is it ready? (ready = another agent can continue)
This repo is **ready to hand over and continue** — refine or build. It is **not** "done"
(no code yet, by design). The continuation bar is met:

- [x] **State captured** — version, 29 ADRs (tiered), decision log D1–D34, coherence map §4.5.
- [x] **Next actions defined** — build order (E1 first, §11) and open questions O1–O4 with defaults.
- [x] **Rules documented** — `AGENTS.md` (immutability, traceability, no-invent, design-on-known-behaviour).
- [x] **"Done" defined** — `docs/DEFINITION-OF-DONE.md` gives acceptance criteria per epic; `docs/TESTING.md` the test layers; `docs/SKILLS.md` the skill contracts+tests.
- [x] **Self-check** — `scripts/check.sh` is green (counts, links, versions, decision contiguity, epics-have-DoD).
- [x] **Honesty** — ADRs tiered (not all equal); cost-cap limits, ISB boundary, and unknowns stated plainly.

What a continuing agent still must do: implement (nothing is built), run the spikes as
parallel confirmations, and resolve O1–O4 when a stakeholder is available.

## Suggested first tasks for Codex
1. Run `scripts/check.sh`; skim `AGENTS.md` + `docs/SPEC.md` §0–§4.5 to load the model.
2. If building: open `.kiro/specs/` and scaffold **E1 control project** as a new unit
   (`.kiro/specs/control-project/`), citing ADR-0001/0013/0024 and SPEC §4.1/§2.5.
3. If refining: pick an open question (O1 or O4 are the cleanest) and run the REFINEMENT
   loop for one iteration.

## Known cleanup backlog (not blocking)
- O3 spec split.
- `.kiro/specs/spike-0-harvest-hook/` is **superseded by ADR-0029** (continuous harvest) —
  see the note at its top; it is now a non-blocking confirmation, not a buildable unit.
- The deck uses a few emoji glyphs as icons (render flat on bare Linux) — swap for pure
  vector if presenting from Linux.
