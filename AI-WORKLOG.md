# AI Worklog

## Tools and models

| Tool                      | Model           | Contribution                                                                                        |
| ------------------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| Claude Code               | Claude Opus 5   | Stack research, technical design, phased implementation plan, mark-up of the mock-ups, final review |
| Claude Code               | Claude Sonnet 5 | Implementation of the plan's phases: code and tests, and the final refactoring pass                 |
| Google AI Studio (Stitch) | Gemini          | Generation of the screen mock-ups later transferred into code                                       |

Opus 5 produced the technical design and, through a brainstorming session that resolved several open questions (seed and admin credentials, the status field in the editor, the test database for Playwright, per-phase execution model), a phased implementation plan: ten phases, each scoped to a single commit and a single fresh session, with exact files to touch, ready-to-run test code, and a checklist of acceptance criteria closing every phase. That plan is what Sonnet 5 executed phase by phase. Opus 5 came back for the two passes where breadth matters more than throughput: turning the Stitch mock-ups into the actual mark-up and theme tokens, and the final review of the whole result against the requirements. Sonnet 5 did the final refactoring pass over the code it had written.

My contribution was the framing: scope and constraints, choosing between the options proposed, rejecting several recommendations, the coding practices recorded in `CLAUDE.md`, the screen designs, and verifying the result at every step. Every dependency version came from querying the registry rather than from a model's memory, which turned out to matter — see the second decision below. No commit in this repository was made by a model; each phase ended with a staged working tree that I read and committed myself.

## Decisions about AI-generated code

### Rejecting JWT in favour of database sessions

Commit [`6c76261`](https://github.com/Zoolgrand/dev-it-test-task/commit/6c76261) — _Authentication added_

The recommendation offered JWT with a `jti` stored in the database so tokens could be revoked. Once every request looks the token up in the database, the one real advantage of JWT, verification without shared state, is gone while its costs remain.

The strongest counterargument was that `middleware.ts` runs on the edge runtime where Prisma cannot reach the database, so only a signature can be checked there. It does not hold: middleware must never be the authoritative guard, since direct API calls bypass it, so the database is consulted in the data layer on every protected request anyway.

Decision: opaque session tokens in the database, which also make logout genuinely revoke. The check that this is not theatre is an API test that reuses a cookie after logout and expects the session row to be gone, plus one that forges a cookie and calls the admin endpoint directly, bypassing the proxy redirect, and still expects `401`.

### Rolling back TypeScript 7 and ESLint 10

Commit [`65f2f51`](https://github.com/Zoolgrand/dev-it-test-task/commit/65f2f51) — _Initial commit, project setup_

The design pinned the newest published version of every dependency. Two were unusable:

- `typescript-eslint` does not support TypeScript 7.0 and throws while loading the ESLint config. `eslint-config-next` depends on it, so linting was impossible. Pinned to TypeScript 6.0.3.
- `eslint-config-next@16.3.5` declares `eslint: >=9.0.0` but bundles plugins capped at `eslint ^9`. On ESLint 10 the react plugin fails with `context.getFilename is not a function`. Pinned to ESLint 9.39.5.

Both rollbacks came from reading an actual error, not from guessing at compatibility. The peer-dependency warnings during `npm install` were the first signal; running the tool confirmed they were real rather than cosmetic.

### The quota error the generated client reported as an outage

Commit [`1159184`](https://github.com/Zoolgrand/dev-it-test-task/commit/1159184) — _Gemini rate limit error handling_

The generated Gemini client ended its request in `catch { return null }`. An exhausted quota, a dropped connection and an empty response all collapsed into the same outcome, `unavailable`, and the retry wrapper around that call re-sent the request in every one of those cases — on top of the retries the SDK already performs internally. A 429 is the one failure a retry cannot fix: the second attempt spends what is left of the quota, and the administrator reads "Спробуйте ще раз", which is the opposite of the correct advice.

It surfaced in live mode on Gemini's free tier rather than in review, and that is the point: the code type-checks, and against the mock provider that every test runs on, the branch is never reached. Nothing in the project could have failed on it.

Decision: classify the failure instead of erasing it. `isRateLimitError` reads the status off the SDK's `ApiError`, the provider's outcome union gained a `rate_limited` member beside `unusable` and `unavailable`, the SDK's own retry layer was switched off with `retryOptions: { attempts: 1 }` so that one press is one request, the route answers `429`, and the panel tells the user the assistant's request limit is exhausted and to come back later.

Verification: four unit cases in `tests/unit/gemini-rate-limit.test.ts` — a 429 `ApiError` is a rate limit, a 500 is not, a plain `Error` is not, and a non-error value does not throw. The last two exist because `catch` receives `unknown`: a classifier that throws on what it is handed would turn a provider error the user can wait out into a crash inside the error path.

## Design (bonus)

The mock-ups were generated in Stitch and are available in Figma: [screen designs](https://www.figma.com/design/e13EJatcK9yai2sDTUtxEe/Untitled?node-id=0-1&t=jmEcylaWpjk8kerB-1). They cover login, the admin list, the editor with its clean, dirty, validation-error, save-success and save-failure states, the suggestion panel while loading and when ready, the catalog with and without products, and the product page — in desktop and mobile variants. The one state absent from the exports, an LLM failure in the suggestion panel, was built by analogy with the save-failure screen.

The transfer was done by moving the mock-up's colours, radii and typography into the shadcn theme variables in `src/app/globals.css` and editing the shadcn components in place, rather than wrapping them. It did not land green, and that is the useful part: the suite caught two things the diff hid. The first was a widened server-to-client payload. The mock-ups added a "Category" column to the admin list, and the straightforward way to feed it was a `category` field on `toAdminProductListItem` derived from the first attribute's name — three lines in a mapper, inside a diff that was otherwise CSS variables and layout classes, and it passed type checking, linting and the whole browser suite. It failed the inline snapshot on the mapper's key set, `exposes exactly these fields in the admin list`, which exists for exactly this event: every other check in the project fails when something breaks, this one fails when the payload leaving the server grows, whether or not anything is broken. The field turned out to be harmless — it is derived from an attribute the administrator already sees on the same screen — so the snapshot was updated deliberately, but a widened contract was never going to be noticed by a human reading that diff. The second was the mock-up's save-success state, which gave the submit button the same label as the success toast, so `getByText("Збережено")` matched two elements at once — the same ambiguity a screen-reader user hears as the word announced twice. Everything else survived a full redesign with the locators untouched, which is the argument for locating by role, label and text rather than by test ids: a redesign that preserves the interface preserves the tests.

Two constraints came from the tests rather than from the design. The mock-up shows the product name three times on the editor screen, while `getByText(product.name)` demands exactly one match, so the read-only name field became an input whose value is not text content and which is hidden from the accessibility tree, its label already announced by the `h1`. And the mock-up labels both the suggestion control and the form reset "Скасувати"; two identical accessible names on one screen break the locator and confuse a screen-reader user alike, so the form reset became "Скинути зміни".

## The role of automated tests in verifying AI-generated code

The setup commit contains six tests and no features, because a list of installed dependencies proves nothing about whether they work together. Two of those tests caught real defects rather than confirming expectations:

- `server-only` throws on import outside the `react-server` resolve condition that only Next.js provides. The integration test failed immediately, which is why that module is aliased to a stub in the Vitest config instead of the problem surfacing later inside a feature.
- One integration test asks PostgreSQL through `SELECT current_database()` whether the suite is connected to `product_studio_test`. That is stronger than checking an environment variable, and it guards against a misconfiguration that would let a later test truncate the development database.

The architectural boundary rules were verified the same way: each was tested by writing a file that violates it, confirming the lint failed with the expected message, then deleting the file. One of those checks exposed a genuine defect. The module resolver shipped by `eslint-config-next` could not resolve the `@/` alias for the dependency rule, so the rule reported errors on valid files while catching nothing. It was replaced with `eslint-plugin-import-x` and re-verified the same way.

The standard applied throughout: a check that has never been observed to fail is not evidence that it works. In practice that meant writing the test first, running it, and reading the failure message to confirm it failed for the intended reason — a model will otherwise happily produce a test that passes against an empty implementation.

## Assessing the tests themselves

The tests were written by the same models that wrote the code they check, which is a conflict of interest worth naming rather than hiding. Three habits kept it in check, and one weakness remains.

- **Test names state a rule, not a function call.** `a whitespace-only description is refused, because trimming happens before the length check` is falsifiable by reading it; `updateProduct works` is not. A name that states a rule also makes it obvious when a model has written a test that merely restates the implementation — the name comes out empty of meaning.
- **No mocks of our own modules, and no mocked Prisma.** A test built on a mocked ORM asserts that the code calls what the test expects it to call, which is the implementation written twice. Integration tests run against real PostgreSQL, API tests over real HTTP, browser tests in a real browser. The single substitution in the project is the LLM provider, and it is a product feature with a visible badge in the UI, not a test convenience.
- **Boundaries over happy paths.** Limits are tested exactly at the limit and one character over; a stale-version write is tested for changing nothing, not merely for returning 409; a draft is tested for answering exactly as a slug that never existed, since a different answer is itself an information leak.

The weakness: coverage was directed by the plan, so the suite defends the rules someone thought to write down. It is strong on the requirements in the task description and on the failure modes I anticipated, and it has no property-based or fuzz testing that could surface a case nobody imagined. The snapshot on the mapper key sets is the one check that catches something unanticipated — a field added later — and it is also the one check that has caught something in this repository that a human review of the diff would have missed.

## Time spent

About 10 hours in total: technical design and planning, implementation across the phases, all four levels of tests, the bonus parts (LLM integration, design transfer, Docker and CI), and the documentation. The task's guideline for the core part with tests is 6–8 hours. The Shopify import bonus was planned and cut for time; the README records it as unfinished.
