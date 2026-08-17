---
name: gsd-teach-phase
description: "Codify phase learnings as HITL proposals (rules / skill / MCP tool / hook) via NN-TEACH.md"
argument-hint: "<phase-number>"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

<objective>
Route each learning from a completed phase to the right durable surface (hook, MCP tool, skill, or rules) and emit NN-TEACH.md HITL proposals only — never auto-writing any surface, silent no-op when the knob is off or zero candidates match a surface signal.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/teach-phase.md
</execution_context>

Execute the teach-phase workflow from @~/.claude/gsd-core/workflows/teach-phase.md end-to-end.
