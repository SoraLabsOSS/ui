import { describe, expect, it } from "bun:test";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkRegistryDocs } from "./check-registry-docs.js";

describe("checkRegistryDocs", () => {
  it("passes when primitives have matching MDX with ComponentPreview", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "doctor-reg-test-")
    );
    const primDir = path.join(
      tempDir,
      "registry",
      "primitives",
      "effects",
      "glow"
    );
    await fs.mkdir(primDir, { recursive: true });

    await fs.writeFile(
      path.join(primDir, "registry-item.json"),
      JSON.stringify({
        name: "glow",
        files: [{ path: "registry/primitives/effects/glow/index.tsx" }],
      })
    );

    const docDir = path.join(tempDir, "content", "docs", "motion");
    await fs.mkdir(docDir, { recursive: true });
    await fs.writeFile(
      path.join(docDir, "glow.mdx"),
      `<ComponentPreview name="glow" />`
    );

    const result = await checkRegistryDocs(tempDir);
    expect(result.issues).toHaveLength(0);
    expect(result.registryItemsChecked).toBe(1);

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("reports error when primitive folder has no matching MDX file", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "doctor-reg-test-")
    );
    const primDir = path.join(
      tempDir,
      "registry",
      "primitives",
      "effects",
      "undoc-fx"
    );
    await fs.mkdir(primDir, { recursive: true });

    await fs.writeFile(
      path.join(primDir, "registry-item.json"),
      JSON.stringify({
        name: "undoc-fx",
        files: [{ path: "registry/primitives/effects/undoc-fx/index.tsx" }],
      })
    );

    const result = await checkRegistryDocs(tempDir);
    const errorIssue = result.issues.find((i) => i.severity === "error");
    expect(errorIssue).toBeDefined();
    expect(errorIssue?.message).toContain("undoc-fx");
    expect(errorIssue?.fix).toContain("create:primitive");

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("reports warning when item is skipped by registry:build due to missing ComponentPreview", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "doctor-reg-test-")
    );
    const uiDir = path.join(tempDir, "registry", "ui", "base", "slider");
    await fs.mkdir(uiDir, { recursive: true });

    await fs.writeFile(
      path.join(uiDir, "registry-item.json"),
      JSON.stringify({
        name: "base-slider",
        files: [{ path: "registry/ui/base/slider/index.tsx" }],
      })
    );

    // Create MDX file without ComponentPreview tag
    const docDir = path.join(tempDir, "content", "ui", "base");
    await fs.mkdir(docDir, { recursive: true });
    await fs.writeFile(path.join(docDir, "slider.mdx"), "# Slider Docs");

    const result = await checkRegistryDocs(tempDir);
    const skipWarning = result.issues.find(
      (i) => i.category === "registry-skip"
    );
    expect(skipWarning).toBeDefined();
    expect(skipWarning?.message).toContain("skipped by registry:build");
    expect(skipWarning?.fix).toContain("create:ui");

    await fs.rm(tempDir, { recursive: true, force: true });
  });
});
