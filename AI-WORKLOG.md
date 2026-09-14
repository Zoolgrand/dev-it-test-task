# AI Worklog

## Tools and models

| Tool        | Model           | Contribution                                                 |
| ----------- | --------------- | ------------------------------------------------------------ |
| Claude Code | Claude Opus 5   | Stack research, technical design, phased implementation plan |
| Claude Code | Claude Sonnet 5 | Implementation of the plan's phases: code and tests          |

Opus 5 produced the technical design and, through a brainstorming session that resolved several open questions (seed and admin credentials, the status field in the editor, the test database for Playwright, per-phase execution model), a phased implementation plan in `PLAN.md`: ten phases, each scoped to a single commit and a single fresh session, with exact files to touch, ready-to-run test code, and a checklist of acceptance criteria closing every phase. That plan is what Sonnet 5 executes phase by phase. My contribution was the framing: scope and constraints, choosing between the options proposed, rejecting several recommendations, the coding practices recorded in `CLAUDE.md`, and verifying the result at every step. Every dependency version came from querying the registry rather than from a model's memory, which turned out to matter.

## Decisions about AI-generated code

### Rejecting JWT in favour of database sessions

The recommendation offered JWT with a `jti` stored in the database so tokens could be revoked. Once every request looks the token up in the database, the one real advantage of JWT, verification without shared state, is gone while its costs remain.

The strongest counterargument was that `middleware.ts` runs on the edge runtime where Prisma cannot reach the database, so only a signature can be checked there. It does not hold: middleware must never be the authoritative guard, since direct API calls bypass it, so the database is consulted in the data layer on every protected request anyway.

Decision: opaque session tokens in the database, which also make logout genuinely revoke.

### Rolling back TypeScript 7 and ESLint 10

The design pinned the newest published version of every dependency. Two were unusable:

- `typescript-eslint` does not support TypeScript 7.0 and throws while loading the ESLint config. `eslint-config-next` depends on it, so linting was impossible. Pinned to TypeScript 6.0.3.
- `eslint-config-next@16.3.5` declares `eslint: >=9.0.0` but bundles plugins capped at `eslint ^9`. On ESLint 10 the react plugin fails with `context.getFilename is not a function`. Pinned to ESLint 9.39.5.

Both rollbacks came from reading an actual error, not from guessing at compatibility. The peer-dependency warnings during `npm install` were the first signal; running the tool confirmed they were real rather than cosmetic.

## The role of automated tests in verifying AI-generated code

The setup commit contains six tests and no features, because a list of installed dependencies proves nothing about whether they work together. Two of those tests caught real defects rather than confirming expectations:

- `server-only` throws on import outside the `react-server` resolve condition that only Next.js provides. The integration test failed immediately, which is why that module is aliased to a stub in the Vitest config instead of the problem surfacing later inside a feature.
- One integration test asks PostgreSQL through `SELECT current_database()` whether the suite is connected to `product_studio_test`. That is stronger than checking an environment variable, and it guards against a misconfiguration that would let a later test truncate the development database.

The architectural boundary rules were verified the same way: each was tested by writing a file that violates it, confirming the lint failed with the expected message, then deleting the file. One of those checks exposed a genuine defect. The module resolver shipped by `eslint-config-next` could not resolve the `@/` alias for the dependency rule, so the rule reported errors on valid files while catching nothing. It was replaced with `eslint-plugin-import-x` and re-verified the same way.

The standard applied throughout: a check that has never been observed to fail is not evidence that it works.

## Time spent
