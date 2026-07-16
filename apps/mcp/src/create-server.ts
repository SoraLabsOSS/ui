import { MCPServer } from "mcp-framework";
import SoraGetComponentCodeTool from "./tools/sora-get-component-code-tool.js";
import SoraGetComponentInfoTool from "./tools/sora-get-component-info-tool.js";
import SoraGetPageTool from "./tools/sora-get-page-tool.js";
import SoraListComponentsTool from "./tools/sora-list-components-tool.js";
import SoraListSectionsTool from "./tools/sora-list-sections-tool.js";
import SoraSearchDocsTool from "./tools/sora-search-docs-tool.js";

const SERVER_NAME = "sora-mcp";
const SERVER_VERSION = "0.0.1";

/** Public MCP path — root on `mcp.soralabs.io.vn`. */
export const MCP_HTTP_ENDPOINT = "/";

/**
 * Stateless MCP server for serverless (`handleRequest`) deployments.
 * Framework uses JSON batch mode per request — no SSE, no sessions.
 * Remote docs are fetched only inside tool handlers (search/get/list).
 * @see https://www.mcp-framework.com/docs/transports/serverless
 */
export function createMcpServer() {
  const server = new MCPServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  server.addTool(SoraSearchDocsTool);
  server.addTool(SoraGetPageTool);
  server.addTool(SoraListSectionsTool);
  server.addTool(SoraListComponentsTool);
  server.addTool(SoraGetComponentInfoTool);
  server.addTool(SoraGetComponentCodeTool);

  return server;
}

let cachedServer: MCPServer | null = null;

/** Reused across warm serverless invocations (Vercel, Lambda). */
export function getMcpServer() {
  if (!cachedServer) {
    cachedServer = createMcpServer();
  }

  return cachedServer;
}
