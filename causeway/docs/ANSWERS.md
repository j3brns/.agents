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

## Round 8 — runbook operability (2026-06-13)

| Q | Question | Answer | → |
|---|---|---|---|
| 19 | "Are the runbooks Kiro-operatable?" | Readable yes, executable no — fixed: every step tagged **[agent-ok] / [human-ack] / [ccoe]**, API verbs explicit, verifications and bounds stated, dry-run rehearsal until deployment | D22, ADR-0017 |

## Round 9 — operator onboarding and docs publishing (2026-06-13)

| Q | Question | Answer | → |
|---|---|---|---|
| 20 | "How, when, where do individual ISB operators get started and served?" | Role mapping Admin=platform / Manager=BU lead (ISB UI via issue deep-link) / User=developer **headless**; BU-once, developer-once, experiment-per-issue-form onboarding; minutes-to-sandbox target; recurring tickets = documentation bugs | D23, ADR-0018 |
| 21 | "Repo must publish docs to a collection/wiki on GitLab Pages" | **Docs-as-code on Pages** (MkDocs Material, strict build, on default-branch merge); **wiki rejected** (no MR review, breaks traceability); pages job becomes a catalog component later | D24, ADR-0019 |

## Round 10 — promotion comms + self-asserted governance (2026-06-13)

| Q | Question | Answer | → |
|---|---|---|---|
| 22 | "Communicate out of band to promote the concept — PRFAQ, tenets, mental model?" | Built all three as the human on-ramp: [PRFAQ](PRFAQ.md), [TENETS](TENETS.md) (12 tenets, tie-break ordered), [MENTAL-MODEL](MENTAL-MODEL.md) (wall→ramp, parcel+passport, customs) | (deliverables) |
| 23 | "Is the spec/repo optimally structured?" | Good for machine traceability, weak human on-ramp → comms trio fixes it; SPEC.md ~700 lines is near a split — logged O3 for v1.0 | O3 |
| 24 | "How is progression through attestation certified; output to docs?" | New **attestation certificates** — signed, per-unit/per-stage, **published to Pages** as a stamped passport; revocation append-only | D27, ADR-0022 |
| 25 | "How GitLab-centric; how do we move to self-asserted, trust-but-verify?" | GitLab-centric by choice over **tool-neutral data** (portability seam); governance moved to **self-assertion + async-verify-with-revocation** | D25/D28, ADR-0020/0023 |
| 26 | "Two pairs of eyes on risk/cost elevation — a skill for that? Inner loop unless agent adjudicates." | Yes — the **risk/cost adjudicator skill**: fail-safe, monotonic; four-eyes only on adjudicated risk or commercial/cost elevation (and S2→S3); inner loop otherwise | D26, ADR-0021 |

## Open questions (carry-forward, updated)

| # | Question | Default until answered |
|---|---|---|
| O1 | Who arbitrates the catalog contribution path (E9)? | Platform team only |
| O2 | Permanent naming ("Causeway", stage names)? | Working titles stand |
| O3 | Split SPEC.md into linked section files at v1.0? | Keep monolithic + comms on-ramp for now |

## Round 11 — pitch deck (2026-06-13)

| Q | Question | Answer | → |
|---|---|---|---|
| 27 | "Make some slick slides — frame it as accelerating fast permissive AI access with progressive conformance, no continuous out-of-band approvals" | Self-contained HTML deck ([`slides/causeway.html`](../slides/causeway.html), 14 slides) + presenter talk-track; acceleration-led narrative, adjudicator + trust-but-verify as the "no continuous approvals" core; published to Pages | (deliverable) |

## Round 12 — delegate to crews, structural conformance, cost caps (2026-06-13)

| Q | Question | Answer | → |
|---|---|---|---|
| 28 | "It doesn't promote reverting delegation to the builders — qualified crews, XO/launch-code, two actors agree, one may be an agent" | **Authority reverts to qualified crews**; out-of-band approver replaced by the **two-person/launch-code rule** (≤ one agent key, neither the author, inside the envelope); off-band only beyond the crew's qualified envelope | D29, ADR-0024 |
| 29 | "Why aren't we moving accounts through progressive OUs with increasing conformance?" | We are now — **conformance is structural**: the **OU/SCP ratchet** (account climbs additive SCP tiers; certificate authorizes; monotonic, per-lease) is the primary preventive enforcement; pipeline-only is the fallback. New Spike S0-4 | D30, ADR-0025 |
| 30 | "Cost caps are vital — for the ISB side" | **Hard, ISB-enforced caps in the sandbox (S0–S2)**: lease `maxSpend` + `budgetThresholds`→freeze; ceiling→terminate (control-plane-driven, since freeze ≠ spend-stop); headroom for Cost-Explorer latency | D31, ADR-0026 |
| 31 | "Advisory for the pre-prod side — FinOps process applies" | **S3 pre-prod = advisory + org FinOps** (no hard freeze on a non-disposable account); Causeway feeds advisory cost evidence | D31, ADR-0026 |

## Round 13 — ISB coherence + agentic-first (2026-06-13)

| Q | Question | Answer | → |
|---|---|---|---|
| 32 | "These are features of the AWS ISB — review it thoroughly, validate coherence, not generalities" | Launched a sourced ISB validation pass; corrected OU-ratchet realization and cost-cap attribution to actual ISB behaviour (lifecycle OUs + drift-quarantine; budget actions = alert/freeze, terminate is Causeway-driven); added §4.x ISB coherence map | (see §3.1, §4, ADR-0025/0026 corrections) |
| 33 | "Be clear this is agentic development first" | Added **scope-primacy** statement (SPEC intro, README, tenet 1, mental-model): the sole target workload is agents on Bedrock AgentCore under AI-DLC; every mechanism is shaped by that | (framing) |

## Open questions (carry-forward, updated)

| # | Question | Default until answered |
|---|---|---|
| O1 | Who arbitrates the catalog contribution path (E9)? | Platform team only |
| O2 | Permanent naming ("Causeway", stage names)? | Working titles stand |
| O3 | Split SPEC.md into linked section files at v1.0? | Keep monolithic + comms on-ramp |
| O4 | Crew qualification model — who grants/revokes a crew's risk/cost envelope? | Platform team grants; attestation history + adjudicator govern |
