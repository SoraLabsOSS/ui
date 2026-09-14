import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import { buildLlmsIndex } from "@/lib/docs/llms-index";
import { source } from "@/lib/docs/source";
import { iconsSource } from "@/lib/icons/source";
import { motionSource } from "@/lib/motion/source";
import { componentSource } from "@/lib/registry/component-source";
import { uiSource } from "@/lib/ui/source";

async function getLlmsIndexContent() {
  "use cache";
  staticContentCacheLife();
  return await Promise.resolve(
    buildLlmsIndex(
      source.getPages(),
      componentSource.getPages(),
      uiSource.getPages(),
      motionSource.getPages(),
      iconsSource.getPages()
    )
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
