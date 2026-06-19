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
export function resolveOgPage(slug: string[]): OgPageContent | null {
  if (slug.length === 0) {
    return SITE_DEFAULT;
  }

  return null;
}
