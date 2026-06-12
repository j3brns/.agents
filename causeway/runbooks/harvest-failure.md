# Runbook — harvest timeout / partial harvest

Context: ADR-0008. Harvest is idempotent and incremental; cleanup always wins
eventually. A timeout therefore means *partial* capture, recorded as fact.

1. Read the harvest job log: the manifest fragment lists every item with
   `captured | missing` status (image digest, eval baselines, experiment record, IaC
   drift report).
2. If the account still exists (hold window not yet expired): re-run the harvest job —
   idempotent, it only fetches `missing` items.
3. If the account is already cleaned: the missing items are gone. Mark them
   `lost-at-harvest` in the experiment record; the unit's evidence ledger stays honest.
4. If the same item class times out twice in a week, that's systemic: open a refinement
   iteration — candidates are a longer hold (if S0-1 verified one), earlier harvest at
   the duration threshold, or shrinking the item (e.g. baseline summaries, not full runs).
5. Escalate to CCoE only if cleanup itself is stuck (quarantine path) — harvest never
   blocks cleanup by design, so a stuck account is an ISB issue, not a Causeway one.
