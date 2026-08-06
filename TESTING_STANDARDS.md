# Testing Standards - HITMark Automation Framework

Reference this file at the start of any AI coding session (paste it in, or
attach it) before asking for a new page object, test, or utility. It exists
so new code matches what's already here instead of each session reinventing
its own conventions.

---

## Folder structure - where new files go

```
pages/            Page Object classes (one file per screen/module)
tests/smoke/       Fast, critical-path tests - run on every Dev deployment
tests/regression/  Broader coverage - edge cases, negative paths, scheduled runs
fixtures/          base.fixture.ts - the ONLY place page objects get registered
utils/             Reusable helpers (data loading, reconciliation, etc.)
test-data/         Non-secret JSON test data, one file per module
scripts/           Standalone Node scripts run by the pipeline (not by Playwright)
```

## Page Objects

- Every page object extends `BasePage` (`pages/BasePage.ts`).
- Locators are `readonly` properties, assigned in the constructor.
- Prefer `getByRole()` / `getByLabel()` over CSS selectors - more resilient
  to markup changes, and closer to how a real user identifies elements.
  **Exception:** confirm the real locator against the live HITMark screen
  with Playwright's Pick Locator tool first - FileMaker WebDirect doesn't
  always expose standard roles/labels the way plain HTML does.
- User-facing actions (e.g. `login()`) are async methods on the class, not
  written inline in the test.
- `goto(path)` never uses a leading slash - `baseURL` is set to a specific
  page, and a leading `/` resets to the domain root instead of nesting
  under it. Use `goto('some-page.htm')` or `goto('')`, never `goto('/x')`.

## Fixtures - registering a new page object

Every new page object needs three additions to `fixtures/base.fixture.ts`:
1. Import the class
2. Add it to the `Pages` type
3. Add a fixture entry that instantiates it

This is not automatic - a page object that exists in `pages/` but isn't
registered here won't be available as `{ page, yourPage }` in a test.

**UI tests** import `{ test, expect }` from `fixtures/base.fixture.ts`
(gets page objects + the automatic final-screenshot fixture).
**Pure data/API tests** (e.g. data reconciliation work, no browser needed)
import `{ test, expect }` directly from `@playwright/test` instead - importing
from `base.fixture.ts` would force an unnecessary browser launch via its
`page`-dependent auto fixture.

## Test files

- Naming: `<feature>.<suite>.spec.ts` (e.g. `login.smoke.spec.ts`).
- Every test title ends with `@smoke` or `@regression` - folder placement is
  the primary suite split, the tag is a secondary filter for the rare case
  a test needs to run under both.
- Smoke = critical happy paths only, kept small and fast. Regression = edge
  cases, negative paths, validation rules.
- Prefer real app-state assertions (URL pattern, visible confirmation text)
  over just "the action didn't throw." A login test should confirm you
  landed somewhere meaningful, not only that `login()` completed.

## Test data

- **Non-secret structured data** (negative-test inputs, expected labels,
  search terms) → `test-data/<module>.json`, loaded via
  `readTestData<T>('module')` from `utils/dataReader.ts`. Define the
  matching TypeScript interface next to where you use it. These files are
  committed to git normally.
- **Credentials** → `.env.<env>`, loaded via `utils/testData.ts`. Never
  move credentials into a JSON file - `.env.*` is gitignored specifically
  so secrets don't reach source control.

## Comments

JSDoc-style block comments on exported functions/classes explain *why* a
decision was made, not just what the code does - especially for anything
non-obvious (a workaround, a gotcha, a deliberate trade-off). A comment
that just restates the code adds nothing; a comment explaining why
`goto()` defaults to `''` instead of `'/'` is worth having.

## Reporting

- HTML report and JUnit file are both timestamped per run
  (`playwright-report/<timestamp>/`, `test-reports/junit-results-<timestamp>.xml`)
  so nothing overwrites a previous run. Never hardcode a path to "the"
  report folder - always resolve the most recent one.
- JUnit output lives outside `test-results/` (Playwright's managed
  `outputDir`, which gets wiped at the start of every run) - keep it that
  way or historical JUnit files will silently disappear.
- A report's `index.html` is not self-contained - it references a sibling
  `data/` folder. Never open it directly as a `file://` URL; serve it with
  `npx playwright show-report <folder>`.

## Pipeline (Azure DevOps)

- Steps that should run regardless of pass/fail (publishing results,
  publishing the report, emailing it) use `condition: always()`.
- `CI: true` is set explicitly as a pipeline variable - Azure Pipelines
  does not set a generic `CI` env var the way GitHub Actions does, and
  `playwright.config.ts` relies on `process.env.CI` for retries/worker
  count/`forbidOnly`.
- Secrets (credentials, API keys) live in the ADO variable group, never in
  committed files.
