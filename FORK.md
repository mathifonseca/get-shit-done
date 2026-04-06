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

### Files modified from upstream

**Agents:**
- `agents/gsd-executor.md` — test contracts, deviation rule constraints, Makefile preference
- `agents/gsd-verifier.md` — dead code scanning, ratchet effect enforcement, migration safety checks
- `agents/gsd-planner.md` — outcome-focused task specs, one-sentence objectives

**Workflows:**
- `workflows/discuss-phase.md` — questions_per_area config, exhaust-then-move-on behavior, key decisions propagation to CLAUDE.md
- `workflows/autonomous.md` — same discuss changes
- `workflows/verify-work.md` — adversarial validation step
- `workflows/execute-phase.md` — Playwright verification, Definition of Done, PR workflow, key decisions from execution, Edge Case Hunter
- `workflows/plan-phase.md` — Devil's Advocate review after plan-checker passes
- `workflows/new-project.md` — project integration questions (issue tracker, branches, CI), scaffolding (Makefile, pre-commit, preflight.yaml, .claude/rules/)
- `workflows/complete-milestone.md` — automated retrospective data (verification health, quality gates, deviation trends)
- `workflows/update.md` — fork guard prevents accidental npm overwrite
- `workflows/settings.md` — all new config keys in schema

**New files:**
- `commands/gsd/sdlc-audit.md` — `/gsd:sdlc-audit` command registration
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

## Divergence point

This fork diverged from upstream at commit `2f7f317` (2026-04-03), tagged as `fork-divergence-point`. To see the full delta:
```bash
git diff fork-divergence-point...HEAD
```
