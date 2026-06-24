import type {
  ComponentGalleryCategory,
  ComponentGalleryItem,
} from "@/lib/registry/types";

export interface ComponentGallerySection {
  description: string;
  id: ComponentGalleryCategory;
  title: string;
}

export const COMPONENT_GALLERY_SECTIONS: ComponentGallerySection[] = [
  {
    id: "texts",
    title: "Texts",
    description: "Typography, links, and text animation components",
  },
  {
    id: "buttons",
    title: "Buttons",
    description: "Interactive button patterns with motion and feedback",
  },
  {
    id: "effects",
    title: "Effects",
    description: "Cursor, image, and ambient visual effects",
  },
  {
    id: "disclosure",
    title: "Disclosure",
    description: "Accordions, tabs, and expandable UI patterns",
  },
  {
    id: "components",
    title: "Components",
    description: "Full component pages with live demos and install commands",
  },
];

const CATEGORY_BY_SLUG: Partial<Record<string, ComponentGalleryCategory>> = {
  "text-roll": "texts",
};

export function resolveGalleryCategory(
  item: ComponentGalleryItem
): ComponentGalleryCategory {
  if (item.category) {
    return item.category;
  }

  return CATEGORY_BY_SLUG[item.slug] ?? "components";
}

export function isGalleryCatalogItem(item: ComponentGalleryItem): boolean {
  return !item.slug.startsWith("mock-scroll-");
}

export function groupGalleryItemsByCategory(
  items: ComponentGalleryItem[]
): Map<ComponentGalleryCategory, ComponentGalleryItem[]> {
  const grouped = new Map<ComponentGalleryCategory, ComponentGalleryItem[]>();

  for (const item of items) {
    if (!isGalleryCatalogItem(item)) {
      continue;
    }

    const category = resolveGalleryCategory(item);
    const sectionItems = grouped.get(category) ?? [];
    sectionItems.push(item);
    grouped.set(category, sectionItems);
  }

  return grouped;
}
