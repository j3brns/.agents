# Risk & Cost Adjudicator — requirements

The agent skill that decides, per change, whether the inner loop continues or four-eyes
is required (D25/D26, ADR-0020/0021). Governing tenet: ceremony only on adjudicated risk
or cost. The adjudicator is the "verify" that makes self-assertion safe.

## R1 — Inputs
- THE adjudicator SHALL take: the change (diff), the unit's current promotion manifest
  and certificate, the lease/budget state (ISB API), and the requested stage transition
  (if any).

## R2 — Two axes of exposure
- THE adjudicator SHALL classify **risk** exposure: IAM/permission changes, new resource
  types outside the catalog, network/egress changes, data-class changes, model changes to
  non-allowlisted models, blast-radius increases.
- THE adjudicator SHALL classify **commercial/cost** exposure: projected spend delta vs.
  lease budget trajectory, licensing/commercial-term changes, data-egress cost, quota
  reservation.

## R3 — Fail-safe, monotonic decision
- THE decision SHALL be one of `self-assertable` | `four-eyes-required`, with reasons.
- Trip-wire rules (versioned policy pack) are authoritative: WHEN any trip-wire fires,
  THE verdict SHALL be `four-eyes-required` and model-assisted reasoning SHALL NOT
  override it (monotonic: reasoning may ADD escalations, never REMOVE a ruled one).
- WHEN inputs are ambiguous or incomplete, THE verdict SHALL default to
  `four-eyes-required` (fail safe).
- WHEN the requested transition crosses S2→S3, THE verdict SHALL be `four-eyes-required`
  unconditionally (the governed-estate boundary).

## R4 — Routing
- WHEN risk-elevated, THE escalation SHALL route to a security-competent reviewer
  (CODEOWNERS/approval rule); WHEN cost-elevated, to the BU budget owner; both if both.

## R5 — Attestable adjudication
- THE adjudicator's verdict, reasons, policy-pack version, and inputs digest SHALL be
  recorded as an evidence item in the manifest and surfaced on the certificate (ADR-0022).
  The adjudicator is itself audited; its decisions are evidence.

## R6 — Preview, mint centrally
- THE same checks SHALL be runnable locally as `causeway verify --adjudicate` (advisory);
  the binding verdict SHALL be minted only on a platform runner (ADR-0016).

## Acceptance
- Deterministic trip-wire suite with unit tests (allow/deny tables); fail-safe proven by
  ambiguous-input cases; verdict appears in manifest + certificate; routing verified.
