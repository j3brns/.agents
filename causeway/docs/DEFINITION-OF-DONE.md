# Definition of Done — what must be true to finish each spec item

The spec records *decisions*; this records the *acceptance criteria*. An epic is **not
finished** until its row's conditions are demonstrably true (a passing test, a confirmed
spike, or a produced+verified artifact). Tests/strategy: [`TESTING.md`](TESTING.md). Skills:
[`SKILLS.md`](SKILLS.md). Build order and epic definitions: [`SPEC.md` §11](SPEC.md).

> **Readiness today:** this is a **specification at v0.13**, not an implementation. Nothing
> below is built yet. "Done" here defines the gate each epic must pass when built. The repo
> is *ready to continue* (refine or build); it is *not* "done".

| Epic | Done when (must all be true) | Verified by |
|---|---|---|
| **E1 Control project** | a pipeline requests a lease via the ISB API (automation identity), receives `LeaseApproved`, creates the repo from template, replies on the issue with repo+SSO links; all four EventBridge routes each trigger their pipeline; manifest writes are idempotent (re-run = no-op) | integration test: the "birth of an experiment" path (ARCHITECTURE §3); idempotency test; S0-2 confirm |
| **E2 Stage bootstraps** | each S0/S1/S2 bootstrap is a registered ISB blueprint that, at provisioning, yields the OIDC trust role + OTel/log wiring; a runner assumes the role with no stored keys | smoke: runner `assume-role-with-web-identity` succeeds in a leased account; S0-2 |
| **E3 Catalog pipeline** | `causeway/pipeline@N` reads `causeway.yml` and runs stage-appropriate jobs (advisory vs blocking per stage); policy packs have passing unit tests; replay-runner replays a cassette bit-exact | policy-pack unit tests green; replay determinism test; one repo runs the component end-to-end |
| **E4 Evidence & verifier** | verifier CLI yields an **identical verdict twice** from one manifest on a clean runner; cosign+KMS signing works; a certificate issues and **publishes to Pages**; revocation flips `status` and re-publishes | S0-3 reproducibility test; signature verify; certificate publish + revoke test |
| **E5 Templates / scaffolder** | scaffolding a unit produces a valid `agentcore/` + `causeway.yml`; **complete lineage stamped**; a Layer-1 assertion **rejects** an un-catalogued resource type | scaffolder tests (SKILLS.md); lineage-completeness test; negative test (un-catalogued type fails) |
| **E6 Model governance** | Bedrock allow/deny-list enforced as config; pin-on-first-baseline rule fires; Cedar tool-policy suite has passing allow/deny tests | model-policy enforcement test; Cedar unit tests green |
| **E7 Harvest** | continuous harvest streams evidence on every push; the **final-flush job runs at `durationThresholds`**; experiment record written; park→revive re-vends from harvested state | S0-1 confirm (lead time); harvest integration test; revive test |
| **E8 Tenancy** | per-BU groups + compliance frameworks enforce stage tiers (a repo cannot opt out); chargeback maps to ISB `costReportGroup` | compliance-pipeline enforcement test; chargeback rollup check |
| **E9 Catalog contribution** | a pattern-induction MR passes the policy-pack gate and semver-releases into the catalog; SLA documented | contribution-path integration test |
| **E10 Self-asserted governance** | adjudicator returns **deterministic** verdicts (trip-wire unit tests pass, fail-safe on ambiguity); two-key concurrence enforced (≥1 independent of author, ≤1 agent) via approval rules; certificate gating works; **async-verify failure freezes the unit** | adjudicator tests (SKILLS.md); two-key approval-rule test; revoke-on-fail test |

## Cross-cutting "must be true" (any epic)
- The **traceability invariant** holds (`scripts/check.sh` green; REFINEMENT.md gate).
- No **unbounded waits**; gates judge **finite artifacts**, never programs (ADR-0006/0008).
- Conformance is **preventive** where delegated SCP authority exists; degraded-to-detective
  is explicitly risk-accepted otherwise (ADR-0015).
- Every generated artefact carries **lineage**; generation is never trusted (ADR-0009).
- The cost **preventive caps** (SCP + AgentCore token/rate) are in place; the budget is the
  backstop, calibrated by S0-5 (ADR-0027).
