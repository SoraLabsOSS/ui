/** Sora UI docs MCP — local STDIO server via npx (`@soralabs/mcp`). */
export const SORA_UI_MCP_SERVER_NAME = "sora-ui" as const;

export const SORA_UI_MCP_PACKAGE = "@soralabs/mcp" as const;

export const SORA_UI_MCP_URL = "https://mcp.soralabs.studio/mcp" as const;

/** Transport config only — `name` query param becomes the `mcpServers` key. */
export const SORA_UI_MCP_TRANSPORT = {
  command: "npx",
  args: ["-y", SORA_UI_MCP_PACKAGE],
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
