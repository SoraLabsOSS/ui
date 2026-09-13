import { notFound } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import { getLLMText } from "@/lib/docs/get-llm-text";
import { uiSource } from "@/lib/ui/source";

async function getLLMContentForSlug(slug?: string[]) {
  "use cache";
  staticContentCacheLife();
  let normalizedSlug = slug;
  if (normalizedSlug && normalizedSlug.at(-1) === "index") {
    const trimmed = normalizedSlug.slice(0, -1);
    normalizedSlug = trimmed.length > 0 ? trimmed : undefined;
  }
  let page = uiSource.getPage(normalizedSlug);
  if (!page && normalizedSlug && normalizedSlug.length === 1) {
    page =
      uiSource.getPage(["base", normalizedSlug[0]]) ??
      uiSource.getPage(["radix", normalizedSlug[0]]);
  }
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
  return uiSource.generateParams();
}
