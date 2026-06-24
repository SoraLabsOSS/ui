import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import { getLLMText } from "@/lib/docs/get-llm-text";
import { source } from "@/lib/docs/source";
import { componentSource } from "@/lib/registry/component-source";

async function getLLMsContent() {
  "use cache";
  staticContentCacheLife();
  const pages = [...source.getPages(), ...componentSource.getPages()];
  const scanned = await Promise.all(pages.map(getLLMText));
  return await Promise.resolve(scanned.join("\n\n"));
}

export async function GET() {
  const content = await getLLMsContent();

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
