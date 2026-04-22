# Fork: SDLC-Aligned GSD

This is a personalized fork of [GET SHIT DONE](https://github.com/gsd-build/get-shit-done) by Lex Christopherson / TACHES.

## Why this fork exists

The upstream GSD project is an excellent meta-prompting system for AI-assisted development. This fork integrates a comprehensive [Software Development Lifecycle methodology](https://github.com/mathifonseca/dotfiles/blob/main/.claude/sdlc.md) that adds opinionated defaults around quality gates, testing discipline, issue tracking, and verification rigor.

The upstream project is designed to work for everyone. This fork is designed to work for me specifically — and for anyone who shares similar engineering values.

## What's different

### Philosophy changes

| Principle | Upstream | This Fork |
|-----------|----------|-----------|
| **Tests** | Tests are part of execution | Tests are **completion contracts** — read-only during execution, agent fixes implementation not tests |
| **Verification** | Single verifier agent | **Adversarial validation** — finder + critic + referee agents with competing incentives |
| **Dead code** | Not scanned | **Context pollution scanning** — commented-out code, orphaned exports, dead flags flagged during verification |
| **Planning** | Detailed task specs | **Spec the outcome, not the process** — plans describe what success looks like, executor figures out the how |
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
| 2026-04-22 | v1.38.3 | `6f61a03` | Zero conflicts — clean auto-merge via ORT. Hotfix-only scope limited to spike/sketch workflows, which the fork had not customized. Added (v1.38.2): `fix: sync spike/sketch workflows with upstream skill v2 improvements` — `/gsd-spike` frontier mode (no-arg or `frontier` proposes integration + frontier spikes), depth-over-speed principle, CONVENTIONS.md awareness, Requirements section in MANIFEST, per-spike re-ground step, Investigation Trail in README template, per-spike research briefing with approach comparison table; `/gsd-sketch` frontier mode + spike-context loading so mockups ground in real data shapes; `/gsd-spike-wrap-up` emits CONVENTIONS.md, reference files use implementation blueprint format (Requirements / How to Build It / What to Avoid / Constraints), SKILL.md includes requirements section, next-steps route to `/gsd-spike frontier`; `/gsd-sketch-wrap-up` next-steps route to `/gsd-sketch frontier`. Added (v1.38.3): `fix: spike workflow defaults to interactive UI demos, not stdout` — step 8b now prefers a simple HTML page/web UI by default, falling back to stdout only for pure fact-checking (benchmarks, binary yes/no), mirroring upstream spike-idea skill constraint #3. All fork preservation points (plan_bounce 12.5, Devil's Advocate 12.6, `is_fork`, statusline fork-awareness, TEXT_MODE, `questions_per_area`) untouched by merge |

## Divergence point

This fork diverged from upstream at commit `2f7f317` (2026-04-03), tagged as `fork-divergence-point`. To see the full delta:
```bash
git diff fork-divergence-point...HEAD
```
