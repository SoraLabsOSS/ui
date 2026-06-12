import { getMcpServer, MCP_HTTP_ENDPOINT } from "./create-server.js";
import {
  STATELESS_BLOCK_BODY,
  STATELESS_BLOCK_HEADERS,
} from "./stateless-block.js";

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
 * On Vercel, GET/DELETE never reach this handler (blocked in edge middleware).
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
