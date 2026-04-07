# Competitive Landscape Research

Research conducted 2026-04-03 to understand alternative approaches to AI-assisted spec-driven development and identify ideas worth integrating into this fork.

---

## Spec Kit

**By:** GitHub (official) | **Stars:** ~85K | **License:** MIT | **Install:** `uv` (Python CLI called `specify`)

**What it is:** A toolkit for Spec-Driven Development (SDD) where specifications become the primary artifact, directly generating working implementations rather than just guiding them.

**Problem it solves:** Replaces "vibe coding" (ad-hoc, unstructured AI code generation) with a disciplined, repeatable workflow. You describe *what* and *why* you want to build; the specs drive implementation.

**Workflow:**
1. `specify init` — scaffold a project
2. `/speckit.constitution` — establish project principles/guidelines
3. `/speckit.specify` — describe the feature (what + why, no tech stack)
4. `/speckit.plan` — provide tech stack, get a technical implementation plan
5. `/speckit.tasks` — break the plan into actionable tasks
6. `/speckit.implement` — execute all tasks according to the plan

**Key features:** Extensible via community extensions (Jira/Azure DevOps sync, checkpointing, cleanup, multi-agent orchestration), presets, rich community ecosystem. Works with Claude Code, Cursor, Gemini CLI, Codex, GitHub Copilot.

**Comparison to GSD:** Spec Kit is spec-first — specifications are the source of truth and implementation flows from them in a linear pipeline (specify → plan → tasks → implement). It is agent-agnostic and GitHub-backed. GSD is a meta-prompting/orchestration system focused on milestones, phases, and parallel sub-agent execution. GSD emphasizes iterative planning, verification loops (UAT), and stateful context persistence across sessions — more of a project management layer than a spec authoring layer.

**Relationship:** Complementary, not competing. Spec Kit owns the "what to build" pipeline; GSD owns the "how to orchestrate building it" workflow.

---

## OpenSpec

**By:** Fission AI | **Stars:** ~37K | **License:** MIT | **Install:** `npm i -g @fission-ai/openspec`

**What it is:** A spec-driven development framework that adds a structured specification layer on top of AI coding assistants.

**Problem it solves:** AI coding assistants produce unpredictable output when requirements live only in ephemeral chat history. OpenSpec forces human-AI alignment on *what to build* before any code is written.

**Workflow:**
1. `/opsx:propose <idea>` — creates a structured change folder with proposal, specs, design doc, and task checklist
2. `/opsx:apply` — AI implements the tasks from the spec
3. `/opsx:archive` — archives completed work

Each change lives in its own `openspec/changes/<name>/` directory with standardized artifacts (proposal.md, specs/, design.md, tasks.md). Expanded workflow adds `/opsx:verify`, `/opsx:sync`, `/opsx:bulk-archive`.

**Philosophy:** Fluid not rigid, iterative not waterfall, works in brownfield codebases, scales from personal to enterprise. No rigid phase gates — you can update any artifact at any time.

**Key features:** Supports 20+ AI tools, CLI-driven, optional dashboard UI, multi-language support, customizable profiles.

**Comparison to GSD:** Both sit atop AI coding agents to impose structure, but they differ in approach. GSD manages the entire project lifecycle (milestones, phases, execution waves); OpenSpec manages individual change units. GSD is a *meta-prompting system* focused on phased milestone execution with parallel sub-agents, roadmap management, and deep planning/execution workflows. OpenSpec is a *specification framework* focused on per-feature proposal/spec/design/task artifacts.

**Relationship:** Complementary. GSD could orchestrate the "when and how" while OpenSpec structures the "what" for each unit of work.

---

## BMAD (Build More Architect Dreams)

**By:** BMad Code | **License:** MIT | **Install:** `npx bmad-method@next install` | **Docs:** docs.bmad-method.org

**What it is:** An AI-driven development framework that guides projects from ideation and planning through agentic implementation. Described as a "Breakthrough Method for Agile AI Driven Development."

**Problem it solves:** Unstructured AI coding produces inconsistent results. BMAD adds named agent roles, structured planning phases, and context management to create a repeatable development methodology.

**Workflow stages:**
1. **Analysis Phase** — from idea to foundation
2. **Brainstorming** — conceptual development
3. **Solutioning** — strategic planning before coding
4. **Quick Dev** — rapid implementation
5. **Checkpoint Preview** — progress validation
6. **Adversarial Review** — quality assurance through opposition

**Agent roles:** Dedicated agents with named roles — Analyst, PM, Architect, Scrum Master, Dev. The Scrum Master transforms detailed plans into hyper-detailed development stories with full context embedded. Cross-platform agent team and sub-agent inclusion in V6.

**Key features:**
- Edge Case Hunter that runs as a parallel code review layer
- Context sharding for large document management
- Codebase flattener (aggregates project into single XML for AI consumption)
- BMad Builder for module extensibility
- Dev Loop Automation
- Skills Architecture (V6)

**Comparison to GSD:** Both use agent-based orchestration for AI development. GSD uses generic agent types (planner, executor, verifier); BMAD uses named domain roles (Analyst, PM, Architect). GSD focuses on parallel execution waves and milestone management; BMAD focuses on role-based collaboration and detailed story generation. Both have adversarial review capabilities.

**Relationship:** Overlapping but different emphasis. GSD is more execution/verification-focused; BMAD is more planning/role-focused.

---

## Ideas Worth Borrowing

| Source | Idea | How it could fit this fork |
|--------|------|---------------------------|
| **Spec Kit** | Constitution file (`/speckit.constitution`) — project principles as a spec artifact | Our SDLC already serves this purpose, but a `/gsd-constitution` that generates a project-specific principles file from SDLC + project context could be interesting |
| **Spec Kit** | Community extensions ecosystem | This fork could support user-defined verification plugins or custom DoD checklist items |
| **OpenSpec** | Per-change artifact directories (`openspec/changes/`) | GSD already has per-phase directories — but quick tasks don't get this structure. Could add lightweight change tracking to `/gsd-quick` |
| **OpenSpec** | `/opsx:verify` as a lightweight per-change verification | We have `/gsd-verify-work` — but a lighter-weight per-commit or per-change verification could be useful during development, not just at phase boundaries |
| **BMAD** | Named agent roles (Analyst, PM, Architect) beyond generic "planner/executor" | Our adversarial validation already does this for verification. Could extend to planning with a "Devil's Advocate" agent that challenges the plan before execution |
| **BMAD** | Context sharding for large documents | For large projects, auto-splitting CONTEXT.md or REQUIREMENTS.md into shards that agents load selectively. Reduces context window pressure |
| **BMAD** | Checkpoint preview as a distinct phase | Our Playwright verification is similar, but a dedicated "checkpoint" command that screenshots + summarizes current state could be useful mid-phase, not just post-phase |
| **BMAD** | Edge Case Hunter as parallel review | Similar to our adversarial finder agent — but run *during* execution as a parallel review layer, not just post-execution during verification |
| **BMAD** | Codebase flattener for AI consumption | GSD's `/gsd-map-codebase` serves a similar purpose but produces structured analysis docs. A flattener that produces a single context-optimized file could complement it |

## Prioritized Recommendations

**High value, low effort:**
1. Edge Case Hunter during execution (extend adversarial validation to run in parallel with executor)
2. Context sharding for large CONTEXT.md / REQUIREMENTS.md files
3. Lightweight change tracking for `/gsd-quick` tasks

**High value, high effort:**
4. Devil's Advocate agent that challenges plans before execution
5. Community extensions / plugin system for verification and DoD

**Lower priority:**
6. Constitution file generation (SDLC + CLAUDE.md already cover this)
7. Codebase flattener (map-codebase is sufficient for most cases)
