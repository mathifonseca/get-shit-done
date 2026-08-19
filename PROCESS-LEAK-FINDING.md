# The prohibition-enforcement hang test leaks a busy-spinning process per run

**Found:** 2026-08-19, from the outside — as unexplained CPU load on the machine, not
from a failing test. **Status:** FIXED 2026-08-19 (see [Resolution](#resolution)).
**Severity (as found):** the suite was green and stayed green; the cost was invisible.

---

## Symptom

Seven orphaned `node` processes, each pegging ~95–99% of a core, **~6.4 cores in total**,
the oldest running for **31 hours**:

```
PID    PPID  STARTED                  %CPU
11360     1  Mon Aug 17 19:37:45      96.0
17617     1  Tue Aug 18 12:15:11      90.3
50568     1  Mon Aug 17 20:16:09      97.4
55617     1  Tue Aug 18 13:04:13      99.6
76321     1  Tue Aug 18 11:45:20      96.3
85620     1  Mon Aug 17 19:25:54      94.8
90363     1  Mon Aug 17 22:41:14      96.2
```

All `PPID 1` (orphaned — the parent died and they were reparented to init). Their working
directory is a **deleted** temp dir (`prohib-hang-*`), so `t.after(() => cleanup(dir))`
ran fine; only the processes outlived it. `INIT_CWD=/Users/mathifonseca/code/get-shit-done`.

Roughly one per affected run, accumulating across days. They were noticed only because
they slowed an unrelated Python test suite in another repo from ~110 s to several minutes.

---

## Where it comes from

`tests/prohibition-enforcement.test.cjs:685` —

```js
test('a HANGING node-test fails closed via the bounded timeout (B2: no unbounded subprocess)', (t) => {
  const dir = createTempDir('prohib-hang-');
  t.after(() => cleanup(dir));
  const tf = path.join(dir, 'hang.test.cjs');
  fs.writeFileSync(tf,
    "const { test } = require('node:test');\ntest('hangs forever', () => { while (true) {} });\n");
  const result = enforce.runProhibitionEnforcement(
    TEST_TIER,
    { kind: 'node-test', target: tf, failFirst: true },
    { cwd: dir, timeoutMs: 1500 },
  );
  assert.notEqual(result.status, 'green', 'a hung check must be killed and fail closed …');
  assert.equal(result.located, true);
});
```

---

## The mechanism, verified rather than inferred

1. `gsd-core/bin/lib/prohibition-enforcement.cjs` runs the check with
   **`execFileSync(process.execPath, buildNodeTestArgs(check), { timeout: … })`**
   (`runNodeTestWithSubject` ~line 379, `defaultRunCheck` ~line 396).
2. `buildNodeTestArgs` (line 133) passes only
   **`['--test', '--test-reporter=tap', '--', target]`** — four arguments.
3. **But the leaked processes carry a huge flag list** (`--heap-prof-interval`,
   `--secure-heap`, `--tls-cipher-list`, `--test-isolation=process`, `--test-timeout=0`,
   …) ending in `…/prohib-hang-XzTeog/hang.test.cjs`. GSD does not pass any of those.
   That flag soup is **node's own**: it is how the test runner re-execs itself to spawn a
   **per-file worker**, serialising its full resolved option set to the child.
   `--test-isolation=process` has been the default since Node 22 (this machine: v26.7.0).

   *This is the load-bearing step, and it is why the leak survives: the survivors are the
   WORKERS, not the runner.*

4. `execFileSync`'s `timeout` sends `killSignal` (default `SIGTERM`) to the **direct child
   only** — the runner. It does not touch the runner's descendants.
5. At 1500 ms the runner is killed. The worker, spinning in `while (true) {}`, is
   **never signalled at all**, is reparented to PID 1, and busy-loops forever. Nothing
   else will ever stop it: `--test-timeout=0` disables node's own per-test timeout, and a
   tight `while (true)` loop blocks the event loop so no JS-level handler could run even
   if one were installed.

**The assertion still passes.** The test only asserts `result.status !== 'green'`, and a
killed runner produces exactly that. So the leak is invisible to the suite: green run,
one core gone, permanently.

---

## Why this is worth fixing rather than papering over

The test's own subject is **"B2: no unbounded subprocess"**. It asserts that a hung check
is killed and fails closed — and it is currently *demonstrating the opposite*: the check
fails closed while the subprocess is not killed. The assertion is satisfied by the runner
dying; nothing verifies that the thing actually consuming CPU stopped. The test proves the
verdict, not the reaping.

---

## Directions for the fix (as originally listed — now evaluated)

1. **Kill the process group.** Switch to `spawnSync`/`spawn` with `detached: true` so the
   child leads a new group, then `process.kill(-pid, 'SIGKILL')` on timeout. Reaps
   descendants. Note `execFileSync` cannot do this — the change is to the spawn call in
   `prohibition-enforcement.cjs`, which is shared by the eslint path too, so check both.
   → **CHOSEN.** Worked as described.
2. **Run the check with `--test-isolation=none`.** No worker is forked, so the direct
   child *is* the hanging process and the existing SIGTERM reaches it. Smallest diff, but
   it changes the execution model of every node-test check, not just this one.
   → **REJECTED — measured strictly WORSE, not merely broader.** With no worker, the
   subject runs *inside* the runner, and its tight loop blocks the event loop, so the
   runner's SIGTERM is queued and never processed. The bounded timeout stops working
   altogether: a 1500 ms bound did not fire, and the parent blocked until killed at 120 s.
   That converts a leaked orphan into the unbounded hang this module exists to prevent —
   a worse failure than the one being fixed. The writeup's "smallest diff" framing was
   wrong; recorded here so no one retries it.
3. **Escalate the signal.** SIGTERM then SIGKILL after a grace period. Does not help on
   its own here — the worker is never signalled at all — so this is only a complement to
   (1). → Folded into (1): the group is signalled with SIGKILL directly, since a subject
   in a tight loop can never run a JS-level handler for a catchable signal.

**Whichever is chosen, the test needs an arm that proves the reaping**, or the same leak
returns silently. Something like: capture the descendant PIDs before the timeout and
assert they are gone afterwards. Without that arm, this test will keep passing while
leaking, exactly as it does today. → **Done, as a control + treatment pair; see below.**

---

## Resolution

**Fix** — `src/prohibition-enforcement.cts` (the authored source; `gsd-core/bin/lib/*.cjs`
is a build artifact and is not tracked, so it must be regenerated with `npm run build:lib`,
not hand-edited — the original writeup pointed at the compiled copy).

All four `execFileSync` call sites (both node-test paths and both eslint paths) now route
through one helper, `runBoundedCapture`, which spawns with `detached: true` so the child
leads its own process group, and SIGKILLs the whole group in a `finally`. The reap is
unconditional rather than timeout-only, which makes the invariant simple enough to assert:
**no descendant of a bounded check outlives the call.**

Verified rather than assumed, on Node v26.7.0:

* `detached: true` really is honored by `spawnSync` — the child reports `pgid === pid`
  (group leader); without it the child inherits the caller's group. `@types/node` omits
  `detached` from `SpawnSyncOptions`, which is why the helper carries one narrow cast.
* The pre-fix spawn leaks exactly one spinning worker per hung check; the fixed path leaks
  none, polled over several seconds.

**Test** — `tests/prohibition-enforcement.test.cjs`, a new arm beside the original hang
test, structured as **control + treatment** in the same spirit as the file's own #1346
causation control. Asserting "no orphan survived" is worthless unless an orphan was
*possible*, so the CONTROL reproduces the pre-fix spawn and **requires** an orphan to
appear; the TREATMENT then runs the real path and requires none. That keeps the arm from
passing vacuously if the subject stops hanging, the runner stops forking a worker, or
`pgrep` detection silently breaks.

The control's env sanitation is load-bearing and was the one non-obvious part: inherited
`NODE_TEST_CONTEXT` tells the spawned runner it is already inside a test child, so it runs
the subject in-process and forks no worker — the control then orphans nothing and reports a
real leak as "not reproducible". It mirrors the lib's own `childEnv()` for that reason.

**The test is a real regression test**, confirmed in both directions: it FAILS against the
pre-fix build (treatment arm, with the diagnostic naming the surviving worker) and PASSES
against the fixed build, with the control arm holding in both runs.

**Suites run:** 191 tests across the prohibition/probe-core files (190 pass, 1 pre-existing
todo) and 280 across the `check-command-router` importers — including the #685 test that
pins `windowsHide: true` on spawns, which the helper preserves. eslint clean, including the
repo's own `local/no-unbounded-spawn` rule (which caught, correctly, that the new test's
`pgrep` call needed an explicit bound).

**Windows:** the group reap is POSIX-only (`process.kill(-pid)` has no Windows equivalent),
so Windows keeps the previous single-child kill and the new test skips there. The leak is
therefore still theoretically reachable on Windows; that was not investigated, because
`--test-isolation=process` worker behavior there was not measured.

---

## Cleanup

The seven original processes were killed on 2026-08-19 with a plain `SIGTERM` (none needed
`-9`). With the fix in place no new strays are produced, and full runs of the file were
polled clean. Any pre-existing strays elsewhere:

```sh
pgrep -fl "node --test-concurrency" | grep hang.test.cjs   # inspect first
pkill -f "prohib-hang"                                     # then kill
```

(The bracket in `prohib[-]hang` keeps the pattern from matching the shell command that
contains it — without it you will "find" your own `grep` and chase a phantom.)

---

## What is NOT claimed here

*The three bullets below were true when this was written; each is now settled. Kept as a
record of what was and was not known at diagnosis time.*

* ~~No fix was attempted and no GSD code was changed~~ — fixed, see Resolution.
* ~~The three fix directions above are **unevaluated**~~ — all three are now evaluated;
  direction 2 was measured to be actively harmful, which the writeup did not anticipate.
* ~~Whether other tests in this file leak the same way was not checked~~ — swept. The
  reasoned expectation held: across `tests/`, the only other bare loops
  (`edge-probe-planner-contract.test.cjs:40`, `drift-detection.test.cjs:891`) are
  in-process string scanners with `break`/`return` exits, not spawned subjects, and the
  `Atomics.wait` hits are deliberate CPU-*yielding* sleeps. The hang test was the sole
  leak site.

Still not claimed, after the fix:

* Windows behavior was not measured (see Resolution).
* The reap addresses descendants in the child's process group. A grandchild that
  deliberately calls `setsid` to leave that group would still escape; nothing in the
  current check paths does so, but it is not structurally prevented.
