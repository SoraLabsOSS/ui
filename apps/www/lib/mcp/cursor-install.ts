/** Sora UI docs MCP — remote HTTP server on Vercel. */
export const SORA_UI_MCP_SERVER_NAME = "sora-ui" as const;

export const SORA_UI_MCP_URL = "https://mcp.soralabs.io.vn/mcp" as const;

/** Transport config only — `name` query param becomes the `mcpServers` key. */
export const SORA_UI_MCP_TRANSPORT = {
  url: SORA_UI_MCP_URL,
} as const;

/**
 * Cursor MCP install deeplink.
 * `config` must be transport fields only (`url` or `command`/`args`), not wrapped in the server name.
 * @see https://cursor.com/docs/mcp/install-links
 */
export function getCursorMcpInstallLink(
  name: string,
  transport: Record<string, unknown>
): string {
  const encoded = Buffer.from(JSON.stringify(transport)).toString("base64");
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(name)}&config=${encoded}`;
}

export const SORA_UI_CURSOR_MCP_INSTALL_LINK = getCursorMcpInstallLink(
  SORA_UI_MCP_SERVER_NAME,
  SORA_UI_MCP_TRANSPORT
);
