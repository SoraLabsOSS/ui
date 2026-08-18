# AGENTS.md

Guidance for AI coding agents (Claude Code and others) working in this repository.

## What this is

Sora UI — an open-source, fully animated React component distribution (shadcn/ui-style registry) built with TypeScript, Tailwind CSS v4, and Motion. It's a Turborepo/Bun monorepo. `apps/www` (the docs + registry site) is where almost all component work happens.

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

Git hooks (lefthook): pre-commit runs `registry:build` (when registry/MDX that feeds it is staged) then `ultracite fix` on staged JS/TS/JSON/CSS and `lint:links` on `apps/www/content/**`; pre-push runs `bun run build`.

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

Everything under `apps/www/registry` follows the shadcn/ui registry-item.json convention and is described in detail in `apps/www/registry/README.md` and `CONTRIBUTING.md`. Actual tree today (no `components/` or `icons/` subtree exist yet — everything currently shipped is a primitive):

```
registry/
  primitives/{category}/{name}/index.tsx + registry-item.json   — unstyled, animated building blocks. All current work lives here.
  demo/primitives/{category}/{name}/                             — OPTIONAL manual demo, only when usage can't be expressed via demoProps (e.g. array/ReactNode children, multi-component layouts)
  hooks/, lib/
```

Categories under `primitives/`: `animate`, `buttons`, `disclosure`, `effects`, `radix`, `texts`.

Docs for primitives are **flat**, not nested by category: `apps/www/content/docs/primitives/<name>.mdx`, registered in `content/docs/primitives/meta.json`'s `pages` array (which uses `"---Section---"` separators, e.g. `---Texts---`, `---Interaction---`, `---Effects---`, for sidebar grouping — the category only matters for the registry file path, not the docs path).

**Minimal flow to add/modify a primitive:**
1. Write/edit `registry/primitives/<category>/<name>/index.tsx` + `registry-item.json`.
2. Set `meta.demoProps` on the registry-item.json for the Tweakpane controls and the auto-generated "Code" tab snippet — only add a manual `registry/demo/primitives/<category>/<name>/` folder when the example genuinely can't be expressed as simple value props (e.g. `children` is `ReactNode[]`, needs multiple sub-components, or has fixed layout).
3. Write/edit `content/docs/primitives/<name>.mdx` with `<ComponentPreview name="<name>" />` (or `"demo-<name>"` if a manual demo exists), `<ComponentInstallation name="<name>" />`, a `<TypeTable>` for props, and `<ComponentCredits name="<name>" />` if `meta.inspiration` is set.
4. Add `"<name>"` to `content/docs/primitives/meta.json`'s `pages` array, under the right `---Section---`.
5. Run `bun run registry:build` (from `apps/www`) — this merges `registry-item.json` files into `public/r/registry.json`, generates `__registry__/index.tsx`, synthesizes `demo-<name>` entries from `demoProps` when no manual demo folder exists, and runs `shadcn build`.

`registry:build` only picks up items actually referenced (via `<ComponentPreview name="..." />` / `<ComponentInstallation name="..." />`) from MDX under `content/docs` **or** `content/components` — an orphaned registry folder with no MDX reference in either tree won't appear on the site. (E.g. `sticky-scroll-cards` has no page under `content/docs/primitives/`, only a catalog page in `content/components/` — that alone is enough to get it published.)

### content/ — three separate trees, don't conflate them

- `content/docs/` — the actual documentation site (routed at `/docs`). Top-level guide pages (`index`, `installation`, `accessibility`, `community`, `license`, `mcp`, `other-animated-distributions`, `troubleshooting`) plus `docs/primitives/<name>.mdx` (flat, one per registry primitive — see flow above).
- `content/components/` — a small flat "Catalog" of fully-assembled example pages (routed at `/components`), listed in `content/components/meta.json`. Each page documents an existing `registry/primitives/<category>/<name>/` primitive (e.g. `cursor-trail-reveal`, `sticky-scroll-cards`) through a real-layout showcase — the MDX file itself is not a registry item and needs no `registry-item.json`, but the primitive it showcases still lives in and is defined by `registry/primitives/`.
- `content/blog/` — blog posts (routed at `/blog`), unrelated to the registry/docs flow.

### Primitive conventions (apply to every animated component)

- `"use client";` + import `cn` from `@workspace/ui/lib/utils` (not `@/lib/utils`) inside `registry/` files.
- Double-quoted strings, biome/ultracite-formatted (`ultracite/biome/core`, `react`, `next` presets extended in `biome.jsonc`).
- **`prefers-reduced-motion` must be respected** via `useReducedMotion()` from `motion/react` — either render a static/no-animation fallback branch, or skip the animated transition while still updating state. This was retrofitted across primitives (see git history) and is expected on all new animated components.
- Props are individually JSDoc-commented (`/** ... */`, with `@default` tags) — these comments are the source for docs `TypeTable` entries and are read by contributors, not auto-extracted.
- Expose a forwarded `ref` prop (React 19 style: `ref` as a normal prop, not `forwardRef`) on the root element where practical.
- When borrowing UX/animation ideas or a full implementation from an external library/site, set `meta.inspiration` (`type: "inspired"` or `"reimplemented"`) on the registry-item.json and add a `## Credits` section with `<ComponentCredits name="..." />` in the doc.

### apps/www app structure

Route groups under `apps/www/app`: `(home)`, `(account)`, `(llms)`, plus `docs`, `docs-og`, `blog`, `blog-og`, `components`, `demo`, `examples`, `pricing`, `privacy`, `legal`, `auth`, `api`. Docs content is Fumadocs-powered MDX under `apps/www/content`.

### apps/mcp

Exposes the Sora docs and component registry to AI tools/assistants over MCP. Tools live in `apps/mcp/src/tools/` (e.g. `sora-search-docs-tool.ts`, `sora-list-components-tool.ts`, `sora-get-component-info-tool.ts`); sources/caching for docs and registry data are in `apps/mcp/src/docs/` and `apps/mcp/src/registry/`.

## Code Standards (Ultracite)

Format/lint via Ultracite (Biome): `bun x ultracite fix` (check: `bun x ultracite check`). Run it before committing — lefthook's pre-commit hook does this automatically for staged files anyway.

Don't fight the linter — prefer clarity, accessibility, and type safety over cleverness. Biome catches most style/correctness issues automatically; use your own judgment for business logic, naming, and architecture, which it can't check. Rule details live in `biome.jsonc` and the `ultracite/biome/*` presets it extends.
