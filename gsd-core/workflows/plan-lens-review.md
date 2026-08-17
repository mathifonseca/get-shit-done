<purpose>
Advisory negotiated plan-quality review — spawns 2–4 isolated gsd-lens agents in a Round 1
(position staking) then a Round 2 (rebuttal, each lens reads the other lenses' Round 1 positions),
spawns gsd-lens-synthesizer on the Round 2 positions, classifies each tension as a fact-conflict
(probed inline) or a value-tradeoff (AskUserQuestion), and writes NN-PLAN-RATIONALE.md +
NN-KILL-CRITERIA.md. This is a second concrete consumer of the frozen gsd-lens engine, validating
CON-lens-generic without modifying either frozen agent.
</purpose>

This workflow is invoked from `gsd-core/workflows/plan-phase.md` when `workflow.plan_lens_review: true`.
The caller passes PADDED_PHASE, PHASE_DIR, and the list of NN-PLAN.md files to review.

<available_agent_types>
Valid GSD subagent types (use exact names — do not fall back to 'general-purpose'):
- gsd-lens — Isolated artifact-mining lens, spawned 2–4× per round (scope/value, feasibility, maintainability, conditional UX)
- gsd-lens-synthesizer — Collects the Round-2 lens positions into a disagreement-preserving tensions output
</available_agent_types>

---

## Step 1: Resolve Inputs and Set Up Shim

The following variables are passed in by the plan-phase caller. If any is absent, resolve below:

- `PADDED_PHASE` — zero-padded phase number (e.g. `03`).
- `PHASE_DIR` — path to the phase directory (e.g. `.planning/phases/03-lens-reuse-codify`).
- `PLAN_FILES` — list of `NN-PLAN.md` files in this phase.

Resolve the portable `gsd_run` shim and model tiers:

```bash

_GSD_SHIM_NAME="gsd-tools.cjs"; _GSD_RUNTIME_ROOT="${RUNTIME_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"; GSD_TOOLS="${_GSD_RUNTIME_ROOT}/gsd-core/bin/${_GSD_SHIM_NAME}"; if [ -f "$GSD_TOOLS" ]; then gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif command -v gsd-tools >/dev/null 2>&1; then GSD_TOOLS="$(command -v gsd-tools)"; gsd_run() { "$GSD_TOOLS" "$@"; }; elif [ -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${HERMES_HOME:-$HOME/.hermes}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${HERMES_HOME:-$HOME/.hermes}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CURSOR_CONFIG_DIR:-$HOME/.cursor}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CURSOR_CONFIG_DIR:-$HOME/.cursor}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CODEX_HOME:-$HOME/.codex}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CODEX_HOME:-$HOME/.codex}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${GEMINI_CONFIG_DIR:-$HOME/.gemini}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${GEMINI_CONFIG_DIR:-$HOME/.gemini}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${COPILOT_CONFIG_DIR:-$HOME/.copilot}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${COPILOT_CONFIG_DIR:-$HOME/.copilot}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${AUGMENT_CONFIG_DIR:-$HOME/.augment}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${AUGMENT_CONFIG_DIR:-$HOME/.augment}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${TRAE_CONFIG_DIR:-$HOME/.trae}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${TRAE_CONFIG_DIR:-$HOME/.trae}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${QWEN_CONFIG_DIR:-$HOME/.qwen}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${QWEN_CONFIG_DIR:-$HOME/.qwen}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CLINE_CONFIG_DIR:-$HOME/.cline}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CLINE_CONFIG_DIR:-$HOME/.cline}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${GROK_AGENTS_HOME:-$HOME/.agents}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${GROK_AGENTS_HOME:-$HOME/.agents}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; else echo "ERROR: gsd-tools.cjs not found at $GSD_TOOLS and gsd-tools is not on PATH. Run: npx -y @opengsd/gsd-core@latest --claude --local" >&2; exit 1; fi; if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -n "${GSD_TOOLS:-}" ]; then printf "export PATH='%s':\"\$PATH\"\n" "${GSD_TOOLS%/*}" >> "$CLAUDE_ENV_FILE" 2>/dev/null || true; fi
PLAN_LENS=$(gsd_run query config-get workflow.plan_lens_review 2>/dev/null || echo "false")
if [ "$PLAN_LENS" != "true" ]; then
  echo "workflow.plan_lens_review is false — skipping plan lens review."
  exit 0
fi

TEXT_MODE=$(gsd_run query config-get workflow.text_mode 2>/dev/null || echo "false")
# When TEXT_MODE is true, replace every AskUserQuestion call with a plain-text
# numbered list and ask the user to type their choice number instead. This ensures
# non-Claude runtimes (OpenAI Codex, Gemini, etc.) can handle value-tradeoff
# questions without stalling on an unexecuted TUI tool call (#2012).
```

---

## Step 2: Resolve Model Tiers and Scratch Directory

```bash
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

SCRATCH_DIR=".planning/tmp/plan-lens-${PADDED_PHASE}"
mkdir -p "${SCRATCH_DIR}/round1" "${SCRATCH_DIR}/round2"
```

---

## Step 3: Lens Selection (D-10)

Default to the four named lenses. Drop `conditional-UX-eye` ONLY when the plan is
pure-backend/docs AND no `UI-SPEC.md` exists in the phase directory.

```bash
# Check if UI-SPEC.md exists in the phase dir
HAS_UI_SPEC=false
if ls "${PHASE_DIR}"/*UI-SPEC.md 2>/dev/null | grep -q .; then HAS_UI_SPEC=true; fi

# Check if the plan references any UI components
HAS_UI_REF=false
if rg -q -i 'UI-SPEC|ui component|frontend|react|vue|svelte|layout|screen|page|form' ${PHASE_DIR}/*-PLAN.md 2>/dev/null; then HAS_UI_REF=true; fi

# Drop conditional-UX-eye only if pure-backend/docs and no UI-SPEC.md
INCLUDE_UX_LENS=true
if [ "$HAS_UI_SPEC" = "false" ] && [ "$HAS_UI_REF" = "false" ]; then
  INCLUDE_UX_LENS=false
fi
```

The review always runs at least 2 lenses and at most 4. The 4 named lenses are:
- `scope/value-eye` — scope and value alignment (never dropped)
- `feasibility-eye` — technical feasibility (never dropped)
- `maintainability-eye` — long-term code health (never dropped)
- `conditional-UX-eye` — user-experience coherence (dropped if pure-backend/docs and no UI-SPEC.md)

---

## Step 4: Round 1 — Isolated Position Staking

> ◆ Spawning 2–4 lens agents in Round 1 — each runs in a subagent (isolated; no shared context; ~2–4 min; expected, not a freeze)

Each lens receives its own LENS_IDENTITY, a set of ARTIFACTS_TO_MINE (plan files + relevant
context), an OUTPUT_CONTRACT instructing it to stake an advisory position with evidence
citations, and an OUTPUT_PATH in `${SCRATCH_DIR}/round1/`. Each lens reads ONLY its mined
artifacts and writes ONLY to its own OUTPUT_PATH — the D-03 isolation invariant.

A failed lens spawn (Agent() returns error) logs a note in `NN-PLAN-RATIONALE.md` and
continues — it does not halt plan finalization. This non-blocking rule is load-bearing.

---

### Round 1: Scope/Value lens

```text
Agent(prompt="
LENS_IDENTITY: scope/value-eye

ARTIFACTS_TO_MINE:
  - ${PHASE_DIR}/0*-PLAN.md
  - ${PHASE_DIR}/*-CONTEXT.md
  - .planning/ROADMAP.md

OUTPUT_CONTRACT:
  Stake a position as the scope/value-eye: does this plan address the right problem at
  the right scope? Mine PLAN.md files for stated goals, bet sizes, and scoping choices.
  Mine CONTEXT.md for locked decisions and deferred ideas. Mine ROADMAP.md for strategic
  alignment between the plan and the declared milestone goals.

  Ask yourself: Is the plan's scope appropriately sized? Does it address a real user/team
  need? Does it defer the right things? Is there scope creep or scope underreach?

  Phrase findings as advisory positions with evidence:
    - scope/value-eye: {observation} (evidence: {artifact citation})
    - Concern: {specific scope or value challenge}
    - Advisory: {what to check or change if this concern proves valid}

  Do NOT rewrite the plan. Stake an advisory position only.

OUTPUT_PATH: ${SCRATCH_DIR}/round1/position-scope-value.md
", subagent_type="gsd-lens", model="${researcher_model}", description="Scope/value lens - Round 1")
```

---

### Round 1: Feasibility lens

```text
Agent(prompt="
LENS_IDENTITY: feasibility-eye

ARTIFACTS_TO_MINE:
  - ${PHASE_DIR}/0*-PLAN.md
  - ${PHASE_DIR}/*-SPEC.md
  - ${PHASE_DIR}/*-PATTERNS.md

OUTPUT_CONTRACT:
  Stake a position as the feasibility-eye: can this plan actually be executed with the
  available time, tooling, and known constraints? Mine PLAN.md files for task estimates,
  dependencies, and stated assumptions. Mine SPEC.md (if present) for technical
  requirements that the plan must satisfy. Mine PATTERNS.md (if present) for existing
  architectural patterns the plan should respect.

  Ask yourself: Are the estimates realistic? Are there missing dependencies or hidden
  prerequisites? Are any tasks underspecified to the point where they could balloon?

  Phrase findings as advisory positions with evidence:
    - feasibility-eye: {observation} (evidence: {artifact citation})
    - Concern: {specific feasibility challenge}
    - Advisory: {what to validate or de-risk before committing}

  Do NOT rewrite the plan. Stake an advisory position only.

OUTPUT_PATH: ${SCRATCH_DIR}/round1/position-feasibility.md
", subagent_type="gsd-lens", model="${researcher_model}", description="Feasibility lens - Round 1")
```

---

### Round 1: Maintainability lens

```text
Agent(prompt="
LENS_IDENTITY: maintainability-eye

ARTIFACTS_TO_MINE:
  - ${PHASE_DIR}/0*-PLAN.md
  - ${PHASE_DIR}/*-RESEARCH.md

OUTPUT_CONTRACT:
  Stake a position as the maintainability-eye: will the code or workflow artifacts this
  plan produces be easy to understand, change, and extend six months from now? Mine
  PLAN.md files for the files/components the plan modifies and the approach it takes.
  Mine RESEARCH.md (if present) for architectural choices and their rationale.

  Ask yourself: Are there new abstractions that will be hard to refactor later? Does the
  plan introduce coupling that should be avoided? Are there missing tests, docs, or
  invariants that will make future maintenance harder?

  Phrase findings as advisory positions with evidence:
    - maintainability-eye: {observation} (evidence: {artifact citation})
    - Concern: {specific maintainability risk}
    - Advisory: {what to add or change to protect long-term health}

  Do NOT rewrite the plan. Stake an advisory position only.

OUTPUT_PATH: ${SCRATCH_DIR}/round1/position-maintainability.md
", subagent_type="gsd-lens", model="${researcher_model}", description="Maintainability lens - Round 1")
```

---

### Round 1: Conditional UX lens (spawned only if INCLUDE_UX_LENS is true)

If `INCLUDE_UX_LENS` is `false`, skip this spawn and log: "conditional-UX-eye skipped — no UI-SPEC.md and no UI references in plan files."

```text
Agent(prompt="
LENS_IDENTITY: conditional-UX-eye

ARTIFACTS_TO_MINE:
  - ${PHASE_DIR}/0*-PLAN.md
  - ${PHASE_DIR}/*UI-SPEC.md

OUTPUT_CONTRACT:
  Stake a position as the conditional-UX-eye: are the user-facing changes in this plan
  coherent and consistent from an end-user perspective? Mine PLAN.md for UI/UX-affecting
  tasks, screen or flow changes, and user-visible behavior. Mine UI-SPEC.md (if present)
  for specified interactions that the plan must preserve or extend.

  Ask yourself: Does the plan introduce any visual or interaction regressions? Are there
  user journeys that become inconsistent? Are any UX decisions being made implicitly
  rather than explicitly?

  Phrase findings as advisory positions with evidence:
    - conditional-UX-eye: {observation} (evidence: {artifact citation})
    - Concern: {specific UX coherence challenge}
    - Advisory: {what to validate before shipping}

  Do NOT rewrite the plan. Stake an advisory position only.

OUTPUT_PATH: ${SCRATCH_DIR}/round1/position-ux.md
", subagent_type="gsd-lens", model="${researcher_model}", description="Conditional UX lens - Round 1")
```

---

> **ORCHESTRATOR RULE — CODEX RUNTIME**: After calling all Round 1 lens Agent() calls above,
> do NOT read lens position files or synthesize content independently while the subagents are
> active. Wait for all Round 1 lenses to complete before proceeding to Round 2.

---

## Step 5: Round 2 — Rebuttal (D-07)

Re-spawn the SAME frozen `gsd-lens` agents (byte-for-byte same subagent_type), with
`ARTIFACTS_TO_MINE` EXTENDED to include `${SCRATCH_DIR}/round1/*.md` so each lens can
read the other lenses' Round 1 positions and defend or revise its stance.

Only the spawn inputs differ — the agents themselves are unchanged. This is the second
proof of CON-lens-generic: the frozen gsd-lens agent handles the rebuttal round without
modification.

> ◆ Spawning Round 2 rebuttal lenses — each runs in a subagent (reads Round 1 sibling positions; ~2–4 min)

---

### Round 2: Scope/Value lens — rebuttal

```text
Agent(prompt="
LENS_IDENTITY: scope/value-eye

ARTIFACTS_TO_MINE:
  - ${PHASE_DIR}/0*-PLAN.md
  - ${PHASE_DIR}/*-CONTEXT.md
  - .planning/ROADMAP.md
  - ${SCRATCH_DIR}/round1/*.md

OUTPUT_CONTRACT:
  Stake your Round 2 rebuttal position as the scope/value-eye. You have access to the
  Round 1 positions from the other lenses in ${SCRATCH_DIR}/round1/. Read them to see
  where they agree or disagree with your Round 1 scope/value assessment.

  Defend, revise, or sharpen your Round 1 position in light of the other lenses' evidence.
  Where another lens raises a concern that affects your scope/value assessment, address it
  directly.

  Phrase findings as advisory positions with evidence:
    - scope/value-eye: {observation} (evidence: {artifact citation})
    - Concern: {specific scope or value challenge}
    - Advisory: {what to check or change if this concern proves valid}

  If you revise your Round 1 position, note the revision and why.
  Do NOT rewrite the plan. Stake an advisory position only.

OUTPUT_PATH: ${SCRATCH_DIR}/round2/position-scope-value.md
", subagent_type="gsd-lens", model="${researcher_model}", description="Scope/value lens - Round 2 rebuttal")
```

---

### Round 2: Feasibility lens — rebuttal

```text
Agent(prompt="
LENS_IDENTITY: feasibility-eye

ARTIFACTS_TO_MINE:
  - ${PHASE_DIR}/0*-PLAN.md
  - ${PHASE_DIR}/*-SPEC.md
  - ${PHASE_DIR}/*-PATTERNS.md
  - ${SCRATCH_DIR}/round1/*.md

OUTPUT_CONTRACT:
  Stake your Round 2 rebuttal position as the feasibility-eye. You have access to the
  Round 1 positions from the other lenses in ${SCRATCH_DIR}/round1/. Read them to see
  where they agree or disagree with your feasibility assessment.

  Defend, revise, or sharpen your Round 1 position. Where another lens raises a concern
  that bears on feasibility (e.g. the scope/value lens finds a hidden dependency, the
  maintainability lens flags a coupling risk), address it directly.

  Phrase findings as advisory positions with evidence:
    - feasibility-eye: {observation} (evidence: {artifact citation})
    - Concern: {specific feasibility challenge}
    - Advisory: {what to validate or de-risk before committing}

  If you revise your Round 1 position, note the revision and why.
  Do NOT rewrite the plan. Stake an advisory position only.

OUTPUT_PATH: ${SCRATCH_DIR}/round2/position-feasibility.md
", subagent_type="gsd-lens", model="${researcher_model}", description="Feasibility lens - Round 2 rebuttal")
```

---

### Round 2: Maintainability lens — rebuttal

```text
Agent(prompt="
LENS_IDENTITY: maintainability-eye

ARTIFACTS_TO_MINE:
  - ${PHASE_DIR}/0*-PLAN.md
  - ${PHASE_DIR}/*-RESEARCH.md
  - ${SCRATCH_DIR}/round1/*.md

OUTPUT_CONTRACT:
  Stake your Round 2 rebuttal position as the maintainability-eye. You have access to the
  Round 1 positions from the other lenses in ${SCRATCH_DIR}/round1/. Read them to see
  where they agree or disagree with your maintainability assessment.

  Defend, revise, or sharpen your Round 1 position. Where another lens raises a concern
  that bears on maintainability (e.g. the feasibility lens flags an unrealistic timeline
  that may lead to cut corners, the scope lens finds hidden complexity), address it.

  Phrase findings as advisory positions with evidence:
    - maintainability-eye: {observation} (evidence: {artifact citation})
    - Concern: {specific maintainability risk}
    - Advisory: {what to add or change to protect long-term health}

  If you revise your Round 1 position, note the revision and why.
  Do NOT rewrite the plan. Stake an advisory position only.

OUTPUT_PATH: ${SCRATCH_DIR}/round2/position-maintainability.md
", subagent_type="gsd-lens", model="${researcher_model}", description="Maintainability lens - Round 2 rebuttal")
```

---

### Round 2: Conditional UX lens — rebuttal (spawned only if INCLUDE_UX_LENS is true)

```text
Agent(prompt="
LENS_IDENTITY: conditional-UX-eye

ARTIFACTS_TO_MINE:
  - ${PHASE_DIR}/0*-PLAN.md
  - ${PHASE_DIR}/*UI-SPEC.md
  - ${SCRATCH_DIR}/round1/*.md

OUTPUT_CONTRACT:
  Stake your Round 2 rebuttal position as the conditional-UX-eye. You have access to the
  Round 1 positions from the other lenses in ${SCRATCH_DIR}/round1/. Read them to see
  where they agree or disagree with your UX coherence assessment.

  Defend, revise, or sharpen your Round 1 position. Where another lens raises a concern
  that affects the user experience (e.g. the feasibility lens flags time pressure that
  may cut UX corners, the scope lens identifies an implicit UX decision), address it.

  Phrase findings as advisory positions with evidence:
    - conditional-UX-eye: {observation} (evidence: {artifact citation})
    - Concern: {specific UX coherence challenge}
    - Advisory: {what to validate before shipping}

  If you revise your Round 1 position, note the revision and why.
  Do NOT rewrite the plan. Stake an advisory position only.

OUTPUT_PATH: ${SCRATCH_DIR}/round2/position-ux.md
", subagent_type="gsd-lens", model="${researcher_model}", description="Conditional UX lens - Round 2 rebuttal")
```

---

> **ORCHESTRATOR RULE — CODEX RUNTIME**: Wait for all Round 2 lenses to complete before
> spawning the synthesizer. Do NOT read Round 2 position files or synthesize content
> independently while the subagents are active.

---

## Step 6: Spawn gsd-lens-synthesizer on Round 2 Positions

After all Round 2 lens agents complete, spawn the synthesizer against the Round 2 positions:

```text
Agent(prompt="
<task>
Collect the Round 2 rebuttal lens positions from the scratch directory and synthesize them
into a disagreement-preserving Tensions output.
</task>

<files_to_read>
- ${SCRATCH_DIR}/round2/   (read all *.md files in this directory — each is a Round 2 lens position)
</files_to_read>

<output_contract>
Emit the standard tensions output shape:
  - Use a '## Tensions' header
  - Use '### T{n} — {question}' per-tension blocks

For each axis of disagreement, emit one '### T{n}' block with:
  - Per-lens position bullets in the format:
      - {lens}'s-eye: {observation} (evidence: {citation})
  - A 'Disagreement:' line naming the nature of the conflict
  - A 'Candidate change:' line with the forward-looking action

NEVER collapse conflicting positions into a blended statement. Preserve each lens's
position verbatim with its evidence citation.

If all lenses genuinely converge on all axes, write an explicit consensus note INTO
THE OUTPUT — emit a '## Consensus' section stating:
  'No disagreement surfaced — converged on: {summary}'
rather than leaving the Tensions section empty. The section still exists; convergence
is a flagged signal.
</output_contract>

OUTPUT_PATH: ${SCRATCH_DIR}/tensions.md

DO NOT commit. The caller (plan-lens-review) owns the single artifact write + commit.
", subagent_type="gsd-lens-synthesizer", model="${synthesizer_model}", description="Synthesize plan lens tensions")
```

---

## Step 7: Classify Tensions — Fact-Conflict vs Value-Tradeoff (D-08/D-09)

After the synthesizer completes, read `${SCRATCH_DIR}/tensions.md`. For each `### T{n}` block:

```text
Read the Disagreement: line for each ### T{n} block.

Classification (orchestrator-side — the synthesizer is NOT modified):
  - FACT-CONFLICT: the Disagreement: line cites a concrete artifact, line number, or
    spec-section that can be looked up to settle the disagreement.
    → Read the cited artifact inline.
    → Record the resolution in NN-PLAN-RATIONALE.md:
      "T{n}: {lens A} claimed {X}, but {cited artifact §section} confirms {Z}. Resolved: {resolution}."
    → Non-blocking: continue to next tension even if the probe cannot resolve it cleanly.

  - VALUE-TRADEOFF: the Disagreement: line describes a judgment call, priority conflict,
    or preference difference with no concrete artifact that settles it.
    → AskUserQuestion: "{summary of the tradeoff, both positions with their evidence citations}"
      (This is the ONLY permitted human-blocking interaction in this workflow.)
    → Record the human answer in NN-PLAN-RATIONALE.md:
      "T{n}: value-tradeoff between {lens A position} and {lens B position}. Human decision: {answer}."

Non-blocking failure rule: if a lens spawn returned an error (Agent() failed), log a note in
NN-PLAN-RATIONALE.md: "Lens {identity} failed to produce a position — spawn error logged; review
proceeded with {N-1} lenses." A failed lens spawn does not halt plan finalization.
```

---

## Step 8: Write Artifacts (D-11)

Write two artifacts as siblings of the `NN-PLAN.md` files in `${PHASE_DIR}`:

### `${PHASE_DIR}/${PADDED_PHASE}-PLAN-RATIONALE.md`

```markdown
# Phase {N} Plan Rationale

## Why This Plan Survived Review

{Brief summary: the plan's core bet, scope choices, and approach, confirmed by the lens review.}

## Tension Resolution Trail

{For each T{n} resolved:}

### T{n} — {question from tensions.md}

- **Classification:** fact-conflict | value-tradeoff
- **Resolution:** {what the cited artifact confirmed, or the human decision}
- **Evidence:** {artifact citation for fact-conflicts; human answer for value-tradeoffs}

## Failed Lens Spawns

{If any lens spawn failed, list here. If none: "None — all lenses completed successfully."}

## Advisory Status

This rationale is advisory. The review did NOT rewrite NN-PLAN.md files — it only documents
why the plan was judged ready to commit and what tradeoffs were acknowledged.
```

### `${PHASE_DIR}/${PADDED_PHASE}-KILL-CRITERIA.md`

```markdown
# Phase {N} Kill Criteria

The following conditions should trigger a pause, revision, or abandonment of this plan's
approach mid-execution. These are informed by the tensions surfaced in the lens review.

## Kill Condition: Scope Drift

{Derived from scope/value-eye tensions — what would indicate the plan has drifted from its
stated goal or that the problem framing was wrong.}

## Kill Condition: Feasibility Blocker

{Derived from feasibility-eye tensions — what discovery during execution would make the
plan's estimates or assumptions no longer valid.}

## Kill Condition: Maintainability Collapse

{Derived from maintainability-eye tensions — what signs during implementation would indicate
the plan is accumulating technical debt beyond the acceptable threshold.}

## Kill Condition: UX Regression (if UX lens was active)

{Derived from conditional-UX-eye tensions — what user-visible degradation would require
stopping and revisiting the approach.}

## Review Trigger

When any kill condition is met mid-execution, bring the executing agent to a checkpoint and
surface this file. The human reviews the applicable kill condition and decides: continue,
revise-and-continue, or abandon.

## Advisory Status

Kill criteria are advisory signals, not automated gates. They are designed to be checked by
the human reviewer during plan execution, not by an automated test.
```

---

## Step 9: Success-Gated Cleanup

```bash
rm -rf "${SCRATCH_DIR}"
```

Run ONLY after BOTH `${PHASE_DIR}/${PADDED_PHASE}-PLAN-RATIONALE.md` AND
`${PHASE_DIR}/${PADDED_PHASE}-KILL-CRITERIA.md` have been successfully written.

If either write fails, leave `${SCRATCH_DIR}` in place for debugging (D-02 success-gated
cleanup — partial positions are inspectable). Do NOT clean on failure.

---

## Advisory Invariant (D-13)

**This workflow is advisory.** It does NOT rewrite NN-PLAN.md files. It does NOT block plan
commit if the human decides all tensions are acceptable. Its only outputs are:
- `NN-PLAN-RATIONALE.md` — the why-this-plan-survived-review trail
- `NN-KILL-CRITERIA.md` — the conditions under which to revisit mid-execution

The frozen agents `agents/gsd-lens.md` and `agents/gsd-lens-synthesizer.md` are consumed
AS-IS with zero modifications. All customization is in the per-spawn prompt inputs above.
This validates CON-lens-generic: the same frozen engine serves both the milestone retro
consumer (`retro.md`) and this plan-quality review consumer without any agent modification.
