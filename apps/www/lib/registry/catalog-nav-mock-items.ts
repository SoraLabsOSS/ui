import type { ComponentGalleryItem } from "@/lib/registry/types";

const MOCK_COUNT = 48;

/** Dev-only sidebar entries — long list for scroll testing. */
export const catalogNavMockItems: ComponentGalleryItem[] = Array.from(
  { length: MOCK_COUNT },
  (_, index) => {
    const id = String(index + 1).padStart(2, "0");
    const slug = `mock-scroll-${id}`;

    return {
      slug,
      title: `Scroll test component ${id}`,
      description: "Mock catalog entry for sidebar scroll testing.",
      href: "/components/draw-underline-link",
      collection: "component",
    };
  }
);
