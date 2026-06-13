# The Graduated Innovation Stage ("Causeway")

**Spec v0.13 — 2026-06-13 — status: readiness for agent handover — added Definition-of-Done
(acceptance per epic), Skills inventory, Testing strategy, and honest ADR significance tiers.
No new decisions (completion/honesty, not new architecture). Prior headers retained.**

**Spec v0.12 — 2026-06-13 — status: design-on-known-behaviour discipline — spikes reclassified
as confirm/calibrate not design-blockers (D33, ADR-0028); harvest redesigned continuous, removing
the cleanup-hold dependency (D34, ADR-0029). Prior headers retained.**

**Spec v0.11 — 2026-06-13 — status: cost-cap honesty — budget is a lagging backstop, the
real-time ceiling is preventive (D32, ADR-0027 supersedes ADR-0026's 'hard by construction');
boundary clarified (this spec is not ISB). Prior headers retained for history.**

**Spec v0.10 — 2026-06-13 — status: authority delegated to qualified crews (two-person rule),
conformance made structural (OU ratchet), cost caps hard-in-sandbox/advisory-in-pre-prod
(D29–D31, ADR-0024–0026).**

**Spec v0.9 — 2026-06-13 — status: self-asserted trust-but-verify governance + attestation
certificates + portability seam (D25–D28, ADR-0020–0023); comms artifacts added
([PRFAQ](PRFAQ.md), [TENETS](TENETS.md), [MENTAL-MODEL](MENTAL-MODEL.md)); decisions
D1–D28 are mirrored as immutable ADRs in [`docs/adr/`](adr/); interview record in
[`ANSWERS.md`](ANSWERS.md); refinement process in [`REFINEMENT.md`](REFINEMENT.md)**

Extending **Innovation Sandbox on AWS (ISB)** into a first-class SDLC stage, so agentic
workloads built under AI-DLC graduate from a prudently permissive sandbox to pre-prod
through **progressive, evidence-generating GitLab pipelines** — removing the wall between
innovation and pre-prod.

> **Scope primacy — agentic development first.** Causeway is *not* a general-purpose cloud
> sandbox. Its single target workload is **agents on Amazon Bedrock AgentCore, built under
> AI-DLC** (§1.3). Every mechanism — the `agentcore/` artefact as the promotable unit, the
> evaluators/replay/Cedar-tool gates, the model-governance ladder, the AgentCore-native
> observability feeding evidence — is shaped by that workload. Read everything below as
> "for building agents", not "for arbitrary infrastructure".

> **Boundary — this spec is *not* ISB.** Innovation Sandbox on AWS is AWS's product, with
> its own source and spec; Causeway neither owns nor re-specifies it. This document specs
> the **thin extension** that consumes ISB via its API and events (ADR-0001). Where a
> capability is ISB's (leases, budgets, OUs, Nuke) vs. Causeway's (stages, evidence,
> certificates, two-key, the SCP ratchet, the terminate automation), the **coherence map
> §4.5** says so line by line.

---

## 0. Decision log (from stakeholder interview)

| # | Decision | Answer |
|---|----------|--------|
| D1 | Promotion unit | **Hybrid**: the GitLab repo (agent artefact bundle + IaC) is the promotable truth; the account *logically* graduates by lease-tier transition, and pre-prod entry is a rebuild into a governed account |
| D2 | Tenancy model | Platform team serving BUs; **tenancy implemented GitLab-side only** (per-BU groups, shared AWS pool) |
| D3 | GitLab topology | **Enterprise private (self-managed) GitLab**, stage-scoped runner fleets, OIDC federation to AWS |
| D4 | Stage ladder | Delegated → **recommend 4 stages** (§3) |
| D5 | Docker/OCI role | Delegated → **OCI as the evidence carrier from S1 onward; direct code deploy in S0** (§5) |
| D6 | Determinism | **All three layers, staged** (contracts → replay → thresholded evals), **plus rule-based module/bootstrap compliance attestation** (§6) |
| D7 | Model governance | Delegated → **any-model → pin-from-first-baseline → allowlist → pinned+attested** (§7) |
| D8 | Lease expiry | **Harvest then nuke** (§4.4) |
| D9 | Template composition | **Golden templates; agent skills adapt, never author net-new bootstraps** (§8) |
| D10 | Evidence home | Delegated → **GitLab-native system of record, manifest-linked to AWS runtime evidence** (§9) |
| D11 | Control scope | Platform team owns **GitLab instance admin** and the **Bedrock/AgentCore estate** end-to-end. It does **not** own AWS Organizations/SCPs or org networking — these are dependencies on the CCoE (§2.3) |
| D12 | Stage ladder confirmed | **Four stages** (S0 Explore → S1 Incubate → S2 Harden → S3 Pre-prod) |
| D13 | Harvest scope v1 | **Records only**: repo state, final artefact digest, eval baselines, experiment record. AgentCore Memory export deferred to v2 (E7 story, trigger: first "park & revive" demand) |
| D14 | Evidence verifier form | **Versioned catalog component + small CLI** run in the promotion pipeline; verdict recorded as a signed pipeline artifact. No standing service in v1 |
| D15 | Repo timing | **Repo created at lease approval** from the stage template — every experiment is born with its outer loop attached |
| D16 | Developer surface | **One file, three interactions** (§2.4): developers edit only `causeway.yml`; start / push / promote-by-MR. ISB UI, manifests, CI config and lease mechanics are never developer-facing |
| D17 | Operator surface | **Two operated things** (§4.1): a trigger-driven **control project** (orchestrator-as-pipelines, no service, no database) and a **catalog monorepo** on a single release train (`release: N`) |
| D18 | Simplicity floor | "No simpler" list (§15): stages, verifier, digest pinning, lineage, harvest-before-nuke, pinned-model evals, and the CCoE boundary are irreducible and may not be optimised away |
| D19 | SCP target posture | **Preventive stage enforcement is the target**: negotiate **delegated SCP admin over the AccountPool OU subtree** with the CCoE, landed before first S2 entry. Detective-only = launch posture only. Whole-org SCP ownership refused permanently. Fallback if delegation declined: per-unit risk-acceptance sign-off at S2 entry (§2.3, ADR-0015) |
| D20 | Fork rule | We wrap, never fork: `causeway-control` is the single ISB facade. Forking permitted only behind **three sequential gates** — S0-1 finds no hold, AND upstream contribution rejected, AND fallback race window unacceptable (ADR-0016) |
| D21 | Left-shift rule | **Preview left, mint centrally**: the gate's verifier/policy/replay checks run locally as advisory `causeway verify` (same binary+versions as the gate); evidence is admissible only from platform runners with platform keys; agentcore-cli consumed, never forked or wrapped (ADR-0016) |
| D22 | Runbook operability | Runbooks are **agent-operatable behind a human-ack boundary**: every step tagged [agent-ok]/[human-ack]/[ccoe] with explicit API calls, verifications and bounds; reversible = autonomous, irreversible = gated (ADR-0017) |
| D23 | Operator onboarding | Role mapping: ISB Admin = platform only; Manager = BU lead (ISB UI via issue deep-link); User = developer, **headless** — GitLab is the only developer front door. BU-once / developer-once / experiment-per-issue-form; minutes-to-sandbox for auto-approved S0 (ADR-0018, runbooks/onboarding.md) |
| D24 | Docs publishing | **Docs-as-code to GitLab Pages** (MkDocs Material, strict build, default-branch merges); wiki rejected — no MR review, breaks the traceability invariant (ADR-0019) |
| D25 | Self-asserted governance | **Inner loop unless an agent adjudicates risk or commercial/cost exposure**: self-assert to move; trust-but-verify with revocation; four-eyes only on adjudicated elevation and at S2→S3. Authority moves from platform-held to self-asserted-and-earned (§2.5, ADR-0020) |
| D26 | Risk/cost adjudicator | A fail-safe, monotonic **adjudicator skill** classifies risk + commercial/cost per change; trip-wire packs are authoritative, reasoning is additive-only, ambiguity escalates; its verdict is itself evidence ([skill spec](../.kiro/specs/risk-cost-adjudicator/requirements.md), ADR-0021) |
| D27 | Attestation certificates | Each stage transition issues a signed, human-readable **certificate** (evidence + adjudication + approvers + verifying release), **published to the docs site** as the unit's stamped passport; revocation is append-only (§9.3, ADR-0022) |
| D28 | Portability seam | **GitLab-centric by choice, not by trap**: manifests, certificates, and adjudicator verdicts are tool-neutral data; GitLab approval rules / Pages / catalog are the current binding. No portability abstraction tax paid in v1 (ADR-0023) |
| D29 | Delegated crews + two-person rule | Authority **reverts to qualified crews**; elevation is satisfied by the **two-person (launch-code) rule** — two authorized actors concur, **≤ one may be an agent**, **≥ one independent of the author** (no self-approval), both inside the crew's envelope. **Out-of-band escalation only when beyond the crew's qualified envelope** (corrects the original out-of-band routing) (§2.5, ADR-0024) |
| D30 | Progressive-conformance SCP ratchet | Stages are **additive SCP tiers** (`S0⊂S1⊂S2`); because ISB OUs are lifecycle and drift-quarantines moves, the tier is realised as **account-level SCPs while the account stays in `Active`** (not stage-OU moves). Promotion **attaches the next tier, authorized by the certificate**, monotonic, per-lease (detached on recycle). Pipeline→evidence; certificate→authorizes; SCP→enforces. Primary; pipeline-only is fallback. Spike S0-4 (§3.1, §4.5, ADR-0025) |
| D34 | Continuous harvest | Harvest is **continuous** (every push streams digest/baselines/lineage/evidence to GitLab) + a deadline-bounded **final flush at `durationThresholds`**; removes the unverified cleanup-hold dependency. Bounded-wait discipline holds (§4.4, ADR-0029) |
| D33 | Design on known behaviour | **Spikes confirm/calibrate, never block.** Design every answer from validated behaviour (§4.5) first; a spike is justified only for a narrow external unknown or a magnitude to calibrate, and must state the designed answer + fallback (SPIKES.md, ADR-0028) |
| D32 | Cost caps really work? | The ISB budget cap is a **lagging, detective backstop** (Cost-Explorer lag; freeze≠stop; terminate/nuke takes time) bounding spend to `maxSpend`+overshoot. The **real-time hard ceiling is preventive**: SCP-denied expensive vectors + Bedrock/AgentCore token & rate caps. Keep budgets small. Defence in depth; Spike S0-5 (§3.1, ADR-0027 supersedes ADR-0026's 'hard by construction') |
| D31 | Cost caps: hard in sandbox, advisory in pre-prod | **S0–S2: hard** = ISB `maxSpend`/Cost-Explorer tracking + native `ALERT`/`FREEZE_ACCOUNT` **plus Causeway-driven `terminate` at the ceiling** (ISB has no native terminate-at-threshold; freeze≠spend-stop; Cost-Explorer latency→headroom). Bounds crew blast radius by construction; not self-assertable. **S3: advisory + org FinOps** (§3.1, §4.5, ADR-0026). **Honesty (D32/ADR-0027): budget = lagging backstop; real-time cap is preventive (SCP + AgentCore token/rate caps).** |

---

## 1. What we are building on (and why it holds)

### 1.1 Innovation Sandbox on AWS — the substrate

ISB ([github.com/aws-solutions/innovation-sandbox-on-aws](https://github.com/aws-solutions/innovation-sandbox-on-aws))
provides exactly the lifecycle machinery we should not rebuild:

- **Account pool + OU state machine**: `Entry → Available → Active → CleanUp → Available`,
  with `Frozen`, `Quarantine`, `Exit` side states. Accounts are pre-stocked, recycled, never closed.
- **Leases & lease templates**: time/budget-bounded grants with graduated `budgetThresholds`
  / `durationThresholds` (alert → freeze), approval workflow, `costReportGroup` chargeback,
  and **blueprints** (CloudFormation StackSets deployed at lease provisioning).
- **Cleanup**: Step Functions → CodeBuild → AWS Nuke (ekristen fork), with quarantine on failure.
- **A full REST API** (OpenAPI in-repo): `/leases`, `/leaseTemplates`, `/accounts`,
  `/blueprints`, including `freeze`, `terminate`, `eject`, `retryCleanup`.
- **Layered SCPs** per OU: Nuke-supported-services allowlist, restrictions, region limits,
  ISB-resource protection, and write-protection on all non-Active OUs.
- **EventBridge lifecycle events**: `LeaseApproved`, `CleanAccountRequest`,
  `AccountCleanupSucceeded/Failed`, `AccountDriftDetected`, `BlueprintDeploymentRequest`…

### 1.2 The wall, precisely

ISB's deliberate gaps are the spec's reason to exist:

| Gap in ISB | Consequence |
|---|---|
| **No graduation path** — only `eject` (account leaves the pool intact, unmanaged) | Work either dies at lease end or escapes governance entirely |
| **No export/IaC capture** — cleanup destroys everything, archives nothing | Knowledge and artefacts are lost on every recycle |
| **No CI/CD integration** — no pipeline hooks, no API-driven lease examples | The sandbox is an island; the outer loop never sees it |
| **Blueprints are inbound-only, admin-curated CFN StackSets** | No Terraform, no composition, no path from experiment to template |
| **No tenant partitioning of the pool** | Only `costReportGroup` tags and template visibility |
| **No data-egress / promotion review gate** | Nothing governs what leaves a sandbox |

### 1.3 The agentic stack this serves

The workload class is **agents on Amazon Bedrock AgentCore**, developed under **AI-DLC**
(AWS's AI-Driven Development Lifecycle: inception → construction → operations;
mob elaboration; bolts not sprints; `awslabs/aidlc-workflows` steering rules), using the
**current Node `agentcore-cli`** (v0.19.x, June 2026) — *not* the legacy Python
starter toolkit. Relevant CLI facts the design depends on:

- Project config lives in an **`agentcore/` directory**: `agentcore.json` (agents, memory,
  credentials, **evaluators**), `aws-targets.json` (account/region targets per environment),
  `deployed-state.json` (machine-managed). This directory **is** the promotable agent artefact.
- `create / dev / deploy / invoke / add / logs / traces / status`; deployment is CDK-managed;
  **direct code deploy is the default**, containers the explicit alternative (ARM64).
- The platform services we own: Runtime (session-isolated microVMs), **Gateway** (MCP-ification
  of Lambda/OpenAPI/Smithy/MCP targets, **Cedar policy engine** for tool-call governance),
  Memory, Identity (OAuth providers, workload identities), Browser/Code Interpreter,
  Observability (OTel GenAI semantic conventions → CloudWatch GenAI dashboards).
- Gap to carry: gateway/identity/Cedar *admin* subcommands today are richest in the legacy
  toolkit; we wrap the underlying control-plane APIs in pipeline components rather than
  depending on either CLI's admin surface (no tech debt on a deprecated tool).

---

## 2. Concept of operations

### 2.1 One sentence

> A lease is no longer a dead end: it is **stage S0 of the SDLC**, born with a GitLab repo,
> and everything after S0 is the same repo accumulating **deterministically generated evidence**
> through catalogued pipeline components until the attested bundle deploys to pre-prod.

### 2.2 The stage/loop split

- **Inner loop** (developer + AI, AI-DLC bolts): `agentcore dev`, mob elaboration artefacts,
  experiments inside the leased account. Prudently permissive; minutes-fast.
- **Outer loop** (standardised by GitLab): every push runs the stage-appropriate
  **compliance pipeline** from the CI/CD Catalog; evidence accumulates as signed artefacts;
  **promotion = a pipeline run that verifies the evidence ledger and re-vends the next stage**.

### 2.3 Ownership boundary (D11) — the load-bearing constraint

The platform team owns **GitLab** and the **Bedrock/AgentCore estate**, not the AWS org.
Therefore:

- **Progressive governance is enforced primarily in layers we own**: GitLab compliance
  pipelines, protected environments, push rules, runner isolation; and AgentCore Cedar
  policies, Gateway target allowlists, Bedrock model-access policies, AgentCore Identity.
- The **OU/SCP ladder is consumed, not authored — at launch**: ISB ships its SCP set;
  per-stage SCP tiers (§3) are a **declared dependency on the CCoE**, expressed as a
  reviewed contribution to their ISB fork of the policy JSON. The spec degrades
  gracefully — with stock ISB SCPs only, stages S1–S2 still bind via pipeline + Cedar +
  model policy; we lose only infra-API breadth control.
- **Target posture (D19, ADR-0015) — this is the destination, not an option**:
  **delegated SCP administration scoped to the ISB AccountPool OU subtree**, negotiated
  with the CCoE starting now and landed **before any unit reaches S2**. Detective-only
  enforcement is the launch posture, never the end state: an agentic workload holds AWS
  credentials and calls APIs directly, so only a preventive, account-wide control closes
  the gap between "the pipeline would have caught it" and "it could not happen". With
  OU-scoped authority, S2's IaC-only rule becomes a deny-unless-pipeline-OIDC-role SCP
  condition instead of a drift alarm. Whole-org SCP ownership is **refused permanently**
  (org blast radius, Nuke/SCP coupling, regulated-surface accountability — ADR-0011's
  reasoning stands). If the CCoE declines delegation, S2 entry acquires a standing
  risk-acceptance sign-off per unit — making the residual risk *their* recurring
  decision, not our silent default.
- **Pre-prod accounts are vended by the CCoE's landing-zone machinery** (AFT or LZA pattern):
  promotion to S3 is a *rebuild from the attested repo* into a governed account — consistent
  with ISB's design truth that recycled accounts retain no state.

---

### 2.4 The simplicity contract (D16/D17)

Both surfaces are governed by a hard rule: **a person interacts with the platform through
exactly one artefact and a handful of verbs; everything else is machinery they can ignore
until it pages them.**

**Developer contract — one file, three interactions:**

1. **Start**: fill a GitLab issue form ("New experiment": name, BU, one-line hypothesis).
   The control project requests the lease via the ISB API, creates the repo from the stage
   template, and replies on the issue with the repo link and SSO deep-link into the leased
   account. The developer never sees the ISB UI, lease templates, or blueprints.
2. **Build**: `agentcore dev` + `git push`. The generated `.gitlab-ci.yml` is a single
   pinned include and **never edited**; the pipeline reads everything else from
   `causeway.yml` — the only platform file a developer touches:

   ```yaml
   # causeway.yml — the developer's entire platform surface
   unit: bu-payments/triage-agent
   stage: explore              # changing this line via MR = requesting promotion
   eval_suite: bu-payments/evals/triage-agent@0.3
   owners: [jburns]
   release: 7                  # catalog release train; bumped by bot MR, not by hand
   ```

3. **Promote**: open an MR that changes `stage:`. The pipeline runs the evidence verifier;
   green verifier = the MR is approvable; merge triggers the control project to execute the
   transition (next lease tier or S3 rebuild handover). Decline/extend/harvest decisions at
   lease thresholds arrive as **bot-authored issues with action buttons**, not as emails
   from an unfamiliar system.

   Everything else — manifests, lineage stamps, evidence, lease renewals under threshold,
   harvest, blueprint registration — is generated or bot-authored. If a developer ever
   hand-edits a manifest, the verifier rejects it: machine-written means machine-verified.

   Status lives where the developer already looks: MR widgets (verifier verdict, eval
   deltas vs baseline), the repo's environments page (one environment per stage), and a
   stage badge. No separate portal.

**Operator contract — two operated things, four alarms:**

The platform team runs exactly two artefacts beyond the estates it already owns
(GitLab itself, the AgentCore/Bedrock estate, the ISB deployment):

1. The **control project** (§4.1) — orchestration as trigger-driven pipelines. Nothing to
   host, patch, or scale; no database (state of record stays in ISB and GitLab; all jobs
   are idempotent re-derivations from those two APIs).
2. The **catalog monorepo** (§4.1) — every component, policy pack, template, bootstrap,
   and the verifier CLI, released as **one train**: a single `release: N` that consumer
   repos pin and a bot bumps. Operators upgrade the platform by cutting one release;
   rollback is re-pinning one number. (Internally components keep semver for review
   hygiene; externally there is only the train.)

On-call carries **four alarms**, all rare-by-design: harvest timeout racing cleanup,
account quarantined, drift detected, verifier failure *at an approved gate* (verifier
failures in ordinary MRs are the developer's signal, not the operator's). Budget and
duration enforcement stay ISB's job — the platform team does not re-implement them.

### 2.5 Self-asserted governance: delegated to qualified crews, two keys to launch (D25/D26/D29)

The earlier model implied a synchronous gate at every promotion. That over-taxes the
common case, where most changes carry no real risk. The governing principle is now:

> **Inner loop unless an agent adjudicates risk or commercial/cost exposure.**

Three moving parts make this safe rather than merely fast:

1. **Self-assertion.** Crossing a stage line, the developer (or their agent) *asserts*
   readiness by the one-line `causeway.yml` change. The assertion buys **motion**, never
   the stamp — it does not substitute for evidence (see floor §14.1).
2. **The adjudicator** (a catalog skill, [`.kiro/specs/risk-cost-adjudicator/`](../.kiro/specs/risk-cost-adjudicator/requirements.md);
   ADR-0021). On every change it classifies two axes — **risk** (IAM, off-catalog
   resources, network/egress, data class, model) and **commercial/cost** (spend
   trajectory vs. budget, licensing, egress cost) — and returns `self-assertable` or
   `four-eyes-required`. It is **fail-safe and monotonic**: a versioned trip-wire policy
   pack is authoritative; model-assisted reasoning may *add* escalations but never clear
   a ruled one; ambiguity defaults to escalation; **S2→S3 is always four-eyes** (the
   governed-estate boundary). The adjudicator's own verdict is recorded as evidence.
3. **Trust-but-verify, with revocation** (ADR-0020). A `self-assertable` promotion
   proceeds **provisionally**: the verifier still runs, asynchronously; if its evidence
   fails, the certificate is **revoked and the unit frozen**.
4. **The two-person rule — delegated to the crew, not escalated off it** (D29, ADR-0024).
   This is the correction to the original sin of routing elevation to an out-of-band
   approver — which would re-import the very committee the model exists to kill. Authority
   is **delegated down to qualified crews** (builders who hold a qualification for a given
   risk/cost class). When the adjudicator returns `two-keys-required`, the control is the
   **launch-code rule**: *two authorized actors concur*, and **one of the two may be an
   agent** — but never both (the safety invariant is *at most one agent key*). Both keys
   come from **inside the crew's delegated envelope**; **at least one concurrence must be
   independent of the author** (no self-approval — for the highest classes, both). The
   adjudicator may itself hold the second key when it has
   standing for that class and did not author the change. **Out-of-band escalation is the
   exception, not the rule**: it fires only when the action *exceeds the crew's qualified
   envelope* (a risk class they don't hold, or cost beyond their authority — and even then
   the cost ceiling is structurally capped, §3.1). A certificate issues only when the
   verifier passes **and** the two concurrences are present.

This is how authority moves from platform-held to **delegated and self-asserted**: a crew
is trusted with fast, permissive, two-key authority *because it operates inside a box it
cannot blow out of* — the permission envelope is hard-walled by the OU/SCP ratchet (§3.1)
and the cost envelope by ISB lease caps (§3.1). The hardness of the cage is what licenses
the freedom inside it. Ceremony is rationed to adjudicated elevation and the one hard
boundary (S2→S3); everywhere else the loop runs at sandbox speed. The floor property
"evidence, not opinion" is preserved because a *durable* certificate still requires the
verifier to pass; the two-person rule changes *who turns the keys* (the crew, one possibly
an agent), never *whether* evidence is required.

## 3. The stage ladder (D4 — recommendation: four stages)

Three stages smear hardening into either incubation or pre-prod; a continuous score is
unauditable and unexplainable to a CISO. **Four** gives one stage whose only job is
turning a working prototype into an attestable system, which is precisely the wall.

| | **S0 Explore** | **S1 Incubate** | **S2 Harden** | **S3 Pre-prod** |
|---|---|---|---|---|
| *Purpose* | falsify/validate the idea | make it real, repeatable | make it attestable | make it operable |
| **Account** | ISB lease (pooled, recycled) | ISB lease, longer/renewable tier | ISB lease, locked tier | CCoE-vended governed account (rebuild) |
| **Conformance tier (§3.1)** | S0 SCP tier (account-level, in `Active` OU) | ratchet → S1 SCP tier | ratchet → S2 SCP tier | leaves the pool → landing-zone OU |
| **Cost cap (§3.1)** | **hard** — ISB `maxSpend`/freeze + Causeway terminate at ceiling; $50 / 7d | **hard** — $250 / 30d | **hard** — $500 / 30d | **advisory + FinOps** — no hard freeze; org budgets/anomaly/showback |
| **Lease template** | auto-approve | crew two-key (incubate class) | crew two-key (harden class) | n/a (no lease) |
| **Blueprint at provision** | S0 bootstrap (repo, OIDC trust, observability) | S1 bootstrap (+ private networking, logging) | S2 bootstrap (+ egress controls, KMS) | landing-zone baseline |
| **Infra permissions** | S0-OU SCP tier (Nuke-cleanable services, region limits) | S1-OU SCP tier (+ IaC-only: deny mutations off the pipeline OIDC role) | S2-OU SCP tier (+ deny console mutations except break-glass) | full org guardrails |
| **Model policy (§7)** | any Bedrock model, cost-capped | pinned from first eval baseline; org deny-list | org allowlist; pinned + recorded params | pinned model ID + params in attested config |
| **AgentCore packaging (§5)** | direct code deploy (CLI default) | **OCI image, digest-pinned** | OCI, signed + SLSA provenance | same digest, redeployed |
| **Tool governance** | Gateway open within account; Cedar log-only | Cedar policies enforced; tool allowlist drafted | Cedar policy suite has tests; allowlist frozen | Cedar attested, change-controlled |
| **Pipeline tier (§6)** | `causeway/explore` — lint, secrets scan, SBOM, *advisory* everything else | `causeway/incubate` — + contract tests, IaC policy assertions, replay tests | `causeway/harden` — + signed image, provenance, eval thresholds, security scan gates | `causeway/preprod` — verify-and-deploy only; no builds |
| **Exit evidence** | experiment record + decision; baseline eval recorded | green contract+policy suite; lineage manifest; replay suite committed | full evidence ledger (§9) attested | release evidence; ops runbook |

**Stage state is data, not folklore**: the stage is a field in the promotion manifest (§9.2)
and is mirrored as the lease's template tier in ISB and the repo's compliance-framework
label in GitLab. One source of truth (the manifest), three enforcement projections —
GitLab compliance label, ISB lease tier, and the **conformance SCP tier** (§3.1).

### 3.1 Conformance is structural: the SCP-tier ratchet and the cost cap (D30/D31)

Two things make the stage *real* rather than a label, and both are AWS-native and
**preventive** — they bind every principal in the account (including an agent with
credentials), not just paths through our tooling. **This subsection is written against
ISB's *actual* behaviour** (validated; see the coherence map §4.5) — not an idealised one.

**ISB facts that constrain the design** (validated against `isb-account-pool-resources.ts`
and the OpenAPI): ISB's seven OUs (`Available, Active, CleanUp, Quarantine, Entry, Exit,
Frozen`) are **lifecycle** OUs; ISB runs **drift detection that quarantines an account
found in an unexpected OU**; and `WriteProtectionScp` is attached to every pool OU *except*
`Active` and `Frozen` (so a leased = `Active` account can write — that's the point of a
lease). Two consequences: (1) we must **not** express stages by moving an `Active` account
into sibling `Causeway/Sn` OUs — that would trip drift→quarantine; (2) the conformance
tiers are *additive restrictions* layered on top of the four pool-wide SCPs.

**The SCP-tier ratchet (D30, ADR-0025).** A leased account *climbs* a ratchet of **additive
conformance SCP tiers** (`S0 ⊂ S1 ⊂ S2` in strictness) while it **stays in ISB's `Active`
OU** — the tier is realised as **account-level SCPs attached directly to the member
account** (AWS Organizations permits account-targeted SCPs), so no OU move and no drift
trip. Promotion S_n→S_{n+1} **attaches the next, stricter tier**, taking effect immediately
and preventively. The attachment is **authorized by the attestation certificate** (§9.3) —
evidence unlocks the ratchet click. Properties:
- **Monotonic within a lease**: the account only ever tightens; loosening is an *explicit*,
  logged downward move (revocation/freeze).
- **Per-lease, reset on recycle**: at lease end ISB CleanUp nukes the account and returns
  it to `Available`; the Causeway tier is detached so the next lease starts at S0. The
  ratchet position is a property of the lease, not the account. S3 is **not** a click — it
  leaves the pool entirely (rebuild into a CCoE-vended governed account, ADR-0002), because
  pre-prod isn't disposable.
- **Pipeline produces evidence; certificate authorizes; the SCP tier enforces.** Detective
  checks (pipeline) gate the *authorization*; preventive SCPs enforce the *posture*. This
  corrects the earlier "pipeline-primary, SCP-as-target" framing: the SCP ratchet is the
  **primary** enforcement; pipeline-only is the graceful-degradation fallback if delegation
  is declined (ADR-0015).
- **Realisation is spiked, not assumed** (Spike S0-4): whether ISB tolerates account-level
  SCPs on a pooled account without reverting/quarantining, and whether CleanUp detaches
  them on recycle, is **unverified**. Fallback ladder: **account-level SCP stack** (primary)
  → **true stage-OUs** *only if* the CCoE extends ISB's expected-OU/drift config to treat
  them as `Active`-equivalent (heavier, CCoE-owned) → **pipeline-only** (degraded).

**The cost cap is hard in the sandbox, advisory in pre-prod (D31, ADR-0026).** Cost caps
are **vital**, and structural while an account is disposable — but the *mechanism* is split
precisely between ISB and Causeway, because ISB's native budget actions are limited:
- **What ISB does natively** (validated, OpenAPI `BudgetThresholds`): tracks spend against
  the lease `maxSpend` (via Cost Explorer) and, at `budgetThresholds`, takes one of exactly
  two actions — **`ALERT`** or **`FREEZE_ACCOUNT`**. There is **no native "terminate at
  ceiling"** action. And **`FREEZE_ACCOUNT` removes access but does not stop already-running
  spend.**
- **What Causeway adds to make the cap *hard***: the **control project** subscribes to the
  budget-breach event / `BudgetExceeded` status and, at the configured ceiling, calls
  **`POST /leases/{id}/terminate`** → harvest → nuke (which *does* stop spend). So the hard
  cap = **ISB budget tracking + `FREEZE_ACCOUNT` (native) + Causeway-driven terminate at the
  ceiling**. This is the honest attribution; "ISB-enforced" alone would be false.
- **Two design consequences**, both configured not assumed: (a) because freeze ≠ spend-stop,
  the **ceiling action must be terminate**, owned by the control project; (b) because Cost
  Explorer data lags, thresholds must leave **headroom** below the true ceiling. Together
  these bound a self-asserting crew's blast radius by construction: neither key can run
  spend past the ceiling, because the control plane terminates the lease. The adjudicator
  governs within-cap cost *trajectory* (routing elevation to crew two-key concurrence); the
  hard ceiling is structural and not self-assertable.

- **Honesty (ADR-0027): the budget cap is a *lagging backstop*, not a real-time ceiling.**
  Cost Explorer lags hours, freeze doesn't stop running spend, and terminate→nuke takes
  time — so the budget alone bounds spend only to `maxSpend` + overshoot
  (`overshoot ≈ (cost-data latency + freeze→terminate→nuke) × burn rate`). The **real-time
  hard limit is preventive**: the **SCP tier denies expensive vectors up front** (instance
  types, services, regions, concurrency) and **Bedrock/AgentCore caps** bound the token
  vector (max tokens, inference-profile budgets, Gateway rate limits, Runtime timeouts).
  Keep `maxSpend` small so absolute overshoot stays small. Defence in depth: preventive
  (real-time) + budget backstop (lagging) + harvest-then-nuke. Measured by Spike S0-5.
- **S3 (pre-prod, governed account): advisory + FinOps.** Once the workload leaves the
  pool it is no longer disposable; a hard freeze would be a self-inflicted outage.
  There, cost governance reverts to the organization's **existing FinOps process** —
  budgets, anomaly detection, showback/chargeback, commitment management — with Causeway
  contributing *advisory* signals (cost evidence on the certificate), not a kill switch.
  Hard-cap the experiments; FinOps-govern the pre-prod workload.

---

## 4. Architecture of the extension

ISB is **extended via its API and events, never forked** (single exception: SCP JSON,
which ISB structures for customisation and which the CCoE owns anyway).

### 4.1 New components (platform-team owned): two operated things (D17)

1. **The control project (`causeway-control`)** — orchestration as trigger-driven GitLab
   pipelines, not a service. EventBridge → API Destination → pipeline-trigger token is the
   only plumbing; each route triggers an idempotent job that re-derives intent from the ISB
   and GitLab APIs (the two systems of record — **no new database**). The control project
   is the only writer of promotion manifests and the only caller of ISB's write APIs
   (`/leases`, `/leaseTemplates`, `/blueprints`). ISB has no webhooks; this is the missing
   nervous system. Key routes:
   - `LeaseApproved` → **create repo from the stage template immediately** (D15) and run
     the S0 bootstrap pipeline — every experiment is born with its outer loop attached
   - lease `durationThreshold` alerts → open "decide: graduate/extend/harvest" issue
   - `CleanAccountRequest` (pre-cleanup) → **harvest pipeline** (§4.4), which must
     complete (or time out) before cleanup proceeds
   - `AccountDriftDetected`, `AccountCleanupFailed` → platform alerts
2. **The catalog monorepo (`causeway-catalog`)** — one repo, one release train, holding
   everything versioned: the CI/CD Catalog components (§6.4), the policy packs, the
   **evidence verifier** (D14 — a component + small CLI run in the promotion pipeline,
   verdict recorded as a signed artifact; deliberately not a standing service), the agent
   artefact templates, and the **stage bootstraps** (Service Catalog products rendered to
   CloudFormation StackSets; the catalog's *own release pipeline* registers them with ISB
   via `/blueprints` — blueprint registration is never a manual operator step). Each
   bootstrap deploys the stage baseline at lease provisioning: OIDC trust role for GitLab
   runners, OTel/ADOT wiring, log shipping, per-stage network posture.

   Cutting catalog release `N` is the **only platform upgrade mechanism**: components are
   published, bootstraps re-rendered and re-registered, and a bot opens `release: N` bump
   MRs on consumer repos. Rollback = re-pin `N-1`.

### 4.2 Identity spine

- GitLab runners assume per-stage AWS roles via **OIDC federation**; the trust policy is
  part of the stage bootstrap blueprint, scoped to the BU group's project path and the
  protected branch/environment. No long-lived keys anywhere (no-tech-debt rule).
- Humans: ISB's IAM Identity Center SSO as shipped.
- Agents: **AgentCore Identity** workload identities; outbound OAuth via credential
  providers; inbound JWT. Agent credentials never appear in CI variables.

### 4.3 Where the agent runs per stage

`aws-targets.json` in the `agentcore/` directory carries one target per stage
(S0/S1/S2 = the leased account; S3 = governed account). Promotion edits exactly one
file, by pipeline, with the change itself part of the evidence trail.

### 4.4 Harvest then nuke — continuous, not a pre-cleanup batch (D8, D34, ADR-0029)

The earlier design made harvest a big batch *before* cleanup, needing ISB to **hold**
cleanup until we finished — an unverified dependency. That over-engineered a problem our
own design already solves, and is corrected: **the valuable state is produced as evidence
and pushed to GitLab continuously**, so at cleanup time almost nothing lives only in the
account.

- **Continuous harvest (steady state).** Every push/build already streams the OCI image
  digest, eval baselines, lineage and evidence to GitLab (the evidence model, §9); the
  experiment record accretes the same way. The repo is, at all times, a near-complete
  harvest. By design, what lives *only* in the disposable account is minimal.
- **Final flush at the known `durationThresholds` event.** That ISB pre-expiry signal is a
  *validated* feature; on it the control project flushes the last delta (final digest,
  baseline, drift report, experiment-record close-out) and marks park/kill/revive.
  Deadline-bounded — the halting discipline holds.
- **At `CleanAccountRequest`/cleanup there is nothing critical to hold for** — no dependency
  on an unverified cleanup-hold. If the threshold lead time is ever short, the continuous
  stream already holds all but the last delta; the failure mode is a *small, recorded* gap,
  not lost work. AgentCore **Memory** export stays deferred to v2 (D13); repo↔account drift
  is recorded, not fixed.

### 4.5 ISB coherence map — every Causeway mechanism against a *validated* ISB feature

Each row pairs a Causeway mechanism with the **specific ISB feature** it relies on and a
coherence verdict. `[V]` = verified against ISB source/OpenAPI; `[U]` = unverified,
carried as a spike. Sources: `source/infrastructure/lib/isb-account-pool-resources.ts`,
`docs/openapi/innovation-sandbox-api.yaml`, the Implementation Guide.

| Causeway mechanism | ISB feature it uses | Coherence |
|---|---|---|
| Repo+account born at lease approval (ADR-0013) | `LeaseApproved` EventBridge event; `POST /leases` | `[V]` clean — event-driven, API-native |
| Stage bootstrap at provision (E2) | `blueprintId` on lease template → StackSet at provisioning; `/blueprints` | `[V]` ISB-native blueprint mechanism |
| Conformance SCP-tier ratchet (ADR-0025) | Account stays in **`Active`** OU (no `WriteProtectionScp` there); **account-level SCPs** layered on the 4 pool-wide SCPs | `[U]` **Spike S0-4** — does ISB tolerate account-level SCPs without drift/revert? Must NOT move the account between OUs (would trip drift→quarantine) |
| "Don't express stages as OU moves" | 7 OUs are **lifecycle**; **drift detection quarantines** unexpected OU placement (`AccountDriftDetected`) | `[V]` constraint respected — this is *why* we use account-level SCPs, not stage-OUs |
| Hard cost cap, sandbox (ADR-0026) | `maxSpend` + `budgetThresholds` = **`ALERT`/`FREEZE_ACCOUNT` only**; spend via Cost Explorer | `[V]` — and therefore the ceiling **terminate is Causeway's**, not ISB's |
| Ceiling → terminate | `BudgetExceeded` status / freeze event → control project calls **`POST /leases/{id}/terminate`** | `[V]` API exists; the automation is Causeway control-plane (not a native budget action) |
| "Freeze isn't a spend-stop" caveat | `FREEZE_ACCOUNT` removes access; **running resources keep spending** | `[V]` exactly why ceiling action must be terminate |
| Harvest-before-nuke, bounded (ADR-0008) | `CleanAccountRequest` event precedes Step Functions→CodeBuild→AWS Nuke | `[U]` **Spike S0-1** — is there a supported pre-cleanup *hold*? Fallback: harvest at duration-threshold |
| Recycle resets to S0 | ISB CleanUp nukes and returns account to `Available` | `[V]` lifecycle; `[U]` that our account-level SCPs detach on recycle → S0-4 |
| Preventive S2 controls (ADR-0015) | SCPs on the AccountPool subtree (CCoE-owned) | `[U]` delegation negotiation; degrade to detective-only if declined |
| Pipeline vends lease + OIDC (ADR-0004) | `POST /leases`; blueprint-deployed OIDC trust role | `[U]` **Spike S0-2** — ISB's API auth model expects IdC users; service-principal path may need design |

**Net coherence verdict.** The design is coherent with ISB **provided** two account-pool
integration questions resolve (S0-4: account-level SCPs without drift/quarantine; S0-1: a
pre-cleanup harvest hold) and one attribution is stated honestly (the cost *ceiling
terminate* is Causeway's control-plane behaviour, not an ISB budget action). None of these
requires forking ISB; all are consistent with "consume via API and events" (ADR-0001).

---

## 5. The Docker/OCI decision (D5 — analysis and ruling)

**Why Docker shows up "intermediately" in practice** — making the implicit explicit:
the container is not a developer-experience choice, it is the **portability and evidence
boundary** between disposable accounts and governed runtime. An OCI image digest is the
only artefact form in this stack that simultaneously:

- is **immutable and content-addressed** (the digest *is* the identity across S1→S3 rebuilds);
- carries **signatures and SLSA provenance** as first-class attached attestations;
- is what AgentCore Runtime natively accepts (ARM64) when not using direct code deploy;
- survives account recycling in a registry we own (GitLab Container Registry).

Direct code deploy (the new CLI's default) is faster and right for the inner loop, but a
zip-to-runtime deploy has no portable, signable identity — evidence would have to be
bolted onto a hash of a zip, recreating OCI badly.

**Ruling:**
- **S0**: direct code deploy permitted (speed); the pipeline still builds an OCI image
  *advisorily* on each push so packaging never becomes a cliff.
- **S1+**: the **digest-pinned OCI image is the unit of deployment and attestation**.
  Built once in CI (ARM64, pinned base from our hardened image catalog), signed (cosign,
  KMS key in the platform estate), provenance attached; **rebuilds are forbidden across
  S2→S3 — the same digest redeploys**.
- Docker as a *tool* remains inner-loop only (`agentcore dev`, local replay); CI builds
  use kaniko/buildkit on our runner fleet, no privileged Docker-in-Docker (no-tech-debt rule).

---

## 6. Deterministic testing & the evidence pipeline (D6)

Determinism is layered so that every gate is **reproducible: same inputs → same verdict**,
even where agent *content* is stochastic.

### 6.1 Layer 1 — Contracts and module compliance (every stage, S1+ blocking)

Rule-based assertions over the non-LLM surface — the part of the user's puzzle with a
clean answer, because none of it needs a model to verify:

- **Tool/MCP contracts**: Gateway target schemas validated; MCP contract tests against
  recorded tool fixtures; breaking-change detection on tool schemas.
- **Cedar policy tests**: AgentCore Gateway Cedar policies get unit tests (allow/deny
  tables) exactly like code; policy coverage is reported.
- **IaC/bootstrap compliance attestation**: every Terraform/CDK plan is evaluated by
  **OPA/conftest + cdk-nag/checkov policy packs versioned in the catalog**. The output
  is a signed `policy-assertion-report` evidence item: *policy-pack version + input plan
  digest + per-rule verdicts*. This is the "rule-based assertion that attests policy
  compliance of bootstraps" — deterministic, replayable, diffable.

### 6.2 Layer 2 — Recorded/replayed traces (S1+, blocking)

Cassette-style: model I/O and tool calls recorded during S0/S1 sessions (via the OTel
GenAI instrumentation we already mandate) are replayed in CI with the model stubbed.
This tests the **harness deterministically** — control flow, tool dispatch, error paths,
memory reads/writes — bit-exact, fast, free. Cassettes are versioned with the code;
a cassette refresh is a reviewed change.

### 6.3 Layer 3 — Thresholded live evals (gate into S2 and S3)

**AgentCore evaluators** (declared in `agentcore.json`) + scenario suites run against the
**pinned** model with recorded params, N≥k trials, pass = metric thresholds met
(task success, grounding, safety screens, latency/cost envelopes). The *gate* is
deterministic (fixed suite version + fixed model + fixed thresholds → auditable verdict)
even though content varies. Eval baselines recorded at S0 exit make later runs *comparative*:
regression against your own baseline blocks promotion.

### 6.4 The standardised outer loop — `causeway/` CI/CD Catalog components

GitLab **CI/CD Catalog components** (typed `spec.inputs`, semver internally — not legacy
`include:template`) are the propagation vehicle for the pipeline half of composition.
Per the simplicity contract (§2.4), the per-repo CI file is a single pinned include that
**never changes after generation**; all variability lives in `causeway.yml`:

```yaml
# .gitlab-ci.yml — generated once by the stage template; owned by the catalog
include:
  - component: gitlab.example.com/causeway/pipeline@7   # pin == causeway.yml `release`
```

The `pipeline` component reads `causeway.yml` (stage, eval suite, owners) at runtime and
selects which jobs run and which are advisory vs blocking. Stage escalation is therefore
a one-line `stage:` change in `causeway.yml` via MR (§2.4). Components are additionally
enforced instance-wide via **compliance pipelines** on the BU groups, so a repo cannot
opt out of its stage tier by editing either file.

### 6.5 Skills-based generation inside the gates (the rest of the puzzle)

Where agent skills generate or adapt anything (IaC instances, pipeline config, tool
definitions), the rule is: **generation is never trusted; its output is attested** —
lineage (§8) says *where it came from*; Layer-1 assertions say *it complies*; both are
deterministic. Generation quality can be poor without ever being a compliance hole.

---

## 7. Model & runtime governance ladder (D7 — recommendation)

Enforced in the estate we own: Bedrock model-access policies + AgentCore Cedar +
pipeline verification of `agentcore.json`. SCP backstop optional (CCoE dependency).

| Stage | Policy |
|---|---|
| S0 | Any Bedrock model the org hasn't deny-listed; cost is the governor (lease budget). **Pin-on-first-baseline**: the moment the S0-exit eval baseline is recorded, model ID + params are pinned in `agentcore.json` so all later evidence is comparable. |
| S1 | Pinned model from baseline; changes allowed but force a baseline re-record (pipeline-enforced). Org deny-list applies. |
| S2 | **Org allowlist** (approved models only) + pin; inference params (temperature, max tokens, guardrail config) recorded in the manifest. Bedrock Guardrails config becomes part of the attested bundle. |
| S3 | Exact model ID + params + guardrails attested; any change re-runs the S2 eval gate. Cross-region inference profiles and quota reservations handled by platform. |

Same ladder shape applies to **tools** (Gateway targets: open → drafted allowlist →
frozen+tested Cedar → attested) and **memory** (ephemeral → strategies declared →
retention/PII policy attested).

## 8. Templates and composition (D9)

**Golden templates; skills adapt, never author.** Three template planes, one lineage rule:

| Plane | Vehicle | Contents |
|---|---|---|
| Infra/account | **Service Catalog products → rendered to ISB blueprints** (CFN StackSets) + Terraform modules in the catalog group | stage bootstraps, network postures, OIDC trust, observability wiring |
| Pipeline | **GitLab CI/CD Catalog components** (`causeway/*`) | stage pipelines, policy packs, evidence jobs, harvest job |
| Agent | **Agent artefact templates** — `agentcore create`-compatible scaffolds: `agentcore/` config, evaluator definitions, AI-DLC steering rules (`aidlc-workflows`), skill manifests, cassette layout | the promotable bundle's skeleton |

**Lineage rule**: every materialised instance carries machine-readable lineage —
`{template_id, template_version, adaptation_diff_digest, adapting_skill@version}` — in the
promotion manifest. Skills **parameterise and adapt** templates (rename, wire, scale,
compose published modules); they may not introduce un-catalogued resource types or
pipeline jobs (Layer-1 assertion enforces this structurally, not by trust).

**The escape valve that prevents catalog rot**: a sandbox experiment that genuinely needs
a novel pattern promotes the *pattern* first — a governed contribution path inducts it
into the catalog (review + policy-pack run + semver release), and the experiment then
consumes it. The catalog grows from the sandbox; the wall stays down in both directions.

## 9. Evidence model (D10 — recommendation)

### 9.1 Ruling: GitLab-native system of record, manifest-linked runtime evidence

GitLab is the evidence home because it is the layer we fully own, and the promotion
decision executes there. Concretely: job artifacts for reports, **release evidence**
(signed-hash `evidence.json` snapshots) at every stage transition, **runner-generated
SLSA provenance** (L1 — production-usable today) on build jobs, cosign signatures on
images using **KMS keys in the platform estate** (avoiding the SLSA-L3/public-Rekor
experimental path on a private instance — revisit when L3 is GA for self-managed).
Runtime evidence that naturally lives in AWS (AgentCore traces, CloudWatch GenAI metrics,
eval run records) is **referenced by ARN/URI + digest** from the manifest, not copied.

### 9.2 The promotion manifest (illustrative)

```yaml
causeway_manifest: 1
unit: bu-payments/triage-agent
stage: { current: incubate, requested: harden }
artefact:
  image: registry.example.com/bu-payments/triage-agent@sha256:9f2c…
  agentcore_config_digest: sha256:55ab…
lineage:
  - { plane: agent,   template: causeway/agent-strands-py@1.2.0, diff: sha256:01aa…, skill: scaffolder@0.9 }
  - { plane: infra,   template: causeway/bootstrap-s1@2.0.1 }
  - { plane: pipeline,template: causeway/stage-pipeline@2.3.0 }
model: { id: anthropic.claude-sonnet-4-6, params_digest: sha256:7c1d…, guardrail: gr-…/3 }
evidence:
  - { type: policy-assertion-report, pack: iac@1.4, verdict: pass, sig: …, job: 18234 }
  - { type: replay-suite,  cassettes: 41, verdict: pass, job: 18235 }
  - { type: eval-run, suite: triage@0.3, trials: 25, pass_rate: 0.96, threshold: 0.9,
      baseline_delta: +0.02, runtime_ref: "arn:aws:bedrock-agentcore:…:evalrun/…" }
  - { type: slsa-provenance, level: 1, ref: … }
  - { type: release-evidence, ref: …/releases/v0.4.0/evidence.json }
approvals: [{ gate: harden-entry, by: platform-bot, basis: all-required-evidence-verified }]
```

The **evidence verifier** (§4.1) replays this check deterministically; promotion approval
is "the verifier passed", with humans only on adjudicated elevation (§2.5). The manifest
also carries the adjudicator's verdict as an evidence item:

```yaml
  - { type: adjudication, verdict: self-assertable, axes: {risk: clear, cost: clear},
      pack: causeway/adjudicator@1.2, inputs_digest: sha256:aa…, job: 18236 }
```

### 9.3 Attestation certificates — the certified progression, published (D27)

Each stage transition issues a **certificate**: a signed, human-readable record that
makes the attestation progression visible and auditable, not buried in pipeline logs.
The certificate is the durable form of "promotion = verified evidence"; it issues only
when the verifier passes (and, on `four-eyes-required` transitions, when the routed
approvals are present). It names: the unit and stage, the artefact digest, the evidence
items and their verdicts, the adjudicator decision, any human approvers, the catalog
release that verified it, and the signature.

```yaml
causeway_certificate: 1
unit: bu-payments/triage-agent
stage: harden                 # certified entry to S2
issued: 2026-06-13T11:40:00Z
artefact: { image: …@sha256:9f2c…, agentcore_config_digest: sha256:55ab… }
evidence_digest: sha256:…     # hash of the manifest's evidence block
adjudication: { verdict: four-eyes-required, axis: cost, reason: "projected spend +38%" }
approvals:
  - { axis: cost, by: budget-owner@bu-payments, at: 2026-06-13T11:38Z }
  - { gate: harden-entry, by: verifier@release-7, basis: all-required-evidence-verified }
verified_by_release: 7
status: valid                 # valid | revoked  (revoked carries reason + timestamp)
sig: …                        # cosign / platform KMS
```

Certificates are **published to the docs site** (ADR-0019, ADR-0022): a per-unit page
renders the chain S0→current as a stamped passport, so anyone — a developer, a CISO, an
auditor — can read a unit's standing and its evidence trail without access to the
pipelines. Revocation flips `status` and re-publishes; the history is append-only. This
is the answer to "how is progression through attestation certified, and is it output to
docs": **yes — the certificate is the certification, and the docs site is where it lives.**

## 10. Multi-tenancy (D2) and the payoff question

**v1 ruling: GitLab-side tenancy only.** Per-BU top-level groups carry: membership/roles,
compliance-framework labels (= stage enforcement), CI/CD catalog visibility, runner tags,
evidence, chargeback rollups (mapped to ISB `costReportGroup` + lease-template visibility
on the AWS side). The AWS pool stays shared and recycled — ISB accounts hold no state
between leases, so AWS-side partitioning buys little until one of these triggers fires:

| Deferred story | Build when | Payoff verdict |
|---|---|---|
| Per-BU account pools / OU partitions | a BU has data-residency or regulator-isolation requirements | **Pays off only on compliance demand** — not on scale; cleanup makes shared pools safe |
| Per-BU hub deployments of ISB | >1 AWS org, or MSP model | **Doesn't pay off** in a single enterprise; high ops cost |
| Tenant-scoped model allowlists / quotas | BUs contend for Bedrock quota or have divergent model approval | **Pays off early and cheaply** — pure Cedar/Bedrock-policy config in the estate we own; do in v2 |
| Tenant-scoped evidence retention policies | first audit that scopes by BU | Cheap once evidence is group-scoped (it is, by construction) |

## 11. Gap analysis → epics and stories

What must be built (ISB gives none of this), in dependency order. "No tech debt" mandates
are inlined. **Delivery collapses onto the two operated things (D17)**: E1+E7 land in the
control project; E2, E3, E5, E9 are all catalog-monorepo content on the release train;
E4+E6 split between catalog (verifier, policy packs) and the AgentCore estate (signing
keys, Cedar, model policy); E8 is config, not software. Nothing in this table creates a
third thing to operate.

| # | Epic | Key stories | Payoff |
|---|---|---|---|
| E1 | **Control project** | EventBridge→GitLab trigger routes; lease-via-API GitLab component (`causeway/lease@1`: request/renew/freeze/terminate from a pipeline); control project as the sole manifest writer | Foundation — everything else hangs off it |
| E2 | **Stage bootstraps** | Service Catalog→blueprint rendering pipeline; S0/S1/S2 bootstrap products (OIDC trust, OTel, network posture); blueprint registration via `/blueprints` | Removes all manual account prep; makes stage real at provision time |
| E3 | **`causeway/` pipeline catalog** | stage-pipeline component; policy packs (OPA/cdk-nag) as versioned components; replay-runner; eval-runner (agentcore evaluators); harvest pipeline; evidence verifier | The standardised outer loop itself |
| E4 | **Evidence & attestation** | manifest schema + verifier CLI; cosign+KMS signing; SLSA-L1 provenance wiring; release-evidence conventions; runtime-evidence reference resolver | The attest-to-promote mechanism |
| E5 | **Agent artefact templates** | strands-py / strands-ts / langgraph scaffolds with `agentcore/` config, evaluators, AI-DLC steering rules, cassette layout; lineage stamping in scaffolder skill | Composition propagation, agent plane |
| E6 | **Model governance** | Bedrock allowlist/deny-list config as code; pin-on-baseline pipeline rule; Cedar policy suites + tests for Gateway; guardrail config in manifest | Cheap (estate we own), high audit value |
| E7 | **Harvest** | pre-cleanup hook with completion signal; experiment-record generator; park/revive flow (re-vend lease from harvested state); *v2:* Memory-store export (D13) | Stops knowledge loss; enables "revive" which sells the platform to BUs |
| E8 | **Tenancy v2** | per-BU model quotas/allowlists; deferred AWS-pool partition (trigger-gated, §10) | Per §10 table |
| E9 | **Catalog contribution path** | pattern-induction MR flow, policy-pack gate, semver release automation | Prevents golden-template rot; closes the loop |
| E10 | **Self-asserted governance** | risk/cost adjudicator skill (trip-wire packs + monotonic combiner); GitLab conditional approval-rule routing; attestation certificates published to Pages; async-verify-with-revocation | Frees the inner loop; rations ceremony to adjudicated risk/cost; makes the progression auditable (D25–D27) |

**Explicit non-goals (v1):** production stage (stops at pre-prod handover), non-AgentCore
runtimes, account vending (CCoE's job), building our own eval framework (use AgentCore
evaluators + OTel), SLSA L3 (experimental on self-managed).

**Standing no-tech-debt mandates:** new `agentcore-cli` only (wrap control-plane APIs where
its admin surface lags; never adopt the legacy toolkit); CI/CD Catalog components only
(no `include:template`); OIDC only (no stored AWS keys); digest pins only (no mutable tags);
ISB consumed via API/events only (no fork beyond CCoE-owned SCP JSON); every policy pack,
template, and component semver-released with a deprecation policy.

## 12. Risks

| Risk | Mitigation |
|---|---|
| CCoE never ships per-stage SCP tiers | Ladder still binds via pipeline+Cedar+model policy (§2.3); document residual infra-API exposure per stage |
| Harvest hook races cleanup | Control project freezes lease first; cleanup waits on harvest signal with hard timeout |
| Eval flakiness blocks promotion unfairly | Trials-with-thresholds, baseline-relative gates, quarantine-and-rerecord flow for cassettes |
| Catalog becomes a bottleneck | E9 contribution path with SLA; S0 permissiveness means experiments never wait on catalog |
| agentcore-cli churn (52 releases/yr) | Pin CLI version per catalog component release; upgrade as a versioned component change |

## 13. AI-DLC mapping (how the methodology rides the rails)

- **Inception** ⇢ S0: mob-elaboration outputs are repo artefacts from day one (they become
  the experiment record); a *unit of work* = lease + repo; *bolts* fit inside lease durations.
- **Construction** ⇢ S0→S2: AI proposes, humans gate — exactly mirrored by the pipeline's
  advisory→blocking escalation; steering rules ship inside the agent artefact template.
- **Operations** ⇢ S2→S3: AI-driven IaC and deployment under the attested-evidence regime;
  `traces`/observability feed back into the next inception.

---

## 14. The "no simpler" floor (D18) and operator runbook

### 14.1 What may not be simplified away

Each of these is the minimum mechanism for a property the platform exists to provide.
Simplification proposals that touch them need a replacement mechanism, not a deletion:

| Irreducible | Property it carries | The tempting "simpler" version, and why it fails |
|---|---|---|
| Four stages | explainable, auditable governance ramp | a continuous risk score — unauditable, unexplainable to a CISO |
| Evidence verifier before every *durable* certificate | promotion = verified evidence, not opinion | "green pipeline = promotable" — conflates build success with attestation. *(Refined by ADR-0020: self-assertion may proceed provisionally, but the durable certificate still requires the verifier — replacement mechanism = async-verify-with-revocation, not a weakening.)* |
| Self-assertion is provisional and revocable | speed without abandoning evidence | "self-assert and you're done" — drops the async verify + revocation |
| Adjudicator is fail-safe and monotonic | the agent that rations ceremony cannot be the hole | "let the model decide what's risky" — a reasoning layer that can *clear* a ruled trip-wire; ambiguity that resolves to proceed |
| Two-person rule, delegated to the crew; ≤ one agent key | second pair of eyes without a shore-based committee | "route elevation to security/budget owners" — re-imports the out-of-band approver the model exists to kill / "let an agent self-concur" or "two agent keys" — removes the human floor |
| Conformance is structural (OU/SCP ratchet), not merely procedural | preventive control binds every principal, including a credentialed agent | "enforce stages in the pipeline only" — detective; an agent with creds routes around it |
| Sandbox cost caps are hard and ISB-enforced; ceiling terminates | the financial blast radius of a self-asserting crew is bounded by construction | "let the adjudicator watch spend" — soft; misses the structural backstop. (S3 pre-prod is deliberately advisory+FinOps — a different regime for a non-disposable account, not a weakening) |
| Digest-pinned OCI from S1; same digest S2→S3 | artefact identity across accounts | rebuild-per-stage — severs the evidence chain at exactly the wall |
| Lineage stamping on skill-adapted instances | generation without trust | "the skill is approved, so its output is" — trust in generation, the original sin |
| Harvest-before-nuke with completion signal | no knowledge dies with an account | nuke-on-expiry — recreates the wall as an outcome |
| Pinned models + thresholded trials at gates | deterministic verdicts over stochastic content | single-run evals on floating models — flaky gates, incomparable baselines |
| CCoE ownership boundary (§2.3) | governance binds in layers we actually control | "just ask for org admin" — a dependency dressed as a simplification |
| **No unbounded waits; verify artifacts, never programs** | every control-project wait is deadline-bounded (cleanup always wins eventually); every gate judges a finite artifact against decidable predicates | "wait for harvest to complete" / "verify the generated code is correct" — both are halting-problem-shaped and unsound as stated |

### 14.2 Operator runbook (the whole of day-2)

- **Install** (once): deploy ISB (CCoE assists with the AccountPool stack); create the
  control project + EventBridge API Destination; seed the catalog and cut release 1;
  create BU groups with compliance frameworks.
- **Upgrade**: cut catalog release N; bot bumps consumers; watch the four alarms (§2.4).
- **Rollback**: re-pin release N−1 (bot MRs), re-register prior blueprints (automatic on
  the rollback release cut).
- **Break-glass**: freeze lease via ISB API → investigate in-account via SSO → resume or
  terminate. Quarantined accounts follow stock ISB retry-cleanup flow.
- **On-call surface**: the four alarms only — harvest timeout, quarantine, drift,
  verifier failure at an approved gate. Everything else is a developer-facing signal.

## 15. Iteration record

**Resolved in v0.2** (stakeholder interview, 2026-06-12):

1. Stage ladder — **four stages confirmed** (D12).
2. Harvest scope — **records only in v1**; Memory export is a v2 story under E7 (D13).
3. Repo timing — **created at lease approval**, outer loop attached from birth (D15).
4. Evidence verifier — **catalog component + CLI**, no standing service (D14).

**Resolved in v0.3** (simplification pass, "as simple as possible, but no simpler"):

5. Developer surface collapsed to **one file (`causeway.yml`), three interactions** (D16, §2.4).
6. Operator surface collapsed to **two operated things** — control project (no service,
   no database) + catalog monorepo on a single release train (D17, §4.1); on-call reduced
   to four alarms; delivery of all nine epics mapped onto those two things (§11).
7. The simplicity floor codified — seven irreducibles with their failure modes (D18, §14).

**Resolved in v0.5** (stakeholder directive, 2026-06-13: "be opinionated — what is the
target?"):

8. SCP authority — **target = delegated SCP admin over the AccountPool OU subtree**,
   landed before first S2 entry; detective-only is launch posture; whole-org ownership
   refused; fallback = per-unit risk acceptance at S2 (D19, ADR-0015, §2.3).

**Resolved in v0.6** (challenge round, 2026-06-13):

9. Fork rule — wrap, never fork; fork only behind three sequential gates (D20, ADR-0016).
10. Left-shift rule — preview left, mint centrally; `causeway verify` advisory in the
    inner loop, evidence admissible only from platform runners (D21, ADR-0016).

**Resolved in v0.7** (2026-06-13):

11. Runbooks upgraded to agent-operatable: authority tags, explicit API verbs,
    verifications and bounds, dry-run rehearsal until deployment (D22, ADR-0017).

**Resolved in v0.8** (2026-06-13):

12. Operator onboarding defined: headless ISB User, GitLab-only developer front door,
    BU/developer/experiment cadences with time targets (D23, ADR-0018).
13. Docs-as-code to GitLab Pages; wiki rejected (D24, ADR-0019).

**Resolved in v0.9** (2026-06-13, "promote the concept + move to self-asserted trust-but-verify"):

14. Comms artifacts added as the human on-ramp: [PRFAQ](PRFAQ.md), [TENETS](TENETS.md),
    [MENTAL-MODEL](MENTAL-MODEL.md).
15. Governance shifts to **self-asserted, trust-but-verify**: inner loop by default;
    adjudicator-triggered four-eyes on risk/cost elevation; async-verify-with-revocation
    preserves the evidence floor (D25/D26, ADR-0020/0021).
16. **Attestation certificates** published to the docs site = the certified, auditable
    progression (D27, ADR-0022).
17. **Portability seam** declared: GitLab-centric binding over tool-neutral data (D28,
    ADR-0023).
18. Structural note: SPEC.md (~700 lines) is near the point for a split into linked
    files; the comms trio is the human front door for now. Candidate for v1.0 cleanup —
    logged as O3.

**Resolved in v0.10** (2026-06-13, "revert delegation to qualified crews + structural conformance + cost caps"):

19. **Authority reverts to qualified crews**; out-of-band approver replaced by the
    **two-person/launch-code rule** (≤ one agent key, neither the author, inside the
    envelope); out-of-band only beyond the crew's qualified envelope (D29, ADR-0024).
20. **Conformance made structural**: the **OU ratchet** (additive SCP tiers; certificate
    authorizes the climb; monotonic, per-lease) is the primary, preventive enforcement;
    pipeline-only is the fallback. New Spike S0-4 (D30, ADR-0025).
21. **Cost caps**: hard and ISB-enforced in the sandbox (ceiling→terminate); advisory +
    FinOps in pre-prod (D31, ADR-0026). Deck + comms updated to promote crew delegation.

**Resolved in v0.11** (2026-06-13, "do the cost caps really work?" + "the spec is the ISB?"):

22. Cost-cap honesty: the ISB budget is a **lagging, detective backstop** (Cost-Explorer
    lag; freeze≠spend-stop; terminate/nuke takes time); the **real-time hard ceiling is
    preventive** (SCP-denied vectors + Bedrock/AgentCore token & rate caps); budgets kept
    small. Defence in depth; Spike S0-5; ADR-0027 supersedes ADR-0026's "hard by
    construction" (D32). Deck + PRFAQ softened to match.
23. Boundary clarified: **this spec is the thin extension, not ISB** (intro + §4.5 map).

**Resolved in v0.12** (2026-06-13, "too much designable-from-known-behaviour is being deferred to spikes"):

24. Discipline: **design from validated behaviour first; spikes confirm or calibrate, never
    block** (D33, ADR-0028). Spike register reclassified (SPIKES.md): designed-now vs
    confirm vs calibrate, each stating its designed answer + fallback.
25. **Harvest redesigned continuous** (D34, ADR-0029): every push streams evidence to GitLab,
    final flush at the validated `durationThresholds` event — removes the unverified
    cleanup-hold dependency (old S0-1 demoted to a non-blocking confirmation).

**Resolved in v0.13** (2026-06-13, "is it really ready / tests / are all ADRs worthy"):

26. Readiness defined as **handover-able to continue**, and the gap closed: added
    [DEFINITION-OF-DONE](DEFINITION-OF-DONE.md) (acceptance per epic), [SKILLS](SKILLS.md)
    (skill contracts + required tests), [TESTING](TESTING.md) (test strategy). No new
    decisions — these make existing decisions testable.
27. Honesty: **not all ADRs are equally worthy** — the ADR index now tiers each
    Foundational/Core/Tactical/Process and flags the two partial supersessions.

**Remaining for v0.14:**

1. Who arbitrates the catalog contribution path (E9) — platform team only, or trusted BU
   maintainers with platform review? (Default until decided: platform team only.)
2. Working-title naming ("Causeway", stage names) — cosmetic, decide before first
   external comms.
