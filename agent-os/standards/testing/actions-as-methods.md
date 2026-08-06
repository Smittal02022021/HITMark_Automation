# User-Facing Actions as Page Object Methods

User-facing actions (e.g. `login()`, `validateLoginAsText()`) are async methods on the page object class. Tests call `loginPage.login(username, password)` — they never chain `.fill()`/`.click()` inline against locators.

**Why:** Locators and interaction logic leaking into test files defeats the Page Object Model boundary. Tests should read as business steps (login, checkout, submit search) that a non-technical reader can follow, not a sequence of raw Playwright calls tied to specific DOM elements.

- A new interaction that a user would recognize as one step (e.g. "log in", "submit the form") belongs as a method on the page object, not inline in the spec.
- Assertions that validate the *result* of an action (e.g. `validateLoginAsText()`) can also live on the page object when they check page-specific elements — keeps the locator knowledge in one place.
