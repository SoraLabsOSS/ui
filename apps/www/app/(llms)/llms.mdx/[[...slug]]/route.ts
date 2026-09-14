import { notFound } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import { getLLMText } from "@/lib/docs/get-llm-text";
import { source } from "@/lib/docs/source";
import { iconsSource } from "@/lib/icons/source";
import { motionSource } from "@/lib/motion/source";

async function getLLMContentForSlug(slug?: string[]) {
  "use cache";
  staticContentCacheLife();
  let normalizedSlug = slug;
  if (normalizedSlug && normalizedSlug.at(-1) === "index") {
    const trimmed = normalizedSlug.slice(0, -1);
    normalizedSlug = trimmed.length > 0 ? trimmed : undefined;
  }
  let page = source.getPage(normalizedSlug);
  if (!page && normalizedSlug && normalizedSlug.length > 0) {
    if (normalizedSlug[0] === "motion") {
      page = motionSource.getPage(normalizedSlug.slice(1));
    } else if (normalizedSlug[0] === "primitives") {
      page = motionSource.getPage(normalizedSlug.slice(1));
    } else if (normalizedSlug[0] === "icons") {
      page = iconsSource.getPage(normalizedSlug.slice(1));
    } else {
      page = motionSource.getPage(normalizedSlug);
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
  return [
    ...source.generateParams(),
    ...motionSource
      .generateParams()
      .map((p) => ({ slug: ["motion", ...(p.slug ?? [])] })),
    ...iconsSource
      .generateParams()
      .map((p) => ({ slug: ["icons", ...(p.slug ?? [])] })),
  ];
}
