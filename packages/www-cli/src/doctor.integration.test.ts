import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { formatDoctorReport } from "./lib/doctor/format-report.js";
import { runDoctorAudit } from "./lib/doctor/index.js";

describe("doctor integration", () => {
  it("runs doctor audit on a healthy mock workspace and passes with 0 issues", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "doctor-healthy-"));

    const primDir = path.join(
      tempDir,
      "registry",
      "primitives",
      "effects",
      "fade"
    );
    await fs.mkdir(primDir, { recursive: true });
    await fs.writeFile(
      path.join(primDir, "index.tsx"),
      "export function Fade() { return null; }"
    );
    await fs.writeFile(
      path.join(primDir, "registry-item.json"),
      JSON.stringify({
        name: "fade",
        files: [{ path: "registry/primitives/effects/fade/index.tsx" }],
        meta: {
          demoProps: {
            Fade: { duration: { value: 0.5 } },
          },
        },
      })
    );

    const docDir = path.join(tempDir, "content", "docs", "motion");
    await fs.mkdir(docDir, { recursive: true });
    await fs.writeFile(
      path.join(docDir, "fade.mdx"),
      '# Fade\n<ComponentPreview name="fade" />'
    );
    await fs.writeFile(
      path.join(docDir, "meta.json"),
      JSON.stringify({
        pages: ["---Effects---", "fade"],
      })
    );

    const result = await runDoctorAudit(tempDir);
    expect(result.passed).toBe(true);
    expect(result.errorCount).toBe(0);
    expect(result.warningCount).toBe(0);
    expect(result.stats.registryItemsChecked).toBe(1);
    expect(result.stats.demoPropsChecked).toBe(1);
    expect(result.stats.metaPagesChecked).toBe(1);

    const report = formatDoctorReport(result, { noColor: true });
    expect(report).toContain("No issues found");

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("fails audit when issues exist", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "doctor-broken-"));

    const primDir = path.join(
      tempDir,
      "registry",
      "primitives",
      "texts",
      "bad-comp"
    );
    await fs.mkdir(primDir, { recursive: true });
    await fs.writeFile(
      path.join(primDir, "index.tsx"),
      "export function RealComp() { return null; }"
    );
    await fs.writeFile(
      path.join(primDir, "registry-item.json"),
      JSON.stringify({
        name: "bad-comp",
        files: [{ path: "registry/primitives/texts/bad-comp/index.tsx" }],
        meta: {
          demoProps: {
            FakeCompName: {},
          },
        },
      })
    );

    const result = await runDoctorAudit(tempDir);
    expect(result.passed).toBe(false);
    expect(result.errorCount).toBeGreaterThan(0);

    const report = formatDoctorReport(result, { noColor: true });
    expect(report).toContain("FakeCompName");
    expect(report).toContain("RealComp");

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("prints helpful error and exits with code 1 when no component name and no --all flag", () => {
    const cliPath = path.resolve(import.meta.dir, "index.ts");
    const res = spawnSync(process.execPath, [cliPath, "doctor"], {
      cwd: path.resolve(import.meta.dir, "../../.."),
      encoding: "utf-8",
    });

    expect(res.status).toBe(1);
    const combinedOutput = `${res.stdout}\n${res.stderr}`;
    expect(combinedOutput).toContain("Please specify a component name");
    expect(combinedOutput).toContain("--all");
  });

  it("runs targeted check when component name is provided via CLI", () => {
    const cliPath = path.resolve(import.meta.dir, "index.ts");
    const res = spawnSync(
      process.execPath,
      [cliPath, "doctor", "text-effect", "--no-color"],
      {
        cwd: path.resolve(import.meta.dir, "../../.."),
        encoding: "utf-8",
      }
    );

    const combinedOutput = `${res.stdout}\n${res.stderr}`;
    expect(combinedOutput).toContain("text-effect");
    expect(combinedOutput).toContain("Health Check");
  });

  it("runs full audit when --all flag is provided via CLI", () => {
    const cliPath = path.resolve(import.meta.dir, "index.ts");
    const res = spawnSync(
      process.execPath,
      [cliPath, "doctor", "--all", "--no-color"],
      {
        cwd: path.resolve(import.meta.dir, "../../.."),
        encoding: "utf-8",
      }
    );

    const combinedOutput = `${res.stdout}\n${res.stderr}`;
    expect(combinedOutput).toContain("www-cli doctor");
    expect(combinedOutput).toContain("Summary:");
  });
});
