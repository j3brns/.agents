# Causeway — Architecture views

Companion to [`SPEC.md`](SPEC.md) (normative). These views are explanatory.

## 1. Component view — two operated things on two estates we own

```mermaid
flowchart LR
  subgraph DEV["Developer surface (one file)"]
    REPO["Experiment repo\ncauseway.yml + agentcore/ + code"]
  end

  subgraph GL["GitLab (platform-owned)"]
    CTRL["causeway-control\ntrigger-driven pipelines\n(no service, no DB)"]
    CAT["causeway-catalog\ncomponents · policy packs · verifier\ntemplates · bootstraps\nONE release train"]
    REG["Container/Package registry\ndigest-pinned OCI + evidence"]
  end

  subgraph ISB["Innovation Sandbox on AWS (CCoE-deployed)"]
    API["REST API\n/leases /accounts /blueprints"]
    EB["EventBridge lifecycle events"]
    POOL["Account pool OUs\nAvailable→Active→CleanUp"]
    NUKE["Step Functions → CodeBuild → AWS Nuke"]
  end

  subgraph AC["AgentCore / Bedrock estate (platform-owned)"]
    RT["Runtime (microVMs)"]
    GW["Gateway + Cedar tool policy"]
    EVAL["Evaluators / OTel GenAI"]
    KMS["KMS signing keys"]
  end

  REPO -- "push → stage pipeline" --> CAT
  CAT -- "OIDC, per-stage role" --> POOL
  EB -- "API Destination → trigger" --> CTRL
  CTRL -- "lease/blueprint calls" --> API
  CTRL -- "repos, MRs, manifests" --> REPO
  CAT -- "signed images + evidence" --> REG
  CAT -- "cosign" --> KMS
  REPO -- "agentcore deploy" --> RT
  RT --- GW
  CAT -- "eval gates" --> EVAL
  NUKE -. "preceded by harvest (bounded wait)" .-> CTRL
```

Ownership boundary (ADR-0011): GitLab and the AgentCore estate are platform-owned;
ISB's org/OU/SCP layer is operated by the CCoE and consumed via API/events only.

## 2. Stage ladder (ADR-0003)

```mermaid
flowchart LR
  S0["S0 Explore\nISB lease $50/7d\nany model · code deploy\npipeline advisory"]
  S1["S1 Incubate\nlease $250/30d\npinned model · OCI digest\ncontracts+replay blocking"]
  S2["S2 Harden\nlease $500/30d\nallowlist · signed+provenance\neval thresholds gate"]
  S3["S3 Pre-prod\nCCoE-vended account\nsame digest redeployed\nverify-and-deploy only"]
  S0 -- "MR: stage change\n+ verifier verdict" --> S1 -- "verifier" --> S2 -- "verifier + rebuild handover" --> S3
  S0 -. "lease expiry → harvest → nuke" .-> H["experiment record\n(park / kill / revive)"]
  S1 -. " " .-> H
```

## 3. Sequence — birth of an experiment (ADR-0013, ADR-0015 in spec terms D15)

```mermaid
sequenceDiagram
  participant Dev
  participant GL as GitLab issue form
  participant CTRL as causeway-control
  participant ISB as ISB API
  participant EB as EventBridge

  Dev->>GL: "New experiment" (name, BU, hypothesis)
  GL->>CTRL: trigger
  CTRL->>ISB: POST /leases (S0 template)
  ISB->>EB: LeaseApproved
  Note over ISB: blueprint deploys S0 bootstrap<br/>(OIDC trust, OTel, logging)
  EB->>CTRL: trigger (API Destination)
  CTRL->>GL: create repo from stage template
  CTRL->>Dev: issue reply: repo link + account SSO link
  Dev->>GL: git push → stage pipeline (advisory tier)
```

## 4. Sequence — harvest then nuke, bounded (ADR-0008)

```mermaid
sequenceDiagram
  participant ISB
  participant EB as EventBridge
  participant CTRL as causeway-control
  participant HV as harvest pipeline

  ISB->>EB: CleanAccountRequest (lease ended)
  EB->>CTRL: trigger
  CTRL->>ISB: freeze lease (stop spend)
  CTRL->>HV: run harvest (idempotent, incremental)
  HV-->>HV: push digest · export baselines · write experiment record
  alt completes within deadline
    HV->>CTRL: done
  else hard timeout
    CTRL->>CTRL: record partial-harvest fact (alarm)
  end
  CTRL->>ISB: release hold → cleanup proceeds
  Note over ISB: AWS Nuke. The account is reborn.<br/>Cleanup ALWAYS wins eventually.
```

Spike-0 caveat: whether stock ISB exposes a pre-cleanup hold point is **unverified**
([`SPIKES.md`](SPIKES.md) S0-1). Fallback design: harvest at the duration-threshold
alert (pre-expiry), accepting a small race window.

## 5. Evidence flow (ADR-0006, ADR-0010)

Finite artifacts in, decidable verdicts out — never "verify the program":

```
plan/policy-pack ─► policy-assertion-report ─┐
cassettes/replay ─► replay verdict ──────────┤   promotion manifest   verifier (catalog CLI)
eval suite (pinned model, N trials) ─► pass ─┼─► (machine-written) ─► signed verdict
image build ─► digest + SLSA-L1 + cosign ────┤                         = MR approvable
lineage stamps (template@ver + diff) ────────┘
```
