import { getMcpServer, MCP_HTTP_ENDPOINT } from "../dist/create-server.js";

const server = getMcpServer();

/** Vercel serves this handler at `/api/mcp`; rewrite exposes it at `/`. */
function toMcpRequest(request: Request): Request {
  const url = new URL(request.url);

  if (url.pathname === "/api/mcp" || url.pathname.endsWith("/api/mcp")) {
    url.pathname = MCP_HTTP_ENDPOINT;
    return new Request(url, request);
  }

  return request;
}

function handle(request: Request): Promise<Response> {
  return server.handleRequest(toMcpRequest(request));
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
export const OPTIONS = handle;
