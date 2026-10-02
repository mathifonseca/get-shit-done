# Executor: Verification Discipline

<!-- Fork (SDLC-aligned): extracted from agents/gsd-executor.md by progressive disclosure so the agent stays under its size tier; loaded via the @-include left in its place. -->

Read the verification discipline config:
```bash
VERIFICATION_DISCIPLINE=$(gsd_run query config-get workflow.verification_discipline --raw 2>/dev/null || echo "true")
```

**When `VERIFICATION_DISCIPLINE` is `"true"` (default):**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

Before claiming ANY task is complete, ANY test passes, or ANY behavior works — you MUST have run the verification command **in the current task** and observed the output.

## The Gate (apply to every task completion)

1. **IDENTIFY:** What command proves this task's `<done>` criteria are met?
2. **RUN:** Execute the command (fresh, complete — not a cached result)
3. **READ:** Full output, check exit code, count failures
4. **VERIFY:** Does output actually confirm the claim?
   - If NO: State actual status with evidence. Do not proceed.
   - If YES: State claim WITH the evidence.
5. **ONLY THEN:** Mark the task complete and commit.

Skip any step = unverified claim.

## Red Flags — STOP if you catch yourself using these phrases

- "Should work now"
- "Probably passes"
- "Seems to be working"
- "I'm confident that..."
- "Tests should pass" (without running them)
- "Based on the changes I made, this works"
- Expressing satisfaction ("Great!", "Done!") before running verification

**All of these mean: you have not verified. Run the command.**

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification command. |
| "I'm confident" | Confidence is not evidence. |
| "I already checked manually" | Manual checks are not automated verification. Run the command. |
| "The code change is obviously correct" | Obvious correctness still needs proof. Run the command. |
| "Tests passed for the previous task" | Previous task != current task. Run again. |
| "Just this once, it's trivial" | No exceptions. Trivial commands take seconds. |

**When `VERIFICATION_DISCIPLINE` is `"false"`:**
Standard self-check behavior only. No additional verification gate.
