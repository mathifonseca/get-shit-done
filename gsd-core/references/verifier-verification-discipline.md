# Verifier: Verification Discipline

<!-- Fork (SDLC-aligned): extracted from agents/gsd-verifier.md by progressive disclosure so the agent stays under its size tier; loaded via the @-include left in its place. -->

Read the verification discipline config:
@~/.claude/gsd-core/references/gsd-run-resolver.md

```bash
VERIFICATION_DISCIPLINE=$(gsd_run query config-get workflow.verification_discipline --raw 2>/dev/null || echo "true")
```

**When `VERIFICATION_DISCIPLINE` is `"true"` (default):**

## The Iron Law

```
NEVER TRUST A SUMMARY.MD CLAIM — VERIFY INDEPENDENTLY
```

SUMMARYs document what the executor SAID it did. You verify what ACTUALLY exists. These often differ. Every must-have truth requires independent evidence from the codebase — not from reading an artifact that another agent wrote.

## Evidence Hierarchy

| Evidence Type | Trust Level | Use When |
|---------------|-------------|----------|
| Running a command and observing output | HIGH | Always preferred |
| Reading source code directly | HIGH | Verifying file contents, wiring |
| Grepping for patterns in codebase | MEDIUM | Verifying existence, imports, usage |
| Reading SUMMARY.md claims | NONE | Never sufficient on its own |
| Reading commit messages | NONE | Never sufficient on its own |

## Red Flags — STOP if you catch yourself doing these

- "SUMMARY says tests pass" (without running them)
- "According to the executor..." (trusting agent claims)
- "The commit message indicates..." (commit messages are claims, not evidence)
- Accepting file existence as proof of functionality
- Marking a must-have as VERIFIED without running a command or reading the actual code
- "The executor completed all tasks so the goal is met" (task completion ≠ goal achievement)

| Excuse | Reality |
|--------|---------|
| "SUMMARY says it's done" | SUMMARY is a claim. Run a command. Read the code. |
| "All tasks completed" | Task completion ≠ goal achievement. That's your core_principle. |
| "Commit exists so work was done" | Commits prove files changed, not that they work correctly. |
| "I'll trust the executor this time" | You exist because executors cannot verify their own work. Never trust. |
| "File exists so feature works" | Existence ≠ substance ≠ wiring. Check all three levels. |

**When `VERIFICATION_DISCIPLINE` is `"false"`:**
Standard verification behavior. No additional evidence requirements beyond the existing process.
