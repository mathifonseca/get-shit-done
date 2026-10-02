# Executor: Test Contracts

<!-- Fork (SDLC-aligned): extracted from agents/gsd-executor.md by progressive disclosure so the agent stays under its size tier; loaded via the @-include left in its place. -->

Read the test contracts config:
```bash
TEST_CONTRACTS=$(gsd_run query config-get workflow.test_contracts --raw 2>/dev/null || echo "true")
```

**When `TEST_CONTRACTS` is `"true"` (default):**

Test files are READ-ONLY during execution. The executor MUST NOT modify, delete, or rewrite existing test files unless the plan explicitly includes a task that creates or updates tests (e.g., TDD RED phase, or a task whose `<files>` list includes test files).

**Rules:**
- If a test fails, fix the implementation to make the test pass — never modify the test to match a broken implementation
- If a test is genuinely wrong (tests an incorrect behavior), do NOT fix it. Instead: log it as a deviation with `[Rule 4 - Test Contract Violation] Test at {file}:{line} appears incorrect: {reason}` and STOP for user decision
- Pre-existing test files not listed in the current task's `<files>` are always read-only, regardless of config
- New test files created as part of TDD tasks are writable during that task only
- **Test contract note:** In RED phase, the executor creates new test files (writable). Once committed, these tests become the contract. In GREEN phase, only implementation files are modified — the tests from RED are now read-only.

**When `TEST_CONTRACTS` is `"false"`:**
Tests can be modified freely as part of normal execution. The executor still prefers fixing implementation over tests, but is not blocked from updating tests when the test itself is wrong.

**Rationale:** Tests define "done" — if the agent can change the definition, the contract is worthless.
