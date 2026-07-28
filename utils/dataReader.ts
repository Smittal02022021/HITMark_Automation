import * as fs from 'fs';
import * as path from 'path';

const cache = new Map<string, unknown>();

/**
 * Loads test data from test-data/<moduleName>.json.
 * One JSON file per module - adding a new module is just: drop a new
 * JSON file in test-data/, define a matching interface where you use
 * it, and call readTestData<YourType>('yourModuleName').
 *
 * Only for non-sensitive test data. Real credentials still come from
 * .env.<env> via utils/testData.ts.
 */
export function readTestData<T>(moduleName: string): T {
  if (cache.has(moduleName)) {
    return cache.get(moduleName) as T;
  }

  const filePath = path.resolve(__dirname, '..', 'test-data', `${moduleName}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Test data file not found: test-data/${moduleName}.json\n` +
      `Expected at: ${filePath}\n` +
      `Check the module name matches the filename exactly (no .json extension needed in the call).`
    );
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  let parsed: T;
  try {
    parsed = JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(
      `Failed to parse test-data/${moduleName}.json - check for invalid JSON ` +
      `(trailing commas, missing quotes, etc).\n${(err as Error).message}`
    );
  }

  cache.set(moduleName, parsed);
  return parsed;
}