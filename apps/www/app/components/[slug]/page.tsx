import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComponentPageDocs } from "@/components/catalog/component-page-docs";
import { ComponentPageLayout } from "@/components/catalog/component-page-layout";
import { ComponentPageJsonLd } from "@/components/docs/component-page-json-ld";
import { pageContentCacheLife } from "@/lib/cache/page-content-cache-life";
import {
  getOgMetadataImages,
  getTwitterMetadataImages,
} from "@/lib/og/og-metadata-images";
import { getCatalogMDXComponents } from "@/lib/registry/catalog-mdx";
import { componentSource } from "@/lib/registry/component-source";
import {
  getComponentGalleryItems,
  getComponentNeighbours,
  getComponentPageData,
  getComponentPageHeaderData,
} from "@/lib/registry/get-component-page-data";
import { getComponentSlugs } from "@/lib/registry/get-component-slugs";
import { getPageAlternates, SITE_URL } from "@/lib/site";
import { getMDXComponents } from "@/mdx-components";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComponentDetailPage(props: PageProps) {
  const { slug } = await props.params;

  if (!getComponentPageData(slug)) {
    notFound();
  }

  return <CachedComponentPageBody slug={slug} />;
}

/**
 * Renders the actual catalog page body. `notFound` stays in the caller —
 * dynamic APIs like that can't be called from inside a `"use cache"` boundary.
 */
async function CachedComponentPageBody({ slug }: { slug: string }) {
  "use cache";
  pageContentCacheLife();

  const data = getComponentPageData(slug);
  if (!data) {
    return null;
  }

  const MDXContent = data.page.data.body;
  const pageData = data.page.data as {
    lastModified?: Date | string | number;
    releaseDate?: Date | string;
  };
  const raw = pageData.releaseDate ?? pageData.lastModified;
  let releaseDate: string | undefined;
  if (raw instanceof Date) {
    releaseDate = raw.toISOString().slice(0, 10);
  } else if (raw) {
    releaseDate = new Date(raw).toISOString().slice(0, 10);
  }

  const { previous: previousNav, next: nextNav } = getComponentNeighbours(slug);

  return (
    <>
      <ComponentPageJsonLd componentUrl={data.componentUrl} page={data.page} />
      <ComponentPageLayout
        data={data}
        githubPath={`content/components/${slug}.mdx`}
        header={getComponentPageHeaderData(data)}
        navItems={getComponentGalleryItems()}
        nextNav={nextNav}
        previousNav={previousNav}
        releaseDate={releaseDate}
      >
        <ComponentPageDocs>
          <MDXContent
            components={getMDXComponents({
              ...getCatalogMDXComponents(),
              a: createRelativeLink(componentSource, data.page),
            })}
          />
        </ComponentPageDocs>
      </ComponentPageLayout>
    </>
  );
}

export function generateStaticParams() {
  return getComponentSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const data = getComponentPageData(slug);

  if (!data) {
    return {};
  }

  const url = `${SITE_URL}${data.componentUrl}`;
  const ogPath = ["components", slug];
  const title = data.page.data.title;

  return {
    title,
    description: data.page.data.description,
    alternates: getPageAlternates(data.componentUrl),
    openGraph: {
      title,
      description: data.page.data.description,
      url,
      siteName: "Sora UI",
      images: getOgMetadataImages(ogPath, title),
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: data.page.data.description,
      images: getTwitterMetadataImages(ogPath),
    },
  };
}
