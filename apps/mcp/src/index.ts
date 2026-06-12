import type { IncomingMessage, ServerResponse } from "node:http";
import { createServer } from "node:http";
import { getMcpServer, MCP_HTTP_ENDPOINT } from "./create-server.js";

const mcp = getMcpServer();
const port = Number(process.env.MCP_PORT ?? 1337);

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  if (
    req.method === "GET" ||
    req.method === "HEAD" ||
    req.method === "DELETE"
  ) {
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }

  if (chunks.length === 0) {
    return;
  }

  return Buffer.concat(chunks);
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const host = req.headers.host ?? `localhost:${port}`;
  const url = new URL(req.url ?? MCP_HTTP_ENDPOINT, `http://${host}`);
  const body = await readBody(req);

  return new Request(url, {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: body ? new Uint8Array(body) : undefined,
  });
}

async function writeWebResponse(
  webResponse: Response,
  res: ServerResponse
): Promise<void> {
  res.statusCode = webResponse.status;
  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (webResponse.body) {
    res.end(Buffer.from(await webResponse.arrayBuffer()));
    return;
  }

  res.end();
}

createServer(async (req, res) => {
  try {
    const response = await mcp.handleRequest(await toWebRequest(req));
    await writeWebResponse(response, res);
  } catch {
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}).listen(port, () => {
  console.log(
    `Sora MCP listening on http://localhost:${port}${MCP_HTTP_ENDPOINT}`
  );
});
