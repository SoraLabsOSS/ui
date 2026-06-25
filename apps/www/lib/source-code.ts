const sourceCache = new Map<
  string,
  { code: string | null; filename: string | null }
>();

interface RegistryFile {
  content?: string;
  path?: string;
}

interface RegistryJson {
  default?: {
    files?: RegistryFile[];
  };
  files?: RegistryFile[];
}

export async function readComponentSource(componentName: string): Promise<{
  code: string | null;
  filename: string | null;
}> {
  const cached = sourceCache.get(componentName);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const registry = (await import(
      `@/public/r/${componentName}.json`
    )) as RegistryJson;

    const files = registry.files ?? registry.default?.files;
    const primaryFile = files?.[0];

    const result = {
      code: primaryFile?.content ?? null,
      filename: primaryFile?.path?.split("/").pop() ?? null,
    };

    sourceCache.set(componentName, result);
    return result;
  } catch {
    const result = { code: null, filename: null };
    sourceCache.set(componentName, result);
    return result;
  }
}
