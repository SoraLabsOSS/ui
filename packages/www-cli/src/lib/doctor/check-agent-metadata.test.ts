import { describe, expect, it } from "bun:test";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  checkAgentMetadata,
  checkTargetAgentMetadata,
} from "./check-agent-metadata.js";

const VALID_FRONTMATTER = `---
intent: Toggle a value.
role: input
a11yConstraints:
  - Preserve keyboard access.
motionEngine: Motion state transition.
compositionRules:
  - Pair with a visible label.
compositionRecipes:
  - name: settings
    description: Use in a settings form.
    components:
      - base/checkbox
    constraints:
      - Keep the submit action separate.
---`;

describe("checkAgentMetadata", () => {
  it("passes complete UI component metadata", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "doctor-agent-metadata-")
    );
    const uiDir = path.join(tempDir, "content", "ui", "base");
    await fs.mkdir(uiDir, { recursive: true });
    const mdxPath = path.join(uiDir, "checkbox.mdx");
    await fs.writeFile(mdxPath, `${VALID_FRONTMATTER}\n# Checkbox`);

    const result = await checkAgentMetadata(tempDir);
    expect(result.issues).toHaveLength(0);
    expect(
      await checkTargetAgentMetadata(tempDir, "content/ui/base/checkbox.mdx")
    ).toHaveLength(0);

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("reports missing semantic fields", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "doctor-agent-metadata-")
    );
    const uiDir = path.join(tempDir, "content", "ui", "radix");
    await fs.mkdir(uiDir, { recursive: true });
    await fs.writeFile(
      path.join(uiDir, "dialog.mdx"),
      "---\ntitle: Dialog\n---\n# Dialog"
    );

    const result = await checkAgentMetadata(tempDir);
    expect(result.issues.length).toBe(6);
    expect(
      result.issues.every((issue) => issue.category === "agent-metadata")
    ).toBe(true);

    await fs.rm(tempDir, { recursive: true, force: true });
  });
});
