import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { access } from "node:fs/promises";
import path from "node:path";
import { runCreatePrimitive } from "./commands/create-primitive.js";
import { shouldRunRegistryBuildTests } from "./test/env.js";
import {
  cleanupPrimitiveFixture,
  cleanupRegistryJsonArtifact,
  getWwwRootFromRepo,
} from "./test/fixture.js";

const SLOW_FIXTURE_NAME = "www-cli-registry-build-fixture";

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

describe.skipIf(!shouldRunRegistryBuildTests())(
  "create primitive registry build (slow)",
  () => {
    const category = "effects" as const;
    const registryJsonPath = path.join(
      getWwwRootFromRepo(),
      "public",
      "r",
      `${SLOW_FIXTURE_NAME}.json`
    );

    beforeEach(async () => {
      await cleanupPrimitiveFixture(category, SLOW_FIXTURE_NAME);
    });

    afterEach(async () => {
      await cleanupPrimitiveFixture(category, SLOW_FIXTURE_NAME);
      await cleanupRegistryJsonArtifact(SLOW_FIXTURE_NAME);
    });

    it("runs registry:build and publishes public/r/*.json", async () => {
      await runCreatePrimitive(SLOW_FIXTURE_NAME, {
        category,
        yes: true,
        skipBuild: false,
      });

      expect(await pathExists(registryJsonPath)).toBe(true);
    }, 120_000);
  }
);
