import type { Metadata } from "next";
import { getComponentSlugs } from "@/lib/registry/get-component-slugs";
import { CatalogExampleClient } from "./catalog-example-client";

interface CatalogExamplePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getComponentSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: CatalogExamplePageProps
): Promise<Metadata> {
  const { slug } = await props.params;

  return {
    title: `${slug} - Catalog Preview`,
    robots: "noindex,nofollow",
  };
}

export default async function CatalogExamplePage(
  props: CatalogExamplePageProps
) {
  const { slug } = await props.params;

  return <CatalogExampleClient slug={slug} />;
}
