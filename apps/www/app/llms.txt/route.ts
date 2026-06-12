import { buildLlmsIndex } from "@/lib/docs/llms-index";
import { source } from "@/lib/docs/source";
import { componentSource } from "@/lib/registry/component-source";

async function getLlmsIndexContent() {
  "use cache";
  return await Promise.resolve(
    buildLlmsIndex(source.getPages(), componentSource.getPages())
  );
}

export async function GET() {
  const content = await getLlmsIndexContent();

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
