# Interview record — "the answers"

The stakeholder interview that produced decisions D1–D18 ([`SPEC.md`](SPEC.md) §0) and
ADRs 0001–0014. Stakeholder: platform owner (julian.burns50@gmail.com). Format: fast
multiple-choice rounds with delegation allowed ("you decide → recommendation logged").

## Round 1 — shape of the platform (2026-06-12)

| Q | Question | Answer | → |
|---|---|---|---|
| 1 | What is the unit of promotion — the AWS account, the repo, or both? | **Hybrid**: repo is the promotable truth; account graduates logically; pre-prod is a rebuild | D1, ADR-0002 |
| 2 | Who is this for — one team, BUs via a platform team, or external? | **Platform team serving BUs** | D2, ADR-0004 |
| 3 | GitLab topology? | **Enterprise private (self-managed)**, stage-scoped runners, OIDC to AWS | D3, ADR-0004 |
| 4 | How many stages in the ladder? | **Delegated** → recommended 4 | D4 → D12, ADR-0003 |

## Round 2 — mechanics

| Q | Question | Answer | → |
|---|---|---|---|
| 5 | Role of Docker/OCI (noting it "appears intermediately")? | **Delegated** → OCI as evidence carrier from S1; direct code deploy in S0 | D5, ADR-0005 |
| 6 | Which determinism layers (contracts / replay / live evals)? | **All three, staged**, plus rule-based module/bootstrap compliance attestation | D6, ADR-0006 |
| 7 | Model governance ladder? | **Delegated** → any → pin-on-baseline → allowlist → pinned+attested | D7, ADR-0007 |
| 8 | What happens at lease expiry without graduation? | **Harvest then nuke** | D8, ADR-0008 |

## Round 3 — composition, evidence, authority

| Q | Question | Answer | → |
|---|---|---|---|
| 9 | Template composition vs skill generation? | **Golden templates; skills adapt, never author** | D9, ADR-0009 |
| 10 | Where does evidence live? | **Delegated** → GitLab-native, manifest-linked to AWS runtime evidence | D10, ADR-0010 |
| 11 | What does the platform team actually control? | **GitLab instance + Bedrock/AgentCore estate only** — not AWS org/SCPs (CCoE dependency) | D11, ADR-0011 |

## Round 4 — v0.2 confirmation round

| Q | Question | Answer | → |
|---|---|---|---|
| 12 | Confirm the 4-stage ladder? | **Confirmed** | D12, ADR-0003 |
| 13 | v1 harvest scope? | **Records only**; Memory export deferred to v2 (trigger: park-and-revive demand) | D13, ADR-0008 |
| 14 | Evidence verifier form? | **Catalog component + CLI**, no standing service | D14, ADR-0012 |
| 15 | When is the repo created? | **At lease approval** | D15, ADR-0013 |

## Round 5 — directives (free-form)

| Directive | Response | → |
|---|---|---|
| "Simplify the DX and platform operator experience, but no simpler" | One file / three interactions; two operated things / four alarms; codified "no simpler" floor | D16–D18, ADR-0014 |
| "Halts problem?" (risk challenge) | Bounded waits everywhere (cleanup always wins); gates verify finite artifacts against decidable predicates, never programs — added to the floor | ADR-0006, ADR-0008 |
| "Is it high quality / risky?" | Quality defended; three named risks → Spike 0 defined ([`SPIKES.md`](SPIKES.md)) | SPIKES |

## Open questions (carry-forward)

| # | Question | Default until answered |
|---|---|---|
| O1 | Who arbitrates the catalog contribution path (E9)? | Platform team only |
| O2 | Permanent naming ("Causeway", stage names)? | Working titles stand |

## Round 6 — SCP authority (2026-06-13)

| Q | Question | Answer | → |
|---|---|---|---|
| 16 | "What if I do control SCPs — why would that help, do we want it?" / "Be opinionated: what is the target?" | **Target: delegated SCP admin over the AccountPool OU subtree**, landed before first S2 entry; detective-only is launch posture only; whole-org ownership refused permanently; fallback = per-unit risk-acceptance sign-off at S2 entry | D19, ADR-0015 |

## Round 7 — fork and left-shift challenges (2026-06-13)

| Q | Question | Answer | → |
|---|---|---|---|
| 17 | "Why not wrap or fork ISB?" | We already wrap (`causeway-control` is the facade). **Fork only behind three sequential gates**: S0-1 finds no hold AND upstream contribution rejected AND fallback race window unacceptable | D20, ADR-0016 |
| 18 | "Why not the agentcore CLI shifted further left?" | **Preview left, mint centrally**: `causeway verify` runs the gate's exact checks locally (advisory); evidence is only admissible from platform runners/keys; agentcore-cli consumed, never forked/wrapped | D21, ADR-0016 |
