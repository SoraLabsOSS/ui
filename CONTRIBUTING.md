# Contributing to Sora UI

Thank you for contributing to **Sora UI** — an open-source, Motion-first React component distribution in the shadcn/ui registry style.

- **Source repo:** [github.com/SoraLabsOSS/ui](https://github.com/SoraLabsOSS/ui)
- **Bugs, questions, ideas:** [github.com/SoraLabsOSS/sora-ui-community](https://github.com/SoraLabsOSS/sora-ui-community) (not this repo’s issue tracker)
- **Site:** [ui.soralabs.io.vn](https://ui.soralabs.io.vn)

## Introduction

This is a **Turborepo** monorepo. We use **[Bun](https://bun.sh)** (`bun@1.3.5`, pinned in `packageManager`) for installs and scripts, and **Ultracite (Biome)** for lint/format.

Almost all component work happens in **`apps/www`** (Next.js docs site + registry).

## Repository structure

```text
apps/
  www/          Docs site + component registry (primary work surface)
  mcp/          MCP server — exposes docs/registry to AI assistants
packages/
  ui/                 @workspace/ui — shared utilities, globals.css, base hooks
  auth-ui/            @workspace/auth-ui — Better Auth UI
  db/                 @workspace/db — Drizzle schema/client
  typescript-config/  Shared tsconfig bases
```

### Registry (`apps/www/registry`)

```text
registry/
  primitives/{category}/{name}/   index.tsx + registry-item.json  ← main shipped items
  icons/{name}/                   Animated Lucide icons (@soralabs/icons-*)
  demo/primitives/{category}/{name}/   Optional manual demos (overrides auto Code tab)
  hooks/, lib/
```

**Primitive categories today:** `animate`, `buttons`, `disclosure`, `effects`, `radix`, `texts`.

There is **no** `registry/components/` tree yet — catalog “component pages” showcase existing primitives (see below).

### Content (`apps/www/content`)

Three separate trees — do not conflate them:

| Tree | Route | Purpose |
|------|-------|---------|
| `content/docs/` | `/docs` | Guides + flat primitive docs at `docs/primitives/<name>.mdx` |
| `content/docs/icons/` | `/docs/icons` | Icons get-started, animating icons, catalog |
| `content/components/` | `/components` | Catalog showcase pages (layout examples for a primitive) |
| `content/blog/` | `/blog` | Blog posts |

Primitive docs are **flat** (`content/docs/primitives/stagger-button.mdx`), not nested by category. Sidebar order lives in `content/docs/primitives/meta.json` (`---Section---` separators group items).

## Getting started

### 1. Fork and clone

Fork [SoraLabsOSS/ui](https://github.com/SoraLabsOSS/ui/fork), then:

```bash
git clone https://github.com/<YOUR_USERNAME>/ui.git
cd ui
git checkout -b my-branch
```

### 2. Install and run

From the repo root:

```bash
bun install
bun run dev:www    # docs site only → http://localhost:3000
# or
bun dev            # all apps (turbo)
```

**Environment variables are optional for local UI work.** You can browse docs, blog, the components catalog, and Ask AI without a `.env` file. Copy `apps/www/.env.example` → `apps/www/.env` only when you need auth, bookmarks, Redis, or a custom Ask AI endpoint. See the [Local development](./README.md#local-development) table in the root README for which vars map to which features.

Auth and bookmark API routes return errors when `DATABASE_URL` is unset; the rest of the site keeps working.

### 3. Verify before opening a PR

```bash
bun run check-types
bun run lint
cd apps/www && bun run registry:build   # after any registry/ or demoProps change
cd apps/www && bun run lint:links       # internal doc links under content/
```

There is no test runner — rely on `check-types`, `lint`, and `registry:build`.

**Git hooks (lefthook):** pre-commit runs Ultracite fix on staged JS/TS/JSON/CSS and `lint:links` on `apps/www/content/**`; pre-push runs `bun run build`.

**Windows:** do not use bare `npx biome` / `npx tsc` in this repo (unrelated decoy packages). Use `node_modules/.bin/biome.exe` and `node_modules/.bin/tsc.exe` instead.

## Adding or changing a primitive

Minimal flow (details in [apps/www/registry/README.md](apps/www/registry/README.md)):

1. Edit **`registry/primitives/<category>/<name>/index.tsx`** and **`registry-item.json`**.
2. Set **`meta.demoProps`** on `registry-item.json` for Tweakpane + auto-generated Code tab. Add **`registry/demo/primitives/...`** only when the example cannot be expressed as simple props (e.g. `ReactNode[]` children, multi-component layout).
3. Edit **`content/docs/primitives/<name>.mdx`** with:
   - `<ComponentPreview name="<name>" />` (or `name="demo-<name>"` if a manual demo exists)
   - `<ComponentInstallation name="<name>" />`
   - Props via `<TypeTable>` (JSDoc on the component is the source of truth)
   - `<ComponentCredits name="<name>" />` when `meta.inspiration` is set
4. Add **`"<name>"`** to **`content/docs/primitives/meta.json`** under the right `---Section---`.
5. Run **`bun run registry:build`** from `apps/www`.

`registry:build` only publishes items referenced from MDX under **`content/docs`** or **`content/components`** via `<ComponentPreview />` / `<ComponentInstallation />`. An orphaned registry folder with no MDX reference will not appear on the site.

Users install with:

```bash
npx shadcn@latest add @soralabs/<name>
```

Files land under `@/components/sora-ui/...` after install.

### Primitive conventions

- `"use client";` and import `cn` from **`@workspace/ui/lib/utils`** (not `@/lib/utils`) inside `registry/` files.
- Respect **`prefers-reduced-motion`** via `useReducedMotion()` from `motion/react` — static fallback or skip animation while still updating state.
- JSDoc every prop (`/** ... */`, `@default` where relevant) for docs `TypeTable` entries.
- Expose a **`ref`** on the root element where practical (React 19 style: `ref` as a normal prop).
- External inspiration: set **`meta.inspiration`** on `registry-item.json` and add **`## Credits`** with `<ComponentCredits name="..." />` in the doc.

## Catalog pages (`content/components/`)

Catalog MDX files are **not** registry items. They are full-layout showcases for an existing primitive (e.g. `sticky-scroll-cards`, `cursor-trail-reveal`).

- Add/edit **`content/components/<slug>.mdx`** and list the slug in **`content/components/meta.json`**.
- The showcased primitive still lives under **`registry/primitives/...`** with its own `registry-item.json`.
- Reference the primitive in catalog MDX with `<ComponentInstallation name="<registry-name>" />` (and preview components as needed).

## Icons

Animated icons live under **`registry/icons/`** (from [Reicon](https://reicon.dev/) / Lucide). Docs under **`content/docs/icons/`**.

When adding an icon:

1. Add **`registry/icons/<name>/index.tsx`** + **`registry-item.json`** (`registryDependencies`: `["icons-icon"]` for the wrapper).
2. Fill **`meta.keywords`** (and categories aligned with Lucide where applicable).
3. Run **`bun run registry:build`**.

Install path: `npx shadcn@latest add @soralabs/icons-<name>` (kebab-case, e.g. `icons-chevrons`). See [Get Started](/docs/icons/get-started) on the site.

Per-icon MDX pages are not required — the icons catalog is generated from the registry.

## Registry item (`registry-item.json`)

Required for every registry entry. Example for a primitive:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "stagger-button",
  "type": "registry:ui",
  "title": "Stagger Button",
  "description": "A button that staggers per character on hover.",
  "dependencies": ["class-variance-authority"],
  "registryDependencies": ["utils", "button"],
  "files": [
    {
      "path": "registry/primitives/buttons/stagger-button/index.tsx",
      "type": "registry:ui",
      "target": "components/sora-ui/buttons/stagger-button.tsx"
    }
  ],
  "meta": {
    "demoProps": {
      "StaggerButton": {
        "label": { "value": "Staggering Button" },
        "stagger": {
          "value": "char",
          "options": { "Char": "char", "Text": "text" }
        }
      }
    }
  }
}
```

Schema reference: [ui.shadcn.com/docs/registry/registry-item-json](https://ui.shadcn.com/docs/registry/registry-item-json).

### Inspiration metadata

```json
"meta": {
  "inspiration": {
    "type": "inspired",
    "label": "Example Library",
    "url": "https://example.com"
  }
}
```

Use `"reimplemented"` when the implementation was rewritten for Motion/React. Pair with `<ComponentCredits name="..." />` in the MDX doc.

## Demo, preview, and Tweakpane

| Docs UI | Source |
|---------|--------|
| **Preview** | `<ComponentPreview name="..." />` → primitive + `meta.demoProps` |
| **Tweakpane** | `meta.demoProps` on the primitive `registry-item.json` (top-level key = React export name) |
| **Code tab** | Auto-generated `demo-<name>` at build time; updates live with Tweakpane |
| **Install tab** | `<ComponentInstallation name="..." />` |

Run **`bun run registry:build`** after changing `demoProps` or any registry file.

### Manual demo (optional)

Only when `demoProps` cannot express the example:

```text
registry/demo/primitives/<category>/<name>/
  index.tsx              ← import from @/registry/... in the monorepo
  registry-item.json     ← registryDependencies: ["<name>"]
```

Use `<ComponentPreview name="demo-<name>" />` in MDX. A folder on disk **overrides** the auto-generated Code snippet.

### `demoProps` field types

**Number** — plain input: `{ "value": 10 }`  
**Number** — slider: `{ "value": 10, "min": 0, "max": 100, "step": 1 }`  
**Number** — select: `{ "value": 10, "options": { "Big": 30, "Small": 10 } }`

**String** — plain: `{ "value": "Hello" }`  
**String** — select: `{ "value": "small", "options": { "Big": "big", "Small": "small" } }`

**Boolean:** `{ "value": true }`

## Documentation

### Primitive doc example

File: **`content/docs/primitives/my-component.mdx`**

```mdx
---
title: My Component
description: Short description for SEO and search.
author:
  name: Your Name
  url: https://github.com/you
---

<ComponentPreview name="my-component" />

## Installation

<ComponentInstallation name="my-component" />

## Usage

Brief usage notes and one or more code blocks.

## Props

<TypeTable
  type={{
    myProp: {
      description: "What this prop does.",
      type: "string",
      default: '"default"',
    },
  }}
/>

## Credits

<ComponentCredits name="my-component" />
```

Omit **Credits** when there is no `meta.inspiration`.

Register the page in **`content/docs/primitives/meta.json`**:

```json
{
  "pages": [
    "---Effects---",
    "my-component"
  ]
}
```

## Pull requests

- Target **`main`** on [SoraLabsOSS/ui](https://github.com/SoraLabsOSS/ui).
- Keep PRs focused; run lint, typecheck, and `registry:build` when touching registry or content.
- For user-facing bugs and support threads, point people to the **[community repo](https://github.com/SoraLabsOSS/sora-ui-community)** — keep this repo’s issues for source/contributor workflow.

## Need help?

- **Usage / bugs / ideas:** [Community hub](https://github.com/SoraLabsOSS/sora-ui-community) — [new issue](https://github.com/SoraLabsOSS/sora-ui-community/issues/new) or [Discussions](https://github.com/SoraLabsOSS/sora-ui-community/discussions/1)
- **Registry mechanics:** [apps/www/registry/README.md](apps/www/registry/README.md)
- **Agent-oriented repo map:** [AGENTS.md](AGENTS.md)

Thank you for helping improve Sora UI.
