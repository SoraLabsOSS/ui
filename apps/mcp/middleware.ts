import {
  STATELESS_BLOCK_BODY,
  STATELESS_BLOCK_HEADERS,
} from "./src/stateless-block.js";

const BLOCKED_METHODS = new Set(["GET", "HEAD", "DELETE"]);

export const config = {
  matcher: ["/", "/api/mcp"],
};

/** Block SSE polling at the edge — no serverless function invocation. */
export default function middleware(request: Request): Response | undefined {
  if (!BLOCKED_METHODS.has(request.method)) {
    return;
  }

  return new Response(STATELESS_BLOCK_BODY, {
    status: 405,
    headers: STATELESS_BLOCK_HEADERS,
  });
}
