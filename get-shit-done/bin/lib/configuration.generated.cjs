'use strict';

/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Source: sdk/src/configuration/index.ts
 * Regenerate: cd sdk && npm run gen:configuration
 *
 * Configuration Module — single source of truth for config loading,
 * legacy-key normalization, defaults merge, and explicit on-disk migration.
 */

const { readFileSync, writeFileSync, existsSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

// ─── Inlined manifests ───────────────────────────────────────────────────────
// Extracted from sdk/shared/config-defaults.manifest.json and
// sdk/shared/config-schema.manifest.json at generation time and inlined so this
// file is self-contained. It must NOT require() anything outside the installed
// get-shit-done/bin/ tree — the installer does not ship the sibling sdk/ dir,
// so a runtime require('../../../sdk/shared/...') fails post-install.
// To change a default or schema key, edit the manifest and regenerate.
const CONFIG_DEFAULTS = {
  "_comment": "Canonical CONFIG_DEFAULTS for the Configuration Module. Nested shape is canonical. CJS flat projection (branching_strategy, sub_repos, etc.) is handled by consumers at the boundary. Security keys (security_enforcement, security_asvs_level, security_block_on) and post_planning_gaps live in workflow.* as their canonical location. resolve_model_ids, context_window, phase_naming are CJS-originated top-level keys included here. brave_search, firecrawl, exa_search default to false in the manifest; at runtime buildNewProjectConfig detects API keys. The plan_checker (CJS flat) → workflow.plan_check (canonical nested) divergence is resolved: canonical name is workflow.plan_check. _auto_chain_active is a runtime-state field included for completeness.",
  "model_profile": "balanced",
  "commit_docs": true,
  "parallelization": true,
  "search_gitignored": false,
  "brave_search": false,
  "firecrawl": false,
  "exa_search": false,
  "resolve_model_ids": false,
  "context_window": 200000,
  "phase_naming": "sequential",
  "project_code": null,
  "mode": "interactive",
  "claude_md_path": "./CLAUDE.md",
  "git": {
    "branching_strategy": "none",
    "create_tag": true,
    "base_branch": null,
    "phase_branch_template": "gsd/phase-{phase}-{slug}",
    "milestone_branch_template": "gsd/{milestone}-{slug}",
    "quick_branch_template": null
  },
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "nyquist_validation": true,
    "ai_integration_phase": true,
    "tdd_mode": false,
    "human_verify_mode": "end-of-phase",
    "auto_advance": false,
    "_auto_chain_active": false,
    "node_repair": true,
    "node_repair_budget": 2,
    "ui_phase": true,
    "ui_safety_gate": true,
    "text_mode": false,
    "research_before_questions": false,
    "discuss_mode": "discuss",
    "skip_discuss": false,
    "max_discuss_passes": 3,
    "subagent_timeout": 300000,
    "context_coverage_gate": true,
    "code_review": true,
    "code_review_depth": "standard",
    "code_review_command": null,
    "pattern_mapper": true,
    "plan_bounce": false,
    "plan_bounce_script": null,
    "plan_bounce_passes": 2,
    "auto_prune_state": false,
    "post_planning_gaps": true,
    "security_enforcement": true,
    "security_asvs_level": 1,
    "security_block_on": "high"
  },
  "planning": {
    "commit_docs": true,
    "search_gitignored": false,
    "sub_repos": [],
    "granularity": "standard"
  },
  "hooks": {
    "context_warnings": true,
    "workflow_guard": false
  },
  "ship": {
    "pr_body_sections": []
  },
  "graphify": {
    "auto_update": false
  },
  "agent_skills": {}
};
const SCHEMA_MANIFEST = {
  "_comment": "Canonical schema manifest for valid config key paths. validKeys is the union of CJS config-schema.cjs and SDK query/config-schema.ts (they are enforced set-equal by tests/config-schema-sdk-parity.test.cjs). runtimeStateKeys mirrors RUNTIME_STATE_KEYS. dynamicKeyPatterns mirrors DYNAMIC_KEY_PATTERNS from SDK (which includes the canonical 'source' regex strings). The .test function is reconstructed at runtime from new RegExp(source).",
  "validKeys": [
    "mode",
    "granularity",
    "parallelization",
    "commit_docs",
    "model_profile",
    "search_gitignored",
    "brave_search",
    "firecrawl",
    "exa_search",
    "workflow.research",
    "workflow.plan_check",
    "workflow.verifier",
    "workflow.nyquist_validation",
    "workflow.ai_integration_phase",
    "workflow.ui_phase",
    "workflow.ui_safety_gate",
    "workflow.auto_advance",
    "workflow.node_repair",
    "workflow.node_repair_budget",
    "workflow.tdd_mode",
    "workflow.human_verify_mode",
    "workflow.text_mode",
    "workflow.research_before_questions",
    "workflow.discuss_mode",
    "workflow.skip_discuss",
    "workflow.auto_prune_state",
    "workflow.use_worktrees",
    "workflow.worktree_skip_hooks",
    "workflow.code_review",
    "workflow.code_review_depth",
    "workflow.code_review_command",
    "workflow.pattern_mapper",
    "workflow.plan_bounce",
    "workflow.plan_bounce_script",
    "workflow.plan_bounce_passes",
    "workflow.plan_chunked",
    "workflow.plan_review_convergence",
    "workflow.post_planning_gaps",
    "workflow.security_enforcement",
    "workflow.security_asvs_level",
    "workflow.security_block_on",
    "workflow.drift_threshold",
    "workflow.drift_action",
    "code_quality.fallow.enabled",
    "code_quality.fallow.scope",
    "code_quality.fallow.profile",
    "code_quality.fallow.mcp",
    "ship.pr_body_sections",
    "git.branching_strategy",
    "git.base_branch",
    "git.create_tag",
    "git.phase_branch_template",
    "git.milestone_branch_template",
    "git.quick_branch_template",
    "planning.commit_docs",
    "planning.search_gitignored",
    "planning.sub_repos",
    "review.ollama_host",
    "review.lm_studio_host",
    "review.llama_cpp_host",
    "review.default_reviewers",
    "workflow.cross_ai_execution",
    "workflow.cross_ai_command",
    "workflow.cross_ai_timeout",
    "workflow.subagent_timeout",
    "executor.stall_detect_interval_minutes",
    "executor.stall_threshold_minutes",
    "workflow.inline_plan_threshold",
    "hooks.context_warnings",
    "hooks.workflow_guard",
    "workflow.context_coverage_gate",
    "statusline.show_last_command",
    "statusline.context_position",
    "workflow.ui_review",
    "workflow.max_discuss_passes",
    "features.thinking_partner",
    "context",
    "features.global_learnings",
    "learnings.max_inject",
    "project_code",
    "phase_naming",
    "manager.flags.discuss",
    "manager.flags.plan",
    "manager.flags.execute",
    "response_language",
    "context_window",
    "intel.enabled",
    "graphify.enabled",
    "graphify.build_timeout",
    "graphify.auto_update",
    "claude_md_path",
    "claude_md_assembly.mode",
    "runtime",
    "resolve_model_ids",
    "workflow.questions_per_area",
    "workflow.test_contracts",
    "workflow.adversarial_validation",
    "workflow.dead_code_scan",
    "workflow.playwright_verification",
    "workflow.definition_of_done",
    "workflow.preflight_on_verify",
    "workflow.spec_outcome_enforcement",
    "workflow.scaffold_makefile",
    "workflow.scaffold_precommit",
    "workflow.scaffold_preflight",
    "workflow.scaffold_rules",
    "workflow.update_claude_md_on_complete",
    "workflow.two_stage_review",
    "workflow.verification_discipline",
    "workflow.design_spec",
    "project.issue_tracker",
    "project.issue_prefix",
    "project.pr_title_template",
    "project.pr_body_requires_issue",
    "project.ci_commands"
  ],
  "runtimeStateKeys": [
    "workflow._auto_chain_active"
  ],
  "dynamicKeyPatterns": [
    {
      "topLevel": "agent_skills",
      "source": "^agent_skills\\.[a-zA-Z0-9_-]+$",
      "description": "agent_skills.<agent-type>"
    },
    {
      "topLevel": "review",
      "source": "^review\\.models\\.[a-zA-Z0-9_-]+$",
      "description": "review.models.<cli-name>"
    },
    {
      "topLevel": "features",
      "source": "^features\\.[a-zA-Z0-9_]+$",
      "description": "features.<feature_name>"
    },
    {
      "topLevel": "claude_md_assembly",
      "source": "^claude_md_assembly\\.blocks\\.[a-zA-Z0-9_]+$",
      "description": "claude_md_assembly.blocks.<section>"
    },
    {
      "topLevel": "model_profile_overrides",
      "source": "^model_profile_overrides\\.[a-zA-Z0-9_-]+\\.(opus|sonnet|haiku)$",
      "description": "model_profile_overrides.<runtime>.<opus|sonnet|haiku>"
    },
    {
      "topLevel": "models",
      "source": "^models\\.(planning|discuss|research|execution|verification|completion)$",
      "description": "models.<planning|discuss|research|execution|verification|completion>"
    },
    {
      "topLevel": "dynamic_routing",
      "source": "^dynamic_routing\\.(enabled|escalate_on_failure|max_escalations|tier_models\\.(light|standard|heavy))$",
      "description": "dynamic_routing.<enabled|escalate_on_failure|max_escalations|tier_models.<light|standard|heavy>>"
    },
    {
      "topLevel": "model_overrides",
      "source": "^model_overrides\\.[a-zA-Z0-9_-]+$",
      "description": "model_overrides.<agent-id>"
    }
  ]
};
const VALID_CONFIG_KEYS = new Set(SCHEMA_MANIFEST.validKeys);
const RUNTIME_STATE_KEYS = new Set(SCHEMA_MANIFEST.runtimeStateKeys);
const DYNAMIC_KEY_PATTERNS = SCHEMA_MANIFEST.dynamicKeyPatterns.map((p) => {
  const pattern = new RegExp(p.source);
  return {
    ...p,
    test: (key) => {
      pattern.lastIndex = 0;
      return pattern.test(key);
    },
  };
});

// ─── Depth → Granularity mapping ─────────────────────────────────────────────
const DEPTH_TO_GRANULARITY = {
    quick: 'coarse',
    standard: 'standard',
    comprehensive: 'fine',
};

// ─── Internal helpers ─────────────────────────────────────────────────────────
function planningDir(cwd, workstream) {
    if (!workstream)
        return join(cwd, '.planning');
    return join(cwd, '.planning', 'workstreams', workstream);
}

function detectSubRepos(cwd) {
    const results = [];
    try {
        const entries = readdirSync(cwd, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory())
                continue;
            if (entry.name.startsWith('.') || entry.name === 'node_modules')
                continue;
            const gitPath = join(cwd, entry.name, '.git');
            try {
                if (existsSync(gitPath)) {
                    results.push(entry.name);
                }
            }
            catch { /* ignore */ }
        }
    }
    catch { /* ignore */ }
    return results.sort();
}

function deepMergeConfig(base, overlay) {
    const result = { ...base };
    for (const key of Object.keys(overlay)) {
        const ov = overlay[key];
        if (ov !== null && ov !== undefined && typeof ov === 'object' && !Array.isArray(ov)) {
            const bv = base[key];
            if (bv !== null && bv !== undefined && typeof bv === 'object' && !Array.isArray(bv)) {
                result[key] = deepMergeConfig(bv, ov);
            }
            else {
                result[key] = deepMergeConfig({}, ov);
            }
        }
        else {
            result[key] = ov;
        }
    }
    return result;
}

// ─── Exported functions ───────────────────────────────────────────────────────
function normalizeLegacyKeys(parsed) {
    const result = { ...parsed };
    const normalizations = [];
    // 1. branching_strategy → git.branching_strategy
    if (Object.prototype.hasOwnProperty.call(result, 'branching_strategy')) {
        const value = result.branching_strategy;
        const git = result.git ?? {};
        if (git.branching_strategy === undefined) {
            result.git = { ...git, branching_strategy: value };
        }
        else {
            // canonical nested wins — just delete the stale top-level
            result.git = { ...git };
        }
        delete result.branching_strategy;
        normalizations.push({ from: 'branching_strategy', to: 'git.branching_strategy', value });
    }
    // 2. top-level sub_repos → planning.sub_repos
    if (Object.prototype.hasOwnProperty.call(result, 'sub_repos')) {
        const value = result.sub_repos;
        const planning = result.planning ?? {};
        if (planning.sub_repos === undefined) {
            result.planning = { ...planning, sub_repos: value };
        }
        else {
            // canonical nested wins — just drop the stale top-level
            result.planning = { ...planning };
        }
        delete result.sub_repos;
        normalizations.push({ from: 'sub_repos', to: 'planning.sub_repos', value });
    }
    // 3. multiRepo: true → marker (filesystem detection deferred to migrateOnDisk / caller)
    if (result.multiRepo === true) {
        delete result.multiRepo;
        normalizations.push({ from: 'multiRepo', to: 'planning.sub_repos', value: true, requiresFilesystem: true });
    }
    // 4. top-level depth → granularity
    if (Object.prototype.hasOwnProperty.call(result, 'depth') && !Object.prototype.hasOwnProperty.call(result, 'granularity')) {
        const rawDepth = result.depth;
        const mapped = DEPTH_TO_GRANULARITY[rawDepth] ?? rawDepth;
        result.granularity = mapped;
        delete result.depth;
        normalizations.push({ from: 'depth', to: 'granularity', value: mapped });
    }
    return { parsed: result, normalizations };
}

function mergeDefaults(parsed) {
    // Start with a deep clone of defaults, then overlay parsed
    const defaults = JSON.parse(JSON.stringify(CONFIG_DEFAULTS));
    return deepMergeConfig(defaults, parsed);
}

async function loadConfig(cwd, options) {
    const configPath = join(planningDir(cwd, options?.workstream), 'config.json');
    let raw;
    try {
        raw = readFileSync(configPath, 'utf-8');
    }
    catch {
        // File missing — return defaults
        return mergeDefaults({});
    }
    const trimmed = raw.trim();
    if (trimmed === '') {
        return mergeDefaults({});
    }
    let parsed;
    try {
        parsed = JSON.parse(trimmed);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to parse config at ${configPath}: ${msg}`);
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error(`Config at ${configPath} must be a JSON object`);
    }
    const { parsed: normalized, normalizations } = normalizeLegacyKeys(parsed);
    if (options?.onNormalizations && normalizations.length > 0) {
        options.onNormalizations(normalizations);
    }
    return mergeDefaults(normalized);
}

async function migrateOnDisk(cwd, workstream) {
    const configPath = join(planningDir(cwd, workstream), 'config.json');
    let raw;
    try {
        raw = readFileSync(configPath, 'utf-8');
    }
    catch {
        // File missing — nothing to migrate
        return { migrated: false, normalizations: [], wrote: null };
    }
    const trimmed = raw.trim();
    if (trimmed === '') {
        return { migrated: false, normalizations: [], wrote: null };
    }
    let parsed;
    try {
        parsed = JSON.parse(trimmed);
    }
    catch {
        // Malformed — can't migrate
        return { migrated: false, normalizations: [], wrote: null };
    }
    const { parsed: normalized, normalizations } = normalizeLegacyKeys(parsed);
    if (normalizations.length === 0) {
        return { migrated: false, normalizations: [], wrote: null };
    }
    // Resolve multiRepo filesystem detection
    const result = { ...normalized };
    for (const norm of normalizations) {
        if (norm.requiresFilesystem) {
            const detected = detectSubRepos(cwd);
            if (detected.length > 0) {
                const planning = result.planning ?? {};
                result.planning = { ...planning, sub_repos: detected, commit_docs: false };
            }
        }
    }
    try {
        writeFileSync(configPath, JSON.stringify(result, null, 2));
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to write migrated config at ${configPath}: ${msg}`);
    }
    return { migrated: true, normalizations, wrote: configPath };
}

module.exports = {
  loadConfig,
  normalizeLegacyKeys,
  mergeDefaults,
  migrateOnDisk,
  CONFIG_DEFAULTS,
  VALID_CONFIG_KEYS,
  RUNTIME_STATE_KEYS,
  DYNAMIC_KEY_PATTERNS,
};
