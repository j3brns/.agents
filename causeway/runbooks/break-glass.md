# Runbook — break-glass

For incidents inside a leased sandbox account (runaway spend ISB hasn't caught,
credential exposure, hostile workload).

1. **Freeze**: `POST /leases/{id}/freeze` via the control project's manual job (records
   actor + reason in the job log). Freezing removes user access; resources keep running.
2. **Inspect**: SSO into the account via Identity Center admin access (read-only role
   first). The account is isolated by design — blast radius is the lease.
3. **Decide**:
   - benign → `unfreeze`;
   - compromised/hostile → `POST /leases/{id}/terminate` → harvest runs (bounded) →
     cleanup nukes the account → pool recycles it;
   - cleanup itself fails → ISB quarantines; follow operations.md alarm row.
4. **Never**: hand-delete resources in a pool account (breaks Nuke's ledger), move
   accounts between OUs by hand (triggers drift quarantine), or bypass the manifest to
   "emergency-promote" — there is no such thing; a promotion without a verifier verdict
   is the incident.
5. Post-incident: append the event to the unit's experiment record; if the gap was
   systemic, open a refinement iteration (REFINEMENT.md) rather than a local patch.
