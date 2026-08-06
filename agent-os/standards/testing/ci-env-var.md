# CI Env Var Must Be Set Explicitly in ADO

azure-pipelines.yml sets `CI: true` as an explicit pipeline variable. Unlike GitHub Actions, Azure Pipelines does not auto-set a generic `CI` env var — playwright.config.ts reads `process.env.CI` to decide retries, worker count, and `forbidOnly`.

**If a new pipeline/stage forgets this:**
Tests silently run with dev settings inside CI — retries=0 (flaky tests fail the build instead of retrying once), workers=unlimited instead of 4 (resource contention on the agent), and forbidOnly=false (an accidentally committed `.only()` won't fail the build).

- Any new Azure DevOps pipeline/stage that runs Playwright tests must set `CI: true` in its `variables` block.
- Don't assume CI-like behavior is automatic just because the job runs in a hosted agent.
