# Sora UI MCP Server (`apps/xmcp`)

The official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for **Sora UI**, built with the [xmcp](https://xmcp.dev) framework and zero legacy dependencies.

## Overview

This MCP server provides AI assistants (such as Claude Desktop, Cursor, Zed, Windsurf, and custom AI agents) with structured access to:
- **Documentation & Guides**: Search, browse sections, and read full MDX docs.
- **Component Registry**: Discover animated UI components, motion primitives, dependencies, and automated installation commands via `npx shadcn@latest add @soralabs/<name>`.

---

## Capabilities

### Tools (`src/tools/`)
1. **`search_docs`** (`src/tools/search-docs.ts`):
   - Searches documentation by keyword or phrase.
   - Supports filtering by section (`documentation`, `components`, `catalog`, `motion`, `ui`).
   - Uses remote Fumadocs/Orama search API with local `llms-full.txt` text fallback.
2. **`get_page`** (`src/tools/get-page.ts`):
   - Retrieves full markdown content of a documentation page by slug or URL.
   - Enforces an 8,000-token budget with automatic truncation notice.
3. **`list_sections`** (`src/tools/list-sections.ts`):
   - Outlines the complete documentation structure and page count from `llms.txt`.
4. **`get_component_info`** (`src/tools/get-component-info.ts`):
   - Lists installable components/hooks or provides detailed install instructions (`npx shadcn@latest add @soralabs/<name> --yes`), dependency trees, and optional raw source code.

### Prompts (`src/prompts/`)
- **`install-component`** (`src/prompts/install-component.ts`):
  - Structured prompt template for guiding an AI assistant through discovering, installing, and configuring a Sora component.

### Resources (`src/resources/`)
- **`sora-registry`** (`src/resources/registry.ts`):
  - Live JSON snapshot of all installable Sora UI registry items.

---

## Getting Started

### Development
```bash
bun run dev
```
Starts the MCP server with file watching and hot reloading.

### Build
```bash
bun run build
```
Compiles and bundles both **HTTP** (`dist/http.js`) and **STDIO** (`dist/stdio.js`) servers using `@xmcp-dev/compiler`.

### Run
- **HTTP Server**:
  ```bash
  bun run start
  # or
  node dist/http.js
  ```
- **STDIO Server** (for Claude Desktop / Cursor):
  ```bash
  node dist/stdio.js
  ```

---

## Configuration (`xmcp.config.ts`)

```typescript
import { type XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  http: {
    port: Number(process.env.PORT ?? process.env.MCP_PORT ?? 1337),
    endpoint: "/",
    cors: {
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "mcp-session-id"],
    },
  },
  stdio: true,
  paths: {
    tools: "./src/tools",
    prompts: "./src/prompts",
    resources: "./src/resources",
  },
  template: {
    name: "Sora UI MCP",
    description:
      "Official MCP server for Sora UI documentation, motion primitives, and component registry.",
    icons: [{ src: "./xmcp.svg" }],
  },
};

export default config;
```

---

## Client Integration Examples

### Claude Desktop (`claude_desktop_config.json`)

#### Remote HTTP Mode (via mcp-remote bridge)
```json
{
  "mcpServers": {
    "sora-ui": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.soralabs.studio/mcp"]
    }
  }
}
```

#### Local STDIO Mode (Built from source)
```json
{
  "mcpServers": {
    "sora-ui": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/sora/apps/xmcp/dist/stdio.js"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

#### Remote HTTP Mode
```json
{
  "mcpServers": {
    "sora-ui": {
      "url": "https://mcp.soralabs.studio/mcp"
    }
  }
}
```

#### Local STDIO Mode
```json
{
  "mcpServers": {
    "sora-ui": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/sora/apps/xmcp/dist/stdio.js"]
    }
  }
}
```
