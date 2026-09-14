# Product Content Studio

A small product content editor for an online store. Managers sign in to a private admin area to edit product descriptions and SEO fields, then publish a product. Visitors browse the public catalog of published products and open their pages.

One Next.js application serves both the pages and the REST API. The interface is in Ukrainian; the code, the tests and this documentation are in English.

## Contents

- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running everything in Docker](#running-everything-in-docker)
- [REST API](#rest-api)
- [Testing](#testing)
- [AI-assisted product suggestions](#ai-assisted-product-suggestions)
- [Known limitations](#known-limitations)
- [Out of scope and unfinished](#out-of-scope-and-unfinished)
- [Time spent](#time-spent)
- [Scripts](#scripts)

## Tech stack

| Area                       | Choice                            |
| -------------------------- | --------------------------------- |
| Language                   | TypeScript 6                      |
| Framework                  | Next.js 16 (App Router), React 19 |
| Database                   | PostgreSQL 18 (Docker)            |
| ORM                        | Prisma 7                          |
| Validation                 | Zod 4                             |
| Authentication             | Opaque session cookie, argon2id   |
| Styling                    | Tailwind CSS 4, shadcn/ui         |
| API                        | REST via Next.js Route Handlers   |
| Unit and integration tests | Vitest 5                          |
| End-to-end tests           | Playwright 1.63                   |
| Code quality               | ESLint 9, Prettier 3              |
| Package manager            | npm                               |

Three choices are worth a sentence each.

**Sessions instead of JWT.** A session id is a random opaque string stored in the `Session` table. Logging out deletes the row, so the cookie is genuinely revoked rather than merely forgotten by the browser. A JWT would have needed a database lookup anyway to support revocation, which removes its only real advantage.

**Prisma with the `@prisma/adapter-pg` driver adapter.** Every query lives in `src/server/products/repository.ts` or `src/server/auth/`, and nothing reaches a client without passing through an explicit mapper.

**Zod schemas in `src/domain/`.** The same schema object is imported by the browser form and by the route handler, so a limit cannot drift between the two. Client-side validation exists for feedback speed only; the server always revalidates.

## Architecture

Three layers with a single direction of dependency:

| Layer                         | Contains                                         | May import           |
| ----------------------------- | ------------------------------------------------ | -------------------- |
| `src/domain/`                 | Zod schemas, types, pure rules                   | nothing              |
| `src/server/`                 | Prisma, repositories, services, auth, LLM client | `domain/`            |
| `src/app/`                    | pages and route handlers                         | `domain/`, `server/` |
| `src/components/`, `src/lib/` | presentational components and pure helpers       | `domain/`            |

The boundaries are enforced rather than advisory:

- `import "server-only"` at the top of every server module that reaches the database, the session or the model provider breaks the build if client code pulls it in. The two modules without it, the mappers and the provider interface, are pure functions and types with nothing to leak.
- ESLint `no-restricted-imports` zones reject cross-layer imports; each rule was verified by writing a file that violates it and confirming the expected error.
- `react/no-danger` is an error, and `dangerouslySetInnerHTML` appears nowhere in the project. Stored product content renders as text, and a browser test asserts that a `<script>` in a description never executes.

Authorization is checked in three independent places, and only one of them is authoritative. `src/proxy.ts` (Next.js 16's replacement for `middleware.ts`) redirects a visitor without a session cookie to the login page — this is an optimistic convenience and never a guard, because a direct API call bypasses it. Every protected page and every protected route handler calls `requireAdmin()`, which validates the session against the database on every request.

## Prerequisites

- Node.js 24 or newer
- Docker (for PostgreSQL)
- npm

## Getting started

From an empty directory to a working admin login:

```bash
git clone https://github.com/Zoolgrand/dev-it-test-task.git
cd dev-it-test-task
cp .env.example .env
```

Open `.env` and set `ADMIN_PASSWORD` to any value of at least 8 characters. It is the password you will use to sign in; the seed refuses to run without it. Then:

```bash
npm ci
npm run db:up
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

`npm run db:up` starts PostgreSQL in Docker and the container needs a few seconds to accept connections; if `migrate deploy` cannot connect, wait and run it again. `npm run db:seed` creates the administrator and three demo products — two published, one draft — and is idempotent, so running it twice changes nothing.

The app is served at http://localhost:3000:

- The public catalog is at `/`, and a published product at `/products/<slug>`.
- The admin area is at `/admin/products`. Visiting it without a session redirects to `/admin/login`, where you sign in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values from your `.env`.

## Environment variables

`.env` is listed in `.gitignore` and is never committed. What is committed is `.env.example`, which declares the contract of the environment rather than supplying values for it: it names every variable the application reads and carries a safe default only where a default cannot leak anything.

`ADMIN_PASSWORD` is deliberately empty in `.env.example`. A shipped default password is a shipped vulnerability: it survives into deployments, and it would put a real credential in the repository history. Locally you choose the value; in a deployed environment it comes from the platform's secret store. The seed validates it (`z.string().min(8)`) and exits with code 1 without touching the database if it is missing.

`GEMINI_API_KEY` is read only in `src/server/llm/gemini.ts`, which is a server module. No secret is exposed through a `NEXT_PUBLIC_` variable, and the API key never reaches the browser bundle or any API response.

| Variable         | Purpose                                                   | Default in `.env.example`                                          |
| ---------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`   | PostgreSQL connection string for the development database | `postgresql://pcs:pcs@localhost:5432/product_studio?schema=public` |
| `ADMIN_EMAIL`    | Email of the seeded administrator                         | `admin@example.com`                                                |
| `ADMIN_PASSWORD` | Password of the seeded administrator                      | empty on purpose — set it yourself                                 |
| `LLM_MODE`       | `mock` (default, no network) or `live` (real Gemini API)  | `mock`                                                             |
| `GEMINI_API_KEY` | Required only when `LLM_MODE=live`                        | empty                                                              |

Two more environment files are committed on purpose: `.env.test` and `.env.e2e`. They contain no secrets — only the connection strings of the two throwaway test databases — and committing them is what makes `npm run verify` reproducible on a clean clone.

## Running everything in Docker

The `full` profile builds the app image and runs it alongside PostgreSQL, applying pending migrations and seeding on startup. It reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `LLM_MODE` and `GEMINI_API_KEY` from the same `.env` file used for local development:

```bash
docker compose --profile full up --build
```

The app is served at http://localhost:3000, with the admin account and demo products already seeded. Stop it with `docker compose --profile full down`. The image runs as a non-root user, ships no `.env` file, and contains only production dependencies.

`docker compose up -d db` on its own still starts nothing but the database, for running `npm run dev` on the host exactly as before.

## REST API

| Method | Path                                  | Auth  | Purpose                              |
| ------ | ------------------------------------- | ----- | ------------------------------------ |
| POST   | `/api/auth/login`                     | —     | Sign in, sets the session cookie     |
| POST   | `/api/auth/logout`                    | —     | Sign out, deletes the session row    |
| GET    | `/api/admin/products`                 | admin | Every product, drafts included       |
| GET    | `/api/admin/products/[id]`            | admin | One product for the editor           |
| PUT    | `/api/admin/products/[id]`            | admin | Save content, SEO fields and status  |
| POST   | `/api/admin/products/[id]/suggestion` | admin | Generate a suggestion, saves nothing |
| GET    | `/api/products`                       | —     | Published products only              |
| GET    | `/api/products/[slug]`                | —     | One published product                |

Every error shares one body shape, so a client parses failures the same way everywhere:

```json
{ "error": { "code": "validation_failed", "message": "…", "fieldErrors": { "seoTitle": "…" } } }
```

| Status | When                                                                               |
| ------ | ---------------------------------------------------------------------------------- |
| `401`  | No valid session                                                                   |
| `404`  | Not found — also returned for a draft requested publicly, so existence never leaks |
| `409`  | The product changed since the version the client loaded                            |
| `422`  | Validation failed, with one message per field in `fieldErrors`                     |
| `429`  | Too many failed login attempts, or the model provider rate-limited the request     |
| `503`  | The model provider is unavailable                                                  |

The session cookie is `HttpOnly`, `SameSite=Lax`, `Secure` in production, and unreadable from JavaScript.

## Testing

### Strategy and why it looks like this

The rule behind every choice below: **a check that has never been observed to fail is not evidence that it works.** Each level exists because it can catch a class of defect that the cheaper level below it structurally cannot.

- **Unit tests (Vitest, no database).** Pure rules only: field limits and trimming, password hashing, session id generation and expiry, rate limiting with an injected clock, the mapper key sets, the LLM response parser. They are fast enough to run on every save, and they cover the boundaries — exactly at the limit, one character over — where off-by-one defects live.
- **Integration tests (Vitest against real PostgreSQL).** Services and repositories against a real database, never a mocked one. A mocked Prisma would prove that the code calls the functions the test expects it to call, which is a restatement of the implementation, not a test of it. Only a real database can show that a unique constraint holds, that `updatedAt` really moves, that a stale-version write changes nothing, and that a draft is invisible to every public query.
- **API tests (Playwright, real HTTP).** The requirement that invalid data must not be saved "including through direct API calls" is only provable over HTTP. These tests bypass the UI entirely: they check authorization, per-field validation rejections, version conflicts, and that the public API answers a draft exactly as it answers a slug that never existed.
- **Browser tests (Playwright, real browser).** Reserved for what only a browser can prove: that a rejected save keeps the user's typed text and is never shown as success, that a `<script>` inside a description renders as text instead of executing, that page titles come from the SEO fields, that the editor and catalog have no horizontal scrolling at 375px, and that applying an AI suggestion changes the editor without saving or publishing anything.

Two deliberate constraints shape the suite:

- **Our own modules are never mocked, and there is no mocked Prisma.** The only substitution in the project is the LLM provider, and it is a product feature (`LLM_MODE=mock`) rather than a test tool — which is why the mock mode is visibly badged in the UI instead of pretending to be a real model call.
- **Playwright locates elements by role, label or text**, the way a user finds them. A locator that reads like the interface also proves the interface is accessible; `data-testid` is a last resort and is not used.

Every test builds its own fixtures through a factory, no test shares mutable state with another, and **no test needs network access or an API key.**

### Databases

Three databases, and the test ones are never the development one:

| Database              | Used by                                                                       |
| --------------------- | ----------------------------------------------------------------------------- |
| `product_studio`      | `npm run dev`                                                                 |
| `product_studio_test` | Vitest integration tests                                                      |
| `product_studio_e2e`  | Playwright (the built app is started on port 3100 against it, per `.env.e2e`) |

An integration test asks PostgreSQL itself, through `SELECT current_database()`, whether the suite is connected to `product_studio_test`. That is stronger than checking an environment variable, and it is what stops a misconfiguration from letting a later test truncate the development database.

### Running the tests

Create the two test databases once:

```bash
docker compose exec -T db createdb -U pcs product_studio_test
docker compose exec -T db createdb -U pcs product_studio_e2e
```

Install the browser Playwright drives, once per machine:

```bash
npx playwright install chromium
```

Then run the full check — the same command CI runs:

```bash
npm run verify
```

It runs, in order: type checking, ESLint, a Prettier format check, unit and integration tests, and a production build followed by the Playwright API and browser suites. Individual levels are available as `npm run test:unit`, `npm run test:integration` and `npm run test:e2e`.

A development server on port 3000 does not have to be stopped first. Playwright starts its own production server on port 3100 — the port and the database both come from `.env.e2e` — and never reuses a server it did not start. Reusing one would mean testing against whatever database that server happens to be connected to, which is how a suite ends up green against the wrong data or red for a reason that has nothing to do with the code.

### Actual results

`npm run verify` on the current commit, Windows 11, Node 24, PostgreSQL 18 in Docker:

| Step                      | Result                   |
| ------------------------- | ------------------------ |
| `tsc --noEmit`            | passed                   |
| `eslint .`                | passed, no warnings      |
| `prettier --check .`      | passed                   |
| Unit tests                | 58 passed in 10 files    |
| Integration tests         | 26 passed in 6 files     |
| Playwright API tests      | 18 passed in 4 files     |
| Playwright browser tests  | 21 passed in 5 files     |
| **Total automated tests** | **123 passed, 0 failed** |

GitHub Actions runs the same `npm run verify` on every push to `main` and on every pull request, against PostgreSQL 18 in a service container.

## AI-assisted product suggestions

The editor can generate a Ukrainian description and SEO fields from a product's name and attributes.

**Verification without an API key.** The default mode is `LLM_MODE=mock`: a deterministic in-process provider builds a suggestion from the product's own data. No network call, no key, and this is what every automated test runs against. The editor shows a visible "Демо-режим" badge whenever this mode is active, so a reviewer never mistakes it for a real model call. Nothing extra needs to be configured — a clean clone exercises the whole feature, including its error paths, out of the box.

**With a real model.** Setting `LLM_MODE=live` switches to the Gemini API (`gemini-3.8-flash` via `@google/genai`) and requires `GEMINI_API_KEY`; a free key is available at https://aistudio.google.com/apikey. What was verified against the real model during development: successful generation of a Ukrainian description and SEO fields within the editor's limits, and the rate-limited response, which is where the handling of quota errors comes from. The remaining failure paths — a response that does not parse, a response over a field limit, a transport failure — are covered by unit tests against the parser rather than by a live response, because they cannot be provoked on demand. If `LLM_MODE=live` is set but the key is missing, the server never crashes: the generate button is disabled with an explanation, and a direct API call falls back to the mock provider server-side.

**Trusting the response.** A raw model response is only ever trusted after it passes the same Zod schema used for saving (`productContentSchema`), with markdown code fences stripped first, since models commonly wrap JSON in them despite instructions. A response that fails validation triggers one retry that tells the model which limit it violated; a transport failure (timeout, upstream 5xx) also gets one retry after a short delay. A second failure either way is reported to the user as a 503 without touching the database.

**Generation never writes.** Applying a suggestion only changes the contents of the editor's fields. It saves nothing and publishes nothing, and generating while the form has unsaved edits does not overwrite them until the user applies the suggestion explicitly.

## Known limitations

- **Rate limiting is in-memory.** The login limiter is a fixed window in a `Map`, so it resets on restart and does not coordinate across instances. Correct for a single-process deployment; a shared store would be required behind a load balancer.
- **Character counters use `String.length`.** A surrogate pair counts as two characters. The client counter and the server-side Zod check use the same measure, so the two never disagree with each other — but for an emoji-heavy description the number shown is not the number of user-perceived characters.
- **Filtering, searching and sorting happen in memory.** Both the catalog and the admin list load the full set and filter it in the server component. That is the right size of solution for three seeded products and would need SQL-level filtering and pagination for a real catalog.
- **There is no category column.** The category shown in the admin list and used by the catalog filter is derived from the name of a product's first attribute. It is a presentation-layer convenience, not a modelled concept.
- **Some catalog figures are decorative.** Price, article number, rating and review counts appear in the design mock-ups but are not part of the task's data model. They are generated deterministically from the product slug in `src/lib/demo-catalog.ts` so that the layout matches the design; they are not stored, not editable and not real.
- **`gemini-3.8-flash` fails often under demand** at the time of writing. In live mode, expect an occasional "not available" error and a second press of the generate button. The mock provider is unaffected, since it makes no network call.
- **The retry on transport failure is a fixed 500 ms delay**, not exponential backoff with jitter. Sufficient for this feature's scale, not tuned for high request volume.
- **Descriptions are plain text.** No rich formatting, by design — it is what keeps rendering stored content as text a simple, provable rule.
- **There is no public deployment.** The task does not require one; Docker Compose is the reproducible environment.

## Out of scope and unfinished

Out of scope by the task description, and therefore deliberately absent: registration, password recovery, roles, and creating or deleting products. The admin list carries a "create product" button because the design mock-up has one; it explains that creation is outside the task rather than pretending to work.

Unfinished: the **Shopify import bonus** was planned and cut for time. Nothing of it is half-built — there is no dead code or disabled UI for it in the repository. The other three bonuses (LLM integration, design, infrastructure) are implemented.

## Time spent

About 10 hours in total, including the technical design, the implementation plan, all four levels of tests and this documentation. The task's guideline for the core part with tests is 6–8 hours; the additional time went into the bonus parts.

## Scripts

| Command                    | Description                            |
| -------------------------- | -------------------------------------- |
| `npm run dev`              | Start the development server           |
| `npm run build`            | Create a production build              |
| `npm run start`            | Serve the production build             |
| `npm run verify`           | Run every check CI runs                |
| `npm run test:unit`        | Unit tests, no database                |
| `npm run test:integration` | Integration tests against PostgreSQL   |
| `npm run test:e2e`         | API and browser tests                  |
| `npm run lint`             | Lint the project                       |
| `npm run format`           | Format the project                     |
| `npm run db:up`            | Start PostgreSQL in Docker             |
| `npm run db:down`          | Stop PostgreSQL                        |
| `npm run db:migrate`       | Create and apply a migration           |
| `npm run db:seed`          | Create the administrator and demo data |
| `npm run db:reset`         | Drop, recreate and reseed the database |
