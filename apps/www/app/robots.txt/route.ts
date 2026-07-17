import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import { SITE_URL } from "@/lib/site";

const DISALLOWED_PATHS = [
  "/api/",
  "/auth/",
  "/settings/",
  "/bookmark",
  "/examples/",
  "/static.json",
];

async function getRobotsContent() {
  "use cache";
  staticContentCacheLife();

  const lines = [
    "User-Agent: *",
    "Allow: /",
    ...DISALLOWED_PATHS.map((path) => `Disallow: ${path}`),
    // Content Signals (https://contentsignals.org): machine-readable
    // crawler-use preferences, layered on top of Allow/Disallow. This site
    // ships llms.txt/llms-full.txt and an MCP server specifically so AI
    // agents can read it — search/ai-input/ai-train are all opted in.
    "Content-Signal: search=yes, ai-input=yes, ai-train=yes",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ];

  return await Promise.resolve(lines.join("\n"));
}

export async function GET() {
  const content = await getRobotsContent();

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
