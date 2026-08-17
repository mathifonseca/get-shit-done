<div align="center">

# GSD Core

**Git. Ship. Done.**

**English** · [Português](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md)

**A light-weight meta-prompting, context engineering, and spec-driven development system for Claude Code, OpenCode, Antigravity CLI, Kimi CLI, Kilo, Codex, Copilot, Cursor, Windsurf, and more.**

[![npm version](https://img.shields.io/npm/v/%40opengsd%2Fgsd-core?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/@opengsd/gsd-core)
[![npm downloads](https://img.shields.io/npm/dm/%40opengsd%2Fgsd-core?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/@opengsd/gsd-core)
[![Tests](https://img.shields.io/github/actions/workflow/status/open-gsd/gsd-core/test.yml?branch=main&style=for-the-badge&logo=github&label=Tests)](https://github.com/open-gsd/gsd-core/actions/workflows/test.yml)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/mYgfVNfA2r)
[![GitHub stars](https://img.shields.io/github/stars/open-gsd/gsd-core?style=for-the-badge&logo=github&color=181717)](https://github.com/open-gsd/gsd-core)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

</div>

> **This is an opinionated fork** of GET SHIT DONE by [TÂCHES](https://github.com/gsd-build) — originally at [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) (retired 2026), now continued as **GSD Core** at [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core). This fork tracks the active upstream and integrates a comprehensive [SDLC methodology](FORK.md) that adds quality gates, testing discipline, issue tracking, and verification rigor as first-class defaults. See [FORK.md](FORK.md) for the full list of changes. <!-- gsd-allow-legacy-name -->

## Why this fork?

The upstream GSD is designed to work for everyone. This fork is designed for engineers who believe:

- **Tests are contracts, not suggestions.** The agent fixes the implementation, never the tests. If a test is wrong, the agent stops and asks.
- **Quality only moves forward.** Coverage thresholds, strict types, lint rules, and CI steps can never regress (the ratchet effect).
- **Dead code is context pollution.** Commented-out blocks, orphaned exports, and parallel implementations are flagged automatically.
- **Adversarial review at every stage.** A Devil's Advocate challenges plans before execution. An Edge Case Hunter reviews code in parallel during execution. Finder, critic, and referee agents cross-validate after execution. Three layers, three stages.
- **Every change traces back to an issue.** Branch naming, PR titles, and PR bodies link to your issue tracker automatically.
- **Spec the outcome, not the process.** Plans describe what success looks like. The executor figures out the how.
- **Playwright tests are first-class.** Screenshots are verification evidence. Manual UAT is the fallback, not the default.
- **Projects should be scaffolded right from day one.** Makefile, pre-commit hooks, preflight checks, and domain-scoped rules — all generated based on your stack.

All of these are **on by default**. Every feature is configurable — turn anything off with `/gsd-settings` — but the defaults encode an engineering philosophy where quality is automated, not aspirational.

## Getting Started with this Fork

### What's different from upstream

When you run `/gsd-new-project`, you'll be asked additional questions:

1. **Issue tracker** — Where do you track issues? (GitHub Issues, Linear, Jira)
2. **Branch naming** — What's your convention? (e.g., `prefix-NN/description`)
3. **PR conventions** — Title pattern, body requirements, CI commands
4. **Scaffolding** — Makefile, pre-commit hooks, preflight checks, domain rules

These generate a fully configured project with quality gates from day one.

### What happens during development

The enriched pipeline looks like this:

```
/gsd-new-project
  → Issue tracker, branch naming, PR conventions configured
  → Makefile, preflight.yaml, .claude/rules/ scaffolded

/gsd-discuss-phase
  → All questions asked per area (no arbitrary cutoff)
  → Architectural decisions auto-propagated to CLAUDE.md

/gsd-plan-phase
  → Outcome-focused task specs (what, not how)
  → One-sentence objectives required
  → Plan-checker validates goals
  → Devil's Advocate challenges approach, surfaces risks

/gsd-execute-phase
  → Tests are read-only (completion contracts)
  → Executor prefers Makefile targets
  → Edge Case Hunter reviews code in parallel (boundary conditions, error paths, security)
  → Playwright tests run automatically

  After execution:
  → Adversarial validation (finder + critic + referee)
  → Dead code / context pollution scan
  → Ratchet effect enforcement (quality can't regress)
  → Migration safety checks
  → Definition of Done checklist
  → Preflight checks + auto PR creation
```

### Auditing your project

Run `/gsd-sdlc-audit` to check how well your project follows the methodology:

```
$ /gsd-sdlc-audit

## SDLC Audit Report

### Tier 1: Foundation
  PASS  Git repo with main branch
  PASS  CLAUDE.md exists (278 lines)
  MISS  Makefile — no Makefile found
  PASS  Pre-commit hooks (husky)
  ...

Score: 14/20 | Current tier: Tier 2
Next: Create a Makefile with standard targets
```

Use `--fix` to auto-scaffold missing items.

---

## What is GSD Core

GSD Core is a context-engineering and spec-driven development framework that drives AI coding agents (Claude Code, Codex, Antigravity CLI, Kimi CLI, Copilot, Cursor, and more) through a disciplined phase loop. It solves [context rot](docs/explanation/context-engineering.md) — the quality degradation that accumulates as an AI fills its context window — by running all heavy research, planning, and execution work in fresh-context subagents while keeping your main session lean.

---

## How it works

Each milestone repeats the same five-step loop, one phase at a time:

1. **Discuss** — capture implementation decisions before anything is planned
2. **Plan** — research, decompose, and verify the plan fits a fresh context window
3. **Execute** — run plans in parallel waves; each executor starts with a clean 200k-token context
4. **Verify** — walk through what was built; diagnose and fix before declaring done
5. **Ship** — create the PR, archive the phase, repeat for the next one

---

## Quickstart

```bash
npx @opengsd/gsd-core@latest
```

The installer prompts for your runtime (Claude Code, OpenCode, Antigravity CLI, Kimi CLI, Kilo, Codex, Copilot, Cursor, Windsurf, and more) and whether to install globally or locally. The installer is required for cross-runtime compatibility — do not copy files from `agents/` or `commands/` directly.

On another runtime or without Node.js? See [Install on your runtime](docs/how-to/install-on-your-runtime.md).

Once installed, start a new project or onboard an existing repo:

```bash
/gsd-new-project   # greenfield project
/gsd-onboard       # existing codebase
```

New here? Follow [Your first project](docs/tutorials/your-first-project.md) for a guided walkthrough from install to first shipped phase, or [Onboarding an existing codebase](docs/tutorials/onboarding-an-existing-codebase.md) for brownfield setup.

---

## Documentation

**What's new in 1.7.0** → [docs/whats-new-1.7.0.md](docs/whats-new-1.7.0.md)

**Tutorials** — learning by doing:
- [Your first project](docs/tutorials/your-first-project.md)
- [Onboarding an existing codebase](docs/tutorials/onboarding-an-existing-codebase.md)

**How-to guides** — task-focused recipes:
- [Install on your runtime](docs/how-to/install-on-your-runtime.md)
- [Plan a phase](docs/how-to/plan-a-phase.md)
- [Verify and ship](docs/how-to/verify-and-ship.md)
- … [see all how-to guides](docs/README.md#how-to-guides)

**Reference** — authoritative facts:
- [Commands](docs/COMMANDS.md)
- [Configuration](docs/CONFIGURATION.md)
- [CLI tools](docs/CLI-TOOLS.md)

**Explanation** — concepts and design decisions:
- [Context engineering](docs/explanation/context-engineering.md)
- [The phase loop](docs/explanation/the-phase-loop.md)
- [Architecture](docs/ARCHITECTURE.md)

Full index: [docs/README.md](docs/README.md). Other languages: [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Português](README.pt-BR.md) · [简体中文](README.zh-CN.md).

---

## Why it works

Most AI-coding setups fail at scale because context bloat silently degrades output quality, there is no shared memory between sessions, and nothing verifies that code actually works. GSD Core solves all three: heavy work runs in fresh subagents, structured artifacts like `STATE.md` and `CONTEXT.md` survive session boundaries, and the verify step walks through what was built and generates fix plans before a phase is declared done. See [docs/explanation/context-engineering.md](docs/explanation/context-engineering.md) for the full reasoning.

Troubleshooting? See [docs/how-to/recover-and-troubleshoot.md](docs/how-to/recover-and-troubleshoot.md).

---

## Community

| Project | Platform |
|---------|----------|
| [gsd-opencode](https://github.com/rokicool/gsd-opencode) | Original OpenCode port |
| [Discord](https://discord.gg/mYgfVNfA2r) | Community support |

---

## Star History

<a href="https://star-history.com/#open-gsd/gsd-core&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=open-gsd/gsd-core&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=open-gsd/gsd-core&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=open-gsd/gsd-core&type=Date" />
 </picture>
</a>

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Claude Code is powerful. GSD Core makes it reliable.**

</div>
