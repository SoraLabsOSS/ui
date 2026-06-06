const SORA_UI_COMPONENTS_PREFIX = /^components\/sora-ui\//;
const TSX_EXTENSION_SUFFIX = /\.tsx$/;

export function unwrapBindValues(value: unknown): unknown {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    if ("value" in record) {
      return record.value;
    }
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      result[key] = unwrapBindValues(record[key]);
    }
    return result;
  }
  return value;
}

export function formatJsxPropValue(value: unknown): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  return JSON.stringify(value);
}

export function installImportPathFromTarget(target: string): string {
  const normalized = target
    .replace(SORA_UI_COMPONENTS_PREFIX, "")
    .replace(TSX_EXTENSION_SUFFIX, "");
  return `@/components/sora-ui/${normalized}`;
}

export function generateUsageExampleCode({
  componentName,
  importPath,
  props,
}: {
  componentName: string;
  importPath: string;
  props: Record<string, unknown>;
}): string {
  const propsLines = Object.entries(props)
    .map(([key, value]) => `      ${key}={${formatJsxPropValue(value)}}`)
    .join("\n");

  return [
    '"use client";',
    "",
    `import { ${componentName} } from "${importPath}";`,
    "",
    `export default function ${componentName}Example() {`,
    "  return (",
    `    <${componentName}`,
    propsLines,
    "    />",
    "  );",
    "}",
    "",
  ].join("\n");
}

export function extractPropsForCodegen(
  demoProps: Record<string, unknown>,
  liveState: Record<string, unknown> | null | undefined
): { componentName: string; props: Record<string, unknown> } | null {
  const componentName = Object.keys(demoProps)[0];
  if (!(componentName && liveState)) {
    return null;
  }

  const unwrapped = unwrapBindValues(liveState) as Record<string, unknown>;
  const nested = unwrapped[componentName];
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return {
      componentName,
      props: unwrapBindValues(nested) as Record<string, unknown>,
    };
  }

  return { componentName, props: unwrapped };
}

export function generateUsageExampleFromTarget(
  installTarget: string,
  demoProps: Record<string, Record<string, unknown>>
): string | null {
  const componentName = Object.keys(demoProps)[0];
  if (!componentName) {
    return null;
  }

  const props = unwrapBindValues(demoProps[componentName]) as Record<
    string,
    unknown
  >;

  return generateUsageExampleCode({
    componentName,
    importPath: installImportPathFromTarget(installTarget),
    props,
  });
}
