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

Create the test database once:

```bash
docker compose exec -T db createdb -U pcs product_studio_test
```

Then run the full check:

```bash
npm run verify
```

`verify` runs type checking, linting, formatting checks, unit and integration tests, and end-to-end tests. It is the same command CI runs. No test requires network access or API keys.

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
