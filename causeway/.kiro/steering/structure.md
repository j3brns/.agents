# Structure — repo layout and editing rules

- docs/SPEC.md — normative; version-bumped once per refinement iteration.
- docs/adr/ — immutable ADRs; supersede, never edit; keep README.md index current.
- docs/ANSWERS.md — append-only interview record.
- docs/REFINEMENT.md — the process; follow it for any "refine/iterate" request.
- docs/SPIKES.md — falsifiable claims + results table; append-only results.
- docs/ARCHITECTURE.md, runbooks/ — derived views; regenerate with every spec delta.
- .kiro/specs/<unit>/ — requirements.md (EARS notation, citing ADRs), design.md
  (citing SPEC sections), tasks.md (verifiable done-criteria).
- Traceability invariant before any merge:
  ANSWERS round → Dnn (SPEC §0) → ADR → SPEC section → derived artifact, both ways.
