<div align="center">

# Sora UI

**The AI-ready animated component registry & motion system for React & Next.js.**

[![GitHub stars](https://img.shields.io/github/stars/SoraLabsOSS/ui?style=flat-square)](https://github.com/SoraLabsOSS/ui/stargazers)
![BlockDex](https://img.shields.io/endpoint?url=https%3A%2F%2Ftoolproof.kynth.studio%2Fapi%2Fv1%2Fbadge%2Fblockdex%2Fsora-ui)
[![MotionScore](https://api.motion.dev/score/badge?url=ui.soralabs.studio)](https://score.motion.dev/site/ui.soralabs.studio)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE.md)

</div>

## Architecture

```text
Sora UI
├── Motion       (Animation building blocks: unstyled motion & effects at /motion)
├── Icons        (Animated Lucide icons at /icons)
├── Catalog      (Ready-to-use animated showcases & full layout pages at /catalog)
└── UI           (Base UI + Radix UI foundation infused with Sora Motion & Tailwind CSS at /ui)
```

## Highlights

- **AI-Native & MCP-Ready**: Includes an official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server (`apps/xmcp`) with rich metadata (intent, accessibility constraints, motion physics, and composition rules) for AI coding agents (Cursor, Claude, v0).
- **Motion First**: Production-ready micro-interactions and animations built on Motion with first-class `prefers-reduced-motion` accessibility support.
- **Modern Foundation**: Built on React 19, Tailwind CSS v4, Base UI, and Radix UI. Zero-overhead styling with full class override support via `cn(...)`.
- **High-Performance Monorepo**: Powered by Bun 1.3, Turborepo, and Biome/Ultracite for lightning-fast builds, linting, and component scaffolding.

## Documentation

Explore the interactive component catalog, animated showcases, and documentation at [ui.soralabs.studio](https://ui.soralabs.studio).

## Local development

```bash
bun install
bun run dev:www    # docs site only → http://localhost:3000
# or
bun dev            # run all apps (Next.js docs + xmcp)
```

**No `.env` file is required** to browse docs, blog, or the catalog locally. Copy `[apps/www/.env.example](./apps/www/.env.example)` only when you need optional features:

| Feature | Variables |
|---------|-----------|
| Sign-in & Bookmarks | `NEXT_PUBLIC_ENABLE_AUTH="true"`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, OAuth keys |
| Redis rate limits / cache | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Better Auth Sentinel | `BETTER_AUTH_API_KEY`, `NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL` |
| Ask AI (AI Search) | `AI_SEARCH_CHAT_URL` (Cloudflare AI Search chat endpoint; required for Ask AI, no public fallback) |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN` |

Production deployments for documentation require **zero environment variables** (set `NEXT_PUBLIC_ENABLE_AUTH="true"`, `BETTER_AUTH_SECRET`, `DATABASE_URL`, or `AI_SEARCH_CHAT_URL` only when enabling auth or Ask AI).

## MCP Server

Sora UI includes an official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server built with [xmcp](https://xmcp.dev) under `[apps/xmcp](./apps/xmcp)`. It enables AI assistants (Cursor, Claude Desktop, Claude Code, etc.) to search documentation, browse sections, and install components:

The UI registry also publishes agent-native metadata for active Base UI and Radix UI components: intent, accessibility constraints, motion behavior, and composition rules. MCP exposes this context through component information and provides composition validation; it is a foundation for agent-assisted UI construction, not yet an end-to-end planner or code generator.

```bash
# Run MCP server in development mode
cd apps/xmcp && bun run dev

# Build HTTP and STDIO bundles
cd apps/xmcp && bun run build
```

See the [MCP Documentation](https://ui.soralabs.studio/docs/mcp) or `[apps/xmcp/README.md](./apps/xmcp/README.md)` for full configuration details.

## Contributing

Visit our [contributing guide](./CONTRIBUTING.md) to learn how to contribute.

- **Scaffold a component:** `bun run create` (interactive wizard)
- **Adding a documented component:** see [apps/www/registry/README.md](./apps/www/registry/README.md)
- **Component health verification:** `bun run doctor <name>`
- **Contributor CLI reference:** see [packages/www-cli/README.md](./packages/www-cli/README.md)

## Code of Conduct

This project follows a Code of Conduct to help create a welcoming community.
Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## Credits & Attribution

Sora UI is a fork of [Animate UI](https://github.com/animate-ui/animate-ui) by [Skyleen](https://skyleen.dev) ([@imskyleen](https://x.com/imskyleen)). The architecture, registry system, component APIs, and motion primitives have been substantially redesigned. Some internal patterns and abstractions remain influenced by the original codebase.

Historical upstream material is attributed and licensed according to its original terms. See [`LICENSE.md`](./LICENSE.md) for the full legal text.

## License

Licensed under the [MIT license](./LICENSE.md).
