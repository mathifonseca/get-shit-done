<purpose>
Multi-lens milestone retro orchestration — spawns 4 isolated gsd-lens agents in parallel
(planner, executor, reviewer-QA, scope-CEO), then spawns gsd-lens-synthesizer to collect
their positions into a disagreement-preserving Tensions block, returning that markdown to the
caller without committing.
</purpose>

This workflow is invoked by the `write_retrospective` step in `gsd-core/workflows/complete-milestone.md`
when `workflow.milestone_retro: true`. The caller passes VERSION, SCRATCH_DIR, ARTIFACT_BASE, and
AUDIT_FILE. This workflow may also resolve those values itself (Steps 1–2) if any are absent.

<available_agent_types>
Valid GSD subagent types (use exact names — do not fall back to 'general-purpose'):
- gsd-lens — Isolated artifact-mining lens, spawned 4× in parallel (planner, executor, reviewer-QA, scope-CEO)
- gsd-lens-synthesizer — Collects the 4 lens positions into a disagreement-preserving Tensions block
</available_agent_types>

---

## Step 1: Resolve Inputs

The following variables are passed in by `write_retrospective` (the caller). If any is absent,
resolve it per Step 2:

- `VERSION` — the milestone version string (e.g. `1.2`); the caller already has this from context.
- `SCRATCH_DIR` — ephemeral directory for position files and tensions output (e.g.
  `.planning/tmp/retro-${VERSION}`). The caller sets: `SCRATCH_DIR=".planning/tmp/retro-${VERSION}"`.
- `ARTIFACT_BASE` — resolved base path for phase artifacts (Step 2).
- `AUDIT_FILE` — path to the milestone audit verdict (Step 2 dual-probe).

---

## Step 2: Resolve ARTIFACT_BASE and AUDIT_FILE

**Resolve ARTIFACT_BASE once (fix for the `:530` scan gap — phases may be archived):**

```bash
if [ -d ".planning/phases" ] && [ "$(ls -A .planning/phases 2>/dev/null)" ]; then
  ARTIFACT_BASE=".planning/phases"
else
  ARTIFACT_BASE=".planning/milestones/v${VERSION}-phases"
fi
```

**Resolve AUDIT_FILE via dual-probe (RETRO-06):**

```bash
AUDIT_FILE=".planning/v${VERSION}-MILESTONE-AUDIT.md"
if [ ! -f "$AUDIT_FILE" ]; then
  AUDIT_FILE=".planning/milestones/v${VERSION}-MILESTONE-AUDIT.md"
fi
if [ ! -f "$AUDIT_FILE" ]; then
  echo "⚠ Audit verdict not found at either probe path:"
  echo "  .planning/v${VERSION}-MILESTONE-AUDIT.md"
  echo "  .planning/milestones/v${VERSION}-MILESTONE-AUDIT.md"
  echo "  Lenses will run without audit evidence. This is a warning, not a gate."
  AUDIT_FILE=""
fi
```

**The audit verdict is an INPUT, never a GATE.** The retro runs regardless of whether the
verdict is present, and regardless of whether its status is passed/gaps_found/tech_debt.

**Create the scratch directory:**

```bash
mkdir -p "${SCRATCH_DIR}"
```

---

## Step 2b: Resolve Model Tiers

Resolve the researcher and synthesizer model tiers before spawning any lens agents. This
block is self-contained so retro.md can be invoked via Agent() without the caller
pre-substituting model placeholders.

```bash
_GSD_SHIM_NAME="gsd-tools.cjs"; _GSD_RUNTIME_ROOT="${RUNTIME_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"; GSD_TOOLS="${_GSD_RUNTIME_ROOT}/gsd-core/bin/${_GSD_SHIM_NAME}"; if [ -f "$GSD_TOOLS" ]; then gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif command -v gsd-tools >/dev/null 2>&1; then GSD_TOOLS="$(command -v gsd-tools)"; gsd_run() { "$GSD_TOOLS" "$@"; }; elif [ -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${HERMES_HOME:-$HOME/.hermes}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${HERMES_HOME:-$HOME/.hermes}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CURSOR_CONFIG_DIR:-$HOME/.cursor}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CURSOR_CONFIG_DIR:-$HOME/.cursor}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CODEX_HOME:-$HOME/.codex}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CODEX_HOME:-$HOME/.codex}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${GEMINI_CONFIG_DIR:-$HOME/.gemini}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${GEMINI_CONFIG_DIR:-$HOME/.gemini}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${COPILOT_CONFIG_DIR:-$HOME/.copilot}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${COPILOT_CONFIG_DIR:-$HOME/.copilot}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${AUGMENT_CONFIG_DIR:-$HOME/.augment}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${AUGMENT_CONFIG_DIR:-$HOME/.augment}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${TRAE_CONFIG_DIR:-$HOME/.trae}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${TRAE_CONFIG_DIR:-$HOME/.trae}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${QWEN_CONFIG_DIR:-$HOME/.qwen}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${QWEN_CONFIG_DIR:-$HOME/.qwen}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CLINE_CONFIG_DIR:-$HOME/.cline}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CLINE_CONFIG_DIR:-$HOME/.cline}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${GROK_AGENTS_HOME:-$HOME/.agents}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${GROK_AGENTS_HOME:-$HOME/.agents}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; else echo "ERROR: gsd-tools.cjs not found at $GSD_TOOLS and gsd-tools is not on PATH. Run: npx -y @opengsd/gsd-core@latest --claude --local" >&2; exit 1; fi; if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -n "${GSD_TOOLS:-}" ]; then printf "export PATH='%s':\"\$PATH\"\n" "${GSD_TOOLS%/*}" >> "$CLAUDE_ENV_FILE" 2>/dev/null || true; fi
# Resolve via the portable gsd_run shim (above) — args passed by argv, JSON parsed from
# stdin. Avoids interpolating $GSD_TOOLS into an execSync `sh -c` string, which word-splits
# on paths containing spaces and silently falls back to the default tier. (#WR-01)
_resolve_model() { gsd_run query resolve-model "$1" 2>/dev/null | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{process.stdout.write((JSON.parse(s||'{}').model)||'')}catch(e){}})"; }
researcher_model=$(_resolve_model gsd-project-researcher)
[ -n "$researcher_model" ] || researcher_model=$(_resolve_model gsd-lens)
[ -n "$researcher_model" ] || researcher_model="sonnet"
synthesizer_model=$(_resolve_model gsd-research-synthesizer)
[ -n "$synthesizer_model" ] || synthesizer_model=$(_resolve_model gsd-lens-synthesizer)
[ -n "$synthesizer_model" ] || synthesizer_model="${researcher_model}"
```

---

## Step 3: Spawn 4 Isolated gsd-lens Agents in Parallel

> ◆ Spawning 4 lens agents + synthesizer (runs in a subagent — no output until they return, ~2–5 min; expected, not a freeze)

Each lens receives its own prompt block with: `LENS_IDENTITY`, `ARTIFACTS_TO_MINE` (concrete
`${ARTIFACT_BASE}` glob forms — never prose as a path), `OUTPUT_CONTRACT` (forward-looking
framing + no-leak guard), and `OUTPUT_PATH` in the scratch dir.

Each lens is read-only on its mined artifacts and writes ONLY to its own `OUTPUT_PATH` in
`${SCRATCH_DIR}` — never to a mined artifact (D-03 isolation invariant).

---

### Spawn: Planner lens

```text
Agent(prompt="
LENS_IDENTITY: planner's-eye

ARTIFACTS_TO_MINE:
  - ${ARTIFACT_BASE}/*/0*-PLAN.md
  - ${ARTIFACT_BASE}/*/0*-SUMMARY.md
  - ${AUDIT_FILE}

OUTPUT_CONTRACT:
  Stake a position as the planner's-eye: what would you have done differently in planning
  this milestone? Mine PLAN.md files for bets, scoping decisions, and intermediate estimates.
  Mine SUMMARY.md files to see how plan-time bets played out at execution time.

  Phrase your findings as lessons and candidate changes — what you'd have planned differently.
  Each finding should include: the plan artifact citation, the observed outcome, and a lesson.

  Format each key finding as:
    - planner's-eye: {observation} (evidence: {artifact citation})
    - Candidate change: {what to do differently next time}

  IMPORTANT — no-leak guard: the audit verdict (if present) is context only.
  Do NOT reproduce its pass/fail verdict framing. Do NOT write 'requirement X was
  satisfied/unsatisfied' or use verdict language. Phrase everything as 'what I'd change'
  and lessons only.

OUTPUT_PATH: ${SCRATCH_DIR}/position-planner.md
", subagent_type="gsd-lens", model="${researcher_model}", description="Planner lens")
```

---

### Spawn: Executor lens

```text
Agent(prompt="
LENS_IDENTITY: executor's-eye

ARTIFACTS_TO_MINE:
  - ${ARTIFACT_BASE}/*/0*-SUMMARY.md
  - ${ARTIFACT_BASE}/*/deviation*.md
  - ${AUDIT_FILE}

OUTPUT_CONTRACT:
  Stake a position as the executor's-eye: what would you have done differently in executing
  this milestone? Mine SUMMARY.md files for completed/skipped tasks, deviations documented,
  and actual vs planned outcomes. Mine deviation*.md files for auto-fix records and blockers.

  For git-log evidence of execution cadence, also run:
    git log --oneline --since={milestone_start_date}
  to observe commit frequency, size, and sequencing patterns.

  Phrase your findings as lessons and candidate changes — what you'd have executed differently.
  Each finding should include: the artifact citation, the deviation or outcome, and a lesson.

  Format each key finding as:
    - executor's-eye: {observation} (evidence: {artifact citation})
    - Candidate change: {what to do differently next time}

  IMPORTANT — no-leak guard: the audit verdict (if present) is context only.
  Do NOT reproduce its pass/fail verdict framing. Do NOT write 'requirement X was
  satisfied/unsatisfied' or use verdict language. Phrase everything as 'what I'd change'
  and lessons only.

OUTPUT_PATH: ${SCRATCH_DIR}/position-executor.md
", subagent_type="gsd-lens", model="${researcher_model}", description="Executor lens")
```

---

### Spawn: Reviewer-QA lens

```text
Agent(prompt="
LENS_IDENTITY: reviewer/QA-eye

ARTIFACTS_TO_MINE:
  - ${ARTIFACT_BASE}/*/*-REVIEW.md
  - ${ARTIFACT_BASE}/*/*-VERIFICATION.md
  - ${AUDIT_FILE}

OUTPUT_CONTRACT:
  Stake a position as the reviewer/QA-eye: what would you have done differently in reviewing
  and verifying this milestone? Mine REVIEW.md files for quality feedback, acceptance-criteria
  assessments, and reviewer observations. Mine VERIFICATION.md files for test results,
  pass/fail patterns, and verification gaps.

  Phrase your findings as lessons and candidate changes — what you'd have reviewed or verified
  differently. Each finding should include: the artifact citation, the observed quality signal,
  and a lesson.

  Format each key finding as:
    - reviewer/QA-eye: {observation} (evidence: {artifact citation})
    - Candidate change: {what to do differently next time}

  IMPORTANT — no-leak guard: the audit verdict (if present) is context only.
  Do NOT reproduce its pass/fail verdict framing. Do NOT write 'requirement X was
  satisfied/unsatisfied' or use verdict language. Phrase everything as 'what I'd change'
  and lessons only.

OUTPUT_PATH: ${SCRATCH_DIR}/position-reviewer-qa.md
", subagent_type="gsd-lens", model="${researcher_model}", description="Reviewer-QA lens")
```

---

### Spawn: Scope-CEO lens

```text
Agent(prompt="
LENS_IDENTITY: scope/CEO-eye

ARTIFACTS_TO_MINE:
  - docs/adr/*.md
  - .planning/PROJECT.md
  - .planning/ROADMAP.md
  - ${AUDIT_FILE}

OUTPUT_CONTRACT:
  Stake a position as the scope/CEO-eye: what would you have decided differently about scope,
  strategic direction, and architectural choices in this milestone? Mine ADRs for key decisions
  and their stated rationale. Mine PROJECT.md and ROADMAP.md for kill-criteria, strategic bets,
  and scope boundaries.

  Phrase your findings as lessons and candidate changes — what you'd have scoped or decided
  differently. Each finding should include: the ADR or strategic artifact citation, the observed
  consequence, and a lesson.

  Format each key finding as:
    - scope/CEO-eye: {observation} (evidence: {artifact citation})
    - Candidate change: {what to do differently next time}

  IMPORTANT — no-leak guard: the audit verdict (if present) is context only.
  Do NOT reproduce its pass/fail verdict framing. Do NOT write 'requirement X was
  satisfied/unsatisfied' or use verdict language. Phrase everything as 'what I'd change'
  and lessons only.

OUTPUT_PATH: ${SCRATCH_DIR}/position-scope-ceo.md
", subagent_type="gsd-lens", model="${researcher_model}", description="Scope-CEO lens")
```

---

> **ORCHESTRATOR RULE — CODEX RUNTIME**: After calling all 4 lens Agent() calls above, do NOT
> read lens position files or synthesize content independently while the subagents are active.
> Wait for all 4 lenses to complete before spawning the synthesizer. This prevents duplicate
> work and wasted context.

---

## Step 4: Spawn gsd-lens-synthesizer

After all 4 lens agents complete, spawn the synthesizer against the scratch directory:

```text
Agent(prompt="
<task>
Collect the lens positions from the scratch directory and synthesize them into a
disagreement-preserving Tensions output.
</task>

<files_to_read>
- ${SCRATCH_DIR}/   (read all *.md files in this directory — each is a lens position)
</files_to_read>

<output_contract>
Emit the FULL retro heading scheme one level deeper than your default:
  - Use a '### Tensions' header (NOT '## Tensions')
  - Use '#### T{n} — {question}' per-tension blocks (NOT '### T{n}')
  so the block nests inside an existing '## Milestone:' entry in RETROSPECTIVE.md.

For each axis of disagreement, emit one '#### T{n}' block with:
  - Per-lens position bullets in the format:
      - {lens}'s-eye: {observation} (evidence: {citation})
  - A 'Disagreement:' line naming the nature of the conflict
  - A 'Candidate change:' line with the forward-looking action

NEVER collapse conflicting positions into a blended statement. Preserve each lens's
position verbatim with its evidence citation.

If all lenses genuinely converge on all axes, write an explicit consensus note INTO
THE OUTPUT — emit a '### Consensus' section stating:
  'No disagreement surfaced — converged on: {summary}'
rather than leaving the Tensions section empty. The section still exists; convergence
is a flagged signal.
</output_contract>

OUTPUT_PATH: ${SCRATCH_DIR}/tensions.md

DO NOT commit. The caller (write_retrospective) owns the single splice + commit.
", subagent_type="gsd-lens-synthesizer", model="${synthesizer_model}", description="Synthesize lens tensions")
```

---

## Step 5: Return Tensions Text to Caller

After the synthesizer completes, read `${SCRATCH_DIR}/tensions.md` and return its content
as text to the caller (`write_retrospective`).

**retro.md does NOT write into `RETROSPECTIVE.md` and does NOT commit.** The caller
(`write_retrospective`) owns the single splice into the `.planning/RETROSPECTIVE.md` milestone
entry and uses its existing commit. One writer/committer for `RETROSPECTIVE.md` keeps the
knob-off path trivially byte-identical and avoids a double-commit (D-03, single writer/committer).

---

## Step 6: Success-Gated Cleanup Contract

**This cleanup is the CALLER's responsibility, not this workflow's.**

After the Tensions block is successfully spliced AND committed into `RETROSPECTIVE.md`,
the caller (`write_retrospective`) MUST run:

```bash
rm -rf "${SCRATCH_DIR}"
```

**Scoping constraint:** The `rm -rf` target MUST be exactly `${SCRATCH_DIR}` — the namespaced
path (e.g. `.planning/tmp/retro-${VERSION}/`) that is disjoint from `.planning/phases/`,
`.planning/milestones/`, and `.planning/RETROSPECTIVE.md`. This scoping ensures cleanup can
never delete outside the scratch path.

**If the splice or commit fails**, the scratch dir is LEFT IN PLACE so partial lens positions
are inspectable for debugging (D-02 success-gated cleanup). Do NOT clean on failure.

---

## Graduation Feed-Forward Handoff (D-07, RETRO-08)

Each `Candidate change:` line in the Tensions output is the **documented input** to the
next-transition `graduation` HITL.

**Flow:** At the developer's next phase transition (`/gsd:transition` → `graduation` step),
the developer brings the `Candidate change:` lines from the `### Tensions` block in
`.planning/RETROSPECTIVE.md` into the graduation review, where candidates are evaluated for
promotion to `CLAUDE.md` or `.claude/rules/`.

**There is NO `graduation.md` code change and NO `extract-learnings` coupling.** The timing
reality: `graduation` runs per-phase-transition (clustering `*-LEARNINGS.md` files), while
the retro runs once at milestone-complete. A mechanical auto-route would fight that mismatch.
The documented handoff is deliberate (RETRO-08 "(or its documented flow)" acceptance clause).
