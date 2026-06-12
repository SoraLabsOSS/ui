export const STATELESS_GET_BODY = {
  error: "Method Not Allowed",
  transport: "stateless",
  message:
    "POST-only MCP. Remote SSE polling is disabled. Use POST for JSON-RPC or run MCP via STDIO locally.",
} as const;

/** CDN-cacheable response for blocked polling methods (edge middleware). */
export const STATELESS_BLOCK_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Allow: "POST, OPTIONS",
  "Cache-Control": "public, max-age=31536000, immutable",
};

export const STATELESS_BLOCK_BODY = JSON.stringify(STATELESS_GET_BODY);
