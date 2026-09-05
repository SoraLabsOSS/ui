import path from "node:path";
import { fileURLToPath } from "node:url";
import { type InferPageType, loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import type { FileObject } from "next-validate-link";
import { blog, catalog, docs, ui } from "@/.source";
import { buildDocRedirects } from "@/lib/docs/build-doc-redirects";

export const docSource = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
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
type ComponentPage = InferPageType<typeof componentSource>;
type UiPage = InferPageType<typeof uiSourceForLinks>;
type BlogPage = InferPageType<typeof blogSource>;
type ContentPage = DocPage | ComponentPage | UiPage | BlogPage;

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

export function getHeadings(page: ContentPage): string[] {
  return (page.data.toc ?? []).map((item) => item.url.slice(1));
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
  scanned.urls.set("/motion", {});
  scanned.urls.set("/primitives", {});

  for (const page of docSource.getPages()) {
    if (page.url.startsWith("/docs/motion/")) {
      const slug = page.url.slice("/docs/motion/".length);
      scanned.urls.set(`/docs/primitives/${slug}`, {
        hashes: getHeadings(page),
      });
      scanned.urls.set(`/motion/${slug}`, { hashes: getHeadings(page) });
      scanned.urls.set(`/primitives/${slug}`, { hashes: getHeadings(page) });
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
