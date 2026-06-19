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
  const primitiveSlugs = new Set(
    readMetaPages(path.join(docsRoot, "primitives/meta.json"))
  );
  const componentSlugs = new Set(
    readMetaPages(path.join(appRoot, "content/components/meta.json"))
  );
  const guideSlugs = readGuideSlugs(docsRoot);

  const redirects: DocRedirect[] = [];

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
