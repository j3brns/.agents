# Runbook — break-glass

> **Persona — who runs this:** the platform **on-call engineer** (human) decides; the
> **ops agent** prepares and verifies the calls. Not the developer, not the BU lead.

For incidents inside a leased sandbox account (runaway spend ISB hasn't caught,
credential exposure, hostile workload). Authority tags per [README.md](README.md).

1. [agent-ok] **Freeze**: `POST /leases/{id}/freeze` via the control project's manual
   job (records actor + reason). Reversible; resources keep running, access removed.
   Verify: lease status == Frozen.
2. [agent-ok] **Assemble evidence**: lease record, spend curve, recent CloudWatch/OTel
   traces, last pipeline runs — presented as a single incident note.
3. [human-ack] **Inspect**: SSO into the account (read-only role first). Blast radius
   is the lease by design.
4. **Decide**:
   - benign → [agent-ok] `POST /leases/{id}/unfreeze`; verify status Active;
   - compromised/hostile → [human-ack] `POST /leases/{id}/terminate` → harvest runs
     (bounded) → cleanup nukes → pool recycles;
   - cleanup fails → ISB quarantines; follow operations.md alarm row.
5. **Never** (any actor): hand-delete resources in a pool account (breaks Nuke's
   ledger), move accounts between OUs by hand (drift quarantine), or "emergency-promote"
   past the verifier — a promotion without a verdict *is* the incident.
6. [agent-ok] Post-incident: append to the unit's experiment record; if systemic, open
   a refinement iteration (REFINEMENT.md) rather than a local patch.
