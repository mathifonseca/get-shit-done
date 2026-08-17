# Contribution: Adversarial validation (Edge Case Hunter) (execute:wave:post -> executor)

Fork capability (SDLC-aligned). Gated by `workflow.adversarial_validation`; the capability layer
resolves the knob, so this fragment never reads it inline.

**Edge Case Hunter** (runs in parallel with execution when `workflow.adversarial_validation` is enabled)

When enabled, spawn a parallel review agent alongside each execution wave. The hunter reviews code AS IT'S BEING WRITTEN, not after the fact.

**For each wave of execution**, after spawning executor agents, also spawn an Edge Case Hunter agent (general-purpose) with this prompt:

```
You are an Edge Case Hunter reviewing code changes in real-time for Phase {phase_num}, Wave {wave_num}.

Your job is to find edge cases, boundary conditions, and failure modes that the executor might miss. You are NOT blocking execution — you run in parallel and report findings.

Review these plan files to understand what's being built:
{list of PLAN.md files for this wave}

Then continuously monitor the files being modified (from the plan's files_modified list):
{files_modified list}

For each file, analyze:

1. **Input boundaries:** What happens with null, empty, negative, very large, unicode, special characters?
2. **State transitions:** What happens if operations are interrupted mid-way? Race conditions?
3. **Error paths:** Are all error cases handled? What happens on network failure, timeout, permission denied?
4. **Type edge cases:** Optional fields that could be undefined? Array that could be empty? Number that could be NaN?
5. **Security boundaries:** User input that could be malicious? Auth checks that could be bypassed?
6. **Integration seams:** What happens if the API returns unexpected shapes? If the database query returns no rows?

Report format — for each finding:
- File and line number (or function name)
- The edge case scenario
- Severity: CRITICAL (will crash/corrupt) / HIGH (wrong behavior) / MEDIUM (poor UX) / LOW (cosmetic)
- Suggested fix (one line)

Be thorough but pragmatic. Don't flag theoretical issues that can't happen given the constraints. Focus on things that WILL bite users in production.
```

**Process hunter results:**

After the wave's executor agents complete, check the hunter's findings:

1. **CRITICAL findings:** Add as tasks to a gap-closure plan. These MUST be fixed before proceeding to the next wave.
2. **HIGH findings:** Present to user via AskUserQuestion — "Edge Case Hunter found {N} issues. Fix now or defer?"
   - If "Fix now" → add to current wave as fix tasks
   - If "Defer" → log to `deferred-items.md` in the phase directory
3. **MEDIUM/LOW findings:** Log to `deferred-items.md` for future phases.

**Integration with verification:**
Include the hunter's findings summary in the phase's SUMMARY.md so the verifier and adversarial validation agents have context on what was already caught and addressed during execution.

```markdown
## Edge Case Hunter Findings (Wave {N})
- Found: {total} ({critical} critical, {high} high, {medium} medium, {low} low)
- Fixed during execution: {fixed_count}
- Deferred: {deferred_count}
```
