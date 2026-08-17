// allow-test-rule: source-text-is-the-product (#1190)
// Agent .md files, config JSON, and fixture markdown files are the deployed contract.
// Testing text content tests the deployed contract directly.
// Per CONTRIBUTING.md exception matrix.

/**
 * Phase 3 Teach Phase — Static Contract Test Suite (Wave-0 RED scaffold)
 *
 * Covers acceptance criteria for CODIFY-01, CODIFY-02, CODIFY-04 (knob registration,
 * 4-surface routing, HITL-no-auto-write, empty-candidate no-op, command frontmatter).
 * All assertions are deterministic source-text reads — no live LLM execution.
 *
 * Expected state after Wave 0 (this plan, 03-01):
 *   - All blocks RED — teach-phase.md and commands/gsd/teach-phase.md do not exist yet.
 *   - RED is the intended state. Do NOT stub the files.
 *
 * Expected state after Wave 2 (plans implementing teach): all assertions GREEN.
 *
 * See: .planning/phases/03-lens-reuse-codify/03-SPEC.md (CODIFY-01/02/04)
 */

'use strict';

const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const WORKFLOWS_DIR = path.join(REPO_ROOT, 'gsd-core', 'workflows');
const COMMANDS_DIR = path.join(REPO_ROOT, 'commands', 'gsd');

const { VALID_CONFIG_KEYS } = require('../gsd-core/bin/lib/config-schema.cjs');

// ─── TEACH-CONFIG: config knob registration (CODIFY-01) ─────────────────────

describe('TEACH-CONFIG: config knob registration (CODIFY-01)', () => {
  test('config.json contains workflow.teach_phase: false', () => {
    const cfgPath = path.join(REPO_ROOT, 'gsd-core', 'templates', 'config.json');
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
    assert.strictEqual(
      cfg.workflow.teach_phase,
      false,
      'gsd-core/templates/config.json must have workflow.teach_phase: false (default opt-out)'
    );
  });

  test('workflow.teach_phase is registered in config-schema.cjs', () => {
    assert.ok(
      VALID_CONFIG_KEYS.has('workflow.teach_phase'),
      'workflow.teach_phase must be registered in VALID_CONFIG_KEYS in config-schema.manifest.json (CODIFY-01)'
    );
  });
});

// ─── TEACH-DOCS: documentation parity (CODIFY-01) ────────────────────────────

describe('TEACH-DOCS: docs/CONFIGURATION.md and FORK.md parity (CODIFY-01)', () => {
  test('docs/CONFIGURATION.md contains workflow.teach_phase', () => {
    const configDoc = fs.readFileSync(path.join(REPO_ROOT, 'docs', 'CONFIGURATION.md'), 'utf-8');
    assert.ok(
      configDoc.includes('workflow.teach_phase'),
      'docs/CONFIGURATION.md must document workflow.teach_phase in the Workflow Toggles table (CODIFY-01)'
    );
  });

  test('FORK.md contains workflow.teach_phase', () => {
    const forkDoc = fs.readFileSync(path.join(REPO_ROOT, 'FORK.md'), 'utf-8');
    assert.ok(
      forkDoc.includes('workflow.teach_phase'),
      'FORK.md must document workflow.teach_phase in the config-keys table (CODIFY-01)'
    );
  });
});

// ─── TEACH-WORKFLOW: teach-phase.md source-text contract (CODIFY-02/04) ─────
//
// Uses before() to read the workflow text once per describe block.
// If the file does not exist yet (Wave 0 state), every test in this group fails
// with a consistent ENOENT error — that is the expected RED state. Do NOT stub.

describe('TEACH-WORKFLOW: teach-phase.md source-text contract (CODIFY-02/04)', () => {
  let workflowText;

  before(() => {
    workflowText = fs.readFileSync(
      path.join(WORKFLOWS_DIR, 'teach-phase.md'),
      'utf-8'
    );
  });

  test('knob gate: contains workflow.teach_phase read', () => {
    assert.ok(
      workflowText.includes('workflow.teach_phase'),
      'gsd-core/workflows/teach-phase.md must contain "workflow.teach_phase" — the config-get knob read (CODIFY-01/02)'
    );
  });

  test('knob gate: contains exit-when-false guard', () => {
    const hasGuard =
      /TEACH.*!=.*"?false"?/s.test(workflowText) ||
      workflowText.includes('skipping teach phase');
    assert.ok(
      hasGuard,
      'gsd-core/workflows/teach-phase.md must contain an exit-when-false guard — ' +
      'matching /TEACH.*!=.*"?false"?/ OR containing "skipping teach phase" (CODIFY-02)'
    );
  });

  test('four-surface routing: "hook" keyword present', () => {
    assert.ok(
      workflowText.includes('hook'),
      'gsd-core/workflows/teach-phase.md must contain the surface keyword "hook" (CODIFY-02/D-01)'
    );
  });

  test('four-surface routing: "MCP tool" keyword present', () => {
    assert.ok(
      workflowText.includes('MCP tool'),
      'gsd-core/workflows/teach-phase.md must contain the surface keyword "MCP tool" (CODIFY-02/D-01)'
    );
  });

  test('four-surface routing: "skill" keyword present', () => {
    assert.ok(
      workflowText.includes('skill'),
      'gsd-core/workflows/teach-phase.md must contain the surface keyword "skill" (CODIFY-02/D-01)'
    );
  });

  test('four-surface routing: "rules" keyword present', () => {
    assert.ok(
      workflowText.includes('rules'),
      'gsd-core/workflows/teach-phase.md must contain the surface keyword "rules" (CODIFY-02/D-01)'
    );
  });

  test('four-surface routing: precedence string "hook > MCP tool > skill > rules" present', () => {
    assert.ok(
      workflowText.includes('hook > MCP tool > skill > rules'),
      'gsd-core/workflows/teach-phase.md must contain the precedence string "hook > MCP tool > skill > rules" (CODIFY-02/D-04)'
    );
  });

  test('HITL only: does NOT write to .claude/rules/ paths', () => {
    assert.ok(
      !workflowText.match(/write.*\.claude\/rules/i),
      'gsd-core/workflows/teach-phase.md must NOT contain "write.*\\.claude/rules" — teach emits proposals only, never auto-writes (CODIFY-02/D-05)'
    );
  });

  test('HITL only: does NOT write to .claude/skills/ paths', () => {
    assert.ok(
      !workflowText.match(/write.*\.claude\/skills/i),
      'gsd-core/workflows/teach-phase.md must NOT contain "write.*\\.claude/skills" — teach emits proposals only, never auto-writes (CODIFY-02/D-05)'
    );
  });

  test('empty-candidate guard: contains zero-entries check before writing NN-TEACH.md', () => {
    const hasGuard = /zero.*candidate|no.*NN-TEACH|TEACH_ENTRIES.*0|no.*entries/si.test(workflowText);
    assert.ok(
      hasGuard,
      'gsd-core/workflows/teach-phase.md must contain a zero-entries guard before writing NN-TEACH.md ' +
      '— matching /zero.*candidate|no.*NN-TEACH|TEACH_ENTRIES.*0|no.*entries/si (CODIFY-02/D-02)'
    );
  });

  test('candidate sourcing: calls extract-learnings (not re-derives)', () => {
    assert.ok(
      workflowText.includes('extract-learnings'),
      'gsd-core/workflows/teach-phase.md must contain "extract-learnings" — teach delegates to gsd:extract-learnings, does not re-derive (CODIFY-02/D-05)'
    );
  });

  test('candidate sourcing: does NOT write via graduation path', () => {
    assert.ok(
      !workflowText.match(/graduation.*write|write.*graduation/i),
      'gsd-core/workflows/teach-phase.md must NOT contain a "graduation...write" or "write...graduation" pattern — graduation is the rules-surface path, teach proposes only (CODIFY-02/RETRO-08)'
    );
  });
});

// ─── TEACH-COMMAND: command frontmatter (CODIFY-04) ──────────────────────────

describe('TEACH-COMMAND: command frontmatter (CODIFY-04)', () => {
  test('commands/gsd/teach-phase.md has name: gsd:teach-phase', () => {
    const cmdText = fs.readFileSync(
      path.join(COMMANDS_DIR, 'teach-phase.md'),
      'utf-8'
    );
    assert.ok(
      cmdText.includes('name: gsd:teach-phase'),
      'commands/gsd/teach-phase.md must contain "name: gsd:teach-phase" in its frontmatter (CODIFY-04, colon-form authoring)'
    );
  });
});

describe('TEACH-WIRING: phase-tail wiring + verifier nudge + docs (CODIFY-03)', () => {
  const AGENTS_DIR = path.join(REPO_ROOT, 'agents');

  test('autonomous.md invokes gsd-teach-phase, knob-gated and non-blocking', () => {
    const text = fs.readFileSync(path.join(WORKFLOWS_DIR, 'autonomous.md'), 'utf-8');
    assert.ok(
      text.includes('Skill(skill="gsd-teach-phase"'),
      'autonomous.md must invoke Skill(skill="gsd-teach-phase", ...) in the phase tail'
    );
    assert.ok(
      text.includes('workflow.teach_phase'),
      'autonomous.md teach step must gate on workflow.teach_phase'
    );
    assert.ok(
      /non-blocking/i.test(text),
      'autonomous.md teach step must be documented as non-blocking'
    );
  });

  test('autonomous.md runs teach BEFORE the iterate/transition step', () => {
    const text = fs.readFileSync(path.join(WORKFLOWS_DIR, 'autonomous.md'), 'utf-8');
    const teachIdx = text.indexOf('Skill(skill="gsd-teach-phase"');
    const iterateIdx = text.indexOf('<step name="iterate">');
    assert.ok(teachIdx !== -1 && iterateIdx !== -1, 'both teach call and iterate step must exist');
    assert.ok(
      teachIdx < iterateIdx,
      'teach must run before the iterate/transition step (CODIFY-03: after execute/verify, before transition)'
    );
  });

  test('gsd-verifier.md has a knob-gated Step 7e teach-readiness nudge', () => {
    const text = fs.readFileSync(path.join(AGENTS_DIR, 'gsd-verifier.md'), 'utf-8');
    assert.ok(text.includes('Step 7e'), 'gsd-verifier.md must define Step 7e');
    assert.ok(
      text.includes('workflow.teach_phase'),
      'Step 7e must gate on workflow.teach_phase'
    );
    assert.ok(
      text.includes('/gsd:teach-phase'),
      'Step 7e nudge must point at /gsd:teach-phase'
    );
  });

  test('verify-work.md documents /gsd:teach-phase as a next step', () => {
    const text = fs.readFileSync(path.join(WORKFLOWS_DIR, 'verify-work.md'), 'utf-8');
    assert.ok(
      text.includes('/gsd:teach-phase'),
      'verify-work.md next-step routing must list /gsd:teach-phase (the codify step after verify-work)'
    );
  });
});
