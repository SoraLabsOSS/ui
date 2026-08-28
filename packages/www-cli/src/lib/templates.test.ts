import { describe, expect, it } from "bun:test";
import {
  buildScaffoldLabels,
  renderMotionMdx,
  renderPrimitiveIndex,
  renderPrimitiveRegistryItem,
} from "./templates.js";

describe("templates", () => {
  const name = "magnetic-button";
  const labels = buildScaffoldLabels(name);

  it("aligns export name and demoProps key", () => {
    expect(labels.exportName).toBe("MagneticButton");
    expect(labels.demoExportName).toBe("MagneticButtonDemo");
  });

  it("renders a primitive stub with repo conventions", () => {
    const source = renderPrimitiveIndex(name, labels.exportName);
    expect(source).toContain("@workspace/ui/lib/utils");
    expect(source).toContain("useReducedMotion()");
    expect(source).toContain("export function MagneticButton");
    expect(source).toContain('data-slot="magnetic-button"');
  });

  it("renders registry-item.json with demoProps keyed by export name", () => {
    const json = renderPrimitiveRegistryItem(
      name,
      "effects",
      labels.exportName,
      labels.title,
      labels.description
    );
    const parsed = JSON.parse(json) as {
      files: Array<{ path: string; target: string }>;
      meta: { demoProps: Record<string, unknown> };
    };

    expect(parsed.files[0]?.path).toBe(
      "registry/primitives/effects/magnetic-button/index.tsx"
    );
    expect(parsed.files[0]?.target).toBe(
      "components/sora-ui/effects/magnetic-button.tsx"
    );
    expect(Object.keys(parsed.meta.demoProps)).toEqual(["MagneticButton"]);
  });

  it("renders motion docs with preview and installation tags", () => {
    const mdx = renderMotionMdx(
      name,
      "effects",
      labels.title,
      labels.description,
      labels.exportName
    );
    expect(mdx).toContain('<ComponentPreview name="magnetic-button"');
    expect(mdx).toContain('<ComponentInstallation name="magnetic-button"');
    expect(mdx).toContain("MagneticButton");
  });
});
