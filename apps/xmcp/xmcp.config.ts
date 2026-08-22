import type { XmcpConfig } from "xmcp";

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
