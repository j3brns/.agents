# Testing strategy — what "test" means here

"Test" spans four kinds: **deterministic unit tests**, **statistical eval gates**,
**external-behaviour confirmations** (spikes), and the **repo consistency check**. Honesty
(ADR-0006): agent *content* is stochastic, so some gates are statistical — we make the
*gate* deterministic (fixed suite + fixed thresholds + pinned model) even when the content
varies. Acceptance per epic: [`DEFINITION-OF-DONE.md`](DEFINITION-OF-DONE.md).

> **Status:** none of these are implemented — this is a spec. This file is the strategy the
> build must realise; the DoD rows are the gates.

| # | Layer | What it checks | Deterministic? | Lives in |
|---|---|---|---|---|
| 1 | Repo consistency | `scripts/check.sh` — ADR count/index, versions, decision contiguity, epics-have-DoD | yes | this repo (runs now, green) |
| 2 | Policy-pack unit tests | OPA/conftest + cdk-nag allow/deny over rendered IaC plans | yes | catalog policy packs |
| 3 | Cedar policy tests | tool-call allow/deny tables | yes | catalog |
| 4 | Adjudicator tests | trip-wire tables, fail-safe on ambiguity, monotonic combiner, routing | yes (the *decision*) | `risk-cost-adjudicator` skill |
| 5 | Replay cassettes | harness replayed with the model stubbed | yes (bit-exact) | the unit repo |
| 6 | Eval gates | task success / grounding / safety vs thresholds | gate yes · content no | AgentCore evaluators |
| 7 | Verifier reproducibility | same manifest → identical verdict, twice, clean runner | yes | catalog verifier (S0-3) |
| 8 | Integration / acceptance | birth-of-experiment path, one promotion, a harvest cycle | yes | per DoD |
| 9 | Spike confirmations | narrow external ISB/AgentCore behaviour; cost overshoot magnitude | n/a — measure | [`SPIKES.md`](SPIKES.md) |

## What gates what
Each [`DEFINITION-OF-DONE.md`](DEFINITION-OF-DONE.md) row names the layer(s) that prove it.
The promotion gate itself = the **verifier** (layers 2–7 distilled into a signed verdict) +,
on elevation, the **two-key** concurrence. Generation (skills) is never trusted: it is
attested by lineage + Layer-1 assertions + the verifier (ADR-0009).

## The honest line on determinism
- **Deterministic** (pass/fail, reproducible): consistency, policy packs, Cedar, replay,
  verifier, the adjudicator's *escalation decision*, traceability.
- **Statistical** (thresholded, not bit-exact): eval gates over live model output — we fix
  the suite, model, params and thresholds so the *verdict* is auditable, not the tokens.
- **Measured** (a number, not a pass): spike calibrations (e.g. cost overshoot, S0-5).
