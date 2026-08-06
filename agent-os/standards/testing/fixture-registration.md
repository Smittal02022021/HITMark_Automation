# Fixture Registration for New Page Objects

A page object in `pages/` is NOT usable in tests until it's registered in `fixtures/base.fixture.ts`. Three coordinated edits, all in that one file:

1. Import the class
2. Add it to the `Pages` type
3. Add a fixture entry that instantiates it (`async ({ page }, use) => { await use(new YourPage(page)); }`)

- Missing the `Pages` type entry or import is caught by TypeScript at compile time — the test file won't type-check when it destructures `{ page, yourPage }` and `yourPage` isn't a known fixture key.
- `base.fixture.ts` is the ONLY place page objects get registered — don't instantiate page objects manually inside a test file.
- UI tests import `{ test, expect }` from `base.fixture.ts`. Pure data/API tests (no browser needed) import directly from `@playwright/test` instead, to avoid triggering the `page`-dependent auto fixtures.
