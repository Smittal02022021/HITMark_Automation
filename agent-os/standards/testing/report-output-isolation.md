# Timestamped, Isolated Report Output

playwright.config.ts generates one runId (e.g. `2026-07-24_14-05-30`) when the config loads — once per run, shared by every worker — and uses it to name both the HTML report folder (`playwright-report/<runId>/`) and the JUnit file (`test-reports/junit-results-<runId>.xml`).

**Why not use Playwright's defaults?**
- Playwright's managed `outputDir` (`test-results/`) is wiped at the start of every run — a JUnit file placed there would silently disappear before anyone could check yesterday's failures.
- A single fixed report path would let two runs (a scheduled run and a manual one, or two CI runs close together) overwrite each other's report mid-write.

- Never hardcode a path to "the" report folder — always resolve the most recent one (see `scripts/send-report-email.js`'s `getLatestSubfolder`/`getLatestJunitFile` helpers).
- The HTML report folder is fully self-contained (screenshots/videos/traces copied in), so old report folders stay viewable even after `test-results/` is cleared by a later run.
