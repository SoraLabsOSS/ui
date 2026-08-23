import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { addRegistryItems } from "shadcn/registry";
import {
  assertRegistryCatalog,
  assertRegistryItem,
} from "./validate-registry-schema.js";

const WWW_ROOT = process.cwd();
const PUBLIC_R = path.join(WWW_ROOT, "public", "r");
const SORA_REGISTRY = "@soralabs";
const OVERWRITE_SENTINEL = "SORA_REGISTRY_OVERWRITE_FALSE_SENTINEL";
const REGISTRY_JSON_NAME = /^[a-z0-9][a-z0-9.-]*\.json$/i;
const NEWLINE = /\r?\n/;
const ITEM_LIST_SPLIT = /[,\s]+/;
const SOURCE_FILE_EXT = /\.(tsx|ts|jsx|js)$/;
const SITE_ONLY_ALIAS =
  /@\/(?:components\/catalog|lib\/catalog|lib\/scroll|registry|app)\//;
const NODE_PROCESS = /\bprocess\./;
const COVERAGE_BUCKETS = [
  "ui-base",
  "ui-radix",
  "primitive",
  "hook",
  "lib",
  "icon",
] as const;

type CoverageBucket = (typeof COVERAGE_BUCKETS)[number] | "demo";

interface RegistryFileEntry {
  content?: string;
  path?: string;
  target?: string;
  type?: string;
}

interface RegistryJsonItem {
  dependencies?: string[];
  files?: RegistryFileEntry[];
  items?: CatalogItem[];
  name?: string;
  registryDependencies?: string[];
  type?: string;
}

interface CatalogItem {
  files?: Array<{ path?: string; target?: string }>;
  name: string;
  registryDependencies?: string[];
  type: string;
}

interface ExpectedInstall {
  fingerprint: string;
  item: string;
  target: string;
}

interface LocalRegistry {
  close: () => Promise<void>;
  url: string;
}

async function validateFileEntry(
  file: RegistryFileEntry,
  fileName: string
): Promise<number> {
  let errors = 0;
  if (!file.path) {
    console.error(`❌ Missing path in file entry of ${fileName}`);
    return 1;
  }

  const diskPath = path.join(WWW_ROOT, file.path);
  try {
    await fs.access(diskPath);
  } catch {
    console.error(
      `❌ File path does not exist on disk: ${file.path} (referenced by ${fileName})`
    );
    errors++;
  }

  if (file.content && !file.target) {
    console.error(
      `❌ Missing files[].target in ${fileName} (${file.path}) — shadcn add cannot place this file`
    );
    errors++;
  }

  if (file.content) {
    if (file.content.includes("@/registry/")) {
      console.error(
        `❌ Untranslated "@/registry/" found in content of ${fileName} (${file.path})`
      );
      errors++;
    }
    if (file.content.includes("@workspace/ui/")) {
      console.error(
        `❌ Untranslated "@workspace/ui/" found in content of ${fileName} (${file.path})`
      );
      errors++;
    }
  }

  return errors;
}

async function validateSingleJsonFile(fileName: string): Promise<number> {
  const filePath = path.join(PUBLIC_R, fileName);
  const content = await fs.readFile(filePath, "utf-8");
  let parsed: RegistryJsonItem;

  try {
    parsed = JSON.parse(content) as RegistryJsonItem;
  } catch (error) {
    console.error(`❌ Invalid JSON in ${fileName}:`, error);
    return 1;
  }

  try {
    if (fileName === "registry.json") {
      assertRegistryCatalog(parsed, fileName);
      return 0;
    }
    assertRegistryItem(parsed, fileName);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 1;
  }

  let errors = 0;
  if (parsed.files && Array.isArray(parsed.files)) {
    for (const file of parsed.files) {
      errors += await validateFileEntry(file, fileName);
    }
  }

  return errors;
}

async function checkJsonFiles(): Promise<void> {
  console.log("🔍 [1/4] Checking public/r JSON files validity...");
  const files = await fs.readdir(PUBLIC_R);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));
  console.log(`Found ${jsonFiles.length} registry JSON files in public/r/`);

  let totalErrors = 0;
  for (const file of jsonFiles) {
    totalErrors += await validateSingleJsonFile(file);
  }

  if (totalErrors > 0) {
    throw new Error(`Integrity check failed with ${totalErrors} errors`);
  }
  console.log(
    "✅ All JSON files in public/r are valid and paths exist on disk!"
  );
}

function startLocalRegistry(rootDir: string): Promise<LocalRegistry> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const pathname = decodeURIComponent(
        new URL(req.url ?? "/", "http://127.0.0.1").pathname
      );
      const fileName = path.posix.basename(pathname);
      if (!REGISTRY_JSON_NAME.test(fileName)) {
        res.writeHead(404).end();
        return;
      }

      try {
        const json = readFileSync(path.join(rootDir, fileName));
        res.writeHead(200, { "content-type": "application/json" }).end(json);
      } catch {
        res.writeHead(404).end();
      }
    });

    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address() as AddressInfo | null;
      if (!address) {
        reject(new Error("Failed to bind local registry"));
        return;
      }
      resolve({
        url: `http://127.0.0.1:${address.port}/{name}.json`,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((error) => {
              if (error) {
                closeReject(error);
                return;
              }
              closeResolve();
            });
          }),
      });
    });
  });
}

function toAddArgument(name: string): string {
  return name.startsWith("@") ? name : `${SORA_REGISTRY}/${name}`;
}

function itemBareName(item: string): string {
  return item.startsWith(`${SORA_REGISTRY}/`)
    ? item.slice(`${SORA_REGISTRY}/`.length)
    : item;
}

function publishedFileName(dep: string): string {
  return `${itemBareName(dep)}.json`;
}

function coverageBucket(item: CatalogItem): CoverageBucket | null {
  if (item.type === "registry:style" || !item.name) {
    return null;
  }
  if (!item.files?.some((file) => file.target)) {
    return null;
  }

  const sourcePath = item.files[0]?.path ?? "";
  if (item.name.startsWith("demo-")) {
    return "demo";
  }
  if (item.type === "registry:hook" || item.name.startsWith("hooks-")) {
    return "hook";
  }
  if (item.type === "registry:lib" || item.name.startsWith("lib-")) {
    return "lib";
  }
  if (item.name.startsWith("icons-") || sourcePath.includes("/icons/")) {
    return "icon";
  }
  if (sourcePath.includes("/ui/base/") || item.name.startsWith("base-")) {
    return "ui-base";
  }
  if (sourcePath.includes("/ui/radix/") || item.name.startsWith("radix-")) {
    return "ui-radix";
  }
  return "primitive";
}

function coverageScore(item: CatalogItem): number {
  const deps = item.registryDependencies ?? [];
  const namespaced = deps.filter((dep) => dep.startsWith(`${SORA_REGISTRY}/`));
  return namespaced.length * 10 + deps.length;
}

function pickCoverageItem(items: CatalogItem[]): CatalogItem | undefined {
  return items.toSorted(
    (left, right) =>
      coverageScore(right) - coverageScore(left) ||
      left.name.localeCompare(right.name)
  )[0];
}

const publishedItemCache = new Map<string, RegistryJsonItem>();

async function loadPublishedItem(name: string): Promise<RegistryJsonItem> {
  const fileName = publishedFileName(name);
  const cached = publishedItemCache.get(fileName);
  if (cached) {
    return cached;
  }
  const published = await readPublishedItem(fileName);
  publishedItemCache.set(fileName, published);
  return published;
}

function isConsumerPortableSource(content: string): boolean {
  return !(SITE_ONLY_ALIAS.test(content) || NODE_PROCESS.test(content));
}

async function isConsumerPortableGraph(
  name: string,
  seen = new Set<string>()
): Promise<boolean> {
  const bare = itemBareName(name);
  if (bare === "utils") {
    return true;
  }
  if (seen.has(bare)) {
    return true;
  }
  seen.add(bare);

  const published = await loadPublishedItem(bare);
  const content = (published.files ?? [])
    .map((file) => file.content ?? "")
    .join("\n");
  if (!isConsumerPortableSource(content)) {
    return false;
  }

  for (const dependency of published.registryDependencies ?? []) {
    if (!(await isConsumerPortableGraph(dependency, seen))) {
      return false;
    }
  }
  return true;
}

async function portableCatalogItems(
  items: CatalogItem[]
): Promise<CatalogItem[]> {
  const portable: CatalogItem[] = [];
  for (const item of items) {
    if (await isConsumerPortableGraph(item.name)) {
      portable.push(item);
    }
  }
  return portable;
}

async function loadCatalog(): Promise<CatalogItem[]> {
  const parsed = JSON.parse(
    await fs.readFile(path.join(PUBLIC_R, "registry.json"), "utf-8")
  ) as RegistryJsonItem;
  return parsed.items ?? [];
}

/** Catalog-driven coverage: one portable item per bucket by default.
 *  SORA_REGISTRY_TEST_ALL=1 installs every catalog item.
 *  SORA_REGISTRY_TEST_ITEMS=base-checkbox,demo-checkbox pins an explicit list.
 */
function parseRequestedItems(): { all: boolean; names: string[] | null } {
  const all = process.env.SORA_REGISTRY_TEST_ALL === "1";
  const raw = process.env.SORA_REGISTRY_TEST_ITEMS?.trim();
  const names = raw
    ? raw.split(ITEM_LIST_SPLIT).filter((name) => name.length > 0)
    : null;
  return { all, names };
}

async function selectItemsToAdd(catalog: CatalogItem[]): Promise<string[]> {
  const installable = catalog.filter((item) => coverageBucket(item) !== null);
  const { all, names } = parseRequestedItems();
  const byName = new Map(installable.map((item) => [item.name, item]));

  if (names) {
    const missing = names
      .map(itemBareName)
      .filter((name) => name !== "utils" && !byName.has(name));
    if (missing.length > 0) {
      throw new Error(
        `SORA_REGISTRY_TEST_ITEMS not in catalog: ${missing.join(", ")}`
      );
    }
    return names.map(toAddArgument);
  }

  if (all) {
    return installable.map((item) => toAddArgument(item.name));
  }

  const portable = await portableCatalogItems(installable);
  const byBucket = new Map<CoverageBucket, CatalogItem[]>();
  for (const item of portable) {
    const bucket = coverageBucket(item);
    if (!bucket) {
      continue;
    }
    const bucketItems = byBucket.get(bucket) ?? [];
    bucketItems.push(item);
    byBucket.set(bucket, bucketItems);
  }

  const selected: CatalogItem[] = [];
  for (const bucket of COVERAGE_BUCKETS) {
    const picked = pickCoverageItem(byBucket.get(bucket) ?? []);
    if (picked) {
      selected.push(picked);
    }
  }

  const selectedNames = new Set(
    selected.map((item) => toAddArgument(item.name))
  );
  const demos = byBucket.get("demo") ?? [];
  const matchingDemo =
    demos.find((demo) =>
      (demo.registryDependencies ?? []).some((dep) => selectedNames.has(dep))
    ) ?? pickCoverageItem(demos);
  if (matchingDemo) {
    selected.push(matchingDemo);
  }

  if (selected.length === 0) {
    throw new Error(
      "No consumer-portable registry items found to sample. Set SORA_REGISTRY_TEST_ITEMS to override."
    );
  }

  return selected.map((item) => toAddArgument(item.name));
}

function contentFingerprint(content: string): string {
  const lines = content
    .split(NEWLINE)
    .map((line) => line.trim())
    .filter((line) => line.length > 16);

  const preferred = lines.find(
    (line) =>
      line.startsWith("export function ") ||
      line.startsWith("export const ") ||
      line.startsWith("export {") ||
      line.includes("data-slot=")
  );
  if (preferred) {
    return preferred.slice(0, 120);
  }

  const body = lines.find(
    (line) =>
      !(
        line.startsWith("import ") ||
        line === '"use client";' ||
        line.startsWith("/*") ||
        line.startsWith("*") ||
        line.startsWith("//")
      )
  );
  if (!body) {
    throw new Error("Could not derive a content fingerprint");
  }
  return body.slice(0, 120);
}

async function readPublishedItem(fileName: string): Promise<RegistryJsonItem> {
  return JSON.parse(
    await fs.readFile(path.join(PUBLIC_R, fileName), "utf-8")
  ) as RegistryJsonItem;
}

async function collectInstallGraph(items: readonly string[]): Promise<{
  expectedFiles: ExpectedInstall[];
  npmDependencies: Record<string, string>;
}> {
  const expectedFiles: ExpectedInstall[] = [];
  const npmDependencies: Record<string, string> = {
    react: "^19.2.0",
    "react-dom": "^19.2.0",
    clsx: "^2.1.1",
    "tailwind-merge": "^3.0.2",
  };
  const seen = new Set<string>();
  const queue = [...items];

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item || seen.has(item)) {
      continue;
    }
    seen.add(item);

    if (item === "utils") {
      expectedFiles.push({
        item,
        target: path.join("lib", "utils.ts"),
        fingerprint: "twMerge",
      });
      continue;
    }

    if (!item.startsWith(`${SORA_REGISTRY}/`)) {
      throw new Error(`Unexpected registry dependency "${item}"`);
    }

    const published = await readPublishedItem(publishedFileName(item));
    for (const dependency of published.dependencies ?? []) {
      npmDependencies[dependency] = "*";
    }
    for (const file of published.files ?? []) {
      if (!(file.target && file.content)) {
        throw new Error(
          `${item} is missing files[].target/content — addRegistryItems cannot place it`
        );
      }
      expectedFiles.push({
        item,
        target: file.target,
        fingerprint: contentFingerprint(file.content),
      });
    }
    queue.push(...(published.registryDependencies ?? []));
  }

  return { expectedFiles, npmDependencies };
}

function toAliasSpecifier(target: string): string {
  const posix = target.replaceAll("\\", "/");
  const withoutExt = posix.replace(SOURCE_FILE_EXT, "");
  return `@/${withoutExt}`;
}

function generateSmokeModule(expectedFiles: ExpectedInstall[]): string {
  const specifiers = [
    ...new Set(
      expectedFiles
        .filter((file) => file.item !== "utils")
        .filter((file) => SOURCE_FILE_EXT.test(file.target))
        .map((file) => toAliasSpecifier(file.target))
    ),
  ].toSorted();

  const imports = specifiers.map(
    (specifier) => `import ${JSON.stringify(specifier)};`
  );

  return `import React from "react";
${imports.join("\n")}

export default function App() {
  return null;
}
`;
}

function consumerConfig(sandboxDir: string, registryUrl: string) {
  return {
    style: "new-york",
    rsc: true,
    tsx: true,
    tailwind: {
      config: "",
      css: "app/globals.css",
      baseColor: "neutral",
      cssVariables: true,
    },
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
    },
    registries: {
      [SORA_REGISTRY]: registryUrl,
    },
    resolvedPaths: {
      cwd: sandboxDir,
      tailwindConfig: "",
      tailwindCss: path.join(sandboxDir, "app", "globals.css"),
      utils: path.join(sandboxDir, "lib", "utils.ts"),
      components: path.join(sandboxDir, "components"),
      lib: path.join(sandboxDir, "lib"),
      hooks: path.join(sandboxDir, "hooks"),
      ui: path.join(sandboxDir, "components", "ui"),
    },
  };
}

async function scaffoldConsumer(
  sandboxDir: string,
  registryUrl: string,
  npmDependencies: Record<string, string>
): Promise<void> {
  const config = consumerConfig(sandboxDir, registryUrl);

  await fs.writeFile(
    path.join(sandboxDir, "package.json"),
    `${JSON.stringify(
      {
        name: "consumer-app",
        private: true,
        type: "module",
        dependencies: npmDependencies,
        devDependencies: {
          tailwindcss: "^4.1.13",
        },
      },
      null,
      2
    )}\n`
  );

  await fs.writeFile(
    path.join(sandboxDir, "components.json"),
    `${JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        style: config.style,
        rsc: config.rsc,
        tsx: config.tsx,
        tailwind: config.tailwind,
        aliases: config.aliases,
        registries: config.registries,
      },
      null,
      2
    )}\n`
  );

  await fs.writeFile(
    path.join(sandboxDir, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["DOM", "DOM.Iterable", "ES2022"],
          module: "ESNext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
          ignoreDeprecations: "6.0",
          baseUrl: ".",
          paths: {
            "@/*": ["./*"],
            clsx: ["./stubs/clsx.ts"],
            "tailwind-merge": ["./stubs/tailwind-merge.ts"],
          },
        },
        include: ["**/*.ts", "**/*.tsx"],
      },
      null,
      2
    )}\n`
  );

  await fs.mkdir(path.join(sandboxDir, "app"), { recursive: true });
  await fs.mkdir(path.join(sandboxDir, "lib"), { recursive: true });
  await fs.mkdir(path.join(sandboxDir, "hooks"), { recursive: true });
  await fs.mkdir(path.join(sandboxDir, "components"), { recursive: true });
  await fs.mkdir(path.join(sandboxDir, "stubs"), { recursive: true });

  await fs.writeFile(
    path.join(sandboxDir, "app", "globals.css"),
    '@import "tailwindcss";\n'
  );
  await fs.writeFile(
    path.join(sandboxDir, "stubs", "clsx.ts"),
    `export type ClassValue = unknown;
export function clsx(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}
`
  );
  await fs.writeFile(
    path.join(sandboxDir, "stubs", "tailwind-merge.ts"),
    `export function twMerge(...classLists: Array<string | undefined>): string {
  return classLists.filter(Boolean).join(" ");
}
`
  );
}

async function assertInstalledFiles(
  sandboxDir: string,
  expectedFiles: ExpectedInstall[]
): Promise<void> {
  const missing: string[] = [];
  const mismatched: string[] = [];

  for (const expected of expectedFiles) {
    const installedPath = path.join(sandboxDir, expected.target);
    try {
      const installed = await fs.readFile(installedPath, "utf-8");
      if (!installed.includes(expected.fingerprint)) {
        mismatched.push(
          `${expected.target} (from ${expected.item}) missing ${JSON.stringify(expected.fingerprint)}`
        );
      }
    } catch {
      missing.push(`${expected.target} (from ${expected.item})`);
    }
  }

  if (missing.length > 0 || mismatched.length > 0) {
    throw new Error(
      [
        "addRegistryItems did not install the published files at their targets.",
        missing.length > 0 ? `Missing:\n  - ${missing.join("\n  - ")}` : "",
        mismatched.length > 0
          ? `Content mismatch:\n  - ${mismatched.join("\n  - ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  try {
    await fs.access(path.join(sandboxDir, "registry"));
    throw new Error(
      "Install wrote a source `registry/` tree into the consumer — targets were ignored"
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

async function assertOverwriteFalseSkips(
  sandboxDir: string,
  itemsToAdd: readonly string[],
  expectedFiles: ExpectedInstall[],
  config: ReturnType<typeof consumerConfig>
): Promise<void> {
  const probe = expectedFiles.find((file) => file.item !== "utils");
  if (!probe) {
    throw new Error("No Sora file available to test overwrite: false");
  }

  const probePath = path.join(sandboxDir, probe.target);
  await fs.writeFile(probePath, `export const ${OVERWRITE_SENTINEL} = true;\n`);

  await addRegistryItems([...itemsToAdd], {
    cwd: sandboxDir,
    config,
    overwrite: false,
    silent: true,
    skipFonts: true,
  });

  const after = await fs.readFile(probePath, "utf-8");
  if (!after.includes(OVERWRITE_SENTINEL)) {
    throw new Error(
      `overwrite: false overwrote ${probe.target}; existing consumer files must be skipped`
    );
  }

  const published = await readPublishedItem(publishedFileName(probe.item));
  const original = published.files?.find(
    (file) => file.target === probe.target
  )?.content;
  if (!original) {
    throw new Error(`Could not restore ${probe.target} after overwrite test`);
  }
  await fs.writeFile(probePath, original);
}

async function installWithAddRegistryItems(
  sandboxDir: string,
  itemsToAdd: readonly string[],
  config: ReturnType<typeof consumerConfig>
): Promise<void> {
  try {
    await addRegistryItems([...itemsToAdd], {
      cwd: sandboxDir,
      config,
      overwrite: false,
      silent: true,
      skipFonts: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `addRegistryItems failed (local @soralabs registry + shadcn utils):\n${message}`,
      { cause: error }
    );
  }
}

function runConsumerTsc(sandboxDir: string): void {
  const tscScript = path.resolve(
    WWW_ROOT,
    "../../node_modules/typescript/bin/tsc"
  );
  try {
    execFileSync(
      process.execPath,
      [tscScript, "--noEmit", "-p", path.join(sandboxDir, "tsconfig.json")],
      { stdio: "pipe" }
    );
  } catch (error) {
    const stdout =
      error && typeof error === "object" && "stdout" in error
        ? String(error.stdout)
        : "";
    const stderr =
      error && typeof error === "object" && "stderr" in error
        ? String(error.stderr)
        : "";
    throw new Error(
      `Consumer tsc failed:\n${stdout}${stderr}`.trim() ||
        (error instanceof Error ? error.message : String(error))
    );
  }
}

async function testConsumerInstallation(): Promise<void> {
  console.log(
    "\n🧪 [2/4] Installing via addRegistryItems into an isolated consumer sandbox..."
  );
  const sandboxDir = path.join(WWW_ROOT, "node_modules", ".test-consumer");
  await fs.rm(sandboxDir, { recursive: true, force: true });
  await fs.mkdir(sandboxDir, { recursive: true });

  const catalog = await loadCatalog();
  const itemsToAdd = await selectItemsToAdd(catalog);
  console.log(`Coverage sample: ${itemsToAdd.join(", ")}`);

  const registry = await startLocalRegistry(PUBLIC_R);
  let passed = false;
  try {
    const { expectedFiles, npmDependencies } =
      await collectInstallGraph(itemsToAdd);
    const config = consumerConfig(sandboxDir, registry.url);

    await scaffoldConsumer(sandboxDir, registry.url, npmDependencies);
    await installWithAddRegistryItems(sandboxDir, itemsToAdd, config);
    await assertInstalledFiles(sandboxDir, expectedFiles);
    await assertOverwriteFalseSkips(
      sandboxDir,
      itemsToAdd,
      expectedFiles,
      config
    );
    console.log(
      `✅ addRegistryItems placed ${expectedFiles.length} files at published targets (overwrite: false skips existing).`
    );

    await fs.writeFile(
      path.join(sandboxDir, "app.tsx"),
      generateSmokeModule(expectedFiles)
    );

    console.log(
      "\n📦 [3/4] Typechecking installed components with TypeScript in consumer sandbox..."
    );
    runConsumerTsc(sandboxDir);
    console.log("✅ Consumer TypeScript check PASSED with 0 errors!");
    passed = true;
  } finally {
    await registry.close();
    if (passed) {
      await fs.rm(sandboxDir, { recursive: true, force: true });
      console.log("🧹 Cleaned up test sandbox.");
    } else {
      console.error(`⚠️ Consumer sandbox left for inspection: ${sandboxDir}`);
    }
  }
}

function verifyMonorepoBuild(): void {
  console.log("\n🌐 [4/4] Verifying monorepo typecheck...");
  execFileSync(process.execPath, ["run", "check-types"], {
    cwd: path.resolve(WWW_ROOT, "../.."),
    stdio: "inherit",
  });
  console.log("✅ Monorepo TypeScript check PASSED with 0 errors!");
}

async function runIntegrityCheck(): Promise<void> {
  await checkJsonFiles();
  await testConsumerInstallation();
  verifyMonorepoBuild();
  console.log("\n🎉 ALL 4/4 INTEGRITY & INSTALLATION CHECKS PASSED PERFECTLY!");
}

runIntegrityCheck().catch((err: unknown) => {
  console.error("Test failed:", err);
  process.exit(1);
});
