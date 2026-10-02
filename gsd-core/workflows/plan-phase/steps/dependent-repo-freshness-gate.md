## 5.54. Dependent-Repo Freshness Gate

Fork-added gate (SDLC-aligned). Extracted from the plan-phase host loop per ADR-857
phase 6 (#1168): optional feature logic lives in a progressively-disclosed fragment.

If `discuss-phase` recorded `LOCKED` blockers from the dependent-repo pre-flight (CONTEXT.md `<decisions>` block citing a `gh search prs` finding), plans MUST cite the merge timestamp for each dependent repo and the surface verified. Plans citing dependent-repo state older than **14 days** must re-run `gh search prs --repo=<repo> --merged --search='<surface>' --limit=20` before execution starts; if any new merge intersects the surface, the plan is invalid and must be re-issued.

This gate exists to prevent multi-hour execution work from unwinding when an upstream contract changes silently between plan and execution. See SDLC §3 "Dependent-Repo Pre-Flight Check."

If CONTEXT.md has no dependent-repo entries, skip this gate.
