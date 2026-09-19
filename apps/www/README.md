<div align="center">

# Sora UI (`apps/www`)

**The AI-ready animated component registry & documentation site for React & Next.js.**

[![GitHub stars](https://img.shields.io/github/stars/SoraLabsOSS/ui?style=flat-square)](https://github.com/SoraLabsOSS/ui/stargazers)
![BlockDex](https://img.shields.io/endpoint?url=https%3A%2F%2Ftoolproof.kynth.studio%2Fapi%2Fv1%2Fbadge%2Fblockdex%2Fsora-ui)
[![MotionScore](https://api.motion.dev/score/badge?url=ui.soralabs.studio)](https://score.motion.dev/site/ui.soralabs.studio)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../../LICENSE.md)

</div>

`apps/www` is the primary work surface of the Sora UI repository. It hosts both the documentation site (powered by Next.js and Fumadocs) and the component distribution registry.

## Supported by

Sora UI is supported by the open-source ecosystem. Special thanks to:

<a href="https://mintlify.com" target="_blank" rel="noopener noreferrer">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.soralabs.studio/logos/partners/mintlify-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.soralabs.studio/logos/partners/mintlify-light.svg" />
    <img src="https://cdn.soralabs.studio/logos/partners/mintlify-light.svg" alt="Mintlify" height="24" />
  </picture>
</a>

## Sora UI Taxonomy

```text
Sora UI
├── Motion       (Animation building blocks: unstyled motion & effects at /motion)
├── Icons        (Animated Lucide icons at /icons)
├── Catalog      (Ready-to-use animated showcases & full layout pages at /catalog)
└── UI           (Base UI + Radix UI foundation infused with Sora Motion & Tailwind CSS at /ui)
```

## Highlights

- **Understood by Humans & AI**: UI components whose behavior, constraints, composition, and metadata are understandable by both humans and AI models via MCP (`apps/xmcp`).
- **Motion First**: Production-ready micro-interactions and animations built on Motion with first-class `prefers-reduced-motion` accessibility support.
- **Modern Foundation**: Built on React 19, Next.js 16 (App Router + Turbopack), Tailwind CSS v4, Base UI, and Radix UI. Full class override support via `cn(...)`.
- **On-Demand Registry**: Code-split dynamic registry chunks (`__registry__/sources/*.json`) ensuring ultra-fast page loads and minimal client bundles.

## Documentation

Explore the interactive component catalog, animated showcases, and documentation at [ui.soralabs.studio](https://ui.soralabs.studio).

## Local development

Run directly from within `apps/www`:

```bash
# Start development server on localhost:3000
bun dev

# Typecheck with TypeScript
bun run check-types

# Lint and check code formatting
bun run lint

# Validate internal documentation links
bun run lint:links

# Rebuild component registry & on-demand source chunks
bun run registry:build

# Run 4-stage registry integrity & sandbox installation tests
bun run test:registry
```

*(Or from the repository root: `bun run dev:www`, `bun run registry:build`, `bun run check-types`)*

## Environment variables

**No `.env` file is required** to browse docs, blog, or the catalog locally. Copy [`.env.example`](./.env.example) to `.env` only when you need optional features:

| Feature | Variables |
|---------|-----------|
| Sign-in & Bookmarks | `NEXT_PUBLIC_ENABLE_AUTH="true"`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, OAuth keys |
| Redis rate limits / cache | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Better Auth Sentinel | `BETTER_AUTH_API_KEY`, `NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL` |
| Ask AI (AI Search) | `AI_SEARCH_CHAT_URL` (Cloudflare AI Search chat endpoint; required for Ask AI, no public fallback) |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN` |

Production deployments for documentation require **zero environment variables** (set `NEXT_PUBLIC_ENABLE_AUTH="true"`, `BETTER_AUTH_SECRET`, `DATABASE_URL`, or `AI_SEARCH_CHAT_URL` only when enabling auth or Ask AI).

## The Registry System

Everything under `registry/` follows the shadcn/ui `registry-item.json` distribution format. For details on how components are built, scaffolded, and documented, see [registry/README.md](./registry/README.md).

## Contributing

Visit our [contributing guide](../../CONTRIBUTING.md) to learn how to contribute.

- **Scaffold a component:** `bun run create` (interactive wizard from repo root)
- **Adding a documented component:** see [apps/www/registry/README.md](./registry/README.md)
- **Component health verification:** `bun run doctor <name>`
- **Contributor CLI reference:** see [packages/www-cli/README.md](../../packages/www-cli/README.md)

## License

Licensed under the [MIT license](../../LICENSE.md).
