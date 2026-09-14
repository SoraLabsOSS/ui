import { describe, expect, it } from "bun:test";
import {
  buildIconLabels,
  renderIconDemoIndex,
  renderIconDemoRegistryItem,
  renderIconIndex,
  renderIconRegistryItem,
} from "./icon-templates.js";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

describe("icon templates", () => {
  it("builds icon scaffold labels", () => {
    const labels = buildIconLabels("sparkles");
    expect(labels.name).toBe("sparkles");
    expect(labels.exportName).toBe("Sparkles");
    expect(labels.demoExportName).toBe("SparklesDemo");
    expect(labels.registryName).toBe("icons-sparkles");
    expect(labels.title).toBe("Sparkles");
    expect(labels.keywords).toContain("sparkles");
    expect(labels.keywords).toContain("animated");
    expect(labels.releaseDate).toMatch(DATE_REGEX);
  });

  it("respects custom keywords when provided", () => {
    const labels = buildIconLabels("star-favorite", [
      "star",
      "rating",
      "saved",
    ]);
    expect(labels.keywords).toEqual(["star", "rating", "saved"]);
  });

  it("renders icon component index.tsx with motion and reduced motion", () => {
    const code = renderIconIndex("sparkles", "Sparkles");
    expect(code).toContain('"use client";');
    expect(code).toContain(
      'import { motion, useReducedMotion, type Variants } from "motion/react";'
    );
    expect(code).toContain('from "@/registry/icons/icon";');
    expect(code).toContain("export function Sparkles(props: SparklesProps)");
    expect(code).toContain("export { Sparkles as SparklesIcon };");
    expect(code).toContain("if (reducedMotion) {");
  });

  it("renders icon registry-item.json with @soralabs/icons-icon dependency", () => {
    const jsonStr = renderIconRegistryItem(
      "sparkles",
      "Sparkles",
      "Animated sparkles icon.",
      ["sparkles", "magic"],
      "2026-09-14"
    );

    const parsed = JSON.parse(jsonStr) as {
      dependencies: string[];
      files: Array<{ path: string; target: string; type: string }>;
      name: string;
      registryDependencies: string[];
      type: string;
    };

    expect(parsed.name).toBe("icons-sparkles");
    expect(parsed.type).toBe("registry:ui");
    expect(parsed.dependencies).toEqual(["motion"]);
    expect(parsed.registryDependencies).toEqual(["@soralabs/icons-icon"]);
    expect(parsed.files[0]?.path).toBe("registry/icons/sparkles/index.tsx");
    expect(parsed.files[0]?.target).toBe(
      "components/sora-ui/icons/sparkles.tsx"
    );
  });

  it("renders demo index and demo registry-item.json", () => {
    const demoCode = renderIconDemoIndex(
      "sparkles",
      "Sparkles",
      "SparklesDemo"
    );
    expect(demoCode).toContain(
      'import { Sparkles } from "@/registry/icons/sparkles";'
    );
    expect(demoCode).toContain("export default function SparklesDemo()");

    const demoJsonStr = renderIconDemoRegistryItem("sparkles", "Sparkles");
    const demoParsed = JSON.parse(demoJsonStr) as {
      name: string;
      registryDependencies: string[];
    };
    expect(demoParsed.name).toBe("demo-icons-sparkles");
    expect(demoParsed.registryDependencies).toEqual([
      "@soralabs/icons-sparkles",
    ]);
  });
});
