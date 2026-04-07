<purpose>
Audit the current project against the SDLC Section 20 progressive initialization checklist.
Reports what's set up, what's missing, and what to do next across 4 tiers.
Optionally auto-fixes items that can be scaffolded safely.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>

<step name="parse_args">
**Parse arguments:**

Check if `--fix` flag is present in the command arguments.

```
FIX_MODE=false
if arguments contain "--fix"; then
  FIX_MODE=true
fi
```
</step>

<step name="detect_project_root">
**Detect project root:**

Use the current working directory as the project root. Verify it looks like a project directory (has at least some files). Store as `$PROJECT_ROOT`.
</step>

<step name="run_all_checks">
**Run all tier checks in parallel where possible.**

Use Bash, Read, Grep, and Glob tools — never run project commands or build tools. All checks are file-existence and content-grep based for speed.

Initialize a results structure to track each check:
- `tier` (1-4)
- `name` (human-readable label)
- `status` ("PASS" | "MISS" | "PARTIAL")
- `evidence` (file path, line number, or detail string)
- `fix_available` (boolean — can --fix handle this?)
- `fix_description` (what --fix would do)

---

### Tier 1 — Foundation (Day 1)

**1.1 Git repo initialized with main branch**
```bash
git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree 2>/dev/null && git -C "$PROJECT_ROOT" branch --list main
```
- PASS if git repo exists AND `main` branch is listed.
- PARTIAL if git repo exists but no `main` branch (e.g., uses `master`).
- MISS if not a git repo.
- Evidence: branch name found.

**1.2 CLAUDE.md exists with project description**
- Glob for `$PROJECT_ROOT/CLAUDE.md`
- PASS if file exists and has more than 5 lines.
- PARTIAL if file exists but is very short (<=5 lines — likely a stub).
- MISS if file does not exist.
- Evidence: file path and line count.

**1.3 README.md exists**
- Glob for `$PROJECT_ROOT/README.md`
- PASS if file exists.
- MISS if not found.
- Evidence: file path.

**1.4 Makefile exists with standard targets**
- Glob for `$PROJECT_ROOT/Makefile`
- If found, grep for targets: `setup`, `dev`, `check`, `lint`, `test`.
- PASS if Makefile exists and has all 5 targets.
- PARTIAL if Makefile exists but is missing some targets (list which are missing).
- MISS if no Makefile.
- Evidence: file path, list of found/missing targets.
- fix_available: true (can scaffold a Makefile with standard targets)

**1.5 Linter configured and strict mode enabled**
- Glob for common linter config files:
  - `eslint.config.*`, `.eslintrc*`, `biome.json`, `biome.jsonc`
  - `.flake8`, `pyproject.toml` (check for `[tool.ruff]` or `[tool.flake8]`), `setup.cfg` (check for `[flake8]`), `ruff.toml`
  - `.rubocop.yml`
  - `.golangci.yml`, `.golangci.yaml`
  - `deno.json`, `deno.jsonc` (check for `lint` key)
- PASS if at least one linter config found.
- MISS if none found.
- Evidence: config file path(s) found.

**1.6 .claude/settings.local.json exists with .env deny rules**
- Check for `$PROJECT_ROOT/.claude/settings.local.json`
- If found, read it and check if it contains a deny rule that references `.env` (grep for `\.env` or `env` in deny patterns).
- PASS if file exists and has .env deny rule.
- PARTIAL if file exists but no .env deny rule.
- MISS if file does not exist.
- Evidence: file path, deny rule found.
- fix_available: true (can create settings.local.json with .env deny)

**1.7 Issue tracker configured**
- Check for `$PROJECT_ROOT/.planning/config.json`
- If found, read it and check for `project.issue_tracker` or `issue_tracker` key.
- PASS if config exists and issue_tracker is set to a non-empty value.
- MISS if config doesn't exist or issue_tracker is not configured.
- Evidence: tracker type/URL if found.

**1.8 Pre-commit hooks configured**
- Check for any of:
  - `$PROJECT_ROOT/.husky/` directory
  - `$PROJECT_ROOT/.pre-commit-config.yaml`
  - `$PROJECT_ROOT/.lefthook.yml` or `$PROJECT_ROOT/lefthook.yml`
  - `$PROJECT_ROOT/.git/hooks/pre-commit` (non-sample)
  - `lint-staged` key in `package.json`
- PASS if any hook mechanism found.
- MISS if none found.
- Evidence: mechanism and file path.

---

### Tier 2 — First Feature

**2.1 CI workflow exists**
- Glob for `$PROJECT_ROOT/.github/workflows/*.yml` and `*.yaml`
- If found, grep across them for keywords: `test`, `lint`, `check`, `quality`, `ci`.
- Also check for: `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/config.yml`, `bitbucket-pipelines.yml`
- PASS if at least one CI workflow found with test/quality jobs.
- PARTIAL if CI files exist but no test/quality job detected.
- MISS if no CI files found.
- Evidence: workflow file paths, job names found.

**2.2 PR conventions workflow exists**
- Glob for `$PROJECT_ROOT/.github/workflows/*.yml` and `*.yaml`
- Grep for branch naming or PR title enforcement patterns: `pull_request`, `pr-title`, `branch-name`, `conventional-commits`, `semantic-pull-request`.
- Also check for `.github/PULL_REQUEST_TEMPLATE.md`.
- PASS if PR convention enforcement found (workflow or template).
- PARTIAL if only a PR template exists but no enforcement workflow.
- MISS if neither found.
- Evidence: file paths.

**2.3 Structured logging set up**
- Grep project source files for structured logging library imports:
  - Python: `structlog`, `python-json-logger`, `loguru`
  - Node/JS/TS: `pino`, `winston`, `bunyan`, `structured-log`
  - Go: `zap`, `zerolog`, `logrus`
  - Ruby: `semantic_logger`, `lograge`
  - Rust: `tracing`, `slog`
- PASS if structured logging import found.
- MISS if not found (only check if project has source code).
- Evidence: import location (file:line).

**2.4 Health endpoints exist**
- Grep project source files for health endpoint patterns:
  - Route definitions containing `/health`, `/api/health`, `/healthz`, `/readyz`, `/livez`
  - Also check for health check modules/files (glob for `*health*` in source dirs)
- PASS if health endpoint found.
- MISS if not found. If the project is not a web service (no server/app framework detected), mark as N/A instead.
- Evidence: file:line of route definition.

---

### Tier 3 — Growing Up

**3.1 .claude/rules/ directory with domain-scoped rule files**
- Check for `$PROJECT_ROOT/.claude/rules/` directory.
- If found, glob for `*.md` files inside.
- PASS if directory exists with at least one .md file.
- PARTIAL if directory exists but is empty.
- MISS if directory does not exist.
- Evidence: directory path, count of rule files, file names.
- fix_available: true (can create rules/ directory)

**3.2 .planning/ directory initialized**
- Check for `$PROJECT_ROOT/.planning/` directory.
- Inside, check for `PROJECT.md` and `ROADMAP.md`.
- PASS if directory exists with both PROJECT.md and ROADMAP.md.
- PARTIAL if directory exists but missing one or both files.
- MISS if directory does not exist.
- Evidence: which files exist.

**3.3 .claude/preflight.yaml exists**
- Check for `$PROJECT_ROOT/.claude/preflight.yaml`.
- PASS if file exists.
- MISS if not found.
- Evidence: file path.
- fix_available: true (can scaffold a preflight.yaml)

**3.4 API collection tool set up**
- Check for any of:
  - `$PROJECT_ROOT/bruno/` directory
  - `$PROJECT_ROOT/.postman/` or `$PROJECT_ROOT/postman/` directory
  - Glob for `**/*.http` files (REST Client format)
  - `$PROJECT_ROOT/insomnia/` or `$PROJECT_ROOT/.insomnia/` directory
  - Glob for `**/*.thunder-collection*` files
- PASS if any API collection found.
- MISS if none found. If the project has no API (no server framework detected), mark as N/A.
- Evidence: tool name and path.

**3.5 Security scanning in CI**
- Grep CI workflow files for security scanning patterns:
  - `codeql`, `snyk`, `trivy`, `semgrep`, `bandit`, `brakeman`, `gosec`, `safety`, `npm audit`, `cargo audit`, `gitleaks`, `trufflehog`, `dependabot`, `security`
- PASS if security scanning step found in CI.
- MISS if not found.
- Evidence: scanner name and workflow file.

**3.6 Dependency audit configured**
- Check for:
  - `$PROJECT_ROOT/.github/dependabot.yml` or `$PROJECT_ROOT/.github/dependabot.yaml`
  - `$PROJECT_ROOT/renovate.json` or `$PROJECT_ROOT/renovate.json5` or `$PROJECT_ROOT/.renovaterc` or `$PROJECT_ROOT/.renovaterc.json`
  - Grep `package.json` for `npm-check-updates`
- PASS if any dependency audit tool configured.
- MISS if none found.
- Evidence: tool name and config file path.

---

### Tier 4 — Scaling

**4.1 Documentation site scaffold exists**
- Check for any of:
  - `$PROJECT_ROOT/mkdocs.yml`
  - `$PROJECT_ROOT/docusaurus.config.js` or `docusaurus.config.ts`
  - `$PROJECT_ROOT/docs/` directory with an `index.md` or `index.html` or `README.md`
  - `$PROJECT_ROOT/.vitepress/` directory
  - `$PROJECT_ROOT/book.toml` (mdBook for Rust)
- PASS if documentation site scaffold found.
- PARTIAL if `docs/` exists but no index file.
- MISS if none found.
- Evidence: tool name and path.

**4.2 Seed/demo pipeline exists**
- Check `$PROJECT_ROOT/Makefile` for `demo` or `seed` targets.
- Also check for seed scripts: glob for `*seed*`, `*demo*` in `scripts/`, `bin/`, or `db/` directories.
- Also check `package.json` scripts for `seed` or `demo`.
- PASS if seed/demo target or script found.
- MISS if none found.
- Evidence: target name and file path.

**4.3 Task contract templates exist**
- Glob for `$PROJECT_ROOT/**/*_CONTRACT.md` or `$PROJECT_ROOT/**/*-CONTRACT.md` files.
- Also check `$PROJECT_ROOT/.planning/templates/` for contract templates.
- PASS if at least one contract template found.
- MISS if none found.
- Evidence: file paths found.

</step>

<step name="calculate_scores">
**Calculate scores:**

For each tier, count:
- `passed`: number of PASS items
- `partial`: number of PARTIAL items
- `missing`: number of MISS items
- `total`: total items (exclude N/A items from total)

Calculate overall:
- `total_passed`: sum of all tier passed counts
- `total_partial`: sum of all tier partial counts
- `total_missing`: sum of all tier missing counts
- `total_checks`: sum of all tier totals

Determine `current_tier`:
- If Tier 1 has any MISS items → "Tier 1 (Foundation)"
- Else if Tier 2 has any MISS items → "Tier 2 (First Feature)"
- Else if Tier 3 has any MISS items → "Tier 3 (Growing Up)"
- Else → "Tier 4 (Scaling)"
</step>

<step name="generate_report">
**Generate and display the report:**

Format the report exactly as follows. Use the exact status markers shown.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SDLC Audit Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Tier 1: Foundation (Day 1)
  PASS  Git repo with main branch
  PASS  CLAUDE.md exists (278 lines)
  PASS  README.md exists
  MISS  Makefile — no Makefile found
  PASS  Linter configured (eslint.config.js)
  PASS  .claude/settings.local.json with .env deny
  MISS  Issue tracker not configured
  PASS  Pre-commit hooks (husky)

  Tier 1: 6/8 passed

### Tier 2: First Feature
  PASS  CI workflow (.github/workflows/ci.yml)
  PART  PR conventions — template exists but no enforcement
  PASS  Structured logging (pino in src/logger.ts:3)
  MISS  Health endpoints — no /health route found

  Tier 2: 1/4 passed | 1 partial

### Tier 3: Growing Up
  PASS  .claude/rules/ (3 rule files)
  PASS  .planning/ initialized (PROJECT.md, ROADMAP.md)
  MISS  .claude/preflight.yaml not found
  N/A   API collection — no API detected
  MISS  Security scanning in CI
  PASS  Dependency audit (dependabot.yml)

  Tier 3: 3/5 passed (1 N/A excluded)

### Tier 4: Scaling
  MISS  Documentation site — no scaffold found
  MISS  Seed/demo pipeline — no targets found
  MISS  Task contract templates — none found

  Tier 4: 0/3 passed

---
Score: 10/20 passed | 1 partial | 9 missing
Current tier: Tier 1 (Foundation)
Next steps:
  1. Create a Makefile with standard targets (make setup, make check, make test)
  2. Configure issue tracker: /gsd-settings -> project.issue_tracker
  3. Add health endpoints to your API
```

Adapt the evidence strings to match what was actually found. The examples above are illustrative.
</step>

<step name="suggest_next_steps">
**Determine next steps:**

Build a prioritized list of 3-5 next actions:

1. Always prioritize completing the **current tier** first (the lowest tier with MISS items).
2. Within a tier, prioritize items that have `fix_available: true` first (easiest wins).
3. Then items that are PARTIAL (almost there).
4. Then remaining MISS items.

For each next step, provide:
- What to do (concise action)
- How to do it (command, file to create, or GSD slash command to run)

Example next steps:
```
Next steps:
  1. Create a Makefile with standard targets (make setup, make check, make test)
     -> Run: /gsd-sdlc-audit --fix  or create manually
  2. Configure issue tracker: /gsd-settings -> project.issue_tracker
  3. Add .claude/preflight.yaml for pre-ship checks
     -> Run: /gsd-sdlc-audit --fix  or create manually
```
</step>

<step name="handle_fix_mode">
**If `--fix` mode is active:**

For each MISS or PARTIAL item where `fix_available: true`, offer to fix it. Process items one at a time in tier order.

**Fixable items and their actions:**

**Makefile (1.4):**
- Use AskUserQuestion to confirm: "Create a Makefile with standard targets (setup, dev, check, lint, test)? [y/n]"
- If yes, detect the project's language/framework from existing files and create an appropriate Makefile.
- For Node/TS projects: npm-based targets.
- For Python projects: pip/poetry/uv-based targets.
- For Go projects: go-based targets.
- Include at minimum: `setup`, `dev`, `check`, `lint`, `test` targets.

**.claude/settings.local.json (1.6):**
- Use AskUserQuestion to confirm: "Create .claude/settings.local.json with .env deny rules? [y/n]"
- If yes, create with standard deny patterns:
```json
{
  "permissions": {
    "deny": [
      "Bash(cat .env*)",
      "Bash(cat *.pem)",
      "Read(.env*)",
      "Edit(.env*)"
    ]
  }
}
```

**.claude/rules/ directory (3.1):**
- Use AskUserQuestion to confirm: "Create .claude/rules/ directory with a starter rule file? [y/n]"
- If yes, create the directory and a starter `project.md` rule file with basic project conventions.

**.claude/preflight.yaml (3.3):**
- Use AskUserQuestion to confirm: "Create .claude/preflight.yaml with standard checks? [y/n]"
- If yes, create a preflight config with standard checks (lint, test, type-check as applicable to the detected stack).

**For non-fixable items:**
- Print the exact steps or commands needed to fix them manually.
- Reference relevant GSD commands where applicable (e.g., `/gsd-new-project` for .planning/ setup).

After all fixes are applied, re-run the checks for fixed items only and display an updated summary showing the new score.
</step>

</process>

<output_rules>
- Keep the report concise and scannable.
- Use fixed-width status markers: `PASS`, `MISS`, `PART`, `N/A ` (4 chars each, right-padded).
- Always show evidence in parentheses after the status description.
- Always show the score summary and next steps at the bottom.
- If the project scores 100%, congratulate the user and suggest Tier 4 items as stretch goals.
- Never run project build commands, test suites, or install dependencies — all checks are read-only.
</output_rules>
