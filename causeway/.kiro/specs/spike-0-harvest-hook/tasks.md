# Spike S0-1 — tasks

- [ ] 1. Stand up test org + deploy ISB (CCoE-assisted); register 2 accounts (R1)
- [ ] 2. Instrument event/Step Functions/CodeBuild timeline capture (R1)
- [ ] 3. Run 3 lease-expiry cycles; record min/median event→Nuke gap (R1)
- [ ] 4. Attempt hold (a): gated trigger rule + bounded watchdog; prove deadline wins (R2)
- [ ] 5. If (a) fails: source-read lifecycle manager for upstream hook point (R2)
- [ ] 6. If (b) fails: test AppConfig retry-interval as de-facto delay (R2)
- [ ] 7. Append verdict + hold ceiling to docs/SPIKES.md results table (R3)
- [ ] 8. On fail: draft superseding ADR (harvest at duration threshold + race window) (R3)
- [ ] 9. Tear down test org; commit scripts/notes under this directory
