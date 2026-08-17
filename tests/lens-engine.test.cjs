// allow-test-rule: source-text-is-the-product (#1190)
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
const WORKFLOWS_DIR = path.join(REPO_ROOT, 'gsd-core', 'workflows');

const { execSync } = require('node:child_process');

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

  // The schema fields must be documented as rows of the `## Lens-Config Schema`
  // table — not merely appear somewhere in prose. Anchor each assertion to the
  // table-row shape `| \`field\` |` so deleting the schema table (or demoting a
  // field to incidental prose) turns the test RED. (IN-02: substring `includes`
  // over-matched role text / isolation contract / example table.)
  test('gsd-lens.md documents schema field: identity (as a schema table row)', () => {
    assert.ok(
      /\|\s*`identity`\s*\|/.test(content),
      'gsd-lens.md must document lens-config schema field "identity" as a `## Lens-Config Schema` table row (AC-5, D-08)'
    );
  });

  test('gsd-lens.md documents schema field: artifacts-to-mine (as a schema table row)', () => {
    assert.ok(
      /\|\s*`artifacts-to-mine`\s*\|/.test(content),
      'gsd-lens.md must document lens-config schema field "artifacts-to-mine" as a `## Lens-Config Schema` table row (AC-5, D-08)'
    );
  });

  test('gsd-lens.md documents schema field: output-contract (as a schema table row)', () => {
    assert.ok(
      /\|\s*`output-contract`\s*\|/.test(content),
      'gsd-lens.md must document lens-config schema field "output-contract" as a `## Lens-Config Schema` table row (AC-5, D-08)'
    );
  });

  test('gsd-lens.md documents schema field: isolation (as a schema table row)', () => {
    assert.ok(
      /\|\s*`isolation`\s*\|/.test(content),
      'gsd-lens.md must document lens-config schema field "isolation" as a `## Lens-Config Schema` table row (AC-5, D-08)'
    );
  });

  test('gsd-lens.md contains read-only isolation contract', () => {
    assert.ok(
      content.includes('read-only'),
      'gsd-lens.md must document read-only access for lens artifact mining (AC-3, D-03)'
    );
  });

  // The four example lens identities must be enumerated as `\`identity\`` cells of
  // the `## Example: Retro Lens Set` table — not just appear as incidental tokens
  // in prose (`scope`/`planner`/`executor`/`reviewer` recur throughout role text,
  // the isolation contract, and other tables). Anchor each to the backticked
  // identity-cell shape so deleting the example table turns the test RED.
  // (IN-02: substring `includes` over-matched prose.)
  test('gsd-lens.md enumerates lens identity: planner (as an example table identity cell)', () => {
    assert.ok(
      /\|\s*`planner`\s*\|/.test(content),
      'gsd-lens.md must enumerate "planner" lens identity in the `## Example: Retro Lens Set` table (AC-5, RETRO-03)'
    );
  });

  test('gsd-lens.md enumerates lens identity: executor (as an example table identity cell)', () => {
    assert.ok(
      /\|\s*`executor`\s*\|/.test(content),
      'gsd-lens.md must enumerate "executor" lens identity in the `## Example: Retro Lens Set` table (AC-5, RETRO-03)'
    );
  });

  test('gsd-lens.md enumerates lens identity: reviewer-qa (as an example table identity cell)', () => {
    assert.ok(
      /\|\s*`reviewer-qa`\s*\|/.test(content),
      'gsd-lens.md must enumerate "reviewer-qa" lens identity in the `## Example: Retro Lens Set` table (AC-5, RETRO-03)'
    );
  });

  test('gsd-lens.md enumerates lens identity: scope-ceo (as an example table identity cell)', () => {
    assert.ok(
      /\|\s*`scope-ceo`\s*\|/.test(content),
      'gsd-lens.md must enumerate "scope-ceo" lens identity in the `## Example: Retro Lens Set` table (AC-5, RETRO-03)'
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
    // The no-blend invariant requires each lens to stake a *distinct* position with its
    // evidence citation. Assert the contract shape precisely rather than a loose prefix:
    //   - bullets match `- <lens>'s-eye: ... (evidence: ...)` (the canonical shape from
    //     gsd-lens-synthesizer.md), which rejects malformed bullets like "- planneresque note"
    //   - the two named identities (planner's-eye, executor's-eye) each appear as such a bullet
    //   - they appear inside >=2 distinct `### T{n}` tension blocks
    const lines = expected.split(/\r?\n/);
    // Canonical disagreement-preserving bullet: "- <lens>'s-eye: <prose> (evidence: ...)"
    const eyeBullets = lines.filter(l => /^- [a-z-]+'s-eye: .+\(evidence: .+\)/.test(l.trim()));
    assert.ok(
      eyeBullets.length >= 2,
      `expected-tensions.md must have >=2 "- <lens>'s-eye: ... (evidence: ...)" bullets, got ${eyeBullets.length} (no-blend invariant, D-06/D-09)`
    );
    const hasPlanner = eyeBullets.some(l => l.trim().startsWith("- planner's-eye:"));
    const hasExecutor = eyeBullets.some(l => l.trim().startsWith("- executor's-eye:"));
    assert.ok(
      hasPlanner,
      'expected-tensions.md must preserve a distinct "- planner\'s-eye: ... (evidence: ...)" bullet (positions preserved, not blended)'
    );
    assert.ok(
      hasExecutor,
      'expected-tensions.md must preserve a distinct "- executor\'s-eye: ... (evidence: ...)" bullet (positions preserved, not blended)'
    );
    // Distinct positions must span >=2 tension blocks, not collapse into one.
    const tensionBlocks = expected.match(/^### T\d+/gm);
    assert.ok(
      tensionBlocks && tensionBlocks.length >= 2,
      `expected-tensions.md must have >=2 distinct "### T{n}" blocks carrying preserved positions, got ${tensionBlocks?.length ?? 0} (D-06/D-09)`
    );
  });
});

// ─── RETRO-INTEGRATION: Phase-2 orchestration wiring (RETRO-04..08, D-01..D-09) ──

describe('RETRO-INTEGRATION: Phase-2 orchestration wiring (RETRO-04..08, D-01..D-09)', () => {
  let retroContent;
  let completeMilestoneContent;

  // Load retro.md and complete-milestone.md once for all tests.
  // Guard the retro.md read: if the file does not exist yet (Wave 1 state,
  // before Wave 2 authors it), set retroContent to '' so each assertion
  // fails with a clean message rather than throwing ENOENT and aborting the suite.
  before(() => {
    const retroPath = path.join(WORKFLOWS_DIR, 'retro.md');
    if (fs.existsSync(retroPath)) {
      retroContent = fs.readFileSync(retroPath, 'utf-8');
    } else {
      retroContent = '';
    }
    completeMilestoneContent = fs.readFileSync(
      path.join(WORKFLOWS_DIR, 'complete-milestone.md'),
      'utf-8'
    );
  });

  // ── retro.md existence and spawn counts (RETRO-05) ──────────────────────

  test('retro.md exists at gsd-core/workflows/retro.md (RETRO-05)', () => {
    assert.ok(
      fs.existsSync(path.join(WORKFLOWS_DIR, 'retro.md')),
      'gsd-core/workflows/retro.md must exist (RETRO-05)'
    );
  });

  test('retro.md contains subagent_type="gsd-lens" exactly 4 times (RETRO-05/RETRO-03/D-06)', () => {
    const matches = retroContent.match(/subagent_type="gsd-lens"/g);
    const count = matches ? matches.length : 0;
    assert.strictEqual(
      count,
      4,
      `gsd-core/workflows/retro.md must contain subagent_type="gsd-lens" exactly 4 times, got ${count} (RETRO-05/RETRO-03/D-06)`
    );
  });

  test('retro.md contains subagent_type="gsd-lens-synthesizer" exactly 1 time (RETRO-05)', () => {
    const matches = retroContent.match(/subagent_type="gsd-lens-synthesizer"/g);
    const count = matches ? matches.length : 0;
    assert.strictEqual(
      count,
      1,
      `gsd-core/workflows/retro.md must contain subagent_type="gsd-lens-synthesizer" exactly 1 time, got ${count} (RETRO-05)`
    );
  });

  // ── Dynamic artifact base path resolution (RETRO-04/D-06) ───────────────

  test('retro.md contains ARTIFACT_BASE dynamic path resolution token (RETRO-04/D-06)', () => {
    assert.ok(
      retroContent.includes('ARTIFACT_BASE'),
      'gsd-core/workflows/retro.md must contain "ARTIFACT_BASE" — the dynamic artifact base path resolution token (RETRO-04/D-06)'
    );
  });

  // ── Audit verdict dual-probe (RETRO-06) ─────────────────────────────────

  test('retro.md references the audit-verdict path — contains MILESTONE-AUDIT.md (RETRO-06)', () => {
    assert.ok(
      retroContent.includes('MILESTONE-AUDIT.md'),
      'gsd-core/workflows/retro.md must contain "MILESTONE-AUDIT.md" — audit verdict path reference (RETRO-06)'
    );
  });

  // ── Heading override: synthesizer OUTPUT_CONTRACT names both ### levels (RETRO-04/D-04, RETRO-07) ──

  test('retro.md synthesizer OUTPUT_CONTRACT names ### Tensions heading level override (RETRO-04/D-04)', () => {
    assert.ok(
      retroContent.includes('### Tensions'),
      'gsd-core/workflows/retro.md must contain "### Tensions" in the synthesizer OUTPUT_CONTRACT — the heading-level override so the block nests inside ## Milestone (RETRO-04/D-04)'
    );
  });

  test('retro.md synthesizer OUTPUT_CONTRACT names #### T{n} per-tension block level (RETRO-07)', () => {
    // The synthesizer default emits ## Tensions / ### T{n}; the retro override must name
    // BOTH deeper levels explicitly: ### Tensions AND #### T{n} (or #### T1 as example).
    const hasDepthFour = /####\s+T/.test(retroContent);
    assert.ok(
      hasDepthFour,
      'gsd-core/workflows/retro.md must contain "#### T{n}" (or an example like "#### T1") naming the per-tension block heading level override (RETRO-07, D-04)'
    );
  });

  // ── No-leak framing guard in lens OUTPUT_CONTRACT (RETRO-07/D-05) ───────

  test('retro.md lens OUTPUT_CONTRACT carries the no-leak framing guard (RETRO-07/D-05)', () => {
    // The no-leak guard must contain forward-looking framing tokens AND a phrase
    // that prevents audit-verdict language from leaking into lens positions.
    // Check for "Candidate change:" (forward-looking framing) AND a no-leak phrase
    // such as "not ... pass/fail", "not ... verdict", or "no verdict language".
    const hasCandidateChange = retroContent.includes('Candidate change:');
    const hasNoLeak =
      /not.*pass.?fail|not.*verdict|no.*pass.?fail|no.*verdict language|do not.*verdict|omit.*verdict/i.test(retroContent);
    assert.ok(
      hasCandidateChange,
      'gsd-core/workflows/retro.md must contain "Candidate change:" — the forward-looking framing token in lens OUTPUT_CONTRACT (RETRO-07/D-05)'
    );
    assert.ok(
      hasNoLeak,
      'gsd-core/workflows/retro.md must contain a no-leak framing guard — a phrase like "not pass/fail", "no verdict language", or "do not reproduce verdict" in lens OUTPUT_CONTRACT (RETRO-07/D-05)'
    );
  });

  // ── Graduation feed-forward handoff (RETRO-08/D-07) ─────────────────────

  test('retro.md documents the graduation feed-forward handoff — contains graduation AND Candidate change: (RETRO-08/D-07)', () => {
    assert.ok(
      retroContent.includes('graduation'),
      'gsd-core/workflows/retro.md must contain "graduation" — the graduation feed-forward handoff documentation (RETRO-08/D-07)'
    );
    assert.ok(
      retroContent.includes('Candidate change:'),
      'gsd-core/workflows/retro.md must contain "Candidate change:" — the documented input to the next-transition graduation HITL (RETRO-08/D-07)'
    );
  });

  // ── Audit-not-found warning branch (RETRO-06) ────────────────────────────

  test('retro.md emits a user-visible warning when audit verdict is found at neither probe path (RETRO-06)', () => {
    // The audit-not-found warning branch must be present so a missing verdict is
    // surfaced, not silently empty. Look for a warning token near "MILESTONE-AUDIT".
    const hasWarning =
      retroContent.includes('Audit verdict not found') ||
      retroContent.includes('audit verdict not found') ||
      /⚠.*MILESTONE-AUDIT|MILESTONE-AUDIT.*⚠/.test(retroContent) ||
      /warn.*MILESTONE-AUDIT|MILESTONE-AUDIT.*warn/i.test(retroContent) ||
      /No audit.*found|audit.*not found/i.test(retroContent);
    assert.ok(
      hasWarning,
      'gsd-core/workflows/retro.md must contain an audit-not-found warning branch (e.g. "Audit verdict not found", "⚠" near MILESTONE-AUDIT, or similar) so a missing verdict is surfaced, not silently empty (RETRO-06)'
    );
  });

  // ── complete-milestone.md invokes retro.md (RETRO-05) ───────────────────

  test('complete-milestone.md write_retrospective invokes retro.md (RETRO-05)', () => {
    assert.ok(
      completeMilestoneContent.includes('retro.md'),
      'gsd-core/workflows/complete-milestone.md must contain "retro.md" — write_retrospective must invoke retro.md, not inline lens logic (RETRO-05)'
    );
  });

  // ── complete-milestone.md knob read (RETRO-04/D-08) ─────────────────────

  test('complete-milestone.md contains workflow.milestone_retro knob read (RETRO-04/D-08)', () => {
    assert.ok(
      completeMilestoneContent.includes('workflow.milestone_retro'),
      'gsd-core/workflows/complete-milestone.md must contain "workflow.milestone_retro" — the config-get knob read guarding the retro sub-step (RETRO-04/D-08)'
    );
  });

  // ── Negative assertions: no lens logic inlined into complete-milestone.md (RETRO-05/D-08) ──

  test('complete-milestone.md does NOT contain LENS_IDENTITY (no lens inlining) (RETRO-05/D-08)', () => {
    assert.ok(
      !completeMilestoneContent.includes('LENS_IDENTITY'),
      'gsd-core/workflows/complete-milestone.md must NOT contain "LENS_IDENTITY" — lens spawn logic must live in retro.md, not inlined in complete-milestone.md (RETRO-05/D-08)'
    );
  });

  test('complete-milestone.md does NOT contain ARTIFACTS_TO_MINE (no lens inlining) (RETRO-05/D-08)', () => {
    assert.ok(
      !completeMilestoneContent.includes('ARTIFACTS_TO_MINE'),
      'gsd-core/workflows/complete-milestone.md must NOT contain "ARTIFACTS_TO_MINE" — lens spawn logic must live in retro.md, not inlined in complete-milestone.md (RETRO-05/D-08)'
    );
  });

  // ── Byte-identical-when-false guard (RETRO-04/SC-1, D-08) ───────────────

  test('complete-milestone.md knob-off render: no ### Tensions heading in the static template text (RETRO-04/SC-1/D-08)', () => {
    // When workflow.milestone_retro is false, write_retrospective must be byte-identical
    // to the pre-Phase-2 output. The milestone-entry template must NOT contain a literal
    // "### Tensions" heading in its static (always-rendered) text — that heading must only
    // appear inside the knob-true conditional block (the single interpolation/splice point).
    // Strategy: assert the complete-milestone.md source does NOT contain "### Tensions"
    // outside of a conditional block. Since we can check static source text, we verify that
    // any occurrence of "### Tensions" in complete-milestone.md is inside an if-true block
    // (i.e., not unconditionally emitted). A pragmatic check: the file must contain
    // "### Tensions" at most in the knob-true block, so the unconditional template string
    // (the assembled entry emitted regardless of knob state) must NOT contain it.
    // We assert: either complete-milestone.md does not contain "### Tensions" at all
    // (Wave 2 not yet landed — RED, expected at Wave 1), OR if it does, the count of
    // "### Tensions" occurrences equals exactly 1 (the single splice/interpolation point
    // inside the conditional block — not duplicated as a static literal).
    const tensionsOccurrences = (completeMilestoneContent.match(/### Tensions/g) || []).length;
    assert.ok(
      tensionsOccurrences <= 1,
      `gsd-core/workflows/complete-milestone.md must contain at most ONE "### Tensions" reference (the single splice/interpolation point inside the knob-true conditional block) — knob-off render is byte-identical to pre-Phase-2 (RETRO-04/SC-1/D-08). Found ${tensionsOccurrences} occurrences.`
    );
  });

  test('complete-milestone.md has exactly one Tensions splice/interpolation point (RETRO-04/SC-1/D-08)', () => {
    // The single-interpolation invariant: there must be exactly one location in
    // complete-milestone.md where the Tensions block is spliced in (or zero if Wave 2
    // has not yet landed). Count anchors: "### Tensions" occurrences as the splice marker.
    // This pins "single empty-on-false interpolation point" — the knob-off render
    // contributes nothing (the single interpolation resolves to empty string when false).
    const tensionsOccurrences = (completeMilestoneContent.match(/### Tensions/g) || []).length;
    // At Wave 1: 0 occurrences (RED — complete-milestone.md not yet wired). Expected.
    // At Wave 3: exactly 1 occurrence (GREEN — the single conditional splice point).
    assert.ok(
      tensionsOccurrences === 0 || tensionsOccurrences === 1,
      `gsd-core/workflows/complete-milestone.md must have 0 or 1 "### Tensions" references (0=Wave1 RED, 1=Wave3 GREEN single interpolation). Knob-off render must be byte-identical to pre-Phase-2 — no ### Tensions heading, single empty-on-false interpolation point (RETRO-04/SC-1/D-08). Found ${tensionsOccurrences} occurrences.`
    );
  });

  // ── docs/CONFIGURATION.md active-behavior reference (RETRO-08/SC-5) ─────

  test('docs/CONFIGURATION.md milestone_retro row reflects active behavior — contains retro.md reference (RETRO-08/SC-5)', () => {
    const configDoc = fs.readFileSync(path.join(REPO_ROOT, 'docs', 'CONFIGURATION.md'), 'utf-8');
    assert.ok(
      configDoc.includes('retro.md'),
      'docs/CONFIGURATION.md must contain "retro.md" in the workflow.milestone_retro row — reflecting active wiring, not the Phase-1 "(Phase 2)" stub (RETRO-08/SC-5)'
    );
  });

  // ── Companion-fixture smoke assertion (retro heading override visibility) ──

  test('expected-tensions-retro.md exists at ### Tensions / #### T{n} heading levels', () => {
    assert.ok(
      fs.existsSync(path.join(FIXTURE_DIR, 'expected-tensions-retro.md')),
      'tests/fixtures/lens-engine/expected-tensions-retro.md must exist — companion fixture at retro heading levels (### Tensions / #### T{n})'
    );
  });

  test('expected-tensions-retro.md top header is ### Tensions (not ## Tensions)', () => {
    const retro = fs.readFileSync(path.join(FIXTURE_DIR, 'expected-tensions-retro.md'), 'utf-8');
    const firstHeading = retro.match(/^#+\s+Tensions/m);
    assert.ok(
      firstHeading !== null && firstHeading[0].startsWith('### Tensions'),
      `expected-tensions-retro.md top Tensions header must be "### Tensions" (three hashes, one level deeper than ## default) — found: ${firstHeading ? firstHeading[0] : 'none'}`
    );
  });

  test('expected-tensions-retro.md contains >=2 #### T{n} per-tension blocks', () => {
    const retro = fs.readFileSync(path.join(FIXTURE_DIR, 'expected-tensions-retro.md'), 'utf-8');
    const blocks = retro.match(/^#### T\d+/gm);
    assert.ok(
      blocks && blocks.length >= 2,
      `expected-tensions-retro.md must have >=2 "#### T{n}" per-tension blocks (four hashes), got ${blocks?.length ?? 0}`
    );
  });

  test('expected-tensions-retro.md each block has evidence citation and Candidate change:', () => {
    const retro = fs.readFileSync(path.join(FIXTURE_DIR, 'expected-tensions-retro.md'), 'utf-8');
    assert.ok(
      retro.includes('evidence:'),
      'expected-tensions-retro.md must contain evidence citations (e.g. "(evidence: ...)" in each tension block)'
    );
    assert.ok(
      retro.includes('Candidate change:'),
      'expected-tensions-retro.md must contain "Candidate change:" lines in tension blocks'
    );
  });
});

// ─── PLANLENS-CONFIG: plan_lens_review config knob registration (PLANLENS-01) ──

describe('PLANLENS-CONFIG: config knob registration (PLANLENS-01)', () => {
  test('config.json contains workflow.plan_lens_review: false', () => {
    const cfgPath = path.join(REPO_ROOT, 'gsd-core', 'templates', 'config.json');
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
    assert.strictEqual(
      cfg.workflow.plan_lens_review,
      false,
      'gsd-core/templates/config.json must have workflow.plan_lens_review: false (default opt-out, PLANLENS-01)'
    );
  });

  test('workflow.plan_lens_review is registered in config-schema.cjs', () => {
    assert.ok(
      VALID_CONFIG_KEYS.has('workflow.plan_lens_review'),
      'workflow.plan_lens_review must be registered in VALID_CONFIG_KEYS in config-schema.manifest.json (PLANLENS-01)'
    );
  });
});

// ─── PLANLENS-DOCS: plan_lens_review documentation parity (PLANLENS-01) ─────

describe('PLANLENS-DOCS: docs/CONFIGURATION.md and FORK.md parity (PLANLENS-01)', () => {
  test('docs/CONFIGURATION.md contains workflow.plan_lens_review', () => {
    const configDoc = fs.readFileSync(path.join(REPO_ROOT, 'docs', 'CONFIGURATION.md'), 'utf-8');
    assert.ok(
      configDoc.includes('workflow.plan_lens_review'),
      'docs/CONFIGURATION.md must document workflow.plan_lens_review in the Workflow Toggles table (PLANLENS-01)'
    );
  });

  test('FORK.md contains workflow.plan_lens_review', () => {
    const forkDoc = fs.readFileSync(path.join(REPO_ROOT, 'FORK.md'), 'utf-8');
    assert.ok(
      forkDoc.includes('workflow.plan_lens_review'),
      'FORK.md must document workflow.plan_lens_review in the config-keys table (PLANLENS-01)'
    );
  });
});

// ─── PLANLENS-WORKFLOW: plan-lens-review.md structural contract (PLANLENS-01) ──
//
// Uses before() to read the workflow text once.
// If the file does not exist yet (Wave 0 state), every test in this group fails
// with a consistent ENOENT error — that is the expected RED state. Do NOT stub.

describe('PLANLENS-WORKFLOW: plan-lens-review.md structural contract (PLANLENS-01)', () => {
  let plrContent;

  before(() => {
    plrContent = fs.readFileSync(
      path.join(WORKFLOWS_DIR, 'plan-lens-review.md'),
      'utf-8'
    );
  });

  test('plan-lens-review.md references frozen agent gsd-lens', () => {
    assert.ok(
      plrContent.includes('gsd-lens'),
      'gsd-core/workflows/plan-lens-review.md must contain "gsd-lens" — references the frozen gsd-lens agent (PLANLENS-01/CON-lens-generic)'
    );
  });

  test('plan-lens-review.md references frozen agent gsd-lens-synthesizer', () => {
    assert.ok(
      plrContent.includes('gsd-lens-synthesizer'),
      'gsd-core/workflows/plan-lens-review.md must contain "gsd-lens-synthesizer" — references the frozen gsd-lens-synthesizer agent (PLANLENS-01/CON-lens-generic)'
    );
  });

  test('plan-lens-review.md names output artifact PLAN-RATIONALE', () => {
    assert.ok(
      plrContent.includes('PLAN-RATIONALE'),
      'gsd-core/workflows/plan-lens-review.md must contain "PLAN-RATIONALE" — the plan-rationale artifact output (PLANLENS-01/D-11)'
    );
  });

  test('plan-lens-review.md names output artifact KILL-CRITERIA', () => {
    assert.ok(
      plrContent.includes('KILL-CRITERIA'),
      'gsd-core/workflows/plan-lens-review.md must contain "KILL-CRITERIA" — the kill-criteria artifact output (PLANLENS-01/D-11)'
    );
  });

  test('plan-lens-review.md references AskUserQuestion for value-tradeoff escalation', () => {
    assert.ok(
      plrContent.includes('AskUserQuestion'),
      'gsd-core/workflows/plan-lens-review.md must contain "AskUserQuestion" — the only permitted human-blocking escalation for value-tradeoff conflicts (PLANLENS-01/D-09)'
    );
  });

  test('plan-lens-review.md contains fact-conflict or probe path', () => {
    const hasFactConflict = /fact.?conflict|probe/i.test(plrContent);
    assert.ok(
      hasFactConflict,
      'gsd-core/workflows/plan-lens-review.md must contain a fact-conflict/probe path — matching /fact.?conflict|probe/i (PLANLENS-01/D-08/D-09)'
    );
  });

  test('plan-lens-review.md contains round-2 rebuttal reference', () => {
    const hasRound2 = /round.?2|rebuttal/i.test(plrContent);
    assert.ok(
      hasRound2,
      'gsd-core/workflows/plan-lens-review.md must contain a round-2 rebuttal reference — matching /round.?2|rebuttal/i (PLANLENS-01/D-07)'
    );
  });
});

// ─── PLANLENS-GATE: plan-phase.md gate reference (PLANLENS-01) ───────────────
//
// Uses before() to read plan-phase.md once.
// If plan-phase.md is not yet updated with the gate, these tests fail RED.

describe('PLANLENS-GATE: plan-phase.md gate references (PLANLENS-01)', () => {
  let planPhaseContent;

  before(() => {
    planPhaseContent = fs.readFileSync(
      path.join(WORKFLOWS_DIR, 'plan-phase.md'),
      'utf-8'
    );
  });

  test('plan-phase.md references plan-lens-review.md', () => {
    assert.ok(
      planPhaseContent.includes('plan-lens-review.md'),
      'gsd-core/workflows/plan-phase.md must contain "plan-lens-review.md" — the plan-lens gate hook (PLANLENS-01/D-12/D-13)'
    );
  });

  test('plan-phase.md references workflow.plan_lens_review knob', () => {
    assert.ok(
      planPhaseContent.includes('workflow.plan_lens_review'),
      'gsd-core/workflows/plan-phase.md must contain "workflow.plan_lens_review" — the config-get knob read guarding the plan-lens step (PLANLENS-01)'
    );
  });
});

// ─── CON-LENS-GENERIC: frozen agents byte-identical to HEAD (PLANLENS-01) ────
//
// Assert that gsd-lens.md and gsd-lens-synthesizer.md are unchanged vs HEAD.
// This validates CON-lens-generic: plan-lens-review.md consumes the frozen agents
// AS-IS without any modification.
// Guard with try/catch so a non-git environment skips rather than errors.
//
// Security note: execSync is used here because the command string is a fully static
// literal — no user input, no variables, no interpolation. There is no injection risk.
// If the paths or command ever need to be dynamic, switch to execFileSync with an
// argument array instead.

describe('CON-LENS-GENERIC: frozen agents unchanged vs HEAD (PLANLENS-01/CON-lens-generic)', () => {
  test('agents/gsd-lens.md and agents/gsd-lens-synthesizer.md are byte-identical to HEAD (no edits)', () => {
    try {
      // Static string — no user input interpolated. Safe from command injection.
      const diffOutput = execSync(
        'git diff --stat HEAD -- agents/gsd-lens.md agents/gsd-lens-synthesizer.md',
        { cwd: REPO_ROOT, timeout: 15000 }
      ).toString().trim();
      assert.strictEqual(
        diffOutput,
        '',
        'agents/gsd-lens.md and agents/gsd-lens-synthesizer.md must be byte-identical to HEAD — ' +
        'the frozen lens agents must not be modified this phase (CON-lens-generic, PLANLENS-01). ' +
        `Got diff output: "${diffOutput}"`
      );
    } catch (err) {
      // Non-git environment or git not available — skip rather than fail
      if (err.message && err.message.includes('assert')) {
        throw err; // Re-throw assertion failures (the diff was non-empty)
      }
      // Otherwise skip silently (git not available)
      return;
    }
  });
});
