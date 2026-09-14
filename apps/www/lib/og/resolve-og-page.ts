import { source } from "@/lib/docs/source";
import { iconsSource } from "@/lib/icons/source";
import { motionSource } from "@/lib/motion/source";
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

const MOTION_CATALOG: OgPageContent = {
  title: "Motion",
  description:
    "30+ animated, unstyled building blocks for React — text effects, buttons, interactions, and more. Built with Tailwind CSS and Motion.",
};

const ICONS_CATALOG: OgPageContent = {
  title: "Icons",
  description:
    "A collection of animated icons for React, built with Motion and Tailwind CSS.",
};

const SITE_DEFAULT: OgPageContent = {
  title: SITE_OG_HERO_TITLE,
  description: `${SITE_OG_HERO_SUBLINE}. ${SITE_DESCRIPTION}`,
};

function resolveMotionOgPage(slug: string[]): OgPageContent | null {
  if (slug.length === 1) {
    const page = motionSource.getPage([]);
    return page
      ? { title: page.data.title, description: page.data.description }
      : MOTION_CATALOG;
  }

  const page = motionSource.getPage(slug.slice(1));
  if (!page) {
    return null;
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

function resolveIconsOgPage(slug: string[]): OgPageContent | null {
  if (slug.length === 1) {
    const page = iconsSource.getPage([]);
    return page
      ? { title: page.data.title, description: page.data.description }
      : ICONS_CATALOG;
  }

  const page = iconsSource.getPage(slug.slice(1));
  if (!page) {
    return ICONS_CATALOG;
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

function resolveUiOgPage(slug: string[]): OgPageContent | null {
  if (slug.length === 1) {
    const page = uiSource.getPage([]);
    return page
      ? { title: page.data.title, description: page.data.description }
      : UI_CATALOG;
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

function resolveCatalogOgPage(slug: string[]): OgPageContent | null {
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

function resolveLegacyOgPage(slug: string[]): OgPageContent | null {
  if (slug[0] === "docs" && slug[1] === "motion") {
    const page = motionSource.getPage(slug.slice(2));
    return page
      ? { title: page.data.title, description: page.data.description }
      : MOTION_CATALOG;
  }

  if (slug[0] === "docs" && slug[1] === "icons") {
    const page = iconsSource.getPage(slug.slice(2));
    return page
      ? { title: page.data.title, description: page.data.description }
      : ICONS_CATALOG;
  }

  if (slug[0] === "docs" && slug.length > 1) {
    const page = source.getPage(slug.slice(1));
    if (page) {
      return {
        title: page.data.title,
        description: page.data.description,
      };
    }
  }

  if (slug[0] === "primitives") {
    const page = motionSource.getPage(slug.slice(1));
    return page
      ? { title: page.data.title, description: page.data.description }
      : MOTION_CATALOG;
  }

  return null;
}

/**
 * Resolve title/description for `/docs-og/[...slug]/image.png`.
 * Slug is the path segments before `image.png`.
 */
export function resolveOgPage(slug: string[]): OgPageContent | null {
  if (slug.length === 0) {
    return SITE_DEFAULT;
  }

  if (slug.length === 1 && slug[0] === "index") {
    const indexPage = source.getPage([]);
    if (indexPage) {
      return {
        title: indexPage.data.title,
        description: indexPage.data.description,
      };
    }
  }

  const root = slug[0];
  if (root === "motion") {
    return resolveMotionOgPage(slug);
  }
  if (root === "icons") {
    return resolveIconsOgPage(slug);
  }
  if (root === "ui") {
    return resolveUiOgPage(slug);
  }
  if (root === "components" || root === "catalog") {
    return resolveCatalogOgPage(slug);
  }

  const legacy = resolveLegacyOgPage(slug);
  if (legacy) {
    return legacy;
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
