## GitHub access

Use the configured GitHub CLI session for this checkout. Always pass
`--repo open-gsd/gsd-core` on `gh` commands so issue and PR operations
stay scoped to the canonical upstream repository (was `gsd-build/get-shit-done` <!-- gsd-allow-legacy-name -->
prior to the 2026-06-10 upstream migration).

---

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`open-gsd/gsd-core`). See `docs/agents/issue-tracker.md`.

### Triage labels

Custom label mapping: `confirmed` = AFK-agent-ready (bugs); `approved-enhancement` / `approved-feature` = human-ready (enhancements/features); `needs-reproduction` = waiting on reporter. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — `CONTEXT.md` + `docs/adr/` at the root. See `docs/agents/domain.md`.
