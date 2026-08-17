<!-- gsd:loop-host
step: discuss
points: discuss:pre, discuss:post
agent-roles: orchestrator
produces: CONTEXT.md
consumes:
-->
<purpose>
Extract implementation decisions that downstream agents need. Analyze the phase to identify gray areas, let the user choose what to discuss, then deep-dive each selected area until satisfied.

You are a thinking partner, not an interviewer. The user is the visionary — you are the builder. Your job is to capture decisions that will guide research and planning, not to figure out implementation yourself.
</purpose>

<required_reading>
@~/.claude/gsd-core/references/domain-probes.md
@~/.claude/gsd-core/references/gate-prompts.md
@~/.claude/gsd-core/references/universal-anti-patterns.md
</required_reading>

<progressive_disclosure>
**Per-mode bodies, templates, and the advisor flow are lazy-loaded** to keep
this file under the discuss-phase byte budget (32000 bytes, #717; mirrors the agent size-budget convention). Read only the files needed for the current invocation:

| When | Read |
|---|---|
| `--power` in $ARGUMENTS | `workflows/discuss-phase/modes/power.md` (then exit standard flow) |
| `--all` in $ARGUMENTS | `workflows/discuss-phase/modes/all.md` overlay |
| `--auto` in $ARGUMENTS | `workflows/discuss-phase/modes/auto.md` + `workflows/discuss-phase/modes/chain.md` (auto-advance) |
| `--chain` in $ARGUMENTS | `workflows/discuss-phase/modes/default.md` + `workflows/discuss-phase/modes/chain.md` |
| `--text` in $ARGUMENTS or `workflow.text_mode: true` | `workflows/discuss-phase/modes/text.md` overlay |
| `--batch` in $ARGUMENTS | `workflows/discuss-phase/modes/batch.md` overlay |
| `--analyze` in $ARGUMENTS | `workflows/discuss-phase/modes/analyze.md` overlay |
| ADVISOR_MODE = true (USER-PROFILE.md exists) | `workflows/discuss-phase/modes/advisor.md` |
| no flags above | `workflows/discuss-phase/modes/default.md` |
| in `write_context` step | `workflows/discuss-phase/templates/context.md` |
| in `git_commit` step | `workflows/discuss-phase/templates/discussion-log.md` |
| writing checkpoints | `workflows/discuss-phase/templates/checkpoint.json` |

Do not Read mode files unless the corresponding flag/condition is set.
</progressive_disclosure>

<downstream_awareness>
**CONTEXT.md feeds into:**

1. **gsd-phase-researcher** — Reads CONTEXT.md to know WHAT to research
2. **gsd-planner** — Reads CONTEXT.md to know WHAT decisions are locked

**Your job:** Capture decisions clearly enough that downstream agents can act on them without asking the user again.
**Not your job:** Figure out HOW to implement. That's what research and planning do with the decisions you capture.
</downstream_awareness>

<philosophy>
**User = founder/visionary. Claude = builder.**

The user knows: how they imagine it working, what it should look/feel like, what's essential vs nice-to-have, specific behaviors or references they have in mind.

The user doesn't know (and shouldn't be asked): codebase patterns (researcher reads the code), technical risks (researcher identifies these), implementation approach (planner figures this out), success metrics (inferred from the work).

Ask about vision and implementation choices. Capture decisions for downstream agents.
</philosophy>

<scope_guardrail>
**CRITICAL: No scope creep.** The phase boundary comes from ROADMAP.md and is FIXED. Discussion clarifies HOW to implement what's scoped, never WHETHER to add new capabilities.

**Allowed (clarifying ambiguity):** "How should posts be displayed?" (layout), "What happens on empty state?" (within the feature).

**Not allowed (scope creep):** "Should we also add comments?" / "What about search/filtering?" / "Maybe include bookmarking?" — those are new capabilities and belong in their own phase.

**Heuristic:** Does this clarify how we implement what's already in the phase, or does it add a new capability that could be its own phase?

**When user suggests scope creep:**
```
"[Feature X] would be a new capability — that's its own phase.
Want me to note it for the roadmap backlog?

For now, let's focus on [phase domain]."
```

Capture the idea in a "Deferred Ideas" section. Don't lose it, don't act on it.
</scope_guardrail>

<gray_area_identification>
Gray areas are **implementation decisions the user cares about** — things that could go multiple ways and would change the result.

1. Read the phase goal from ROADMAP.md
2. Understand the domain — something users SEE / CALL / RUN / READ / something being ORGANIZED — and let that drive what kinds of decisions matter
3. Generate phase-specific gray areas (not generic categories)

**Don't use generic category labels** (UI, UX, Behavior). Generate specific gray areas. Examples:

```
Phase: "User authentication"     → Session handling, Error responses, Multi-device policy, Recovery flow
Phase: "Organize photo library"  → Grouping criteria, Duplicate handling, Naming convention, Folder structure
Phase: "CLI for database backups"→ Output format, Flag design, Progress reporting, Error recovery
Phase: "API documentation"       → Structure/navigation, Code examples depth, Versioning approach, Interactive elements
```

**Claude handles these (don't ask):** technical implementation details, architecture patterns, performance optimization, scope (roadmap defines this).
</gray_area_identification>

<answer_validation>
**IMPORTANT: Answer validation** — After every AskUserQuestion call, if the response is empty/whitespace-only:

- **"Other" with empty text** (the user wants to type freeform): output `"What would you like to discuss?"`, STOP generating, wait for the user's next message, then reflect it back and continue. Do NOT retry AskUserQuestion or call any tools.
- **Any other empty response:** retry once with the same parameters; if still empty, present options as a plain-text numbered list. Never proceed with empty input.

**Text mode** (`--text` or `workflow.text_mode: true`): follow `workflows/discuss-phase/modes/text.md` — do not use AskUserQuestion at all.
</answer_validation>

<process>

**Express path available:** If you already have a PRD or acceptance criteria document, use `/gsd:plan-phase {phase} --prd path/to/prd.md` to skip this discussion and go straight to planning.

<step name="initialize" priority="first">
Phase number from argument (required).

```bash
_GSD_SHIM_NAME="gsd-tools.cjs"; _GSD_RUNTIME_ROOT="${RUNTIME_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"; GSD_TOOLS="${_GSD_RUNTIME_ROOT}/gsd-core/bin/${_GSD_SHIM_NAME}"; if [ -f "$GSD_TOOLS" ]; then gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif command -v gsd-tools >/dev/null 2>&1; then GSD_TOOLS="$(command -v gsd-tools)"; gsd_run() { "$GSD_TOOLS" "$@"; }; elif [ -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${HERMES_HOME:-$HOME/.hermes}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${HERMES_HOME:-$HOME/.hermes}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CURSOR_CONFIG_DIR:-$HOME/.cursor}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CURSOR_CONFIG_DIR:-$HOME/.cursor}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CODEX_HOME:-$HOME/.codex}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CODEX_HOME:-$HOME/.codex}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${GEMINI_CONFIG_DIR:-$HOME/.gemini}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${GEMINI_CONFIG_DIR:-$HOME/.gemini}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${COPILOT_CONFIG_DIR:-$HOME/.copilot}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${COPILOT_CONFIG_DIR:-$HOME/.copilot}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${AUGMENT_CONFIG_DIR:-$HOME/.augment}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${AUGMENT_CONFIG_DIR:-$HOME/.augment}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${TRAE_CONFIG_DIR:-$HOME/.trae}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${TRAE_CONFIG_DIR:-$HOME/.trae}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${QWEN_CONFIG_DIR:-$HOME/.qwen}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${QWEN_CONFIG_DIR:-$HOME/.qwen}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CLINE_CONFIG_DIR:-$HOME/.cline}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CLINE_CONFIG_DIR:-$HOME/.cline}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${GROK_AGENTS_HOME:-$HOME/.agents}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${GROK_AGENTS_HOME:-$HOME/.agents}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; else echo "ERROR: gsd-tools.cjs not found at $GSD_TOOLS and gsd-tools is not on PATH. Run: npx -y @opengsd/gsd-core@latest --claude --local" >&2; exit 1; fi; if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -n "${GSD_TOOLS:-}" ]; then printf "export PATH='%s':\"\$PATH\"\n" "${GSD_TOOLS%/*}" >> "$CLAUDE_ENV_FILE" 2>/dev/null || true; fi
INIT=$(gsd_run query init.phase-op "${PHASE}"); [[ "$INIT" == @file:* ]] && INIT=$(cat "${INIT#@file:}")
AGENT_SKILLS_ADVISOR=$(gsd_run query agent-skills gsd-advisor-researcher)
```

Parse JSON for: `commit_docs`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `padded_phase`, `has_research`, `has_context`, `has_plans`, `has_verification`, `plan_count`, `roadmap_exists`, `planning_exists`, `response_language`.

**If `response_language` is set:** All user-facing questions, prompts, and explanations in this workflow MUST be presented in `{response_language}`. Technical terms, code, file paths, and subagent prompts stay in English — only user-facing output is translated.

**If `phase_found` is false:**
```
Phase [X] not found in roadmap.
Use /gsd:progress ${GSD_WS} to see available phases.
```
Exit workflow.

**Mode dispatch — Read mode files lazily based on flags in $ARGUMENTS:**

```bash
# Detect advisor mode (file-existence guard — no Read until needed)
if [ -f "$HOME/.claude/gsd-core/USER-PROFILE.md" ]; then
  ADVISOR_MODE=true
else
  ADVISOR_MODE=false
fi
```

- If `--power` in $ARGUMENTS: `Read(workflows/discuss-phase/modes/power.md)` and execute it end-to-end. Do NOT continue with the steps below.
- Otherwise, continue. Per-flag overlay reads happen at their relevant steps:
  - `--all` → Read `workflows/discuss-phase/modes/all.md` before `present_gray_areas`.
  - `--auto` → Read `workflows/discuss-phase/modes/auto.md` before `check_existing` (it overrides several steps).
  - `--chain` → Read `workflows/discuss-phase/modes/chain.md` before `auto_advance`.
  - `--text` (or `workflow.text_mode: true`) → Read `workflows/discuss-phase/modes/text.md` before any AskUserQuestion call.
  - `--batch` → Read `workflows/discuss-phase/modes/batch.md` before `discuss_areas`.
  - `--analyze` → Read `workflows/discuss-phase/modes/analyze.md` before `discuss_areas`.
  - `ADVISOR_MODE = true` → Read `workflows/discuss-phase/modes/advisor.md` before `analyze_phase` (it changes the discussion flow and adds an `advisor_research` substep).
  - No flags → Read `workflows/discuss-phase/modes/default.md` before `discuss_areas`.

**If `phase_found` is true:** Continue to `check_blocking_antipatterns`.
</step>

<step name="check_blocking_antipatterns" priority="first">
**MANDATORY — Check for blocking anti-patterns before any other work.**

Look for a `.continue-here.md` in the current phase directory:

```bash
ls ${phase_dir}/.continue-here.md 2>/dev/null || true
```

If `.continue-here.md` exists, parse its "Critical Anti-Patterns" table for rows with `severity` = `blocking`.

**If one or more `blocking` anti-patterns are found:** the agent must demonstrate understanding of each by answering all three questions for each one:
1. **What is this anti-pattern?** — Describe it in your own words.
2. **How did it manifest?** — Explain the specific failure that caused it to be recorded.
3. **What structural mechanism (not acknowledgment) prevents it?** — Name the concrete step or enforcement mechanism that stops recurrence.

Write these answers inline before continuing. If a blocking anti-pattern cannot be answered from the context in `.continue-here.md`, stop and ask the user for clarification.

**If no `.continue-here.md` exists, or no `blocking` rows are found:** Proceed directly to `check_spec`.
</step>

<step name="check_spec">
Check if a SPEC.md (from `/gsd:spec-phase`) exists for this phase. SPEC.md locks requirements before implementation decisions.

```bash
ls ${phase_dir}/*-SPEC.md 2>/dev/null | grep -v AI-SPEC | head -1 || true
```

**If SPEC.md is found:**
1. Read the SPEC.md file.
2. Count requirements (numbered items in `## Requirements`).
3. Display: `Found SPEC.md — {N} requirements locked. Focusing on implementation decisions.`
4. Set `spec_loaded = true`.
5. Store requirements, boundaries, and acceptance criteria as `<locked_requirements>` — these flow directly into CONTEXT.md without re-asking.

**If no SPEC.md is found:** Continue with `spec_loaded = false`.

**Note:** SPEC.md files named `AI-SPEC.md` (from `/gsd:ai-integration-phase`) are excluded — different purpose.
</step>

<step name="check_existing">
Check if CONTEXT.md already exists using `has_context` from init.

```bash
ls ${phase_dir}/*-CONTEXT.md 2>/dev/null || true
```

**If exists:**

**If `--auto`:** Auto-select "Update it" — load existing context and continue to `analyze_phase`. Log: `[auto] Context exists — updating with auto-selected decisions.`

**Otherwise:** AskUserQuestion (header: "Context"; question: "Phase [X] already has context. What do you want to do?"; options: "Update it" / "View it" / "Skip"). Branch accordingly.

**If doesn't exist:**

Check for an interrupted discussion checkpoint:
```bash
ls ${phase_dir}/*-DISCUSS-CHECKPOINT.json 2>/dev/null || true
```

If a checkpoint file exists:

**If `--auto`:** Auto-select "Resume" — load checkpoint and continue from last completed area.

**Otherwise:** AskUserQuestion (header: "Resume"; question: "Found interrupted discussion checkpoint ({N} areas completed out of {M}). Resume from where you left off?"; options: "Resume" / "Start fresh"). On "Resume", parse the checkpoint JSON, load `decisions` into the internal accumulator, set `areas_completed` to skip those areas, continue to `present_gray_areas` with only the remaining areas. On "Start fresh", delete the checkpoint and continue.

Check `has_plans` and `plan_count` from init. **If `has_plans` is true:**

**If `--auto`:** Auto-select "Continue and replan after". Log: `[auto] Plans exist — continuing with context capture, will replan after.`

**Otherwise:** AskUserQuestion (header: "Plans exist"; question: "Phase [X] already has {plan_count} plan(s) created without user context. Your decisions here won't affect existing plans unless you replan."; options: "Continue and replan after" / "View existing plans" / "Cancel"). Branch accordingly.

**If `has_plans` is false:** Continue to `load_prior_context`.
</step>

<step name="load_prior_context">
Read project-level and prior phase context to avoid re-asking decided questions.

```bash
cat .planning/PROJECT.md 2>/dev/null || true
cat .planning/REQUIREMENTS.md 2>/dev/null || true
cat .planning/STATE.md 2>/dev/null || true
```

Read at most **3** prior CONTEXT.md files (most recent 3 phases before current). If `.planning/DECISIONS-INDEX.md` exists, read that instead — it is a bounded rolling summary that supersedes per-phase reads.

```bash
(find .planning/phases -name "*-CONTEXT.md" 2>/dev/null || true) | sort -r
```

For each CONTEXT.md read: extract `<decisions>` (locked preferences), `<specifics>` (particular references), and patterns (e.g., "user prefers minimal UI", "user rejected single-key shortcuts").

**Spike/sketch findings:** Check for project-local skills:
```bash
SPIKE_FINDINGS=$(ls ./.claude/skills/spike-findings-*/SKILL.md 2>/dev/null | head -1 || true)
SKETCH_FINDINGS=$(ls ./.claude/skills/sketch-findings-*/SKILL.md 2>/dev/null | head -1 || true)
RAW_SPIKES=$(ls .planning/spikes/MANIFEST.md 2>/dev/null)
RAW_SKETCHES=$(ls .planning/sketches/MANIFEST.md 2>/dev/null)
```

If findings skills exist, read SKILL.md and reference files; extract validated patterns, landmines, constraints, design decisions. Add them to `<prior_decisions>`.

If raw spikes/sketches exist but no findings skill, note: `⚠ Unpackaged spikes/sketches detected — run /gsd:spike --wrap-up or /gsd:sketch --wrap-up to make findings available.`

Build internal `<prior_decisions>` with sections for Project-Level (from PROJECT.md / REQUIREMENTS.md), From Prior Phases (per-phase decisions), and From Spike/Sketch Findings (validated patterns, landmines, design decisions).

**Usage downstream:** `analyze_phase` skips already-decided gray areas; `present_gray_areas` annotates options ("You chose X in Phase 5"); `discuss_areas` pre-fills or flags conflicts.

**If no prior context exists:** Continue without — expected for early phases.
</step>

<step name="cross_reference_todos">
Check pending todos for matches with this phase's scope.

```bash
TODO_MATCHES=$(gsd_run query todo.match-phase "${PHASE_NUMBER}")
```

Parse JSON for: `todo_count`, `matches[]` (each with `file`, `title`, `area`, `score`, `reasons`).

**If `todo_count` is 0 or `matches` is empty:** Skip silently.

**If matches found:** Present each match (title, area, why it matched). AskUserQuestion (multiSelect) asking which to fold. Folded → `<folded_todos>` for CONTEXT.md `<decisions>`. Reviewed but not folded → `<reviewed_todos>` for CONTEXT.md `<deferred>`.

**Auto mode (`--auto`):** Fold all todos with score >= 0.4 automatically. Log the selection.
</step>

<step name="scout_codebase">
Lightweight scan of existing code to inform gray area identification (~10% context).

Read `@~/.claude/gsd-core/references/scout-codebase.md` — it contains the phase-type→map selection table, single-read rule, no-maps fallback, and `<codebase_context>` output schema. Then execute:
1. `ls .planning/codebase/*.md` to find existing maps
2. Select 2–3 maps via the reference's table; or grep fallback if none exist
3. Build internal `<codebase_context>` per the reference's output schema
</step>

<step name="dispatch_discuss_pre_hooks">
```bash
DISCUSS_PRE_HOOKS_JSON=$(gsd_run loop render-hooks discuss:pre --raw)
```
Apply each entry in `activeHooks` per @~/.claude/gsd-core/references/loop-hook-dispatch.md. Empty list → continue to `analyze_phase`.
</step>

<step name="analyze_phase">
Analyze the phase to identify gray areas. Use both `prior_decisions` and `codebase_context` to ground the analysis.

1. **Domain boundary** — What capability is this phase delivering? State it clearly.

1b. **Initialize canonical refs accumulator** — Start building `<canonical_refs>` for CONTEXT.md. Sources:
   - **Now:** Copy `Canonical refs:` from ROADMAP.md for this phase. Expand each to a full relative path. Check REQUIREMENTS.md and PROJECT.md for specs/ADRs referenced.
   - **`scout_codebase`:** If existing code references docs (e.g., comments citing ADRs), add those.
   - **`discuss_areas`:** When the user says "read X", "check Y", or references any doc/spec/ADR — add it immediately. These are often the MOST important refs.

   This list is MANDATORY in CONTEXT.md. Every ref must have a full relative path. If no external docs exist, note that explicitly.

2. **Check prior decisions** — Scan `<prior_decisions>` for already-decided gray areas; mark them pre-answered.

2b. **SPEC.md awareness** — If `spec_loaded = true`: `<locked_requirements>` are pre-answered (Goal, Boundaries, Constraints, Acceptance Criteria). Do NOT generate gray areas about WHAT to build or WHY. Only generate gray areas about HOW to implement. When presenting, include: "Requirements are locked by SPEC.md — discussing implementation decisions only."

3. **Gray areas** — For each relevant category, identify 1-2 specific ambiguities that would change implementation. Annotate with code context where relevant.

3b. **Dependent-repo pre-flight** — If the phase will consume contracts from a backend wire, an external API, or a sibling repo (frontend↔backend handoffs, shared schemas, cross-repo workflows): identify the specific surfaces (endpoints, fields, error codes, file paths) this phase touches. For each dependent repo, run `gh search prs --repo=<repo> --merged --search='<surface>' --limit=20` filtered to the last 30 days. **Read the diffs that intersect the surface, not the PR descriptions.** PR descriptions describe intent; diffs describe state. If any recent merge invalidates the planning assumption, surface it as a `LOCKED` blocker in CONTEXT.md — not as a gray area to discuss. Plans must reflect the post-merge contract before execution starts.

4. **Skip assessment** — If no meaningful gray areas exist (pure infrastructure, clear-cut implementation, all already decided), the phase may not need discussion.

**Advisor mode hand-off:** If `ADVISOR_MODE` is true, follow `workflows/discuss-phase/modes/advisor.md` for the rest of analyze/discuss flow (it adds an `advisor_research` substep and replaces the standard `discuss_areas` with table-first selection). The detection block (USER-PROFILE.md existence + non-technical-owner signals + calibration tier resolution) lives in that file — read it once when ADVISOR_MODE is true and follow its rules.
</step>

<step name="present_gray_areas">
Present the domain boundary, prior decisions, and gray areas to the user.

```
Phase [X]: [Name]
Domain: [What this phase delivers — from your analysis]

We'll clarify HOW to implement this. (New capabilities belong in other phases.)

[If prior decisions apply:]
**Carrying forward from earlier phases:**
- [Decision from Phase N that applies here]
```

**If `--auto` or `--all`** (per `modes/auto.md` or `modes/all.md`): Auto-select ALL gray areas. Log: `[--auto/--all] Selected all gray areas: [list area names].` Skip the AskUserQuestion below and continue directly to `discuss_areas` with all areas selected.

**Otherwise, use AskUserQuestion (multiSelect: true):**
- header: "Discuss"
- question: "Which areas do you want to discuss for [phase name]?"
- options: 3-4 phase-specific gray areas, each with a concrete label (not generic), 1-2 questions in description, and code-context / prior-decision annotations:
  ```
  ☐ Layout style — Cards vs list vs timeline?
    (You already have a Card component with shadow/rounded variants. Reusing it keeps the app consistent.)

  ☐ Loading behavior — Infinite scroll or pagination?
    (You chose infinite scroll in Phase 4. useInfiniteQuery hook already set up.)
  ```

**Do NOT include a "skip" or "you decide" option.** User ran this command to discuss — give real choices.

Continue to `discuss_areas` with selected areas (or to `advisor_research` per `modes/advisor.md` if `ADVISOR_MODE` is true).
</step>

<step name="discuss_areas">
Discussion behavior is defined by the active mode file(s):

- **Advisor mode (ADVISOR_MODE = true):** follow `workflows/discuss-phase/modes/advisor.md` — research-backed comparison tables, table-first selection.
- **--auto:** follow `workflows/discuss-phase/modes/auto.md` — Claude picks recommended option for every question; no AskUserQuestion. Single-pass cap enforced.
- **Default (no flags):** follow `workflows/discuss-phase/modes/default.md` — 4 single-question turns per area, then check whether to continue.

Overlays (combine with the active mode):
- `--text` → `workflows/discuss-phase/modes/text.md` (replace AskUserQuestion with plain-text numbered lists)
- `--batch` → `workflows/discuss-phase/modes/batch.md` (group 2–5 questions per turn)
- `--analyze` → `workflows/discuss-phase/modes/analyze.md` (trade-off table before each question)

**Overlay stacking:** overlays combine and apply outer→inner in fixed order `--analyze` → `--batch` → `--text` (e.g., `--batch --analyze` = trade-off table per question group; add `--text` for plain-text rendering). Mode-specific precedence (e.g., `--auto --power`) is documented in each overlay file's "Combination rules" section.

All modes preserve the universal rules below.

**Universal rules (apply to every mode):**

3. **Record the user's selection:**
   - If user picks from table options → record as locked decision for that area
   - If user picks "Other" → receive their input, reflect it back for confirmation, record

   **Thinking partner (conditional):**
   If `features.thinking_partner` is enabled in config, check the user's answer for tradeoff signals
   (see `references/thinking-partner.md` for signal list). If tradeoff detected:

   ```
   I notice competing priorities here — {option_A} optimizes for {goal_A} while {option_B} optimizes for {goal_B}.

   Want me to think through the tradeoffs before we lock this in?
   [Yes, analyze] / [No, decision made]
   ```

   If yes: provide 3-5 bullet analysis (what each optimizes/sacrifices, alignment with PROJECT.md goals, recommendation). Then return to normal flow.
   If no or thinking_partner disabled: continue to next area.

4. **After recording pick, Claude decides whether follow-up questions are needed:**
   - If the pick has ambiguity that would affect downstream planning → ask 1-2 targeted follow-up questions using AskUserQuestion
   - If the pick is clear and self-contained → move to next area
   - Do NOT ask the standard 4 questions — the table already provided the context

5. **After all areas processed:**
   - header: "Done"
   - question: "That covers [list areas]. Ready to create context?"
   - options: "Create context" / "Revisit an area"

**Scope creep handling (advisor mode):**
If user mentions something outside the phase domain:
```
"[Feature] sounds like a new capability — that belongs in its own phase.
I'll note it as a deferred idea.

Back to [current area]: [return to current question]"
```

Track deferred ideas internally.

---

**If ADVISOR_MODE is false:**

For each selected area, conduct a focused discussion loop.

**Research-before-questions mode:** Check if `workflow.research_before_questions` is enabled in config (from init context or `.planning/config.json`). When enabled, before presenting questions for each area:
1. Do a brief web search for best practices related to the area topic
2. Summarize the top findings in 2-3 bullet points
3. Present the research alongside the question so the user can make a more informed decision

Example with research enabled:
```
Let's talk about [Authentication Strategy].

📊 Best practices research:
• OAuth 2.0 + PKCE is the current standard for SPAs (replaces implicit flow)
• Session tokens with httpOnly cookies preferred over localStorage for XSS protection
• Consider passkey/WebAuthn support — adoption is accelerating in 2025-2026

With that context: How should users authenticate?
```

When disabled (default), skip the research and present questions directly as before.

**Text mode support:** Parse optional `--text` from `$ARGUMENTS`.
- Accept `--text` flag OR read `workflow.text_mode` from config (from init context)
- When active, replace ALL `AskUserQuestion` calls with plain-text numbered lists
- User types a number to select, or types free text for "Other"
- This is required for Claude Code remote sessions (`/rc` mode) where TUI menus
  don't work through the Claude App

**Batch mode support:** Parse optional `--batch` from `$ARGUMENTS`.
- Accept `--batch`, `--batch=N`, or `--batch N`

**Analyze mode support:** Parse optional `--analyze` from `$ARGUMENTS`.
When `--analyze` is active, before presenting each question (or question group in batch mode), provide a brief **trade-off analysis** for the decision:
- 2-3 options with pros/cons based on codebase context and common patterns
- A recommended approach with reasoning
- Known pitfalls or constraints from prior phases

Example with `--analyze`:
```
**Trade-off analysis: Authentication strategy**

| Approach | Pros | Cons |
|----------|------|------|
| Session cookies | Simple, httpOnly prevents XSS | Requires CSRF protection, sticky sessions |
| JWT (stateless) | Scalable, no server state | Token size, revocation complexity |
| OAuth 2.0 + PKCE | Industry standard for SPAs | More setup, redirect flow UX |

💡 Recommended: OAuth 2.0 + PKCE — your app has social login in requirements (REQ-04) and this aligns with the existing NextAuth setup in `src/lib/auth.ts`.

How should users authenticate?
```

This gives the user context to make informed decisions without extra prompting. When `--analyze` is absent, present questions directly as before.
- Accept `--batch`, `--batch=N`, or `--batch N`
- Accept `--batch`, `--batch=N`, or `--batch N`
- If `--batch` is absent, keep the existing one-question-at-a-time flow

**Philosophy:** stay adaptive, but let the user choose the depth via `workflow.questions_per_area` config.
- When set to `"all"` (default): be thorough — ask ALL questions useful for scoping and planning each area before moving on automatically
- When set to a number (e.g., 4, 5, 8): ask that many questions, then prompt "More questions / Next area"
- `--batch` mode: group questions into logical batches, keep asking until the area is done (per the config)

Each answer (or answer set, in batch mode) should reveal the next question or next batch.

**Auto mode (`--auto`):** For each area, Claude selects the recommended option (first option, or the one explicitly marked "recommended") for every question without using AskUserQuestion. Log each auto-selected choice:
```
[auto] [Area] — Q: "[question text]" → Selected: "[chosen option]" (recommended default)
```
After all areas are auto-resolved, skip the "Explore more gray areas" prompt and proceed directly to write_context.

**CRITICAL — Auto-mode pass cap:**
In `--auto` mode, the discuss step MUST complete in a **single pass**. After writing CONTEXT.md once, you are DONE — proceed immediately to write_context and then auto_advance. Do NOT re-read your own CONTEXT.md to find "gaps", "undefined types", or "missing decisions" and run additional passes. This creates a self-feeding loop where each pass generates references that the next pass treats as gaps, consuming unbounded time and resources.

Check the pass cap from config:
```bash
MAX_PASSES=$(gsd_run query config-get workflow.max_discuss_passes 2>/dev/null || echo "3")
```

If you have already written and committed CONTEXT.md, the discuss step is complete. Move on.

**Interactive mode (no `--auto`):**

Read the questions-per-area config:
```bash
QUESTIONS_PER_AREA=$(gsd_run config-get workflow.questions_per_area 2>/dev/null || echo "all")
```

**For each area:**

1. **Announce the area:**
   ```
   Let's talk about [Area].
   ```

2. **Ask questions using the selected pacing:**

   **Default (no `--batch`): Ask questions using AskUserQuestion, one at a time**
   - header: "[Area]" (max 12 chars — abbreviate if needed)
   - question: Specific decision for this area
   - options: 2-3 concrete choices (AskUserQuestion adds "Other" automatically), with the recommended choice highlighted and brief explanation why
   - **Annotate options with code context** when relevant:
     ```
     "How should posts be displayed?"
     - Cards (reuses existing Card component — consistent with Messages)
     - List (simpler, would be a new pattern)
     - Timeline (needs new Timeline component — none exists yet)
     ```
   - Include "You decide" as an option when reasonable — captures Claude discretion
   - **Context7 for library choices:** When a gray area involves library selection (e.g., "magic links" → query next-auth docs) or API approach decisions, use `mcp__context7__*` tools to fetch current documentation and inform the options. Don't use Context7 for every question — only when library-specific knowledge improves the options.

   **Batch mode (`--batch`): Ask numbered questions in one plain-text turn**
   - Group closely related questions for the current area into a single message
   - Keep each question concrete and answerable in one reply
   - When options are helpful, include short inline choices per question rather than a separate AskUserQuestion for every item
   - After the user replies, reflect back the captured decisions, note any unanswered items, and ask only the minimum follow-up needed before moving on
   - Preserve adaptiveness between batches: use the full set of answers to decide the next batch or whether the area is sufficiently clear

3. **Area completion — behavior depends on `QUESTIONS_PER_AREA`:**

   **If `QUESTIONS_PER_AREA` is `"all"` (default):**
   Ask every question Claude has about this area that would be useful for scoping and planning — do NOT limit to a fixed number. After exhausting all questions, move to the next area automatically. Do NOT ask the user whether to continue or move on — just announce you're moving to the next area.

   **If `QUESTIONS_PER_AREA` is a number (e.g., 4, 5, 8):**
   After asking that many questions, prompt:
   - header: "[Area]" (max 12 chars)
   - question: "More questions about [area], or move to next? (Remaining: [list other unvisited areas])"
   - options: "More questions" / "Next area"
   If "More questions" → ask another N questions (or another batch when `--batch` is active), then check again.
   If "Next area" → proceed to next selected area.
   If "Other" (free text) → interpret intent: continuation phrases ("chat more", "keep going", "yes", "more") map to "More questions"; advancement phrases ("done", "move on", "next", "skip") map to "Next area". If ambiguous, ask: "Continue with more questions about [area], or move to the next area?"

   **In both modes:** if the user proactively says they want to move on (e.g., "next", "skip", "done with this area"), respect that and proceed to the next selected area immediately.

4. **After all initially-selected areas complete:**
   - Summarize what was captured from the discussion so far
   - AskUserQuestion:
     - header: "Done"
     - question: "We've discussed [list areas]. Which gray areas remain unclear?"
     - options: "Explore more gray areas" / "I'm ready for context"
   - If "Explore more gray areas":
     - Identify 2-4 additional gray areas based on what was learned
     - Return to present_gray_areas logic with these new areas
     - Loop: discuss new areas, then prompt again
   - If "I'm ready for context": Proceed to write_context

**Canonical ref accumulation during discussion:**
When the user references a doc, spec, or ADR during any answer — e.g., "read adr-014", "check the MCP spec", "per browse-spec.md" — immediately:
1. Read the referenced doc (or confirm it exists)
2. Add it to the canonical refs accumulator with full relative path
3. Use what you learned from the doc to inform subsequent questions

These user-referenced docs are often MORE important than ROADMAP.md refs because they represent docs the user specifically wants downstream agents to follow. Never drop them.

**Question design:**
- Options should be concrete, not abstract ("Cards" not "Option A")
- Each answer should inform the next question or next batch
- If user picks "Other" to provide freeform input (e.g., "let me describe it", "something else", or an open-ended reply), ask your follow-up as plain text — NOT another AskUserQuestion. Wait for them to type at the normal prompt, then reflect their input back and confirm before resuming AskUserQuestion or the next numbered batch.

**Scope creep handling:**
If user mentions something outside the phase domain:
```
"[Feature] sounds like a new capability — that belongs in its own phase.
I'll note it as a deferred idea.

Back to [current area]: [return to current question]"
```

Track deferred ideas internally.

**Incremental checkpoint — save after each area completes:**

After each area is resolved (user says "Next area" or area auto-resolves in `--auto` mode), immediately write a checkpoint file with all decisions captured so far. This prevents data loss if the session is interrupted mid-discussion.

**Checkpoint file:** `${phase_dir}/${padded_phase}-DISCUSS-CHECKPOINT.json`

Write after each area:
```json
{
  "phase": "{PHASE_NUM}",
  "phase_name": "{phase_name}",
  "timestamp": "{ISO timestamp}",
  "areas_completed": ["Area 1", "Area 2"],
  "areas_remaining": ["Area 3", "Area 4"],
  "decisions": {
    "Area 1": [
      {"question": "...", "answer": "...", "options_presented": ["..."]},
      {"question": "...", "answer": "...", "options_presented": ["..."]}
    ],
    "Area 2": [
      {"question": "...", "answer": "...", "options_presented": ["..."]}
    ]
  },
  "deferred_ideas": ["..."],
  "canonical_refs": ["..."]
}
```

This is a structured checkpoint, not the final CONTEXT.md — the `write_context` step still produces the canonical output. But if the session dies, the next `/gsd:discuss-phase` invocation can detect this checkpoint and offer to resume from it instead of starting from scratch.

**On session resume:** In the `check_existing` step, also check for `*-DISCUSS-CHECKPOINT.json`. If found and no CONTEXT.md exists:
- Display: "Found interrupted discussion checkpoint ({N} areas completed). Resume from checkpoint?"
- Options: "Resume" / "Start fresh"
- On "Resume": Load the checkpoint, skip completed areas, continue from where it left off
- On "Start fresh": Delete the checkpoint, proceed as normal

**After write_context completes successfully:** Delete the checkpoint file — the canonical CONTEXT.md now has all decisions.

**Track discussion log data internally:**
For each question asked, accumulate:
- Area name
- All options presented (label + description)
- Which option the user selected (or their free-text response)
- Any follow-up notes or clarifications the user provided
This data is used to generate DISCUSSION-LOG.md in the `write_context` step.

3. **Record the user's selection:**
   - If user picks from table options → record as locked decision for that area
   - If user picks "Other" → receive their input, reflect it back for confirmation, record

   **Thinking partner (conditional):**
   If `features.thinking_partner` is enabled in config, check the user's answer for tradeoff signals
   (see `references/thinking-partner.md` for signal list). If tradeoff detected:

   ```
   I notice competing priorities here — {option_A} optimizes for {goal_A} while {option_B} optimizes for {goal_B}.

   Want me to think through the tradeoffs before we lock this in?
   [Yes, analyze] / [No, decision made]
   ```

   If yes: provide 3-5 bullet analysis (what each optimizes/sacrifices, alignment with PROJECT.md goals, recommendation). Then return to normal flow.
   If no or thinking_partner disabled: continue to next area.

4. **After recording pick, Claude decides whether follow-up questions are needed:**
   - If the pick has ambiguity that would affect downstream planning → ask 1-2 targeted follow-up questions using AskUserQuestion
   - If the pick is clear and self-contained → move to next area
   - Do NOT ask the standard 4 questions — the table already provided the context

5. **After all areas processed:**
   - header: "Done"
   - question: "That covers [list areas]. Ready to create context?"
   - options: "Create context" / "Revisit an area"

**Scope creep handling (advisor mode):**
If user mentions something outside the phase domain:
```
"[Feature] sounds like a new capability — that belongs in its own phase.
I'll note it as a deferred idea.

Back to [current area]: [return to current question]"
```

Track deferred ideas internally.

---

**If ADVISOR_MODE is false:**

For each selected area, conduct a focused discussion loop.

**Research-before-questions mode:** Check if `workflow.research_before_questions` is enabled in config (from init context or `.planning/config.json`). When enabled, before presenting questions for each area:
1. Do a brief web search for best practices related to the area topic
2. Summarize the top findings in 2-3 bullet points
3. Present the research alongside the question so the user can make a more informed decision

Example with research enabled:
```
Let's talk about [Authentication Strategy].

📊 Best practices research:
• OAuth 2.0 + PKCE is the current standard for SPAs (replaces implicit flow)
• Session tokens with httpOnly cookies preferred over localStorage for XSS protection
• Consider passkey/WebAuthn support — adoption is accelerating in 2025-2026

With that context: How should users authenticate?
```

When disabled (default), skip the research and present questions directly as before.

**Text mode support:** Parse optional `--text` from `$ARGUMENTS`.
- Accept `--text` flag OR read `workflow.text_mode` from config (from init context)
- When active, replace ALL `AskUserQuestion` calls with plain-text numbered lists
- User types a number to select, or types free text for "Other"
- This is required for Claude Code remote sessions (`/rc` mode) where TUI menus
  don't work through the Claude App

**Batch mode support:** Parse optional `--batch` from `$ARGUMENTS`.
- Accept `--batch`, `--batch=N`, or `--batch N`

**Analyze mode support:** Parse optional `--analyze` from `$ARGUMENTS`.
When `--analyze` is active, before presenting each question (or question group in batch mode), provide a brief **trade-off analysis** for the decision:
- 2-3 options with pros/cons based on codebase context and common patterns
- A recommended approach with reasoning
- Known pitfalls or constraints from prior phases

Example with `--analyze`:
```
**Trade-off analysis: Authentication strategy**

| Approach | Pros | Cons |
|----------|------|------|
| Session cookies | Simple, httpOnly prevents XSS | Requires CSRF protection, sticky sessions |
| JWT (stateless) | Scalable, no server state | Token size, revocation complexity |
| OAuth 2.0 + PKCE | Industry standard for SPAs | More setup, redirect flow UX |

💡 Recommended: OAuth 2.0 + PKCE — your app has social login in requirements (REQ-04) and this aligns with the existing NextAuth setup in `src/lib/auth.ts`.

How should users authenticate?
```

This gives the user context to make informed decisions without extra prompting. When `--analyze` is absent, present questions directly as before.
- Accept `--batch`, `--batch=N`, or `--batch N`
- Default to 4 questions per batch when no number is provided
- Clamp explicit sizes to 2-5 so a batch stays answerable
- If `--batch` is absent, keep the existing one-question-at-a-time flow

**Philosophy:** stay adaptive, but let the user choose the pacing.
- Default mode: 4 single-question turns, then check whether to continue
- `--batch` mode: 1 grouped turn with 2-5 numbered questions, then check whether to continue

Each answer (or answer set, in batch mode) should reveal the next question or next batch.

**Auto mode (`--auto`):** For each area, Claude selects the recommended option (first option, or the one explicitly marked "recommended") for every question without using AskUserQuestion. Log each auto-selected choice:
```
[auto] [Area] — Q: "[question text]" → Selected: "[chosen option]" (recommended default)
```
After all areas are auto-resolved, skip the "Explore more gray areas" prompt and proceed directly to write_context.

**CRITICAL — Auto-mode pass cap:**
In `--auto` mode, the discuss step MUST complete in a **single pass**. After writing CONTEXT.md once, you are DONE — proceed immediately to write_context and then auto_advance. Do NOT re-read your own CONTEXT.md to find "gaps", "undefined types", or "missing decisions" and run additional passes. This creates a self-feeding loop where each pass generates references that the next pass treats as gaps, consuming unbounded time and resources.

Check the pass cap from config:
```bash
MAX_PASSES=$(gsd_run query config-get workflow.max_discuss_passes 2>/dev/null || echo "3")
```

If you have already written and committed CONTEXT.md, the discuss step is complete. Move on.

**Interactive mode (no `--auto`):**

**For each area:**

1. **Announce the area:**
   ```
   Let's talk about [Area].
   ```

2. **Ask questions using the selected pacing:**

   **Default (no `--batch`): Ask 4 questions using AskUserQuestion**
   - header: "[Area]" (max 12 chars — abbreviate if needed)
   - question: Specific decision for this area
   - options: 2-3 concrete choices (AskUserQuestion adds "Other" automatically), with the recommended choice highlighted and brief explanation why
   - **Annotate options with code context** when relevant:
     ```
     "How should posts be displayed?"
     - Cards (reuses existing Card component — consistent with Messages)
     - List (simpler, would be a new pattern)
     - Timeline (needs new Timeline component — none exists yet)
     ```
   - Include "You decide" as an option when reasonable — captures Claude discretion
   - **Context7 for library choices:** When a gray area involves library selection (e.g., "magic links" → query next-auth docs) or API approach decisions, use `mcp__context7__*` tools to fetch current documentation and inform the options. Don't use Context7 for every question — only when library-specific knowledge improves the options.

   **Batch mode (`--batch`): Ask 2-5 numbered questions in one plain-text turn**
   - Group closely related questions for the current area into a single message
   - Keep each question concrete and answerable in one reply
   - When options are helpful, include short inline choices per question rather than a separate AskUserQuestion for every item
   - After the user replies, reflect back the captured decisions, note any unanswered items, and ask only the minimum follow-up needed before moving on
   - Preserve adaptiveness between batches: use the full set of answers to decide the next batch or whether the area is sufficiently clear

3. **After the current set of questions, check:**
   - header: "[Area]" (max 12 chars)
   - question: "More questions about [area], or move to next? (Remaining: [list other unvisited areas])"
   - options: "More questions" / "Next area"

   When building the question text, list the remaining unvisited areas so the user knows what's ahead. For example: "More questions about Layout, or move to next? (Remaining: Loading behavior, Content ordering)"

   If "More questions" → ask another 4 single questions, or another 2-5 question batch when `--batch` is active, then check again
   If "Next area" → proceed to next selected area
   If "Other" (free text) → interpret intent: continuation phrases ("chat more", "keep going", "yes", "more") map to "More questions"; advancement phrases ("done", "move on", "next", "skip") map to "Next area". If ambiguous, ask: "Continue with more questions about [area], or move to the next area?"

4. **After all initially-selected areas complete:**
   - Summarize what was captured from the discussion so far
   - AskUserQuestion:
     - header: "Done"
     - question: "We've discussed [list areas]. Which gray areas remain unclear?"
     - options: "Explore more gray areas" / "I'm ready for context"
   - If "Explore more gray areas":
     - Identify 2-4 additional gray areas based on what was learned
     - Return to present_gray_areas logic with these new areas
     - Loop: discuss new areas, then prompt again
   - If "I'm ready for context": Proceed to write_context

**Canonical ref accumulation during discussion:**
When the user references a doc, spec, or ADR during any answer — e.g., "read adr-014", "check the MCP spec", "per browse-spec.md" — immediately:
1. Read the referenced doc (or confirm it exists)
2. Add it to the canonical refs accumulator with full relative path
3. Use what you learned from the doc to inform subsequent questions

These user-referenced docs are often MORE important than ROADMAP.md refs because they represent docs the user specifically wants downstream agents to follow. Never drop them.

**Question design:**
- Options should be concrete, not abstract ("Cards" not "Option A")
- Each answer should inform the next question or next batch
- If user picks "Other" to provide freeform input (e.g., "let me describe it", "something else", or an open-ended reply), ask your follow-up as plain text — NOT another AskUserQuestion. Wait for them to type at the normal prompt, then reflect their input back and confirm before resuming AskUserQuestion or the next numbered batch.

**Scope creep handling:**
If user mentions something outside the phase domain:
```
"[Feature] sounds like a new capability — that belongs in its own phase.
I'll note it as a deferred idea.

Back to [current area]: [return to current question]"
```

Track deferred ideas internally.

**Incremental checkpoint — save after each area completes:**

After each area is resolved (user says "Next area" or area auto-resolves in `--auto` mode), immediately write a checkpoint file with all decisions captured so far. This prevents data loss if the session is interrupted mid-discussion.

**Checkpoint file:** `${phase_dir}/${padded_phase}-DISCUSS-CHECKPOINT.json`

Write after each area:
```json
{
  "phase": "{PHASE_NUM}",
  "phase_name": "{phase_name}",
  "timestamp": "{ISO timestamp}",
  "areas_completed": ["Area 1", "Area 2"],
  "areas_remaining": ["Area 3", "Area 4"],
  "decisions": {
    "Area 1": [
      {"question": "...", "answer": "...", "options_presented": ["..."]},
      {"question": "...", "answer": "...", "options_presented": ["..."]}
    ],
    "Area 2": [
      {"question": "...", "answer": "...", "options_presented": ["..."]}
    ]
  },
  "deferred_ideas": ["..."],
  "canonical_refs": ["..."]
}
```

This is a structured checkpoint, not the final CONTEXT.md — the `write_context` step still produces the canonical output. But if the session dies, the next `/gsd:discuss-phase` invocation can detect this checkpoint and offer to resume from it instead of starting from scratch.

**On session resume:** In the `check_existing` step, also check for `*-DISCUSS-CHECKPOINT.json`. If found and no CONTEXT.md exists:
- Display: "Found interrupted discussion checkpoint ({N} areas completed). Resume from checkpoint?"
- Options: "Resume" / "Start fresh"
- On "Resume": Load the checkpoint, skip completed areas, continue from where it left off
- On "Start fresh": Delete the checkpoint, proceed as normal

**After write_context completes successfully:** Delete the checkpoint file — the canonical CONTEXT.md now has all decisions.

**Track discussion log data internally:**
For each question asked, accumulate:
- Area name
- All options presented (label + description)
- Which option the user selected (or their free-text response)
- Any follow-up notes or clarifications the user provided
This data is used to generate DISCUSSION-LOG.md in the `write_context` step.
</step>

<step name="write_context">
Create CONTEXT.md and DISCUSSION-LOG.md.

DISCUSSION-LOG.md is for human reference only (audits, retrospectives) and is NOT consumed by downstream agents (researcher, planner, executor).

**Find or create phase directory:**

Use values from init: `phase_dir`, `expected_phase_dir`, `phase_slug`, `padded_phase`. If `phase_dir` is null:
```bash
mkdir -p "${expected_phase_dir}"
```

Set `phase_dir="${expected_phase_dir}"` after creation.

**File location:** `${phase_dir}/${padded_phase}-CONTEXT.md`

**Read the CONTEXT.md template now (lazy-loaded):**
```
Read(workflows/discuss-phase/templates/context.md)
```

The template documents variable substitutions and conditional sections. Substitute live values for `[X]`, `[Name]`, `[date]`, `${padded_phase}`, `{N}`. Include `<spec_lock>` only when `spec_loaded = true`. Include "Folded Todos" / "Reviewed Todos" subsections only when the `cross_reference_todos` step folded or reviewed todos.

**SPEC.md integration** — If `spec_loaded = true`:
- Add the `<spec_lock>` section immediately after `<domain>`.
- Add the SPEC.md file to `<canonical_refs>` with note "Locked requirements — MUST read before planning".
- Do NOT duplicate requirements text from SPEC.md into `<decisions>` — agents read SPEC.md directly.
- The `<decisions>` section contains only implementation decisions from this discussion.

Write the file.
</step>

<step name="propagate_key_decisions">
**Key Decisions Propagation:**

After writing CONTEXT.md, check if any decisions captured during discussion are architectural (affect project structure, technology choices, patterns, or conventions that future phases should follow).

For each architectural decision:
1. Check if CLAUDE.md exists in the project root
2. If it exists, check if it has a `## Key Decisions` section
3. If the section exists, append new decisions (avoid duplicates)
4. If the section doesn't exist, create it at the end of the file
5. If CLAUDE.md doesn't exist, skip this step

Format for each decision:
```markdown
- **{Decision name}:** {Brief description of what was decided and why} (Phase {phase_num})
```

Only propagate decisions that are:
- Technology/library choices (e.g., "Use jose over jsonwebtoken for Edge compatibility")
- Architectural patterns (e.g., "Card-based layout with infinite scroll")
- Convention choices (e.g., "All API routes return { data, error, meta } shape")
- Constraint decisions (e.g., "No new dependencies for auth — use built-in crypto")

Do NOT propagate:
- UI-specific details that only affect one phase
- Implementation choices the executor can decide
- Temporary decisions (e.g., "skip dark mode for now")

Commit the CLAUDE.md update together with the CONTEXT.md commit if changes were made.
</step>

<step name="dispatch_discuss_post_hooks">
```bash
DISCUSS_POST_HOOKS_JSON=$(gsd_run loop render-hooks discuss:post --raw)
```
Apply each entry in `activeHooks` per @~/.claude/gsd-core/references/loop-hook-dispatch.md. Empty list → continue to `confirm_creation`.
</step>

<step name="confirm_creation">
Present summary and next steps:

```
Created: .planning/phases/${PADDED_PHASE}-${SLUG}/${PADDED_PHASE}-CONTEXT.md
[If DESIGN.md was generated:]
Created: .planning/phases/${PADDED_PHASE}-${SLUG}/${PADDED_PHASE}-DESIGN.md

## Decisions Captured
### [Category]
- [Key decision]

[If deferred ideas exist:]
## Noted for Later
- [Deferred idea] — future phase

---

## ▶ Next Up — [${PROJECT_CODE}] ${PROJECT_TITLE}

**Phase ${PHASE}: [Name]** — [Goal from ROADMAP.md]

`/clear` then:

`/gsd:plan-phase ${PHASE} ${GSD_WS}`

---

**Also available:** `--chain` for auto plan+execute after; `/gsd:plan-phase ${PHASE} --skip-research ${GSD_WS}` to plan without research; `/gsd:ui-phase ${PHASE} ${GSD_WS}` for UI design contracts; review/edit CONTEXT.md before continuing.
```
</step>

<step name="git_commit">
**Write DISCUSSION-LOG.md before committing.**

**File location:** `${phase_dir}/${padded_phase}-DISCUSSION-LOG.md`

**Read the DISCUSSION-LOG.md template now (lazy-loaded):**
```
Read(workflows/discuss-phase/templates/discussion-log.md)
```

Substitute live values from the discussion log accumulator (area names, options presented, user selections, notes, deferred ideas, Claude's discretion items). Write the file.

**Clean up checkpoint file** — CONTEXT.md is now the canonical record:
```bash
rm -f "${phase_dir}/${padded_phase}-DISCUSS-CHECKPOINT.json"
```

Commit phase context, discussion log, and design spec (if generated):

```bash
COMMIT_FILES="${phase_dir}/${padded_phase}-CONTEXT.md ${phase_dir}/${padded_phase}-DISCUSSION-LOG.md"
# Fork: include DESIGN.md when workflow.design_spec generated a frozen design spec for this phase.
if [ -f "${phase_dir}/${padded_phase}-DESIGN.md" ]; then
  COMMIT_FILES="${COMMIT_FILES} ${phase_dir}/${padded_phase}-DESIGN.md"
fi
gsd_run query commit "docs(${padded_phase}): capture phase context" --files ${COMMIT_FILES}
```

Confirm: "Committed: docs(${padded_phase}): capture phase context"
</step>

<step name="update_state">
Update STATE.md with session info:

```bash
gsd_run query state.record-session \
  --stopped-at "Phase ${PHASE} context gathered" \
  --resume-file "${phase_dir}/${padded_phase}-CONTEXT.md"

gsd_run query commit "docs(state): record phase ${PHASE} context session" --files .planning/STATE.md
```
</step>

<step name="auto_advance">
Auto-advance behavior is defined in `workflows/discuss-phase/modes/chain.md`.

If `--auto`, `--chain`, or `workflow.auto_advance` is enabled, Read that file now and execute its `auto_advance` step (flag-syncing, banner, plan-phase dispatch, return-status branching).

Otherwise, end here — `confirm_creation` already ran; do not route back to it.
</step>

</process>

<success_criteria>
- Phase validated against roadmap
- Prior context loaded (PROJECT.md, REQUIREMENTS.md, STATE.md, prior CONTEXT.md files)
- Already-decided questions not re-asked (carried forward from prior phases)
- Codebase scouted for reusable assets, patterns, and integration points
- Gray areas identified with code and prior-decision annotations
- User selected which areas to discuss (or `--all`/`--auto` auto-selected)
- Each selected area explored under the active mode's rules until satisfied
- Scope creep redirected to deferred ideas
- CONTEXT.md captures actual decisions, not vague vision
- CONTEXT.md includes canonical_refs section with full file paths to every spec/ADR/doc downstream agents need (MANDATORY)
- CONTEXT.md includes code_context section with reusable assets and patterns
- Deferred ideas preserved for future phases
- STATE.md updated with session info
- User knows next steps
- Checkpoint file written after each area completes (incremental save)
- Interrupted sessions can be resumed from checkpoint
- Checkpoint file cleaned up after successful CONTEXT.md write
- `--chain` triggers interactive discuss followed by auto plan+execute (no auto-answering)
- `--chain` and `--auto` both persist chain flag and auto-advance to plan-phase
- Per-mode bodies, templates, and advisor flow are lazy-loaded — parent stays under the workflow size budget enforced by `tests/workflow-size-budget.test.cjs`
</success_criteria>
