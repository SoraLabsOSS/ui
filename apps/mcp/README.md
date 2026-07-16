# Sora MCP Server

`sora-mcp` exposes the [Sora UI](../../README.md) docs and component registry to AI coding assistants over the [Model Context Protocol](https://modelcontextprotocol.io). It lets an LLM search documentation, browse the registry, and pull install-ready component/hook source directly into a conversation — no copy-pasting from the docs site required.

## Overview

- **Runtime:** Stateless MCP server built on [`mcp-framework`](https://www.mcp-framework.com), designed for serverless deployment (Vercel) via `handleRequest` — JSON batch mode per request, no SSE, no sessions.
- **Endpoint:** Served at the root path (`/`) on `mcp.soralabs.io.vn`.
- **Local dev:** Also runs as a plain Node HTTP server (`src/index.ts`) on `MCP_PORT` (default `1337`), useful for testing without a serverless environment.
- **Data sources:** Docs and registry content are fetched remotely at tool-call time (not bundled), backed by small in-memory caches (`docs-cache.ts`, `registry-cache.ts`) to avoid refetching on every call within a warm invocation.

## Tools

| Tool | Description |
|---|---|
| `search_docs` | Full-text search across Sora UI documentation. Returns ranked pages with excerpts; supports an optional `section` filter and result `limit` (max 25). |
| `list_sections` | Lists the documentation's top-level sections, for browsing when a search query isn't obvious. |
| `get_page` | Fetches the full content of a specific documentation page. |
| `list_components` | Lists installable registry items (components and hooks), optionally filtered by `type` (`registry:ui` \| `registry:hook`). |
| `get_component_info` | Returns the install command, dependencies, registry dependencies, and file targets for a named component/hook. |
| `get_component_code` | Returns the full source of a component/hook's files, ready to paste in without running the install CLI. |

All tools are registered in `src/create-server.ts` and return plain-text/Markdown responses (`useStringify = false`) rather than raw JSON, so they read naturally in a chat transcript.

## Architecture

```
apps/mcp/
  api/
    mcp.ts               — Vercel serverless entrypoint (calls handleMcpRequest)
    health.ts             — health check endpoint
  src/
    create-server.ts      — registers all tools, exports createMcpServer/getMcpServer
    handle-mcp-request.ts — stateless request handler shared by api/mcp.ts and index.ts
    index.ts                — standalone Node HTTP server for local dev
    docs/
      sora-docs-source.ts   — docs source adapter (@mcpframework/docs)
      docs-cache.ts          — in-memory cache for fetched doc pages
    registry/
      sora-registry-source.ts — registry source adapter (fetches registry.json / component files)
      registry-cache.ts        — in-memory cache for registry lookups
    tools/
      sora-*.ts — one file per MCP tool (see table above)
```

- `docs/sora-docs-source.ts` and `registry/sora-registry-source.ts` are the only places that know how to reach the live docs site / registry — tools call into these rather than fetching directly.
- Errors from either source (`DocSourceError`, `RegistryFetchError`) are caught in each tool and turned into a helpful text message (e.g. "not found, try `list_components`") instead of a raw stack trace.

## Running locally

```bash
cd apps/mcp
bun install
bun run dev        # compiles + runs src/index.ts on http://localhost:1337
```

## Deployment

Deployed to Vercel as a serverless function (`vercel-build` runs `tsc` twice — once for the main build, once against `tsconfig.vercel.json` for the API route). `getMcpServer()` caches the `MCPServer` instance across warm invocations to avoid re-registering tools on every request.
