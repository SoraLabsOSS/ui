import { notFound } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import { getLLMText } from "@/lib/docs/get-llm-text";
import { componentSource } from "@/lib/registry/component-source";
import { getComponentSlugs } from "@/lib/registry/get-component-slugs";

async function getLLMContentForSlug(slug?: string[]) {
  "use cache";
  staticContentCacheLife();
  let normalizedSlug = slug;
  if (normalizedSlug && normalizedSlug.at(-1) === "index") {
    const trimmed = normalizedSlug.slice(0, -1);
    normalizedSlug = trimmed.length > 0 ? trimmed : undefined;
  }
  const page = componentSource.getPage(normalizedSlug);
  if (!page) {
    return null;
  }
  return await getLLMText(page);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  const content = await getLLMContentForSlug(slug);
  if (!content) {
    notFound();
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}

export function generateStaticParams() {
  return getComponentSlugs().map((slug) => ({
    slug: slug.split("/"),
  }));
}
