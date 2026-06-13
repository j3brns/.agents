# Causeway — Tenets

Tenets are tie-breakers. When two good options conflict, the earlier tenet wins. Each
cites the decisions ([ADRs](adr/)) that earn it; tenets are synthesis, not new law.

1. **The wall is a policy choice, not a law of physics.** Governance that ramps with
   maturity is the only configuration that delivers both innovation and control.
   *(README polemic)*

2. **Inner loop by default; ceremony only on adjudicated risk or cost.** Speed is the
   common case. A human is pulled in when an agent adjudicates real risk or commercial
   exposure — not on a schedule, not on every promotion. *(ADR-0020)*

3. **Trust, but verify — and revoke.** Self-assertion moves the work; verification
   follows and can revoke it. We trade a blocking gate for an honest provisional state,
   never for an unverified permanent one. *(ADR-0020, ADR-0006)*

4. **Evidence, not opinion.** A certificate issues only when the verifier passes.
   Assertion buys you motion, never the stamp. *(ADR-0006, ADR-0022)*

5. **Verify artifacts, never programs; wait on deadlines, never on completion.** Every
   gate judges a finite thing against decidable rules; every wait has a bound. We do not
   pretend to solve the halting problem. *(ADR-0006, ADR-0008)*

6. **Disposable accounts, immortal work.** The account is always recyclable; the work is
   never lost. Harvest precedes the nuke, bounded. *(ADR-0008)*

7. **Skills adapt; they never author trust.** Generation is useful and untrusted. Lineage
   says where it came from; assertions say it complies; both are deterministic. *(ADR-0009)*

8. **Wrap, don't fork; preview left, mint centrally.** Consume what you don't control at
   a boundary you do. Developers preview the verdict anywhere; evidence mints only on
   platform runners with platform keys. *(ADR-0001, ADR-0016)*

9. **Govern in the layers we own — and extend the narrowest scope that makes enforcement
   preventive.** Not whole-org authority; delegated authority over the sandbox subtree,
   so detective controls become preventive without owning blast radius we shouldn't.
   *(ADR-0011, ADR-0015)*

10. **One file for developers, two operated things for the platform.** Surface area is
    the enemy of adoption. Anything that adds a third operated thing or a second
    developer file must justify itself against this tenet. *(ADR-0014)*

11. **Self-assertion is earned, and auditable.** The right to self-assert is granted by a
    unit's attestation history and revoked by failure. The adjudicator's own decisions
    are evidence. *(ADR-0020, ADR-0021)*

12. **The tool is a binding, not the model.** Causeway is GitLab-centric by choice; its
    manifests and certificates are tool-neutral data, so the concept outlives the
    binding. *(ADR-0023)*
