# Contribution: frozen design spec (discuss:post -> orchestrator)

Fork capability (SDLC-aligned). Gated by `workflow.design_spec`; the capability
layer resolves the knob, so this fragment never reads it inline.

**Optional Design Spec Generation:**

```bash
DESIGN_SPEC=$(gsd_run config-get workflow.design_spec 2>/dev/null || echo "true")
```

**Skip this step if:**
- `DESIGN_SPEC` is `"false"`
- The discussion produced fewer than 3 locked decisions with architectural weight (technology choices, data flow decisions, component structure decisions, key contracts)
- The phase is purely configuration, documentation, or trivial cleanup

**When generating:** Create `${phase_dir}/${padded_phase}-DESIGN.md` using the Write tool:

```markdown
---
phase: XX-name
generated: YYYY-MM-DDTHH:MM:SSZ
status: frozen
---

# Phase [X]: [Name] — Design Spec

**Status:** Frozen — do not modify after planning begins

## Goal

[One-sentence phase goal from ROADMAP.md]

## Architecture Overview

[High-level description of how this phase's components relate to each other
and to existing codebase. Derived from locked decisions and discussion context.
Keep to 3-5 sentences.]

## Module / Component Structure

[For each major component or module decided during discussion:]

### [Component Name]
- **Purpose:** [What it does]
- **Inputs:** [What it receives — data, props, API calls]
- **Outputs:** [What it produces — rendered UI, API responses, side effects]
- **Constraints:** [From locked decisions — D-XX references]

### [Component Name]
...

## Key Contracts

[Interfaces, API shapes, data structures, or protocols decided during discussion.
Only include contracts that were explicitly discussed — don't invent new ones.]

- **[Contract name]:** [Description, including shape if discussed]

## Non-Functional Requirements

[Performance, security, accessibility, or other quality constraints
that emerged during discussion. Omit section if none discussed.]

- [NFR 1]
- [NFR 2]

---
*Phase: XX-name*
*Design frozen: [date]*
```

**Substance check before writing:** Count locked decisions (D-XX entries) that involve technology choices, data flow, component structure, or API contracts. If fewer than 3, skip DESIGN.md generation and display: "Phase has limited architectural decisions — skipping DESIGN.md."

The DESIGN.md will be committed alongside CONTEXT.md in the git commit step.
