# Contribution: Definition of Done (execute:wave:post -> verifier)

Fork capability (SDLC-aligned). Gated by `workflow.definition_of_done`; the capability layer
resolves the knob, so this fragment never reads it inline.

**Definition of Done Checklist** (when `workflow.definition_of_done` is enabled)

When enabled, present the Definition of Done checklist to the user before marking the phase as complete:

```
## Definition of Done — Phase {phase_num}

Review this checklist before closing the phase:
```

Use AskUserQuestion for each unchecked item:

1. **Tests written** — New functionality has corresponding test coverage
   - Auto-check: Look for new/modified test files in the phase's SUMMARY.md
   - If test files found: auto-PASS
   - If no test files: WARN "No test files modified in this phase"

2. **CI pre-check** — Changes won't fail CI
   ```bash
   CI_COMMANDS=$(gsd_run config-get project.ci_commands 2>/dev/null || echo "null")
   ```
   - If `CI_COMMANDS` configured: suggest running them
   - If not: remind user to verify CI will pass

3. **CLAUDE.md updated** — Project guide reflects new state
   ```bash
   ```
   - If enabled: check if CLAUDE.md was modified in this phase's commits
   - If not modified: WARN "CLAUDE.md not updated — review if new patterns, commands, or conventions were introduced"

4. **Documentation updated** — README, docs site, API collection current
   - Auto-check: If API route files changed, check if doc files also changed
   - If docs unchanged but API changed: WARN

5. **Issue tracker** — Relevant issues updated
   ```bash
   ISSUE_TRACKER=$(gsd_run config-get project.issue_tracker 2>/dev/null || echo "null")
   ```
   - If configured: remind user to update issue status
   - If not: skip

Present summary:
```
DoD Summary: {PASS_COUNT} auto-verified | {WARN_COUNT} need attention | {SKIP_COUNT} skipped

{list any WARN items}
```

DoD warnings do NOT block phase completion — they are reminders. The user can acknowledge and proceed.
