import { notFound } from "next/navigation";
import { source } from "@/lib/docs/source";
import { getCachedOgImageBuffer } from "@/lib/og/get-cached-og-image";
import { getComponentSlugs } from "@/lib/registry/get-component-slugs";
import { uiSource } from "@/lib/ui/source";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const pageSlug = slug.slice(0, -1);
  const buffer = await getCachedOgImageBuffer(pageSlug);

  if (!buffer) {
    notFound();
  }

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export function generateStaticParams(): {
  slug: string[];
}[] {
  const docParams = source
    .generateParams()
    .filter((page) => source.getPage(page.slug) !== null)
    .map((page) => ({
      slug: [...page.slug, "image.png"],
    }));

  const uiParams = uiSource
    .generateParams()
    .filter((page) => page.slug && page.slug.length > 0)
    .map((page) => ({
      slug: ["ui", ...page.slug, "image.png"],
    }));

  const catalogParams = getComponentSlugs().map((componentSlug) => ({
    slug: ["catalog", componentSlug, "image.png"],
  }));

  const componentParams = getComponentSlugs().map((componentSlug) => ({
    slug: ["components", componentSlug, "image.png"],
  }));

  return [
    { slug: ["image.png"] },
    { slug: ["ui", "image.png"] },
    { slug: ["catalog", "image.png"] },
    { slug: ["components", "image.png"] },
    ...docParams,
    ...uiParams,
    ...catalogParams,
    ...componentParams,
  ];
}
