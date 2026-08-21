import fs from "node:fs";
import path from "node:path";

export interface DocRedirect {
  destination: string;
  permanent: true;
  source: string;
}

const PRIMITIVE_CATEGORY_PREFIXES = [
  "texts",
  "buttons",
  "effects",
  "disclosure",
] as const;

/** Old top-level doc paths before primitives were grouped under `/docs/primitives` or `/docs/motion`. */
const TOP_LEVEL_PRIMITIVE_PREFIXES = [
  "texts",
  "buttons",
  "effects",
  "disclosure",
] as const;

/** Old flat UI paths before multi-foundation (Base UI / Radix UI) split. */
const LEGACY_UI_SLUG_REDIRECTS: Record<string, string> = {
  button: "/ui/base/button",
  checkbox: "/ui/base/checkbox",
  dialog: "/ui/base/dialog",
  "bottom-sheet": "/ui/radix/bottom-sheet",
};

/** Renamed primitive slugs — keeps old bookmarks working. */
const LEGACY_PRIMITIVE_SLUG_RENAMES: Record<string, string> = {
  "scroll-text-reveal": "text-reveal-mask",
  "text-reveal": "text-effect",
  "text-reveal-blur": "text-effect",
};

function readMetaPages(metaPath: string): string[] {
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
    pages?: string[];
  };

  return (meta.pages ?? []).filter(
    (page) => !page.startsWith("---") && page !== "index"
  );
}

const MDX_EXTENSION = /\.mdx$/;

function readGuideSlugs(docsRoot: string): Set<string> {
  return new Set(
    fs
      .readdirSync(docsRoot)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.replace(MDX_EXTENSION, ""))
  );
}

/** Redirects inferred from docs/component meta — fills missing `motion`, `primitives` or `catalog` segments. */
export function buildDocRedirects(appRoot: string): DocRedirect[] {
  const docsRoot = path.join(appRoot, "content/docs");
  const motionMetaPath = fs.existsSync(path.join(docsRoot, "motion/meta.json"))
    ? path.join(docsRoot, "motion/meta.json")
    : path.join(docsRoot, "primitives/meta.json");
  const catalogMetaPath = fs.existsSync(
    path.join(appRoot, "content/catalog/meta.json")
  )
    ? path.join(appRoot, "content/catalog/meta.json")
    : path.join(appRoot, "content/components/meta.json");

  const motionPageList = readMetaPages(motionMetaPath);
  const motionSlugs = new Set(motionPageList);
  const catalogSlugs = new Set(readMetaPages(catalogMetaPath));
  const guideSlugs = readGuideSlugs(docsRoot);

  const redirects: DocRedirect[] = [];

  // Legacy primitive slug renames
  for (const [from, to] of Object.entries(LEGACY_PRIMITIVE_SLUG_RENAMES)) {
    redirects.push({
      source: `/docs/motion/${from}`,
      destination: `/docs/motion/${to}`,
      permanent: true,
    });
    redirects.push({
      source: `/docs/primitives/${from}`,
      destination: `/docs/motion/${to}`,
      permanent: true,
    });
    redirects.push({
      source: `/docs/${from}`,
      destination: `/docs/motion/${to}`,
      permanent: true,
    });
  }

  // Redirect legacy /docs/primitives and /primitives to /docs/motion
  redirects.push({
    source: "/docs/primitives",
    destination: "/docs/motion",
    permanent: true,
  });
  redirects.push({
    source: "/docs/primitives/:path*",
    destination: "/docs/motion/:path*",
    permanent: true,
  });
  redirects.push({
    source: "/primitives",
    destination: "/docs/motion",
    permanent: true,
  });
  redirects.push({
    source: "/primitives/:path*",
    destination: "/docs/motion/:path*",
    permanent: true,
  });

  // Redirect legacy /components to /catalog
  redirects.push({
    source: "/components",
    destination: "/catalog",
    permanent: true,
  });
  redirects.push({
    source: "/components/:path*",
    destination: "/catalog/:path*",
    permanent: true,
  });
  redirects.push({
    source: "/docs/components",
    destination: "/catalog",
    permanent: true,
  });
  redirects.push({
    source: "/docs/components/:path*",
    destination: "/catalog/:path*",
    permanent: true,
  });
  redirects.push({
    source: "/docs/catalog",
    destination: "/catalog",
    permanent: true,
  });
  redirects.push({
    source: "/docs/catalog/:path*",
    destination: "/catalog/:path*",
    permanent: true,
  });

  // Redirect legacy flat /ui/:slug paths to /ui/base/:slug or /ui/radix/:slug
  for (const [slug, destination] of Object.entries(LEGACY_UI_SLUG_REDIRECTS)) {
    redirects.push({
      source: `/ui/${slug}`,
      destination,
      permanent: true,
    });
  }

  for (const category of TOP_LEVEL_PRIMITIVE_PREFIXES) {
    redirects.push({
      source: `/docs/${category}/:path*`,
      destination: "/docs/motion/:path*",
      permanent: true,
    });
  }

  for (const category of PRIMITIVE_CATEGORY_PREFIXES) {
    redirects.push({
      source: `/docs/motion/${category}/:path*`,
      destination: "/docs/motion/:path*",
      permanent: true,
    });
  }

  for (const slug of motionSlugs) {
    if (guideSlugs.has(slug)) {
      continue;
    }

    redirects.push({
      source: `/docs/${slug}`,
      destination: `/docs/motion/${slug}`,
      permanent: true,
    });
  }

  for (const slug of catalogSlugs) {
    if (motionSlugs.has(slug)) {
      continue;
    }

    redirects.push({
      source: `/docs/${slug}`,
      destination: `/catalog/${slug}`,
      permanent: true,
    });
  }

  return redirects;
}
