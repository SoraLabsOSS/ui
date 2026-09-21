import fs from "node:fs";
import path from "node:path";
import {
  LEGACY_PATH_PREFIX_REDIRECTS,
  LEGACY_PRIMITIVE_SLUG_RENAMES,
  LEGACY_UI_SLUG_REDIRECTS,
  MOTION_CATEGORY_PREFIXES,
} from "../bookmarks/url";

export interface DocRedirect {
  destination: string;
  permanent: true;
  source: string;
}

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
  let motionMetaPath = path.join(appRoot, "content/motion/meta.json");
  if (!fs.existsSync(motionMetaPath)) {
    motionMetaPath = fs.existsSync(path.join(docsRoot, "motion/meta.json"))
      ? path.join(docsRoot, "motion/meta.json")
      : path.join(docsRoot, "primitives/meta.json");
  }
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
      destination: `/motion/${to}`,
      permanent: true,
    });
    redirects.push({
      source: `/motion/${from}`,
      destination: `/motion/${to}`,
      permanent: true,
    });
    redirects.push({
      source: `/docs/primitives/${from}`,
      destination: `/motion/${to}`,
      permanent: true,
    });
    redirects.push({
      source: `/docs/${from}`,
      destination: `/motion/${to}`,
      permanent: true,
    });
  }

  for (const [source, destination] of LEGACY_PATH_PREFIX_REDIRECTS) {
    redirects.push({ source, destination, permanent: true });
    redirects.push({
      source: `${source}/:path*`,
      destination: `${destination}/:path*`,
      permanent: true,
    });
  }

  // Redirect legacy flat /ui/:slug paths to /ui/base/:slug or /ui/radix/:slug
  for (const [slug, destination] of Object.entries(LEGACY_UI_SLUG_REDIRECTS)) {
    redirects.push({
      source: `/ui/${slug}`,
      destination,
      permanent: true,
    });
  }

  for (const category of MOTION_CATEGORY_PREFIXES) {
    redirects.push({
      source: `/docs/${category}/:path*`,
      destination: "/motion/:path*",
      permanent: true,
    });
  }

  for (const category of MOTION_CATEGORY_PREFIXES) {
    redirects.push({
      source: `/docs/motion/${category}/:path*`,
      destination: "/motion/:path*",
      permanent: true,
    });
    redirects.push({
      source: `/motion/${category}/:path*`,
      destination: "/motion/:path*",
      permanent: true,
    });
  }

  for (const slug of motionSlugs) {
    if (guideSlugs.has(slug)) {
      continue;
    }

    redirects.push({
      source: `/docs/${slug}`,
      destination: `/motion/${slug}`,
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
