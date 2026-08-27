import { source } from "@/lib/docs/source";
import { componentSource } from "@/lib/registry/component-source";
import {
  SITE_DESCRIPTION,
  SITE_OG_HERO_SUBLINE,
  SITE_OG_HERO_TITLE,
} from "@/lib/site";
import { uiSource } from "@/lib/ui/source";
import { getUiQualifiedTitle } from "@/lib/ui/ui-family";

export interface OgPageContent {
  description?: string;
  title: string;
}

const COMPONENTS_CATALOG: OgPageContent = {
  title: "Components",
  description:
    "Browse Sora UI components with live previews, installation commands, and API reference.",
};

const UI_CATALOG: OgPageContent = {
  title: "UI Components",
  description:
    "Base UI and Radix UI primitives infused with Sora Motion spring dynamics and Tailwind CSS.",
};

const SITE_DEFAULT: OgPageContent = {
  title: SITE_OG_HERO_TITLE,
  description: `${SITE_OG_HERO_SUBLINE}. ${SITE_DESCRIPTION}`,
};

/**
 * Resolve title/description for `/docs-og/[...slug]/image.png`.
 * Slug is the path segments before `image.png`.
 */
export function resolveOgPage(slug: string[]): OgPageContent | null {
  if (slug.length === 0) {
    return SITE_DEFAULT;
  }

  if (slug[0] === "ui") {
    if (slug.length === 1) {
      const page = uiSource.getPage([]);
      if (page) {
        return {
          title: page.data.title,
          description: page.data.description,
        };
      }
      return UI_CATALOG;
    }

    const page = uiSource.getPage(slug.slice(1));
    if (!page) {
      return null;
    }

    return {
      title: getUiQualifiedTitle(page.data.title, page.url),
      description: page.data.description,
    };
  }

  if (slug[0] === "components" || slug[0] === "catalog") {
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
