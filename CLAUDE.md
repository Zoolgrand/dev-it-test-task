@AGENTS.md

# Product Content Studio

A product content editor: a private admin area for editing product descriptions and SEO fields, and a public catalog of published products. One Next.js application serving both the pages and a REST API.

## Commands

| Command          | Purpose                                                             |
| ---------------- | ------------------------------------------------------------------- |
| `npm run dev`    | Development server                                                  |
| `npm run db:up`  | PostgreSQL in Docker                                                |
| `npm run verify` | Everything CI runs: typecheck, lint, format, unit, integration, e2e |

Run `npm run verify` before considering any change finished. Never claim work passes without running it and reading the output.

## Architecture

Three layers, each with a single direction of dependency:

| Layer                                                       | Contains                                             | May import           |
| ----------------------------------------------------------- | ---------------------------------------------------- | -------------------- |
| `src/domain/`                                               | validation schemas, types, pure rules                | nothing              |
| `src/server/`                                               | Prisma, repositories, services, auth, LLM client     | `domain/`            |
| `src/app/`                                                  | pages, route handlers                                | `domain/`, `server/` |
| `src/components/`, `src/hooks/`, `src/lib/`, `src/content/` | presentational components, hooks, utilities, UI copy | `domain/`            |

Non-route files colocated with a route live in a `_components/` folder, which Next never routes. Shared
components live in `src/components/` and are imported through `@/`, never through a relative climb out of a
route segment.

Database access belongs in `src/server/` only. UI code must never import Prisma directly.

These boundaries are enforced, not advisory:

- `import "server-only"` in server modules breaks the build if client code pulls them in.
- ESLint `no-restricted-imports` zones reject cross-layer imports.
- ESLint `import-x/no-extraneous-dependencies` rejects importing packages missing from `package.json`.

A boundary rule that does not fail on a real violation is worthless. After changing these rules, write a file that violates them, confirm the lint fails, then delete it.

## TypeScript

- No `any`. Accept `unknown` at boundaries and narrow explicitly.
- No non-null assertions (`!`). Narrow with a check or handle the absent case. Tests are the only place this is tolerated.
- Exported functions declare their return type. A contract change should fail at the function, not three files away.
- No barrel files. Import from the module that owns the symbol; re-export files hide real dependencies and create cycles.
- Use string literal unions or `as const` instead of `enum`.
- Prefer `satisfies` over `as` when checking a value against a type without widening it.

## Next.js

- Server Components by default. Add `"use client"` only for real interactivity, and push it as deep as possible: a leaf input, not the page.
- Route handlers stay thin: parse, authorize, delegate to a service, map the result to a response. No business logic lives there.
- Every protected route handler performs its own authorization check. `src/proxy.ts` is an optimistic redirect for UX and is never the only guard, because direct API calls bypass it.
- A `loading.tsx` starts streaming the segment, which commits a 200 before the page runs. Never place one above a route that answers with `notFound()`, or the 404 becomes a soft 404.
- SEO metadata comes from `generateMetadata`, never from mutating `document.title`.
- `dangerouslySetInnerHTML` is not used anywhere in this project. Stored content renders as text.
- No secret is ever exposed through a `NEXT_PUBLIC_` variable.
- `params` and `searchParams` are promises: `const { id } = await params`.

## React

- Derive state instead of synchronizing it. `useEffect` is for external systems such as subscriptions, timers, and aborts, not for recomputing values.
- Keys come from stable ids, never from array indexes.
- A failed save must not clear what the user typed. Form state lives in the component and survives a rejected request.

## Prisma and PostgreSQL

- All queries live in repository functions under `src/server/`. Pages and route handlers call services, never Prisma.
- Nothing reaches a client without passing through an explicit mapper. Repositories may read whole models; mappers decide what leaves the server, and a snapshot test on the mapper's key set catches fields added later.
- Migrations are committed and never edited once applied. Change the schema and generate a new one.
- Multi-step writes run in a transaction.
- Raw SQL only with a measured reason.

## Validation

- One Zod schema per concept in `src/domain/`, imported by both the client and the server.
- The server always revalidates. Client-side validation exists for feedback speed and proves nothing.
- `.trim()` before length checks, otherwise whitespace passes as non-empty.
- Parse at the boundary and work with typed data inward.

## Styling

- Mobile-first: base classes target the narrow screen, `md:` and `lg:` widen it.
- shadcn/ui components are our source code. Edit them in place rather than wrapping them to patch behavior.
- Use semantic tokens such as `bg-background` and `text-muted-foreground` rather than raw palette colors.
- Arbitrary values only when no token fits.

## REST

- `401` unauthenticated, `403` authenticated but not permitted, `404` when revealing existence would leak information, `422` validation failure with per-field errors, `409` version conflict.
- Error responses share one body shape across endpoints.
- No verbs in paths.

## Testing

| Level       | Tool       | Scope                                                    |
| ----------- | ---------- | -------------------------------------------------------- |
| unit        | Vitest     | `src/domain/` and pure helpers, no database              |
| integration | Vitest     | services and repositories against real PostgreSQL        |
| API         | Playwright | REST over HTTP, including auth and validation rejections |
| browser     | Playwright | user flows, responsiveness, escaping                     |

Write the failing test first, watch it fail for the right reason, then implement.

- Test behavior, not implementation. Our own modules are never mocked, and there is no mocked Prisma.
- Integration tests run against `product_studio_test` and must never touch the development database.
- A test name states the rule it defends, not the code it calls.
- Each test builds its own fixtures through a factory. No shared mutable state between tests.
- Playwright locates elements by role, label, or text, the way a user finds them. A `data-testid` is a last resort, because a locator that reads like the interface also proves the interface is accessible.
- Use web-first assertions such as `await expect(locator).toBeVisible()`. Never insert manual waits.
- Tests must not require network access or API keys.
