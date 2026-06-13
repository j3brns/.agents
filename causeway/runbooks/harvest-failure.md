# Runbook — harvest timeout / partial harvest

> **Persona — who runs this:** the platform **on-call engineer** + the **ops agent**;
> the **CCoE engineer** only if cleanup itself is stuck (quarantine path).

Context: ADR-0008. Harvest is idempotent and incremental; cleanup always wins.
A timeout = *partial* capture, recorded as fact. Authority tags per [README.md](README.md).

1. [agent-ok] Read the harvest job log: manifest fragment lists every item
   `captured | missing` (image digest, eval baselines, experiment record, drift report).
2. [agent-ok] If the account still exists (hold window live): re-run harvest once —
   idempotent, fetches only `missing`. Bound: one re-run, then escalate.
3. [agent-ok] If the account is already cleaned: mark missing items `lost-at-harvest`
   in the experiment record — the ledger stays honest. No further action.
4. [human-ack] Same item class times out twice in a week → systemic: open a refinement
   iteration (longer hold if S0-1 verified one; earlier harvest at duration threshold;
   or shrink the item).
5. [ccoe] Only if cleanup itself is stuck (quarantine path) — harvest never blocks
   cleanup by design, so a stuck account is an ISB issue, not a Causeway one.
