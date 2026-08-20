# AGENTS.md

Guidance for AI coding agents (Claude Code and others) working in this repository.

## What this is

Sora UI — an open-source, fully animated React component distribution (shadcn/ui-style registry) built with TypeScript, Tailwind CSS v4, Base UI, Radix UI, and Motion. It's a Turborepo/Bun monorepo. `apps/www` (the docs + registry site) is where almost all component work happens.

## Sora UI Taxonomy

```text
Sora UI
├── Primitives   (Animation building blocks: unstyled motion/effects)
├── Components   (Ready-to-use animated components & layout showcases)
└── UI           (Base UI + Radix UI foundation infused with Sora Motion & Tailwind CSS)
```

## Commands

Package manager is **Bun** (`bun@1.3.5`, pinned via `packageManager`). Run from repo root unless noted.

```bash
bun install                 # install deps
bun dev                     # turbo dev, all apps
bun run dev:www             # docs/registry site only (localhost:3000)
bun run build                # turbo build, all apps
bun run check-types          # turbo check-types (tsc --noEmit per package)
bun run lint                 # turbo lint (ultracite check)
bun run format:write          # ultracite fix (biome-based formatter/linter)
bun run registry:build        # rebuild the component registry (apps/www) — run after any registry/ or demoProps change
```

Single-app / targeted commands (run inside `apps/www`, or use `--filter=www`):

```bash
cd apps/www
bun run dev                  # next dev -p 3000
bun run check-types           # tsc --noEmit
bun run lint                  # ultracite check
bun run lint:links             # validates internal doc links (also runs in pre-commit for content/**)
bun run registry:build        # merges registry-item.json files, builds public/r/*.json
```

**Windows note:** `npx biome` / `npx tsc` resolve to unrelated decoy npm packages in this repo and silently produce fake output. Always invoke the real binaries directly: `node_modules/.bin/biome.exe check <path>` and `node_modules/.bin/tsc.exe --noEmit -p apps/www` (or `apps/www/tsconfig.json`).

There is no test runner configured in this repo — verification is via `check-types`, `lint`, and `registry:build`.

Git hooks (lefthook): pre-commit runs `ultracite fix` on staged JS/TS/JSON/CSS and `lint:links` on `apps/www/content/**`; pre-push runs `bun run build`.

## Architecture

### Monorepo layout

```
apps/
  www/   — docs site + component registry (Next.js, Fumadocs). Primary work surface.
  mcp/   — MCP server (mcp-framework) exposing Sora docs/registry as tools (search docs, list components, get component info) for AI assistants.
packages/
  ui/                 — @workspace/ui: shared primitives-adjacent utilities (cn, get-strict-context, get-motion-component), globals.css, base hooks.
  auth-ui/            — @workspace/auth-ui: better-auth UI wiring.
  db/                 — @workspace/db: Drizzle ORM schema/client (db:generate/push/migrate/studio).
  typescript-config/  — shared tsconfig bases.
```

### The registry system (apps/www/registry) — the core of this repo

Everything under `apps/www/registry` follows the shadcn/ui registry-item.json convention and is described in detail in `apps/www/registry/README.md` and `CONTRIBUTING.md`.

```
registry/
  ui/
    base/{name}/                                                 — Base UI + Motion components (UI tier)
    radix/{name}/                                                — Radix UI + Motion components (UI tier)
  primitives/
    {animate|buttons|disclosure|effects|texts}/{name}/           — Unstyled animation primitives
  demo/
    ui/{base|radix}/{name}/                                      — Manual demos for UI tier
    primitives/{category}/{name}/                                — Manual demos for Primitives tier
  hooks/, lib/
```

### content/ — four separate trees, don't conflate them

- `content/docs/` — the core documentation site (routed at `/docs`). Top-level guide pages plus `docs/primitives/<name>.mdx` (flat, one per registry primitive).
- `content/ui/` — Base UI & Radix UI + Motion app components (routed at `/ui`). Flat MDX pages referenced by `content/ui/meta.json`; registry source lives under `registry/ui/base/` or `registry/ui/radix/`.
- `content/components/` — flat catalog of fully-assembled example layout pages (routed at `/components`), listed in `content/components/meta.json`. Showcases existing registry primitives.
- `content/blog/` — blog posts (routed at `/blog`).

### Primitive conventions (apply to every animated component)

- `"use client";` + import `cn` from `@workspace/ui/lib/utils` (not `@/lib/utils`) inside `registry/` files.
- Double-quoted strings, biome/ultracite-formatted (`ultracite/biome/core`, `react`, `next` presets extended in `biome.jsonc`).
- **`prefers-reduced-motion` must be respected** via `useReducedMotion()` from `motion/react` — either render a static/no-animation fallback branch, or skip the animated transition while still updating state.
- Props are individually JSDoc-commented (`/** ... */`, with `@default` tags) — these comments are the source for docs `TypeTable` entries.
- Expose a forwarded `ref` prop (React 19 style: `ref` as a normal prop, not `forwardRef`) on the root element where practical.
- Full Tailwind CSS class override support via `cn(...)` so consumers can override sizes, borders, and colors seamlessly.
- When borrowing UX/animation ideas or a full implementation from an external library/site, set `meta.inspiration` (`type: "inspired"` or `"reimplemented"`) on the registry-item.json and add a `## Credits` section with `<ComponentCredits name="..." />` in the doc.

### apps/www app structure

Route groups under `apps/www/app`: `(home)`, `(account)`, `(llms)`, plus `docs`, `docs-og`, `blog`, `blog-og`, `components`, `ui`, `demo`, `examples`, `pricing`, `privacy`, `legal`, `auth`, `api`. Docs content is Fumadocs-powered MDX under `apps/www/content`.

### apps/mcp

Exposes the Sora docs and component registry to AI tools/assistants over MCP. Tools live in `apps/mcp/src/tools/` (e.g. `sora-search-docs-tool.ts`, `sora-list-components-tool.ts`, `sora-get-component-info-tool.ts`); sources/caching for docs and registry data are in `apps/mcp/src/docs/` and `apps/mcp/src/registry/`.

## Code Standards (Ultracite)

Format/lint via Ultracite (Biome): `bun x ultracite fix` (check: `bun x ultracite check`). Run it before committing.