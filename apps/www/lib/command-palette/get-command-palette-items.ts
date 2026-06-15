import { cache } from "react";
import { baseOptions } from "@/app/layout.config";
import primitivesMeta from "@/content/docs/primitives/meta.json";
import { getFirstPrimitiveDocUrl } from "@/lib/docs/get-first-primitive-doc-url";
import { source } from "@/lib/docs/source";
import {
  COMPONENT_GALLERY_SECTIONS,
  isGalleryCatalogItem,
  resolveGalleryCategory,
} from "@/lib/registry/component-gallery-sections";
import { getComponentGalleryItems } from "@/lib/registry/get-component-page-data";
import type { ComponentGalleryCategory } from "@/lib/registry/types";
import type { CommandPaletteGroup, CommandPaletteItem } from "./types";

function sectionTitle(category: ComponentGalleryCategory): string {
  return (
    COMPONENT_GALLERY_SECTIONS.find((section) => section.id === category)
      ?.title ?? "Components"
  );
}

function docHint(url: string): string {
  if (url === "/docs") {
    return "Docs";
  }

  const segment = url.split("/").filter(Boolean).pop() ?? "";
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function item(
  partial: Omit<CommandPaletteItem, "searchValue"> & { path?: string }
): CommandPaletteItem {
  const hint = partial.hint ?? "";
  const pathPrefix = partial.path ? `~ ${partial.path} ` : "";

  return {
    ...partial,
    searchValue: `${pathPrefix}${partial.label}${hint}`,
  };
}

function buildPrimitiveSectionBySlug(): Map<string, string> {
  const sections = new Map<string, string>();
  let section = "Primitives";

  for (const entry of primitivesMeta.pages) {
    if (entry.startsWith("---") && entry.endsWith("---")) {
      section = entry.slice(3, -3);
      continue;
    }

    sections.set(entry, section);
  }

  return sections;
}

const PRIMITIVE_SECTION_BY_SLUG = buildPrimitiveSectionBySlug();

const GUIDE_DOC_URLS = new Set(
  (baseOptions.links ?? [])
    .filter(
      (link): link is { text: string; url: string } =>
        typeof link === "object" &&
        link !== null &&
        "url" in link &&
        typeof link.url === "string" &&
        link.url.startsWith("/docs")
    )
    .map((link) => link.url)
);

function getDocumentationItems(): CommandPaletteItem[] {
  const documentation: CommandPaletteItem[] = [];

  for (const page of source.getPages()) {
    if (page.slugs[0] === "openapi") {
      continue;
    }

    if (page.url.startsWith("/docs/primitives/")) {
      continue;
    }

    if (!GUIDE_DOC_URLS.has(page.url) && page.url !== "/docs") {
      continue;
    }

    documentation.push(
      item({
        id: `doc-${page.url}`,
        label: page.data.title,
        hint: docHint(page.url),
        href: page.url,
        icon: "book",
        path: page.url,
        keywords: page.data.description ? [page.data.description] : undefined,
      })
    );
  }

  return documentation;
}

function getPrimitiveItems(): CommandPaletteItem[] {
  const primitivePagesBySlug = new Map(
    source
      .getPages()
      .filter((page) => page.url.startsWith("/docs/primitives/"))
      .map((page) => [page.slugs.at(-1) ?? "", page] as const)
  );

  const primitives: CommandPaletteItem[] = [];

  for (const entry of primitivesMeta.pages) {
    if (entry.startsWith("---")) {
      continue;
    }

    const page = primitivePagesBySlug.get(entry);
    if (!page) {
      continue;
    }

    primitives.push(
      item({
        id: `primitive-${page.url}`,
        label: page.data.title,
        hint: PRIMITIVE_SECTION_BY_SLUG.get(entry) ?? "Primitives",
        href: page.url,
        icon: "box",
        path: page.url,
        keywords: page.data.description ? [page.data.description] : undefined,
      })
    );
  }

  return primitives;
}

function getComponentItems(): CommandPaletteItem[] {
  return getComponentGalleryItems()
    .filter(isGalleryCatalogItem)
    .map((entry) => {
      const category = resolveGalleryCategory(entry);

      return item({
        id: `component-${entry.slug}`,
        label: entry.title,
        hint: sectionTitle(category),
        href: entry.href,
        icon: "box",
        path: entry.href,
        keywords: entry.description ? [entry.description] : undefined,
      });
    });
}

export const getCommandPaletteGroups = cache((): CommandPaletteGroup[] => {
  const primitivesUrl = getFirstPrimitiveDocUrl();

  const navigation: CommandPaletteItem[] = [
    item({
      id: "page-home",
      label: "Home",
      href: "/",
      icon: "arrow",
      path: "/",
    }),
    item({
      id: "page-docs",
      label: "Documentation",
      href: "/docs",
      icon: "book",
      path: "/docs",
    }),
    item({
      id: "page-primitives",
      label: "Primitives",
      href: primitivesUrl,
      icon: "box",
      path: primitivesUrl,
    }),
    item({
      id: "page-components",
      label: "Components",
      href: "/components",
      icon: "box",
      path: "/components",
    }),
  ];

  const documentation = getDocumentationItems();
  const primitives = getPrimitiveItems();
  const components = getComponentItems();

  const groups: CommandPaletteGroup[] = [
    { id: "navigation", label: "Navigation", items: navigation },
  ];

  if (documentation.length > 0) {
    groups.push({
      id: "documentation",
      label: "Documentation",
      items: documentation,
    });
  }

  if (primitives.length > 0) {
    groups.push({ id: "primitives", label: "Primitives", items: primitives });
  }

  if (components.length > 0) {
    groups.push({ id: "components", label: "Components", items: components });
  }

  return groups;
});
