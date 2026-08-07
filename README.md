# Playwright Automation Framework (TypeScript)

A Playwright + TypeScript framework with tests organised into **Smoke** and
**Regression** suites, a Page Object Model structure, and Azure DevOps
pipelines wired in for CI execution across multiple environments.

---

## 1. One-time Mac setup

### Install Node.js (if you don't already have it)
```bash
# via nvm (recommended, lets you manage Node versions)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install --lts
node -v
```

### Install VS Code
Download from https://code.visualstudio.com/ if not already installed.

### Install the Playwright VS Code extension
Open VS Code → Extensions (Cmd+Shift+X) → search **"Playwright Test for
VSCode"** (publisher: Microsoft) → Install.
This project's `.vscode/extensions.json` will also prompt you to install it
automatically the first time you open the folder.

---

## 2. Project setup

1. Unzip this project and open it in VS Code:
```bash
   cd path/to/playwright-automation-framework
   code .
```

2. Install dependencies:
```bash
   npm install
```

3. Install Playwright's browser binaries:
```bash
   npx playwright install
```

4. Set up your environment file:
```bash
   cp .env.example .env.qa
```
   Then edit `.env.qa` and set `BASE_URL` to your QA environment's URL,
   plus any test credentials. Create additional files the same way as more
   environments come online — `.env.uat`, `.env.prod`, etc. — following the
   same variable names as `.env.example`.

5. Sanity check - run the smoke suite:
```bash
   npm run test:smoke
```
   You'll see it fail against the placeholder LoginPage locators - that's
   expected until you point it at your real app (see step 4 below).

---

## 3. Folder structure

```
playwright-automation-framework/
├── tests/
│ ├── smoke/ # fast, critical-path checks - run on every build
│ └── regression/ # broader coverage - run on a schedule / pre-release
├── pages/ # Page Object Model classes
│ ├── BasePage.ts # shared behaviour all pages inherit
│ └── LoginPage.ts # example - replace with your app's pages
├── fixtures/
│ └── base.fixture.ts # injects page objects into tests via test
├── utils/
│ └── testData.ts # centralised test data / credentials
├── pipelines/
│ ├── smoke-tests.yml # ADO pipeline - triggers off dev/QA deploy
│ └── regression-tests.yml # ADO pipeline - manual trigger only
├── playwright.config.ts # projects, reporters, timeouts, env loading
├── tsconfig.json
├── .env.example # template - copy to .env.qa / .env.uat / .env.prod etc.
└── package.json
```

### Why both folders AND tags?
Tests live in `tests/smoke` or `tests/regression` by folder - that's the
primary split, and it's easy to reason about in VS Code's file explorer and
Test Explorer. This is also what the ADO pipelines run off of directly
(`tests/smoke`, `tests/regression`).

Each test title can also carry an `@smoke` or `@regression` tag via the
`test:tag:smoke` / `test:tag:regression` scripts, in case a test ever needs
to belong to *both* suites without duplicating the file. These aren't
currently used by the ADO pipelines (which run by folder), but are kept
available:
```bash
npm run test:tag:smoke
npm run test:tag:regression
```

---

## 4. Adding your app's tests

1. **Add a Page Object** in `pages/` for each screen (e.g. `DashboardPage.ts`),
   following the pattern in `LoginPage.ts`.
2. **Register it** in `fixtures/base.fixture.ts` so it's auto-injected into
   tests.
3. **Write the spec** in `tests/smoke/` or `tests/regression/` depending on
   how critical/frequent it needs to be.
4. Delete the example `login.smoke.spec.ts` / `login.regression.spec.ts`
   once you have real coverage - they're just there to prove the setup works.

---

## 5. Running tests

| Command | What it does |
|---|---|
| `npm run test:smoke` | Runs only the smoke suite (all browsers) |
| `npm run test:regression` | Runs only the regression suite (all browsers) |
| `npm run test:smoke:chromium` | Smoke suite, Chromium only (fastest, used by CI) |
| `npm run test:regression:chromium` | Regression suite, Chromium only (used by CI) |
| `npm run test:smoke:headed` | Smoke suite with visible browser |
| `npm run test:tag:smoke` | Runs anything tagged `@smoke`, regardless of folder |
| `npm run report` | Opens the last HTML report |
| `npm run codegen` | Opens Playwright's recorder to generate locators/actions |

Run against a different environment locally by setting `TEST_ENV` - this
loads the matching `.env.<name>` file (defaults to `qa` if unset):
```bash
TEST_ENV=uat npm run test:regression   # loads .env.uat
TEST_ENV=prod npm run test:smoke       # loads .env.prod
```

---

## 6. VS Code Test Explorer

With the Playwright extension installed, open the **Testing** tab (flask
icon) in the sidebar. You'll see every test grouped by file, and can run/debug
individual tests or whole folders (smoke or regression) with a click, and
set breakpoints directly in `.spec.ts` files.

---

## 7. Reporting

`playwright.config.ts` already has:
- **HTML reporter** - visual report with traces/screenshots/video on
  failure, saved to `playwright-report/<run-timestamp>/` so past runs are
  never overwritten
- **JUnit reporter** (`test-reports/junit-results-<run-timestamp>.xml`) -
  consumed by ADO's `PublishTestResults@2` task to populate the pipeline's
  Tests tab
- **List reporter** - plain pass/fail output in the terminal / CI log

---

## 8. Azure DevOps pipelines

Two pipelines live in `pipelines/`, both parameterised by target
environment (`dev` / `qa` / `uat` / `prod`, defaulting to `qa`):

- **`smoke-tests.yml`** - intended to trigger automatically once the app's
  Dev/QA deployment pipeline completes (via `resources.pipelines`). Can
  also be run manually against any environment.
- **`regression-tests.yml`** - manual trigger only (`trigger: none`) - run
  on demand from the ADO Pipelines UI, not tied to any deployment.

Both pipelines:
- Install Node.js + dependencies + Chromium
- Run the relevant suite via `test:smoke:chromium` / `test:regression:chromium`
- Publish JUnit results to the ADO Tests tab and the HTML report as a
  pipeline artifact
- Email a test report via SendGrid

Each environment has its own ADO variable group
(`HITMark-<Env>-Secrets`), so `BASE_URL` / `TEST_USERNAME` / `TEST_PASSWORD`
resolve automatically based on the environment selected at run time - no
YAML changes needed to point a run at a different environment.

**Known open item:** `smoke-tests.yml`'s trigger still references
placeholder values (`source`, `stage`) for the app's deployment pipeline -
these need to be swapped for the real pipeline name and stage identifier
once that pipeline exists in the client's ADO project.