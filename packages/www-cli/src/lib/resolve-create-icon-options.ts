import { cancel, confirm, intro, isCancel, text } from "@clack/prompts";
import { buildIconLabels } from "./icon-templates.js";
import { assertKebabCase } from "./naming.js";
import {
  allowsPrompts,
  isScripted,
  type ScaffoldRunFlags,
} from "./scaffold-flags.js";
import { nonInteractiveHint } from "./terminal.js";

export interface CreateIconOptions extends ScaffoldRunFlags {
  keywords?: string[] | string;
  name?: string;
  skipBuild?: boolean;
  withDemo?: boolean;
}

export interface ResolvedCreateIconOptions {
  description: string;
  dryRun: boolean;
  keywords: string[];
  name: string;
  quiet: boolean;
  skipBuild: boolean;
  title: string;
  withDemo: boolean;
}

function parseKeywords(
  raw: string[] | string | undefined
): string[] | undefined {
  if (!raw) {
    return;
  }
  if (Array.isArray(raw)) {
    return raw.map((k) => k.trim()).filter(Boolean);
  }
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function assertCanPrompt(
  nameArg: string | undefined,
  options: CreateIconOptions
): void {
  const hasName = Boolean(nameArg?.trim() || options.name?.trim());

  if (allowsPrompts(options) || isScripted(options) || hasName) {
    return;
  }

  throw new Error(nonInteractiveHint("bun run create:icon <name> --yes"));
}

async function resolveName(
  nameArg: string | undefined,
  options: CreateIconOptions,
  interactive: boolean
): Promise<string> {
  const candidate = (nameArg ?? options.name)?.trim();
  if (candidate) {
    assertKebabCase(candidate);
    return candidate;
  }

  if (!interactive) {
    throw new Error("Missing <name> argument (kebab-case slug).");
  }

  const entered = await text({
    message: "Icon name (kebab-case)",
    placeholder: "sparkles",
    validate(value) {
      if (!value.trim()) {
        return "Name is required.";
      }
      try {
        assertKebabCase(value.trim());
      } catch (error) {
        return error instanceof Error ? error.message : "Invalid icon name.";
      }
    },
  });
  if (isCancel(entered)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  return entered.trim();
}

async function resolveKeywords(
  rawKeywords: string[] | string | undefined,
  interactive: boolean
): Promise<string[] | undefined> {
  const parsed = parseKeywords(rawKeywords);
  if (parsed && parsed.length > 0) {
    return parsed;
  }

  if (!interactive) {
    return;
  }

  const entered = await text({
    message: "Keywords for registry search (comma-separated, optional)",
    placeholder: "action, symbol, status",
  });
  if (isCancel(entered)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  return parseKeywords(entered);
}

async function resolveWithDemo(
  withDemoOption: boolean | undefined,
  options: CreateIconOptions
): Promise<boolean> {
  if (withDemoOption !== undefined || isScripted(options)) {
    return withDemoOption ?? true;
  }

  if (!allowsPrompts(options)) {
    return true;
  }

  const demoChoice = await confirm({
    message: "Create manual demo folder?",
    initialValue: true,
  });
  if (isCancel(demoChoice)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  return Boolean(demoChoice);
}

export async function resolveCreateIconOptions(
  nameArg: string | undefined,
  options: CreateIconOptions = {}
): Promise<ResolvedCreateIconOptions> {
  assertCanPrompt(nameArg, options);

  const interactive = allowsPrompts(options);
  if (interactive && !options.quiet) {
    intro("www-cli · create icon");
  }

  const name = await resolveName(nameArg, options, interactive);
  const keywords = await resolveKeywords(options.keywords, interactive);
  const withDemo = await resolveWithDemo(options.withDemo, options);

  const labels = buildIconLabels(name, keywords);

  return {
    name,
    title: labels.title,
    description: labels.description,
    keywords: labels.keywords,
    withDemo,
    dryRun: Boolean(options.dryRun),
    quiet: Boolean(options.quiet),
    skipBuild: Boolean(options.skipBuild),
  };
}
