import { readFile, writeFile } from "node:fs/promises";
import type { PrimitiveCategory } from "./paths.js";
import { sectionForCategory } from "./paths.js";

interface MotionMetaJson {
  pages: string[];
}

function parseMetaJson(content: string): MotionMetaJson {
  const parsed = JSON.parse(content) as MotionMetaJson;
  if (!Array.isArray(parsed.pages)) {
    throw new Error("content/docs/motion/meta.json is missing a pages array.");
  }
  return parsed;
}

export async function insertIntoMotionMeta(
  metaJsonPath: string,
  category: PrimitiveCategory,
  name: string
): Promise<void> {
  const content = await readFile(metaJsonPath, "utf-8");
  const meta = parseMetaJson(content);

  if (meta.pages.includes(name)) {
    throw new Error(`"${name}" is already listed in motion meta.json.`);
  }

  const sectionMarker = sectionForCategory(category);
  const sectionIndex = meta.pages.indexOf(sectionMarker);
  if (sectionIndex === -1) {
    throw new Error(
      `Section marker "${sectionMarker}" was not found in motion meta.json.`
    );
  }

  let insertIndex = sectionIndex + 1;
  while (insertIndex < meta.pages.length) {
    const page = meta.pages[insertIndex];
    if (page?.startsWith("---")) {
      break;
    }
    insertIndex += 1;
  }

  meta.pages.splice(insertIndex, 0, name);

  const nextContent = `${JSON.stringify(meta, null, 2)}\n`;
  await writeFile(metaJsonPath, nextContent, "utf-8");
}
