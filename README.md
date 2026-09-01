<div align="center">

# Sora UI

A fully animated, open-source component distribution built with React, TypeScript, Tailwind CSS, and Motion.

[![GitHub stars](https://img.shields.io/github/stars/SoraLabsOSS/ui?style=flat-square)](https://github.com/SoraLabsOSS/ui/stargazers)
![BlockDex](https://img.shields.io/endpoint?url=https%3A%2F%2Ftoolproof.kynth.studio%2Fapi%2Fv1%2Fbadge%2Fblockdex%2Fsora-ui)

</div>

## Documentation

Visit [ui.soralabs.studio](https://ui.soralabs.studio/docs) to view the documentation.

## Local development

```bash
bun install
bun run dev:www    # docs site only → http://localhost:3000
# or
bun dev            # run all apps (Next.js docs + xmcp)
```

**No `.env` file is required** to browse docs, blog, the catalog, or use Ask AI locally. Copy [`apps/www/.env.example`](./apps/www/.env.example) only when you need optional features:

| Feature | Variables |
|---------|-----------|
| Sign-in & Bookmarks | `NEXT_PUBLIC_ENABLE_AUTH="true"`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, OAuth keys |
| Redis rate limits / cache | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Better Auth Sentinel | `BETTER_AUTH_API_KEY`, `NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL` |
| Custom Ask AI endpoint | `AI_SEARCH_CHAT_URL` (defaults to the public docs search instance) |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN` |

Production deployments for documentation require **zero environment variables**. Set `NEXT_PUBLIC_ENABLE_AUTH="true"`, `BETTER_AUTH_SECRET`, and `DATABASE_URL` only when deploying with full authentication enabled.

## MCP Server

Sora UI includes an official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server built with [xmcp](https://xmcp.dev) under [`apps/xmcp`](./apps/xmcp). It enables AI assistants (Cursor, Claude Desktop, Claude Code, etc.) to search documentation, browse sections, and install components:

```bash
# Run MCP server in development mode
cd apps/xmcp && bun run dev

# Build HTTP and STDIO bundles
cd apps/xmcp && bun run build
```

See the [MCP Documentation](https://ui.soralabs.studio/docs/mcp) or [`apps/xmcp/README.md`](./apps/xmcp/README.md) for full configuration details.

## Contributing

Visit our [contributing guide](./CONTRIBUTING.md) to learn how to contribute.

- **Scaffold a component:** `bun run create` (interactive wizard)
- **Adding a documented component:** see [apps/www/registry/README.md](./apps/www/registry/README.md)
- **Contributor CLI reference:** see [packages/www-cli/README.md](./packages/www-cli/README.md)

## Code of Conduct

This project follows a Code of Conduct to help create a welcoming community.
Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## License

Licensed under the [MIT license](./LICENSE.md).
