import type { Metadata } from "next";

import { getComponentSlugs } from "@/lib/registry/get-component-slugs";

import { BlocksExampleClient } from "./blocks-example-client";

interface BlocksExamplePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getComponentSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: BlocksExamplePageProps
): Promise<Metadata> {
  const { slug } = await props.params;

  return {
    title: `${slug} - Blocks Preview`,
    robots: "noindex,nofollow",
  };
}

export default async function BlocksExamplePage(props: BlocksExamplePageProps) {
  const { slug } = await props.params;

  return <BlocksExampleClient slug={slug} />;
}
