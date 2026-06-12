import {
  handleMcpPost,
  handleMcpPreflight,
} from "../dist/handle-mcp-request.js";

/** Only POST + OPTIONS invoke the serverless function. GET is blocked in vercel.json routes. */
export const POST = handleMcpPost;
export const OPTIONS = handleMcpPreflight;
