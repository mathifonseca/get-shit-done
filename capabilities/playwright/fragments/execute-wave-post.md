# Contribution: playwright verification (execute:wave:post -> verifier)

Fork capability (SDLC-aligned). Gated by `workflow.playwright_verification`;
the capability layer resolves the knob, so this fragment never reads it inline.

**Playwright Verification** (optional — runs when `workflow.playwright_verification` is enabled)

When enabled, and the project has a Playwright configuration (`playwright.config.ts` or `playwright.config.js`):

1. **Detect Playwright setup:**
   ```bash
   PLAYWRIGHT_CONFIG=$(ls playwright.config.{ts,js} 2>/dev/null | head -1)
   ```
   If no config found, skip with note: `[playwright] No playwright.config found, skipping visual verification.`

2. **Run relevant Playwright tests:**
   ```bash
   # Run tests tagged for this phase, or all tests if no tagging
   npx playwright test --reporter=list 2>&1 || true
   ```

3. **Capture screenshots:**
   Playwright's default config captures screenshots on failure. Ensure screenshots are saved:
   ```bash
   SCREENSHOT_DIR=$(ls -d test-results/ playwright-report/ 2>/dev/null | head -1)
   ```

4. **Include in verification context:**
   If screenshots or test results exist, include them as evidence in the verifier's context:
   - List all captured screenshots with their test names
   - Report pass/fail counts
   - Any visual regression failures become verification gaps

5. **Reduce manual UAT:**
   For each test that passes with screenshots, mark the corresponding UAT item as `auto-verified (playwright)` — the user doesn't need to manually check what Playwright already validated.

**Integration with VERIFICATION.md:**
Add a section to the verification report:
```markdown
## Playwright Verification
- Tests run: {N}
- Passed: {P}
- Failed: {F}
- Screenshots: {screenshot_dir}

### Auto-Verified Behaviors
{List of UAT items verified by Playwright tests}
```
