/**
 * Builds public/r/registry.json, __registry__/index.tsx, and public/r/*.json.
 *
 * Docs component flow (preview + auto Code tab): see registry/README.md
 */
import { exec } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { rimraf } from "rimraf";
import { generateUsageExampleFromTarget } from "../lib/docs/generate-usage-example-code.ts";

const CONTENT_MDX_PATHS = [
  path.join(process.cwd(), "content", "docs"),
  path.join(process.cwd(), "content", "catalog"),
  path.join(process.cwd(), "content", "ui"),
];

const UI_FRAMEWORK_PREFIX = /^(base|radix)-/;

/**
 * Recursively collect all component/demo names referenced in .mdx files
 * via <ComponentPreview name="..."> and <ComponentInstallation name="..."> tags.
 * Returns a Set of allowed registry item names.
 */
async function collectDocumentedNames(): Promise<Set<string>> {
  const allowedNames = new Set<string>();

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith(".mdx")) {
        const content = await fs.readFile(fullPath, "utf-8");
        // Match both <ComponentPreview name="..."> and <ComponentInstallation name="...">
        const matches = content.matchAll(
          /<Component(?:Preview|Installation)\s+name=["']([^"']+)["']/g
        );
        for (const match of matches) {
          allowedNames.add(match[1]!);
        }
      }
    }
  }

  for (const contentPath of CONTENT_MDX_PATHS) {
    await walk(contentPath);
  }

  for (const name of [...allowedNames]) {
    allowedNames.add(`demo-${name}`);
    allowedNames.add(`radix-${name}`);
    allowedNames.add(`demo-radix-${name}`);
    allowedNames.add(`base-${name}`);
    allowedNames.add(`demo-base-${name}`);
  }

  return allowedNames;
}

interface RegistryItemFile {
  path: string;
  target?: string;
  type?: string;
}

interface RegistryItem {
  dependencies?: string[];
  description?: string;
  devDependencies?: string[];
  files?: RegistryItemFile[];
  meta?: {
    demoProps?: Record<string, Record<string, unknown>>;
    keywords?: string[];
    releaseDate?: string;
    inspiration?: {
      type: "inspired" | "reimplemented";
      label: string;
      stack?: string;
      url?: string;
    };
  };
  name: string;
  registryDependencies?: string[];
  type: string;
}

function inferSyntheticDemoTarget(item: RegistryItem): string {
  const target = item.files?.[0]?.target;
  if (target?.startsWith("components/sora-ui/")) {
    const rest = target.slice("components/sora-ui/".length);
    return `components/sora-ui/demo/${rest}`;
  }
  return `components/sora-ui/demo/${item.name}.tsx`;
}

function inferSyntheticDemoPath(item: RegistryItem): string {
  const sourcePath = item.files?.[0]?.path ?? "";
  if (sourcePath.includes("/ui/")) {
    return sourcePath.replace("/ui/", "/demo/ui/");
  }
  if (sourcePath.includes("/primitives/")) {
    return sourcePath.replace("/primitives/", "/demo/primitives/");
  }
  if (sourcePath.includes("/components/")) {
    return sourcePath.replace("/components/", "/demo/components/");
  }
  return `registry/demo/${item.name}/index.tsx`;
}

const REGISTRY_JSON_PATH = path.join(
  process.cwd(),
  "public",
  "r",
  "registry.json"
);

/** www-only catalog previews — not included in shadcn install bundles. */
const CATALOG_PREVIEW_IMPORT_OVERRIDES: Record<string, string> = {
  "scroll-gallery": "@/components/catalog/scroll-gallery-catalog-preview",
  "demo-scroll-gallery": "@/components/catalog/scroll-gallery-catalog-preview",
};

function resolveCatalogPreviewPath(
  itemName: string,
  defaultPath: string
): string {
  return CATALOG_PREVIEW_IMPORT_OVERRIDES[itemName] ?? defaultPath;
}

function rewriteRegistryModulePath(content: string): string {
  const rest = content.slice("@/registry/".length);
  if (rest.startsWith("lib/") || rest.startsWith("hooks/")) {
    return `@/${rest}`;
  }

  const demoPrefixes = ["demo/ui/", "demo/primitives/", "demo/components/"];
  for (const prefix of demoPrefixes) {
    if (rest.startsWith(prefix)) {
      return `@/components/sora-ui/demo/${rest.slice(prefix.length)}`;
    }
  }

  const standardPrefixes = ["ui/", "primitives/", "components/"];
  for (const prefix of standardPrefixes) {
    if (rest.startsWith(prefix)) {
      return `@/components/sora-ui/${rest.slice(prefix.length)}`;
    }
  }

  return `@/components/sora-ui/${rest}`;
}

/**
 * Replace registry paths with component paths.
 * @param inputStr - The input string to process.
 * @returns The processed string with registry paths replaced.
 */
function replaceRegistryPaths(inputStr: string): string {
  return inputStr.replace(/(['"])([\s\S]*?)\1/g, (match, quote, content) => {
    if (content.startsWith("@/registry/")) {
      return `${quote}${rewriteRegistryModulePath(content)}${quote}`;
    }
    if (content.startsWith("@workspace/ui/")) {
      const rest = content.slice("@workspace/ui/".length);
      return `${quote}@/${rest}${quote}`;
    }
    return match;
  });
}

const SHADCN_BUILTIN_REGISTRY_DEPS = new Set(["utils"]);

function normalizeRegistryDependencyName(dependency: string): string {
  if (dependency.startsWith("@soralabs/")) {
    return dependency.slice("@soralabs/".length);
  }

  return dependency;
}

const BASE_PREFIX_RE = /^base-/;
const RADIX_PREFIX_RE = /^radix-/;

/** Scope Sora registry deps so the CLI resolves them from @soralabs, not ui.shadcn.com. */
function scopeRegistryDependency(
  dependency: string,
  soraRegistryNames: Set<string>,
  sourceItem?: RegistryItem
): string {
  if (dependency.startsWith("@soralabs/")) {
    return dependency;
  }
  if (SHADCN_BUILTIN_REGISTRY_DEPS.has(dependency)) {
    return dependency;
  }
  const normalized = normalizeRegistryDependencyName(dependency);

  // If source item is Radix, prefer Radix dependency if available
  const isSourceRadix =
    sourceItem?.name?.startsWith("radix-") ||
    sourceItem?.files?.some((f) => f.path?.includes("/ui/radix/"));

  if (isSourceRadix) {
    const cleanDep = normalized.replace(RADIX_PREFIX_RE, "");
    const radixVariant = `radix-${cleanDep}`;
    if (soraRegistryNames.has(radixVariant)) {
      return `@soralabs/${radixVariant}`;
    }
  }

  // If source item is Base UI, prefer Base dependency if available
  const isSourceBase =
    sourceItem?.name?.startsWith("base-") ||
    sourceItem?.files?.some((f) => f.path?.includes("/ui/base/"));

  if (isSourceBase) {
    const cleanDep = normalized.replace(BASE_PREFIX_RE, "");
    const baseVariant = `base-${cleanDep}`;
    if (soraRegistryNames.has(baseVariant)) {
      return `@soralabs/${baseVariant}`;
    }
    if (soraRegistryNames.has(cleanDep)) {
      return `@soralabs/${cleanDep}`;
    }
  }

  if (soraRegistryNames.has(normalized)) {
    return `@soralabs/${normalized}`;
  }
  return dependency;
}

function scopeRegistryDependencies(
  item: RegistryItem,
  soraRegistryNames: Set<string>
): RegistryItem {
  if (!item.registryDependencies?.length) {
    return item;
  }

  return {
    ...item,
    registryDependencies: item.registryDependencies.map((dependency) =>
      scopeRegistryDependency(dependency, soraRegistryNames, item)
    ),
  };
}

function collectTransitiveRegistryDependencyNames(
  items: RegistryItem[],
  seedNames: Set<string>
): Set<string> {
  const itemByName = new Map(items.map((item) => [item.name, item]));
  const resolvedNames = new Set(seedNames);
  let changed = true;

  while (changed) {
    changed = false;

    for (const name of resolvedNames) {
      const item = itemByName.get(name);
      if (!item?.registryDependencies?.length) {
        continue;
      }

      for (const dependency of item.registryDependencies) {
        const normalizedName = normalizeRegistryDependencyName(dependency);
        if (!resolvedNames.has(normalizedName)) {
          resolvedNames.add(normalizedName);
          changed = true;
        }
      }
    }
  }

  return resolvedNames;
}

/**
 * Function to build the merged registry.json file.
 * It searches for all registry-item.json files in the registry directory,
 * removes the $schema property, and merges them into the base registry.json items array.
 */
async function buildRegistryFile() {
  const registryJsonContent = await fs.readFile(REGISTRY_JSON_PATH, "utf-8");
  const registryData = JSON.parse(registryJsonContent);
  const registryFolderPath = path.join(process.cwd(), "registry");
  const newItems = await getRegistryItemsFromFolder(registryFolderPath);

  // Collect all names referenced in docs
  const documentedNames = await collectDocumentedNames();

  const documentedItems = newItems.filter((item) => {
    if (item.name.startsWith("primitives-")) {
      return false;
    }

    return documentedNames.has(item.name);
  });

  // Icons live under registry/icons/* and are surfaced through the /icons
  // gallery rather than MDX docs, so seed them (the icons-icon engine is
  // pulled in transitively) to keep them in the published registry.
  const iconSeedNames = new Set(documentedItems.map((item) => item.name));
  for (const item of newItems) {
    if (item.name.startsWith("icons-")) {
      iconSeedNames.add(item.name);
    }
  }

  const publishedNames = collectTransitiveRegistryDependencyNames(
    newItems,
    iconSeedNames
  );

  const filteredItems = newItems.filter((item) => {
    // Publish internal primitives (primitives-*) only when they're a required
    // transitive dependency of a documented/icon item (present in
    // publishedNames) — e.g. icons-icon → primitives-animate-slot. Otherwise
    // they stay internal and out of the public registry.
    if (!publishedNames.has(item.name)) {
      if (!item.name.startsWith("primitives-")) {
        console.log(`⏭️  Skipping undocumented registry item: ${item.name}`);
      }
      return false;
    }

    if (!documentedNames.has(item.name)) {
      console.log(`📦 Including transitive registry dependency: ${item.name}`);
    }

    return true;
  });

  const soraRegistryNames = new Set(
    newItems.map((item: RegistryItem) => item.name)
  );

  registryData.items = [
    {
      name: "index",
      type: "registry:style",
      dependencies: [
        "tw-animate-css",
        "class-variance-authority",
        "lucide-react",
      ],
      registryDependencies: ["utils"],
      cssVars: {},
      files: [],
    },
    ...filteredItems.map((item: RegistryItem) =>
      scopeRegistryDependencies(item, soraRegistryNames)
    ),
  ];

  await fs.writeFile(REGISTRY_JSON_PATH, JSON.stringify(registryData, null, 2));
}

/**
 * Recursively search for registry-item.json files in a given directory.
 * @param dir - Directory to search in.
 * @returns An array of registry item objects.
 */
async function getRegistryItemsFromFolder(dir: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = [];
  // Read directory entries with file type information
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Define the expected path of registry-item.json in the current directory
      const registryItemPath = path.join(fullPath, "registry-item.json");
      try {
        // Check if registry-item.json exists in this directory
        await fs.access(registryItemPath);
        // Read and parse the registry item file
        const content = await fs.readFile(registryItemPath, "utf-8");
        const item = JSON.parse(content);
        // Remove the $schema property if it exists
        if (item.$schema) {
          item.$schema = undefined;
        }
        items.push(item);
      } catch {
        // If registry-item.json does not exist in the current directory,
        // recursively search in the subdirectories
        const subItems = await getRegistryItemsFromFolder(fullPath);
        items.push(...subItems);
      }
    }
  }
  return items;
}

/**
 * Function to build the registry index file.
 * This function reads the registry.json items and builds a dynamic index file.
 */
async function buildRegistryIndex() {
  const registryJsonContent = await fs.readFile(REGISTRY_JSON_PATH, "utf-8");
  const registryItems = JSON.parse(registryJsonContent);
  const registryFolderPath = path.join(process.cwd(), "registry");
  const allItemsFromFolder =
    await getRegistryItemsFromFolder(registryFolderPath);

  // Collect documented names, then expand to include transitive
  // registryDependencies (e.g. shared hooks) so the docs UI (File Structure,
  // manual install tab) can look them up in `index` too — not just the item
  // that's directly referenced in an .mdx page.
  const documentedNames = await collectDocumentedNames();
  // Seed icons-* so the /icons gallery can read them from the index
  // (they're not referenced in MDX). Transitive deps pull in icons-icon.
  const includedSeedNames = new Set(documentedNames);
  for (const item of allItemsFromFolder) {
    if (item.name.startsWith("icons-")) {
      includedSeedNames.add(item.name);
    }
  }
  const includedNames = collectTransitiveRegistryDependencyNames(
    allItemsFromFolder,
    includedSeedNames
  );

  let index = `/** biome-ignore-all lint: Autogenerated file */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
// This file is autogenerated by scripts/build-registry.mts
// Do not edit this file directly.
import * as React from "react";

const PASCAL_CASE_RE = /^[A-Z]/;

export const index: Record<string, any> = {`;

  let previewIndex = `/** biome-ignore-all lint: Autogenerated file */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
// This file is autogenerated by scripts/build-registry.mts
// Do not edit this file directly.
import * as React from "react";

const PASCAL_CASE_RE = /^[A-Z]/;

export const previewComponents: Record<string, any> = {`;

  // Remove duplicates: only keep the last item with a given name
  const uniqueItemsMap = new Map<string, (typeof registryItems.items)[0]>();
  // Public registry.json items (documented, non-primitive)
  for (const item of registryItems.items) {
    if (uniqueItemsMap.has(item.name)) {
      console.warn(
        `Duplicate item name detected: ${item.name}. Overwriting previous entry.`
      );
    }
    uniqueItemsMap.set(item.name, item);
  }
  // Primitives/icons and other registry-only items (for previews + install docs)
  for (const item of allItemsFromFolder) {
    uniqueItemsMap.set(item.name, item);
  }

  const physicalDemoNames = new Set(
    allItemsFromFolder
      .filter((item: RegistryItem) => item.name.startsWith("demo-"))
      .map((item: RegistryItem) => item.name)
  );

  const isCanonicalDemoForItem = (
    demoName: string,
    depName: string
  ): boolean => {
    const strippedDep = depName.replace(UI_FRAMEWORK_PREFIX, "");
    return (
      demoName === depName ||
      demoName === `demo-${depName}` ||
      demoName === `demo-${strippedDep}`
    );
  };

  const resolveDemoProps = (
    item: RegistryItem
  ): Record<string, Record<string, unknown>> => {
    const own = item?.meta?.demoProps;
    if (own && Object.keys(own).length > 0) {
      return own;
    }

    if (!item.name.startsWith("demo-")) {
      const demoItem = uniqueItemsMap.get(`demo-${item.name}`) as
        | RegistryItem
        | undefined;
      const fromDemo = demoItem?.meta?.demoProps;
      if (fromDemo && Object.keys(fromDemo).length > 0) {
        return fromDemo;
      }
    }

    for (const dep of item.registryDependencies ?? []) {
      if (isCanonicalDemoForItem(item.name, dep)) {
        const depItem = uniqueItemsMap.get(dep);
        const inherited = depItem?.meta?.demoProps;
        if (inherited && Object.keys(inherited).length > 0) {
          return inherited;
        }
      }
    }
    return {};
  };

  const appendIndexEntry = (
    item: RegistryItem,
    filesWithContent: {
      path: string;
      type: string;
      target: string;
      content: string;
    }[],
    options?: { componentPath?: string; codeOnly?: boolean }
  ) => {
    const componentPath = options?.componentPath ?? "";
    const demoPropsJson = JSON.stringify(resolveDemoProps(item));

    index += `
  "${item.name}": {
    name: ${JSON.stringify(item.name)},
    description: ${JSON.stringify(item.description ?? "")},
    type: "${item.type}",
    dependencies: ${JSON.stringify(item.dependencies)},
    devDependencies: ${JSON.stringify(item.devDependencies)},
    registryDependencies: ${JSON.stringify(item.registryDependencies)},
    files: ${JSON.stringify(filesWithContent, null, 2)},
    keywords: ${JSON.stringify(item.meta?.keywords ?? [])},
    releaseDate: ${JSON.stringify(item.meta?.releaseDate ?? null)},
    inspiration: ${JSON.stringify(item.meta?.inspiration ?? null)},
    component: ${
      options?.codeOnly || !componentPath
        ? "null"
        : `(function() {
      const LazyComp = React.lazy(async () => {
        const mod = await import("${componentPath}");
        const demoProps = ${demoPropsJson};
        const demoExportName = Object.keys(demoProps)[0];
        const pascalExportName = Object.keys(mod).find(
          (key) => typeof mod[key] === "function" && PASCAL_CASE_RE.test(key)
        );
        const functionExportName = Object.keys(mod).find(
          (key) => typeof mod[key] === "function"
        );
        const Comp =
          mod.default ||
          (demoExportName ? mod[demoExportName] : undefined) ||
          (pascalExportName ? mod[pascalExportName] : undefined) ||
          (functionExportName ? mod[functionExportName] : undefined);
        if (mod.animations) {
          (LazyComp as any).animations = mod.animations;
        }
        if (mod.supportedStaticAnimations) {
          (LazyComp as any).supportedStaticAnimations =
            mod.supportedStaticAnimations;
        }
        return { default: Comp };
      });
      LazyComp.demoProps = ${demoPropsJson};
      return LazyComp;
    })()`
    },
    command: '@soralabs/${item.name}',
  },`;
  };

  const appendPreviewEntry = (
    item: RegistryItem,
    options?: { componentPath?: string; codeOnly?: boolean }
  ) => {
    const componentPath = options?.componentPath ?? "";
    if (!componentPath || options?.codeOnly) {
      return;
    }

    previewIndex += `
  "${item.name}": React.lazy(async () => {
    const mod = await import("${componentPath}");
    const pascalExportName = Object.keys(mod).find(
      (key) => typeof mod[key] === "function" && PASCAL_CASE_RE.test(key)
    );
    const functionExportName = Object.keys(mod).find(
      (key) => typeof mod[key] === "function"
    );
    const Comp =
      mod.default ||
      (pascalExportName ? mod[pascalExportName] : undefined) ||
      (functionExportName ? mod[functionExportName] : undefined);
    return { default: Comp };
  }),`;
  };

  // Process only unique items
  for (const item of uniqueItemsMap.values()) {
    // Skip items without files
    if (!item.files) {
      continue;
    }
    // Skip items not referenced in any doc page or transitively depended on
    // (keep primitives as internal deps)
    if (
      !item.name.startsWith("primitives-") &&
      item.name !== "index" &&
      !includedNames.has(item.name)
    ) {
      continue;
    }

    console.log("Processing item:", item.name);
    const componentFile =
      item.files.find((file: RegistryItemFile) =>
        file.path?.endsWith("/index.tsx")
      ) ?? item.files[0];
    let componentPath = componentFile?.path ? `@/${componentFile.path}` : "";

    const demoName = `demo-${item.name}`;
    if (!item.name.startsWith("demo-") && physicalDemoNames.has(demoName)) {
      const demoItem = uniqueItemsMap.get(demoName) as RegistryItem | undefined;
      const demoComponentFile =
        demoItem?.files?.find((file) => file.path?.endsWith("/index.tsx")) ??
        demoItem?.files?.[0];
      if (demoComponentFile?.path) {
        componentPath = `@/${demoComponentFile.path}`;
      }
    }

    componentPath = resolveCatalogPreviewPath(item.name, componentPath);

    // Read files and add content preserving newlines
    const filesWithContent = await Promise.all(
      item.files.map(async (file: any) => {
        const filePath = typeof file === "string" ? file : file.path;
        const resolvedFilePath = path.resolve(filePath);

        try {
          // Read the file content (preserving newlines)
          const content = await fs.readFile(resolvedFilePath, "utf-8");
          const processedContent = replaceRegistryPaths(content).trim(); // Trim leading/trailing spaces

          return {
            path: filePath,
            type: file.type || "unknown",
            target: file.target || "",
            content: processedContent, // Keep original formatting (newlines will be \n in JSON)
          };
        } catch (error) {
          console.error(`Error reading file ${filePath}:`, error);
          return {
            path: filePath,
            type: file.type || "unknown",
            target: file.target || "",
            content: "",
          };
        }
      })
    );

    appendIndexEntry(item as RegistryItem, filesWithContent, {
      componentPath,
    });
    appendPreviewEntry(item as RegistryItem, { componentPath });
  }

  for (const item of uniqueItemsMap.values()) {
    const registryItem = item as RegistryItem;
    if (registryItem.name.startsWith("demo-")) {
      continue;
    }
    if (
      !registryItem.name.startsWith("primitives-") &&
      registryItem.name !== "index" &&
      !includedNames.has(registryItem.name)
    ) {
      continue;
    }

    const demoName = `demo-${registryItem.name}`;
    if (physicalDemoNames.has(demoName)) {
      continue;
    }

    const demoProps = resolveDemoProps(registryItem);
    if (Object.keys(demoProps).length === 0) {
      continue;
    }

    const target = registryItem.files?.[0]?.target;
    const generatedContent =
      target && generateUsageExampleFromTarget(target, demoProps);
    if (!generatedContent) {
      continue;
    }

    console.log(`📝 Generated usage example: ${demoName}`);

    appendIndexEntry(
      {
        name: demoName,
        description: `Usage example for ${registryItem.name}.`,
        type: registryItem.type,
        dependencies: registryItem.dependencies,
        devDependencies: registryItem.devDependencies,
        registryDependencies: [registryItem.name],
        meta: registryItem.meta,
        files: [
          {
            path: inferSyntheticDemoPath(registryItem),
            type: "registry:ui",
            target: inferSyntheticDemoTarget(registryItem),
          },
        ],
      },
      [
        {
          path: inferSyntheticDemoPath(registryItem),
          type: "registry:ui",
          target: inferSyntheticDemoTarget(registryItem),
          content: generatedContent,
        },
      ],
      { codeOnly: true }
    );
  }

  index += `
  }`;

  previewIndex += `
}`;

  // Remove the previous registry index file and write the new one.
  rimraf.sync(path.join(process.cwd(), "__registry__/index.tsx"));
  await fs.writeFile(path.join(process.cwd(), "__registry__/index.tsx"), index);

  // Write the lightweight preview-only registry.
  rimraf.sync(path.join(process.cwd(), "__registry__/preview.tsx"));
  await fs.writeFile(
    path.join(process.cwd(), "__registry__/preview.tsx"),
    previewIndex
  );
}

/**
 * Function to build the registry.
 * It clears the previous registry directory, builds the registry files,
 * and replaces specific path strings in the generated files.
 */
async function buildRegistry() {
  // 1. Ensure 'public/r' exists
  await fs.mkdir("public/r", { recursive: true });

  // 2. Remove everything except registry.json
  const entries = await fs.readdir("public/r");
  await Promise.all(
    entries.map(async (entry) => {
      if (entry === "registry.json") {
        return;
      }
      const entryPath = path.join("public/r", entry);
      await fs.rm(entryPath, { recursive: true, force: true });
    })
  );

  // 2. Build the registry using the shadcn build command
  await new Promise((resolve, reject) => {
    const process = exec(
      "bunx shadcn@latest build public/r/registry.json --output ./public/r/"
    );

    process.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });

  // 3. Replace `@/registry/...` path strings in published JSON (see replaceRegistryPaths)
  const files = await fs.readdir(path.join(process.cwd(), "public/r"));

  await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(
        path.join(process.cwd(), "public/r", file),
        "utf-8"
      );

      const registryItem = JSON.parse(content);

      // Replace `@/registry` in file contents
      registryItem.files = registryItem.files?.map((file: any) => {
        if (
          file.content?.includes("@/registry") ||
          file.content?.includes("@workspace/ui/")
        ) {
          file.content = replaceRegistryPaths(file.content);
        }
        return file;
      });

      // Write the updated file back to disk
      await fs.writeFile(
        path.join(process.cwd(), "public/r", file),
        JSON.stringify(registryItem, null, 2)
      );
    })
  );
}

// Execute the build process in the following order:
// 1. Build the merged registry.json file with new items from registry-item.json files.
// 2. Build the registry index.
// 3. Build the registry.
try {
  console.log("🔨 Building merged registry file...");
  await buildRegistryFile();
  console.log("🗂️ Building registry/__index__.tsx...");
  await buildRegistryIndex();
  console.log("🏗️ Building registry...");
  await buildRegistry();
} catch (error) {
  console.error(error);
  process.exit(1);
}
