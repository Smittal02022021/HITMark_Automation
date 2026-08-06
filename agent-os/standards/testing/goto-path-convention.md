# goto() Path Convention

`BasePage.goto(path)` is always called WITHOUT a leading slash — e.g. `goto('some-page.htm')` or `goto('')`, never `goto('/x')`.

**Why:** `baseURL` in playwright.config.ts points at a specific page/path (not the domain root). A leading `/` resets the URL to the domain root instead of nesting under baseURL — the test lands on a 404 or an entirely different (wrong) screen instead of the intended page.

- Treat `path` as relative to baseURL's directory, not the domain root.
- When adding a new page object's navigation, copy the no-leading-slash convention from LoginPage's usage rather than assuming standard URL-joining rules apply.
