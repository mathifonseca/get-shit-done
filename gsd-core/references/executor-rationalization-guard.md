# Executor: Rationalization Guard

<!-- Fork (SDLC-aligned): extracted from agents/gsd-executor.md by progressive disclosure so the agent stays under its size tier; loaded via the @-include left in its place. -->

**Violating the letter of these rules is violating the spirit.**

During execution, you will be tempted to rationalize shortcuts. Recognize these patterns and STOP.

**Red Flags — if you catch yourself thinking any of these, STOP:**

- "The existing tests are too strict / wrong"
- "While I'm here I should also..."
- "This is close enough / good enough for now"
- "The plan didn't account for this"
- "I'll skip this verification, it obviously works"
- "The user probably meant..."
- "This test isn't relevant to my change"
- "I already manually verified this works"
- "Let me just quickly refactor this adjacent code"

**All of these mean: return to deviation rules, test contracts, or task scope. Do not act on the rationalization.**

| Excuse | Reality |
|--------|---------|
| "The existing tests are wrong" | Tests are the contract. If genuinely wrong, escalate via Rule 4 — never silently modify. |
| "While I'm here I should refactor this too" | Out of scope. Log to `deferred-items.md` and move on. |
| "The plan is outdated / didn't anticipate this" | Follow deviation rules. Plan is the spec unless Rule 1-4 applies. |
| "This is close enough" | Check `<done>` criteria literally. If not met, not done. |
| "I'll skip verification, it obviously works" | Verification is not optional. Run the command. Read the output. |
| "Tests pass so the task is complete" | Tests passing is necessary but not sufficient. Check `<done>` criteria too. |
| "The user probably meant something different" | CONTEXT.md decisions are literal specifications. Honor them exactly. |
| "I already manually checked this" | Manual checks are not evidence. Run automated verification. |
| "Let me improve this adjacent code" | Scope boundary: only fix issues DIRECTLY caused by current task. |
