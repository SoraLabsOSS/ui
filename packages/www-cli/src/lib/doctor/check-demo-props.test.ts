import { describe, expect, it } from "bun:test";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkDemoProps } from "./check-demo-props.js";

describe("checkDemoProps", () => {
  it("passes when demoProps key matches an exported component", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "doctor-test-"));
    const compDir = path.join(
      tempDir,
      "registry",
      "primitives",
      "effects",
      "my-fx"
    );
    await fs.mkdir(compDir, { recursive: true });

    await fs.writeFile(
      path.join(compDir, "index.tsx"),
      "export function MyFx() { return null; }"
    );

    await fs.writeFile(
      path.join(compDir, "registry-item.json"),
      JSON.stringify({
        name: "my-fx",
        files: [{ path: "registry/primitives/effects/my-fx/index.tsx" }],
        meta: {
          demoProps: {
            MyFx: { someProp: { value: true } },
          },
        },
      })
    );

    const result = await checkDemoProps(tempDir);
    expect(result.issues).toHaveLength(0);
    expect(result.demoPropsChecked).toBe(1);

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("reports error when demoProps key does not match any export", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "doctor-test-"));
    const compDir = path.join(
      tempDir,
      "registry",
      "primitives",
      "effects",
      "mismatch"
    );
    await fs.mkdir(compDir, { recursive: true });

    await fs.writeFile(
      path.join(compDir, "index.tsx"),
      "export function ActualExport() { return null; }"
    );

    await fs.writeFile(
      path.join(compDir, "registry-item.json"),
      JSON.stringify({
        name: "mismatch",
        files: [{ path: "registry/primitives/effects/mismatch/index.tsx" }],
        meta: {
          demoProps: {
            WrongKeyName: { someProp: { value: true } },
          },
        },
      })
    );

    const result = await checkDemoProps(tempDir);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.severity).toBe("error");
    expect(result.issues[0]?.message).toContain("WrongKeyName");
    expect(result.issues[0]?.message).toContain("ActualExport");
    expect(result.issues[0]?.fix).toContain("ActualExport");

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("reports error when primary source file is missing", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "doctor-test-"));
    const compDir = path.join(
      tempDir,
      "registry",
      "primitives",
      "effects",
      "missing-file"
    );
    await fs.mkdir(compDir, { recursive: true });

    await fs.writeFile(
      path.join(compDir, "registry-item.json"),
      JSON.stringify({
        name: "missing-file",
        files: [
          { path: "registry/primitives/effects/missing-file/non-existent.tsx" },
        ],
        meta: {
          demoProps: {
            MyComponent: {},
          },
        },
      })
    );

    const result = await checkDemoProps(tempDir);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.severity).toBe("error");
    expect(result.issues[0]?.message).toContain("does not exist");

    await fs.rm(tempDir, { recursive: true, force: true });
  });
});
