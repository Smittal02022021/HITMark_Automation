# condition: always() for Reporting Steps

Every step after the test run that publishes or communicates results — PublishTestResults, PublishPipelineArtifact (HTML report), and the send-report-email script — uses `condition: always()` in azure-pipelines.yml.

**Why:** The entire point of these steps is visibility into failures. Azure Pipelines' default step condition is "run only if previous steps succeeded" — without `always()`, a failing test run would skip publishing results and skip the email, leaving no one aware the suite failed and no report to look at.

- No exceptions among reporting/notification steps — every step whose job is to surface results (not to produce them) should use `condition: always()`.
- Steps that produce the raw test output itself (running the suite) are NOT marked `always()` — this only applies to steps consuming/publishing that output afterward.
