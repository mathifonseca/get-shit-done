# Contribution: adversarial validation gate (verify:post -> orchestrator)

Fork capability (SDLC-aligned). Gated by `workflow.adversarial_validation`; the
capability layer resolves the knob, so this fragment never reads it inline.

**Adversarial Validation Gate** (optional — runs when `workflow.adversarial_validation` is enabled)

When enabled, spawn three competing agents to cross-validate the phase's work. This is especially valuable for security-sensitive, financial, or data-integrity code.

**Agent 1: Finder** (biased toward finding issues)
Spawn a general-purpose agent with this prompt:
```
You are a code auditor tasked with finding EVERY possible issue in the phase {phase_num} implementation.

Score: +1 for low-impact findings, +5 for medium-impact, +10 for critical findings.

Review all files modified in this phase (from SUMMARY.md) and report:
- Security vulnerabilities (injection, auth bypass, data exposure)
- Logic errors (incorrect conditions, off-by-one, race conditions)
- Missing edge cases (null handling, empty states, error paths)
- Contract violations (does the code do what the tests/specs say?)
- Data integrity issues (missing validation, constraint violations)

Be thorough. Over-reporting is better than missing real issues.
Files to review: {list from SUMMARY.md}
```

**Agent 2: Critic** (biased toward disproving the finder)
After Finder completes, spawn with the finder's results:
```
You are a code defense attorney. The Finder agent reported {N} issues.

Score: +{N} for each finding you can disprove with evidence. But -2{N} if you incorrectly dismiss a real issue.

For each finding, determine:
- FALSE POSITIVE: The finding is wrong (explain why with code evidence)
- VALID: The finding is real (acknowledge it)
- DISPUTED: Reasonable people could disagree (state both sides)

Be skeptical of the findings but honest about real issues.
Findings to review: {finder_output}
Files: {same file list}
```

**Agent 3: Referee** (final judgment)
After Critic completes, spawn with both outputs:
```
You are the final arbiter. You have the ground truth and will be scored on accuracy.

The Finder reported {N} issues. The Critic disputed {M} of them.

For each finding, make a final call:
- CONFIRMED: Real issue that needs fixing before shipping
- DISMISSED: False positive, safe to ignore
- DEFERRED: Real but low-priority, can be addressed later

Provide a severity rating for confirmed issues: CRITICAL / HIGH / MEDIUM / LOW

Finder's report: {finder_output}
Critic's response: {critic_output}
```

**Process the referee's output:**
- CRITICAL/HIGH confirmed issues → add to gaps, block completion
- MEDIUM confirmed issues → add as warnings in VERIFICATION.md
- LOW/DEFERRED → note in VERIFICATION.md for future reference
- Update the overall verification status if any CRITICAL/HIGH issues found

**Append adversarial results to VERIFICATION.md:**
```markdown
## Adversarial Validation

### Findings Summary
| # | Finding | Finder | Critic | Referee | Severity |
|---|---------|--------|--------|---------|----------|
| 1 | {desc}  | Found  | Valid  | CONFIRMED | HIGH  |
| 2 | {desc}  | Found  | False Positive | DISMISSED | - |

### Confirmed Issues
{details of confirmed findings with file:line references}

### Dismissed Findings
{brief list of false positives for transparency}
```

If any CRITICAL or HIGH issues are confirmed, update the verification status to `gaps_found` and include the adversarial findings in the gaps frontmatter.
