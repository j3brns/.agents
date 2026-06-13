# Spikes — confirmations & calibrations, not design-blockers

**Discipline (ADR-0028): design the answer from validated behaviour first; spike only to
*confirm* a narrow external unknown or *calibrate* a magnitude.** Every entry states the
**designed answer** it is checking, its known-behaviour basis (see the coherence map,
[`SPEC.md` §4.5](SPEC.md)), and the fallback. None of these blocks the build — the roadmap
proceeds on the designed answers while these run in parallel.

## Classification

| # | Kind | Designed answer (proceeds now) | What the spike adds |
|---|---|---|---|
| S0-1 | Confirm (non-blocking) | **Harvest is continuous** (ADR-0029) → no cleanup-hold needed | that `durationThresholds` gives enough lead for the final flush |
| S0-2 | Confirm | A **dedicated IdC automation identity** calls the lease API; blueprint carries the OIDC trust role | the exact supported principal type for ISB's API auth |
| S0-3 | Build-acceptance | Verifier **reproducibility is our design** (pinned versions, hashed inputs) | a regression test on our own code — not an external unknown |
| S0-4 | Confirm (narrow) | **Account-level SCP ratchet**, account stays in `Active` — orthogonal to ISB's OU-based drift (ADR-0025) | that ISB drift doesn't *also* watch account-SCP attachments (expected: it doesn't) |
| S0-5 | Calibrate | Preventive caps (SCP service/instance denials + AgentCore token/rate caps) hold the real-time line (ADR-0027) | the **magnitude** of budget overshoot at the S0 cap; tune the caps |

---

## S0-1 · Final-flush lead time (confirms ADR-0029) — non-blocking
- **Designed answer**: harvest is continuous; the repo is a near-complete harvest at all
  times, so cleanup needs no hold. Known basis: we own the evidence pipeline (§9).
- **Confirm**: ISB's `durationThresholds` pre-expiry event fires with enough lead for a
  deadline-bounded final flush. **Fallback**: shorten the flush; accept a small recorded gap.

## S0-2 · Pipeline-vended lease + OIDC (confirms ADR-0004/0013)
- **Designed answer**: a dedicated IAM Identity Center **automation identity** calls
  `POST /leases`; the stage blueprint deploys the OIDC trust role the runner then assumes —
  no stored keys. Known basis: `/leases` + blueprint provisioning are validated (§4.5).
- **Confirm**: ISB's API accepts an automation/service principal (not only interactive IdC
  users). **Fallback**: a scoped token broker in front of the lease API.

## S0-3 · One promotion verifies reproducibly (build-acceptance, our design)
- **Designed answer**: the verifier is deterministic by construction — pinned component/
  policy/model versions, hashed inputs, machine-written manifest. Reproducibility is a
  property we **build and test**, not an ISB unknown.
- **Acceptance**: same manifest → identical verdict on a clean runner, twice. **Fallback**:
  pin or drop any non-reproducible evidence item.

## S0-4 · Account-level SCPs vs ISB drift (confirms ADR-0025) — narrow
- **Designed answer**: stages are **account-level SCP tiers** while the account stays in
  ISB's `Active` OU — no OU move, so ISB's **OU-based** drift detection (validated, §4.5)
  has nothing to flag; ISB does not manage account-level SCPs, so it won't revert them.
  This is the designed **primary** mechanism, not a contingency.
- **Confirm**: ISB drift doesn't *additionally* inspect account-SCP attachments (expected:
  no). **Fallback ladder**: true stage-OUs only if CCoE extends ISB's expected-OU config →
  pipeline-only (degraded).

## S0-5 · Cost overshoot magnitude (calibrates ADR-0027)
- **Designed answer**: the real-time cap is **preventive** — SCP-deny expensive instance
  types/services/regions + AgentCore max-tokens/inference-profile budgets/Gateway rate
  limits/Runtime timeouts; the small ISB lease budget is the lagging backstop.
- **Calibrate**: deliberately burn a small lease (benign resource + Bedrock token loop);
  record **$ over `maxSpend`** at terminate and the preventive denials' effect; tune caps
  and budget so absolute overshoot is acceptable. **Fallback**: tighten the preventive
  layer; never lean on the budget as the primary control.

## Results

| Spike | Date | Verdict | Notes |
|---|---|---|---|
| S0-1 | — | pending (non-blocking) | final-flush lead time |
| S0-2 | — | pending | ISB API auth for automation principal |
| S0-3 | — | pending (build-acceptance) | verifier determinism |
| S0-4 | — | pending (narrow) | account-SCPs vs OU drift |
| S0-5 | — | pending (calibration) | cost overshoot + preventive caps |
