import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type InferPageType, loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import Slugger from "github-slugger";
import type { FileObject } from "next-validate-link";
import { blog, catalog, docs, icons, motion, ui } from "@/.source";
import { buildDocRedirects } from "@/lib/docs/build-doc-redirects";

export const docSource = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

export const motionSourceForLinks = loader({
  baseUrl: "/motion",
  source: motion.toFumadocsSource(),
});

export const iconsSourceForLinks = loader({
  baseUrl: "/icons",
  source: icons.toFumadocsSource(),
});

export const componentSource = loader({
  baseUrl: "/catalog",
  source: catalog.toFumadocsSource(),
});

export const catalogSource = componentSource;

export const uiSourceForLinks = loader({
  baseUrl: "/ui",
  source: ui.toFumadocsSource(),
});

export const blogSource = loader({
  baseUrl: "/blog",
  source: toFumadocsSource(blog, []),
});

type DocPage = InferPageType<typeof docSource>;
type MotionPage = InferPageType<typeof motionSourceForLinks>;
type IconPage = InferPageType<typeof iconsSourceForLinks>;
type ComponentPage = InferPageType<typeof componentSource>;
type UiPage = InferPageType<typeof uiSourceForLinks>;
type BlogPage = InferPageType<typeof blogSource>;
type ContentPage =
  | DocPage
  | MotionPage
  | IconPage
  | ComponentPage
  | UiPage
  | BlogPage;

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

const ATX_HEADING = /^#{1,6}\s+(.+?)\s*#*$/;
const CODE_FENCE = /^\s*(?:```|~~~)/;
const LINE_BREAK = /\r?\n/;
const headingCache = new Map<string, string[]>();

function inlineToText(value: string): string {
  return value
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[*_~]/g, "")
    .trim();
}

/**
 * Reads heading slugs from the raw MDX file: `page.data.toc` is undefined when
 * the source is loaded under Bun, which made every `#anchor` fail validation.
 */
function readHeadings(filePath: string): string[] {
  const cached = headingCache.get(filePath);
  if (cached) {
    return cached;
  }

  const slugger = new Slugger();
  const hashes: string[] = [];
  let fenced = false;

  for (const line of readFileSync(filePath, "utf8").split(LINE_BREAK)) {
    if (CODE_FENCE.test(line)) {
      fenced = !fenced;
      continue;
    }
    const match = fenced ? null : line.match(ATX_HEADING);
    if (match) {
      hashes.push(slugger.slug(inlineToText(match[1])));
    }
  }

  headingCache.set(filePath, hashes);
  return hashes;
}

export function getHeadings(page: ContentPage): string[] {
  return readHeadings(page.absolutePath);
}

export async function toFileObject(page: ContentPage): Promise<FileObject> {
  return {
    path: page.absolutePath,
    content: await page.data.getText("raw"),
    url: page.url,
    data: page.data,
  };
}

export function getAllContentFiles(): Promise<FileObject[]> {
  const pages: ContentPage[] = [
    ...docSource.getPages(),
    ...motionSourceForLinks.getPages(),
    ...iconsSourceForLinks.getPages(),
    ...componentSource.getPages(),
    ...uiSourceForLinks.getPages(),
    ...blogSource.getPages(),
  ];

  return Promise.all(pages.map((page) => toFileObject(page)));
}

export function buildPopulate() {
  return {
    "docs/[[...slug]]": docSource.getPages().map((page) => ({
      value: { slug: page.slugs },
      hashes: getHeadings(page),
    })),
    "motion/[[...slug]]": motionSourceForLinks.getPages().map((page) => ({
      value: { slug: page.slugs },
      hashes: getHeadings(page),
    })),
    "icons/[[...slug]]": iconsSourceForLinks.getPages().map((page) => ({
      value: { slug: page.slugs },
      hashes: getHeadings(page),
    })),
    "blog/[slug]": blogSource.getPages().map((page) => ({
      value: { slug: page.slugs[0] },
      hashes: getHeadings(page),
    })),
    "catalog/[slug]": componentSource.getPages().map((page) => ({
      value: { slug: page.slugs[0] },
      hashes: getHeadings(page),
    })),
    "ui/[[...slug]]": uiSourceForLinks.getPages().map((page) => ({
      value: { slug: page.slugs },
      hashes: getHeadings(page),
    })),
  };
}

type ScannedUrls = Awaited<
  ReturnType<typeof import("next-validate-link").scanURLs>
>;

function registerContentPages(scanned: ScannedUrls): void {
  const pages: ContentPage[] = [
    ...docSource.getPages(),
    ...motionSourceForLinks.getPages(),
    ...iconsSourceForLinks.getPages(),
    ...componentSource.getPages(),
    ...uiSourceForLinks.getPages(),
    ...blogSource.getPages(),
  ];

  for (const page of pages) {
    scanned.urls.set(page.url, { hashes: getHeadings(page) });
  }
}

export function augmentScannedUrls(scanned: ScannedUrls): void {
  registerContentPages(scanned);
  scanned.urls.set("/blog", {});
  scanned.urls.set("/catalog", {});
  scanned.urls.set("/blog/rss.xml", {});
  scanned.urls.set("/llms.txt", {});
  scanned.urls.set("/llms-full.txt", {});
  scanned.urls.set("/components", {});
  scanned.urls.set("/docs/primitives", {});
  scanned.urls.set("/docs/motion", {});
  scanned.urls.set("/docs/icons", {});
  scanned.urls.set("/motion", {});
  scanned.urls.set("/icons", {});
  scanned.urls.set("/primitives", {});

  for (const page of motionSourceForLinks.getPages()) {
    if (page.url.startsWith("/motion/")) {
      const slug = page.url.slice("/motion/".length);
      scanned.urls.set(`/docs/motion/${slug}`, { hashes: getHeadings(page) });
      scanned.urls.set(`/docs/primitives/${slug}`, {
        hashes: getHeadings(page),
      });
      scanned.urls.set(`/primitives/${slug}`, { hashes: getHeadings(page) });
    }
  }

  for (const page of iconsSourceForLinks.getPages()) {
    if (page.url.startsWith("/icons/")) {
      const slug = page.url.slice("/icons/".length);
      scanned.urls.set(`/docs/icons/${slug}`, { hashes: getHeadings(page) });
    }
  }

  for (const page of componentSource.getPages()) {
    if (page.url.startsWith("/catalog/")) {
      const slug = page.url.slice("/catalog/".length);
      scanned.urls.set(`/components/${slug}`, { hashes: getHeadings(page) });
    }
  }

  for (const redirect of buildDocRedirects(appRoot)) {
    if (!redirect.source.includes(":path")) {
      scanned.urls.set(redirect.source, {});
    }
  }
}
