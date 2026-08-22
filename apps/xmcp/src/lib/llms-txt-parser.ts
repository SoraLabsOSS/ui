export interface DocPage {
  content: string;
  description?: string;
  section?: string;
  slug: string;
  title: string;
  url: string;
}

export interface DocSection {
  children: DocSection[];
  name: string;
  pageCount: number;
  slug: string;
  url: string;
}

export interface ParseLlmsTxtResult {
  pages: DocPage[];
  sections: DocSection[];
}

const TRAILING_SLASHES = /\/+$/;
const LEADING_SLASHES = /^\/+/;
const SECTION_HEADING_REGEX = /^##\s+(.+)$/;
const SUBSECTION_HEADING_REGEX = /^###\s+(.+)$/;
const LINK_LINE_REGEX = /^-\s+\[([^\]]+)\]\(([^)]+)\)(?::\s*(.*))?$/;
const SLUGIFY_NON_ALPHANUM = /[^a-z0-9]+/g;
const SLUGIFY_TRIM_DASHES = /^-+|-+$/g;

/**
 * Convert a section name to a URL-friendly slug.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(SLUGIFY_NON_ALPHANUM, "-")
    .replace(SLUGIFY_TRIM_DASHES, "");
}

/**
 * Derive a slug from a URL by stripping the base URL and leading/trailing slashes.
 */
export function deriveSlug(url: string, baseUrl?: string): string {
  let slug = url;
  if (baseUrl) {
    const base = baseUrl.replace(TRAILING_SLASHES, "");
    if (slug.startsWith(base)) {
      slug = slug.slice(base.length);
    }
  }

  try {
    const parsed = new URL(slug);
    slug = parsed.pathname;
  } catch {
    // Not a full URL, use as-is
  }

  return slug.replace(LEADING_SLASHES, "").replace(TRAILING_SLASHES, "");
}

/**
 * Parse an llms.txt index file into structured sections and pages.
 */
export function parseLlmsTxt(
  content: string,
  baseUrl?: string
): ParseLlmsTxtResult {
  if (!content?.trim()) {
    return { sections: [], pages: [] };
  }

  const lines = content.split("\n");
  const sections: DocSection[] = [];
  const pages: DocPage[] = [];
  let currentSection: DocSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Match ## Section headings (skip # top-level title)
    const sectionMatch = trimmed.match(SECTION_HEADING_REGEX);
    if (sectionMatch) {
      const name = sectionMatch[1].trim();
      const slug = slugify(name);
      currentSection = {
        name,
        slug,
        url: baseUrl ? `${baseUrl}/${slug}` : slug,
        children: [],
        pageCount: 0,
      };
      sections.push(currentSection);
      continue;
    }

    // Match ### Subsection headings
    const subsectionMatch = trimmed.match(SUBSECTION_HEADING_REGEX);
    if (subsectionMatch && currentSection) {
      const name = subsectionMatch[1].trim();
      const slug = slugify(name);
      const subsection: DocSection = {
        name,
        slug,
        url: baseUrl
          ? `${baseUrl}/${currentSection.slug}/${slug}`
          : `${currentSection.slug}/${slug}`,
        children: [],
        pageCount: 0,
      };
      currentSection.children.push(subsection);
      continue;
    }

    // Match link lines: - [Title](url): description OR - [Title](url)
    const linkMatch = trimmed.match(LINK_LINE_REGEX);
    if (linkMatch) {
      const title = linkMatch[1].trim();
      const url = linkMatch[2].trim();
      const description = linkMatch[3]?.trim() || undefined;
      const slug = deriveSlug(url, baseUrl);
      const page: DocPage = {
        slug,
        url,
        title,
        description,
        content: "",
        section: currentSection?.name,
      };
      pages.push(page);
      if (currentSection) {
        currentSection.pageCount++;
      }
    }
  }

  return { sections, pages };
}
