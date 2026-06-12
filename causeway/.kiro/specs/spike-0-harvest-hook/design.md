# Spike S0-1 — design

Cites SPEC §4.4 (harvest-then-nuke) and ARCHITECTURE.md §4 (bounded-wait sequence).

- **Environment**: throwaway AWS Organizations test org; ISB deployed per its
  implementation guide; 2 pooled accounts; one S0-equivalent lease template
  (minimum duration/budget to force fast expiry).
- **Instrumentation**: EventBridge rule logging all `isb` source events to CloudWatch;
  Step Functions execution history export; CodeBuild start timestamps. No agents, no
  GitLab needed — this spike isolates ISB behaviour only.
- **Hold attempts** (R2 order): the cleanup state machine ARN and its trigger rule are
  identified from the deployed hub stack; attempt (a) is a rule disable+re-enable
  pattern with a watchdog (must prove bounded), then (b) source reading of
  `account-lifecycle-manager` for an upstream hook, then (c) AppConfig
  cleanup/retry-interval settings as a de-facto delay.
- **Safety**: watchdog Lambda guarantees re-enable within the deadline regardless of
  harvest signal — encodes "cleanup always wins" in the experiment itself.
- **Out of scope**: actual harvest content (S0-3 covers evidence), GitLab wiring (S0-2).
