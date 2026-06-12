import { source } from "@/lib/docs/source";
import { componentSource } from "@/lib/registry/component-source";
import { SITE_DESCRIPTION } from "@/lib/site";

export interface OgPageContent {
  description?: string;
  title: string;
}

const COMPONENTS_CATALOG: OgPageContent = {
  title: "Components",
  description:
    "Browse Sora UI components with live previews, installation commands, and API reference.",
};

const SITE_DEFAULT: OgPageContent = {
  title: "Sora UI",
  description: SITE_DESCRIPTION,
};

/**
 * Resolve title/description for `/docs-og/[...slug]/image.png`.
 * Slug is the path segments before `image.png`.
 */
export function resolveOgPage(slug: string[]): OgPageContent | null {
  if (slug.length === 0) {
    return SITE_DEFAULT;
  }

  if (slug[0] === "components") {
    if (slug.length === 1) {
      return COMPONENTS_CATALOG;
    }

    const page = componentSource.getPage(slug.slice(1));
    if (!page) {
      return null;
    }

    return {
      title: page.data.title,
      description: page.data.description,
    };
  }

  const page = source.getPage(slug);
  if (!page) {
    return null;
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
