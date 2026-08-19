/**
 * Tests for gsd-workflow-guard.js PreToolUse hook.
 *
 * #2304 — Kimi tool vocabulary engages the guard: Kimi CLI registers this
 * guard with matcher 'Shell|WriteFile|StrReplaceFile' and forwards its own
 * tool vocabulary (tool_name 'Shell', possibly module-qualified). kimi-cli's
 * Shell.Params names its field `command` (src/kimi_cli/tools/shell/
 * __init__.py), same as Claude's Bash, so only the tool name needs
 * normalization. Pre-fix the guard's Bash branch never matched on Kimi and
 * the force-add block was silently dormant.
 */

'use strict';

process.env.GSD_TEST_MODE = '1';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runHook: runHookSeam } = require('./helpers/process-seam.cjs');
const { throwIfFailed } = require('./helpers/git-fixture.cjs');

const { cleanup } = require('./helpers.cjs');

const HOOK_PATH = path.join(__dirname, '..', 'hooks', 'gsd-workflow-guard.js');

function runHook(payload, timeoutMs = 5000) {
  const input = JSON.stringify(payload);
  const r = runHookSeam(HOOK_PATH, [], { input, timeoutMs });
  if (r.exitCode === 0) {
    return { exitCode: 0, stdout: r.stdout.trim(), stderr: '' };
  }
  return {
    exitCode: r.exitCode ?? 1,
    stdout: r.stdout.trim(),
    stderr: r.stderr.trim(),
  };
}

describe('#2304: Kimi tool vocabulary engages the workflow guard', () => {
  // A repo on a worktree-agent-* branch with the guard enabled: the one
  // state where the Bash branch produces an observable block, so a dormant
  // guard (silent exit 0) is distinguishable from a working one (exit 2).
  let repoDir;

  before(() => {
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-workflow-guard-'));
    const initResult = runHookSeam(
      '-c',
      ['git init -q -b worktree-agent-test && git config user.email t@t && git config user.name t'],
      { interpreter: 'bash', cwd: repoDir },
    );
    throwIfFailed(initResult, 'bash -c <git init/config for gsd-workflow-guard fixture>');
    fs.mkdirSync(path.join(repoDir, '.planning'));
    fs.writeFileSync(
      path.join(repoDir, '.planning', 'config.json'),
      JSON.stringify({ hooks: { workflow_guard: true } })
    );
  });

  after(() => {
    cleanup(repoDir);
  });

  test('Shell force-add on a worktree-agent branch is blocked like Bash', () => {
    const r = runHook({
      tool_name: 'Shell',
      tool_input: { command: 'git add -f secrets.env' },
      cwd: repoDir,
    });
    assert.equal(r.exitCode, 2, 'Kimi Shell should reach the Bash branch and block');
    const output = JSON.parse(r.stdout);
    assert.equal(
      output.code,
      'WORKTREE_AGENT_FORCE_ADD_FORBIDDEN',
      'block payload should carry the force-add code'
    );
    assert.ok(
      r.stderr.includes('must not run git add -f'),
      'reason must reach stderr — that is what Kimi feeds back to the model on exit 2'
    );
  });

  test('module-qualified kimi_cli.tools.shell:Shell is recognized', () => {
    const r = runHook({
      tool_name: 'kimi_cli.tools.shell:Shell',
      tool_input: { command: 'git add --force secrets.env' },
      cwd: repoDir,
    });
    assert.equal(r.exitCode, 2);
    assert.equal(JSON.parse(r.stdout).code, 'WORKTREE_AGENT_FORCE_ADD_FORBIDDEN');
  });

  test('benign Shell command passes through', () => {
    const r = runHook({
      tool_name: 'Shell',
      tool_input: { command: 'git status' },
      cwd: repoDir,
    });
    assert.equal(r.exitCode, 0);
    assert.equal(r.stdout, '');
  });

  test('Bash (Claude vocabulary) still blocks — normalization is additive', () => {
    const r = runHook({
      tool_name: 'Bash',
      tool_input: { command: 'git add -f secrets.env' },
      cwd: repoDir,
    });
    assert.equal(r.exitCode, 2);
    assert.equal(JSON.parse(r.stdout).code, 'WORKTREE_AGENT_FORCE_ADD_FORBIDDEN');
  });

  test('WriteFile outside .planning/ gets the workflow advisory like Write', () => {
    const r = runHook({
      tool_name: 'WriteFile',
      tool_input: { path: path.join(repoDir, 'src', 'app.js'), content: 'x' },
      cwd: repoDir,
    });
    assert.equal(r.exitCode, 0);
    const output = JSON.parse(r.stdout);
    assert.ok(
      output.hookSpecificOutput?.additionalContext?.includes('WORKFLOW ADVISORY'),
      'Kimi WriteFile should reach the write branch and emit the advisory'
    );
  });

  test('StrReplaceFile editing .planning/ passes silently', () => {
    const r = runHook({
      tool_name: 'StrReplaceFile',
      tool_input: { path: path.join(repoDir, '.planning', 'notes.md'), edit: { old: 'a', new: 'b' } },
      cwd: repoDir,
    });
    assert.equal(r.exitCode, 0);
    assert.equal(r.stdout, '');
  });

  // #2547 — normalizeKimiPayload rebuilt old_string/new_string with
  // `String(e.old ?? '')`. `??` guards the value, not the dereference, so a
  // NULLISH entry threw a TypeError at the top of the handler, before the Bash
  // branch ran. The outer `catch { process.exit(0) }` swallowed it, so a Shell
  // payload carrying a spurious malformed `edit` field walked straight past the
  // force-add hard block. The `edit` field is never read on the Bash path — it
  // only has to be present to trigger the crash, which is what makes this
  // reachable from a command that has nothing to do with editing.
  //
  // The boundary is nullish specifically: `('x').old` is a legal property read
  // yielding undefined, so a string entry never threw. The `null entry` case is
  // the regression (exits 0 against pre-fix code); the rest are controls.
  describe('#2547: a spurious malformed edit field does not disarm the force-add block', () => {
    for (const [label, edit] of [
      ['null entry (the #2547 bypass)', [null]],
      // `{"toString": null}` is valid JSON whose coercion throws "Cannot
      // convert object to primitive value" — the same crash-to-allow reached
      // through String() rather than through the property read.
      ['non-coercible old (the #2547 String() bypass)', [{ old: { toString: null }, new: 'x' }]],
      ['non-coercible new (the #2547 String() bypass)', [{ old: 'x', new: { toString: null } }]],
      ['string entry (control — never threw)', ['nope']],
      ['bare null, not a list (control — normalizes to no edits)', null],
    ]) {
      test(`force-add still blocks with a spurious edit field (${label})`, () => {
        const r = runHook({
          tool_name: 'Shell',
          tool_input: { command: 'git add -f secrets.env', edit },
          cwd: repoDir,
        });
        assert.equal(r.exitCode, 2,
          `a spurious malformed edit field (${label}) must not downgrade the force-add ` +
          `block to a silent allow. Got exit ${r.exitCode}. stderr: ${r.stderr}`);
        assert.equal(JSON.parse(r.stdout).code, 'WORKTREE_AGENT_FORCE_ADD_FORBIDDEN');
      });
    }

    test('benign command with a malformed edit field still passes (no over-block)', () => {
      const r = runHook({
        tool_name: 'Shell',
        tool_input: { command: 'git status', edit: [null] },
        cwd: repoDir,
      });
      assert.equal(r.exitCode, 0, `benign command must stay allowed. stderr: ${r.stderr}`);
      assert.equal(r.stdout, '');
    });
  });
});

// workflow_guard_strict — the hard-block upgrade of the soft advisory (FORK.md
// pattern row, zarar.dev agent-hooks source). CONTROL + TREATMENT pair: the
// treatment alone proves nothing — exit 2 could come from anywhere — so the
// control runs the IDENTICAL payload with only the strict flag flipped off and
// must get the pre-existing advisory (exit 0, edit proceeds). Only the config
// bit may separate the two outcomes.
describe('workflow_guard_strict: hard-block upgrade (control/treatment)', () => {
  let repoDir;
  let editPayload;

  function writeHooksConfig(hooks) {
    fs.writeFileSync(
      path.join(repoDir, '.planning', 'config.json'),
      JSON.stringify({ hooks })
    );
  }

  before(() => {
    // No git init: the Write/Edit path never shells out to git, and keeping
    // the fixture git-free pins that strict mode doesn't grow a git
    // dependency the soft path never had.
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-workflow-guard-strict-'));
    fs.mkdirSync(path.join(repoDir, '.planning'));
    editPayload = {
      tool_name: 'Write',
      tool_input: { file_path: path.join(repoDir, 'src', 'app.js'), content: 'x' },
      cwd: repoDir,
    };
  });

  after(() => {
    cleanup(repoDir);
  });

  test('TREATMENT: guard + strict on -> decision:block, exit 2, reason on stderr', () => {
    writeHooksConfig({ workflow_guard: true, workflow_guard_strict: true });
    const r = runHook(editPayload);
    assert.equal(r.exitCode, 2, `strict mode must hard-block. stderr: ${r.stderr}`);
    const output = JSON.parse(r.stdout);
    assert.equal(output.decision, 'block');
    assert.equal(output.code, 'GSD_WORKFLOW_GUARD_STRICT');
    assert.ok(
      output.reason.includes('/gsd:fast') && output.reason.includes('workflow_guard_strict'),
      'reason must name the escape hatches (/gsd:fast, the config flag), not just refuse'
    );
    assert.ok(
      r.stderr.includes('workflow_guard_strict'),
      'reason must reach stderr — that is what Kimi feeds back to the model on exit 2'
    );
  });

  for (const [label, hooks] of [
    ['strict absent', { workflow_guard: true }],
    ['strict explicitly false', { workflow_guard: true, workflow_guard_strict: false }],
  ]) {
    test(`CONTROL: identical payload, ${label} -> soft advisory unchanged (exit 0)`, () => {
      writeHooksConfig(hooks);
      const r = runHook(editPayload);
      assert.equal(r.exitCode, 0, `soft mode must not block. stderr: ${r.stderr}`);
      const output = JSON.parse(r.stdout);
      assert.equal(output.decision, undefined, 'soft mode must not carry a decision field');
      assert.ok(
        output.hookSpecificOutput?.additionalContext?.includes('WORKFLOW ADVISORY'),
        'soft mode must keep emitting the advisory'
      );
    });
  }

  test('strict without the base guard is a no-op (strict upgrades, never stands alone)', () => {
    writeHooksConfig({ workflow_guard: false, workflow_guard_strict: true });
    const r = runHook(editPayload);
    assert.equal(r.exitCode, 0);
    assert.equal(r.stdout, '', 'guard disabled means silence, not a block and not an advisory');
  });

  test('strict on: .planning/ edits stay exempt (strict must not widen the guarded surface)', () => {
    writeHooksConfig({ workflow_guard: true, workflow_guard_strict: true });
    const r = runHook({
      tool_name: 'Write',
      tool_input: { file_path: path.join(repoDir, '.planning', 'notes.md'), content: 'x' },
      cwd: repoDir,
    });
    assert.equal(r.exitCode, 0);
    assert.equal(r.stdout, '');
  });

  test('strict on: allowlisted files (CLAUDE.md) stay exempt', () => {
    writeHooksConfig({ workflow_guard: true, workflow_guard_strict: true });
    const r = runHook({
      tool_name: 'Write',
      tool_input: { file_path: path.join(repoDir, 'CLAUDE.md'), content: 'x' },
      cwd: repoDir,
    });
    assert.equal(r.exitCode, 0);
    assert.equal(r.stdout, '');
  });

  test('strict on: subagent context stays exempt (a hard block must not fire inside GSD executors)', () => {
    writeHooksConfig({ workflow_guard: true, workflow_guard_strict: true });
    const r = runHook({
      tool_name: 'Write',
      tool_input: { file_path: path.join(repoDir, 'src', 'app.js'), content: 'x', is_subagent: true },
      cwd: repoDir,
    });
    assert.equal(r.exitCode, 0);
    assert.equal(r.stdout, '');
  });

  test('strict blocks through Kimi vocabulary too (WriteFile + path)', () => {
    writeHooksConfig({ workflow_guard: true, workflow_guard_strict: true });
    const r = runHook({
      tool_name: 'WriteFile',
      tool_input: { path: path.join(repoDir, 'src', 'app.js'), content: 'x' },
      cwd: repoDir,
    });
    assert.equal(r.exitCode, 2, `Kimi WriteFile must hit the same strict block. stderr: ${r.stderr}`);
    assert.equal(JSON.parse(r.stdout).code, 'GSD_WORKFLOW_GUARD_STRICT');
  });
});
