# Causeway — PR/FAQ

Working-backwards document. The press release is written as if Causeway is already GA
internally; it is aspirational and sets the bar. The FAQ answers the questions each
stakeholder actually asks.

---

## PRESS RELEASE

### Internal platform teams can now graduate sandbox experiments to pre-prod without rebuilding them from scratch

**INTERNAL ANNOUNCEMENT —** Today the Platform Engineering team announces **Causeway**,
the graduated innovation stage that turns the throwaway innovation sandbox into the first
stage of the software lifecycle. For the first time, an agent prototype built in a
disposable sandbox account can mature — through evidence, not rework — into a pre-prod
workload, with a signed, auditable trail at every step.

Until now, our innovation sandbox did its job too literally: it deleted everything when
the lease ended. A prototype that worked died on a schedule, and the team that needed it
in production rebuilt it months later from memory. The wall between "innovation" and
"governed" cost us our best ideas twice — once when they were lost, and again when they
were rebuilt badly.

Causeway removes the wall by replacing it with a ramp. Work progresses through four
stages — Explore, Incubate, Harden, Pre-prod — accumulating deterministic, signed
evidence in standard GitLab pipelines. Developers touch one file. Promotion is a one-line
merge request whose approval is a verifier's verdict, not a meeting. And because most
steps carry no real risk, developers stay in the fast inner loop by default: a risk-and-
cost **adjudicator agent** watches every change, and only when it detects genuine risk or
commercial exposure does it pull in a second human. Ceremony is spent where it counts.

"We stopped asking people to choose between moving fast and being governed," said the
platform lead. "The sandbox is now where governed software *starts*, not where ideas go
to be demonstrated and forgotten. Accounts stay disposable. The work became immortal."

Causeway is built on AWS Innovation Sandbox, Amazon Bedrock AgentCore, and self-managed
GitLab — extended, never forked. It is available to business units today; onboarding a BU
takes about a day, and a developer's first sandbox is minutes away.

---

## FAQ

### For the developer

**Q: What do I actually have to do?**
File a "new experiment" issue. You get a repo and an account, pre-wired. Build with
`agentcore dev` and `git push`. To promote, open a merge request that changes one line in
`causeway.yml`. That is the whole surface.

**Q: Will governance slow me down?**
Not by default. You stay in the inner loop until the adjudicator agent flags real risk or
cost. You can run `causeway verify` locally to see the exact verdict the gate will give,
before you push — no surprises.

**Q: What happens to my work when the lease ends?**
It's harvested first — image, evaluation baselines, and an experiment record are saved —
then the account is recycled. You can park an experiment and revive it later. Nothing of
value is destroyed with the account.

### For the CISO / security

**Q: Isn't "self-assertion" just trust without control?**
No. It's trust-but-verify with revocation. A self-asserted promotion is provisional: the
verifier still runs, and if the evidence fails, the certificate is revoked and the unit
freezes. High-risk transitions and the pre-prod boundary always require two pairs of
eyes. Every promotion produces a signed, published certificate naming its evidence and
approvers.

**Q: Can an agent with AWS credentials do something the pipeline didn't catch?**
That is exactly why conformance is **structural, not procedural**: each stage tightens the
account's own guardrails (SCPs), binding every principal — including a misbehaving agent —
not just paths through our tooling. The account ratchets up through preventive SCP tiers as
it matures, and the attestation certificate is what authorises each tightening. Detective
pipeline checks decide *whether* you may climb; the SCP tier enforces the posture once you
do. (This needs delegated SCP authority scoped to the sandbox subtree — landed before any
unit reaches Harden. Without it we fall back to detective-only, with a named risk sign-off.)

**Q: How do you verify something an AI generated?**
We never verify generated programs in general — that's undecidable. We verify finite
artifacts against decidable rules: rendered IaC plans against policy packs, recorded
traces replayed bit-exact, evaluations against fixed thresholds on pinned models.
Generation is constrained to adapting catalogued templates, with lineage on every
instance.

### For the CCoE / cloud platform

**Q: Did you fork our Innovation Sandbox?**
No. Causeway consumes it through its REST API and event bus, never a fork. A fork is
permitted only if three things fail in sequence — and we'd contribute upstream first.

**Q: What do you need from us?**
Two things: delegated SCP administration scoped to the sandbox OU subtree (not the org),
and landing-zone-vended accounts for pre-prod graduation. If you decline the delegation,
every Harden entry carries a named risk-acceptance sign-off — the residual risk becomes
your visible, recurring decision rather than our silent default.

### For finance / the budget owner

**Q: How is cost controlled, and who watches commercial exposure?**
Two regimes, split at the pool boundary. **In the sandbox (S0–S2)** every lease carries a
**hard budget enforced by Innovation Sandbox itself**: breach a threshold and the account
freezes; at the ceiling our control plane terminates and recycles it. Because freezing
alone doesn't stop already-running resources, the *ceiling* action is termination, and
thresholds sit below the true cap to absorb billing latency — so a self-asserting crew's
spend is bounded by construction. **In pre-prod (S3)** the workload isn't disposable, so a
kill-switch would be an outage: cost reverts to your **existing FinOps process** (budgets,
anomaly detection, showback/chargeback), with Causeway feeding advisory cost evidence.
Separately, the adjudicator treats within-cap cost *elevation* as a trigger for crew
two-key concurrence. Chargeback rolls up per business unit.

**Q: Who actually approves things — is this another approval queue?**
No — that's the point. Authority is **delegated to qualified crews**. An elevated action
needs **two authorized people-or-agents in the crew to concur** (the launch-code rule;
at most one is an agent, neither is the author). You only escalate out-of-band when an
action exceeds what your crew is qualified for. The continuous out-of-band approval queue
is exactly what we removed.

### For the skeptic

**Q: What's the catch / what's unproven?**
Three assumptions are still being converted to facts by one-week spikes: whether the
sandbox can hold cleanup behind a bounded harvest signal, whether a pipeline can vend a
lease and assume a role end-to-end, and whether one promotion verifies reproducibly. We
named them before building, and each has a fallback. See SPIKES.md.

**Q: Why GitLab for everything?**
Because owning the whole outer loop in one system is what makes the developer surface a
single file. It's a deliberate bet, not an accident — and the evidence it produces is
tool-neutral data, so the model isn't trapped if the binding ever changes.
