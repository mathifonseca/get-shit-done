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

### `open-gsd/gsd-core#3613` — confirmed-bug 2026-08-18; superseded by external PR #3627. Watch the merge, then adopt.

The `C2` plugin-validate gate symlinks its fixture component dirs; `claude` CLI
>= 2.1.233 warns on symlinked component directories and `--strict` turns that into
exit 1. Compounding it, the test is guarded by `skip: !claudeAvailable` and no
workflow installs the CLI — so it is **permanently skipped in CI**: green on every
PR, red on every contributor machine.

- **We do NOT open a PR for this.** `confirmed-bug` landed 2026-08-18, and hours
  later @behruznassre opened [#3627](https://github.com/open-gsd/gsd-core/pull/3627)
  ("fix(#3613): copy component dirs into the plugin-validate fixture") — same
  `cpSync` approach we verified, done better: entry-by-entry copy through
  `shouldCopyHookEntry` (closes the #3656 build-staging race our bare recursive
  copy is still exposed to) plus an unconditional `C3` symlink-free tripwire so a
  regression goes red in CI without the CLI. All checks green incl. Windows shards.
- We posted our independent A/B verification as a supporting comment 2026-08-19
  (symlinked → exit 1 with 3 warnings; copied → exit 0; CLI 2.1.233). Only act
  again if #3627 stalls or is abandoned — then offer to take it over in a comment.
- **At the first sync containing the merge: drop our local variant and take
  theirs.** Ours is the bare `fs.cpSync` at
  `tests/issue-766-plugin-manifest.test.cjs:386-388`; upstream renamed the file to
  `tests/plugin-manifest.test.cjs`, so the diff will not line up automatically.
  Adopting removes one modified-upstream-test entry (§3, 23 → 22).

### `open-gsd/gsd-core#3660` — confirmed-bug 2026-08-19; our PR [#3681](https://github.com/open-gsd/gsd-core/pull/3681) is open, review answered 2026-08-23. Waiting on a run release.

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
  through one `runBoundedCapture` whose subtree is reaped by `reapDescendants()` in a
  `finally` — `process.kill(-pid, 'SIGKILL')` on POSIX (`detached` makes the child a group
  leader), `taskkill /PID <pid> /T /F` on win32. As of 2026-08-23 that branch carries the
  POST-REVIEW version (`4721e31e6` + `a3eaac659`, cherry-picked back from the PR branch), so
  fork and upstream no longer disagree. The `.changeset/` fragment is deliberately NOT on
  this branch — it is upstream release bookkeeping keyed to PR #3681.
- **Upstream PR #3681 opened 2026-08-19**, base `next` @ `4e60dba71` (v1.11.0), head
  `mathifonseca/gsd-core:fix/3660-bounded-check-orphans-worker` — a clean cherry-pick of
  `09d4d83a9` plus the `.changeset/tidy-jays-wander.md` fragment (fragment committed
  AFTER open: it must carry the real PR number or `changeset/lint.cjs` fails it).
  Verified on that base before opening: files still byte-identical pre-fix, 71/71 in the
  target file, negative control red/green in both directions, full suite 30,594/30,611
  pass with the single failure being #3613's `C2` (pre-existing, disclosed in the PR
  body). Survived `auto-close-unsolicited-prs.yml`; early gates green at open.
- **PR-network gotcha (bit us 2026-08-19):** `mathifonseca/get-shit-done` sits in the
  archived `gsd-build/get-shit-done` fork network and CANNOT open PRs against
  `open-gsd/gsd-core` — the 2026-06 migration was a fresh repo, not a transfer. Upstream
  PRs go through the fresh fork `mathifonseca/gsd-core` (remote `gsdfork` in this
  checkout). The PR branch also lives locally as `fix/3660-bounded-check-orphans-worker`;
  its verify worktrees were removed after push — recreate one from the branch (NOT from
  a path under `/tmp`: `tests/helpers-cleanup.test.cjs`'s out-of-tmpdir refusal test
  trips its own safety precondition in any tmp-rooted checkout) for review-feedback work.
- **Review round 1 (trek-e, 2026-08-20): CHANGES_REQUESTED — 2 blockers, 3 majors, 3 minors.**
  Answered 2026-08-23 in `4721e31e6` (all eight) and `a3eaac659` (a bug CI then found in the
  answer). Verdict on the mechanism was favourable throughout: *"genuine root-cause fix,
  verified rather than taken on trust."* What changed: `pgrep` replaced by a pidfile the
  subject writes (`procps` is absent from `node:*-slim`, and its ENOENT read as "the leak is
  no longer reproducible"); Windows given a real reap instead of a carve-out comment; a
  SIGINT handler added because `detached` had RELOCATED the defect to the interrupt path; the
  treatment arm taught to observe its own worker before asserting it is gone; the spinner
  replaced by `Atomics.wait` (same event-loop wedge, 0% CPU); the cast removed so the eslint
  guard works again.
- **Lesson, and it cost a red CI round: `process.kill(pid, 0)` CANNOT SEE ZOMBIES.** A
  killed-but-unwaited child keeps its PID-table entry and answers signal 0 with success, so
  the pidfile probe reported a correctly-reaped worker as still alive. Measured on
  linux/amd64 and linux/arm64 (Node 24, container): after the reap the worker sits in
  `/proc/<pid>/stat` state `Z` while `kill(pid, 0)` succeeds. **It passed on this Mac only
  because launchd reaps orphans promptly enough that the limbo is never sampled** — the same
  shape as the original bug, where a green local suite hid a real leak. Use `isRunning()`
  (reads `/proc` state where it exists, falls back to signal 0). Generalise: when a probe
  passes here and fails on Linux, suspect the probe before the code, and reproduce in
  `docker run --platform linux/amd64 node:24` — it caught this in one round.
- **Open, awaiting the next run release:** (a) `test (windows-latest)` failed on the CONTROL,
  not the treatment — if that holds, Windows has NO leak to reap, because libuv assigns every
  non-detached child to a job object with `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`, so killing the
  runner takes the worker with it. If confirmed, REMOVE the `taskkill` arm rather than keep
  it: dead code carrying a real PID-reuse hazard (Windows has no process-group-lifetime rule).
  (b) `emitted-attribution` fails on both Linux lanes — **verified pre-existing**: it fails on
  the untouched PR base `4e60dba71` too (9 stale acks there, 1 on our branch). Not ours;
  flagged upstream, not fixed, since #3681 is one concern.
- **Fork PR runs need a maintainer release each push** (`action_required`). Expect a stall
  after every push, not a CI failure. trek-e released round 1 on request.
- The daily cloud routine that watched the #3613/#3660 labels should now watch two
  things instead: #3627 merging (triggers the §3613 sync adoption above) and #3681
  review feedback / CI.
- **Load-bearing checks** (§3) — FOUR now, not one, and each fails with its own diagnostic.
  All verified in both directions 2026-08-23. This leak is silent by nature, so if a revert
  leaves the suite green, nothing else will tell you the guard is dead.

  | revert | must go red with |
  | --- | --- |
  | the whole `src/` half | *a descendant of the bounded check … OUTLIVED it* |
  | `installInterruptReap()` only | *the interrupted check stranded its worker* |
  | the `setImmediate` turn in the `finally` only | *the verifier must still DIE from the interrupt* |
  | the `timeout:` key in the spawn options | `npx eslint src/prohibition-enforcement.cts` reports `local/require-subprocess-timeout` |

  The last one is not a test — it is the machine guard itself. It went **inert** for four
  days because an `as unknown as` cast turned the options argument into an Identifier, which
  `require-subprocess-timeout` declines to trace by design. Caught in upstream review, not by
  us. Keep the options an inline object literal; get `detached` in through a SPREAD, never a
  cast.
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
