import { readdirSync } from "node:fs";
import path from "node:path";
import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";

const CONTENT_DIR = path.join(process.cwd(), "content/blog");
const MDX_EXTENSION = /\.mdx$/;

export interface BlogMetadata {
  date: string;
  description: string;
  tags?: string[];
  title: string;
}

export interface BlogPostModule {
  default: ComponentType<{ components?: MDXComponents }>;
  metadata: BlogMetadata;
}

export interface BlogPost {
  metadata: BlogMetadata;
  slug: string;
}

function getSlugs(): string[] {
  return readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(MDX_EXTENSION, ""));
}

async function importPost(slug: string): Promise<BlogPostModule> {
  return (await import(`../../content/blog/${slug}.mdx`)) as BlogPostModule;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await Promise.all(
    getSlugs().map(async (slug) => {
      const { metadata } = await importPost(slug);
      return { slug, metadata };
    })
  );

  return posts.sort(
    (a, b) => +new Date(b.metadata.date) - +new Date(a.metadata.date)
  );
}

export async function getPostBySlug(
  slug: string
): Promise<BlogPostModule | null> {
  if (!getSlugs().includes(slug)) {
    return null;
  }

  return await importPost(slug);
}

export function getAllSlugs(): string[] {
  return getSlugs();
}

export function formatPostDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
