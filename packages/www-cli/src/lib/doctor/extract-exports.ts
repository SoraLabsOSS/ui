const FUNCTION_EXPORT_RE =
  /export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*[(<]/g;
const CONST_EXPORT_RE =
  /export\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)(?:\s*:\s*[^=]+)?\s*=/g;
const CLASS_EXPORT_RE = /export\s+class\s+([A-Za-z0-9_$]+)/g;
const DEFAULT_FUNCTION_RE =
  /export\s+default\s+(?:async\s+)?function(?:\s+([A-Za-z0-9_$]+))?/g;
const DEFAULT_CLASS_RE = /export\s+default\s+class(?:\s+([A-Za-z0-9_$]+))?/g;
const NAMED_EXPORTS_BLOCK_RE = /export\s*\{([^}]+)\}/g;
const AS_EXPORT_RE = /(?:type\s+)?([A-Za-z0-9_$]+)\s+as\s+([A-Za-z0-9_$]+)/;
const IDENTIFIER_RE = /^([A-Za-z0-9_$]+)/;

/**
 * Strips line comments and block comments to avoid false-positive export matches.
 */
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function parseNamedExportEntry(entry: string): string | null {
  const trimmed = entry.trim();
  if (!trimmed || trimmed.startsWith("type ")) {
    return null;
  }
  const asMatch = trimmed.match(AS_EXPORT_RE);
  if (asMatch?.[2]) {
    return asMatch[2];
  }
  const idMatch = trimmed.match(IDENTIFIER_RE);
  return idMatch?.[1] ?? null;
}

function collectFromNamedBlocks(
  cleanSource: string,
  exports: Set<string>
): void {
  for (const blockMatch of cleanSource.matchAll(NAMED_EXPORTS_BLOCK_RE)) {
    const rawBlock = blockMatch[1] ?? "";
    for (const entry of rawBlock.split(",")) {
      const name = parseNamedExportEntry(entry);
      if (name) {
        exports.add(name);
      }
    }
  }
}

/**
 * Extracts exported identifier names from a TypeScript / TSX source file.
 */
export function extractExports(sourceContent: string): Set<string> {
  const exports = new Set<string>();
  const cleanSource = stripComments(sourceContent);

  for (const match of cleanSource.matchAll(FUNCTION_EXPORT_RE)) {
    if (match[1]) {
      exports.add(match[1]);
    }
  }

  for (const match of cleanSource.matchAll(CONST_EXPORT_RE)) {
    if (match[1]) {
      exports.add(match[1]);
    }
  }

  for (const match of cleanSource.matchAll(CLASS_EXPORT_RE)) {
    if (match[1]) {
      exports.add(match[1]);
    }
  }

  for (const match of cleanSource.matchAll(DEFAULT_FUNCTION_RE)) {
    if (match[1]) {
      exports.add(match[1]);
    }
    exports.add("default");
  }

  for (const match of cleanSource.matchAll(DEFAULT_CLASS_RE)) {
    if (match[1]) {
      exports.add(match[1]);
    }
    exports.add("default");
  }

  collectFromNamedBlocks(cleanSource, exports);

  return exports;
}
