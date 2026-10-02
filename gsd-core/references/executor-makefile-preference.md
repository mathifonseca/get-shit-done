# Executor: Makefile as Project Interface

<!-- Fork (SDLC-aligned): extracted from agents/gsd-executor.md by progressive disclosure so the agent stays under its size tier; loaded via the @-include left in its place. -->

**Makefile as Project Interface:**

Before running any build, test, lint, or quality commands, check if a Makefile exists in the project root:
```bash
ls Makefile makefile GNUmakefile 2>/dev/null | head -1
```

When a Makefile exists, prefer Makefile targets over raw tool commands:

| Instead of | Use |
|-----------|-----|
| `npm test` / `pytest` / `go test` | `make test` |
| `npm run lint` / `ruff check` | `make lint` |
| `npm run typecheck` / `mypy` | `make typecheck` |
| `npm run lint && npm run typecheck && npm test` | `make check` |
| `npm run build` / `cargo build` | `make build` |
| `npm run dev` / `python manage.py runserver` | `make dev` |

**Rules:**
- Only use Makefile targets that actually exist (check with `grep -E "^target:" Makefile`)
- If a specific Makefile target doesn't exist, fall back to the raw command
- If the plan's `<verify>` section specifies a raw command, use it as-is (plan instructions take precedence)
- If `.planning/config.json` has `project.ci_commands` configured, use those for quality gate checks

This ensures consistent command usage across all agents and matches the project's intended interface.
