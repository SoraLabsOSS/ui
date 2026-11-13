# AGENTS.md

Guidance for AI coding agents (Claude Code and others) working in this repository.

## What this is

Sora UI — an open-source, fully animated React component distribution (shadcn/ui-style registry) built with TypeScript, Tailwind CSS v4, Base UI, Radix UI, and Motion. It's a Turborepo/Bun monorepo. `apps/www` (the docs + registry site) is where almost all component work happens.

## Sora UI Taxonomy

```text
Sora UI
├── Motion       (Animation building blocks: unstyled motion/effects at /motion)
├── Icons        (Animated Lucide icons at /icons)
├── Catalog      (Ready-to-use animated showcases & full layout pages at /catalog)
└── UI           (Base UI + Radix UI foundation infused with Sora Motion & Tailwind CSS at /ui)
```

## Knowledge Graph & Codebase Exploration (Graphify)

This repository maintains a Graphify knowledge graph at `graphify-out/` to help AI agents understand cross-file relationships, architecture, and dependencies.

### Exploration Strategy

Use Graphify as the primary discovery tool when the task involves:

- Unfamiliar subsystems or architectural exploration.
- Cross-file dependency tracing.
- Understanding component relationships across registry, demos, documentation, and metadata.
- Impact analysis before modifying shared components or utilities.

Available commands:

- `graphify query "<question>"` — retrieve a scoped subgraph for architecture and codebase questions.
- `graphify path "<A>" "<B>"` — inspect dependency paths between symbols.
- `graphify explain "<concept>"` — discover nodes and relationships associated with a concept.

### Direct Code Search

Use Read, Grep, Glob, and Bash directly when:

- The target file or symbol is already known.
- Performing exact string, import, or reference searches.
- Fixing localized bugs or making small changes.
- Verifying implementation details discovered through Graphify.

Do not run Graphify for copy edits, UI string tweaks, or text modifications in known files; use direct search, read, and edit instead.

**Graphify is a discovery and navigation aid, not a source of truth.** Always verify relevant relationships, symbols, and implementation details against the actual source code using Grep and Read.

Do not run Graphify for every trivial task. Prefer the smallest exploration strategy that provides sufficient context.

### Graph Maintenance

- Run `graphify update .` after completing a meaningful batch of source-code changes when the graph needs refreshing.
- Prefer refreshing the graph after structural changes, such as adding, removing, moving, or renaming source files and changing module dependencies.
- Avoid redundant updates during intermediate edits or cosmetic/content changes (e.g. CSS values, text copy).
- Do not treat inferred graph edges as confirmed runtime or static dependencies.
- If the graph is missing, stale, or incomplete, fall back to direct code exploration.

### Subagent Instructions

Subagents performing architectural exploration should use Graphify when relevant, then verify findings against source code. Do not mandate Graphify for trivial or narrowly scoped tasks.

## Commands

Package manager is **Bun** (`bun@1.3.5`, pinned via `packageManager`). Run from repo root unless noted.

```bash
bun install                 # install deps
bun dev                     # turbo dev, all apps
bun run dev:www             # docs/registry site only (localhost:3000)
bun run build                # turbo build, all apps
bun run check-types          # turbo check-types (tsc --noEmit per package)
bun run lint                 # turbo lint (ultracite check)
bun run format:write          # ultracite fix (oxfmt/oxlint via Ultracite)
bun run registry:build        # rebuild component registry (apps/www); already runs ultracite on generated files
bun run doctor <name>         # targeted component check (registry, demoProps, MDX, meta.json)
```

Single-app / targeted commands (run inside `apps/www`, or use `--filter=www`):

```bash
cd apps/www
bun run dev                  # next dev -p 3000
bun run check-types           # tsc --noEmit
bun run lint                  # ultracite check
bun run lint:links             # validates internal doc links (also runs in pre-commit for content/**)
bun run registry:build        # merges registry-item.json, builds public/r/*.json, ultracite-fixes generated files
```

**Windows note:** `npx tsc` can resolve to an unrelated decoy npm package in this repo and silently produce fake output. Always invoke the real binary directly: `node_modules/.bin/tsc.exe --noEmit -p apps/www` (or `apps/www/tsconfig.json`).

There is no test runner configured in this repo — verification is via `check-types`, `lint`, `registry:build`, and `bun run doctor <name>` (for targeted component health checks; avoid `doctor --all` during feature work). `registry:build` already runs `ultracite fix` on the files it generates (`apps/www/__registry__/*`, `public/r/*.json`). Do not run a second `bun x ultracite fix` / `bun run format:write` just because you ran `registry:build`.

Git hooks (lefthook): pre-commit runs `ultracite fix` on staged files and `lint:links` on `apps/www/content/**`; pre-push runs `bun run check-types`.

## Architecture

### Monorepo layout

```
apps/
  www/   — docs site + component registry (Next.js, Fumadocs). Primary work surface.
  xmcp/  — MCP server (xmcp) exposing Sora docs/registry as tools (search docs, list components, get component info) for AI assistants.
packages/
  ui/                 — @workspace/ui: shared primitives-adjacent utilities (cn, get-strict-context, get-motion-component), globals.css, base hooks.
  auth-ui/            — @workspace/auth-ui: better-auth UI wiring.
  db/                 — @workspace/db: Drizzle ORM schema/client (db:generate/push/migrate/studio).
  typescript-config/  — shared tsconfig bases.
  www-cli/            — @workspace/www-cli: internal contributor CLI for scaffolding registry components (`bun run create`).
```

### The registry system (apps/www/registry) — the core of this repo

Everything under `apps/www/registry` follows the shadcn/ui registry-item.json convention and is described in detail in `apps/www/registry/README.md` and `CONTRIBUTING.md`.

```
registry/
  ui/
    base/{name}/                                                 — Base UI + Motion components (UI tier)
    radix/{name}/                                                — Radix UI + Motion components (UI tier)
  primitives/
    {animate|buttons|disclosure|effects|shaders|texts}/{name}/   — Unstyled animation primitives (Motion tier)
  catalog/{name}/                                                — Ready-to-use animated layout showcases (Catalog tier)
  icons/{name}/                                                  — Animated Lucide icons (@soralabs/icons-*)
  demo/
    ui/{base|radix}/{name}/                                      — Manual demos for UI tier
    primitives/{category}/{name}/                                — Manual demos for Motion tier
    catalog/{name}/                                              — Showcase preview demos for Catalog tier
    icons/{name}/                                                — Interactive preview demos for Icons tier
  hooks/, lib/
```

### content/ — distinct content trees, don't conflate them

- `content/docs/` — the core documentation site (routed at `/docs`). Top-level guide pages.
- `content/motion/` — unstyled animation primitives (routed at `/motion`). Flat, one MDX per primitive.
- `content/icons/` — animated icons documentation and showcase (routed at `/icons`).
- `content/ui/` — Base UI & Radix UI + Motion app components (routed at `/ui`). MDX pages organized by framework under `content/ui/base/<name>.mdx` and `content/ui/radix/<name>.mdx`, referenced in `content/ui/meta.json`; registry source lives under `registry/ui/base/` or `registry/ui/radix/`.
- `content/catalog/` — flat catalog of fully-assembled example layout pages (routed at `/catalog`, backwards-compatible with `/components`), listed in `content/catalog/meta.json`.
- `content/blog/` — blog posts (routed at `/blog`).

### Primitive conventions (apply to every animated component)

- `"use client";` + import `cn` from `@workspace/ui/lib/utils` (not `@/lib/utils`) inside `registry/` files.
- Double-quoted strings, formatted/linted via Ultracite (Oxlint + Oxfmt) with presets configured in `oxlint.config.mts` and `oxfmt.config.mts`.
- **`prefers-reduced-motion` must be respected** via `useReducedMotion()` from `motion/react` — either render a static/no-animation fallback branch, or skip the animated transition while still updating state. **Catalog exception:** Catalog showcase layouts in `/catalog` do not need `reduced-motion` branches — this preserves intended full artistic motion while avoiding code bloat and significantly reducing review complexity.
- Props are individually JSDoc-commented (`/** ... */`, with `@default` tags) — these comments are the source for docs `TypeTable` entries.
- Expose a forwarded `ref` prop (React 19 style: `ref` as a normal prop, not `forwardRef`) on the root element where practical.
- Full Tailwind CSS class override support via `cn(...)` so consumers can override sizes, borders, and colors seamlessly.
- When borrowing UX/animation ideas or a full implementation from an external library/site, set `meta.inspiration` (`type: "inspired"` or `"reimplemented"`) on the registry-item.json and add a `## Credits` section with `<ComponentCredits name="..." />` in the doc.
- **Multi-file components**: Keep source files flat as siblings next to `index.tsx` in `registry/.../<name>/`. Always put `index.tsx` at `files[0]` with root target (`components/sora-ui/.../<name>.tsx`), and helper submodules in a subfolder target (`components/sora-ui/.../<name>/<module>.ts`). Place shared types/constants in `defs.ts` or `core.ts` — submodules must never import back from `index.tsx`. `registry:build` automatically rewrites sibling imports to target paths. For 4+ files, optionally add `meta.fileGroups` in `registry-item.json` (auto-fallback: 1–3 files flat, 4+ files split into "Main component" & "Internal implementation").

### apps/www app structure

Route groups under `apps/www/app`:

- `(marketing)` — landing page (`/`), `/pricing`, `/legal/privacy`, `/legal/terms` with marketing layout (`Navbar` + `Footer` + `home.css`).
- `(doc)` — Fumadocs documentation layout hosting `/docs` (`[[...slug]]`), `/motion` (`[[...slug]]`), `/icons` (`[[...slug]]`), `/ui` (`[[...slug]]`), `/catalog` (`[slug]`), and `/blog` (`[slug]`).
- `(account)` — user account settings (`/settings/account`, `/settings/security`).
- `(llms)` — AI-readable LLM feeds (`/llms.txt`, `/llms-full.txt`, and per-section `.mdx` routes).
- Top-level routes — `auth` (`/auth/*`), `api` (`/api/*`), `examples` (`/examples/*`), `docs-og`, `blog-og`. Docs content is Fumadocs-powered MDX under `apps/www/content`.

### apps/xmcp

Exposes the Sora docs and component registry to AI tools/assistants over MCP, built with the `xmcp` framework. Tools live in `apps/xmcp/src/tools/` (`search-docs.ts`, `get-page.ts`, `list-sections.ts`, `get-component-info.ts`), prompts in `apps/xmcp/src/prompts/` (`install-component.ts`), and resources in `apps/xmcp/src/resources/` (`registry.ts`). Sources and caching for docs and registry data are under `apps/xmcp/src/docs/` and `apps/xmcp/src/registry/`.

## Code Standards (Ultracite)

Format/lint via Ultracite (Oxlint + Oxfmt): `bun x ultracite fix` (check: `bun x ultracite check`). Run it before committing when you changed source files. Skip it after `registry:build` — that script already formats its generated artifacts.

## Git & Workflow Rules (Strict Requirement)

- **NEVER automatically commit or push code**: AI agents MUST NOT run `git commit` or `git push` unless the user explicitly requests to commit or push in their prompt. Always leave changes in the working directory for user review and preview.

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bunx ultracite fix`
- **Check for issues**: `bunx ultracite check`
- **Diagnose setup**: `bunx ultracite doctor`

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Write functions as arrow functions assigned to `const`, and define them above where they're used
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- When a hook dependency rule fires, first check whether the effect is needed, and whether adding the dependency changes when it runs
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components

### Accessibility

- Use semantic HTML first; add ARIA only when no native element fits
- Provide meaningful alt text for images
- Use proper heading hierarchy
- Add labels for form inputs
- Make anything clickable a `<button>` or a link, so it works from the keyboard; don't add key handlers to a `<div>`
- Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns
- Avoid import cycles; move shared code into a module both sides import
- Don't leave TODO or FIXME comments in new code. For an existing one, do the task, delete it if it's done, or leave it; never reword it to get past the linter

### Security

- Add `rel="noopener noreferrer"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Avoid barrel files (index files that only re-export other modules) inside an app; a package's entry point is fine
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Oxlint + Oxfmt Can't Help

Oxlint + Oxfmt will catch most mechanical issues automatically. Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `bunx ultracite fix` before committing to ensure compliance.
