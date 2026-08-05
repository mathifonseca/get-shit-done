---
type: Fixed
---
Fixed `progress.completed_plans` exceeding `progress.total_plans` in STATE.md frontmatter. `buildStateFrontmatter` summed raw SUMMARY counts into `completed_plans` while `total_plans` summed PLAN counts, so any phase with brief-driven gap-closure summaries (a SUMMARY with no PLAN) pushed the completed count past the total — producing frontmatter the `state-check` coherence gate rejects, on every state mutation. Each phase's contribution is now clamped to its own plan count, matching the asymmetry `scanPhasePlans` already models in its `completed` flag.
