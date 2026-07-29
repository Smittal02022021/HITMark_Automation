/**
 * Zips the most recent Playwright HTML report and emails it via SendGrid,
 * with a plain-text pass/fail summary pulled from the matching JUnit file.
 * Runs as a pipeline step after PublishPipelineArtifact, with
 * condition: always() so it fires whether the run passed or failed.
 *
 * Required environment variables (set via ADO variable group):
 *   SENDGRID_API_KEY  - SendGrid API key, "Mail Send" scope only
 *   REPORT_EMAIL_TO   - recipient address
 *   REPORT_EMAIL_FROM - sender address (must be a SendGrid-verified sender)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sgMail = require('@sendgrid/mail');

const REPORT_ROOT = path.resolve(__dirname, '..', 'playwright-report');
const JUNIT_DIR = path.resolve(__dirname, '..', 'test-reports');
const ZIP_PATH = path.resolve(__dirname, '..', 'playwright-report.zip');

function getLatestSubfolder(dir) {
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => ({ name: e.name, time: fs.statSync(path.join(dir, e.name)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  if (entries.length === 0) {
    throw new Error(`No report folders found in ${dir}`);
  }
  return path.join(dir, entries[0].name);
}

function getLatestJunitFile(dir) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('junit-results-') && f.endsWith('.xml'))
    .map((f) => ({ name: f, time: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  return files.length > 0 ? path.join(dir, files[0].name) : null;
}

function extractSummary(junitPath) {
  if (!junitPath) return { tests: '?', failures: '?' };
  const xml = fs.readFileSync(junitPath, 'utf-8');
  const testsMatch = xml.match(/tests="(\d+)"/);
  const failuresMatch = xml.match(/failures="(\d+)"/);
  return {
    tests: testsMatch ? testsMatch[1] : '?',
    failures: failuresMatch ? failuresMatch[1] : '?',
  };
}

async function main() {
  const latestReportFolder = getLatestSubfolder(REPORT_ROOT);
  const junitFile = getLatestJunitFile(JUNIT_DIR);
  const summary = extractSummary(junitFile);

  if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
  execSync(`zip -r "${ZIP_PATH}" .`, { cwd: latestReportFolder });

  const attachmentContent = fs.readFileSync(ZIP_PATH).toString('base64');
  const passed = summary.failures === '0';
  const statusLine = passed
    ? `All ${summary.tests} tests passed`
    : `${summary.failures} of ${summary.tests} tests failed`;

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sgMail.send({
    to: process.env.REPORT_EMAIL_TO,
    from: process.env.REPORT_EMAIL_FROM,
    subject: `[${passed ? 'PASSED' : 'FAILED'}] HITMark Smoke Suite - ${statusLine}`,
    text:
      `${statusLine}.\n\n` +
      `Full HTML report attached. Note: unzip it and run ` +
      `"npx playwright show-report <unzipped-folder>" to view it - opening ` +
      `index.html directly by double-clicking won't load the screenshots.`,
    attachments: [
      {
        content: attachmentContent,
        filename: 'playwright-report.zip',
        type: 'application/zip',
        disposition: 'attachment',
      },
    ],
  });

  console.log(`Report email sent: ${statusLine}`);
}

main().catch((err) => {
  console.error('Failed to send report email:', err);
  process.exit(1);
});