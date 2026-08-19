# Fork Operations

Operational handbook for maintaining this fork against `open-gsd/gsd-core`.
Companion to [FORK.md](FORK.md) — that file records *what* the fork changes and
the full sync history; this one records *how we work on it* and what is open.

**Status as of 2026-08-18** — fork at `41df80f5e`, synced to upstream **v1.10.0**,
level with `upstream/main`, suite green (26,289 passing / 0 failing / 13 skipped),
`lint:ci` exit 0, global install refreshed.

Full inventory of every fork modification, with per-item "still needed?" verdicts:
**[GSD Fork Ledger](https://claude.ai/code/artifact/634b1200-f6fc-4a82-8382-695bf6bfc980)**

---

## 1. What the v1.10.0 sync did

The fork had drifted **1,628 commits** behind (v1.4.3 → v1.10.0, ten releases,
~2 months). Three distinct pieces of work:

### 1a. The merge itself

- Re-pointed the `upstream` remote — it was still aimed at the retired
  `gsd-build/get-shit-done` despite FORK.md claiming otherwise. **That is why
  nothing looked new.** Check the remote first when a sync looks suspiciously quiet.
- 21 conflicts + 2 modify/delete, resolved keeping fork behaviour.
- Upstream became a multi-runtime framework: `capabilities/` system (43 packages),
  15+ runtime adapters, MCP server, VS Code extension, security hardening,
  workflows split into `*/steps/` fragments, 71 generated `skills/`, 41 new ADRs.

### 1b. Conformance with upstream's new invariants

The merge was only half the job. Upstream added architectural gates over those two
months that the fork's inlined-patch strategy violated — **19 distinct test failures**,
all resolved. Namespace router nesting (#69), the canonical `gsd_run` preamble,
ADR-857 capability ownership (#1168/#1169), duplicated agent size caps, hardcoded
roster/line boundaries, and the MCP prompt catalog count.

### 1c. Capability migration

Moved the fork's optional feature logic out of the host loops into ADR-857
capability packages — `playwright`, `definition-of-done`, `adversarial-validation`,
`design-spec`, `teach`. Folded `dead_code_scan` into upstream's `broken-windows`
register so findings inherit its blocking `ship:pre` gate and waiver trail.

**This is what let the ratchets come back down:**

| Ratchet | After merge | Now |
|---|---|---|
| workflow `XL_CAP` | 108 KiB | **96 KiB — upstream's value** |
| workflow `LARGE_CAP` | 64 KiB | **60 KiB — upstream's value** |
| `DISCUSS_PHASE_TARGET` | 64,000 | 61,000 |
| agent `XL_CAP` | 75 KiB | 70 KiB (upstream 56) |
| ADR-857 host ceiling | 95,000 | 94,600 (upstream 93,600) |

---

## 2. What we are waiting on upstream

### `open-gsd/gsd-core#3613` — filed, awaiting triage

The `C2` plugin-validate gate symlinks its fixture component dirs; `claude` CLI
>= 2.1.233 warns on symlinked component directories and `--strict` turns that into
exit 1. Compounding it, the test is guarded by `skip: !claudeAvailable` and no
workflow installs the CLI — so it is **permanently skipped in CI**: green on every
PR, red on every contributor machine.

- Unfixed on **both** `main` and `next` (`tests/plugin-manifest.test.cjs:406-408`).
- Fix is written and verified locally: `fs.cpSync(src, dest, { recursive: true })`.
  A/B on clean upstream — symlinked → exit 1 with 3 warnings; copied → exit 0.
- **Blocked on a label, not on the code.** Their `auto-close-unsolicited-prs.yml`
  closes non-member PRs unless the linked issue carries a maintainer-applied
  `confirmed-bug` / `approved-enhancement` / `approved-feature`. Ours currently has
  `needs-triage`. Opening a PR before the label gets it robo-closed.
- A daily cloud routine checks the label and reports. **Do not open the PR until an
  approval label lands.** If it stalls for several days, a short comment offering
  the patch is the low-friction way to get triage attention.

### `open-gsd/gsd-core#3660` — filed, awaiting triage

Every bounded prohibition check that hangs orphans a busy-spinning process. `node --test`
defaults to `--test-isolation=process`, so the child we spawn is a *runner* that re-execs a
per-file *worker*; `execFileSync`'s `timeout` signals the direct child only. The runner dies
at the bound and the worker — the process actually executing the subject — is never
signalled at all, is reparented to PID 1, and burns a core forever. The verdict still fails
closed, so the suite stays green and the leak is invisible. Found from the outside as
**~6.4 cores of unexplained load over two days**, never from a red test.

- Unfixed on **both** `main` and `next` (`src/prohibition-enforcement.cts`, four
  `execFileSync` sites). Their file is byte-identical to our pre-fix copy, and building
  `next` @ `1adf6d224` in place reproduces the orphan.
- Fix is on `fix/prohibition-enforcement-subprocess-reap` (pushed): all four sites routed
  through one `runBoundedCapture` that spawns `detached` and SIGKILLs the process group.
- **Blocked on the same label mechanic as #3613** — `auto-close-unsolicited-prs.yml` will
  robo-close the PR until a maintainer applies `confirmed-bug`. Do not open it before then.
- **Load-bearing check** (§3) — revert the `src/` half, then
  `node --test --test-name-pattern="leaves NO orphaned descendant" tests/prohibition-enforcement.test.cjs`
  must go **red** with the orphan diagnostic. Verified in both directions 2026-08-19. If it
  stays green after the revert, the guard is dead — and this leak is silent by nature, so
  nothing else will tell you.
- **Do not "simplify" this to `--test-isolation=none`.** It looks like the smaller fix and
  was measured to be strictly worse: with no worker the subject runs inside the runner,
  whose SIGTERM queues behind the blocked event loop, so the bound stops firing entirely
  and verify hangs instead of failing closed. Rationale is in the `runBoundedCapture`
  comment block and in #3660.
- Puts `tests/prohibition-enforcement.test.cjs` onto the modified-upstream-test surface
  (§3, 22 → 23) — it was pristine upstream before this, so it is now a sync conflict point.

### Also true, needs no action

Upstream `main` has been **red since 2026-08-08** (run `31240989206`) on the trae
`#2658` acceptance test — its own v1.10.0 release note quotes the malformed
`.claude/.trae/rules` path it asserts against. **Already fixed on `next`**; our
filter matches their form so the next sync is a no-op there.

---

## 3. Process improvements — what we changed and what is next

### The lesson that cost the most

**Twice in this session a "we have a fix upstream doesn't" turned out to be already
handled upstream.** Both times the cause was reading a surface signal and stopping:

- `next` was green → concluded the trae bug was unfixed there. The fix was in a diff
  we never opened.
- The `state.cts` `completed_plans` clamp was present → concluded upstream lacked it.
  Upstream had fixed the **root cause** in `ed31e52b6` (#1988) — `countMatchedSummaries`
  matches each plan at most once, so `summaryCount <= planCount` by construction.
  Our clamp had been a silent no-op since the merge. Reverted; `src/state.cts` and
  `tests/state.test.cjs` are both byte-identical to upstream again.

The deeper error: at merge time we asked *"did the fork's change survive?"* and never
*"is it still doing anything?"* Only the first question gets a green checkmark from a
passing build — **a no-op patch compiles and passes tests perfectly.**

### Adopt: the load-bearing check

After any large merge, for each preserved fork patch, **temporarily revert it and see
whether anything goes red.** Takes about a minute per patch. This is what finally
caught the dead clamp, and the same negative-control technique proved the retained
tests were (and later were not) worth keeping.

Corollary: when keeping a fork test, prove it fails without the thing it guards.

### Adopt: sync every release, not every quarter

This merge cost a day *because* it was 1,628 commits. Per-release syncs are minutes.
The notification path is verified working — `gsd-check-update.js` spawns the worker
with `GSD_CACHE_FILE`, and the statusline shows a fork-aware cyan
"⬆ upstream X.Y.Z available — cherry-pick from upstream" banner. When 1.11.0 hits
npm, it will show up.

### Adopt: prefer upstream's mechanism over our own

Repeatedly, upstream's version was better — root-cause fixes over our downstream
clamps, capability packages over our inlined blocks, a stateful `broken-windows`
ledger over our per-phase report. **The fork's ideas keep getting independently
validated; upstream increasingly has better machinery to express them.** Default to
adopting their mechanism and keeping only the opinion.

### Standing conflict surface (structural, will not go away)

Four host-loop touchpoints cannot become capabilities — documented so nobody
re-investigates:

- `pr_workflow`, `propagate_execution_decisions` — orchestrator tail procedures;
  `execute:post` declares `agentRoles [executor, verifier]`, so a contribution is invalid.
- plan-phase §12.6 (Devil's Advocate), §13c.5 (plan-lens) — `plan:post` fires at §13e,
  *after* the gates they exist to precede. Moving them changes behaviour.
- `retro` — `complete-milestone.md` is not a declared loop host.

Plus **23 modified upstream test files**, the single largest surface.

Counting rule (so this is not re-derived wrongly): `.test.cjs` files only, modified
relative to the upstream side of the sync merge — `git diff --diff-filter=M --name-only
$(git rev-parse 031a3846c^2) HEAD -- tests/ | grep -c '\.test\.cjs$'`. A plain file count
returns 41, because 19 modified `tests/fixtures/install-tree/*.json` are **generated** by
`scripts/gen-install-tree-fixtures.cjs` — regenerated output, not divergence anyone
maintains.

---

## 4. Next sessions

### Highest value: use it for real

Everything verified so far is static — unit tests, lint gates, registry resolution.
**No actual GSD workflow has been run since the merge.** Smoke checks pass
(`smart-entry`, `state`, 10 active hooks at `plan:pre` from the installed runtime),
but that is a long way from a real phase. Run `/gsd-discuss-phase` → `/gsd-plan-phase`
on something small in a real project. That exercises `discuss:post` (design-spec),
`plan:pre`, the planner and the gates — where a 1,628-commit merge would actually bite.

**Log anything broken here** and fix it in a follow-up session.

### Bounded improvement: shrink `gsd-verifier`

68 KB against upstream's 56 KB cap — the last meaningful ratchet gap, and the reason
agent `XL_CAP` sits at 70 KiB. Use the same progressive-disclosure extraction that
brought both workflow tier caps back to upstream parity: move blocks into
`gsd-core/references/`. Roughly an hour.

### Then

- Reduce the 23-file test divergence where upstream now covers the same ground
  (apply the load-bearing check to each before removing).
- Watch whether `two_stage_review` / `questions_per_area` converge with upstream's
  `code_review_depth` / `max_discuss_passes`.
- Revisit #3613 when the routine reports a label.

---

## 5. Standard sync loop

```bash
cd ~/code/get-shit-done
git fetch upstream --tags --force --prune   # --force: old-repo tags v1.6.0–v1.10.0 collide
git log upstream/main --oneline -20
git merge upstream/main                     # resolve keeping BOTH sides
npm run build && npm run regen:derived      # regenerate derived artifacts
npm run lint:ci && npm test                 # both must be clean
# update FORK.md sync-log row, commit, record the merge SHA in a second commit
git push origin main
npm run build:lib && npm run build:hooks
node bin/install.js --claude --global
rm -f ~/.cache/gsd/gsd-update-check.json
```

**Then run the load-bearing check on every preserved fork patch** before declaring
the sync done.
