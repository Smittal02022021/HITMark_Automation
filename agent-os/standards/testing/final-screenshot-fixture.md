# Auto-Fixture: finalScreenshot

`fixtures/base.fixture.ts` registers an `{ auto: true }` fixture that captures a full-page screenshot after every test — pass or fail — as its own named step (`Capture final screenshot - <url>`), attached to the report.

**Why not rely on Playwright's built-in `screenshot: 'only-on-failure'`?**
A test can pass while landing on the wrong screen (false positive) — built-in failure-only screenshots give no visual record in that case. This fixture always captures the final state so it's checkable regardless of pass/fail.

- Applies to every UI test with no opt-out — any spec importing `{ test, expect }` from `base.fixture.ts` gets it automatically. Consistency in the report matters more than the small time/storage cost per test.
- Capture failures inside the fixture (e.g. page already closed/navigated away) are deliberately swallowed — a screenshot problem must never flip an otherwise-passing test to failed, or mask the real failure.
- Pure data/API tests that import `{ test, expect }` directly from `@playwright/test` (not `base.fixture.ts`) don't get this — they have no `page` to screenshot.
