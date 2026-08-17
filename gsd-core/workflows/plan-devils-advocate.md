<purpose>
Devil's Advocate Review — challenges the execution plans for a phase to surface
BLOCKERs, RISKs, and SUGGESTIONs before execution begins. Invoked inline from
plan-phase.md §12.6 when `workflow.adversarial_validation` is true. BLOCKER and
RISK routing returns to plan-phase.md's plan revision loop (Steps 8–12).
</purpose>

<step name="devils_advocate_shim">

Resolve the portable `gsd_run` shim before using any `gsd_run` calls in this file:

```bash
```

Read the `workflow.adversarial_validation` knob using the portable shim:

```bash
_GSD_SHIM_NAME="gsd-tools.cjs"; _GSD_RUNTIME_ROOT="${RUNTIME_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"; GSD_TOOLS="${_GSD_RUNTIME_ROOT}/gsd-core/bin/${_GSD_SHIM_NAME}"; if [ -f "$GSD_TOOLS" ]; then gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif command -v gsd-tools >/dev/null 2>&1; then GSD_TOOLS="$(command -v gsd-tools)"; gsd_run() { "$GSD_TOOLS" "$@"; }; elif [ -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${HERMES_HOME:-$HOME/.hermes}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${HERMES_HOME:-$HOME/.hermes}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CURSOR_CONFIG_DIR:-$HOME/.cursor}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CURSOR_CONFIG_DIR:-$HOME/.cursor}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CODEX_HOME:-$HOME/.codex}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CODEX_HOME:-$HOME/.codex}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${GEMINI_CONFIG_DIR:-$HOME/.gemini}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${GEMINI_CONFIG_DIR:-$HOME/.gemini}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${COPILOT_CONFIG_DIR:-$HOME/.copilot}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${COPILOT_CONFIG_DIR:-$HOME/.copilot}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${AUGMENT_CONFIG_DIR:-$HOME/.augment}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${AUGMENT_CONFIG_DIR:-$HOME/.augment}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${TRAE_CONFIG_DIR:-$HOME/.trae}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${TRAE_CONFIG_DIR:-$HOME/.trae}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${QWEN_CONFIG_DIR:-$HOME/.qwen}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${QWEN_CONFIG_DIR:-$HOME/.qwen}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CLINE_CONFIG_DIR:-$HOME/.cline}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CLINE_CONFIG_DIR:-$HOME/.cline}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${GROK_AGENTS_HOME:-$HOME/.agents}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${GROK_AGENTS_HOME:-$HOME/.agents}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; else echo "ERROR: gsd-tools.cjs not found at $GSD_TOOLS and gsd-tools is not on PATH. Run: npx -y @opengsd/gsd-core@latest --claude --local" >&2; exit 1; fi; if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -n "${GSD_TOOLS:-}" ]; then printf "export PATH='%s':\"\$PATH\"\n" "${GSD_TOOLS%/*}" >> "$CLAUDE_ENV_FILE" 2>/dev/null || true; fi
ADVERSARIAL=$(gsd_run query config-get workflow.adversarial_validation 2>/dev/null || echo "true")
TEXT_MODE=$(gsd_run query config-get workflow.text_mode 2>/dev/null || echo "false")
# When TEXT_MODE is true, replace every AskUserQuestion call with a plain-text
# numbered list and ask the user to type their choice number instead. This ensures
# non-Claude runtimes (OpenAI Codex, Gemini, etc.) can handle RISK review questions
# without stalling on an unexecuted TUI tool call (#2012).
```

Skip this entire file if `ADVERSARIAL` is `"false"`.

</step>

<step name="devils_advocate_spawn">

After plans pass the plan-checker, spawn a Devil's Advocate agent (general-purpose) to challenge the approach:

```
You are a Devil's Advocate reviewing the execution plans for Phase {phase_num}: {phase_name}.

Your job is to argue AGAINST the current plan. Find weaknesses, risks, and better alternatives. You score points for legitimate concerns and lose points for nitpicking.

Plans to review:
{list of PLAN.md files with their content}

Project context:
{CONTEXT.md if exists}
{ROADMAP.md phase entry}

Challenge the plans on these dimensions:

1. **Wrong abstraction:** Is the plan creating unnecessary complexity? Could this be done simpler?
   - "This introduces a new service layer when a simple function would suffice"
   - "Three separate API endpoints could be one with a query parameter"

2. **Missing alternative:** Is there a fundamentally different approach that wasn't considered?
   - "This uses polling but WebSockets would be more appropriate for real-time updates"
   - "This builds a custom auth system but the existing middleware already handles this"

3. **Scope creep:** Is the plan doing more than the phase goal requires?
   - "The phase goal is 'user can log in' but the plan includes password reset and 2FA"
   - "This adds a caching layer that isn't needed at current scale"

4. **Integration risk:** Will this plan's output actually connect to the rest of the system?
   - "The API returns a different shape than what the existing frontend expects"
   - "This migration will break the existing seed data"

5. **Testability:** Can the plan's success criteria actually be verified?
   - "The success criterion is 'users can log in' but there's no test plan for auth failure"
   - "This plan modifies 12 files but only tests 2 of them"

6. **Dependency risk:** Are the plan's assumptions about dependencies correct?
   - "Plan assumes library X supports feature Y, but it was deprecated in v3"
   - "Wave 2 depends on Wave 1's API shape, but Wave 1 doesn't define it"

For each challenge, provide:
- The concern (specific, not vague)
- Severity: BLOCKER (plan will fail) / RISK (might fail) / SUGGESTION (could be better)
- Alternative approach (if applicable)
- What would need to change in the plan

Be constructive, not destructive. The goal is to make the plan better, not to prevent execution.
```

</step>

<step name="devils_advocate_results">

**Process the Devil's Advocate results:**

1. **BLOCKER challenges:** These MUST be addressed before execution. Route back to the planner for revision:
   - Present blockers to the user
   - If user agrees → re-enter plan revision loop with the blocker as context (plan-phase.md Steps 8–12)
   - If user disagrees → log as acknowledged risk and proceed

2. **RISK challenges:** Present to user via AskUserQuestion:
   - header: "Plan Review"
   - question: "Devil's Advocate raised {N} risks. Review them?"
   - options: "Review risks" / "Acknowledge and proceed"
   - If "Review risks" → show each risk, let user decide per-risk (address / acknowledge / dismiss)
   - Addressed risks → re-enter plan revision loop (plan-phase.md Steps 8–12)
   - Acknowledged risks → note in PLAN.md frontmatter as `acknowledged_risks`

3. **SUGGESTION challenges:** Log in PLAN.md as comments for the executor's context. Don't block.

**Add to PLAN.md frontmatter** (if any risks were acknowledged):
```yaml
acknowledged_risks:
  - "Polling approach may not scale past 100 concurrent users — acceptable for MVP"
  - "Custom auth bypasses existing middleware — will unify in Phase 4"
```

The executor should be aware of acknowledged risks and flag if they materialize during implementation.

</step>
