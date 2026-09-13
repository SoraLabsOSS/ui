import { index } from "@/__registry__";
import { SITE_URL } from "@/lib/site";

interface RegistryFile {
  content?: string;
  target?: string;
}

interface RegistryEntry {
  command?: string;
  dependencies?: string[];
  devDependencies?: string[];
  files?: RegistryFile[];
  inspiration?: {
    type: "inspired" | "reimplemented" | "adapted";
    label: string;
    stack?: string;
    url: string;
  } | null;
  registryDependencies?: string[];
}

interface TypeTableProp {
  default?: string;
  deprecated?: boolean;
  description?: string;
  name: string;
  required?: boolean;
  type: string;
}

const COMPONENT_INSTALLATION_RE =
  /<ComponentInstallation\b[^>]*\bname=["']([^"']+)["'][^>]*(?:\/>|>([\s\S]*?)<\/ComponentInstallation>)/g;

const COMPONENT_CREDITS_RE =
  /<ComponentCredits\b[^>]*\bname=["']([^"']+)["'][^>]*\/>/g;

const COMPONENT_PREVIEW_RE =
  /<ComponentPreview\b[\s\S]*?(?:\/>|<\/ComponentPreview>)/g;

const TYPE_TABLE_RE =
  /<TypeTable\b[^>]*\btype=(?:\{\{([\s\S]*?)\}\}|"\{([\s\S]*?)\}")[^>]*\/>/g;

const CODE_TABS_RE =
  /<CodeTabs\b([\s\S]*?)\bcodes=(?:\{\{([\s\S]*?)\}\}|"\{([\s\S]*?)\}")[^>]*\/>/g;
const CODE_TABS_ENTRY_RE =
  /(?:^|[,{\s])\s*(?:['"]([^'"]+)['"]|([a-zA-Z0-9_.-]+))\s*:\s*(?:`([\s\S]*?)`|"((?:\\"|[^"])*)"|'((?:\\'|[^'])*)')/g;

const CARDS_RE = /<Cards>([\s\S]*?)<\/Cards>/g;
const CARD_CHUNK_SPLIT_RE = /<Card\b/;
const CARD_TITLE_RE = /\btitle=["']([^"']+)["']/;
const CARD_HREF_RE = /\bhref=["']([^"']+)["']/;
const CARD_DESC_RE = /\bdescription=["']([^"']+)["']/;
const CODE_TABS_LANG_RE = /\blang=["']([^"']+)["']/;
const CHANGELOG_TITLE_RE =
  /<ChangelogItemTitle>([\s\S]*?)<\/ChangelogItemTitle>/g;
const CHANGELOG_TAGS_RE =
  /<\/?(?:Changelog|ChangelogItem|ChangelogItemVersion|ChangelogItemDescription)(?:\s+[^>]*)?>/g;
const TABS_TAGS_RE =
  /<\/?(?:Tabs|TabsList|TabsTrigger|TabsContent)(?:\s+[^>]*)?>/g;

const MDX_IMPORT_RE =
  /^[ \t]*import\s+[\s\S]*?from\s+['"][^'"]+['"];?[ \t]*\r?\n?/gm;
const CODE_BLOCKS_FENCE_RE = /^[ \t]*```[\s\S]*?^[ \t]*```/gm;
const STEP_TAG_RE = /<\/?Step>/g;
const STEPS_TAG_RE = /<\/?Steps>/g;
const CALLOUT_TAG_RE = /<\/?Callout(?:\s+[^>]*)?>/g;
const GENERIC_STRIP_TAGS_RE =
  /<\/?(?:AddToCursorButton|RoadmapTimeline|Icons|IconsFallback|PrimitivesIndex|UiIndex|InstallationFileStructure|Suspense)(?:\s+[^>]*)?>/g;

const HEADING_TAG_RE = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
const HTML_TAG_RE = /<[^>]+>/g;
const CODE_BLOCK_PLACEHOLDER_RE = /__CODE_BLOCK_(\d+)__/g;
const INLINE_CODE_SPAN_RE = /`[^`\n]+`/g;
const INLINE_CODE_PLACEHOLDER_RE = /__INLINE_CODE_(\d+)__/g;
const FALLBACK_STRIP_JSX_TAGS_RE = /<\/?([A-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g;
const LEADING_INDENT_RE = /^\s*/;
const MULTI_NEWLINE_RE = /\n{3,}/g;

const SINGLE_LINE_PROP_RE = /^\s*['"]?([\w-]+)['"]?:\s*\{\s*([^}]+)\s*\},?\s*$/;
const TYPE_TABLE_PROP_START_RE = /^\s*['"]?([\w-]+)['"]?:\s*\{\s*$/;
const TYPE_TABLE_PROP_END_RE = /^\s*\},?\s*$/;
const TYPE_TABLE_DESCRIPTION_RE =
  /description:\s*(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)"|`([^`]*)`|\n\s*'((?:\\'|[^'])*)')/;
const TYPE_TABLE_TYPE_RE =
  /type:\s*(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)"|`([^`]*)`)/;
const TYPE_TABLE_DEFAULT_RE =
  /default:\s*(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)"|`([^`]*)`|([a-zA-Z0-9_.-]+))/;
const TYPE_TABLE_REQUIRED_RE = /required:\s*true/;
const TYPE_TABLE_DEPRECATED_RE = /deprecated:\s*true/;

function formatList(values: string[] | undefined): string {
  if (!values?.length) {
    return "none";
  }
  return values.join(", ");
}

function cleanMdxStepChildren(children?: string): string {
  if (!children?.trim()) {
    return "";
  }

  // Preserve code blocks before stripping JSX tags
  const codeBlocks: string[] = [];
  let text = children.replace(CODE_BLOCKS_FENCE_RE, (block) => {
    codeBlocks.push(block);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Remove <Step> and </Step>
  text = text.replace(STEP_TAG_RE, "");

  // Convert <h[1-6][^>]*>(.*?)<\/h[1-6]> into markdown heading
  text = text.replace(
    HEADING_TAG_RE,
    (_, heading: string) => `\n\n**${heading.trim()}**\n\n`
  );

  // Strip remaining HTML tags outside code blocks repeatedly until none remain
  let previous: string;
  do {
    previous = text;
    text = text.replace(HTML_TAG_RE, "");
  } while (text !== previous);

  // Restore preserved code blocks
  text = text.replace(CODE_BLOCK_PLACEHOLDER_RE, (_, idx) => {
    const block = codeBlocks[Number(idx)] ?? "";
    // Dedent block lines to avoid accidental 4-space indentation block interpretation
    const lines = block.split("\n");
    const minIndent = lines
      .filter((l) => l.trim().length > 0)
      .reduce((min, l) => {
        const indent = l.match(LEADING_INDENT_RE)?.[0].length ?? 0;
        return Math.min(min, indent);
      }, Number.POSITIVE_INFINITY);

    if (minIndent > 0 && minIndent !== Number.POSITIVE_INFINITY) {
      return lines
        .map((l) =>
          l.startsWith(" ".repeat(minIndent)) ? l.slice(minIndent) : l
        )
        .join("\n");
    }
    return block;
  });

  return text.trim();
}

function expandComponentInstallation(
  name: string,
  rawChildren?: string
): string {
  const entry = (index as Record<string, RegistryEntry | undefined>)[name];
  if (!entry?.command) {
    return `_Registry item \`${name}\` not found._`;
  }

  const target = entry.files?.[0]?.target ?? "see registry JSON";
  const registryUrl = `${SITE_URL}/r/${name}.json`;

  const sections = [
    "**CLI**",
    "",
    "```bash",
    `npx shadcn@latest add ${entry.command}`,
    `pnpm dlx shadcn@latest add ${entry.command}`,
    `bun x --bun shadcn@latest add ${entry.command}`,
    "```",
    "",
    `**Registry JSON:** ${registryUrl}`,
    `**Install path:** \`${target}\``,
    `**Dependencies:** ${formatList(entry.dependencies)}`,
    `**Registry dependencies:** ${formatList(entry.registryDependencies)}`,
  ];

  const additionalSteps = cleanMdxStepChildren(rawChildren);
  if (additionalSteps) {
    sections.push(
      "",
      "**Manual Setup / Additional Steps**",
      "",
      additionalSteps
    );
  }

  return sections.join("\n");
}

function expandComponentCredits(name: string): string {
  const inspiration = (index as Record<string, RegistryEntry | undefined>)[name]
    ?.inspiration;

  if (!inspiration) {
    return "";
  }

  const source = `[${inspiration.label}](${inspiration.url})`;

  if (inspiration.type === "reimplemented") {
    const stack = inspiration.stack ?? "Motion and React";
    return `Inspired by ${source}. Reimplemented for ${stack}.`;
  }

  if (inspiration.type === "adapted") {
    return `Adapted from ${source}. Independent implementation for the Sora UI registry. Not affiliated with the original authors.`;
  }

  return `Inspired by ${source}.`;
}

function unescapeString(str: string): string {
  return str.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\");
}

function escapeTableCell(value: string): string {
  // Escape characters that would otherwise be interpreted by Markdown table parsing.
  // - `|` breaks the table cell boundaries
  // - `\` is used as an escape character in Markdown, so we must escape it too
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

function parseTypeTableBlock(block: string): TypeTableProp[] {
  const props: Array<{ name: string; body: string }> = [];
  const lines = block.split("\n");
  let current: { name: string; body: string } | null = null;

  for (const line of lines) {
    const single = line.match(SINGLE_LINE_PROP_RE);
    if (single) {
      if (current) {
        props.push(current);
        current = null;
      }
      props.push({ name: single[1], body: single[2] });
      continue;
    }

    const start = line.match(TYPE_TABLE_PROP_START_RE);
    if (start) {
      if (current) {
        props.push(current);
      }
      current = { name: start[1], body: "" };
      continue;
    }

    if (current) {
      current.body += `${line}\n`;
      if (TYPE_TABLE_PROP_END_RE.test(line)) {
        props.push(current);
        current = null;
      }
    }
  }

  if (current) {
    props.push(current);
  }

  return props.map(({ name, body }) => {
    const descriptionMatch = body.match(TYPE_TABLE_DESCRIPTION_RE);
    const typeMatch = body.match(TYPE_TABLE_TYPE_RE);
    const defaultMatch = body.match(TYPE_TABLE_DEFAULT_RE);
    const required = TYPE_TABLE_REQUIRED_RE.test(body);
    const deprecated = TYPE_TABLE_DEPRECATED_RE.test(body);

    const description = unescapeString(
      descriptionMatch?.[1] ??
        descriptionMatch?.[2] ??
        descriptionMatch?.[3] ??
        descriptionMatch?.[4] ??
        ""
    );

    const rawType = typeMatch?.[1] ?? typeMatch?.[2] ?? typeMatch?.[3];
    const rawDefault =
      defaultMatch?.[1] ??
      defaultMatch?.[2] ??
      defaultMatch?.[3] ??
      defaultMatch?.[4];

    return {
      name,
      type: rawType ? unescapeString(rawType) : "unknown",
      default: rawDefault ? unescapeString(rawDefault) : undefined,
      description: description || undefined,
      required,
      deprecated,
    };
  });
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x22;|&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function expandTypeTable(block: string): string {
  const decoded = decodeHtmlEntities(block);
  const rows = parseTypeTableBlock(decoded);
  if (rows.length === 0) {
    return block;
  }

  const header =
    "| Prop | Type | Default | Description |\n| --- | --- | --- | --- |";
  const body = rows
    .map((row) => {
      const name = row.deprecated ? `~~${row.name}~~` : row.name;
      const requiredPrefix = row.required ? "**required** " : "";
      const description = row.description
        ? `${requiredPrefix}${row.description}`
        : requiredPrefix || "—";

      const typeCell = escapeTableCell(row.type);
      const descriptionCell = escapeTableCell(description);

      return `| \`${name}\` | \`${typeCell}\` | ${row.default ? `\`${escapeTableCell(row.default)}\`` : "—"} | ${descriptionCell} |`;
    })
    .join("\n");

  return `${header}\n${body}`;
}

function expandCodeTabs(block: string, lang = "bash"): string {
  const decoded = decodeHtmlEntities(block);
  const entries: Array<{ key: string; code: string }> = [];
  const entryRe = new RegExp(CODE_TABS_ENTRY_RE.source, "g");
  let match = entryRe.exec(decoded);
  while (match !== null) {
    const key = (match[1] || match[2] || "").trim();
    const rawCode = match[3] ?? match[4] ?? match[5] ?? "";
    const code = unescapeString(rawCode).trim();
    if (code) {
      entries.push({ key, code });
    }
    match = entryRe.exec(decoded);
  }

  if (entries.length === 0) {
    return "";
  }

  if (lang === "json" || entries.some((e) => e.code.startsWith("{"))) {
    return entries
      .map((e) => `**${e.key}**\n\n\`\`\`${lang}\n${e.code}\n\`\`\``)
      .join("\n\n");
  }

  const isAllPkgManagers = entries.every((e) =>
    ["pnpm", "npm", "yarn", "bun", "npx", "bunx"].includes(e.key.toLowerCase())
  );

  if (isAllPkgManagers) {
    return `\`\`\`${lang}\n${entries.map((e) => e.code).join("\n")}\n\`\`\``;
  }

  return `\`\`\`${lang}\n${entries
    .map((e) => `# ${e.key}\n${e.code}`)
    .join("\n\n")}\n\`\`\``;
}

function expandCards(block: string): string {
  const cardChunks = block.split(CARD_CHUNK_SPLIT_RE).slice(1);
  const items: string[] = [];
  for (const chunk of cardChunks) {
    const title = chunk.match(CARD_TITLE_RE)?.[1];
    const href = chunk.match(CARD_HREF_RE)?.[1];
    const desc = chunk.match(CARD_DESC_RE)?.[1];
    if (title && href) {
      const descSuffix = desc ? `: ${desc}` : "";
      items.push(`- [${title}](${href})${descSuffix}`);
    }
  }
  return items.join("\n");
}

/** Expand Sora MDX components into plain markdown for LLM/MCP consumers. */
export function expandLlmMarkdown(content: string): string {
  const normalized = content.replace(/\r\n/g, "\n");
  const codeBlocks: string[] = [];
  let expanded = normalized.replace(CODE_BLOCKS_FENCE_RE, (block) => {
    codeBlocks.push(block);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  expanded = expanded.replace(MDX_IMPORT_RE, "");

  expanded = expanded
    .replace(COMPONENT_PREVIEW_RE, "")
    .replace(COMPONENT_INSTALLATION_RE, (_, name: string, children?: string) =>
      expandComponentInstallation(name, children)
    )
    .replace(COMPONENT_CREDITS_RE, (_, name: string) =>
      expandComponentCredits(name)
    )
    .replace(CODE_TABS_RE, (_, attrs: string, b1?: string, b2?: string) => {
      const langMatch = attrs.match(CODE_TABS_LANG_RE);
      const lang = langMatch?.[1] ?? "bash";
      return expandCodeTabs(b1 ?? b2 ?? "", lang);
    })
    .replace(CARDS_RE, (_, block: string) => expandCards(block))
    .replace(CHANGELOG_TITLE_RE, (_, title: string) => `### ${title.trim()}`)
    .replace(CHANGELOG_TAGS_RE, "")
    .replace(TABS_TAGS_RE, "")
    .replace(TYPE_TABLE_RE, (_, b1?: string, b2?: string) =>
      expandTypeTable(b1 ?? b2 ?? "")
    )
    .replace(STEPS_TAG_RE, "")
    .replace(STEP_TAG_RE, "")
    .replace(CALLOUT_TAG_RE, "")
    .replace(GENERIC_STRIP_TAGS_RE, "");

  const inlineCodes: string[] = [];
  expanded = expanded.replace(INLINE_CODE_SPAN_RE, (span) => {
    inlineCodes.push(span);
    return `__INLINE_CODE_${inlineCodes.length - 1}__`;
  });

  expanded = expanded.replace(FALLBACK_STRIP_JSX_TAGS_RE, "");

  expanded = expanded.replace(
    INLINE_CODE_PLACEHOLDER_RE,
    (_, idx) => inlineCodes[Number(idx)] ?? ""
  );

  expanded = expanded.replace(
    CODE_BLOCK_PLACEHOLDER_RE,
    (_, idx) => codeBlocks[Number(idx)] ?? ""
  );

  expanded = expanded.replace(MULTI_NEWLINE_RE, "\n\n");
  return expanded.trim();
}
