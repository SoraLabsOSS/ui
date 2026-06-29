import path from "node:path";
import { fileURLToPath } from "node:url";
import { type InferPageType, loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import type { FileObject } from "next-validate-link";
import { blog, components, docs } from "@/.source";
import { buildDocRedirects } from "@/lib/docs/build-doc-redirects";

export const docSource = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

export const componentSource = loader({
  baseUrl: "/components",
  source: components.toFumadocsSource(),
});

export const blogSource = loader({
  baseUrl: "/blog",
  source: toFumadocsSource(blog, []),
});

type DocPage = InferPageType<typeof docSource>;
type ComponentPage = InferPageType<typeof componentSource>;
type BlogPage = InferPageType<typeof blogSource>;
type ContentPage = DocPage | ComponentPage | BlogPage;

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
    "components/[slug]": componentSource.getPages().map((page) => ({
      value: { slug: page.slugs[0] },
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
    ...blogSource.getPages(),
  ];

  for (const page of pages) {
    scanned.urls.set(page.url, { hashes: getHeadings(page) });
  }
}

export function augmentScannedUrls(scanned: ScannedUrls): void {
  registerContentPages(scanned);
  scanned.urls.set("/blog/rss.xml", {});

  for (const redirect of buildDocRedirects(appRoot)) {
    if (!redirect.source.includes(":path")) {
      scanned.urls.set(redirect.source, {});
    }
  }
}
