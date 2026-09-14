import { describe, expect, it } from "bun:test";
import { buildCatalogLabels, renderCatalogMdx } from "./catalog-templates.js";

describe("catalog templates", () => {
  it("builds catalog labels correctly", () => {
    const labels = buildCatalogLabels("sticky-scroll-cards");
    expect(labels.slug).toBe("sticky-scroll-cards");
    expect(labels.title).toBe("Sticky Scroll Cards");
    expect(labels.exportName).toBe("StickyScrollCards");
    expect(labels.registryName).toBe("sticky-scroll-cards");
    expect(labels.description).toContain("Sticky Scroll Cards");
  });

  it("supports explicit underlying registry name in labels", () => {
    const labels = buildCatalogLabels("custom-showcase", "text-reveal-block");
    expect(labels.slug).toBe("custom-showcase");
    expect(labels.registryName).toBe("text-reveal-block");
    expect(labels.exportName).toBe("CustomShowcase");
  });

  it("renders catalog MDX with expected structure and installation tag", () => {
    const mdx = renderCatalogMdx({
      slug: "interactive-gallery",
      title: "Interactive Gallery",
      description: "Interactive gallery layout showcase.",
      category: "effects",
      registryName: "scroll-gallery",
      exportName: "ScrollGallery",
    });

    expect(mdx).toContain("title: Interactive Gallery");
    expect(mdx).toContain("description: Interactive gallery layout showcase.");
    expect(mdx).toContain("category: effects");
    expect(mdx).toContain("registryName: scroll-gallery");
    expect(mdx).toContain('<ComponentInstallation name="scroll-gallery" />');
    expect(mdx).toContain("import { ScrollGallery }");
  });
});
