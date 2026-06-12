import { MCPServer, type MCPServerConfig } from "mcp-framework";
import SoraGetPageTool from "./tools/SoraGetPageTool.js";
import SoraListSectionsTool from "./tools/SoraListSectionsTool.js";
import SoraSearchDocsTool from "./tools/SoraSearchDocsTool.js";
import WeatherTool from "./tools/WeatherTool.js";

const SERVER_NAME = "sora-mcp";
const SERVER_VERSION = "0.0.1";

/** Public MCP path — root on `mcp.soralabs.io.vn`. */
export const MCP_HTTP_ENDPOINT = "/";

export function createMcpServer(config: Partial<MCPServerConfig> = {}) {
  const server = new MCPServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
    ...config,
  });

  server.addTool(WeatherTool);
  server.addTool(SoraSearchDocsTool);
  server.addTool(SoraGetPageTool);
  server.addTool(SoraListSectionsTool);

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
