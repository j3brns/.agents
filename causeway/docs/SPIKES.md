# Spike 0 — assumptions that must become facts

Three one-week spikes convert the spec's riskiest assumptions into facts **before any
roadmap commitment**. Each has a falsifiable claim, an experiment, and a fallback design
so a negative result changes the spec instead of killing it. Results are appended here
and linked from the governing ADR (per [`REFINEMENT.md`](REFINEMENT.md) step 5).

## S0-1 · The harvest hold (governs ADR-0008) — **highest risk**

- **Claim**: stock ISB can be made to delay account cleanup behind an external,
  deadline-bounded signal (or an equivalent pre-cleanup hook exists).
- **Experiment**: deploy ISB in a test org; end a lease; trace
  `CleanAccountRequest` → Step Functions → CodeBuild timing; attempt (a) an EventBridge
  rule that gates the state machine, (b) a wait-state contribution point upstream,
  (c) measuring the natural gap between event and Nuke start.
- **Pass**: a supported hold ≥ harvest deadline without forking ISB.
- **Fallback if failed**: harvest fires at the *duration-threshold alert* (pre-expiry,
  ISB-native), accepting a race window; ADR-0008 superseded accordingly; upstream
  feature request filed.

## S0-2 · Pipeline-driven lease + OIDC bootstrap (governs ADR-0004, ADR-0013)

- **Claim**: a GitLab pipeline can request an ISB lease via the REST API, the blueprint
  deploys the OIDC trust role, and a runner job then assumes that role in the leased
  account — end to end, no human, no stored keys.
- **Experiment**: minimal control-project pipeline → `POST /leases` → poll →
  blueprint-deployed role → OIDC `aws sts assume-role-with-web-identity` → deploy a
  hello-world via `agentcore deploy`.
- **Pass**: green pipeline from issue-form trigger to agent invocation in the sandbox.
- **Fallback if failed**: identify which link broke (ISB auth model for API callers is
  the likely suspect — it expects IAM Identity Center users); design a service-account
  pattern or scoped token broker; supersede affected ADR.

## S0-3 · One promotion through the verifier (governs ADR-0005, -0006, -0010, -0012)

- **Claim**: a digest-pinned, cosign/KMS-signed image with SLSA-L1 provenance, a
  policy-assertion-report, and a replay verdict can be assembled into a machine-written
  manifest and deterministically verified by a CLI in a promotion MR — twice, with
  identical verdicts.
- **Experiment**: hand-rolled minimal catalog (pipeline component + verifier CLI stub)
  promoting the S0-2 hello-world from explore→incubate.
- **Pass**: verifier verdict reproducible from the manifest alone on a clean runner.
- **Fallback if failed**: usually a non-reproducible evidence item — pin it or drop it
  from the v1 ledger; record in ADR.

## S0-4 · The OU ratchet vs. ISB drift (governs ADR-0025) — **new in v0.10**

- **Claim**: a delegated actor can express per-lease progressive conformance by **attaching
  account-level SCPs to a pooled account while it stays in ISB's `Active` OU** (primary —
  no OU move, so no drift trip), and ISB **CleanUp detaches them on recycle**. Secondary:
  whether true stage-OUs are viable at all given ISB drift-quarantine.
- **Experiment**: in the S0-1 test org, with delegated SCP admin: **(primary)** lease an
  account, attach S1 then S2 account-level SCPs while it stays in `Active`, confirm no
  drift→quarantine and that the SCPs bind; end the lease and confirm CleanUp detaches them
  (next lease starts at S0). **(secondary)** attempt a sibling-OU move and observe whether
  drift quarantines it, to confirm the constraint that forced the account-level approach.
- **Pass**: account-level SCP tiers survive a full S0→S2→recycle cycle without quarantine,
  bind every principal, and detach on recycle.
- **Fallback if both fail**: pipeline-only detective enforcement (today's degraded
  posture, ADR-0015); supersede ADR-0025's "primary enforcement" claim accordingly.

## Results

| Spike | Date | Verdict | Notes / ADR action |
|---|---|---|---|
| S0-1 | — | pending | |
| S0-2 | — | pending | |
| S0-3 | — | pending | |
| S0-4 | — | pending | OU ratchet vs ISB drift (ADR-0025) |
