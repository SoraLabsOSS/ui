import { notFound } from "next/navigation";
import { createOgImageResponse } from "@/lib/og/create-og-image-response";
import { resolveOgPage } from "@/lib/og/resolve-og-page";

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

export function generateStaticParams(): { slug: string[] }[] {
  return [{ slug: ["image.png"] }];
}
