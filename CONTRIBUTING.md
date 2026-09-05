# Contributing to Sora UI

Thank you for contributing to **Sora UI** — an open-source, Motion-first React component distribution in the shadcn/ui registry style.

- **Source repo:** [github.com/SoraLabsOSS/ui](https://github.com/SoraLabsOSS/ui)
- **Bugs, questions, ideas:** [github.com/SoraLabsOSS/ui/issues](https://github.com/SoraLabsOSS/ui/issues)
- **Site:** [ui.soralabs.studio](https://ui.soralabs.studio)

## Introduction

This is a **Turborepo** monorepo. We use **[Bun](https://bun.sh)** (`bun@1.3.5`, pinned in `packageManager`) for installs and scripts, and **Ultracite (Biome)** for lint/format.

Almost all component work happens in **`apps/www`** (Next.js docs site + registry).

## Sora UI Taxonomy

Sora UI is organized into three distinct product tiers:

```text
Sora UI
├── Motion
│   └── Animation building blocks (unstyled Motion/GSAP primitives)
├── Catalog
│   └── Ready-to-use animated layout showcases & full example pages
└── UI
    └── Base UI + Radix UI foundation infused with Sora Motion & Tailwind CSS
```

| Tier | Registry Path | Docs Route | Purpose |
|------|---------------|------------|---------|
| **Motion** | `registry/primitives/{category}/{name}/` | `/docs/motion/<name>` (alias `/motion/<name>`) | Unstyled animation primitives and micro-interactions (e.g. `border-trail`, `text-effect`, `highlight`, `auto-height`). |
| **Catalog** | `content/catalog/<slug>.mdx` (showcased) | `/catalog/<slug>` (alias `/components/<slug>`) | Pre-styled animated components, cards, and full layout showcases (e.g. `sticky-scroll-cards`, `cursor-trail-reveal`). |
| **UI** | `registry/ui/base/{name}/`, `registry/ui/radix/{name}/` | `/ui/<name>` | Accessible form & application controls combining Base UI / Radix UI with Motion spring physics and full Tailwind CSS class overrides (e.g. `base-button`, `radix-dialog`, `base-accordion`, `base-checkbox`). |

## Repository structure

```text
apps/
  www/          Docs site + component registry (primary work surface)
  xmcp/         MCP server (built with xmcp) — exposes docs/registry to AI assistants
packages/
  ui/                 @workspace/ui — shared utilities, globals.css, base hooks
  auth-ui/            @workspace/auth-ui — Better Auth UI
  db/                 @workspace/db — Drizzle schema/client
  typescript-config/  Shared tsconfig bases
  www-cli/            @workspace/www-cli — internal scaffolding CLI for contributors (`bun run create`)
```

### Registry (`apps/www/registry`)

```text
registry/
  ui/
    base/{name}/                  Base UI + Motion components (UI tier)
    radix/{name}/                 Radix UI + Motion components (UI tier)
  primitives/
    {animate|buttons|disclosure|effects|texts}/{name}/  Motion primitives tier
  icons/{name}/                   Animated Lucide icons (@soralabs/icons-*)
  demo/
    ui/{base|radix}/{name}/       Manual demos for UI tier
    primitives/{category}/{name}/ Manual demos for Motion tier
  hooks/, lib/
```

### Content trees (`apps/www/content`)

Four separate trees — do not conflate them:

| Tree | Route | Purpose |
|------|-------|---------|
| `content/docs/` | `/docs` | Guides + flat motion primitive docs at `docs/motion/<name>.mdx` (aliased to `/motion/<name>`) |
| `content/ui/` | `/ui` | Base UI / Radix UI + Motion app components (`content/ui/{base\|radix}/<name>.mdx`) |
| `content/catalog/` | `/catalog` | Ready-to-use catalog showcase pages (aliased from `/components`) |
| `content/docs/icons/` | `/docs/icons` | Animated icons guide and catalog |
| `content/blog/` | `/blog` | Blog posts |

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

**Environment variables are optional for local UI work.** You can browse docs, blog, the catalog, and Ask AI without a `.env` file. Copy `apps/www/.env.example` → `apps/www/.env` only when you need optional features (auth, bookmarks, Redis, Sentry).

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

## Fast track for new contributors (Recommended)

Instead of creating 4–5 files by hand, you can use our built-in interactive contributor CLI (`packages/www-cli`):

```bash
# 1. Interactive wizard (walks you through tier, category/framework, and component name)
bun run create

# 2. Or scaffold directly via command:
bun run create:ui <name> --framework=base        # Base UI component
bun run create:ui <name> --framework=radix       # Radix UI component
bun run create:primitive <name> --category=texts # Motion primitive (texts|buttons|disclosure|effects|animate)
```

The CLI automatically scaffolds the component implementation, `registry-item.json`, demo showcase, MDX documentation page, and registers the entry in `meta.json`.

After scaffolding, start the dev server (`bun run dev:www`), implement your component in `registry/...`, and preview it live on `http://localhost:3000`.

## Adding or changing a component (Manual reference)

### Flow 1: Adding a UI component (`/ui` — Base UI / Radix UI + Motion)

**Shortcut (scaffold):** from the repo root, run `bun run create` (interactive wizard) or `bun run create:ui <name> --framework=<base|radix> --yes` to generate the registry folder, manual demo, MDX page, and `meta.json` entry. Use `--dry-run` to preview paths without writing, `--no-input` in CI (same requirements as `--yes`), and `--skip-demo` to omit the demo folder. Verify with `bun run test:www-cli` (or `bun run test:www-cli:slow` for a full `registry:build` integration check). See `packages/www-cli`.

1. Write/edit **`registry/ui/base/<name>/index.tsx`** (or `registry/ui/radix/<name>/index.tsx`) and **`registry-item.json`**.
2. Add manual demo under **`registry/demo/ui/base/<name>/index.tsx`** (or `radix`) to demonstrate diverse usage patterns (forms, descriptions, cards, custom class overrides).
3. Create/edit **`content/ui/<framework>/<name>.mdx`** with `<ComponentPreview name="demo-<name>" />` (or `demo-radix-<name>` for Radix), `<ComponentInstallation name="<framework>-<name>" />`, `<TypeTable>`, and `<ComponentCredits />`.
4. Register `"<framework>/<name>"` in **`content/ui/meta.json`** under the appropriate section.
5. Run **`bun run registry:build`**.

### Flow 2: Adding a Motion Primitive (`/docs/motion` — Animation building blocks)

**Shortcut (scaffold):** from the repo root, run `bun run create` (interactive wizard) or `bun run create:primitive <name> --category=<texts|buttons|disclosure|effects|animate> --yes` to generate the registry folder, MDX page, and `meta.json` entry, then run `registry:build`. Use `--dry-run` to preview paths without writing, or `--no-input` in CI (same requirements as `--yes`). Verify with `bun run test:www-cli`. See `packages/www-cli`.

1. Edit **`registry/primitives/<category>/<name>/index.tsx`** and **`registry-item.json`**.
2. Set **`meta.demoProps`** on `registry-item.json` for Tweakpane controls and auto Code tab snippet (or add manual demo in `registry/demo/primitives/...` for multi-component layouts).
3. Edit **`content/docs/motion/<name>.mdx`** with `<ComponentPreview />`, `<ComponentInstallation />`, `<TypeTable>`, and `<ComponentCredits />`.
4. Add `"<name>"` to **`content/docs/motion/meta.json`** under the right `---Section---`.
5. Run **`bun run registry:build`**.

### Flow 3: Adding a Catalog Page (`/catalog` — Ready-to-use layout showcases)

1. Catalog MDX files are layout showcases for existing primitives. Add/edit **`content/catalog/<slug>.mdx`** and list the slug in **`content/catalog/meta.json`**.
2. Reference the underlying primitive with `<ComponentInstallation name="<registry-name>" />`.

### Component conventions

- `"use client";` and import `cn` from **`@workspace/ui/lib/utils`** (not `@/lib/utils`) inside `registry/` files.
- Respect **`prefers-reduced-motion`** via `useReducedMotion()` from `motion/react` — render static fallback or skip animation while preserving state updates.
- JSDoc every prop (`/** ... */`, `@default` where relevant) for docs `TypeTable` entries.
- Expose a **`ref`** on the root element where practical (React 19 style: `ref` as a normal prop).
- Full Tailwind CSS class override support via `cn(...)` so consumers can customize borders, sizes, and colors just like shadcn/ui.
- External inspiration: set **`meta.inspiration`** on `registry-item.json` and add **`## Credits`** with `<ComponentCredits name="..." />` in the doc.

## Registry item (`registry-item.json`)

Required for every registry entry. Example:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "checkbox",
  "type": "registry:ui",
  "title": "Checkbox",
  "description": "An accessible, stylable checkbox built on Base UI with a Motion-friendly animated indicator.",
  "dependencies": ["@base-ui/react", "motion"],
  "registryDependencies": ["utils"],
  "files": [
    {
      "path": "registry/ui/base/checkbox/index.tsx",
      "type": "registry:ui",
      "target": "components/sora-ui/base/checkbox.tsx"
    }
  ],
  "meta": {
    "demoProps": {
      "Checkbox": {
        "label": { "value": "Enable notifications" },
        "defaultChecked": { "value": true }
      }
    },
    "inspiration": {
      "type": "reimplemented",
      "label": "Base UI: Checkbox (Motion Examples)",
      "url": "https://examples.motion.dev/react/base-checkbox",
      "stack": "Base UI and Motion"
    }
  }
}
```

Schema reference: [ui.shadcn.com/docs/registry/registry-item-json](https://ui.shadcn.com/docs/registry/registry-item-json).

## Pull requests

- Target **`main`** on [SoraLabsOSS/ui](https://github.com/SoraLabsOSS/ui).
- Keep PRs focused; run lint, typecheck, and `registry:build` when touching registry or content.
- For bugs, issues, and feature requests, please use the **[GitHub Issues tracker](https://github.com/SoraLabsOSS/ui/issues)** in this repository.

## Need help?

- **Usage / bugs / ideas:** [GitHub Issues](https://github.com/SoraLabsOSS/ui/issues)
- **Registry mechanics:** [apps/www/registry/README.md](apps/www/registry/README.md)
- **Agent-oriented repo map:** [AGENTS.md](AGENTS.md)

Thank you for helping improve Sora UI.