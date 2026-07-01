import { logger } from "mcp-framework";
import { DOCS_BASE_URL } from "../docs/sora-docs-source.js";
import { registryCache } from "./registry-cache.js";

export interface RegistryFile {
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

async function fetchRegistry(): Promise<Registry> {
  const cached = await registryCache.get<Registry>(REGISTRY_CACHE_KEY);
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
    await registryCache.set(REGISTRY_CACHE_KEY, registry);
    return registry;
  } catch (error) {
    if (error instanceof RegistryFetchError) {
      logger.error(`fetchRegistry: ${error.message}`);
      throw error;
    }

    const wrapped = new RegistryFetchError(
      `Failed to fetch or parse registry from ${REGISTRY_URL}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
    logger.error(`fetchRegistry: ${wrapped.message}`);
    throw wrapped;
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
