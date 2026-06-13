# .scratch — throwaway space (contents are gitignored)

Per AGENTS.md rule 7: **ad-hoc scripts and experiments go here; durable methods go in
[`../scripts/`](../scripts/).** Nothing in this directory except this README and the
`.gitignore` is tracked, so you can experiment freely without leaving cruft in the repo.

**Why this exists:** a one-off script left in the tracked tree becomes unowned debt — the
next agent fears to delete it and may mistake it for a dependency. If a method is worth
keeping, it earns a named, maintained home in `scripts/` (and a mention in AGENTS.md);
otherwise it lives and dies here. Prefer an ephemeral inline command over committing a
script you won't maintain.
