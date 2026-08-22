import { DOCS_BASE_URL } from "../docs/sora-docs-source";
import { registryCache } from "./registry-cache";

export interface RegistryFile {
  content?: string;
  path: string;
  target?: string;
  type: string;
}

export interface RegistryItem {
  dependencies?: string[];
  description?: string;
  files: RegistryFile[];
  meta?: Record<string, unknown>;
  name: string;
  registryDependencies?: string[];
  title?: string;
  type: string;
}

interface Registry {
  homepage: string;
  items: RegistryItem[];
  name: string;
}

const REGISTRY_URL = `${DOCS_BASE_URL}/r/registry.json`;
const REGISTRY_CACHE_KEY = "registry:full";
const DEMO_PREFIX = "demo-";

export class RegistryFetchError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "RegistryFetchError";
  }
}

/** Real installable primitives — excludes the base style entry and internal demo-preview items. */
export function isInstallablePrimitive(item: RegistryItem): boolean {
  if (item.type === "registry:hook") {
    return true;
  }
  return (
    item.type === "registry:ui" &&
    item.name !== "index" &&
    !item.name.startsWith(DEMO_PREFIX)
  );
}

export async function fetchRegistry(): Promise<Registry> {
  const cached = registryCache.get<Registry>(REGISTRY_CACHE_KEY);
  if (cached !== null) {
    return cached;
  }

  try {
    const response = await fetch(REGISTRY_URL);
    if (!response.ok) {
      throw new RegistryFetchError(
        `Registry fetch returned ${response.status} ${response.statusText}`
      );
    }

    const registry = (await response.json()) as Registry;
    registryCache.set(REGISTRY_CACHE_KEY, registry);
    return registry;
  } catch (error) {
    if (error instanceof RegistryFetchError) {
      throw error;
    }

    throw new RegistryFetchError(
      `Failed to fetch or parse registry from ${REGISTRY_URL}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  }
}

export async function listInstallableItems(): Promise<RegistryItem[]> {
  const registry = await fetchRegistry();
  return registry.items.filter(isInstallablePrimitive);
}

export async function getItemByName(
  name: string
): Promise<RegistryItem | null> {
  const items = await listInstallableItems();
  return items.find((item) => item.name === name) ?? null;
}

/**
 * Fetches the per-item registry JSON, which embeds full file `content` —
 * unlike the merged registry.json used by `listInstallableItems`/`getItemByName`.
 */
export async function getItemSource(
  name: string
): Promise<RegistryItem | null> {
  const cacheKey = `registry:item:${name}`;
  const cached = registryCache.get<RegistryItem>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const url = `${DOCS_BASE_URL}/r/${name}.json`;
  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new RegistryFetchError(
      `Registry item fetch returned ${response.status} ${response.statusText} for "${name}"`
    );
  }

  const item = (await response.json()) as RegistryItem;
  registryCache.set(cacheKey, item);
  return item;
}

export function formatList(items: RegistryItem[]): string {
  if (items.length === 0) {
    return "No installable components found.";
  }

  return items
    .map(
      (item) =>
        `- **${item.title ?? item.name}** (\`${item.name}\`) — ${item.description ?? "No description"}`
    )
    .join("\n");
}

export function formatSource(item: RegistryItem): string {
  const files = item.files
    .map((file) =>
      [
        `File: ${file.path} → ${file.target ?? "(default target)"}`,
        "```tsx",
        file.content ?? "(no content available for this file)",
        "```",
      ].join("\n")
    )
    .join("\n\n");

  return [
    "",
    "## Source",
    "For reference — installing via sora-cli above already writes these with the right import aliases.",
    "",
    files,
  ].join("\n");
}

const UNSAFE_CWD_CHARS = /[`;$&|<>(){}"'\n\r]/;

export function formatDetail(
  item: RegistryItem,
  includeSource: boolean,
  cwd?: string
): string {
  const dependencies = item.dependencies?.join(", ") || "none";
  const registryDependencies = item.registryDependencies?.join(", ") || "none";
  const fileTargets = item.files
    .map((file) => `  - ${file.path} → ${file.target ?? "(default target)"}`)
    .join("\n");

  const trimmedCwd = cwd?.trim();
  const cwdWarning =
    trimmedCwd && UNSAFE_CWD_CHARS.test(trimmedCwd)
      ? `**Warning:** the provided \`cwd\` ("${trimmedCwd}") contains characters that shouldn't appear in a path — do not interpolate it into a shell command as-is; ask the user to confirm the workspace path first.`
      : "";
  const cwdFlag = trimmedCwd && !cwdWarning ? ` --cwd "${trimmedCwd}"` : "";

  const lines = [
    `# ${item.title ?? item.name}`,
    item.description ?? "",
    "",
    "## Install",
    ...(cwdWarning ? [cwdWarning, ""] : []),
    `Run this in the user's project (not this MCP server, which has no access to their files): \`npx @soralabsoss/sora-cli add ${item.name}${cwdFlag} --yes\` — fetches this component with the correct import aliases for their project and installs its dependencies. Once installed, read the actual file on disk if you need to see the code — don't re-fetch it here.`,
    "**Always include `--yes`** when running this yourself (non-interactively): without it, `sora-cli` prints a confirmation prompt and — since your shell has no TTY — silently exits 0 without installing anything. `--yes` skips that prompt so the install actually runs. Only omit `--yes` if you're relaying the command for a human to run themselves in their own interactive terminal.",
    cwdFlag
      ? "In a monorepo, `--cwd` points sora-cli at the target workspace (e.g. `packages/ui`) so it resolves that workspace's tsconfig paths/aliases instead of the repo root's."
      : "In a monorepo, if you know which workspace the user wants (e.g. `packages/ui`), pass `cwd` to this tool or add `--cwd <workspace>` to the command yourself — otherwise sora-cli installs relative to the repo root, which is usually wrong for a nested package.",
    `Already installed and want to check for upstream changes? \`npx @soralabsoss/sora-cli diff ${item.name}${cwdFlag}\` (safe to run without \`--yes\` — it never prompts or writes anything).`,
    `(Already using the shadcn registry scope instead? \`npx shadcn@latest add @soralabs/${item.name}\` works too — run \`npx shadcn@latest registry add @soralabs\` once first if it isn't configured yet.)`,
    "",
    "## Details",
    `Dependencies: ${dependencies}`,
    `Registry dependencies: ${registryDependencies}`,
    "Files:",
    fileTargets,
  ];

  if (includeSource) {
    lines.push(formatSource(item));
  }

  return lines.join("\n");
}
