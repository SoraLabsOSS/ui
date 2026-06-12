import { createMcpServer, MCP_HTTP_ENDPOINT } from "./create-server.js";

const port = Number(process.env.MCP_PORT ?? 1337);

const server = createMcpServer({
  transport: {
    type: "http-stream",
    options: {
      port,
      endpoint: MCP_HTTP_ENDPOINT,
      cors: {
        allowOrigin: "*",
      },
    },
  },
});

server.start();
