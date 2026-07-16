import {
  BLOG_INDEX_DESCRIPTION,
  BLOG_INDEX_TITLE,
  getPostBySlug,
} from "@/lib/blog";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export interface OgPageContent {
  description?: string;
  title: string;
}

const SITE_DEFAULT: OgPageContent = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

/** Resolve title/description for `/og/[...slug]/image.png`. */
export async function resolveOgPage(
  slug: string[]
): Promise<OgPageContent | null> {
  if (slug.length === 0) {
    return SITE_DEFAULT;
  }

  if (slug[0] === "blog") {
    if (!slug[1]) {
      return { title: BLOG_INDEX_TITLE, description: BLOG_INDEX_DESCRIPTION };
    }

    const post = await getPostBySlug(slug[1]);
    if (!post) {
      return null;
    }
    return {
      title: post.metadata.title,
      description: post.metadata.description,
    };
  }

  return null;
}
