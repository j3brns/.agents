# The Graduated Innovation Stage ("Causeway")

**Spec v0.2 — 2026-06-12 — status: iterated; open questions resolved (§14)**

Extending **Innovation Sandbox on AWS (ISB)** into a first-class SDLC stage, so agentic
workloads built under AI-DLC graduate from a prudently permissive sandbox to pre-prod
through **progressive, evidence-generating GitLab pipelines** — removing the wall between
innovation and pre-prod.

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
- The **OU/SCP ladder is consumed, not authored**: ISB ships its SCP set; per-stage SCP
  tiers (§3) are a **declared dependency on the CCoE**, expressed as a reviewed contribution
  to their ISB fork of the policy JSON. The spec is designed to degrade gracefully — if the
  CCoE only operates stock ISB SCPs, stages S1–S2 still bind via pipeline + Cedar + model
  policy; we lose only infra-API breadth control.
- **Pre-prod accounts are vended by the CCoE's landing-zone machinery** (AFT or LZA pattern):
  promotion to S3 is a *rebuild from the attested repo* into a governed account — consistent
  with ISB's design truth that recycled accounts retain no state.

---

## 3. The stage ladder (D4 — recommendation: four stages)

Three stages smear hardening into either incubation or pre-prod; a continuous score is
unauditable and unexplainable to a CISO. **Four** gives one stage whose only job is
turning a working prototype into an attestable system, which is precisely the wall.

| | **S0 Explore** | **S1 Incubate** | **S2 Harden** | **S3 Pre-prod** |
|---|---|---|---|---|
| *Purpose* | falsify/validate the idea | make it real, repeatable | make it attestable | make it operable |
| **Account** | ISB lease (pooled, recycled) | ISB lease, longer/renewable tier | ISB lease, locked tier | CCoE-vended governed account (rebuild) |
| **Lease template** | auto-approve, e.g. $50 / 7 days | manager-approved, $250 / 30 days | platform-approved, $500 / 30 days | n/a (no lease) |
| **Blueprint at provision** | S0 bootstrap (repo, OIDC trust, observability) | S1 bootstrap (+ private networking, logging) | S2 bootstrap (+ egress controls, KMS) | landing-zone baseline |
| **Infra permissions** | stock ISB SCPs (Nuke-cleanable services, region limits) | + pipeline-enforced IaC-only rule (drift detection fails the pipeline) | + deny console mutations except break-glass (CCoE-dependent SCP tier) | full org guardrails |
| **Model policy (§7)** | any Bedrock model, cost-capped | pinned from first eval baseline; org deny-list | org allowlist; pinned + recorded params | pinned model ID + params in attested config |
| **AgentCore packaging (§5)** | direct code deploy (CLI default) | **OCI image, digest-pinned** | OCI, signed + SLSA provenance | same digest, redeployed |
| **Tool governance** | Gateway open within account; Cedar log-only | Cedar policies enforced; tool allowlist drafted | Cedar policy suite has tests; allowlist frozen | Cedar attested, change-controlled |
| **Pipeline tier (§6)** | `causeway/explore` — lint, secrets scan, SBOM, *advisory* everything else | `causeway/incubate` — + contract tests, IaC policy assertions, replay tests | `causeway/harden` — + signed image, provenance, eval thresholds, security scan gates | `causeway/preprod` — verify-and-deploy only; no builds |
| **Exit evidence** | experiment record + decision; baseline eval recorded | green contract+policy suite; lineage manifest; replay suite committed | full evidence ledger (§9) attested | release evidence; ops runbook |

**Stage state is data, not folklore**: the stage is a field in the promotion manifest (§9.2)
and is mirrored as the lease's template tier in ISB and the repo's compliance-framework
label in GitLab. One source of truth (the manifest), two enforcement projections.

---

## 4. Architecture of the extension

ISB is **extended via its API and events, never forked** (single exception: SCP JSON,
which ISB structures for customisation and which the CCoE owns anyway).

### 4.1 New components (platform-team owned)

1. **Causeway Orchestrator** — a small service (or scheduled pipeline) that is the only
   writer of promotion manifests. Subscribes to the ISB EventBridge bus; calls the ISB
   REST API (`/leases`, `/leaseTemplates`, `/blueprints`); calls the GitLab API.
2. **Event bridge to GitLab** — EventBridge → API Destination → GitLab pipeline-trigger
   tokens. ISB has no webhooks; this is the missing nervous system. Key routes:
   - `LeaseApproved` → **create repo from the stage template immediately** (D15) and run
     the S0 bootstrap pipeline — every experiment is born with its outer loop attached
   - lease `durationThreshold` alerts → open "decide: graduate/extend/harvest" issue
   - `CleanAccountRequest` (pre-cleanup) → **harvest pipeline** (§4.4), which must
     complete (or time out) before cleanup proceeds
   - `AccountDriftDetected`, `AccountCleanupFailed` → platform alerts
3. **GitLab CI/CD Catalog namespace `causeway/`** — the standardised outer loop (§6.4).
4. **Evidence verifier** (D14) — a versioned catalog component + small verification CLI
   run inside the promotion pipeline; checks the evidence ledger (signatures, digests,
   threshold results, lineage) and records its verdict as a signed pipeline artifact.
   Deliberately not a standing service in v1 — nothing to operate, patch, or secure;
   extract to a service only if external auditors require an API.
5. **Stage bootstraps as ISB blueprints** — Service Catalog products rendered to
   CloudFormation StackSets and registered via `/blueprints`, so ISB itself deploys the
   stage baseline at lease provisioning (OIDC trust role for GitLab runners, OTel/ADOT
   wiring, log shipping, per-stage network posture).

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

### 4.4 Harvest then nuke (D8)

On lease end without graduation, the harvest pipeline runs **before** cleanup:

1. Freeze the lease via API (stops spend during harvest).
2. Verify repo == account: IaC plan against live account; drift is *recorded*, not fixed.
3. Push final OCI image / code bundle to the GitLab registry (digest recorded).
4. Export eval baselines and `traces` excerpts. (AgentCore **Memory** store export is
   deferred to v2 per D13 — v2 trigger is the first park-and-revive demand.)
5. Write the **experiment record** (AI-DLC inception/elaboration artefacts + outcome +
   decision: park / kill / revive) to the BU's catalog area.
6. Signal the orchestrator → cleanup proceeds → account recycles. Nothing of value dies
   with the account; the account stays disposable.

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

GitLab **CI/CD Catalog components** (typed `spec.inputs`, semver, self-contained — not
legacy `include:template`) are the propagation vehicle for the pipeline half of
composition. Illustrative consumption — the whole per-repo pipeline is this:

```yaml
# .gitlab-ci.yml — generated into the repo by the stage template; owned by the catalog
include:
  - component: gitlab.example.com/causeway/stage-pipeline@2
    inputs:
      stage: incubate          # explore | incubate | harden | preprod
      agent_dir: agentcore/
      policy_pack: causeway/policy-packs/iac@1.4
      eval_suite: bu-payments/evals/triage-agent@0.3
```

The `stage` input selects which jobs are advisory vs blocking. Stage escalation is a
one-line MR authored by the orchestrator. Components are enforced instance-wide via
**compliance pipelines** on the BU groups, so a repo cannot opt out of its stage tier.

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
is "the verifier passed", with humans only on policy-defined exceptions.

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
are inlined.

| # | Epic | Key stories | Payoff |
|---|---|---|---|
| E1 | **Event bridge & orchestrator** | EventBridge→GitLab trigger routes; lease-via-API GitLab component (`causeway/lease@1`: request/renew/freeze/terminate from a pipeline); orchestrator as the sole manifest writer | Foundation — everything else hangs off it |
| E2 | **Stage bootstraps** | Service Catalog→blueprint rendering pipeline; S0/S1/S2 bootstrap products (OIDC trust, OTel, network posture); blueprint registration via `/blueprints` | Removes all manual account prep; makes stage real at provision time |
| E3 | **`causeway/` pipeline catalog** | stage-pipeline component; policy packs (OPA/cdk-nag) as versioned components; replay-runner; eval-runner (agentcore evaluators); harvest pipeline; evidence verifier | The standardised outer loop itself |
| E4 | **Evidence & attestation** | manifest schema + verifier CLI; cosign+KMS signing; SLSA-L1 provenance wiring; release-evidence conventions; runtime-evidence reference resolver | The attest-to-promote mechanism |
| E5 | **Agent artefact templates** | strands-py / strands-ts / langgraph scaffolds with `agentcore/` config, evaluators, AI-DLC steering rules, cassette layout; lineage stamping in scaffolder skill | Composition propagation, agent plane |
| E6 | **Model governance** | Bedrock allowlist/deny-list config as code; pin-on-baseline pipeline rule; Cedar policy suites + tests for Gateway; guardrail config in manifest | Cheap (estate we own), high audit value |
| E7 | **Harvest** | pre-cleanup hook with completion signal; experiment-record generator; park/revive flow (re-vend lease from harvested state); *v2:* Memory-store export (D13) | Stops knowledge loss; enables "revive" which sells the platform to BUs |
| E8 | **Tenancy v2** | per-BU model quotas/allowlists; deferred AWS-pool partition (trigger-gated, §10) | Per §10 table |
| E9 | **Catalog contribution path** | pattern-induction MR flow, policy-pack gate, semver release automation | Prevents golden-template rot; closes the loop |

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
| Harvest hook races cleanup | Orchestrator freezes lease first; cleanup waits on harvest signal with hard timeout |
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

## 14. Iteration record

**Resolved in v0.2** (stakeholder interview, 2026-06-12):

1. Stage ladder — **four stages confirmed** (D12).
2. Harvest scope — **records only in v1**; Memory export is a v2 story under E7 (D13).
3. Repo timing — **created at lease approval**, outer loop attached from birth (D15).
4. Evidence verifier — **catalog component + CLI**, no standing service (D14).

**Remaining for v0.3:**

1. Who arbitrates the catalog contribution path (E9) — platform team only, or trusted BU
   maintainers with platform review? (Default until decided: platform team only.)
2. Working-title naming ("Causeway", stage names) — cosmetic, decide before first
   external comms.
