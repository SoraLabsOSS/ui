import { describe, expect, it } from "bun:test";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkTargetComponent } from "./check-target-component.js";

describe("checkTargetComponent", () => {
  it("passes when a targeted primitive has everything in order", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "target-test-"));
    const compDir = path.join(
      tempDir,
      "registry",
      "primitives",
      "effects",
      "glow"
    );
    await fs.mkdir(compDir, { recursive: true });

    await fs.writeFile(
      path.join(compDir, "index.tsx"),
      "export function Glow() { return null; }"
    );

    await fs.writeFile(
      path.join(compDir, "registry-item.json"),
      JSON.stringify({
        name: "glow",
        files: [{ path: "registry/primitives/effects/glow/index.tsx" }],
        meta: {
          demoProps: {
            Glow: { intensity: { value: 1 } },
          },
        },
      })
    );

    const docDir = path.join(tempDir, "content", "docs", "motion");
    await fs.mkdir(docDir, { recursive: true });
    await fs.writeFile(
      path.join(docDir, "glow.mdx"),
      `# Glow\n<ComponentPreview name="glow" />`
    );

    await fs.writeFile(
      path.join(docDir, "meta.json"),
      JSON.stringify({
        pages: ["---Effects---", "glow"],
      })
    );

    const result = await checkTargetComponent(tempDir, "glow");
    expect(result.passed).toBe(true);
    expect(result.errorCount).toBe(0);
    expect(result.warningCount).toBe(0);
    expect(result.targetComponent).toBe("glow");

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("handles UI components with framework prefix (base/dialog or base-dialog)", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "target-test-"));
    const compDir = path.join(tempDir, "registry", "ui", "base", "dialog");
    await fs.mkdir(compDir, { recursive: true });

    await fs.writeFile(
      path.join(compDir, "index.tsx"),
      "export function Dialog() { return null; }"
    );

    await fs.writeFile(
      path.join(compDir, "registry-item.json"),
      JSON.stringify({
        name: "base-dialog",
        files: [{ path: "registry/ui/base/dialog/index.tsx" }],
        meta: {
          demoProps: {
            Dialog: {},
          },
        },
      })
    );

    const docDir = path.join(tempDir, "content", "ui", "base");
    await fs.mkdir(docDir, { recursive: true });
    await fs.writeFile(
      path.join(docDir, "dialog.mdx"),
      `# Base Dialog\n<ComponentPreview name="base-dialog" />`
    );

    await fs.writeFile(
      path.join(tempDir, "content", "ui", "meta.json"),
      JSON.stringify({
        pages: ["---Base UI---", "base/dialog"],
      })
    );

    // Test with slash syntax
    const result1 = await checkTargetComponent(tempDir, "base/dialog");
    expect(result1.passed).toBe(true);
    expect(result1.errorCount).toBe(0);

    // Test with hyphen syntax
    const result2 = await checkTargetComponent(tempDir, "base-dialog");
    expect(result2.passed).toBe(true);
    expect(result2.errorCount).toBe(0);

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("returns error when target component is not found", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "target-test-"));

    const result = await checkTargetComponent(tempDir, "non-existent");
    expect(result.passed).toBe(false);
    expect(result.errorCount).toBe(1);
    expect(result.issues[0]?.message).toContain("not found in registry");

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("detects missing MDX and mismatched demoProps for a single component", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "target-test-"));
    const compDir = path.join(
      tempDir,
      "registry",
      "primitives",
      "texts",
      "shimmer"
    );
    await fs.mkdir(compDir, { recursive: true });

    await fs.writeFile(
      path.join(compDir, "index.tsx"),
      "export function ShimmerText() { return null; }"
    );

    await fs.writeFile(
      path.join(compDir, "registry-item.json"),
      JSON.stringify({
        name: "shimmer",
        files: [{ path: "registry/primitives/texts/shimmer/index.tsx" }],
        meta: {
          demoProps: {
            WrongExportName: {},
          },
        },
      })
    );

    const result = await checkTargetComponent(tempDir, "shimmer");
    expect(result.passed).toBe(false);
    expect(result.errorCount).toBe(2); // 1 demoProps mismatch + 1 missing MDX
    const demoIssue = result.issues.find((i) => i.category === "demo-props");
    const mdxIssue = result.issues.find((i) => i.category === "registry-docs");
    expect(demoIssue?.message).toContain("WrongExportName");
    expect(mdxIssue?.message).toContain("does not exist");

    await fs.rm(tempDir, { recursive: true, force: true });
  });
});
