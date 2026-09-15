<purpose>

Run 2+ mutually-independent, dependency-satisfied phases in PARALLEL, each in its own isolated git worktree running the full discuss→plan→execute→code-review→verify:post-hooks→teach pipeline, then merge each back into the current branch one at a time using structured GSD commands for the shared planning ledgers (never a raw text merge of ROADMAP.md/STATE.md/REQUIREMENTS.md/WINDOWS.md).

Complements `/gsd-autonomous` (strictly sequential, one shared tree) and `/gsd-manager` (background-dispatches plan/execute per phase onto the SAME shared tree — safe only because those two steps don't touch the shared ledgers) by adding genuine phase-level concurrency for the common case of several independent, already-discussed-or-discussable phases (e.g. a batch of unplanned bug-fix/hygiene phases discovered the same day, or several roadmap phases with no real dependency between them).

</purpose>

<required_reading>

Read all files referenced by the invoking prompt's execution_context before starting.

</required_reading>

<process>

<step name="initialize" priority="first">

## 1. Initialize

Parse `$ARGUMENTS` for `--phases N,M,...` (explicit list) or `--from N`/`--to N` (range). If neither is present, default to every phase in the current milestone that is not yet complete.

Bootstrap via manager init (same launcher preamble `/gsd-manager` and `/gsd-autonomous` use):

```bash
_GSD_SHIM_NAME="gsd-tools.cjs"; _GSD_RUNTIME_ROOT="${RUNTIME_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"; GSD_TOOLS="${_GSD_RUNTIME_ROOT}/gsd-core/bin/${_GSD_SHIM_NAME}"; if [ -f "$GSD_TOOLS" ]; then gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif command -v gsd-tools >/dev/null 2>&1; then GSD_TOOLS="$(command -v gsd-tools)"; gsd_run() { "$GSD_TOOLS" "$@"; }; elif [ -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${HERMES_HOME:-$HOME/.hermes}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${HERMES_HOME:-$HOME/.hermes}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CURSOR_CONFIG_DIR:-$HOME/.cursor}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CURSOR_CONFIG_DIR:-$HOME/.cursor}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CODEX_HOME:-$HOME/.codex}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CODEX_HOME:-$HOME/.codex}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${GEMINI_CONFIG_DIR:-$HOME/.gemini}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${GEMINI_CONFIG_DIR:-$HOME/.gemini}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${COPILOT_CONFIG_DIR:-$HOME/.copilot}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${COPILOT_CONFIG_DIR:-$HOME/.copilot}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${AUGMENT_CONFIG_DIR:-$HOME/.augment}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${AUGMENT_CONFIG_DIR:-$HOME/.augment}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${TRAE_CONFIG_DIR:-$HOME/.trae}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${TRAE_CONFIG_DIR:-$HOME/.trae}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${QWEN_CONFIG_DIR:-$HOME/.qwen}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${QWEN_CONFIG_DIR:-$HOME/.qwen}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CLINE_CONFIG_DIR:-$HOME/.cline}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CLINE_CONFIG_DIR:-$HOME/.cline}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${GROK_AGENTS_HOME:-$HOME/.agents}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${GROK_AGENTS_HOME:-$HOME/.agents}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; else echo "ERROR: gsd-tools.cjs not found at $GSD_TOOLS and gsd-tools is not on PATH. Run: npx -y @opengsd/gsd-core@latest --claude --local" >&2; exit 1; fi; if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -n "${GSD_TOOLS:-}" ]; then printf "export PATH='%s':\"\$PATH\"\n" "${GSD_TOOLS%/*}" >> "$CLAUDE_ENV_FILE" 2>/dev/null || true; fi
INIT=$(gsd_run query init.manager)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse JSON for: `milestone_version`, `milestone_name`, `phases` (each phase carries `number`, `name`, `disk_status`, `phase_complete`, `completion_status`, `depends_on` — the JSON's own `depends_on`/`dep_phases` fields are a coarse, FIRST-LINE-only substring scan and are NOT authoritative for this workflow's independence check; step 2 re-derives it from the raw ROADMAP.md text).

**If error:** Display the error message and exit.

</step>

<step name="eligibility">

## 2. Compute the Eligible, Mutually-Independent Batch

This is the step that makes parallel dispatch safe. Do NOT trust `init.manager`'s `dep_phases` field alone — it is produced by a naive regex that matches every literal `Phase N` substring in the `**Depends on:**` paragraph, including inside negations like "independent **of** Phase 16" (the underlying extraction in `src/init.cts` scans `depends_on.match(PHASE_NUMBER_TOKEN_SOURCE, 'gi')` with no negation awareness). Re-derive per-candidate dependencies from the RAW paragraph text instead:

```bash
python3 - "$PWD/.planning/ROADMAP.md" <<'ROADMAP_DEPS_PY'
import re, sys, json
content = open(sys.argv[1]).read()
phase_re = re.compile(r'^#{2,4}\s*Phase\s+(\d+[\d.]*)\s*:.*?$', re.M)
matches = list(phase_re.finditer(content))
out = {}
for i, m in enumerate(matches):
    num = m.group(1)
    start = m.start()
    end = matches[i+1].start() if i + 1 < len(matches) else len(content)
    section = content[start:end]
    dm = re.search(r'\*\*Depends on:?\*\*\s*(.*?)(?:\n\n|\*\*Requirements)', section, re.S)
    dep_text = re.sub(r'\s+', ' ', dm.group(1)).strip() if dm else ''
    # AUTHORITATIVE RULE: a paragraph that OPENS with "Nothing new" / "None" declares
    # zero real dependencies, full stop -- any "Phase N" substring appearing LATER in
    # the same paragraph (an explanatory aside, e.g. "independent of Phase 16") is prose,
    # not a dependency declaration, and must not be extracted as one.
    if re.match(r'^(nothing new|none\b)', dep_text, re.I):
        deps = []
    else:
        deps = sorted(set(re.findall(r'Phase (\d+)', dep_text)))
    out[num] = {"depends_on_raw": dep_text, "dep_phases": deps}
print(json.dumps(out))
ROADMAP_DEPS_PY
```

For each phase in this workflow's candidate set (from step 1's `--phases`/`--from`/`--to`/default filter, restricted to `phase_complete !== true`):

1. **Dependency satisfaction:** every phase number in its re-derived `dep_phases` must have `phase_complete === true` in the `init.manager` data (whether or not that dependency is itself in this batch). If any declared dependency is NOT complete, EXCLUDE this phase from the batch — report `"Phase {N} excluded: depends on incomplete Phase {M}"`.
2. **Mutual independence within the batch:** for every OTHER phase in the still-candidate batch, neither phase's `dep_phases` may name the other. If phase A's `dep_phases` includes phase B (and B is also a batch candidate), EXCLUDE A (keep B) and report why — a real intra-batch dependency chain belongs to `/gsd-autonomous`'s sequential loop, not this workflow's parallel fan-out.
3. **File-overlap safety net (only when it can be checked cheaply):** if a candidate phase already has plan files on disk (rare for this workflow's usual case of freshly-discovered, undiscussed phases — most candidates will be pre-discuss), and the plans' own `files_modified` frontmatter shows real overlap with another candidate's plans, exclude the later-numbered one and report the overlapping paths. Do not attempt semantic/heuristic file-domain inference beyond this — that is `analyze-dependencies.md`'s job for phases that are ALREADY planned, and is out of scope here for phases that are not.

Display the final batch and every exclusion with its reason. **If the batch has fewer than 2 phases**, tell the user parallel dispatch buys nothing for a single phase and offer `/gsd-autonomous --only N` instead (`AskUserQuestion`: "Run anyway (parallel machinery, no benefit)" / "Use gsd-autonomous --only instead" / "Cancel"). If the batch is empty, exit cleanly with the exclusion report.

</step>

<step name="fanout">

## 3. Fan Out — One Isolated Worktree Per Phase

Capture the fork-base BEFORE any dispatch — every phase-worktree branches from here, and merge-back (step 4) checks against it exactly like `worktree-branch-check.md`'s existing per-plan guard does:

```bash
BASE_SHA=$(git rev-parse HEAD)
```

**Dispatch every eligible phase's agent in a SINGLE message** — per `execute-phase.md`'s own documented reason, simultaneous `git worktree add` calls race on `.git/config.lock` if sent as separate messages; agents run in parallel fine once their worktrees exist.

For each eligible phase N, in that one message:

```
Agent(
  isolation="worktree",
  run_in_background=true,
  description="Run phase {N} to completion: {phase_name}",
  prompt="You are running phase {N} ({phase_name}) of this project to completion, inside your own isolated git worktree.

Run: Skill(skill=\"gsd-autonomous\", args=\"--only {N}\")

This runs discuss (smart/auto) → plan → execute → code-review+fix → teach (if workflow.teach_phase) for this one phase.

After it returns, ALSO run every currently-active verify:post capability hook, in registration order (this project may have secure-phase/validate-phase enabled, which gsd-autonomous itself does not call):

  HOOKS=\$(gsd_run loop render-hooks verify:post --raw)

For each active hook in HOOKS.activeHooks, run: Skill(skill=\"gsd-{ref.skill}\", args=\"{N}\")

CRITICAL — do NOT touch the shared planning ledgers yourself. Do not call gsd_run roadmap update-plan-progress, requirements mark-complete, windows append/waive/fixed, any state.*-mutating query, or transition.md's phase-complete step. Two agents doing that concurrently on separate branches is exactly what produces colliding WINDOWS.md row ids and colliding STATE.md keys — the coordinating session replays your phase's completion against the merged base AFTER your worktree is done, once, in a safe order. Just get the phase itself (discuss/plan/execute/review/teach/secure/validate) fully done and committed on your own branch.

Commit everything on your own worktree branch. Do NOT merge or push. Do NOT use --no-verify. If you hit a genuine operator-only decision, use AskUserQuestion; do not guess."
)
```

Record each dispatch for cleanup/bookkeeping parity with the existing per-plan worktree mechanism:

```bash
gsd_run worktree record-agent --manifest "$MANIFEST" --agent-id "phase-{N}" --path "{worktree_path_from_dispatch_result}" --branch "{branch_from_dispatch_result}" --base "$BASE_SHA"
```

> **ORCHESTRATOR RULE:** after dispatching, do not do any of this phase's work yourself. Wait for every agent to report back before proceeding to step 4.

</step>

<step name="mergeback">

## 4. Merge Back — One Phase At A Time, Structured Replay for the Shared Ledgers

Process completed phases in ascending phase number (a safe default; if this batch's own dependency graph from step 2 says otherwise — it shouldn't, per step 2's construction — use that order instead).

For each phase N's worktree branch:

**a. Try the cheap path first:**

```bash
git merge --ff-only "$PHASE_BRANCH"
```

If this succeeds, this phase is merged — proceed to the next phase. (This is common: the SAME thing happened for real between two of the four phases this design is based on — one phase-worktree happened to already contain another's commits.)

**b. If not fast-forward, separate the phase's own files from the four shared ledgers:**

```bash
CHANGED=$(git diff --name-only "$BASE_SHA".."$PHASE_BRANCH")
LEDGERS=".planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md .planning/WINDOWS.md"
```

Any changed path that is NOT one of the four ledgers and NOT inside `.planning/phases/**` for THIS phase's own slug, AND that also appears in another batch phase's own changed-path set, is a genuine independence-check failure from step 2 — **STOP and escalate** (`AskUserQuestion` or a written blocker); do not force a merge past this, it means step 2's eligibility analysis was wrong, which is a bug in this workflow, not something to paper over per-run.

Check out this phase's own non-ledger files directly (safe: per step 2, guaranteed disjoint from every other batch phase):

```bash
git checkout "$PHASE_BRANCH" -- $(printf '%s\n' "$CHANGED" | grep -vE '^\.planning/(ROADMAP|STATE|REQUIREMENTS|WINDOWS)\.md$')
git commit -m "merge(phase $N): non-ledger files from $PHASE_BRANCH"
```

**c. Replay the ledger changes as structured commands against the NOW-current branch — never a text merge:**

- **ROADMAP.md plan/progress state:** `gsd_run roadmap update-plan-progress "$N"`.
- **ROADMAP.md's own "Requirements: TBD" → real ID line**, if this phase assigned new requirement IDs inline (the pattern this workflow's own design session observed for unplanned phases without a matching REQUIREMENTS.md row): read the phase's OWN completed value with `git show "$PHASE_BRANCH":.planning/ROADMAP.md` and extract that one phase's `**Requirements**:` line; if it differs from the current (post step-c-roadmap) branch's own line for phase N, replace ONLY that one line, inside phase N's own uniquely-numbered section — never any other phase's section. This is a narrow, justified exception to "always use a structured command": no structured command exists for this specific edit today, and the edit is provably bounded to a single line this phase alone owns.
- **REQUIREMENTS.md**, only if this phase's own branch actually added rows there (check `git diff "$BASE_SHA".."$PHASE_BRANCH" -- .planning/REQUIREMENTS.md`; many projects — including the one this design is based on — keep an unplanned phase's requirement IDs inline in ROADMAP.md ONLY and never touch REQUIREMENTS.md at all, which is not an error): `gsd_run requirements mark-complete {ids}` for whatever IDs the diff shows being added/checked.
- **WINDOWS.md:** `git diff "$BASE_SHA".."$PHASE_BRANCH" -- .planning/WINDOWS.md` and extract every NEW row by its CONTENT (kind, phase, file, description) — deliberately ignoring the id that row carries on its own branch, since that id was allocated against a stale snapshot and may collide with another batch phase's own row. For each new row: `gsd_run windows append --kind "{kind}" --phase "{N}" --file "{file}" --description "{description}"` against the current (already-updated) branch, then `gsd_run windows waive/fixed` if the row's own final status on its branch was already `waived`/`fixed` rather than `open`. Appending fresh against the incrementally-updated base is what makes the id collision impossible by construction — proven directly: replaying two real historical rows that both independently claimed id 58 on their own branches, one after the other against a shared base, allocated ids 58 and 59 with zero collision.
- **STATE.md:** `gsd_run query phase.complete "$N"`, wrapped in a safety net — snapshot the frontmatter's top-level key set and file line count immediately before the call; after, assert (i) every key present before is still present, (ii) the line count did not shrink by more than a small, explicitly-justified bound. **As of this workflow's authoring, this call is measured to be destructive against a real, large STATE.md** (85 insertions / 2151 deletions observed against a byte-identical clone of the project this design is based on, with wrong-content fields like a stale unrelated `stopped_at` string) — track whether the sibling fix for that bug has landed; until it has, treat ANY trip of this safety net as a hard stop: `git checkout -- .planning/STATE.md`, then hand off to the coordinating session/operator with the before/after diff rather than committing a corrupted file.

**d. Run this project's own full test suite** (discover the real command from its Makefile/README/CI config — do not assume any specific test runner) as a safety gate before committing the merge. A failure here is a genuine cross-phase integration gap (two independent phases' changes interacting badly, even though their FILES never overlapped) — investigate and fix it the way you would any other bug (e.g. a new guard one phase added needs a correctly-derived exception-table row for something another phase's change legitimately introduced); do not loosen an assertion to force green, and escalate rather than guess if the fix isn't obviously safe.

**e. Commit** with a message disclosing exactly what was fast-forwarded, checked-out-directly, replayed-via-structured-command, or safety-net-tripped for this phase.

**f. Advance `BASE_SHA` to the new `HEAD`** before processing the next phase — every subsequent replay must operate on the fully up-to-date ledger state, not the original pre-batch snapshot.

</step>

<step name="loop">

## 5. Loop or Stop

After every eligible phase in this batch is merged, re-run the eligibility computation from step 2 — a phase excluded earlier for depending on one of THIS batch's phases may now qualify. If a new batch is available, ask the user (`AskUserQuestion`: "Run the next batch" / "Stop here") rather than chaining automatically forever.

When nothing eligible remains, report a final summary: which phases merged, in what order, any escalations raised along the way, and any exclusions still standing with their reasons. **Do not chain into milestone-level close-out** (`/gsd-audit-milestone`, `/gsd-complete-milestone`) — that is a separate, deliberate operator action, matching `/gsd-autonomous`'s own existing convention of never taking it automatically either.

</step>

</process>

<success_criteria>
- [ ] Eligibility re-derives dependencies from the raw `**Depends on:**` paragraph text, not the JSON's naive substring `dep_phases` field — a "Nothing new... (independent of Phase N)" paragraph is never misread as a real dependency on Phase N
- [ ] A batch of fewer than 2 eligible phases is never dispatched in parallel without confirming with the user first
- [ ] Every dispatched phase agent runs inside `isolation="worktree"`, never touches the shared ledgers itself, and is explicitly told not to
- [ ] All eligible phases for a batch are dispatched in a single message
- [ ] Merge-back tries `--ff-only` first before any structured replay
- [ ] ROADMAP.md/REQUIREMENTS.md/WINDOWS.md are never text-merged — always replayed via structured `gsd-tools` commands (or, for the one documented ROADMAP Requirements-line exception, a narrowly-scoped single-line replace inside the phase's own section only)
- [ ] WINDOWS.md row ids are always allocated fresh against the current, already-merged base — never carried over from a phase-branch's own stale id
- [ ] STATE.md's `phase.complete` call is wrapped in a safety net that reverts and escalates rather than commits on any detected key loss or disproportionate content loss
- [ ] The full test suite runs as a gate before every merge commit
- [ ] An unexpected file conflict outside the four known ledgers and the phase's own directory halts and escalates rather than forcing a merge
- [ ] No automatic milestone-level close-out after the batch completes
</success_criteria>
