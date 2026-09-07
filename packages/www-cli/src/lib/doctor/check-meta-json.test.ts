import { describe, expect, it } from "bun:test";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkMetaJson } from "./check-meta-json.js";

describe("checkMetaJson", () => {
  it("passes when meta.json and mdx files are in perfect sync", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "doctor-meta-test-")
    );
    const motionDir = path.join(tempDir, "content", "docs", "motion");
    await fs.mkdir(motionDir, { recursive: true });

    await fs.writeFile(
      path.join(motionDir, "test-effect.mdx"),
      "# Test Effect"
    );
    await fs.writeFile(
      path.join(motionDir, "meta.json"),
      JSON.stringify({
        pages: ["---Effects---", "test-effect"],
      })
    );

    const result = await checkMetaJson(tempDir);
    expect(result.issues).toHaveLength(0);
    expect(result.metaPagesChecked).toBe(1);
    expect(result.mdxFilesChecked).toBe(1);

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("reports error when page in meta.json is missing on disk", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "doctor-meta-test-")
    );
    const motionDir = path.join(tempDir, "content", "docs", "motion");
    await fs.mkdir(motionDir, { recursive: true });

    await fs.writeFile(
      path.join(motionDir, "meta.json"),
      JSON.stringify({
        pages: ["missing-page"],
      })
    );

    const result = await checkMetaJson(tempDir);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.severity).toBe("error");
    expect(result.issues[0]?.message).toContain("missing-page");
    expect(result.issues[0]?.fix).toContain("missing-page.mdx");

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("reports warning when mdx file exists on disk but is omitted from meta.json", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "doctor-meta-test-")
    );
    const motionDir = path.join(tempDir, "content", "docs", "motion");
    await fs.mkdir(motionDir, { recursive: true });

    await fs.writeFile(
      path.join(motionDir, "unregistered.mdx"),
      "# Unregistered"
    );
    await fs.writeFile(
      path.join(motionDir, "meta.json"),
      JSON.stringify({
        pages: [],
      })
    );

    const result = await checkMetaJson(tempDir);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.severity).toBe("warning");
    expect(result.issues[0]?.message).toContain("unregistered.mdx");
    expect(result.issues[0]?.fix).toContain("unregistered");

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("handles nested UI pages like base/button and radix/button", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "doctor-meta-test-")
    );
    const uiBaseDir = path.join(tempDir, "content", "ui", "base");
    await fs.mkdir(uiBaseDir, { recursive: true });

    await fs.writeFile(path.join(uiBaseDir, "button.mdx"), "# Base Button");
    await fs.writeFile(
      path.join(tempDir, "content", "ui", "meta.json"),
      JSON.stringify({
        pages: ["---Base UI---", "base/button"],
      })
    );

    const result = await checkMetaJson(tempDir);
    expect(result.issues).toHaveLength(0);
    expect(result.metaPagesChecked).toBe(1);
    expect(result.mdxFilesChecked).toBe(1);

    await fs.rm(tempDir, { recursive: true, force: true });
  });
});
