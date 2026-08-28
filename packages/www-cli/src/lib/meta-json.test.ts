import { afterEach, describe, expect, it } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { insertIntoMotionMeta } from "./meta-json.js";

const ALREADY_LISTED_ERROR = /already listed/i;

describe("insertIntoMotionMeta", () => {
  let tempDir = "";

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = "";
    }
  });

  it("inserts a page at the end of the target section", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "www-cli-meta-"));
    const metaPath = path.join(tempDir, "meta.json");
    await writeFile(
      metaPath,
      `${JSON.stringify(
        {
          pages: ["---Texts---", "text-effect", "---Effects---", "highlight"],
        },
        null,
        2
      )}\n`
    );

    await insertIntoMotionMeta(metaPath, "effects", "my-new-effect");

    const meta = JSON.parse(await readFile(metaPath, "utf-8")) as {
      pages: string[];
    };
    expect(meta.pages).toEqual([
      "---Texts---",
      "text-effect",
      "---Effects---",
      "highlight",
      "my-new-effect",
    ]);
  });

  it("throws when the slug is already registered", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "www-cli-meta-"));
    const metaPath = path.join(tempDir, "meta.json");
    await writeFile(
      metaPath,
      `${JSON.stringify({ pages: ["---Effects---", "highlight"] }, null, 2)}\n`
    );

    await expect(
      insertIntoMotionMeta(metaPath, "effects", "highlight")
    ).rejects.toThrow(ALREADY_LISTED_ERROR);
  });
});
