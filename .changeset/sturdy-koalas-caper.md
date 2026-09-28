---
type: Fixed
pr: 1
---
`roadmap get-phase` now parses bullet-style phases (a `- [ ] **Phase N: Name**` row with its own indented Goal / Success criteria block and no `### Phase N:` heading) instead of reporting `malformed_roadmap`, which also re-enables the UI-SPEC gate for them; and `success_criteria` is no longer empty when the label is written `**Success criteria:**`.
