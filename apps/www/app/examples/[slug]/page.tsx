import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { previewComponents } from "@/__registry__/preview";
import { ExamplePreviewClient } from "../example-preview-client";

export const instant = false;

interface ExamplePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  props: ExamplePageProps
): Promise<Metadata> {
  const { slug } = await props.params;

  return {
    title: `${slug} - Example Preview`,
    robots: "noindex,nofollow",
  };
}

export default async function ExamplePage(props: ExamplePageProps) {
  const { slug } = await props.params;

  if (!(previewComponents[`demo-${slug}`] || previewComponents[slug])) {
    notFound();
  }

  return <ExamplePreviewClient centered slug={slug} />;
}
