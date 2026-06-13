# Causeway — Tenets

Tenets are tie-breakers. When two good options conflict, the earlier tenet wins. Each
cites the decisions ([ADRs](adr/)) that earn it; tenets are synthesis, not new law.

1. **Agentic development, first.** Causeway exists to accelerate building **agents on
   Amazon Bedrock AgentCore under AI-DLC**. Every mechanism serves that workload class;
   nothing here is a general-purpose sandbox feature wearing an AI label. *(ADR-0003, §1.3)*

2. **The wall is a policy choice, not a law of physics.** Governance that ramps with
   maturity is the only configuration that delivers both innovation and control.
   *(README polemic)*

3. **Authority belongs to qualified crews — two keys to launch, one may be an agent.**
   The second pair of eyes is in the boat, not on shore. An elevated action needs two
   authorized concurrences from inside the crew’s envelope (≤ one an agent, neither the
   author). Off-band escalation is the exception, only when the action exceeds the crew’s
   qualification. *(ADR-0024)*

4. **Inner loop by default; ceremony only on adjudicated risk or cost.** Speed is the
   common case. The keys come out only when an agent adjudicates real risk or commercial
   exposure — not on a schedule, not on every promotion. *(ADR-0020, ADR-0021)*

5. **The cage licenses the freedom.** Crews are trusted with fast authority because they
   operate inside a box they cannot blow out of: permissions hard-walled by the OU/SCP
   ratchet, money hard-walled by ISB lease caps. *(ADR-0025, ADR-0026)*

6. **Conformance is structural, not procedural.** Each stage is a preventive SCP tier that
   binds every principal in the account — including a credentialed agent — not a checkbox
   in a pipeline. The certificate authorises the click up; you never silently loosen.
   *(ADR-0025)*

7. **Cost caps are hard in the sandbox, advisory in pre-prod.** While an account is
   disposable, the lease budget is a structural ceiling neither key can self-assert past.
   Once it’s a real workload, a kill-switch would be an outage — so FinOps governs it.
   *(ADR-0026)*

8. **Trust, but verify — and revoke.** Self-assertion moves the work; verification follows
   and can revoke it. We trade a blocking gate for an honest provisional state, never for
   an unverified permanent one. *(ADR-0020, ADR-0006)*

9. **Evidence, not opinion.** A certificate issues only when the verifier passes.
   Assertion buys you motion, never the stamp. *(ADR-0006, ADR-0022)*

10. **Verify artifacts, never programs; wait on deadlines, never on completion.** Every
    gate judges a finite thing against decidable rules; every wait has a bound. We do not
    pretend to solve the halting problem. *(ADR-0006, ADR-0008)*

11. **Disposable accounts, immortal work.** The account is always recyclable; the work is
    never lost. Harvest precedes the nuke, bounded. *(ADR-0008)*

12. **Skills adapt; they never author trust.** Generation is useful and untrusted. Lineage
    says where it came from; assertions say it complies; both are deterministic. *(ADR-0009)*

13. **Wrap, don’t fork; preview left, mint centrally.** Consume what you don’t control at a
    boundary you do. Developers preview the verdict anywhere; evidence mints only on
    platform runners with platform keys. *(ADR-0001, ADR-0016)*

14. **Govern in the layers we own — and extend the narrowest scope that makes enforcement
    preventive.** Delegated authority over the sandbox subtree, so detective controls
    become preventive without owning blast radius we shouldn’t. *(ADR-0011, ADR-0015)*

15. **One file for developers, two operated things for the platform.** Surface area is the
    enemy of adoption. Anything that adds a third operated thing or a second developer
    file must justify itself against this tenet. *(ADR-0014)*

16. **The tool is a binding, not the model.** Causeway is GitLab-centric by choice; its
    manifests and certificates are tool-neutral data, so the concept outlives the binding.
    *(ADR-0023)*
