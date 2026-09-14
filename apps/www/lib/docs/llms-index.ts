import type { InferPageType } from "fumadocs-core/source";
import type { source } from "@/lib/docs/source";
import type { iconsSource } from "@/lib/icons/source";
import type { motionSource } from "@/lib/motion/source";
import type { componentSource } from "@/lib/registry/component-source";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import type { uiSource } from "@/lib/ui/source";
import { getUiQualifiedTitle } from "@/lib/ui/ui-family";

type DocsPage = InferPageType<typeof source>;
type MotionPage = InferPageType<typeof motionSource>;
type IconsPage = InferPageType<typeof iconsSource>;
type ComponentPage = InferPageType<typeof componentSource>;
type UiPage = InferPageType<typeof uiSource>;
type LlmsIndexPage = DocsPage | MotionPage | IconsPage | ComponentPage | UiPage;

function formatPageLine(page: LlmsIndexPage): string {
  const description = page.data.description?.trim();
  const suffix = description ? `: ${description}` : "";
  const title = page.data.title || page.slugs.at(-1) || "Documentation";
  return `- [${getUiQualifiedTitle(title, page.url)}](${SITE_URL}${page.url})${suffix}`;
}

/** Build `llms.txt` index for docs, Motion, Icons, UI kit, and component catalog pages. */
export function buildLlmsIndex(
  docsPages: DocsPage[],
  componentPages: ComponentPage[],
  uiPages: UiPage[] = [],
  motionPages: MotionPage[] = [],
  iconsPages: IconsPage[] = []
): string {
  const lines = [
    "# Sora UI",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Documentation",
    ...docsPages.map(formatPageLine),
    "",
    "## Motion",
    ...motionPages.map(formatPageLine),
    "",
    "## Icons",
    ...iconsPages.map(formatPageLine),
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
    `- Append \`.mdx\` to any docs, motion, icons, UI, catalog, or blog URL for markdown (e.g. \`${SITE_URL}/motion/draw-underline-link.mdx\`, \`${SITE_URL}/icons/get-started.mdx\`, \`${SITE_URL}/ui.mdx\`, \`${SITE_URL}/catalog/cursor-trail-reveal.mdx\`, \`${SITE_URL}/blog/evolving-sora-ui-taxonomy.mdx\`)`,
  ];

  return lines.join("\n");
}
