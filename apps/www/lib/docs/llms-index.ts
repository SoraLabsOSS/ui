import type { InferPageType } from "fumadocs-core/source";
import type { source } from "@/lib/docs/source";
import type { componentSource } from "@/lib/registry/component-source";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import type { uiSource } from "@/lib/ui/source";
import { getUiQualifiedTitle } from "@/lib/ui/ui-family";

type DocsPage = InferPageType<typeof source>;
type ComponentPage = InferPageType<typeof componentSource>;
type UiPage = InferPageType<typeof uiSource>;
type LlmsIndexPage = DocsPage | ComponentPage | UiPage;

function formatPageLine(page: LlmsIndexPage): string {
  const description = page.data.description?.trim();
  const suffix = description ? `: ${description}` : "";
  return `- [${getUiQualifiedTitle(page.data.title, page.url)}](${SITE_URL}${page.url})${suffix}`;
}

/** Build `llms.txt` index for docs, UI kit, and component catalog pages. */
export function buildLlmsIndex(
  docsPages: DocsPage[],
  componentPages: ComponentPage[],
  uiPages: UiPage[] = []
): string {
  const lines = [
    "# Sora UI",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Documentation",
    ...docsPages.map(formatPageLine),
    "",
    "## UI",
    ...uiPages.map(formatPageLine),
    "",
    "## Catalog",
    ...componentPages.map(formatPageLine),
    "",
    "## Registry",
    `- [registry.json](${SITE_URL}/r/registry.json): shadcn-compatible registry manifest`,
    "",
    "## LLM exports",
    `- [llms-full.txt](${SITE_URL}/llms-full.txt): full docs + UI + catalog for AI`,
    `- Append \`.mdx\` to any docs, UI, or catalog URL for markdown (e.g. \`${SITE_URL}/docs/motion/draw-underline-link.mdx\`, \`${SITE_URL}/ui.mdx\`, \`${SITE_URL}/catalog/cursor-trail-reveal.mdx\`)`,
  ];

  return lines.join("\n");
}
