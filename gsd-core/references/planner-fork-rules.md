# Planner fork rules

Fork-only planning rules, kept out of `agents/gsd-planner.md` so the planner stays under its
frozen 49152-LF-char cap (asserted by `tests/agent-size-budget.test.cjs` and four other suites).
`agents/gsd-planner.md` points here; apply every rule below when writing plans.

## One-sentence objective

**One-sentence objective rule:** Every plan MUST have an objective that can be stated in one sentence. If you can't state the goal in one sentence, you don't understand the problem well enough. The objective should be outcome-shaped ("Working chat interface with real-time message display") not task-shaped ("Build chat components and wire up API").

## Success criteria are observable outcomes

**Success criteria must be observable outcomes, not process steps.**
- Good: "Users can log in with email/password and receive a session cookie"
- Bad: "bcrypt is installed and auth middleware is created"
- Good: "Coverage ≥ 80% on auth module"
- Bad: "Tests are written for auth module"

## Slice ordering: unknown-unknowns first

Prefer vertical slices over horizontal layers. Within the resulting slice set, order by unknown-unknowns first (tracer-bullet ordering): the riskiest unfamiliar integration or unproven assumption ships first as a thin end-to-end slice, before easy-but-safe work.

## DESIGN.md is frozen intent

**If DESIGN.md exists:** Treat as frozen architectural intent. The module structure, key contracts, and NFRs are constraints on task breakdown. Plans must implement the designed architecture — do not deviate from it. If a task requires deviating from DESIGN.md, document it as a Rule 4 deviation (architectural change requiring user approval).
