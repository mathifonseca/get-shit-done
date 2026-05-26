# Fork: SDLC-Aligned GSD

This is a personalized fork of [GET SHIT DONE](https://github.com/gsd-build/get-shit-done) by Lex Christopherson / TACHES.

## Why this fork exists

The upstream GSD project is an excellent meta-prompting system for AI-assisted development. This fork integrates a comprehensive [Software Development Lifecycle methodology](https://github.com/mathifonseca/dotfiles/blob/main/.claude/sdlc.md) (current: v1.2.6) that adds opinionated defaults around quality gates, testing discipline, issue tracking, and verification rigor.

The upstream project is designed to work for everyone. This fork is designed to work for me specifically — and for anyone who shares similar engineering values.

## External alignment

Fork patterns recorded against independently-published industry guidance so the fork's design intent is auditable against external references. Each row notes whether it validates a pre-existing fork pattern or introduces a new one informed by the cited source.

| Fork pattern | Aligned with | Direction |
|--------------|--------------|-----------|
| `/gsd-explore` vs `/gsd-execute-phase` split (exploration agents distinct from editing agents) | Anthropic, "How Claude Code Works in Large Codebases" (2026-05-14) — "subagents split exploration from editing" as a load-bearing pattern for large-codebase work | Validates existing |
| Path-scoped `.claude/rules/` scaffold (`workflow.scaffold_rules`) | Same Anthropic article — "skills scoped to specific paths so they only activate in the relevant part" | Validates existing |
| Spec-outcome enforcement + adversarial validation | Spec-Driven Development (Álvaro Moya / LIDR) + general agent-skeptical practitioner consensus | Validates existing |
| `gsd-ui-researcher` consults installed platform-API skills when modal/popover/anchored/container-responsive UI is in scope (`<platform_api_skills>` block, `Step 5` trigger) | Chrome, "Modern Web Guidance" (preview, 2026-05-26) — distributes web-platform best practices (`<dialog>`, Popover API, CSS Anchor Positioning, container queries) as Claude Code skills; complements GSD's 6 design-rigor pillars without altering them | Introduces new |

## What's different

### Philosophy changes

| Principle | Upstream | This Fork |
|-----------|----------|-----------|
| **Tests** | Tests are part of execution | Tests are **completion contracts** — read-only during execution, agent fixes implementation not tests |
| **Verification** | Single verifier agent | **Adversarial validation** — finder + critic + referee agents with competing incentives |
| **Dead code** | Not scanned | **Context pollution scanning** — commented-out code, orphaned exports, dead flags flagged during verification |
| **Planning** | Detailed task specs | **Spec the outcome, not the process** — plans describe what success looks like, executor figures out the how; spec is source of truth, code/tests/migrations are living projections of it |
| **Worktree isolation** | Branch per worktree, not enforced | **One worktree per ticket** — `execute-phase/steps/per-plan-worktree-gate.md` enforces isolation; `workflow.use_worktrees` toggle; documented in sdlc.md §2 |
| **Shared team context** | Individual context discipline | **Prompt and seniority independence** — `.claude/rules/` scaffold (`workflow.scaffold_rules`) ensures any developer's agent runs against the same conventions; junior devs get senior-quality context layer; documented in sdlc.md §18 |
| **Discussion** | 4 questions per area, then ask to continue | **Exhaust all questions** per area before moving on (configurable via `workflow.questions_per_area`) |
| **Visual verification** | Manual UAT | **Playwright tests as first-class** — screenshots as automated verification evidence |
| **Shipping** | Manual PR creation | **Integrated PR workflow** — issue tracking, branch naming, preflight checks, auto PR creation |
| **Project init** | Basic config questions | **Full project integration** — issue tracker, branch conventions, PR templates, CI commands, Makefile/pre-commit scaffolding |
| **Phase completion** | Implicit "done" | **Definition of Done checklist** — tests, CI, CLAUDE.md, docs, issue tracker |
| **During execution** | Single executor | **Edge Case Hunter** — parallel review agent catches boundary conditions and failure modes in real-time alongside executors |
| **Before execution** | Plan-checker only | **Devil's Advocate** — challenges architectural choices, surfaces risks, forces plan improvement before execution begins |
| **Quality gates** | No regression checks | **Ratchet effect** — coverage, type strictness, lint rules, and CI steps can never regress |
| **Agent discipline** | Trust agents to follow instructions | **Anti-rationalization engineering** — red flags lists and excuse/reality tables prevent agents from rationalizing shortcuts |
| **Completion claims** | Self-check after SUMMARY | **Verification discipline** — agents must run commands and cite output before saying "done" or "tests pass" |
| **Code review** | Single-pass review | **Two-stage review** — spec compliance (does it match PLAN.md?) then code quality (bugs, security, patterns) |
| **Debugging** | General restart guidance | **3-fix architecture escalation** — after 3 failed fixes, agents must stop and surface an architectural concern |
| **Design capture** | Decisions in CONTEXT.md only | **DESIGN.md artifact** — frozen design spec (architecture, components, contracts, NFRs) consumed by planner and researcher |
| **Research** | Asks whether to research | **Auto-research** — skips the question when enabled, goes straight to researching |
| **UI design** | Asks whether to generate UI-SPEC | **Auto-UI-SPEC** — generates design contract automatically for frontend phases |
| **Shipping** | Separate preflight and ship | **Unified pipeline** — ship invokes preflight first; preflight gains `--ship` flag for full push+PR |
| **Key decisions** | Stay in CONTEXT.md | **Auto-propagated to CLAUDE.md** — architectural decisions captured from discussion and execution |
| **Project scaffolding** | Config only | **Full scaffolding** — preflight.yaml, .claude/rules/, Makefile, pre-commit hooks |
| **Migrations** | Not checked | **Migration safety** — warns if schema changed without migration, checks for downgrade paths |

### New config keys

All default to `true` (opinionated — the upstream would likely default most to `false`):

| Key | What it does |
|-----|-------------|
| `workflow.test_contracts` | Tests are read-only during execution |
| `workflow.adversarial_validation` | Three-layer adversarial review: Devil's Advocate (planning), Edge Case Hunter (execution), finder+critic+referee (verification) |
| `workflow.dead_code_scan` | Scan for dead code / context pollution |
| `workflow.playwright_verification` | Playwright tests + screenshots as verification evidence |
| `workflow.definition_of_done` | DoD checklist at phase completion |
| `workflow.preflight_on_verify` | Run preflight before PR creation |
| `workflow.spec_outcome_enforcement` | Planner specs outcomes, not step-by-step |
| `workflow.scaffold_makefile` | Scaffold Makefile during new-project |
| `workflow.scaffold_precommit` | Scaffold pre-commit hooks during new-project |
| `workflow.update_claude_md_on_complete` | Warn if CLAUDE.md not updated after phase |
| `workflow.scaffold_preflight` | Scaffold .claude/preflight.yaml based on detected stack |
| `workflow.scaffold_rules` | Scaffold .claude/rules/ with domain-scoped rule files |
| `workflow.questions_per_area` | `"all"` by default (upstream: `4`) |
| `project.issue_tracker` | Issue tracker integration (GitHub/Linear/Jira) |
| `project.issue_prefix` | Issue prefix for branch/PR naming |
| `project.pr_title_template` | PR title convention |
| `project.pr_body_requires_issue` | Require `Closes PREFIX-NN` in PR body |
| `project.ci_commands` | CI commands to run before PR (auto-detected) |
| `workflow.two_stage_review` | Split code review into spec compliance + code quality passes |
| `workflow.verification_discipline` | Require fresh evidence before completion claims |
| `workflow.design_spec` | Generate DESIGN.md during discuss-phase for architectural phases |

### Command naming

GSD source uses **colon syntax** (`/gsd:execute-phase`) in all Claude-facing files — upstream's canonical authored form, enforced by `tests/bug-2543-gsd-slash-namespace.test.cjs` (#3443). The repo is authored for Claude command registration under `.claude/commands/gsd/`. **Do not** rewrite source refs to hyphen — it breaks the invariant test and fights every upstream sync. (`scripts/fix-slash-commands.cjs` exists to re-normalize stray `/gsd-<cmd>` refs *back* to colon, not the other way around.)

The installer (`bin/install.js`) converts at install time, depending on target:
- **Claude as skills** (this fork's default install, `SlashCommand → skill`): skills are named `gsd-<cmd>` (hyphen, #2808), so the user invokes **`/gsd-execute-phase`**.
- **Non-Claude runtimes** (Copilot, Cursor, Antigravity, …): source `/gsd:<cmd>` is rewritten to `/gsd-<cmd>` (`replace(/gsd:/, 'gsd-')`).

So in an installed fork you type the **hyphen** form even though the source (correctly) uses colon. When recommending commands to a fork user, use `/gsd-<command>`; when editing repo source, keep `/gsd:<command>`.

### Files modified from upstream

**Agents:**
- `agents/gsd-executor.md` — test contracts, deviation rule constraints, Makefile preference, anti-rationalization guard, verification discipline
- `agents/gsd-verifier.md` — dead code scanning, ratchet effect enforcement, migration safety checks, verification discipline
- `agents/gsd-planner.md` — outcome-focused task specs, one-sentence objectives, anti-rationalization in scope reduction
- `agents/gsd-debugger.md` — 3-fix architecture escalation rule
- `agents/gsd-code-reviewer.md` — two-stage review (spec compliance + code quality)
- `agents/gsd-phase-researcher.md` — DESIGN.md consumption as upstream constraint

**Workflows:**
- `workflows/discuss-phase.md` — questions_per_area config, exhaust-then-move-on behavior, key decisions propagation to CLAUDE.md
- `workflows/autonomous.md` — same discuss changes
- `workflows/verify-work.md` — adversarial validation step
- `workflows/execute-phase.md` — Playwright verification, Definition of Done, PR workflow, key decisions from execution, Edge Case Hunter
- `workflows/discuss-phase.md` — DESIGN.md generation step, commit includes DESIGN.md
- `workflows/code-review.md` — passes PLAN.md to reviewer for two-stage review
- `workflows/ship.md` — invokes preflight before shipping
- `workflows/plan-phase.md` — Devil's Advocate review after plan-checker passes, auto-select research and UI-SPEC when config enables them
- `workflows/new-project.md` — project integration questions (issue tracker, branches, CI), scaffolding (Makefile, pre-commit, preflight.yaml, .claude/rules/)
- `workflows/complete-milestone.md` — automated retrospective data (verification health, quality gates, deviation trends)
- `workflows/update.md` — fork guard prevents accidental npm overwrite
- `workflows/settings.md` — all new config keys in schema

**New files:**
- `commands/gsd/sdlc-audit.md` — `/gsd-sdlc-audit` command registration
- `workflows/sdlc-audit.md` — 20-check, 4-tier project audit workflow
- `FORK.md` — this file
- `RESEARCH.md` — competitive landscape analysis (Spec Kit, OpenSpec, BMAD)

**Hooks:**
- `hooks/gsd-check-update.js` — fork detection, upstream version awareness
- `hooks/gsd-statusline.js` — fork-aware update notification

**Config:**
- `get-shit-done/bin/lib/config.cjs` — new keys, defaults, project section
- `get-shit-done/templates/config.json` — template defaults

**Docs:**
- `docs/CONFIGURATION.md` — all new keys documented
- `docs/workflow-discuss-mode.md` — updated description
- `README.md` — "Why this fork?" section, "Getting Started" guide, config table
- `LICENSE` — added fork copyright line

## Upstream tracking

This fork tracks the upstream repo at `gsd-build/get-shit-done`. The `upstream` remote is configured and the strategy is **merge with conflict resolution** — upstream releases are merged, conflicts are resolved by keeping both sides (upstream's new features plus fork additions).

### How to sync

```bash
cd ~/code/get-shit-done
git fetch upstream
git log upstream/main --oneline -20    # Review what's new
git merge upstream/main                # Merge (or cherry-pick specific commits)
# Resolve conflicts: keep BOTH sides — upstream features + fork additions
npm run build:hooks                    # Rebuild hooks to dist/
node bin/install.js --claude --global  # Reinstall
rm -f ~/.cache/gsd/gsd-update-check.json  # Clear update cache
```

### Important: build before install

The installer copies hooks from `hooks/dist/`, not `hooks/`. Always run `npm run build:hooks` before `node bin/install.js` — otherwise edited hooks won't be deployed.

### Update notifications

The fork-aware statusline shows `⬆ upstream X.Y.Z available — cherry-pick from upstream` (cyan) instead of the standard `/gsd-update` prompt. Running `/gsd-update` is blocked — it would overwrite fork changes with the upstream npm package.

### Sync history

| Date | Upstream Version | Commit | Notes |
|------|-----------------|--------|-------|
| 2026-04-06 | v1.32.0 | `06fd18d` | 8 conflicts resolved. Added: code review, global learnings, execution context profiles, /gsd-explore, /gsd-import, /gsd-undo, stall detection, prompt injection improvements, Node 24 minimum, /gsd: → /gsd- rename |
| 2026-04-07 | v1.34.2 | `8bee55a` | 1 conflict resolved (CONFIGURATION.md). Added: gates taxonomy, reapply-patches verification, Node 22 restored, detectConfigDir fix, hooks packaging fix, backlog preserve fix, Windsurf config dir. Migrated remaining /gsd: refs to /gsd- in fork files |
| 2026-04-15 | v1.36.0 | `d650d34` | 9 conflicts resolved across agents (executor, planner), config (config.cjs, config.json, CONFIGURATION.md), workflows (plan-phase, verify-work), and hooks (check-update, statusline). Added: `/gsd-graphify` knowledge graph, SDK Phase 1 (`gsd-sdk query`), TDD pipeline mode + `--tdd` flag, `gsd-pattern-mapper` agent, debug session manager + TDD gate, project skills awareness across 9 agents, seed scanning in new-milestone, `plan_bounce` + `cross_ai_execution` config, stale-hooks `.sh` false-positive fixes (#2209–#2241), worker-file refactor of gsd-check-update. Fork-specific: plan-bounce renumbered to 12.5 (Devil's Advocate moved to 12.6), `is_fork` detection ported into new worker, dev-install stale-hooks warning preserved for non-forks, TEXT_MODE fallback added to sdlc-audit.md |
| 2026-04-19 | v1.37.1 | `db1d0f7` | 4 conflicts resolved (gsd-debugger, autonomous, discuss-phase, new-project). Added: `/gsd-spike`, `/gsd-sketch`, `/gsd-spec-phase` workflows/commands, `/gsd-ingest-docs` staging, read-injection-scanner PostToolUse hook, SDK Phase 2 caller migration (workflows/agents now invoke `gsd-sdk query`), debugger philosophy + autonomous smart-discuss extracted to shared references, parallel discuss across independent phases (`--all` flag), `/gsd-progress --forensic` integrity audit, agent size budget enforcement, pattern-mapper redundant-read prevention, `inbox.md` command, skills discovery contract, session-runner refactor. Stance shift: fork now accepts the SDK — built from in-repo `sdk/` via `npm install && npm run build && npm link` so `gsd-sdk` resolves on PATH (shimming ~100 upstream call sites was the higher-risk alternative). Fork-specific: `architecture_escalation` cross-ref ported into `references/debugger-philosophy.md`; fork's `questions_per_area` config driver + "all questions needed for thorough scoping" wording ported into `references/autonomous-smart-discuss.md`; ARCHITECTURE.md counts bumped to 80 commands / 77 workflows; plan_bounce (12.5), Devil's Advocate (12.6), `is_fork` detection, statusline fork-awareness, and TEXT_MODE fallback all verified intact post auto-merge |
| 2026-04-19 | v1.38.0 | `4853ca6` | 1 conflict resolved (ARCHITECTURE.md counts). Added: `/gsd-ingest-docs` workflow + command (absorb external docs with conflict detection), `/gsd-ultraplan-phase [BETA]` (offload plan phase to Claude Code ultraplan), `gsd-doc-classifier` + `gsd-doc-synthesizer` agents, `doc-conflict-engine` shared reference, installer auto-installs `@gsd-build/sdk` so `gsd-sdk` resolves on PATH (#2385), installer builds SDK from in-repo `sdk/` source instead of stale npm package, `--sdk` / `--no-sdk` flag handling, release merge-back PR step made non-fatal (#2389). Fork-specific: ARCHITECTURE.md counts reconciled to 82 commands / 79 workflows (upstream's 81/78 was off-by-one from their own pre-merge count); all other fork preservation points (plan_bounce 12.5, Devil's Advocate 12.6, `is_fork`, statusline fork-awareness, TEXT_MODE) auto-merged cleanly |
| 2026-04-20 | v1.38.1 | `abba0d3` | Zero conflicts — clean auto-merge via ORT. Narrow hotfix scope kept away from fork-customized agents/workflows. Added: `fix(install): fatal SDK install failures + CI smoke gate` (#2439) so a broken SDK install fails loudly instead of silently, `tests/bug-2439-set-profile-gsd-sdk-preflight.test.cjs` + `tests/gsd-sdk-query-registry-integration.test.cjs` regression coverage, `fix(sdk): register init.ingest-docs handler and add registry drift guard` (#2442), `.github/workflows/install-smoke.yml` CI job, `fix(install): template bare .claude hook paths for non-Claude runtimes`, `fix(set-profile): guard gsd-sdk invocation with command -v pre-flight` + `/gsd-set-profile` hyphen fix. All fork preservation points (plan_bounce 12.5, Devil's Advocate 12.6, `is_fork`, statusline fork-awareness, TEXT_MODE, `questions_per_area`) untouched by merge |
| 2026-04-27 | v1.38.5 | `d8fddc33` | 8 conflicts resolved (`package.json`, `package-lock.json`, `docs/ARCHITECTURE.md`, `get-shit-done/bin/lib/config.cjs`, `get-shit-done/workflows/{discuss-phase,execute-phase,settings}.md`, `tests/planner-decomposition.test.cjs`). Adopted upstream's authoritative-roster approach in ARCHITECTURE.md (counts now point at `docs/INVENTORY.md` instead of fork-maintained numbers). Adopted upstream's extracted `get-shit-done/bin/lib/config-schema.cjs` (#2653) and ported all 21 fork-specific config keys (`workflow.questions_per_area`, `test_contracts`, `adversarial_validation`, `dead_code_scan`, `playwright_verification`, `definition_of_done`, `preflight_on_verify`, `spec_outcome_enforcement`, `scaffold_makefile`, `scaffold_precommit`, `scaffold_preflight`, `scaffold_rules`, `update_claude_md_on_complete`, `two_stage_review`, `verification_discipline`, `design_spec`, plus 5 `project.*` keys) into both the new `config-schema.cjs` and its SDK mirror `sdk/src/query/config-schema.ts` (CJS↔SDK parity guard #2653 now green). Kept fork's `playwright_verification` step + upstream's new `codebase_drift_gate` step (#2003) as adjacent siblings in execute-phase.md. Kept fork's `project.*` settings.md block + upstream's new `intel`/`graphify` blocks. Kept fork's higher `PLANNER_EXTRACTED_LIMIT` (50K vs upstream 48K) since fork additions still need the room. Added (v1.38.4): `fix(sdk): use installed agent/workflow prompts instead of stripped-down bundled copies` (#377a6d2) — installer now ships richer prompts that are read at runtime instead of stale bundled stubs (deletes `sdk/prompts/` directory entirely), `fix(sdk): fix executor plan loading, plan ID derivation, and verification outcome parsing` (#25d97638), `fix(sdk): prevent interactive tool calls in headless self-discuss mode` (#f0953dec). Added (v1.38.5): `fix(sdk): pass phaseDir to executor prompt so SUMMARY.md lands in .planning/` (#2fafbd27), `fix(#2722): forensics gh commands pin --repo gsd-build/get-shit-done` (#2723), `fix(ci): remove stale SDK-variant tests for files deleted in 377a6d2` (#2725). Major upstream restructuring: `workflows/discuss-phase/` decomposed into thin dispatcher + per-mode files (`modes/{advisor,all,analyze,auto,batch,chain,default,power,text}.md`) + templates (`templates/{checkpoint.json,context.md,discussion-log.md}`), `workflows/execute-phase/steps/{codebase-drift-gate,post-merge-gate}.md` extracted, `workflows/discuss-phase-assumptions.md` + `workflows/edit-phase.md` + `workflows/plan-review-convergence.md` + `workflows/sync-skills.md` + `workflows/settings-{advanced,integrations}.md` + `workflows/graduation.md` added, `commands/gsd/{edit-phase,plan-review-convergence,settings-advanced,settings-integrations,sync-skills}.md` registered. New SDK query handlers (`audit-open`, `check-auto-mode`, `check-completion`, `check-decision-coverage`, `check-gates`, `check-ship-ready`, `check-verification-status`, `config-gates`, `config-schema`, `decisions`, `detect-custom-files`, `detect-phase-type`, `docs-init`, `frontmatter-array`, `init-progress-precedence`, `normalize-query-command`, `phase-list-queries`, `phase-ready`, `plan-task-structure`, `profile-extract-messages`, `profile-output`, `profile-questionnaire-data`, `profile-sample`, `profile-scan-sessions`, `requirements-extract-from-plans`, `roadmap-update-plan-progress`, `route-next-action`, `schema-detect`, `skill-manifest`, `state-project-load`, `sub-repos-root`). New scripts (`fix-slash-commands.cjs`, `gen-inventory-manifest.cjs`, `lint-no-source-grep.cjs`, `verify-tarball-sdk-dist.sh`). New top-level docs `docs/INVENTORY.md` + `docs/INVENTORY-MANIFEST.json` (now the authoritative roster). Test count grew from ~3500 to 5676 — fork-vs-upstream tensions persist (workflow size budgets, INVENTORY counts, agent line-count budget, /gsd-sdlc-audit docs, gsd-planner reachability_check, prompt injection scan, workflow files cleanliness — 11 failures pre-existing fork customizations, 5665 passing). All fork preservation points (plan_bounce 12.5, Devil's Advocate 12.6, `is_fork`, statusline fork-awareness, TEXT_MODE, `questions_per_area`) intact post-merge |
| 2026-04-22 | v1.38.3 | `6f61a03` | Zero conflicts — clean auto-merge via ORT. Hotfix-only scope limited to spike/sketch workflows, which the fork had not customized. Added (v1.38.2): `fix: sync spike/sketch workflows with upstream skill v2 improvements` — `/gsd-spike` frontier mode (no-arg or `frontier` proposes integration + frontier spikes), depth-over-speed principle, CONVENTIONS.md awareness, Requirements section in MANIFEST, per-spike re-ground step, Investigation Trail in README template, per-spike research briefing with approach comparison table; `/gsd-sketch` frontier mode + spike-context loading so mockups ground in real data shapes; `/gsd-spike-wrap-up` emits CONVENTIONS.md, reference files use implementation blueprint format (Requirements / How to Build It / What to Avoid / Constraints), SKILL.md includes requirements section, next-steps route to `/gsd-spike frontier`; `/gsd-sketch-wrap-up` next-steps route to `/gsd-sketch frontier`. Added (v1.38.3): `fix: spike workflow defaults to interactive UI demos, not stdout` — step 8b now prefers a simple HTML page/web UI by default, falling back to stdout only for pure fact-checking (benchmarks, binary yes/no), mirroring upstream spike-idea skill constraint #3. All fork preservation points (plan_bounce 12.5, Devil's Advocate 12.6, `is_fork`, statusline fork-awareness, TEXT_MODE, `questions_per_area`) untouched by merge |
| 2026-05-05 | v1.40.0 | `60b7e805` | 4 conflicts resolved (`README.md`, `docs/CONFIGURATION.md`, `get-shit-done/references/autonomous-smart-discuss.md`, `get-shit-done/workflows/discuss-phase.md`). Bundled v1.39.0 → v1.40.0 (140 first-parent commits, 595 files, +40k/-4.7k). README.md / CONFIGURATION.md: kept all 21 fork-specific config keys and added upstream's new `workflow.worktree_skip_hooks` (#2924) and `workflow.build_command` keys to the toggle tables — adopted fork's `/gsd-code-review-fix` wording over upstream's `/gsd-code-review --fix` since the fork still ships separate commands. autonomous-smart-discuss.md / discuss-phase.md: kept fork's `gsd-tools.cjs` commit invocation over upstream's `gsd-sdk query commit --files` (matches fork stance: tools, not SDK). Added (v1.39.0): `feat(sdk): durable planning runtime` (#2898) — manifest-backed routing seam + family adapters, `feat(#2792)` namespace meta-skills + keyword-tag descriptions + context utilization guard, `refactor(#2790)` consolidates 86 gsd-* skills to 59, `feat(#2833)` phase-lifecycle status-line read-side, `fix(#2872)` auto-close PRs missing issue-link keyword, `chore(#2828)` canary release workflow, `feat(#2789)` 100-char skill description budget, `fix(#2829)` gsd-sdk resolvable in local-mode installs, `fix(#2851)` absolute path for bare gsd-tools invocations, drift-enforcement CI for alias freshness (#2910), golden parity matrix expansion (#2909), Hermes runtime support reverted (#2849). Added (v1.39.1 → v1.39.2): `fix(#2979)` absolute node path in managed hooks for GUI/minimal-PATH runtimes (#3002), `fix(#2990)` gsd-code-fixer worktree attaches to new branch (#3001), `fix(#3010)` post-install message uses `/gsd-update --reapply` (#3012), `fix(#3011)` actionable SDK-not-on-PATH diagnostic (#3014), `fix(#3017)` codex SessionStart hook uses absolute node (#3022), `fix(#3018)` codex adapter must stop and ask, not silently default (#3027), `fix(#3019)` query --help reaches handler (#3026), `fix(#3020)` probe user shell PATH at install-time (#3028), `fix(#3029, #3034)` scrub stale `/gsd-code-review-fix` and `/gsd-plan-milestone-gaps` refs (#3038), `fix(#3037)` skip Gemini local commands/gsd when global GSD present (#3041). Added (v1.40.0): `feat(plan-phase): --research-phase flag` (#3045), `feat(hooks)` opt-in SessionStart update banner for non-statusline users (#3035), `feat(#3024)` dynamic routing with failure-tier escalation (#3031), `feat(#3023)` per-phase-type model map in `.planning/config.json` (#3030), `feat(#2995)` post-install path audit for workflow-invoked scripts (#2996), `feat(#2982)` no-source-grep lint catches var-binding readFileSync.includes() (#2985), `feat(#2975)` adopt changeset-fragment workflow to eliminate CHANGELOG conflicts (#2978), `fix(#2997)` mask SECRET_CONFIG_KEYS in SDK config-set/get and init responses (#2999), `fix(#2998)` populate gsd-pristine/ from install transform pipeline (#3004), `fix(#2992)` deterministic latest-version check (#2993), `fix(#2994)` ship verify-reapply-patches.cjs to user installs (#3000), `fix(#2973)` `/gsd-profile-user` writes to skills/ not legacy commands/gsd/ (#3003), test mutation-killer suite for config-schema.cjs (#3005), test migration to typed-IR assertions for 8 files (#3016), `docs(#3025)` MCP tool schema as a context-budget concern (#3032), `docs(out-of-scope)` records #2756 (temporal-context) and #2758 (agent-template-rendering) decisions, `docs(#2840)` issue-driven orchestration guide (#3036). Pre-existing leftover: stray `\|\|\|\|\|\|\| a42d5db7` marker at `get-shit-done/workflows/discuss-phase.md:620` from a prior incomplete merge — present in `9472f343` (last sync) but only surfaced now while inspecting conflict markers; out of scope for this sync, fix in a follow-up. All fork preservation points (plan_bounce 12.5, Devil's Advocate 12.6, `is_fork`, statusline fork-awareness, TEXT_MODE, `questions_per_area`, `playwright_verification`, `PLANNER_EXTRACTED_LIMIT` 50K) verified intact post-merge |
| 2026-05-15 | v1.43.0-rc1 | _this commit_ | 2 conflicts resolved (`get-shit-done/bin/lib/config-schema.cjs`, `sdk/src/query/config-schema.ts`). Adopted upstream's Phase 2 #3536 schema manifest refactor — both files become thin adapters that source `VALID_CONFIG_KEYS` from `sdk/shared/config-schema.manifest.json` via the generated `configuration.generated.cjs`. Migrated all 21 fork-specific config keys (`workflow.questions_per_area`, `test_contracts`, `adversarial_validation`, `dead_code_scan`, `playwright_verification`, `definition_of_done`, `preflight_on_verify`, `spec_outcome_enforcement`, `scaffold_makefile`, `scaffold_precommit`, `scaffold_preflight`, `scaffold_rules`, `update_claude_md_on_complete`, `two_stage_review`, `verification_discipline`, `design_spec`, plus 5 `project.*` keys) into the manifest JSON. Ran `node sdk/scripts/gen-configuration.mjs` to regenerate the CJS adapter. Auto-merge fixups: `docs/CONFIGURATION.md` updated to `/gsd-code-review --fix` (was retired `/gsd-code-review-fix`). Test debt cleared along the way: ran `node scripts/fix-slash-commands.cjs` (17 retired `/gsd-<cmd>` refs auto-rewritten to `/gsd:`), renamed verifier `Step 7c: Ratchet Effect Enforcement` → `Step 7-Ratchet` and `Step 7d: Probe Execution` → `Step 7c` (matches upstream bug-3321 test contract), promoted `gsd-verifier` from LARGE → XL agent tier (verification_discipline + dead-code scan + ratchet + probes), added `sdlc-audit` to `commands/COMMANDS.md` / `docs/INVENTORY.md` / `help.md` / `audit_review` cluster, regenerated `docs/INVENTORY-MANIFEST.json`, bumped fork-side size budgets with rationale: workflow XL 1800→2100, workflow DEFAULT 1000→1200, `PLANNER_EXTRACTED_LIMIT` 50K→55K, `reachability-check` 50000→55000, `DISCUSS_PHASE_TARGET` 500→1200. Key features (v1.43.0-rc1): `feat(3536)` Configuration Module via shared manifests + generator (Phase 2 of #3524), `feat(3347)` graphify auto-update hook, `feat(3541)` installer migration prompt user resolution, `feat(3542)` executor git stash prohibition, `feat(3544)` workstream inventory builder generator, durable runtime-bridge-sync module, configuration-generator + project-root-generator + workstream-inventory-builder-generator test coverage. All fork preservation points intact post-merge. |
| 2026-05-15 | v1.42.2 | `e6662eda` | 11 conflicts resolved (`README.md`, `agents/gsd-planner.md`, `agents/gsd-verifier.md`, `docs/CONFIGURATION.md`, `get-shit-done/bin/lib/config-schema.cjs`, `get-shit-done/templates/config.json`, `get-shit-done/workflows/complete-milestone.md`, `get-shit-done/workflows/new-project.md`, `get-shit-done/workflows/settings.md`, `hooks/gsd-statusline.js`, `sdk/src/query/config-schema.ts`). Bundled v1.41.0 → v1.42.2 (414 commits). gsd-planner.md: kept DESIGN.md cat line (fork) over upstream's stale `/gsd:` naming. gsd-verifier.md: kept fork's Step 7c (Ratchet Effect Enforcement) + added upstream's probe execution as Step 7d (both preserved). CONFIGURATION.md: kept fork's Project Integration section + added upstream's new Code Quality and Ship Settings sections. config-schema.cjs + sdk/src/query/config-schema.ts: kept 21 fork-specific config keys + added upstream's `resolve_model_ids` key + new `RUNTIME_STATE_KEYS` set (#3162). config.json template: kept fork's `project` block + added upstream's `ship.pr_body_sections` block. complete-milestone.md: kept fork's retrospective checklist items + correct `/gsd-` naming (upstream had stale `/gsd:` refs). new-project.md: kept fork's Round 3 (Project Integration) + Round 4 (Scaffolding) + added upstream's PR body onboarding paragraph; merged fork's gsd-tools.cjs invocation with upstream's new `ship.pr_body_sections` JSON; kept fork's preflight/rules checklist + correct `/gsd-discuss-phase 1` naming. settings.md: kept fork's `branch_pattern` + upstream's `quick_branch_template` + new `create_tag` key. gsd-statusline.js: kept fork-aware `is_fork` notification (cyan "⬆ upstream X.Y.Z available — cherry-pick from upstream") over upstream's stale `/gsd:update` naming. README.md: kept fork's detailed workflow agents table (includes 21 fork config keys visible at a glance). Key features (v1.41.0+v1.42.x): `feat(3347)` auto-update knowledge graph after main-hook trigger; `feat(3555)` executeForCJS bridge; `feat(3530)` STATE.md Document Module via generator (Phase 1 of #3524); fallow structural pre-pass for code-review; `ship.pr_body_sections` custom PR body sections; `resolve_model_ids` for non-Claude runtimes; `RUNTIME_STATE_KEYS` separation for internal workflow-written keys; Probe Execution step in verifier (Step 7d). All fork preservation points (plan_bounce 12.5, Devil's Advocate 12.6, `is_fork`, statusline fork-awareness, TEXT_MODE, `questions_per_area`, `playwright_verification`, 21 fork config keys in config-schema.cjs + SDK mirror, `PLANNER_EXTRACTED_LIMIT` 50K) verified intact post-merge. |

### Pending upstream (not yet merged)

_None — fork is current as of v1.43.0-rc1 (latest tag as of 2026-05-15). Upstream main is 31 commits past the rc; next stable is v1.43.0._

## Divergence point

This fork diverged from upstream at commit `2f7f317` (2026-04-03), tagged as `fork-divergence-point`. To see the full delta:
```bash
git diff fork-divergence-point...HEAD
```
