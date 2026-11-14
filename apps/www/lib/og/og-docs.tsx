import { ImageResponse } from "next/og";

import { staticContentCacheLife } from "@/lib/cache-life";
import { source } from "@/lib/docs/source";
import { iconsSource } from "@/lib/icons/source";
import { motionSource } from "@/lib/motion/source";
import type { OgPageContent as OgPageData } from "@/lib/og/og-shared";
import {
  getOgSfProDisplayFontData,
  OG_FONT_FAMILY,
  OgImageFrame,
} from "@/lib/og/og-shared";
import { componentSource } from "@/lib/registry/component-source";
import {
  SITE_DESCRIPTION,
  SITE_OG_HERO_SUBLINE,
  SITE_OG_HERO_TITLE,
} from "@/lib/site";
import { uiSource } from "@/lib/ui/source";
import { getUiQualifiedTitle } from "@/lib/ui/ui-family";

export type { OgPageContent } from "@/lib/og/og-shared";

const BLOCKS_INDEX: OgPageData = {
  title: "Blocks",
  description:
    "Browse Sora UI blocks with live previews, installation commands, and API reference.",
};

const UI_INDEX: OgPageData = {
  title: "UI Components",
  description:
    "Base UI and Radix UI primitives infused with Sora Motion spring dynamics and Tailwind CSS.",
};

const MOTION_INDEX: OgPageData = {
  title: "Motion",
  description:
    "30+ animated, unstyled building blocks for React — text effects, buttons, interactions, and more. Built with Tailwind CSS and Motion.",
};

const ICONS_INDEX: OgPageData = {
  title: "Icons",
  description:
    "A collection of animated icons for React, built with Motion and Tailwind CSS.",
};

const SITE_DEFAULT: OgPageData = {
  title: SITE_OG_HERO_TITLE,
  description: `${SITE_OG_HERO_SUBLINE}. ${SITE_DESCRIPTION}`,
};

function resolveMotionOgPage(slug: string[]): OgPageData | null {
  if (slug.length === 1) {
    const page = motionSource.getPage([]);
    return page
      ? { title: page.data.title, description: page.data.description }
      : MOTION_INDEX;
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

function resolveIconsOgPage(slug: string[]): OgPageData | null {
  if (slug.length === 1) {
    const page = iconsSource.getPage([]);
    return page
      ? { title: page.data.title, description: page.data.description }
      : ICONS_INDEX;
  }

  const page = iconsSource.getPage(slug.slice(1));
  if (!page) {
    return ICONS_INDEX;
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

function resolveUiOgPage(slug: string[]): OgPageData | null {
  if (slug.length === 1) {
    const page = uiSource.getPage([]);
    return page
      ? { title: page.data.title, description: page.data.description }
      : UI_INDEX;
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

function resolveBlocksOgPage(slug: string[]): OgPageData | null {
  if (slug.length === 1) {
    return BLOCKS_INDEX;
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

function resolveLegacyOgPage(slug: string[]): OgPageData | null {
  if (slug[0] === "docs" && slug[1] === "motion") {
    const page = motionSource.getPage(slug.slice(2));
    return page
      ? { title: page.data.title, description: page.data.description }
      : MOTION_INDEX;
  }

  if (slug[0] === "docs" && slug[1] === "icons") {
    const page = iconsSource.getPage(slug.slice(2));
    return page
      ? { title: page.data.title, description: page.data.description }
      : ICONS_INDEX;
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
      : MOTION_INDEX;
  }

  return null;
}

export function resolveOgPage(slug: string[]): OgPageData | null {
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
  if (root === "components" || root === "blocks") {
    return resolveBlocksOgPage(slug);
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

export async function createOgImageResponse(
  content: OgPageData
): Promise<ImageResponse> {
  return new ImageResponse(<OgImageFrame {...content} />, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: OG_FONT_FAMILY,
        data: await getOgSfProDisplayFontData(),
        style: "normal",
        weight: 500,
      },
    ],
  });
}

export async function getCachedOgImageBuffer(
  pageSlug: string[]
): Promise<ArrayBuffer | null> {
  "use cache";
  staticContentCacheLife();
  const content = resolveOgPage(pageSlug);
  if (!content) {
    return null;
  }

  const response = await createOgImageResponse(content);
  return await response.arrayBuffer();
}
