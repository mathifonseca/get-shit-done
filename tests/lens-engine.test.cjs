// allow-test-rule: source-text-is-the-product
// Agent .md files, config JSON, and fixture markdown files are the deployed contract.
// Testing text content tests the deployed contract directly.
// Per CONTRIBUTING.md exception matrix.

/**
 * Phase 1 Lens Engine — Static Contract Test Suite
 *
 * Covers acceptance criteria AC-1..AC-8 that are not served by auto-enumerated
 * tests (agent-frontmatter, bug-3677, agent-size-budget). All assertions are
 * deterministic source-text reads — no live LLM execution (D-10).
 *
 * Expected state after Wave 1 (this plan, 01-01):
 *   - LENS-CONFIG, LENS-DOCS, LENS-AGENT, LENS-SYNTH assertions: RED
 *     (agents/gsd-lens.md, agents/gsd-lens-synthesizer.md, config knob, and
 *      doc rows do not exist yet — they land in Wave 2)
 *   - LENS-FIXTURE assertions: GREEN (fixtures authored in this plan)
 *
 * Expected state after Wave 2 (plans 01-02, 01-03): all assertions GREEN.
 *
 * See: .planning/phases/01-lens-engine/01-VALIDATION.md
 */

'use strict';

const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(REPO_ROOT, 'agents');
const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'lens-engine');

const { VALID_CONFIG_KEYS } = require('../gsd-core/bin/lib/config-schema.cjs');

// ─── LENS-CONFIG: config knob registration ────────────────────────────────

describe('LENS-CONFIG: config knob registration (AC-1, RETRO-01/D-07)', () => {
  test('config.json contains workflow.milestone_retro: false', () => {
    const cfgPath = path.join(REPO_ROOT, 'gsd-core', 'templates', 'config.json');
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
    assert.strictEqual(
      cfg.workflow.milestone_retro,
      false,
      'gsd-core/templates/config.json must have workflow.milestone_retro: false (default opt-out)'
    );
  });

  test('workflow.milestone_retro is registered in config-schema.cjs', () => {
    assert.ok(
      VALID_CONFIG_KEYS.has('workflow.milestone_retro'),
      'workflow.milestone_retro must be registered in VALID_CONFIG_KEYS in config-schema.manifest.json'
    );
  });
});

// ─── LENS-DOCS: documentation parity (AC-2, RETRO-01/D-07) ──────────────

describe('LENS-DOCS: docs/CONFIGURATION.md and FORK.md parity (AC-2)', () => {
  test('docs/CONFIGURATION.md contains workflow.milestone_retro', () => {
    const configDoc = fs.readFileSync(path.join(REPO_ROOT, 'docs', 'CONFIGURATION.md'), 'utf-8');
    assert.ok(
      configDoc.includes('workflow.milestone_retro'),
      'docs/CONFIGURATION.md must document workflow.milestone_retro in the Workflow Toggles table'
    );
  });

  test('FORK.md contains workflow.milestone_retro', () => {
    const forkDoc = fs.readFileSync(path.join(REPO_ROOT, 'FORK.md'), 'utf-8');
    assert.ok(
      forkDoc.includes('workflow.milestone_retro'),
      'FORK.md must document workflow.milestone_retro in the config-keys table'
    );
  });
});

// ─── LENS-AGENT: gsd-lens.md contract (AC-3, AC-5, AC-8, RETRO-01/RETRO-03/D-08) ──

describe('LENS-AGENT: gsd-lens.md structural contract (AC-3, AC-5, AC-8)', () => {
  let content;

  // Use before() to load the file once for all tests in this describe block.
  // If the file does not exist yet (Wave 1 state), every test in this group fails
  // with a consistent "file not found" error — that is the expected RED state.
  before(() => {
    content = fs.readFileSync(path.join(AGENTS_DIR, 'gsd-lens.md'), 'utf-8');
  });

  test('gsd-lens.md exists in agents/', () => {
    assert.ok(
      fs.existsSync(path.join(AGENTS_DIR, 'gsd-lens.md')),
      'agents/gsd-lens.md must exist (AC-8 generic naming, not retro-*)'
    );
  });

  test('gsd-lens.md contains name: gsd-lens', () => {
    assert.ok(
      content.includes('name: gsd-lens'),
      'gsd-lens.md frontmatter must contain "name: gsd-lens" (AC-8)'
    );
  });

  test('gsd-lens.md documents schema field: identity', () => {
    assert.ok(
      content.includes('identity'),
      'gsd-lens.md must document lens-config schema field "identity" (AC-5, D-08)'
    );
  });

  test('gsd-lens.md documents schema field: artifacts-to-mine', () => {
    assert.ok(
      content.includes('artifacts-to-mine'),
      'gsd-lens.md must document lens-config schema field "artifacts-to-mine" (AC-5, D-08)'
    );
  });

  test('gsd-lens.md documents schema field: output-contract', () => {
    assert.ok(
      content.includes('output-contract'),
      'gsd-lens.md must document lens-config schema field "output-contract" (AC-5, D-08)'
    );
  });

  test('gsd-lens.md documents schema field: isolation', () => {
    assert.ok(
      content.includes('isolation'),
      'gsd-lens.md must document lens-config schema field "isolation" (AC-5, D-08)'
    );
  });

  test('gsd-lens.md contains read-only isolation contract', () => {
    assert.ok(
      content.includes('read-only'),
      'gsd-lens.md must document read-only access for lens artifact mining (AC-3, D-03)'
    );
  });

  test('gsd-lens.md enumerates lens identity: planner', () => {
    assert.ok(
      content.includes('planner'),
      'gsd-lens.md must enumerate "planner" lens identity as an example (AC-5, RETRO-03)'
    );
  });

  test('gsd-lens.md enumerates lens identity: executor', () => {
    assert.ok(
      content.includes('executor'),
      'gsd-lens.md must enumerate "executor" lens identity as an example (AC-5, RETRO-03)'
    );
  });

  test('gsd-lens.md enumerates lens identity: reviewer', () => {
    assert.ok(
      content.includes('reviewer'),
      'gsd-lens.md must enumerate "reviewer" (reviewer-qa) lens identity as an example (AC-5, RETRO-03)'
    );
  });

  test('gsd-lens.md enumerates lens identity: scope', () => {
    assert.ok(
      content.includes('scope'),
      'gsd-lens.md must enumerate "scope" (scope-ceo) lens identity as an example (AC-5, RETRO-03)'
    );
  });

  test('gsd-lens.md does NOT contain write_retrospective (genericity: no retro hardcode)', () => {
    // Per D-08 Pitfall 1: gsd-lens is generic — it must not name write_retrospective.
    // The agent defines the schema and examples; Phase 2 retro.md does the wiring.
    assert.ok(
      !content.includes('write_retrospective'),
      'gsd-lens.md must NOT contain "write_retrospective" — the lens is generic, not retro-specific (AC-3, D-08)'
    );
  });
});

// ─── LENS-SYNTH: gsd-lens-synthesizer.md contract (AC-4, AC-8, RETRO-02/D-06/D-09) ──

describe('LENS-SYNTH: gsd-lens-synthesizer.md structural contract (AC-4, AC-8)', () => {
  let content;

  before(() => {
    content = fs.readFileSync(path.join(AGENTS_DIR, 'gsd-lens-synthesizer.md'), 'utf-8');
  });

  test('gsd-lens-synthesizer.md exists in agents/', () => {
    assert.ok(
      fs.existsSync(path.join(AGENTS_DIR, 'gsd-lens-synthesizer.md')),
      'agents/gsd-lens-synthesizer.md must exist (AC-8 generic naming, not retro-*)'
    );
  });

  test('gsd-lens-synthesizer.md contains name: gsd-lens-synthesizer', () => {
    assert.ok(
      content.includes('name: gsd-lens-synthesizer'),
      'gsd-lens-synthesizer.md frontmatter must contain "name: gsd-lens-synthesizer" (AC-8)'
    );
  });

  test('gsd-lens-synthesizer.md contains Tensions output token', () => {
    assert.ok(
      content.includes('Tensions'),
      'gsd-lens-synthesizer.md must reference "Tensions" (its output contract, AC-4, D-06)'
    );
  });

  test('gsd-lens-synthesizer.md contains Candidate change: shape token', () => {
    assert.ok(
      content.includes('Candidate change:'),
      'gsd-lens-synthesizer.md must document "Candidate change:" in the tensions output shape (AC-4, D-06)'
    );
  });

  test('gsd-lens-synthesizer.md contains a no-blend invariant token', () => {
    // Must contain at least one of: "NEVER collapse", "do NOT blend", "never blend"
    // This is the load-bearing disagreement-preservation invariant (AC-4, D-06, D-09).
    const hasNeverCollapse = content.includes('NEVER collapse');
    const hasDoNotBlend = content.includes('do NOT blend');
    const hasNeverBlend = content.includes('never blend');
    assert.ok(
      hasNeverCollapse || hasDoNotBlend || hasNeverBlend,
      'gsd-lens-synthesizer.md must contain a no-blend invariant: ' +
      '"NEVER collapse" OR "do NOT blend" OR "never blend" (AC-4, D-06, D-09, RETRO-02)'
    );
  });
});

// ─── LENS-FIXTURE: canned-position smoke check (AC-6, RETRO-02/D-10) ────

describe('LENS-FIXTURE: canned-position fixture smoke check (AC-6, D-10)', () => {
  test('position-planner.md exists', () => {
    assert.ok(
      fs.existsSync(path.join(FIXTURE_DIR, 'position-planner.md')),
      'tests/fixtures/lens-engine/position-planner.md must exist (AC-6)'
    );
  });

  test('position-planner.md contains lens identity token: planner', () => {
    const content = fs.readFileSync(path.join(FIXTURE_DIR, 'position-planner.md'), 'utf-8');
    assert.ok(
      content.includes('planner'),
      'position-planner.md must contain "planner" (AC-6)'
    );
  });

  test('position-executor.md exists', () => {
    assert.ok(
      fs.existsSync(path.join(FIXTURE_DIR, 'position-executor.md')),
      'tests/fixtures/lens-engine/position-executor.md must exist (AC-6)'
    );
  });

  test('position-executor.md contains lens identity token: executor', () => {
    const content = fs.readFileSync(path.join(FIXTURE_DIR, 'position-executor.md'), 'utf-8');
    assert.ok(
      content.includes('executor'),
      'position-executor.md must contain "executor" (AC-6)'
    );
  });

  test('expected-tensions.md has >=2 ### T{n} blocks', () => {
    const expected = fs.readFileSync(path.join(FIXTURE_DIR, 'expected-tensions.md'), 'utf-8');
    const blocks = expected.match(/^### T\d+/gm);
    assert.ok(
      blocks && blocks.length >= 2,
      `expected-tensions.md must have >=2 tension blocks, got ${blocks?.length ?? 0} (AC-6, D-06)`
    );
  });

  test('expected-tensions.md contains Candidate change:', () => {
    const expected = fs.readFileSync(path.join(FIXTURE_DIR, 'expected-tensions.md'), 'utf-8');
    assert.ok(
      expected.includes('Candidate change:'),
      'expected-tensions.md must contain "Candidate change:" in each tension block (AC-6, D-06)'
    );
  });

  test('expected-tensions.md preserves both lens positions separately (planner not collapsed into executor)', () => {
    const expected = fs.readFileSync(path.join(FIXTURE_DIR, 'expected-tensions.md'), 'utf-8');
    // Both identities must appear as distinct bullet lines — neither collapsed into the other.
    const lines = expected.split('\n');
    const plannerLine = lines.some(l => l.trim().startsWith('- planner'));
    const executorLine = lines.some(l => l.trim().startsWith('- executor'));
    assert.ok(
      plannerLine,
      'expected-tensions.md must have a bullet starting with "- planner" (positions preserved, not blended)'
    );
    assert.ok(
      executorLine,
      'expected-tensions.md must have a bullet starting with "- executor" (positions preserved, not blended)'
    );
  });
});
