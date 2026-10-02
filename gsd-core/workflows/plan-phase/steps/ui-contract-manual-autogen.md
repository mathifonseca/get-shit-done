# Step: Branch 6a — manual UI design contract auto-generation

Fork-added branch (SDLC-aligned). Extracted from the plan-phase host loop per ADR-857
phase 6 (#1168). Reached from step 5.6 when `AUTO_CHAIN` is `false` and
`UI_PHASE_CFG` is `true`.

**Branch 6a (fork) — `AUTO_CHAIN` is `false` (manual) AND `UI_PHASE_CFG` is `true` (fork default):** Fire each active UI **step** hook exactly as Branch 5 does. The fork auto-generates the UI design contract on manual invocation too, instead of prompting for it. For each entry in `activeHooks` (in array order) where `kind == "step"` and `ref.skill` is set:

```
Skill(skill="gsd-${ref.skill}", args="${PHASE} --auto ${GSD_WS}")
```

Display: `UI design contract enabled (workflow.ui_phase=true) — generating UI-SPEC.md.`

After all UI step hooks return, re-read:

```bash
_UISPEC=( "${PHASE_DIR}"/*-UI-SPEC.md )
UI_SPEC_FILE=""; if [ -e "${_UISPEC[0]}" ]; then UI_SPEC_FILE="${_UISPEC[0]}"; fi
UI_SPEC_PATH="${UI_SPEC_FILE}"
```

Continue to step 6.
