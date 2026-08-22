import type { InferSchema, ToolMetadata } from "xmcp";
import { z } from "zod";
import { DocSourceError, soraDocsSource } from "../docs/sora-docs-source";
import type { DocSection } from "../lib/llms-txt-parser";

export const schema = {
  section: z
    .string()
    .optional()
    .describe("Filter to a specific section's children by section name"),
};

export const metadata: ToolMetadata = {
  name: "list_sections",
  description:
    "List the documentation structure showing all sections and their page counts. Use this to discover what documentation is available before searching.",
  annotations: {
    title: "List Documentation Sections",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

function findSection(sections: DocSection[], name: string): DocSection | null {
  const nameLower = name.toLowerCase();
  for (const section of sections) {
    if (
      section.name.toLowerCase() === nameLower ||
      section.slug === nameLower
    ) {
      return section;
    }
    const found = findSection(section.children, name);
    if (found) {
      return found;
    }
  }
  return null;
}

function formatTree(sections: DocSection[], depth = 0): string {
  const lines: string[] = [];
  const indent = "  ".repeat(depth);
  for (const section of sections) {
    lines.push(
      `${indent}- **${section.name}** (${section.pageCount} pages) [${section.slug}]`
    );
    if (section.children.length > 0) {
      lines.push(formatTree(section.children, depth + 1));
    }
  }
  return lines.join("\n");
}

export default async function listSections({
  section,
}: InferSchema<typeof schema>) {
  try {
    const sections = await soraDocsSource.listSections();
    if (sections.length === 0) {
      return "No sections found in the documentation.";
    }

    if (section) {
      const target = findSection(sections, section);
      if (!target) {
        return `Section "${section}" not found. Available sections:\n${sections.map((s) => `  - ${s.name}`).join("\n")}`;
      }
      return formatTree([target], 0);
    }

    return formatTree(sections, 0);
  } catch (error) {
    if (error instanceof DocSourceError) {
      return `Failed to list sections: ${error.message}`;
    }
    throw error;
  }
}
