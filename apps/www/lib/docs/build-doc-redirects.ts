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

/** Old top-level doc paths before primitives were grouped under `/docs/primitives`. */
const TOP_LEVEL_PRIMITIVE_PREFIXES = ["texts", "buttons", "effects"] as const;

/** Renamed primitive slugs — keeps old bookmarks working. */
const LEGACY_PRIMITIVE_SLUG_RENAMES: Record<string, string> = {
  "scroll-text-reveal": "text-reveal-mask",
  "text-reveal": "text-reveal-blur",
};

function readMetaPages(metaPath: string): string[] {
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
    pages?: string[];
  };

  return (meta.pages ?? []).filter((page) => !page.startsWith("---"));
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

/** Redirects inferred from docs/component meta — fills missing `primitives` or `components` segments. */
export function buildDocRedirects(appRoot: string): DocRedirect[] {
  const docsRoot = path.join(appRoot, "content/docs");
  const primitivePageList = readMetaPages(
    path.join(docsRoot, "primitives/meta.json")
  );
  const primitiveSlugs = new Set(primitivePageList);
  const componentSlugs = new Set(
    readMetaPages(path.join(appRoot, "content/components/meta.json"))
  );
  const guideSlugs = readGuideSlugs(docsRoot);

  const redirects: DocRedirect[] = [];
  const firstPrimitiveSlug = primitivePageList[0];

  if (firstPrimitiveSlug) {
    redirects.push({
      source: "/docs/primitives",
      destination: `/docs/primitives/${firstPrimitiveSlug}`,
      permanent: true,
    });
  }

  for (const [from, to] of Object.entries(LEGACY_PRIMITIVE_SLUG_RENAMES)) {
    redirects.push({
      source: `/docs/primitives/${from}`,
      destination: `/docs/primitives/${to}`,
      permanent: true,
    });
    redirects.push({
      source: `/docs/${from}`,
      destination: `/docs/primitives/${to}`,
      permanent: true,
    });
  }

  redirects.push({
    source: "/docs/components/texts/text-reveal",
    destination: "/docs/primitives/text-reveal-blur",
    permanent: true,
  });

  for (const category of TOP_LEVEL_PRIMITIVE_PREFIXES) {
    redirects.push({
      source: `/docs/${category}/:path*`,
      destination: "/docs/primitives/:path*",
      permanent: true,
    });
  }

  for (const category of PRIMITIVE_CATEGORY_PREFIXES) {
    redirects.push({
      source: `/docs/primitives/${category}/:path*`,
      destination: "/docs/primitives/:path*",
      permanent: true,
    });
  }

  for (const slug of primitiveSlugs) {
    if (guideSlugs.has(slug)) {
      continue;
    }

    redirects.push({
      source: `/docs/${slug}`,
      destination: `/docs/primitives/${slug}`,
      permanent: true,
    });

    if (!componentSlugs.has(slug)) {
      redirects.push({
        source: `/components/${slug}`,
        destination: `/docs/primitives/${slug}`,
        permanent: true,
      });
    }
  }

  for (const slug of componentSlugs) {
    if (primitiveSlugs.has(slug)) {
      continue;
    }

    redirects.push({
      source: `/docs/${slug}`,
      destination: `/components/${slug}`,
      permanent: true,
    });

    redirects.push({
      source: `/docs/primitives/${slug}`,
      destination: `/components/${slug}`,
      permanent: true,
    });
  }

  redirects.push({
    source: "/docs/components/:path*",
    destination: "/components/:path*",
    permanent: true,
  });

  return redirects;
}
