import { readFile, writeFile } from "node:fs/promises";
import { uiPageSlug } from "./naming.js";
import type { PrimitiveCategory, UiFramework } from "./paths.js";
import { sectionForCategory, sectionForFramework } from "./paths.js";

interface MetaJson {
  pages: string[];
}

function parseMetaJson(content: string): MetaJson {
  const parsed = JSON.parse(content) as MetaJson;
  if (!Array.isArray(parsed.pages)) {
    throw new Error("meta.json is missing a pages array.");
  }
  return parsed;
}

async function insertIntoSectionedMeta(
  metaJsonPath: string,
  sectionMarker: string,
  pageSlug: string
): Promise<void> {
  const content = await readFile(metaJsonPath, "utf-8");
  const meta = parseMetaJson(content);

  if (meta.pages.includes(pageSlug)) {
    throw new Error(`"${pageSlug}" is already listed in meta.json.`);
  }

  const sectionIndex = meta.pages.indexOf(sectionMarker);
  if (sectionIndex === -1) {
    throw new Error(
      `Section marker "${sectionMarker}" was not found in meta.json.`
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

  meta.pages.splice(insertIndex, 0, pageSlug);

  const nextContent = `${JSON.stringify(meta, null, 2)}\n`;
  await writeFile(metaJsonPath, nextContent, "utf-8");
}

export async function insertIntoMotionMeta(
  metaJsonPath: string,
  category: PrimitiveCategory,
  name: string
): Promise<void> {
  await insertIntoSectionedMeta(
    metaJsonPath,
    sectionForCategory(category),
    name
  );
}

export async function insertIntoUiMeta(
  metaJsonPath: string,
  framework: UiFramework,
  name: string
): Promise<void> {
  await insertIntoSectionedMeta(
    metaJsonPath,
    sectionForFramework(framework),
    uiPageSlug(framework, name)
  );
}
