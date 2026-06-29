import { notFound } from "next/navigation";
import { blogOgPostsBySlug } from "@/lib/og/blog-og-posts";
import { getBlogOgImageBuffer } from "@/lib/og/get-blog-og-image";
import { getCachedBlogOgImageBuffer } from "@/lib/og/get-cached-blog-og-image";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const pageSlug = slug.slice(0, -1);
  const buffer =
    process.env.NODE_ENV === "development"
      ? await getBlogOgImageBuffer(pageSlug)
      : await getCachedBlogOgImageBuffer(pageSlug);

  if (!buffer) {
    notFound();
  }

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control":
        process.env.NODE_ENV === "development"
          ? "no-store"
          : "public, max-age=31536000, immutable",
    },
  });
}

export function generateStaticParams(): {
  slug: string[];
}[] {
  const postParams = Object.keys(blogOgPostsBySlug).map((postSlug) => ({
    slug: [postSlug, "image.png"],
  }));

  return [{ slug: ["image.png"] }, ...postParams];
}
