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
  /<ComponentInstallation\s+name=["']([^"']+)["']\s*\/>/g;

const COMPONENT_CREDITS_RE = /<ComponentCredits\s+name=["']([^"']+)["']\s*\/>/g;

const COMPONENT_PREVIEW_RE = /<ComponentPreview\s+name=["'][^"']+["']\s*\/>/g;

const TYPE_TABLE_RE = /<TypeTable\s+type=\{\{([\s\S]*?)\}\}\s*\/>/g;

const SINGLE_QUOTED_VALUE_RE = /^'((?:\\'|[^'])*)'$/;
const DOUBLE_QUOTED_VALUE_RE = /^"((?:\\"|[^"])*)"$/;
const TRAILING_COMMA_RE = /,$/;
const TYPE_TABLE_PROP_START_RE = /^\s{2,4}(\w+):\s*\{\s*$/;
const TYPE_TABLE_PROP_END_RE = /^\s{2,4}\},?\s*$/;
const TYPE_TABLE_DESCRIPTION_RE =
  /description:\s*(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)"|`([^`]*)`|\n\s*'((?:\\'|[^'])*)')/;
const TYPE_TABLE_TYPE_RE = /type:\s*'((?:\\'|[^'])*)'/;
const TYPE_TABLE_DEFAULT_RE = /default:\s*'((?:\\'|[^'])*)'/;
const TYPE_TABLE_REQUIRED_RE = /required:\s*true/;
const TYPE_TABLE_DEPRECATED_RE = /deprecated:\s*true/;
const MULTI_NEWLINE_RE = /\n{3,}/g;

function formatList(values: string[] | undefined): string {
  if (!values?.length) {
    return "none";
  }
  return values.join(", ");
}

function expandComponentInstallation(name: string): string {
  const entry = (index as Record<string, RegistryEntry | undefined>)[name];
  if (!entry?.command) {
    return `_Registry item \`${name}\` not found._`;
  }

  const target = entry.files?.[0]?.target ?? "see registry JSON";
  const registryUrl = `${SITE_URL}/r/${name}.json`;

  return [
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
  ].join("\n");
}

function expandComponentCredits(name: string): string {
  const inspiration = (index as Record<string, RegistryEntry | undefined>)[name]
    ?.inspiration;

  if (!inspiration) {
    return "";
  }

  const source = `[${inspiration.label}](${inspiration.url})`;

  if (inspiration.type === "reimplemented") {
    return `Inspired by ${source}. Reimplemented for Motion and React.`;
  }

  if (inspiration.type === "adapted") {
    return `Adapted from ${source}. Independent implementation for the Sora UI registry. Not affiliated with the original authors.`;
  }

  return `Inspired by ${source}.`;
}

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function readQuotedValue(raw: string): string {
  const trimmed = raw.trim();
  const single = trimmed.match(SINGLE_QUOTED_VALUE_RE);
  if (single) {
    return single[1];
  }

  const double = trimmed.match(DOUBLE_QUOTED_VALUE_RE);
  if (double) {
    return double[1];
  }

  return trimmed.replace(TRAILING_COMMA_RE, "");
}

function parseTypeTableBlock(block: string): TypeTableProp[] {
  const props: Array<{ name: string; body: string }> = [];
  const lines = block.split("\n");
  let current: { name: string; body: string } | null = null;

  for (const line of lines) {
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

    const description =
      descriptionMatch?.[1] ??
      descriptionMatch?.[2] ??
      descriptionMatch?.[3] ??
      descriptionMatch?.[4];

    return {
      name,
      type: typeMatch ? readQuotedValue(typeMatch[1] ?? "") : "unknown",
      default: defaultMatch ? readQuotedValue(defaultMatch[1]) : undefined,
      description,
      required,
      deprecated,
    };
  });
}

function expandTypeTable(block: string): string {
  const rows = parseTypeTableBlock(block);
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

      return `| \`${name}\` | \`${typeCell}\` | ${row.default ? `\`${row.default}\`` : "—"} | ${descriptionCell} |`;
    })
    .join("\n");

  return `${header}\n${body}`;
}

/** Expand Sora MDX components into plain markdown for LLM/MCP consumers. */
export function expandLlmMarkdown(content: string): string {
  let expanded = content
    .replace(COMPONENT_PREVIEW_RE, "")
    .replace(COMPONENT_INSTALLATION_RE, (_, name: string) =>
      expandComponentInstallation(name)
    )
    .replace(COMPONENT_CREDITS_RE, (_, name: string) =>
      expandComponentCredits(name)
    )
    .replace(TYPE_TABLE_RE, (_, block: string) => expandTypeTable(block));

  expanded = expanded.replace(MULTI_NEWLINE_RE, "\n\n");
  return expanded.trimEnd();
}
