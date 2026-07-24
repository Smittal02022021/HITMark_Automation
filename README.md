# Playwright Automation Framework (TypeScript)

A Playwright + TypeScript framework with tests organised into **Smoke** and
**Regression** suites, a Page Object Model structure, and config that's
ready to plug into Azure DevOps pipelines later.

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
   cp .env.example .env.dev
   ```
   Then edit `.env.dev` and set `BASE_URL` to your new web application's
   dev URL, plus any test credentials.

5. Sanity check - run the smoke suite:
   ```bash
   npm run test:smoke
   ```
   You'll see it fail against the placeholder LoginPage locators - that's
   expected until you point it at your real app (see step 3 below).

---

## 3. Folder structure

```
playwright-automation-framework/
├── tests/
│   ├── smoke/            # fast, critical-path checks - run on every build
│   └── regression/       # broader coverage - run on a schedule / pre-release
├── pages/                # Page Object Model classes
│   ├── BasePage.ts       # shared behaviour all pages inherit
│   └── LoginPage.ts      # example - replace with your app's pages
├── fixtures/
│   └── base.fixture.ts   # injects page objects into tests via `test`
├── utils/
│   └── testData.ts       # centralised test data / credentials
├── playwright.config.ts  # projects, reporters, timeouts, env loading
├── tsconfig.json
├── .env.example          # template - copy to .env.dev / .env.staging etc.
└── package.json
```

### Why both folders AND tags?
Tests live in `tests/smoke` or `tests/regression` by folder - that's the
primary split you asked for, and it's easy to reason about in VS Code's
file explorer and Test Explorer.

Each test title also carries an `@smoke` or `@regression` tag. You don't
need this today, but it means if a test ever needs to belong to *both*
suites, you can `--grep` for it instead of duplicating the file:
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
| `npm run test:smoke:chromium` | Smoke suite, Chromium only (fastest for local dev) |
| `npm run test:smoke:headed` | Smoke suite with visible browser |
| `npm run test:tag:smoke` | Runs anything tagged `@smoke`, regardless of folder |
| `npm run report` | Opens the last HTML report |
| `npm run codegen` | Opens Playwright's recorder to generate locators/actions |

Run against a different environment:
```bash
TEST_ENV=staging npm run test:regression   # loads .env.staging
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
- **HTML reporter** - local, visual report with traces/screenshots/video on failure
- **JUnit reporter** (`test-results/junit-results.xml`) - this is the format
  Azure DevOps's "Publish Test Results" pipeline task expects, so no config
  changes will be needed there later.

---

## 8. Next step: Azure DevOps

Not set up yet, by design - once your app is stable enough to test and this
framework has real coverage, we'll add an `azure-pipelines.yml` that:
- runs `npm ci` + `npx playwright install --with-deps`
- runs `test:smoke` on every PR/build, `test:regression` on a schedule or pre-release
- publishes the JUnit results and HTML report as pipeline artifacts

Just say the word when you're ready for that piece.
