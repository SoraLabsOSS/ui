import type { InferPageType } from "fumadocs-core/source";
import type { source } from "@/lib/docs/source";
import type { componentSource } from "@/lib/registry/component-source";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

type DocsPage = InferPageType<typeof source>;
type ComponentPage = InferPageType<typeof componentSource>;

function formatPageLine(page: DocsPage | ComponentPage): string {
  const description = page.data.description?.trim();
  const suffix = description ? `: ${description}` : "";
  return `- [${page.data.title}](${SITE_URL}${page.url})${suffix}`;
}

/** Build `llms.txt` index for docs + component catalog pages. */
export function buildLlmsIndex(
  docsPages: DocsPage[],
  componentPages: ComponentPage[]
): string {
  const lines = [
    "# Sora UI",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Documentation",
    ...docsPages.map(formatPageLine),
    "",
    "## Components",
    ...componentPages.map(formatPageLine),
    "",
    "## Registry",
    `- [registry.json](${SITE_URL}/r/registry.json): shadcn-compatible registry manifest`,
    "",
    "## LLM exports",
    `- [llms-full.txt](${SITE_URL}/llms-full.txt): full docs + components for AI`,
    `- Append \`.mdx\` to any docs or component URL for markdown (e.g. \`${SITE_URL}/components/draw-underline-link.mdx\`)`,
  ];

  return lines.join("\n");
}
