# Causeway

**The wall between innovation and production is a policy choice, not a law of physics.
This repo is the demolition plan.**

## The polemic

Every enterprise has built the same machine, and it has the same defect. On one side:
the *innovation sandbox* — disposable AWS accounts, generous permissions, a budget cap,
and a guillotine. Build whatever you want; in seven days AWS Nuke deletes it all. On the
other side: the *governed estate* — change control, evidence, attestation, audit. Between
them: nothing. No bridge, no path, no door.

So the machine produces exactly what it is designed to produce: **innovation theater**.
Prototypes that work are rebuilt from screenshots and memory by a different team six
months later, badly. Knowledge dies on a schedule, by design, every lease expiry. The
sandbox is where ideas go to be *demonstrated*, and then to die. Meanwhile the governed
estate calcifies, because nothing new can reach it without a quarter of ceremony — so
people stop trying, or worse, they ship the prototype by ejecting the account from
governance entirely. The wall doesn't keep risk out. It keeps evidence from ever being
collected.

The standard responses are both wrong:

- **"Loosen production governance"** — no. The controls exist for reasons; a CISO who
  can't explain the governance ramp to a regulator doesn't have one.
- **"Govern the sandbox harder"** — also no. A sandbox with change control is just a
  slow production environment. Exploration dies in direct proportion to ceremony.

The wall is not the controls. The wall is the *discontinuity* — the absence of any
mechanism by which work accumulates standing as it matures. Causeway's claim:

> **Make the sandbox stage S0 of the SDLC.** Give every lease a repo at birth. Let every
> push generate signed, deterministic evidence through catalogued pipelines. Make
> promotion a one-line merge request whose approval is a *verifier verdict*, not an
> opinion. Harvest everything of value before the nuke. Keep the accounts disposable
> forever — and make the work immortal.

Governance that ramps with maturity isn't a compromise between innovation and control.
It is the only configuration in which you get either.

## What this is

Causeway extends **[Innovation Sandbox on AWS](https://github.com/aws-solutions/innovation-sandbox-on-aws)**
(ISB) — consumed strictly via its REST API and EventBridge events, never forked — into a
graduated innovation stage for **agentic workloads on Amazon Bedrock AgentCore**, built
under **AI-DLC**, with **GitLab** as the evidence-generating outer loop.

Four stages: **S0 Explore → S1 Incubate → S2 Harden → S3 Pre-prod.** One file for
developers (`causeway.yml`). Two operated things for the platform team (a control
project and a catalog monorepo). Four on-call alarms. Seven things that may never be
simplified away.

## Read this repo

| Artifact | What it is |
|---|---|
| [`docs/PRFAQ.md`](docs/PRFAQ.md) | Press release + FAQ — the out-of-band pitch by stakeholder |
| [`docs/TENETS.md`](docs/TENETS.md) | The tenets — tie-break ordered, each citing its ADRs |
| [`docs/MENTAL-MODEL.md`](docs/MENTAL-MODEL.md) | One-page mental model: the wall→ramp, parcel+passport, customs |
| [`docs/SPEC.md`](docs/SPEC.md) | The full specification (v0.9) — stages, self-asserted governance, evidence, epics |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Component and sequence views (diagrams) |
| [`docs/adr/`](docs/adr/) | 23 immutable Architecture Decision Records — the *why* behind every load-bearing choice |
| [`docs/ANSWERS.md`](docs/ANSWERS.md) | The stakeholder interview record that produced the decisions |
| [`docs/REFINEMENT.md`](docs/REFINEMENT.md) | The refinement loop: how this spec evolves, by humans or CLI agents |
| [`docs/SPIKES.md`](docs/SPIKES.md) | Spike 0 — the three assumptions that must become facts before roadmap commitment |
| [`slides/causeway.html`](slides/causeway.html) | Slide deck (self-contained HTML) — the pitch; `slides/TALK-TRACK.md` for the talk-track |
| [`runbooks/`](runbooks/) | Operator day-2: operations, break-glass, harvest failure |
| [`AGENTS.md`](AGENTS.md) | Operating contract for CLI agents (Kiro, Claude Code, others) working this repo |
| [`.kiro/`](.kiro/) | Kiro steering + spec-driven-development packages (requirements/design/tasks) |

## Status

Specification, v0.9. No production code yet — deliberately. Spike 0
([`docs/SPIKES.md`](docs/SPIKES.md)) converts the three riskiest assumptions into facts
before any roadmap is committed. The build order after that is
[`docs/SPEC.md` §11](docs/SPEC.md): control project first, catalog second.
