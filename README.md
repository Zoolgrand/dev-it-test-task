# Product Content Studio

A small product content editor for an online store. Managers sign in to a private admin area to edit product descriptions and SEO fields, then publish a product. Visitors browse the public catalog of published products and open their pages.

## Tech stack

| Area                       | Choice                            |
| -------------------------- | --------------------------------- |
| Language                   | TypeScript 6                      |
| Framework                  | Next.js 16 (App Router), React 19 |
| Database                   | PostgreSQL 18 (Docker)            |
| ORM                        | Prisma 7                          |
| Styling                    | Tailwind CSS 4, shadcn/ui         |
| API                        | REST via Next.js Route Handlers   |
| Unit and integration tests | Vitest 5                          |
| End-to-end tests           | Playwright 1.63                   |
| Code quality               | ESLint 9, Prettier 3              |
| Package manager            | npm                               |

## Prerequisites

- Node.js 24 or newer
- Docker

## Getting started

```bash
cp .env.example .env
npm ci
npm run db:up
npx prisma generate
npm run dev
```

The app runs at http://localhost:3000. A single process serves both the pages and the REST API.

## Running tests

Create the test and end-to-end databases once:

```bash
docker compose exec -T db createdb -U pcs product_studio_test
docker compose exec -T db createdb -U pcs product_studio_e2e
```

Then run the full check:

```bash
npm run verify
```

`verify` runs type checking, linting, formatting checks, unit and integration tests, and end-to-end tests. It is the same command CI runs. No test requires network access or API keys.

## AI-assisted product suggestions

The editor can generate a Ukrainian description and SEO fields from a product's name and attributes.

- Default mode is `LLM_MODE=mock`: a deterministic, in-process provider builds a suggestion from the product's own data. No network call, no API key, and this is what every automated test (unit, integration, and end-to-end) runs against. The editor shows a visible "Демо-режим" badge whenever this mode is active, so a reviewer never mistakes it for a real model call.
- Setting `LLM_MODE=live` switches to the real Gemini API (`gemini-3.8-flash` via `@google/genai`) and requires `GEMINI_API_KEY` (get a free key at https://aistudio.google.com/apikey). If `LLM_MODE=live` is set but the key is missing, the server never crashes: the "generate" button is disabled with a message explaining why, and a direct API call would still fall back to the mock provider server-side rather than error out.
- A raw model response is only ever trusted after it passes the same Zod schema used for saving (`productContentSchema`), with markdown code fences stripped first since models sometimes wrap JSON in them despite instructions. A response that fails validation (wrong shape, a field over its character limit) triggers one retry that tells the model which limit it violated; a transport failure (timeout, upstream 5xx) also gets one retry with a short delay. A second failure either way is reported to the user as a 503 without touching the database.

**Known limitations:**

- `gemini-3.8-flash` has a high real-world failure rate under demand at the time of writing; a user in live mode should expect to occasionally see the "not available" error and need to press "Згенерувати пропозицію" again. The mock provider, used by every automated test, is unaffected since it makes no network call.
- The one retry on transport failure is a fixed 500 ms delay, not exponential backoff with jitter; sufficient for this feature's scale, not tuned for high request volume.

## Scripts

| Command                    | Description                             |
| -------------------------- | --------------------------------------- |
| `npm run dev`              | Start the development server            |
| `npm run build`            | Create a production build               |
| `npm run start`            | Serve the production build              |
| `npm run verify`           | Run every check CI runs                 |
| `npm run test:unit`        | Unit tests, no database                 |
| `npm run test:integration` | Integration tests against PostgreSQL    |
| `npm run test:e2e`         | API and browser tests                   |
| `npm run lint`             | Lint the project                        |
| `npm run format`           | Format the project                      |
| `npm run db:up`            | Start PostgreSQL in Docker              |
| `npm run db:down`          | Stop PostgreSQL                         |
| `npm run db:migrate`       | Create and apply a migration            |
| `npm run db:reset`         | Drop, recreate, and reseed the database |
