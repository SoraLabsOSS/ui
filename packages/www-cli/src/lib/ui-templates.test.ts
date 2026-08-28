import { describe, expect, it } from "bun:test";
import {
  uiDemoRegistryName,
  uiPageSlug,
  uiRegistryName,
  uiRegistryTitle,
} from "./naming.js";
import {
  buildUiScaffoldLabels,
  renderUiDemoRegistryItem,
  renderUiMdx,
  renderUiRegistryItem,
} from "./ui-templates.js";

describe("ui templates", () => {
  const name = "toggle-group";
  const baseLabels = buildUiScaffoldLabels("base", name);
  const radixLabels = buildUiScaffoldLabels("radix", name);

  it("builds framework-specific registry and demo names", () => {
    expect(uiRegistryName("base", name)).toBe("base-toggle-group");
    expect(uiRegistryName("radix", name)).toBe("radix-toggle-group");
    expect(uiDemoRegistryName("base", name)).toBe("demo-toggle-group");
    expect(uiDemoRegistryName("radix", name)).toBe("demo-radix-toggle-group");
    expect(uiPageSlug("base", name)).toBe("base/toggle-group");
    expect(uiRegistryTitle("base", "Toggle Group")).toBe("Base Toggle Group");
  });

  it("aligns export name and demoProps key", () => {
    expect(baseLabels.exportName).toBe("ToggleGroup");
    expect(baseLabels.demoComponentName).toBe("ToggleGroupDemo");
    expect(radixLabels.demoComponentName).toBe("RadixToggleGroupDemo");
  });

  it("renders registry-item.json with UI install targets", () => {
    const json = renderUiRegistryItem("base", name, baseLabels);
    const parsed = JSON.parse(json) as {
      files: Array<{ path: string; target: string }>;
      meta: { demoProps: Record<string, unknown> };
      name: string;
    };

    expect(parsed.name).toBe("base-toggle-group");
    expect(parsed.files[0]?.path).toBe(
      "registry/ui/base/toggle-group/index.tsx"
    );
    expect(parsed.files[0]?.target).toBe(
      "components/sora-ui/base/toggle-group.tsx"
    );
    expect(Object.keys(parsed.meta.demoProps)).toEqual(["ToggleGroup"]);
  });

  it("renders MDX with demo preview and prefixed install name", () => {
    const mdx = renderUiMdx("radix", name, radixLabels);
    expect(mdx).toContain('<ComponentPreview name="demo-radix-toggle-group"');
    expect(mdx).toContain('<ComponentInstallation name="radix-toggle-group"');
    expect(mdx).toContain("@/components/sora-ui/radix/toggle-group");
  });

  it("renders demo registry item with @soralabs dependency", () => {
    const json = renderUiDemoRegistryItem("base", name, baseLabels);
    const parsed = JSON.parse(json) as {
      name: string;
      registryDependencies: string[];
    };

    expect(parsed.name).toBe("demo-toggle-group");
    expect(parsed.registryDependencies).toEqual([
      "@soralabs/base-toggle-group",
    ]);
  });
});
