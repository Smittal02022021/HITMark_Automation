# Mixed Data-Source Pattern in Specs

Specs commonly combine both data sources in one file to build negative-path permutations — e.g. `users.validUser.username` (from `testData.ts`) + `loginData.emptyUser.password` (from `login.json`) to test "blank password with a valid username".

**Which source for new data?**
1. **Secret?** → `utils/testData.ts`, backed by `.env.<env>` (gitignored). Never move credentials into a JSON file.
2. **Not secret?** → `test-data/<module>.json` via `readTestData<T>('module')`, with a matching TS interface defined next to where it's used.
3. **Reused across many specs** (like the one valid login) → belongs in `testData.ts` as a shared export, even if not secret — avoids duplicating the same value into multiple JSON files.
4. **Specific to one feature/module's edge cases** → belongs in that module's JSON file, not bolted onto `testData.ts`.

Secrecy decides the source; reusability decides whether non-secret data lives in the shared `testData.ts` or a per-module JSON file.
