# Risk & Cost Adjudicator — tasks

- [ ] 1. Define the trip-wire policy pack (risk axis): IAM/permission, off-catalog
      resource types, network/egress, data-class, non-allowlisted model (R2, R3)
- [ ] 2. Define the trip-wire policy pack (cost axis): spend-projection from plan + rates;
      budget-trajectory threshold; egress/quota (R2, R3)
- [ ] 3. Unit-test both packs with allow/deny tables; prove fail-safe on ambiguous input (R3)
- [ ] 4. Implement the monotonic combiner (verdict = OR of trip-wires and additive
      reasoning; reasoning cannot clear a ruled escalation) (R3)
- [ ] 5. Wire the S2→S3 unconditional four-eyes rule (R3)
- [ ] 6. Map axes → GitLab approval rules / CODEOWNERS for routing (R4)
- [ ] 7. Emit verdict+reasons+pack-version+inputs-digest into the manifest; render onto
      the certificate (R5, ADR-0022)
- [ ] 8. Package as `causeway verify --adjudicate` (advisory local) + central-mint job (R6)
- [ ] 9. Integration test: a self-assertable change flows uninterrupted; a cost-elevating
      change routes to the budget owner; a risk-elevating change routes to security
