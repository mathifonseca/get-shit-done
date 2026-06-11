# Tensions

### T1 — Was the retry path sufficiently specified?
- planner's-eye: spec was adequate; bet 2 stated bounded retries explicitly (evidence: PLAN.md bet 2)
- executor's-eye: underspecified; failure signal that triggers retry vs. abort was absent (evidence: deviation log 03-02)
- Disagreement: specification completeness vs. execution judgment call on ambiguous input
- Candidate change: add ambiguity gate at plan-phase requiring explicit failure-signal → action mapping for retry paths

### T2 — Was the deviation logged at the right granularity?
- planner's-eye: deviation log 03-02 is too vague to enable retrospective learning; should cite the specific bet that was deviated from
- executor's-eye: log granularity was appropriate for the execution context; retrospective refinement is a tooling gap, not an execution fault
- Disagreement: deviation log authoring standards vs. retrospective tooling adequacy
- Candidate change: update the deviation log template to require a "bet deviated from: {bet-id}" field
