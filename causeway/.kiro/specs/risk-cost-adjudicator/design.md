# Risk & Cost Adjudicator — design

Cites SPEC §2.5 (self-asserted governance) and §9.3 (certificates); ADR-0020/0021/0022.

- **Form**: a catalog component wrapping a CLI (reuses the verifier's plumbing, ADR-0012),
  invoked on every push and on promotion MRs. Not a standing service.
- **Two-tier evaluation**:
  1. **Trip-wire layer (authoritative, deterministic)**: OPA/conftest rules over the
     rendered IaC plan, the manifest diff, and a spend-projection computed from the plan
     + Cost Explorer rates. Pure functions; versioned in the catalog; unit-tested. Output
     is a set of fired trip-wires.
  2. **Reasoning layer (additive only)**: a pinned-model AgentCore evaluator that may
     raise additional escalations with rationale, but is structurally barred from
     clearing a fired trip-wire (monotonic-safety: final verdict = OR of both layers).
- **Routing**: fired axes map to GitLab approval rules — risk→security CODEOWNERS,
  cost→budget-owner group — so four-eyes is native MR approval, conditional on the
  adjudicator's label. (Portability seam: the label+verdict is tool-neutral; GitLab
  approval rules are the current binding — ADR-0023.)
- **Self-assertion semantics**: `self-assertable` ⇒ the promotion proceeds provisionally;
  the verifier runs async; on verifier failure the certificate is revoked and the unit is
  frozen (ADR-0020). `four-eyes-required` ⇒ promotion blocks on the routed approvals AND
  the verifier, both, before a certificate issues.
- **Out of scope**: budget *enforcement* (ISB's job); the adjudicator only adjudicates.
