import { getMcpServer, MCP_HTTP_ENDPOINT } from "./create-server.js";

export const STATELESS_GET_BODY = {
  error: "Method Not Allowed",
  transport: "stateless",
  message:
    "POST-only MCP. Remote SSE polling is disabled. Use POST for JSON-RPC or run MCP via STDIO locally.",
} as const;

/** Cached at CDN when returned from Vercel edge routes (see vercel.json). */
export const STATELESS_BLOCK_HEADERS = {
  "Content-Type": "application/json",
  Allow: "POST, OPTIONS",
  "Cache-Control": "public, max-age=31536000, immutable",
} as const;

export const STATELESS_BLOCK_BODY = JSON.stringify(STATELESS_GET_BODY);

/** Vercel serves `/api/mcp`; rewrites expose it at `/`. */
export function normalizeMcpPath(request: Request): Request {
  const url = new URL(request.url);

  if (url.pathname === "/api/mcp" || url.pathname.endsWith("/api/mcp")) {
    url.pathname = MCP_HTTP_ENDPOINT;
    return new Request(url, request);
  }

  return request;
}

function handleStatelessMcp(request: Request): Promise<Response> {
  return getMcpServer().handleRequest(normalizeMcpPath(request));
}

/** POST — initialize, tools/list, tools/call (only path that runs MCP + fetches docs). */
export function handleMcpPost(request: Request): Promise<Response> {
  return handleStatelessMcp(request);
}

/** CORS preflight for MCP clients. */
export function handleMcpPreflight(request: Request): Promise<Response> {
  return handleStatelessMcp(request);
}

/**
 * Local dev: reject SSE polling methods without booting MCP.
 * On Vercel, GET/DELETE never reach this handler (blocked in vercel.json routes).
 */
export function rejectPollingMethods(): Response {
  return new Response(STATELESS_BLOCK_BODY, {
    status: 405,
    headers: STATELESS_BLOCK_HEADERS,
  });
}

export function handleMcpRequest(request: Request): Promise<Response> {
  if (
    request.method === "GET" ||
    request.method === "HEAD" ||
    request.method === "DELETE"
  ) {
    return Promise.resolve(rejectPollingMethods());
  }

  return handleStatelessMcp(request);
}
