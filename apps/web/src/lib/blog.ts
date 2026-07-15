import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";

const CONTENT_DIR = path.join(process.cwd(), "content/blog");
const MDX_EXTENSION = /\.mdx$/;
const HEADING_LINE = /^(#{2,3})\s+(.+)$/;
const CODE_FENCE = /^```/;

export interface BlogMetadata {
  author?: string;
  date: string;
  description: string;
  tags?: string[];
  title: string;
}

export interface BlogPostModule {
  default: ComponentType<{ components?: MDXComponents }>;
  metadata: BlogMetadata;
}

export interface TocEntry {
  depth: 2 | 3;
  id: string;
  title: string;
}

export interface BlogPost {
  metadata: BlogMetadata;
  slug: string;
}

export interface BlogPostData extends BlogPostModule {
  toc: TocEntry[];
}

function getSlugs(): string[] {
  return readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(MDX_EXTENSION, ""));
}

async function importPost(slug: string): Promise<BlogPostModule> {
  return (await import(`../../content/blog/${slug}.mdx`)) as BlogPostModule;
}

/** Matches `rehype-slug`'s id algorithm so TOC links resolve to the rendered headings. */
function extractToc(raw: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const toc: TocEntry[] = [];
  let inCodeFence = false;

  for (const line of raw.split("\n")) {
    if (CODE_FENCE.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) {
      continue;
    }

    const match = line.match(HEADING_LINE);
    if (!match) {
      continue;
    }

    const title = match[2].trim();
    toc.push({
      depth: match[1].length as 2 | 3,
      id: slugger.slug(title),
      title,
    });
  }

  return toc;
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
): Promise<BlogPostData | null> {
  if (!getSlugs().includes(slug)) {
    return null;
  }

  const mod = await importPost(slug);
  const raw = readFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), "utf8");

  return { ...mod, toc: extractToc(raw) };
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
