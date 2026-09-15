---
name: gsd:parallel-phases
description: Run independent phases in parallel — one worktree each, ledgers merged back via structured commands
argument-hint: "[--phases N,M,...] [--from N] [--to N]"
effort: high
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Agent
  - AskUserQuestion
requires: [autonomous, phase]
---
<objective>
Identify phases in the current milestone that are dependency-satisfied and mutually independent of one another, run each to completion (discuss→plan→execute→code-review→verify:post hooks→teach) in its own isolated git worktree in parallel, then merge each back into the current branch one at a time — replaying the shared planning ledgers (ROADMAP.md, STATE.md, REQUIREMENTS.md, WINDOWS.md) via structured `gsd-tools` commands rather than a raw text merge, so two phases' independent completions can never collide on a row id or a YAML key.

Distinct from `/gsd-manager` (background-dispatches plan/execute for different phases onto the SAME shared tree — safe only because those two steps never touch the shared ledgers) and `/gsd-autonomous` (fully sequential, one phase at a time). This skill is for the case where several phases are independent AND you want them to actually run concurrently, ledgers included.

**Creates/Updates:**
- One git worktree/branch per eligible phase (created and cleaned up during the run).
- `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/WINDOWS.md` — updated once per phase during merge-back, via structured commands.
- Phase artifacts — CONTEXT.md, PLANs, SUMMARYs, REVIEW.md, SECURITY.md/VALIDATION.md (if those capabilities are active), TEACH.md (if enabled) per phase.

**After:** All eligible phases for the requested batch are merged into the current branch. Milestone-level close-out (audit/complete) is a separate, deliberate action — not run automatically.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/parallel-phases.md
@~/.claude/gsd-core/references/ui-brand.md
</execution_context>

<context>
Optional flags:
- `--phases N,M,...` — run exactly this explicit set of phases (still subject to the eligibility check; a phase in this list that turns out to depend on another phase in the list, or on an incomplete phase outside it, is excluded and reported, not silently skipped).
- `--from N` / `--to N` — a phase-number range, same semantics as `/gsd-autonomous`.
- No flags — default to every incomplete phase in the current milestone.

Project context, phase list, dependencies, and completion status are resolved inside the workflow using `gsd-tools query init.manager`, re-derived against the raw ROADMAP.md `**Depends on:**` text (the JSON's own `dep_phases` field is a coarse substring scan that misreads negations like "independent of Phase N" — the workflow does its own re-derivation, see step 2). No upfront context loading needed.
</context>

<process>
Execute end-to-end.
Preserve all workflow gates (eligibility/independence check, single-message fan-out, ff-only-first merge, structured-command ledger replay, the STATE.md safety net, the full-suite gate before each merge commit, escalation on any unexpected conflict outside the known shared ledgers).
</process>
