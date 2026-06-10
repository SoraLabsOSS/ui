import { cache } from "react";
import { index } from "@/__registry__";
import { source } from "@/lib/docs/source";
import { getComponentSlugs } from "@/lib/registry/get-component-slugs";
import { filterComponentToc } from "@/lib/registry/parse-primitive-mdx";
import type {
  ComponentGalleryItem,
  ComponentPageData,
  ComponentPageHeaderData,
} from "@/lib/registry/types";

function resolvePreviewName(
  registryName: string,
  previewOverride?: string
): string {
  const candidates = [
    previewOverride,
    `demo-${registryName}`,
    registryName,
  ].filter((name): name is string => Boolean(name));

  for (const name of candidates) {
    if (index[name]?.component) {
      return name;
    }
  }

  return previewOverride ?? registryName;
}

function getRegistryEntry(registryName: string) {
  return index[registryName] as
    | {
        command?: string;
        dependencies?: string[];
        registryDependencies?: string[];
      }
    | undefined;
}

export const getComponentPageData = cache(
  (slug: string): ComponentPageData | null => {
    const page = source.getPage(["components", slug]);
    const pageData = page?.data as {
      preview?: string;
      registryName?: string;
    };
    const registryName = pageData?.registryName ?? slug;
    const registryEntry = getRegistryEntry(registryName);

    if (!(page && registryEntry?.command)) {
      return null;
    }

    const previewName = resolvePreviewName(registryName, pageData?.preview);
    const toc = filterComponentToc(page.data.toc).map((item) => ({
      ...item,
      title: typeof item.title === "string" ? item.title : String(item.title),
    }));

    return {
      slug,
      collection: "component",
      page,
      registryName,
      previewName,
      componentUrl: `/components/${slug}`,
      docsUrl: page.url,
      toc,
      dependencies: registryEntry.dependencies ?? [],
      registryDependencies: registryEntry.registryDependencies ?? [],
      installCommand: registryEntry.command,
    };
  }
);

export const getComponentGalleryItems = cache((): ComponentGalleryItem[] => {
  const slugs = getComponentSlugs();

  const items: ComponentGalleryItem[] = [];

  for (const slug of slugs) {
    const page = source.getPage(["components", slug]);
    if (!page) {
      continue;
    }

    const data = page.data as {
      lastModified?: Date | string | number;
      releaseDate?: Date | string;
    };

    const raw = data.releaseDate ?? data.lastModified;
    let releaseDate: string | undefined;
    if (raw instanceof Date) {
      releaseDate = raw.toISOString().slice(0, 10);
    } else if (raw) {
      releaseDate = new Date(raw).toISOString().slice(0, 10);
    }

    items.push({
      slug,
      title: page.data.title,
      description: page.data.description ?? "",
      href: `/components/${slug}`,
      collection: "component",
      releaseDate,
    });
  }

  return items;
});

export function getComponentPageHeaderData(
  data: ComponentPageData
): ComponentPageHeaderData {
  const author = data.page.data.author as
    | { name: string; url?: string }
    | undefined;

  return {
    title: data.page.data.title,
    description: data.page.data.description ?? "",
    collection: data.collection,
    componentUrl: data.componentUrl,
    docsUrl: data.docsUrl,
    author,
    dependencies: data.dependencies,
    registryDependencies: data.registryDependencies,
  };
}
