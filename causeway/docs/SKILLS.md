# Skills inventory — the agent skills the design depends on

Governing rule (ADR-0009): **skills generate or adjudicate; their output is never trusted —
it is attested.** Lineage says where it came from; Layer-1 assertions + the verifier say it
complies; both are deterministic. Skills run on platform runners (mint centrally, ADR-0016);
previews may run locally (`causeway verify --adjudicate`). Tests for each are gated by
[`DEFINITION-OF-DONE.md`](DEFINITION-OF-DONE.md); strategy in [`TESTING.md`](TESTING.md).

| Skill | Status | Purpose |
|---|---|---|
| **risk-cost-adjudicator** | specced ([`.kiro/specs/risk-cost-adjudicator/`](../.kiro/specs/risk-cost-adjudicator/requirements.md)) | decide self-assertable vs two-keys per change |
| **scaffolder / lineage-stamper** | to spec (E5) | materialise a unit from golden templates; stamp lineage |
| **catalog-inductor** | to spec (E9) | induct a novel pattern into the catalog via a gated MR |

Not skills (listed to avoid confusion): the **verifier** and **policy packs** are
CLIs/components (ADR-0012), deterministic by construction; the **harvest** and **control**
flows are pipelines. Their tests live with the catalog (TESTING.md).

## risk-cost-adjudicator (ADR-0021)
- **In → out**: `(change diff, manifest, lease/budget state, requested transition)` →
  `{verdict: self-assertable | two-keys-required, axes:{risk,cost}, reasons, pack_version, inputs_digest}`.
- **Contract**: trip-wire policy packs are **authoritative**; model reasoning is
  **additive-only** (may raise escalations, never clear a ruled one); ambiguity ⇒ escalate
  (fail-safe); `S2→S3` ⇒ two-keys unconditionally. The verdict is itself recorded as evidence.
- **Required tests**: trip-wire allow/deny tables (risk + cost axes); fail-safe on
  ambiguous/incomplete input; monotonic-combiner test (reasoning can't clear a trip-wire);
  routing test (risk→security, cost→budget-owner *within the crew*, not a central group);
  S2→S3 unconditional. **Determinism**: the *escalation decision* is deterministic.

## scaffolder / lineage-stamper (ADR-0009, E5)
- **In → out**: `(template@version, params)` → `(materialised agentcore/ + causeway.yml,
  lineage stamp {template_id, version, adaptation_diff_digest, adapting_skill@version})`.
- **Contract**: may **adapt** catalogued templates only; may **not** introduce un-catalogued
  resource types or pipeline jobs (enforced structurally by a Layer-1 assertion, not trust).
- **Required tests**: lineage completeness (every materialised instance carries a full
  stamp); **negative** test — an un-catalogued resource type is rejected by the assertion;
  diff-digest integrity (stamp matches the actual adaptation).

## catalog-inductor (E9)
- **In → out**: `(novel pattern proposal)` → `(catalog-contribution MR)`.
- **Contract**: a pattern enters the catalog only via review + policy-pack gate + semver
  release; experiments then *consume* it. Prevents catalog rot while keeping the wall down.
- **Required tests**: contribution MR passes the policy-pack gate; semver release produced;
  SLA documented (O1 governs who arbitrates).

## The one rule that makes generation safe
Wherever a skill generates or adapts anything, **generation is never trusted; its output is
attested** — lineage (where), Layer-1 assertions (complies), verifier (evidence). A skill can
be a poor generator without ever being a compliance hole.
