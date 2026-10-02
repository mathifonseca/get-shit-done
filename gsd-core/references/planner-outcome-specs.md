# Planner: Outcome-Focused Task Specs

> Loaded by `gsd-planner` (fork, SDLC-aligned) when
> `workflow.spec_outcome_enforcement` is enabled (default `true`). Read it with
> `gsd_run query config-get workflow.spec_outcome_enforcement --raw`.

When enabled, task `<action>` fields should describe WHAT the code should accomplish, not step-by-step HOW to write it. The executor agent is better at figuring out implementation details than a prescriptive plan.

**Good (outcome-focused):**
- "Create a POST endpoint that authenticates users via email/password, returns a JWT in an httpOnly cookie, and rejects invalid credentials with 401."
- "Build a message list component that fetches from /api/messages, displays sender + timestamp + content, and auto-scrolls to newest."

**Bad (overly prescriptive):**
- "First create a file at src/api/auth.ts. Import bcrypt from 'bcrypt'. Create an async function called authenticate. Call bcrypt.compare()..."
- "Step 1: Create useState for messages. Step 2: Add useEffect with fetch. Step 3: Map over messages array..."

The `<done>` and `<verify>` fields are where specificity belongs — they define the contract. The `<action>` field should give the executor enough context to make good decisions without dictating every line.

Constraints and non-obvious decisions still belong in `<action>` (e.g., "Use jose library, not jsonwebtoken — CommonJS issues with Edge runtime"). The goal is to eliminate mechanical step-by-step instructions, not useful context.
