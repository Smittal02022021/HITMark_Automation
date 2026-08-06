# Wait Helpers (BasePage)

Use `waitForVisible(locator)` and `isVisible(locator)` from `BasePage` instead of raw `locator.waitFor()`.

- `waitForVisible()` — throws on timeout. Use for elements that MUST be present; a real failure should fail loudly.
- `isVisible()` — swallows the timeout, returns `false`. Use only for optional/conditional elements (e.g. "is this banner showing or not").

**Common mistakes (both happen often):**
- Using `isVisible()` on a required element — masks a real failure as a silent `false` instead of a clear timeout error.
- Calling `locator.waitFor()` directly instead of these helpers — loses the shared timeout defaults and the one-place-to-tune convention.
