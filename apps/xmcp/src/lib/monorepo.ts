import { existsSync } from "node:fs";
import { isAbsolute, join, normalize, relative, resolve } from "node:path";

let cachedWwwPath: string | null | undefined;

const TRAILING_LEADING_SLASHES = /^\/+|\/+$/g;
const COMPONENTS_ALIAS_REGEX = /^components/;
const PRIMITIVES_ALIAS_REGEX = /^primitives/;
const DOCS_PREFIX_REGEX = /^docs\//;
const DOCS_SECTION_ALIAS_REGEX =
  /^docs\/(ui|catalog|components|motion|primitives|icons|blog)\//;

export interface ResolvedContentFile {
  filePath: string;
  pagePath: string;
}

type CandidateCollector = (relPath: string, pagePath: string) => void;

function isWwwDirectory(candidate: string): boolean {
  return (
    existsSync(candidate) &&
    (existsSync(join(candidate, "public", "r", "registry.json")) ||
      (existsSync(join(candidate, "package.json")) &&
        existsSync(join(candidate, "content"))))
  );
}

/**
 * Attempts to locate the `apps/www` directory when running inside the Sora monorepo.
 * Checks environment variables, standard relative paths, and parent directory traversal.
 * Memoizes the result to avoid redundant synchronous filesystem operations.
 */
export function getLocalWwwPath(): string | null {
  if (cachedWwwPath !== undefined) {
    return cachedWwwPath;
  }

  // 1. Explicit env overrides
  if (process.env.SORA_WWW_DIR && isWwwDirectory(process.env.SORA_WWW_DIR)) {
    cachedWwwPath = process.env.SORA_WWW_DIR;
    return cachedWwwPath;
  }
  if (process.env.SORA_REPO_ROOT) {
    const candidate = join(process.env.SORA_REPO_ROOT, "apps", "www");
    if (isWwwDirectory(candidate)) {
      cachedWwwPath = candidate;
      return cachedWwwPath;
    }
  }

  // 2. Traversal upwards from cwd
  const cwd = process.cwd();
  let current = cwd;
  for (let i = 0; i < 5; i++) {
    const checkWww = join(current, "apps", "www");
    if (isWwwDirectory(checkWww)) {
      cachedWwwPath = checkWww;
      return cachedWwwPath;
    }
    if (isWwwDirectory(current)) {
      cachedWwwPath = current;
      return cachedWwwPath;
    }
    const checkSibling = join(current, "..", "www");
    if (isWwwDirectory(checkSibling)) {
      cachedWwwPath = resolve(checkSibling);
      return cachedWwwPath;
    }

    const parent = resolve(current, "..");
    if (parent === current) {
      break;
    }
    current = parent;
  }

  cachedWwwPath = null;
  return null;
}

/**
 * Returns the absolute path to a file inside `apps/www/public/r/` if it exists locally.
 * Includes path traversal guards to prevent escaping `public/r/`.
 */
export function getLocalRegistryFile(filename: string): string | null {
  const wwwDir = getLocalWwwPath();
  if (
    !(wwwDir && filename) ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("\0")
  ) {
    return null;
  }

  const filePath = join(wwwDir, "public", "r", filename);
  return existsSync(filePath) ? filePath : null;
}

function normalizeDocSlug(rawSlug: string): string | null {
  let slug = rawSlug.trim().replace(TRAILING_LEADING_SLASHES, "");
  if (
    !slug ||
    slug.includes("\0") ||
    slug.includes("..") ||
    normalize(slug).includes("..")
  ) {
    return null;
  }

  if (DOCS_SECTION_ALIAS_REGEX.test(slug)) {
    slug = slug.replace(DOCS_PREFIX_REGEX, "");
  }

  if (slug === "components" || slug.startsWith("components/")) {
    return slug.replace(COMPONENTS_ALIAS_REGEX, "catalog");
  }
  if (slug === "primitives" || slug.startsWith("primitives/")) {
    return slug.replace(PRIMITIVES_ALIAS_REGEX, "motion");
  }
  return slug;
}

function collectUiCandidates(slug: string, add: CandidateCollector): void {
  const isUi =
    slug === "ui" ||
    slug === "ui/index" ||
    slug.startsWith("ui/") ||
    slug.startsWith("base/") ||
    slug.startsWith("radix/");

  if (!isUi) {
    return;
  }

  let sub = "";
  if (slug.startsWith("ui/")) {
    sub = slug.slice("ui/".length);
  } else if (slug !== "ui" && slug !== "ui/index") {
    sub = slug;
  }

  if (!sub || sub === "index") {
    add("ui/index.mdx", "/ui");
    return;
  }

  if (sub.startsWith("base/")) {
    const name = sub.slice("base/".length);
    add(`ui/base/${name}.mdx`, `/ui/base/${name}`);
    return;
  }

  if (sub.startsWith("radix/")) {
    const name = sub.slice("radix/".length);
    add(`ui/radix/${name}.mdx`, `/ui/radix/${name}`);
    return;
  }

  if (sub === "roadmap" || sub === "rtl") {
    add(`ui/${sub}.mdx`, `/ui/${sub}`);
    return;
  }

  // General ui/<component>, e.g. "ui/button": check Base first, then Radix, then direct
  add(`ui/base/${sub}.mdx`, `/ui/base/${sub}`);
  add(`ui/radix/${sub}.mdx`, `/ui/radix/${sub}`);
  add(`ui/${sub}.mdx`, `/ui/${sub}`);
}

function collectSectionCandidates(slug: string, add: CandidateCollector): void {
  // Docs section
  if (slug.startsWith("docs/")) {
    add(join("docs", `${slug.slice("docs/".length)}.mdx`), `/${slug}`);
  } else {
    add(join("docs", `${slug}.mdx`), `/docs/${slug}`);
  }

  // Other standard sections
  for (const section of ["catalog", "motion", "icons", "blog"]) {
    if (slug.startsWith(`${section}/`)) {
      const rest = slug.slice(`${section}/`.length);
      add(join(section, `${rest}.mdx`), `/${slug}`);
    } else {
      add(join(section, `${slug}.mdx`), `/${section}/${slug}`);
    }
  }

  // Bare component lookup fallback (e.g. "button" -> ui/base/button, ui/radix/button)
  if (!slug.includes("/")) {
    add(`ui/base/${slug}.mdx`, `/ui/base/${slug}`);
    add(`ui/radix/${slug}.mdx`, `/ui/radix/${slug}`);
  }
}

/**
 * Attempts to resolve a slug to a local `.mdx` file in `apps/www/content/`.
 * Supports framework subdirectories (ui/base, ui/radix), legacy aliases (components, primitives),
 * and prevents path traversal attacks.
 */
export function getLocalContentFile(
  rawSlug: string
): ResolvedContentFile | null {
  const wwwDir = getLocalWwwPath();
  if (!wwwDir) {
    return null;
  }

  const slug = normalizeDocSlug(rawSlug);
  if (!slug) {
    return null;
  }

  const contentDir = resolve(wwwDir, "content");
  const candidates: ResolvedContentFile[] = [];

  const addCandidate: CandidateCollector = (relPath, pagePath) => {
    const fullPath = resolve(contentDir, relPath);
    const rel = relative(contentDir, fullPath);
    if (!(rel.startsWith("..") || isAbsolute(rel))) {
      candidates.push({ filePath: fullPath, pagePath });
    }
  };

  collectUiCandidates(slug, addCandidate);

  // Direct match and directory index match
  addCandidate(`${slug}.mdx`, `/${slug}`);
  addCandidate(join(slug, "index.mdx"), `/${slug}`);

  collectSectionCandidates(slug, addCandidate);

  for (const candidate of candidates) {
    if (existsSync(candidate.filePath)) {
      return candidate;
    }
  }

  return null;
}
