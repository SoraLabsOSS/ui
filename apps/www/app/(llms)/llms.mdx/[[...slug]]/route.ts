import { notFound } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import { getLLMText } from "@/lib/docs/get-llm-text";
import { source } from "@/lib/docs/source";

async function getLLMContentForSlug(slug?: string[]) {
  "use cache";
  staticContentCacheLife();
  let page = source.getPage(slug);
  if (!page && slug && slug.length > 0) {
    if (slug[0] === "primitives") {
      page = source.getPage(["motion", ...slug.slice(1)]);
    } else if (slug[0] !== "motion") {
      page = source.getPage(["motion", ...slug]);
    }
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
  return source.generateParams();
}
