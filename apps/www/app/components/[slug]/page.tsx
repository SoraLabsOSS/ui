import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComponentPageDocs } from "@/components/catalog/component-page-docs";
import { ComponentPageLayout } from "@/components/catalog/component-page-layout";
import { getCatalogMDXComponents } from "@/lib/registry/catalog-mdx";
import { componentSource } from "@/lib/registry/component-source";
import {
  getComponentGalleryItems,
  getComponentPageData,
  getComponentPageHeaderData,
} from "@/lib/registry/get-component-page-data";
import { getComponentSlugs } from "@/lib/registry/get-component-slugs";
import { SITE_URL } from "@/lib/site";
import { getMDXComponents } from "@/mdx-components";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComponentDetailPage(props: PageProps) {
  const { slug } = await props.params;
  const data = getComponentPageData(slug);

  if (!data) {
    notFound();
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

  return (
    <ComponentPageLayout
      data={data}
      githubPath={`content/components/${slug}.mdx`}
      header={getComponentPageHeaderData(data)}
      navItems={getComponentGalleryItems()}
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

  return {
    title: data.page.data.title,
    description: data.page.data.description,
    alternates: {
      canonical: data.componentUrl,
    },
    openGraph: {
      title: data.page.data.title,
      description: data.page.data.description,
      url,
      siteName: "Sora UI",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.page.data.title,
      description: data.page.data.description,
    },
  };
}
