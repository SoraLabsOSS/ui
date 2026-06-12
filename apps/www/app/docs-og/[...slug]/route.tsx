import { notFound } from "next/navigation";
import { source } from "@/lib/docs/source";
import { createOgImageResponse } from "@/lib/og/create-og-image-response";
import { resolveOgPage } from "@/lib/og/resolve-og-page";
import { getComponentSlugs } from "@/lib/registry/get-component-slugs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const pageSlug = slug.slice(0, -1);
  const content = resolveOgPage(pageSlug);

  if (!content) {
    notFound();
  }

  return createOgImageResponse(content);
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

  const componentParams = getComponentSlugs().map((componentSlug) => ({
    slug: ["components", componentSlug, "image.png"],
  }));

  return [
    { slug: ["image.png"] },
    { slug: ["components", "image.png"] },
    ...docParams,
    ...componentParams,
  ];
}
