@~/.claude/gsd-core/references/response-language-directive.md

<purpose>
Knob-gated teach-phase orchestrator — routes each candidate learning from a completed phase to
exactly one durable surface (hook > MCP tool > skill > rules) and emits NN-TEACH.md HITL
proposals. Never auto-writes any surface. Silent no-op when the knob is off or zero candidates
match a surface signal. Calls gsd:extract-learnings for candidate sourcing (D-05); does not
re-derive learnings.
</purpose>

---

## Step 1: Initialize — Portable Shim + Phase Resolution

```bash
_GSD_SHIM_NAME="gsd-tools.cjs"; _GSD_RUNTIME_ROOT="${RUNTIME_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"; GSD_TOOLS="${_GSD_RUNTIME_ROOT}/gsd-core/bin/${_GSD_SHIM_NAME}"; _gsd_at() { for _p; do if [ -f "$_p" ]; then GSD_TOOLS="$_p"; return 0; fi; done; return 1; }; _gsd_id_ok() { case "$("$1" runtime-identity --raw 2>/dev/null || true)" in '{"packageName":"@opengsd/gsd-core"'*'}') return 0;; *) return 1;; esac; }; _gsd_homes() { set -- "${CLAUDE_CONFIG_DIR:-$HOME/.claude}" "${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}" "$HOME/.gemini/antigravity-ide" "$HOME/.gemini/antigravity-cli" "${AUGMENT_CONFIG_DIR:-$HOME/.augment}" "${CLINE_CONFIG_DIR:-$HOME/.cline}" "${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}" "${CODEX_HOME:-$HOME/.codex}" "${COPILOT_CONFIG_DIR:-${COPILOT_HOME:-$HOME/.copilot}}" "${CURSOR_CONFIG_DIR:-$HOME/.cursor}" "${HERMES_HOME:-$HOME/.hermes}" "${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}" "${KIMI_CONFIG_DIR:-$HOME/.config/agents}" "$HOME/.agents" "${KIMI_CODE_HOME:-$HOME/.kimi-code}" "${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}" "${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}" "${QWEN_CONFIG_DIR:-$HOME/.qwen}" "${TRAE_CONFIG_DIR:-$HOME/.trae}" "${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}" "${ZCODE_CONFIG_DIR:-$HOME/.zcode}" "${GROK_AGENTS_HOME:-$HOME/.agents}"; for _h; do _gsd_at "$_h/gsd-core/bin/${_GSD_SHIM_NAME}" && return 0; done; return 1; }; if _gsd_at "${_GSD_RUNTIME_ROOT}/gsd-core/bin/${_GSD_SHIM_NAME}" "${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}" "${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}"; then gsd_run() { node "$GSD_TOOLS" "$@"; }; elif _gsd_homes; then gsd_run() { node "$GSD_TOOLS" "$@"; }; elif unset -f gsd_run; _G="$(command -v gsd_run)"; [ -n "$_G" ] && _gsd_id_ok "$_G"; then GSD_TOOLS="$_G"; gsd_run() { "$GSD_TOOLS" "$@"; }; else echo "ERROR: gsd-tools.cjs not found at $GSD_TOOLS and no identity-proving gsd_run is on PATH. Run: npx -y @opengsd/gsd-core@latest --claude --local" >&2; exit 1; fi; GSD_IDENTITY_STATUS=unverified; _gsd_id_ok gsd_run && GSD_IDENTITY_STATUS=ok; export GSD_IDENTITY_STATUS; [ "$GSD_IDENTITY_STATUS" = ok ] || echo "WARNING: \"$GSD_TOOLS\" did not prove it is @opengsd/gsd-core - it is either a different package or an @opengsd/gsd-core older than the runtime-identity verb. See docs/how-to/diagnose-a-foreign-gsd-tools.md" >&2; if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -n "${GSD_TOOLS:-}" ]; then printf "export PATH='%s':\"\$PATH\"\n" "${GSD_TOOLS%/*}" >> "$CLAUDE_ENV_FILE" 2>/dev/null || true; fi
PHASE_ARG=$(echo "$ARGUMENTS" | sed -E 's/--ws[[:space:]]+[A-Za-z0-9._-]+//g' | xargs)
GSD_WS=$(echo " $ARGUMENTS" | sed -nE 's/.* --ws +([A-Za-z0-9][A-Za-z0-9._-]*).*/--ws \1/p' | head -n 1)
INIT=$(gsd_run query init.phase-op ${GSD_WS:+--ws=${GSD_WS##* }} "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse from init JSON: `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `padded_phase`.

If `phase_found` is false, exit with error: "Phase ${PHASE_ARG} not found."

---

## Step 2: Knob Gate

```bash
TEACH=$(gsd_run query config-get workflow.teach_phase --raw 2>/dev/null || echo "false")
if [ "$TEACH" != "true" ]; then
  echo "workflow.teach_phase is false — skipping teach phase."
  exit 0
fi
```

If the knob is absent or false the command is a silent no-op. No NN-TEACH.md is written.

---

## Step 3: Candidate Sourcing — Invoke gsd:extract-learnings (D-05)

Do NOT re-derive learnings from scratch. Delegate to `Skill(gsd:extract-learnings)`.

```
Invoke Skill(gsd:extract-learnings) with the resolved PHASE_ARG.
This is idempotent — it overwrites any existing NN-LEARNINGS.md for the phase.
```

After the skill completes, read the fresh learnings file:

```bash
LEARNINGS_FILE="${PHASE_DIR}/${PADDED_PHASE}-LEARNINGS.md"
```

If the file does not exist after the skill completes, log a warning and exit 0 — no
candidates to route.

---

## Step 4: Surface-Signal Table and Routing (D-01 through D-04)

For each candidate learning extracted from `NN-LEARNINGS.md`, classify it against the
surface-signal table below. Apply the tie-break precedence. A candidate matching no signal
is dropped silently (D-02).

### Surface-Signal Table

| Surface | Signal |
|---------|--------|
| `hook` | "a step that must always fire (PreToolUse / PostToolUse) and was easy to skip in execution" |
| `MCP tool` | "the agent hand-rolled system access (curl, raw API call, shell command) that a dedicated MCP tool should own" |
| `skill` | "a repeatable multi-step procedure the agent performed that any future agent should be able to invoke as `Skill(...)`" |
| `rules` | "a convention, invariant, worked-example, or coding pattern that belongs in CLAUDE.md or `.claude/rules/`" |

**Tie-break precedence (D-04, most-enforcing wins):** `hook > MCP tool > skill > rules`

A candidate matching multiple surface signals is resolved by precedence, top-down, first
match wins (D-03). A candidate matching no surface signal is dropped silently (D-02).

---

## Step 5: Build Entries (D-06 Uniform Shape)

For each candidate that matched a surface signal, build an entry. Each entry MUST include
ALL five fields:

```markdown
## Entry N

**Learning:** [learning text from NN-LEARNINGS.md, with source attribution]
**Surface:** `hook` | `MCP tool` | `skill` | `rules`
**Signal matched:** [the exact signal line from the table above]
**Target:** [rules file path / proposed skill name / MCP tool server+name / hook type]
**Draft:**
[ready-to-paste draft: rule text / skill skeleton / tool-signature sketch / hook spec]
```

Surface-specific draft shape:
- **rules**: a ready-to-paste rule block for CLAUDE.md or a `.claude/rules/` file
- **skill**: a skeleton skill file with `name:`, `description:`, and step outline
- **MCP tool**: a tool-signature sketch (server name, tool name, input/output contract)
- **hook**: a hook specification (type: PreToolUse or PostToolUse, trigger condition, action)

---

## Step 6: Zero-Candidate Guard

After routing all candidates, check the count before writing:

```bash
if [ ${#TEACH_ENTRIES[@]} -eq 0 ]; then
  echo "teach-phase: zero candidates matched a surface signal — no NN-TEACH.md written."
  exit 0
fi
```

If zero entries matched, exit 0 without writing NN-TEACH.md. This is a normal, non-error
outcome — it means no learnings had clear durable-surface signal this phase.

---

## Step 7: Write NN-TEACH.md (HITL Proposals Only)

Write ONLY if there is at least one matched entry. The sole write target is:

```
${PHASE_DIR}/${PADDED_PHASE}-TEACH.md
```

teach writes NOTHING else — no rules files, no skills directory, no hook files, no
`.claude/rules/` paths, no `.claude/skills/` paths. These are HITL proposals that the
human reviews and applies manually.

The file header:

```markdown
---
phase: {PHASE_NUMBER}
phase_name: "{PHASE_NAME}"
generated: "{ISO_DATE}"
entries: {N}
---

# Phase {PHASE_NUMBER} Teach: {PHASE_NAME}

> HITL proposals only — review each entry and apply manually.
> teach does not auto-apply any surface. These are proposals for human review.
> Apply rules entries via the transition workflow's `graduation` step; apply skill/MCP tool/hook entries manually.

{Entry 1}

---

{Entry 2}

---
...
```

---

## Step 8: STATE.md Update

```bash
gsd_run query state.update "Last Activity" "$(date +%Y-%m-%d)"
```

---

## Step 9: Brief Report

```
---------------------------------------------------------------

## Teach Phase Complete: Phase {X} — {Name}

Candidates reviewed:  {total from NN-LEARNINGS.md}
Entries routed:       {N}
  hook:               {n}
  MCP tool:           {n}
  skill:              {n}
  rules:              {n}
Candidates dropped:   {total - N}

Output: ${PHASE_DIR}/${PADDED_PHASE}-TEACH.md

Next steps:
- Review NN-TEACH.md proposals before applying any surface
- Apply rules entries via the transition workflow's `graduation` step
- Apply skill/MCP tool/hook entries manually

---------------------------------------------------------------
```

---

<success_criteria>
- [ ] Knob false → command writes nothing, exits cleanly
- [ ] Knob true + learnings → NN-TEACH.md with each entry naming exactly one surface + a draft
- [ ] Knob true + zero matching candidates → no NN-TEACH.md written
- [ ] teach calls extract-learnings and never writes any live surface (HITL proposals only)
- [ ] HITL proposals only — the .claude/rules/ and .claude/skills/ directories are never touched
- [ ] No direct surface promotion via graduation (propose only)
</success_criteria>
